-- Pratica.dev 2.0 — CORREÇÃO DO XP NO SERVIDOR (aplicável em projetos existentes)
-- ============================================================
-- Para quem JÁ tem o banco criado (schema.sql executado ANTES do
-- fix entrar no arquivo). Execute este arquivo inteiro no SQL
-- Editor do Supabase: todos os comandos são idempotentes e podem
-- ser reexecutados à vontade.
--
-- Em instalações NOVAS não é necessário: basta executar o
-- database/schema.sql completo, que já aplica tudo.
--
-- Sintoma do defeito que este script corrige:
--   o aluno concluía quiz, matéria, exercício ou projeto e o XP
--   continuava em 0 — sem nenhuma mensagem de erro na tela.
--
-- Causa:
--   1. As funções award_* rodavam como SECURITY INVOKER, ou seja,
--      com o papel do próprio aluno. O trigger
--      trg_protect_profile_fields (que existe para impedir que o
--      cliente edite XP à mão) então executava new.xp := old.xp e
--      descartava a premiação. O UPDATE era bem-sucedido, mas não
--      alterava nada — falha silenciosa.
--   2. O INSERT de award_exercise_xp era barrado pelo RLS de
--      certificates, que só tinha política de SELECT.
--
-- Correção aplicada aqui:
--   1. protect_profile_fields passa a liberar current_user =
--      'postgres', que é como as funções SECURITY DEFINER se
--      identificam; o cliente (papel authenticated) continua
--      bloqueado — ele nunca é 'postgres'.
--   2. As 4 funções award_* viram SECURITY DEFINER com
--      search_path fixo em public (evita sequestro de search_path).
--   3. certificates ganha a política certificates_insert e o
--      grant de INSERT para o papel authenticated.
--
-- As funções admin_* seguem SECURITY INVOKER de propósito: elas
-- se autorizam por current_is_admin() e o trigger já abre exceção
-- para administradores.
--
-- Garantias preservadas (verificadas em PostgreSQL real):
--   - o papel anon não consegue chamar as funções de XP;
--   - um aluno não concede XP nem emite certificado para outro;
--   - UPDATE direto em profiles.xp continua sem efeito;
--   - repetir exercício/projeto não duplica XP.
-- ============================================================

-- 1) O trigger passa a aceitar as funções SECURITY DEFINER
--    (current_user = 'postgres') e continua revertendo XP/nível
--    para qualquer outro papel que não seja administrador.
create or replace function public.protect_profile_fields()
returns trigger language plpgsql as $$
begin
  if current_user = 'postgres' then
    return new;
  end if;
  if not (select coalesce(is_admin, false) from public.profiles where id = auth.uid()) then
    new.xp := old.xp;
    new.level := old.level;
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

-- O trigger em si continua o mesmo; recriá-lo é redundante, mas
-- torna este script autocontido caso o trigger tenha sido removido.
drop trigger if exists trg_protect_profile_fields on public.profiles;
create trigger trg_protect_profile_fields before update on public.profiles
for each row execute function public.protect_profile_fields();

-- 2) As quatro funções de premiação passam a rodar como o dono do
--    schema (postgres), com search_path fixo — assim o trigger não
--    descarta o XP e o RLS não barra a escrita.
create or replace function public.award_quiz_xp(p_answers jsonb, p_track text, p_goal text)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  insert into public.quiz_answers (user_id, question, answer)
  select uid, (row_number() over ())::integer, value::text
  from jsonb_array_elements_text(coalesce(p_answers, '[]'::jsonb)) value
  on conflict (user_id, question) do update set answer = excluded.answer;
  update public.profiles set track = p_track, goal = p_goal, quiz_done = true,
    xp = xp + 50, level = public.recalculate_level(xp + 50) where id = uid;
end;
$$;

create or replace function public.award_subject_view_xp(p_subject_id text)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  if not exists (select 1 from public.subject_progress where user_id=uid and subject_id=p_subject_id) then
    insert into public.subject_progress(user_id, subject_id) values (uid, p_subject_id);
    update public.profiles set xp=xp+10, level=public.recalculate_level(xp+10) where id=uid;
  end if;
end;
$$;

create or replace function public.award_exercise_xp(p_subject_id text, p_cert_title text)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  insert into public.certificates(user_id, subject_id, title) values(uid,p_subject_id,p_cert_title)
    on conflict (user_id, subject_id) do nothing;
  if found then
    update public.profiles set xp=xp+30, level=public.recalculate_level(xp+30) where id=uid;
  end if;
end;
$$;

create or replace function public.award_project_xp(p_project_id integer)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); reward integer;
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  select xp_reward into reward from public.projects where id=p_project_id;
  if reward is null then raise exception 'Projeto inexistente'; end if;
  insert into public.user_projects(user_id, project_id) values(uid,p_project_id) on conflict do nothing;
  if found then update public.profiles set xp=xp+reward, level=public.recalculate_level(xp+reward) where id=uid; end if;
end;
$$;

-- 3) O RLS de certificates deixa o próprio aluno emitir o próprio
--    certificado (necessário para o award_exercise_xp funcionar).
drop policy if exists certificates_insert on public.certificates;
create policy certificates_insert on public.certificates for insert with check (user_id=auth.uid());

-- Regarante o acesso do cliente às RPCs e ao INSERT em certificates.
grant execute on all functions in schema public to authenticated;
grant select, insert on public.certificates to authenticated;

-- Fim da correção. Para conferir, rode como administrador:
--   select proname, prosecdef from pg_proc
--   where proname like 'award%' or proname = 'protect_profile_fields';
-- Todas devem retornar prosecdef = true (security definer), exceto
-- protect_profile_fields (que é um trigger e não precisa).

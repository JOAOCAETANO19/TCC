-- Pratica.dev 2.0 — INTEGRIDADE DAS RECOMPENSAS E EXCLUSÃO ADMINISTRATIVA
-- Execute no SQL Editor em instalações existentes depois das demais migrações.
-- O script é idempotente.
--
-- Correções:
--   1. o quiz concede 50 XP uma única vez e valida as três respostas;
--   2. visualização e conclusão só aceitam os 12 identificadores de matérias;
--   3. o título do certificado é validado no servidor;
--   4. INSERT ... ON CONFLICT evita corrida ao abrir a mesma matéria em duas abas;
--   5. admin_delete_student executa com privilégio controlado, após revalidar o admin.

create or replace function public.award_quiz_xp(p_answers jsonb, p_track text, p_goal text)
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  already_done boolean;
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  perform public.ensure_not_blocked();

  if p_answers is null or jsonb_typeof(p_answers) <> 'array'
     or jsonb_array_length(p_answers) <> 3
     or (p_answers ->> 0) not in ('Iniciante total', 'Já sei o básico', 'Intermediário')
     or (p_answers ->> 1) not in ('Front-end', 'Back-end', 'Full Stack', 'Mobile', 'Ainda não sei')
     or (p_answers ->> 2) not in ('Estágio em 6 meses', 'Primeiro emprego em 1 ano', 'Freelancer', 'Criar meu próprio produto')
     or p_track is distinct from (p_answers ->> 1)
     or p_goal is distinct from (p_answers ->> 2) then
    raise exception 'Respostas do quiz inválidas';
  end if;

  select quiz_done into already_done from public.profiles where id = uid for update;
  if not found then raise exception 'Perfil inexistente'; end if;
  if already_done then return; end if;

  insert into public.quiz_answers (user_id, question, answer)
  select uid, answer.ordinality::integer, answer.value
  from jsonb_array_elements_text(p_answers) with ordinality as answer(value, ordinality)
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
  perform public.ensure_not_blocked();
  if p_subject_id not in ('html','css','js','sql','python','java','poo','git','redes','apis','banco','logica') then
    raise exception 'Matéria inexistente';
  end if;

  insert into public.subject_progress(user_id, subject_id) values (uid, p_subject_id)
    on conflict (user_id, subject_id) do nothing;
  if found then
    update public.profiles set xp=xp+10, level=public.recalculate_level(xp+10) where id=uid;
  end if;
end;
$$;

create or replace function public.award_exercise_xp(p_subject_id text, p_cert_title text)
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  expected_title text;
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  perform public.ensure_not_blocked();

  expected_title := case p_subject_id
    when 'html' then 'HTML - Básico'
    when 'css' then 'CSS - Básico'
    when 'js' then 'JavaScript - Básico'
    when 'sql' then 'SQL - Básico'
    when 'python' then 'Python - Básico'
    when 'java' then 'Java - Básico'
    when 'poo' then 'POO - Básico'
    when 'git' then 'Git/GitHub - Básico'
    when 'redes' then 'Redes - Básico'
    when 'apis' then 'APIs - Básico'
    when 'banco' then 'Banco de Dados - Básico'
    when 'logica' then 'Lógica - Básico'
    else null
  end;
  if expected_title is null then raise exception 'Matéria inexistente'; end if;
  if p_cert_title is distinct from expected_title then raise exception 'Título de certificado inválido'; end if;

  insert into public.certificates(user_id, subject_id, title) values(uid,p_subject_id,expected_title)
    on conflict (user_id, subject_id) do nothing;
  if found then
    update public.profiles set xp=xp+30, level=public.recalculate_level(xp+30) where id=uid;
  end if;
end;
$$;

create or replace function public.admin_delete_student(target_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.current_is_admin() then raise exception 'Acesso negado'; end if;
  perform public.ensure_not_blocked();
  if target_id = auth.uid() then raise exception 'Você não pode excluir a própria conta'; end if;
  delete from public.profiles where id = target_id;
end;
$$;

-- Funções não ficam executáveis por visitantes anônimos.
revoke execute on function public.award_quiz_xp(jsonb, text, text) from public, anon;
revoke execute on function public.award_subject_view_xp(text) from public, anon;
revoke execute on function public.award_exercise_xp(text, text) from public, anon;
revoke execute on function public.admin_delete_student(uuid) from public, anon;
grant execute on function public.award_quiz_xp(jsonb, text, text) to authenticated;
grant execute on function public.award_subject_view_xp(text) to authenticated;
grant execute on function public.award_exercise_xp(text, text) to authenticated;
grant execute on function public.admin_delete_student(uuid) to authenticated;

-- ============================================================
-- BLOQUEIO ADMINISTRATIVO DE USUÁRIOS (Pratica.dev 2.0)
-- ------------------------------------------------------------
-- Execute este arquivo no SQL Editor do Supabase.
-- IDEMPOTENTE: pode ser executado mais de uma vez com segurança
-- (todas as alterações usam add column if not exists, create or
-- replace e drop policy if exists antes de cada create policy).
--
-- O que esta migração entrega:
--   1. Coluna profiles.is_blocked (Ativo/Bloqueado).
--   2. Função admin_set_blocked(target_id, blocked) — só um admin
--      ativo chama e NUNCA é permitido bloquear a própria conta
--      (a trava é validada dentro do banco, não só na interface).
--   3. Guarda ensure_not_blocked() que barra XP e ações de admin
--      de quem está bloqueado.
--   4. current_is_admin() passa a tratar bloqueados como não-admin.
--   5. Políticas RLS negam leitura/escrita a bloqueados e tiram
--      bloqueados dos portfólios públicos (perfil, projetos,
--      certificados e foto no Storage).
-- ============================================================

alter table public.profiles add column if not exists is_blocked boolean not null default false;

-- Helper: o usuário logado está bloqueado?
create or replace function public.current_is_blocked()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_blocked from public.profiles where id = auth.uid()), false);
$$;

-- Um usuário bloqueado deixa de ser administrador (perde acesso a dados
-- protegidos e à tela admin), mesmo que a coluna is_admin continue true.
create or replace function public.current_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin and not coalesce(is_blocked, false));
$$;

-- Guarda: recusa qualquer ação sensível se o usuário estiver bloqueado.
create or replace function public.ensure_not_blocked()
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.current_is_blocked() then
    raise exception 'Sua conta foi bloqueada pelo administrador';
  end if;
end;
$$;

-- ============================================================
-- XP: as 4 funções de premiação recusam usuários bloqueados.
-- ============================================================
create or replace function public.award_quiz_xp(p_answers jsonb, p_track text, p_goal text)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  perform public.ensure_not_blocked();
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
  perform public.ensure_not_blocked();
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
  perform public.ensure_not_blocked();
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
  perform public.ensure_not_blocked();
  select xp_reward into reward from public.projects where id=p_project_id;
  if reward is null then raise exception 'Projeto inexistente'; end if;
  insert into public.user_projects(user_id, project_id) values(uid,p_project_id) on conflict do nothing;
  if found then update public.profiles set xp=xp+reward, level=public.recalculate_level(xp+reward) where id=uid; end if;
end;
$$;

-- ============================================================
-- ADMIN: as funções de admin exigem admin ativo e não bloqueado,
-- e admin_set_blocked nunca age sobre a própria conta.
-- ============================================================
create or replace function public.admin_reset_xp(target_id uuid)
returns void language plpgsql security invoker as $$
begin
  if not public.current_is_admin() then raise exception 'Acesso negado'; end if;
  perform public.ensure_not_blocked();
  update public.profiles set xp=0, level=1 where id=target_id;
end;
$$;

create or replace function public.admin_delete_student(target_id uuid)
returns void language plpgsql security invoker as $$
begin
  if not public.current_is_admin() then raise exception 'Acesso negado'; end if;
  perform public.ensure_not_blocked();
  delete from public.profiles where id=target_id and id <> auth.uid();
end;
$$;

create or replace function public.admin_set_blocked(target_id uuid, blocked boolean)
returns void language plpgsql security invoker as $$
begin
  if not public.current_is_admin() then raise exception 'Acesso negado'; end if;
  perform public.ensure_not_blocked();
  if target_id = auth.uid() then raise exception 'Você não pode bloquear a própria conta'; end if;
  update public.profiles set is_blocked = coalesce(blocked, false) where id = target_id;
end;
$$;

-- ============================================================
-- RLS: bloqueados perdem acesso a dados protegidos (leitura e
-- escrita do próprio progresso) — tratados como deslogados.
-- ============================================================
drop policy if exists quiz_select on public.quiz_answers;
create policy quiz_select on public.quiz_answers for select using ((user_id=auth.uid() or public.current_is_admin()) and not public.current_is_blocked());
drop policy if exists quiz_insert on public.quiz_answers;
create policy quiz_insert on public.quiz_answers for insert with check (user_id=auth.uid() and not public.current_is_blocked());
drop policy if exists quiz_update on public.quiz_answers;
create policy quiz_update on public.quiz_answers for update using (user_id=auth.uid() and not public.current_is_blocked());
drop policy if exists progress_select on public.subject_progress;
create policy progress_select on public.subject_progress for select using ((user_id=auth.uid() or public.current_is_admin()) and not public.current_is_blocked());
drop policy if exists projects_user_select on public.user_projects;
create policy projects_user_select on public.user_projects for select using ((user_id=auth.uid() or public.current_is_admin()) and not public.current_is_blocked());
drop policy if exists certificates_select on public.certificates;
create policy certificates_select on public.certificates for select using ((user_id=auth.uid() or public.current_is_admin()) and not public.current_is_blocked());
drop policy if exists certificates_insert on public.certificates;
create policy certificates_insert on public.certificates for insert with check (user_id=auth.uid() and not public.current_is_blocked());

-- ============================================================
-- PORTFÓLIO PÚBLICO: bloqueados não aparecem (perfil, projetos,
-- certificados e foto). A flag is_blocked não é concedida ao anon;
-- a exclusão é feita pelas próprias políticas de leitura.
-- ============================================================
drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles
  for select to anon
  using (portfolio_public = true and not coalesce(is_blocked, false));

drop policy if exists user_projects_public_read on public.user_projects;
create policy user_projects_public_read on public.user_projects
  for select to anon
  using (user_id in (select id from public.profiles where portfolio_public = true and not coalesce(is_blocked, false)));

drop policy if exists certificates_public_read on public.certificates;
create policy certificates_public_read on public.certificates
  for select to anon
  using (user_id in (select id from public.profiles where portfolio_public = true and not coalesce(is_blocked, false)));

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select to anon
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] in (select id::text from public.profiles where portfolio_public = true and not coalesce(is_blocked, false))
  );

drop policy if exists avatars_owner_read on storage.objects;
create policy avatars_owner_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (storage.foldername(name))[1] in (select id::text from public.profiles where portfolio_public = true and not coalesce(is_blocked, false))
    )
  );

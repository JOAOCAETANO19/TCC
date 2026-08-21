-- Pratica.dev 2.0 — MIGRAÇÃO DO PORTFÓLIO PÚBLICO E AVATAR
-- ============================================================
-- Execute este arquivo no SQL Editor do Supabase para uma
-- instalação EXISTENTE que já tinha o schema.sql anterior às
-- funcionalidades de portfólio público e foto de perfil.
--
-- A migração é idempotente: pode ser executada novamente sem
-- apagar perfis, projetos, certificados ou arquivos existentes.
-- Em uma instalação nova, o database/schema.sql completo já
-- contém estes mesmos objetos.
--
-- A chave service_role nunca deve ser usada no frontend.
-- ============================================================

-- 1) Colunas novas do perfil.
alter table public.profiles add column if not exists portfolio_public boolean not null default false;
alter table public.profiles add column if not exists avatar_url text;

-- 2) Leitura pública do portfólio.
alter table public.profiles enable row level security;
alter table public.user_projects enable row level security;
alter table public.certificates enable row level security;

drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles
  for select to anon
  using (portfolio_public = true);

drop policy if exists user_projects_public_read on public.user_projects;
create policy user_projects_public_read on public.user_projects
  for select to anon
  using (user_id in (select id from public.profiles where portfolio_public = true));

drop policy if exists certificates_public_read on public.certificates;
create policy certificates_public_read on public.certificates
  for select to anon
  using (user_id in (select id from public.profiles where portfolio_public = true));

-- O anon só recebe as colunas necessárias. Os grants de projeto e
-- certificado não incluem credenciais ou dados de autenticação.
grant usage on schema public to anon;
grant select (id, name, track, goal, level, xp, portfolio_public, avatar_url)
  on public.profiles to anon;
grant select on public.user_projects, public.certificates to anon;

-- 3) Bucket privado para fotos de perfil.
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', false)
  on conflict (id) do update set public = false;

  -- Estas colunas não existem em todas as versões do Storage.
  if exists (select 1 from information_schema.columns
             where table_schema = 'storage' and table_name = 'buckets'
               and column_name = 'file_size_limit') then
    update storage.buckets
    set file_size_limit = 2097152
    where id = 'avatars';
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema = 'storage' and table_name = 'buckets'
               and column_name = 'allowed_mimetypes') then
    update storage.buckets
    set allowed_mimetypes = '{image/jpeg,image/png}'
    where id = 'avatars';
  end if;
end $$;

-- O primeiro segmento do caminho é o id do dono:
-- avatars/<id do usuário>/avatar.jpg ou avatar.png.
drop policy if exists avatars_owner_insert on storage.objects;
create policy avatars_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- O dono sempre lê a própria foto; fotos de outros só quando o
-- respectivo portfólio está publicado.
drop policy if exists avatars_owner_read on storage.objects;
create policy avatars_owner_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (storage.foldername(name))[1] in (
        select id::text from public.profiles where portfolio_public = true
      )
    )
  );

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select to anon
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where portfolio_public = true
    )
  );

-- Verificação opcional, para executar depois da migração:
-- select id, name, public from storage.buckets where id = 'avatars';
-- O resultado deve ser uma linha com public = false.

-- Pratica.dev: aparência do perfil, desafios cumulativos e ranking voluntário.
-- Execute APÓS as migrações de cursos/nivelamento e ANTES do novo frontend.
-- Não altera perfis, XP, níveis, projetos, respostas ou certificados existentes.
-- A ausência de linha em ranking_participants significa que a pessoa NÃO participa.
-- Atualizar/desfazer a participação e mudar a aparência só é possível pelas RPCs.

create table if not exists public.profile_appearance (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'original' check (theme in ('original', 'oceano', 'aurora', 'cosmos')),
  frame text not null default 'simples' check (frame in ('simples', 'menta', 'violeta', 'solar')),
  updated_at timestamptz not null default now()
);

create table if not exists public.ranking_participants (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  alias text not null check (
    alias = btrim(alias) and char_length(alias) between 2 and 24
    and alias !~ '[[:cntrl:]]' and position('@' in alias) = 0
  ),
  joined_at timestamptz not null default now()
);

alter table public.profile_appearance enable row level security;
alter table public.ranking_participants enable row level security;
-- Sem leitura/escrita direta: as funções SECURITY DEFINER abaixo limitam os
-- campos retornados, autenticam o chamador e conferem o bloqueio no servidor.
revoke all on public.profile_appearance, public.ranking_participants from public, anon, authenticated;

-- Mantenha estes limiares alinhados ao catálogo de gamification.js.
create or replace function public.profile_theme_min_xp(p_theme text)
returns integer language sql immutable set search_path = pg_catalog as $$
  select case p_theme when 'original' then 0 when 'oceano' then 100
    when 'aurora' then 250 when 'cosmos' then 500 else null end;
$$;
create or replace function public.profile_frame_min_xp(p_frame text)
returns integer language sql immutable set search_path = pg_catalog as $$
  select case p_frame when 'simples' then 0 when 'menta' then 100
    when 'violeta' then 300 when 'solar' then 600 else null end;
$$;

-- Também recusa perfis ausentes: não confia apenas no estado do frontend.
create or replace function public.gamification_active_xp()
returns integer language plpgsql stable security definer set search_path = pg_catalog as $$
declare
  uid uuid := auth.uid();
  xp_value integer;
  blocked boolean;
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  select p.xp, coalesce(p.is_blocked, false) into xp_value, blocked
    from public.profiles p where p.id = uid;
  if not found then raise exception 'Perfil indisponível'; end if;
  if blocked then raise exception 'Sua conta foi bloqueada pelo administrador'; end if;
  return xp_value;
end;
$$;

-- Preferências privadas do próprio usuário. Se um administrador reduzir o XP,
-- a aparência acima do novo limite fica inativa até esse XP ser recuperado.
create or replace function public.get_my_gamification_settings()
returns jsonb language plpgsql stable security definer set search_path = pg_catalog as $$
declare
  xp_value integer := public.gamification_active_xp();
  result jsonb;
begin
  select jsonb_build_object(
    'theme', case when public.profile_theme_min_xp(a.theme) <= xp_value then a.theme else 'original' end,
    'frame', case when public.profile_frame_min_xp(a.frame) <= xp_value then a.frame else 'simples' end,
    'ranking_joined', r.user_id is not null,
    'ranking_alias', r.alias
  ) into result
  from (select auth.uid() as id) me
  left join public.profile_appearance a on a.user_id = me.id
  left join public.ranking_participants r on r.user_id = me.id;
  return result;
end;
$$;

create or replace function public.save_profile_appearance(p_theme text, p_frame text)
returns jsonb language plpgsql security definer set search_path = pg_catalog as $$
declare
  uid uuid := auth.uid();
  xp_value integer;
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  -- O bloqueio/XP não pode mudar no meio da escolha.
  select p.xp into xp_value from public.profiles p
    where p.id = uid and not coalesce(p.is_blocked, false) for share;
  if not found then raise exception 'Perfil indisponível ou conta bloqueada'; end if;
  if public.profile_theme_min_xp(p_theme) is null or public.profile_frame_min_xp(p_frame) is null then
    raise exception 'Tema ou moldura inválidos';
  end if;
  if public.profile_theme_min_xp(p_theme) > xp_value or public.profile_frame_min_xp(p_frame) > xp_value then
    raise exception 'Este item ainda não foi desbloqueado com seu XP';
  end if;
  insert into public.profile_appearance (user_id, theme, frame) values (uid, p_theme, p_frame)
    on conflict (user_id) do update set theme = excluded.theme, frame = excluded.frame, updated_at = now();
  return jsonb_build_object('theme', p_theme, 'frame', p_frame);
end;
$$;

-- Somente o estilo de um portfólio publicado e de uma conta não bloqueada.
-- Não revela participação/apelido do ranking, inclusive para o papel anon.
create or replace function public.get_public_profile_appearance(p_user_id uuid)
returns jsonb language sql stable security definer set search_path = pg_catalog as $$
  select jsonb_build_object(
    'theme', case when public.profile_theme_min_xp(a.theme) <= p.xp then a.theme else 'original' end,
    'frame', case when public.profile_frame_min_xp(a.frame) <= p.xp then a.frame else 'simples' end
  )
  from public.profiles p
  left join public.profile_appearance a on a.user_id = p.id
  where p.id = p_user_id and p.portfolio_public and not coalesce(p.is_blocked, false);
$$;

-- Progresso cumulativo e privado, calculado a partir dos registros existentes.
-- Não cria recompensas e inclui projetos manuais e certificados anteriores.
create or replace function public.get_my_challenge_progress()
returns jsonb language plpgsql stable security definer set search_path = pg_catalog as $$
declare uid uuid := auth.uid();
begin
  perform public.gamification_active_xp();
  return jsonb_build_object(
    'lessons', (select count(*) from public.course_lesson_progress where user_id = uid),
    'projects', (select count(*) from public.user_projects where user_id = uid),
    'certificates', (select count(*) from public.certificates where user_id = uid)
  );
end;
$$;

create or replace function public.set_ranking_participation(p_join boolean, p_alias text default null)
returns jsonb language plpgsql security definer set search_path = pg_catalog as $$
declare
  uid uuid := auth.uid();
  clean_alias text := btrim(p_alias);
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  perform 1 from public.profiles p where p.id = uid and not coalesce(p.is_blocked, false) for share;
  if not found then raise exception 'Perfil indisponível ou conta bloqueada'; end if;
  if p_join is null then raise exception 'Escolha se deseja participar'; end if;
  if not p_join then
    delete from public.ranking_participants where user_id = uid;
    return jsonb_build_object('joined', false, 'alias', null);
  end if;
  if clean_alias is null or char_length(clean_alias) not between 2 and 24
     or clean_alias ~ '[[:cntrl:]]' or position('@' in clean_alias) > 0 then
    raise exception 'Use um apelido de 2 a 24 caracteres, sem @ ou caracteres de controle';
  end if;
  insert into public.ranking_participants(user_id, alias) values (uid, clean_alias)
    on conflict (user_id) do update set alias = excluded.alias;
  return jsonb_build_object('joined', true, 'alias', clean_alias);
end;
$$;

-- A lista só é acessível a participantes autenticados e ativos. Contém apenas
-- posição, apelido, XP e a indicação da própria linha; nunca IDs ou perfis.
-- Empates compartilham posição. Mostra os primeiros 50 e, se necessário, a
-- linha de quem consulta mesmo fora dos 50 primeiros.
create or replace function public.get_optional_ranking()
returns table (ranking_position bigint, alias text, xp integer, is_self boolean)
language plpgsql stable security definer set search_path = pg_catalog as $$
declare uid uuid := auth.uid();
begin
  perform public.gamification_active_xp();
  if not exists (select 1 from public.ranking_participants r where r.user_id = uid) then
    raise exception 'É preciso participar para visualizar o ranking';
  end if;
  return query
    with ranked as (
      select r.user_id, r.alias, p.xp,
        rank() over (order by p.xp desc) as place,
        row_number() over (order by p.xp desc, lower(r.alias), r.user_id) as ordinal
      from public.ranking_participants r
      join public.profiles p on p.id = r.user_id
      where not coalesce(p.is_blocked, false)
    )
    select r.place, r.alias, r.xp, r.user_id = uid
    from ranked r where r.ordinal <= 50 or r.user_id = uid
    order by r.ordinal;
end;
$$;

revoke all on function public.profile_theme_min_xp(text) from public, anon, authenticated;
revoke all on function public.profile_frame_min_xp(text) from public, anon, authenticated;
revoke all on function public.gamification_active_xp() from public, anon, authenticated;
revoke all on function public.get_my_gamification_settings() from public, anon, authenticated;
revoke all on function public.save_profile_appearance(text, text) from public, anon, authenticated;
revoke all on function public.get_public_profile_appearance(uuid) from public, anon, authenticated;
revoke all on function public.get_my_challenge_progress() from public, anon, authenticated;
revoke all on function public.set_ranking_participation(boolean, text) from public, anon, authenticated;
revoke all on function public.get_optional_ranking() from public, anon, authenticated;
grant execute on function public.get_my_gamification_settings() to authenticated;
grant execute on function public.save_profile_appearance(text, text) to authenticated;
grant execute on function public.get_public_profile_appearance(uuid) to anon, authenticated;
grant execute on function public.get_my_challenge_progress() to authenticated;
grant execute on function public.set_ranking_participation(boolean, text) to authenticated;
grant execute on function public.get_optional_ranking() to authenticated;

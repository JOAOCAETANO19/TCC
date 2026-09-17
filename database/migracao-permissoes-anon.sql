-- ============================================================
-- REFORÇO DAS PERMISSÕES DO PAPEL ANON (Pratica.dev 2.0)
-- ------------------------------------------------------------
-- Execute este arquivo no SQL Editor do Supabase.
-- IDEMPOTENTE: pode ser executado mais de uma vez com segurança
-- (repetir revoke/grant não produz efeito adicional).
--
-- O que esta migração entrega:
--   Torna efetiva a restrição por coluna sobre public.profiles
--   para o papel anon (visitantes do portfólio público). O grant
--   por coluna aplicado nas migrações anteriores só restringe de
--   verdade se nenhum grant mais amplo estiver ativo; o revoke
--   abaixo zera qualquer privilégio herdado antes de reconceder
--   somente as colunas exibidas pelo portfólio público.
--   As LINHAS continuam limitadas pelas políticas RLS: apenas
--   perfis com portfolio_public = true e não bloqueados ficam
--   visíveis para visitantes anônimos.
-- ============================================================

revoke all on public.profiles from anon;
grant select (id, name, track, goal, level, xp, portfolio_public, avatar_url) on public.profiles to anon;

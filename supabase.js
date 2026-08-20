// ============================================================
//  supabase.js — Pratica.dev 2.0
//  Substitui o localStorage por autenticação e banco reais.
//
//  ⚠️  ANTES DE USAR: troque as duas constantes abaixo pelos
//      valores do seu projeto no painel do Supabase:
//      https://supabase.com/dashboard → Settings → API
// ============================================================

const SUPABASE_URL  = 'https://rsptwmdmxxujvygjnbyl.supabase.co';
const SUPABASE_ANON = 'sb_publishable_zNnninUZuh7wz3qH-Sfeeg_cyFqnsvf';

// ── cliente leve (sem npm) via CDN ──────────────────────────
// O index.html já deve carregar antes deste arquivo:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);


// ============================================================
//  AUTH — Login
// ============================================================
async function supabaseLogin(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
}

// ============================================================
//  AUTH — Cadastro
//  Cria o usuário no Auth e já insere o perfil na tabela
//  public.profiles (que referencia auth.users).
// ============================================================
async function supabaseRegister(email, password, name, age) {
  // 1. Cria conta no Auth
  const { data, error } = await db.auth.signUp({ email, password });
  if (error) throw new Error(error.message);

  const user = data.user;

  // 2. Insere perfil (o trigger pode fazer isso automaticamente,
  //    mas fazemos aqui para garantir os campos extras)
  const { error: profileError } = await db
    .from('profiles')
    .upsert({
      id:    user.id,
      name:  name,
      age:   parseInt(age),
      email: email
    }, { onConflict: 'id' });

  if (profileError) throw new Error(profileError.message);
  return user;
}

// ============================================================
//  AUTH — Logout
// ============================================================
async function supabaseLogout() {
  await db.auth.signOut();
}

// ============================================================
//  AUTH — Sessão ativa (para o init())
// ============================================================
async function getSession() {
  const { data, error } = await db.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

// ============================================================
//  PERFIL — Buscar dados do usuário logado
// ============================================================
async function fetchProfile(userId) {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ============================================================
//  QUIZ — Buscar respostas de um usuário (usado no painel de admin)
// ============================================================
async function fetchQuizAnswers(userId) {
  const { data, error } = await db
    .from('quiz_answers')
    .select('*')
    .eq('user_id', userId)
    .order('question');

  if (error) throw new Error(error.message);
  return data || [];
}

// ============================================================
//  XP — Estas 4 funções são os ÚNICOS jeitos de ganhar XP.
//  Cada uma chama uma função no banco que decide sozinha quanto
//  XP dar (o valor não vem do cliente) e recalcula o nível.
//  Um usuário não consegue mais escrever xp/level direto na
//  tabela profiles, nem pelo console do navegador — só por aqui.
// ============================================================
async function awardQuizXP(answers, track, goal) {
  const { error } = await db.rpc('award_quiz_xp', {
    p_answers: answers, p_track: track, p_goal: goal
  });
  if (error) throw new Error(error.message);
}

async function awardSubjectViewXP(subjectId) {
  const { error } = await db.rpc('award_subject_view_xp', { p_subject_id: subjectId });
  if (error) throw new Error(error.message);
}

async function awardExerciseXP(subjectId, certTitle) {
  const { error } = await db.rpc('award_exercise_xp', {
    p_subject_id: subjectId, p_cert_title: certTitle
  });
  if (error) throw new Error(error.message);
}

async function awardProjectXP(projectId) {
  const { error } = await db.rpc('award_project_xp', { p_project_id: projectId });
  if (error) throw new Error(error.message);
}

// ============================================================
//  PROGRESSO — Matérias estudadas (leitura)
// ============================================================
async function fetchSubjectProgress(userId) {
  const { data, error } = await db
    .from('subject_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data || [];
}

// ============================================================
//  PROJETOS — Listar projetos concluídos por um aluno (leitura)
// ============================================================
async function fetchUserProjects(userId) {
  const { data, error } = await db
    .from('user_projects')
    .select('project_id, projects(name, level, description)')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data || [];
}

// ============================================================
//  CERTIFICADOS — Listar certificados do usuário
// ============================================================
async function fetchCertificates(userId) {
  const { data, error } = await db
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// ============================================================
//  PROJETOS DISPONÍVEIS — Tabela pública projects
// ============================================================
async function fetchAllProjects() {
  const { data, error } = await db
    .from('projects')
    .select('*')
    .order('id');

  if (error) throw new Error(error.message);
  return data || [];
}

// ============================================================
//  ADMIN — Listar todos os alunos cadastrados
//  Só retorna TODAS as linhas se o usuário logado for admin —
//  isso é garantido pela política RLS "admin ve todos os perfis"
//  no banco, não por este código. Um aluno comum que chamar essa
//  mesma função só recebe de volta o próprio perfil, porque a
//  política "allow select own profile" continua valendo pra ele.
// ============================================================
async function fetchAllProfiles() {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// ============================================================
//  ADMIN — Resetar XP/nível de um aluno para zero
//  Só funciona de verdade se quem chamar for admin — garantido
//  pela política RLS "admin atualiza qualquer perfil" no banco.
// ============================================================
async function adminResetXP(targetId) {
  const { error } = await db.rpc('admin_reset_xp', { target_id: targetId });
  if (error) throw new Error(error.message);
}

// ============================================================
//  ADMIN — Tornar ou remover admin de um aluno
//  Dupla proteção no banco: a política RLS já exige que quem
//  chama seja admin, e o trigger trg_protect_is_admin reverte
//  a mudança se, por algum motivo, quem chamou não for admin.
// ============================================================
async function adminSetIsAdmin(targetId, value) {
  const { error } = await db
    .from('profiles')
    .update({ is_admin: value })
    .eq('id', targetId);

  if (error) throw new Error(error.message);
}

// ============================================================
//  ADMIN — Excluir aluno (perfil + tudo que ele gerou no sistema)
//  Chama a função admin_delete_student no banco (SECURITY DEFINER),
//  que confere de novo se quem chamou é admin antes de excluir.
//
//  ⚠️ Isso remove o aluno do app (perfil, XP, projetos, certificados,
//  respostas do quiz), mas NÃO remove a conta de login dele no
//  Supabase Auth — isso exige a Admin API (chave service_role, que
//  nunca deve ir para o frontend). Se quiser apagar o login também,
//  faça manualmente em Supabase → Authentication → Users.
// ============================================================
async function adminDeleteStudent(targetId) {
  const { error } = await db.rpc('admin_delete_student', { target_id: targetId });
  if (error) throw new Error(error.message);
}

// ============================================================
//  PORTFÓLIO PÚBLICO — leitura anônima (funciona SEM login)
//  A chave anon + as políticas RLS "leitura anônima" liberam só o
//  que o aluno marcou como público. Aqui o select é explícito:
//  NUNCA pedimos email, age nem is_admin nesta tela — mesmo que o
//  banco liberasse, o frontend não solicita nem renderiza essas
//  colunas. (Coluna portfolio_public = true exige a linha publicada.)
// ============================================================

async function fetchPublicProfile(userId) {
  const { data, error } = await db
    .from('profiles')
    .select('id, name, track, goal, level, xp, portfolio_public, avatar_url')
    .eq('id', userId)
    .eq('portfolio_public', true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  // Sem linha = perfil inexistente ou privado (a policy anon esconde os dois)
  if (!data || data.portfolio_public !== true) return null;
  return data;
}

async function fetchPublicProjects(userId) {
  const { data, error } = await db
    .from('user_projects')
    .select('project_id, projects(name, level, description)')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data || [];
}

async function fetchPublicCertificates(userId) {
  const { data, error } = await db
    .from('certificates')
    .select('subject_id, title, issued_at')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// ============================================================
//  PORTFÓLIO — visibilidade (aluno logado, aba Portfólio)
//  Só o dono do perfil consegue mudar portfolio_public (RLS:
//  profiles_update exige id = auth.uid(), e o trigger
//  trg_protect_profile_fields não mexe nessa coluna).
// ============================================================
async function setPortfolioPublic(userId, value) {
  const { error } = await db
    .from('profiles')
    .update({ portfolio_public: !!value })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

// ============================================================
//  FOTO DE PERFIL (AVATAR) — Supabase Storage
//  O bucket "avatars" é PRIVADO (public = false): nenhuma
//  imagem tem URL pública. Toda exibição usa URL assinada, e as
//  políticas do Storage só deixam assinar quando:
//    • o arquivo está na pasta do próprio usuário, ou
//    • o dono da pasta publicou o portfólio (portfolio_public).
//  Ou seja: perfil privado = foto inacessível para anônimos,
//  mesmo conhecendo o caminho exato do arquivo.
// ============================================================

// Faz upload (ou substitui) a foto e grava o caminho no perfil.
// Tipo/tamanho já foram validados no cliente; o bucket também
// limita a 2 MB e a image/jpeg|image/png (defesa em profundidade).
async function uploadAvatar(userId, file, previousPath) {
  const ext = file.type === 'image/png' ? 'png' : 'jpg';
  const path = userId + '/avatar.' + ext;

  const { error } = await db.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' });

  if (error) throw new Error(error.message);

  // Se a extensão mudou (jpg ↔ png), remove o arquivo antigo.
  if (previousPath && previousPath !== path) {
    try {
      await db.storage.from('avatars').remove([previousPath]);
    } catch (_) { /* arquivo anterior não é crítico */ }
  }

  const { error: profileError } = await db
    .from('profiles')
    .update({ avatar_url: path })
    .eq('id', userId);

  if (profileError) throw new Error(profileError.message);
  return path;
}

// Remove o arquivo do Storage e limpa a coluna avatar_url.
async function removeAvatar(userId, path) {
  if (path) {
    const { error } = await db.storage.from('avatars').remove([path]);
    if (error) throw new Error(error.message);
  }

  const { error: profileError } = await db
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', userId);

  if (profileError) throw new Error(profileError.message);
}

// Gera URL assinada (válida por 1h) para exibir a foto.
// Funciona com ou sem login, mas o Storage só autoriza dentro
// das regras de privacidade descritas acima.
async function fetchAvatarSignedUrl(path) {
  if (!path) return null;
  const { data, error } = await db.storage
    .from('avatars')
    .createSignedUrl(path, 3600);

  if (error) throw new Error(error.message);
  return (data && data.signedUrl) || null;
}

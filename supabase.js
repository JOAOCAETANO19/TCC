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
    .insert({
      id:    user.id,
      name:  name,
      age:   parseInt(age),
      email: email
    });

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
  const { data } = await db.auth.getSession();
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
//  PERFIL — Salvar alterações (xp, level, track, goal, etc.)
// ============================================================
async function saveProfile(userId, updates) {
  const { error } = await db
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

// ============================================================
//  QUIZ — Salvar respostas e marcar quiz como feito
// ============================================================
async function saveQuizAnswers(userId, answers) {
  // Monta array de linhas para inserção em lote
  const rows = answers.map((answer, i) => ({
    user_id:  userId,
    question: `Pergunta ${i + 1}`,
    answer:   answer
  }));

  const { error: qaError } = await db
    .from('quiz_answers')
    .insert(rows);

  if (qaError) throw new Error(qaError.message);

  // Marca quiz como feito no perfil
  await saveProfile(userId, { quiz_done: true });
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
//  PROGRESSO — Matérias estudadas / exercícios concluídos
// ============================================================
async function upsertSubjectProgress(userId, subjectId, updates) {
  // upsert: cria se não existir, atualiza se já existir
  const { error } = await db
    .from('subject_progress')
    .upsert({
      user_id:    userId,
      subject_id: subjectId,
      ...updates
    }, { onConflict: 'user_id,subject_id' });

  if (error) throw new Error(error.message);
}

async function fetchSubjectProgress(userId) {
  const { data, error } = await db
    .from('subject_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data || [];
}

// ============================================================
//  PROJETOS — Marcar projeto como concluído
// ============================================================
async function completeUserProject(userId, projectId) {
  const { error } = await db
    .from('user_projects')
    .upsert({ user_id: userId, project_id: projectId },
             { onConflict: 'user_id,project_id' });

  if (error) throw new Error(error.message);
}

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

async function issueCertificate(userId, subjectId, title) {
  // Evita duplicar certificado da mesma matéria
  const { data: existing } = await db
    .from('certificates')
    .select('id')
    .eq('user_id', userId)
    .eq('subject_id', subjectId)
    .maybeSingle();

  if (existing) return; // já tem

  const { error } = await db
    .from('certificates')
    .insert({ user_id: userId, subject_id: subjectId, title });

  if (error) throw new Error(error.message);
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
  const { error } = await db
    .from('profiles')
    .update({ xp: 0, level: 1 })
    .eq('id', targetId);

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
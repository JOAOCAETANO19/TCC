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

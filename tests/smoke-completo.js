// ============================================================
//  smoke-completo.js — smoke test de ponta a ponta
//
//  Percorre a jornada completa do aluno: página inicial (deslogado),
//  cadastro, quiz de nivelamento, dashboard, perfil (nivelamento),
//  Centro de Estudos (progresso/trilha/quiz por matéria), projetos,
//  certificados, portfólio e logout — tudo com Supabase mockado,
//  sem rede e sem banco real.
// ============================================================

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

let passed = 0;
function check(condition, description) {
  if (!condition) throw new Error(`FALHOU: ${description}`);
  passed++;
  console.log(`✓ ${String(passed).padStart(2, '0')} ${description}`);
}
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

(async () => {
  const dom = new JSDOM(html, {
    url: 'https://joaocaetano19.github.io/TCC/',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.console.warn = () => {};
  window.lucide = { createIcons() {} };
  // Contexto 2D fake com todos os métodos usados pelo certificado visual.
  const gradient = { addColorStop() {} };
  window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
    get(target, prop) {
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => gradient;
      if (prop === 'measureText') return () => ({ width: 10 });
      if (prop in target) return target[prop];
      return () => {};
    },
    set(target, prop, value) { target[prop] = value; return true; }
  });

  // ── estado simulado do backend ──────────────────────────────
  let profile = {
    id: 'u1', name: 'Ana Souza', age: 17, email: 'ana@b.com',
    level: 1, xp: 0, track: null, goal: null,
    quiz_done: false, is_admin: false, portfolio_public: false
  };
  const subjectProgressRows = [];
  let certs = [];
  let completedProjects = [];

  Object.assign(window, {
    getSession: async () => null,
    supabaseRegister: async () => ({ id: 'u1' }),
    supabaseLogin: async () => ({ id: 'u1' }),
    supabaseLogout: async () => {},
    fetchProfile: async () => ({ ...profile }),
    fetchUserProjects: async () => completedProjects.map(p => ({ project_id: p })),
    fetchCertificates: async () => certs.slice(),
    fetchSubjectProgress: async () => subjectProgressRows.slice(),
    fetchQuizAnswers: async () => [], // carregado na jornada abaixo, se necessário
    fetchAllProfiles: async () => [],
    awardQuizXP: async (answers, track, goal) => {
      profile.track = track; profile.goal = goal;
      profile.quiz_done = true; profile.xp += 50;
    },
    awardSubjectViewXP: async (id) => {
      if (!subjectProgressRows.find(r => r.subject_id === id)) {
        subjectProgressRows.push({ user_id: 'u1', subject_id: id });
        profile.xp += 10;
      }
    },
    awardExerciseXP: async (id, title) => {
      if (!certs.find(c => c.subject_id === id)) {
        certs.push({ subject_id: id, title, issued_at: new Date().toISOString() });
        profile.xp += 30;
      }
    },
    awardProjectXP: async (id) => {
      if (!completedProjects.includes(id)) { completedProjects.push(id); profile.xp += 100; }
    },
    adminResetXP: async () => {}, adminSetIsAdmin: async () => {}, adminDeleteStudent: async () => {}, adminSetBlocked: async () => {},
    fetchPublicProfile: async () => null, fetchPublicProjects: async () => [], fetchPublicCertificates: async () => [],
    setPortfolioPublic: async (id, value) => { profile.portfolio_public = value; },
    uploadAvatar: async () => 'u1/avatar.jpg', removeAvatar: async () => {}, fetchAvatarSignedUrl: async () => null
  });
  try {
    Object.defineProperty(window.URL, 'createObjectURL', { value: () => 'blob:preview/avatar.png', configurable: true });
    Object.defineProperty(window.URL, 'revokeObjectURL', { value: () => {}, configurable: true });
  } catch (_) {}
  window.eval(script + `\nwindow.__testHooks = {
    setUser(v) { currentUser = v; },
    setAuth(v) { currentAuthId = v; },
    getQuizRows() { return userQuizRows.slice(); },
    getProgress() { return userSubjectProgress.slice(); },
    getCompleted() { return completedProjects.slice(); }
  };`);
  await tick();

  // ============================================================
  // 1. PÁGINA INICIAL (deslogado)
  // ============================================================
  check(!!window.document.getElementById('boot-screen'), 'existe tela de boot');
  check(window.document.getElementById('landing-screen').style.display === 'block', 'deslogado vê a página inicial');
  check(window.document.getElementById('landing-screen').textContent.includes('Centro de Estudos'), 'página inicial apresenta o Centro de Estudos');
  check(window.document.getElementById('main-app').classList.contains('hidden'), 'app principal fica oculto até autenticar');

  // ============================================================
  // 2. CADASTRO → QUIZ DE NIVELAMENTO
  // ============================================================
  window.document.getElementById('reg-name').value = 'Ana Souza';
  window.document.getElementById('reg-age').value = '17';
  window.document.getElementById('reg-email').value = 'ana@b.com';
  window.document.getElementById('reg-password').value = '123456';
  await window.handleRegister();
  check(!window.document.getElementById('main-app').classList.contains('hidden'), 'cadastro válido entra no app');
  check(!window.document.getElementById('quiz-modal').classList.contains('hidden'), 'novo usuário vê o quiz de nivelamento');
  check(window.document.getElementById('quiz-steps').textContent.includes('1.') && window.document.getElementById('quiz-steps').textContent.includes('nível'), 'quiz abre na primeira pergunta');
  check(window.document.getElementById('quiz-steps').textContent.includes('1 de 3'), 'quiz indica que são 3 perguntas');

  window.answerQuiz(0, 0, 'Iniciante total');
  check(window.document.getElementById('quiz-steps').textContent.includes('2 de 3'), 'responder avança para a segunda pergunta');
  window.answerQuiz(1, 0, 'Front-end');
  window.answerQuiz(2, 2, 'Estágio em 6 meses');
  await tick(); await tick();
  check(window.document.getElementById('quiz-modal').classList.contains('hidden'), 'quiz fecha após a terceira resposta');
  check(profile.track === 'Front-end' && profile.goal === 'Estágio em 6 meses' && profile.quiz_done === true, 'quiz salva trilha, objetivo e marca como concluído');
  check(window.__testHooks.getQuizRows().length === 3, 'respostas do quiz ficam disponíveis para o Perfil');

  // ============================================================
  // 3. DASHBOARD
  // ============================================================
  check(window.document.getElementById('dash-name').textContent === 'Ana', 'dashboard mostra o primeiro nome');
  check(window.document.getElementById('dash-track').textContent === 'Front-end', 'dashboard mostra a trilha escolhida');
  check(window.document.getElementById('dash-xp').textContent === '50 XP', 'dashboard mostra o XP ganho no quiz');

  // ============================================================
  // 4. PERFIL → MEU NIVELAMENTO
  // ============================================================
  window.switchTab('perfil');
  const nivel = window.document.getElementById('prof-nivelamento');
  check(nivel.textContent.includes('Qual seu nível atual?') && nivel.textContent.includes('Iniciante total'), 'Perfil mostra a primeira resposta do nivelamento');
  check(nivel.textContent.includes('Qual área mais te interessa?') && nivel.textContent.includes('Front-end'), 'Perfil mostra a área escolhida');
  check(nivel.textContent.includes('Qual seu objetivo profissional?'), 'Perfil mostra as três perguntas do nivelamento');

  // ============================================================
  // 5. CENTRO DE ESTUDOS → progresso e trilha
  // ============================================================
  window.switchTab('estudos');
  check(window.document.getElementById('subjects-counter').textContent === '0 de 12', 'Centro de Estudos começa com 0 de 12');
  check(window.document.getElementById('studies-track').textContent.includes('Front-end'), 'trilha recomendada usa a área do quiz');
  const grid0 = window.document.getElementById('subjects-grid');
  check(grid0.querySelectorAll('.subject-card').length === 12, 'as 12 matérias aparecem no grid');
  check(grid0.textContent.includes('Comece por aqui'), 'a primeira matéria da trilha tem o destaque Comece por aqui');

  // ============================================================
  // 6. ABRIR MATÉRIA → conteúdo rico + quiz de conhecimento
  // ============================================================
  await window.openSubject('html');
  const study = window.document.getElementById('study-content');
  check(!window.document.getElementById('subjects-grid').classList.contains('hidden') === false, 'abrir matéria esconde o grid e mostra o conteúdo');
  check(study.textContent.includes('HTML - HyperText Markup Language'), 'matéria aberta mostra o título');
  check(study.textContent.includes('Nível:') && study.textContent.includes('Tempo estimado:'), 'matéria aberta mostra nível e tempo');
  check(study.textContent.includes('Erros comuns'), 'matéria aberta tem a seção Erros comuns');
  check(study.textContent.includes('Para se aprofundar') && study.querySelector('a[target="_blank"]'), 'matéria aberta tem links externos para se aprofundar');
  check(window.document.getElementById('subject-quiz').querySelectorAll('button').length === 9, 'quiz por matéria tem 3 perguntas (3 opções cada)');

  window.answerSubjectQuiz('html', 0, 0); // acerta
  check(window.document.getElementById('sq-html-0-0').textContent.includes('✓'), 'acerto no teste rápido é corrigido na hora');
  window.answerSubjectQuiz('html', 2, 1); // erra (correta é 0)
  check(window.document.getElementById('sq-html-2-1').textContent.includes('✗'), 'erro no teste rápido é corrigido na hora');
  check(window.document.getElementById('subject-quiz-score').textContent.includes('1 de 2'), 'placar do teste rápido atualiza');

  // ============================================================
  // 7. CONCLUIR EXERCÍCIO → certificado + XP
  // ============================================================
  const exerciseBtn = window.document.querySelector('#study-content button[onclick*="completeExercise"]');
  await window.completeExercise('html');
  await tick();
  check(certs.some(c => c.subject_id === 'html'), 'concluir exercício emite certificado');
  check(profile.xp >= 90, 'XP soma o exercício (+30) e a matéria (+10)');

  window.closeSubject();
  check(window.document.getElementById('subjects-counter').textContent === '1 de 12', 'voltar atualiza o contador para 1 de 12');
  check(window.document.getElementById('subjects-grid').textContent.includes('✓ Estudada'), 'matéria estudada ganha o selo ✓');

  // ============================================================
  // 8. PROJETOS → briefing e conclusão
  // ============================================================
  window.switchTab('projetos');
  check(window.document.getElementById('projects-grid').querySelectorAll('button').length > 0, 'aba Projetos renderiza os cards');
  window.openBriefing(1);
  check(!window.document.getElementById('briefing-modal').classList.contains('hidden'), 'briefing abre ao clicar em Ver briefing');
  check(window.document.getElementById('briefing-body').textContent.includes('Contexto do cliente'), 'briefing mostra o contexto do cliente');
  window.closeBriefing();
  const projBtn = window.document.querySelector('#projects-grid button[onclick*="startProject(1,"]');
  await window.startProject(1, 'Calculadora', projBtn);
  check(completedProjects.includes(1), 'concluir projeto atualiza o estado local após confirmação');

  // ============================================================
  // 9. CERTIFICADOS
  // ============================================================
  window.switchTab('certificados');
  check(window.document.getElementById('certs-gallery').textContent.includes('HTML'), 'aba Certificados mostra o certificado emitido');

  // ============================================================
  // 10. PORTFÓLIO → publicar e copiar link
  // ============================================================
  window.switchTab('portfolio');
  check(window.document.getElementById('portfolio-content').textContent.includes('Publicar portfólio'), 'portfólio começa privado');
  await window.togglePortfolioVisibility();
  check(profile.portfolio_public === true, 'publicar portfólio grava a visibilidade');
  check(window.document.getElementById('portfolio-content').textContent.includes('Portfólio público'), 'portfólio mostra o status público após publicar');

  // ============================================================
  // 11. LOGOUT → volta à página inicial
  // ============================================================
  await window.handleLogout();
  check(window.document.getElementById('landing-screen').style.display === 'block', 'logout volta para a página inicial');
  check(window.document.getElementById('main-app').classList.contains('hidden'), 'app principal fica oculto após logout');

  check(passed === 45, 'smoke-completo contém 46 verificações');
  console.log(`\n${passed} verificações passaram.`);
  window.close();
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});

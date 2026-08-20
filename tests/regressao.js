const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const supabaseSource = fs.readFileSync(path.join(root, 'supabase.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
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
  window.HTMLCanvasElement.prototype.getContext = () => ({ measureText: () => ({ width: 10 }) });

  // Todas as integrações externas usadas pelo script real são substituídas.
  Object.assign(window, {
    getSession: async () => null,
    supabaseLogin: async () => ({ id: 'u1' }),
    supabaseRegister: async () => ({ id: 'u1' }),
    supabaseLogout: async () => {},
    fetchProfile: async () => ({ id: 'u1', name: 'Aluno', email: 'a@b.com', age: 17, level: 1, xp: 0, track: null, goal: null, quiz_done: true, is_admin: false }),
    fetchUserProjects: async () => [], fetchCertificates: async () => [], fetchSubjectProgress: async () => [],
    fetchAllProfiles: async () => [], fetchQuizAnswers: async () => [],
    awardProjectXP: async () => {}, awardQuizXP: async () => {}, awardSubjectViewXP: async () => {}, awardExerciseXP: async () => {},
    adminResetXP: async () => {}, adminSetIsAdmin: async () => {}, adminDeleteStudent: async () => {}
  });
  window.eval(script + `\nwindow.__testHooks = {
    setUser(v) { currentUser = v; },
    setAuth(v) { currentAuthId = v; },
    setCompleted(v) { completedProjects = v; },
    getCompleted() { return completedProjects.slice(); },
    setCerts(v) { userCerts = v; }
  };`);
  await tick();

  // Boot, metadata e assets
  check(!!window.document.getElementById('boot-screen'), 'existe tela de boot');
  check(window.document.getElementById('login-screen').style.display === 'flex', 'login só aparece após sessão ausente');
  check(html.includes('A conexão está demorando') === false && script.includes('4000'), 'aviso de conexão lenta configurado para 4s');
  check(script.includes('Não foi possível verificar sua sessão:'), 'falha de sessão explica o motivo');
  check(script.includes('loadUserExtrasSafe(session.user.id)'), 'extras são carga secundária no boot');
  check(script.includes('loadUserExtrasSafe(user.id)'), 'extras são carga secundária no login');
  check(html.includes('rel="icon" href="favicon.svg"'), 'favicon SVG declarado');
  check(html.includes('rel="icon" href="favicon.ico"'), 'favicon ICO declarado');
  check(html.includes('rel="apple-touch-icon"'), 'apple-touch-icon declarado');
  check(html.includes('property="og:title"') && html.includes('property="og:image"'), 'Open Graph declarado');
  check(html.includes('name="description"'), 'meta description declarada');

  // Acessibilidade
  const navItems = [...window.document.querySelectorAll('.nav-item')];
  check(navItems.length === 9, 'os nove itens do menu existem');
  check(navItems.every(el => el.tagName === 'BUTTON'), 'todos os itens do menu são buttons');
  check(css.includes(':focus-visible'), 'foco de teclado é visível');
  check(window.document.getElementById('login-form').tagName === 'FORM', 'login usa formulário semântico');
  check(window.document.getElementById('register-form').tagName === 'FORM', 'cadastro usa formulário semântico');
  check(window.document.getElementById('btn-login').type === 'submit' && window.document.getElementById('btn-register').type === 'submit', 'Enter submete login e cadastro');

  // XSS no portfólio
  const payload = '<img src=x onerror="window.__xss=1">';
  window.__testHooks.setUser({ name: payload, track: payload, level: payload, xp: 0 });
  window.__testHooks.setCompleted([]); window.__testHooks.setCerts([]);
  window.renderPortfolio();
  const portfolio = window.document.getElementById('portfolio-content');
  check(!portfolio.querySelector('img'), 'nome malicioso não cria elemento no portfólio');
  check(portfolio.textContent.includes('<img src=x'), 'nome é exibido como texto escapado');
  check(!portfolio.querySelector('[onerror]'), 'trilha e nível não injetam atributos executáveis');

  // XSS no admin e detalhes
  window.fetchAllProfiles = async () => [{ id:'evil', name:payload, email:payload, age:17, level:1, xp:0, track:'-', quiz_done:false, is_admin:false }];
  window.__testHooks.setAuth('admin');
  await window.renderAdminPanel();
  const tbody = window.document.getElementById('admin-table-body');
  check(!tbody.querySelector('img'), 'nome e email do admin não criam elementos');
  window.document.getElementById('admin-detail-modal').classList.remove('hidden');
  window.eval(`renderStudentDetailModal([], [{project_id: 99, projects: {name: ${JSON.stringify(payload)}, level: ${JSON.stringify(payload)}}}], [])`);
  check(!window.document.getElementById('admin-detail-content').querySelector('img'), 'projeto vindo do banco é escapado nos detalhes');
  check(script.includes('escapeHtml(e.message)'), 'mensagens de erro inseridas em HTML são escapadas');

  // Cadastro: bloqueia localmente antes da rede
  let registrations = 0;
  window.supabaseRegister = async () => { registrations++; return { id:'u1' }; };
  const setRegistration = (name, age, email, pass='123456') => {
    window.document.getElementById('reg-name').value=name; window.document.getElementById('reg-age').value=age;
    window.document.getElementById('reg-email').value=email; window.document.getElementById('reg-password').value=pass;
  };
  setRegistration('A', '17', 'a@b.com'); await window.handleRegister();
  check(registrations === 0 && window.document.getElementById('reg-error').textContent.includes('2 e 120'), 'nome curto é rejeitado em português');
  setRegistration('Ana', '9', 'a@b.com'); await window.handleRegister();
  check(registrations === 0 && window.document.getElementById('reg-error').textContent.includes('10 e 120'), 'idade menor que 10 é rejeitada');
  setRegistration('Ana', '121', 'a@b.com'); await window.handleRegister();
  check(registrations === 0, 'idade maior que 120 é rejeitada');
  setRegistration('Ana', '17', 'email-invalido'); await window.handleRegister();
  check(registrations === 0 && window.document.getElementById('reg-error').textContent.includes('email válido'), 'formato de email é validado');
  check(window.traduzirErroAuth('violates check constraint "profiles_age_check"').includes('dados do cadastro'), 'constraint do banco é traduzida');

  // Projeto: estado local somente depois da confirmação
  window.__testHooks.setUser({ name:'Ana', level:1, xp:0, quiz_done:true, is_admin:false });
  window.__testHooks.setCompleted([]); window.__testHooks.setAuth('u1');
  const button = window.document.createElement('button');
  window.awardProjectXP = async () => { throw new Error('Network'); };
  await window.startProject(1, 'Calculadora', button);
  check(window.__testHooks.getCompleted().length === 0, 'falha ao salvar não conclui projeto localmente');
  check(button.disabled === false && button.textContent === 'Tentar novamente', 'falha reativa botão para tentar novamente');
  check(window.document.getElementById('toast-container').textContent.includes('Não foi possível salvar'), 'falha mostra toast de erro');
  window.awardProjectXP = async () => {};
  await window.startProject(1, 'Calculadora', button);
  check(window.__testHooks.getCompleted().includes(1) && button.textContent.includes('Concluído'), 'sucesso conclui somente após confirmação');

  // Supabase deve propagar erro de getSession em vez de fingir sessão ausente.
  check(supabaseSource.includes('if (error) throw new Error(error.message)'), 'getSession propaga falha de rede');
  check(fs.existsSync(path.join(root, 'favicon.svg')) && fs.existsSync(path.join(root, 'favicon.ico')) && fs.existsSync(path.join(root, 'apple-touch-icon.png')), 'todos os arquivos de ícone existem');

  check(passed === 34, 'suíte contém 35 verificações de regressão');
  console.log(`\n${passed} verificações passaram.`);
  window.close();
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});

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
    adminResetXP: async () => {}, adminSetIsAdmin: async () => {}, adminDeleteStudent: async () => {}, adminSetBlocked: async () => {},
    fetchPublicProfile: async () => null, fetchPublicProjects: async () => [], fetchPublicCertificates: async () => [],
    setPortfolioPublic: async () => {},
    uploadAvatar: async () => 'u1/avatar.jpg', removeAvatar: async () => {}, fetchAvatarSignedUrl: async () => null
  });
  // jsdom não implementa URLs de objeto; os testes do avatar usam esta versão fake.
  try {
    Object.defineProperty(window.URL, 'createObjectURL', { value: () => 'blob:preview/avatar.png', configurable: true });
    Object.defineProperty(window.URL, 'revokeObjectURL', { value: () => {}, configurable: true });
  } catch (_) { /* se não permitir, o código testado segue com try/catch interno */ }
  window.eval(script + `\nwindow.__testHooks = {
    setUser(v) { currentUser = v; },
    setAuth(v) { currentAuthId = v; },
    setCompleted(v) { completedProjects = v; },
    getCompleted() { return completedProjects.slice(); },
    setCerts(v) { userCerts = v; },
    setProgress(v) { userSubjectProgress = v; },
    getProgress() { return userSubjectProgress.slice(); },
    setQuizRows(v) { userQuizRows = v; },
    getExtras() { return subjectExtras; },
    getSubjects() { return subjects; }
  };`);
  await tick();

  // Boot, metadata e assets
  check(!!window.document.getElementById('boot-screen'), 'existe tela de boot');
  check(window.document.getElementById('landing-screen').style.display === 'block'
    && window.document.getElementById('login-screen').style.display === 'none',
    'deslogado vê a página inicial em vez de cair direto no login');
  check(html.includes('A conexão está demorando') === false && script.includes('4000'), 'aviso de conexão lenta configurado para 4s');
  check(script.includes('Não foi possível verificar sua sessão:'), 'falha de sessão explica o motivo');
  check(script.includes('loadUserExtrasSafe(session.user.id)'), 'extras são carga secundária no boot');
  check(script.includes('loadUserExtrasSafe(user.id)'), 'extras são carga secundária no login');
  check(html.includes('rel="icon" href="favicon.svg"'), 'favicon SVG declarado');
  check(html.includes('rel="icon" href="favicon.ico"'), 'favicon ICO declarado');
  check(html.includes('rel="apple-touch-icon"'), 'apple-touch-icon declarado');
  check(html.includes('property="og:title"') && html.includes('property="og:image"'), 'Open Graph declarado');
  check(html.includes('name="description"'), 'meta description declarada');

  // ============================================================
  // PÁGINA INICIAL (LANDING) — primeira tela de quem chega sem login
  // ============================================================
  const landingEl = () => window.document.getElementById('landing-screen');
  check(html.includes('id="landing-screen"') && html.includes('id="landing-btn-login"') && html.includes('id="landing-btn-register"'),
    'página inicial existe no HTML com botões Entrar e Cadastrar');
  const landingText = landingEl().textContent;
  check(landingText.includes('Estude, pratique') && landingText.includes('Centro de Estudos') && landingText.includes('Portfólio público'),
    'página inicial explica a plataforma para quem chega sem login');
  window.openLoginFromLanding();
  check(landingEl().style.display === 'none' && window.document.getElementById('login-screen').style.display === 'flex'
    && !window.document.getElementById('login-form').classList.contains('hidden'),
    'botão Entrar abre a tela de login');
  window.backToLanding();
  check(landingEl().style.display === 'block' && window.document.getElementById('login-screen').style.display === 'none',
    'tela de autenticação permite voltar para a página inicial');
  window.openRegisterFromLanding();
  check(window.document.getElementById('login-screen').style.display === 'flex'
    && !window.document.getElementById('register-form').classList.contains('hidden'),
    'botão Cadastrar abre a tela de cadastro');
  window.document.getElementById('login-email').value = 'a@b.com';
  window.document.getElementById('login-password').value = '123456';
  await window.handleLogin();
  check(!window.document.getElementById('main-app').classList.contains('hidden') && landingEl().style.display === 'none',
    'login com sucesso entra no app e esconde a página inicial');
  await window.handleLogout();
  check(landingEl().style.display === 'block' && window.document.getElementById('login-screen').style.display === 'none'
    && window.document.getElementById('main-app').classList.contains('hidden'),
    'logout volta para a página inicial');

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

  // ============================================================
  // PORTFÓLIO PÚBLICO — controles da aba Portfólio
  // ============================================================
  let visibilityCalls = [];
  const visProfile = { id: 'u1', name: 'Ana', level: 1, xp: 0, quiz_done: true, is_admin: false, portfolio_public: false };
  window.setPortfolioPublic = async (userId, value) => { visibilityCalls.push({ userId, value }); visProfile.portfolio_public = value; };
  window.fetchProfile = async () => visProfile;
  window.__testHooks.setUser(visProfile);
  window.__testHooks.setAuth('u1');
  window.__testHooks.setCompleted([]); window.__testHooks.setCerts([]);
  window.renderPortfolio();
  let portfolioContent = window.document.getElementById('portfolio-content');
  check(portfolioContent.textContent.includes('Publicar portfólio'), 'aba Portfólio mostra controle para publicar');
  await window.togglePortfolioVisibility();
  check(visibilityCalls.length === 1 && visibilityCalls[0].userId === 'u1' && visibilityCalls[0].value === true,
    'publicar chama setPortfolioPublic com usuário e valor corretos');
  check(window.document.getElementById('btn-portfolio-toggle').textContent.includes('Tornar privado'),
    'após publicar, o controle vira "Tornar privado"');
  check(portfolioContent.textContent.includes('🟢 Portfólio público'), 'status público é exibido na aba');
  check(portfolioContent.textContent.includes('#publico/u1'), 'link público aparece na aba');

  // Copiar link público (navigator.clipboard stubado)
  let copiedUrl = null;
  try {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText: async (text) => { copiedUrl = text; } },
      configurable: true
    });
  } catch (_) { /* jsdom pode não permitir; o fallback execCommand cobre */ }
  await window.copyPortfolioLink();
  check(copiedUrl === 'https://joaocaetano19.github.io/TCC/#publico/u1', 'copiar link gera a URL #publico/<id> correta');
  check(window.document.getElementById('toast-container').textContent.includes('Link público copiado'), 'copiar link mostra toast de sucesso');

  // ============================================================
  // PORTFÓLIO PÚBLICO — visão sem login (#publico/<id>)
  // ============================================================
  const publicView = () => window.document.getElementById('public-view');
  const publicContent = () => window.document.getElementById('public-portfolio');

  window.fetchPublicProfile = async () => ({
    id: 'u-pub', name: 'Nome Público', track: 'Front-end', goal: 'Estágio em 6 meses',
    level: 3, xp: 250, portfolio_public: true,
    email: 'secreto@exemplo.com', age: 99, is_admin: true // nunca devem aparecer na tela
  });
  window.fetchPublicProjects = async () => [
    { project_id: 1, projects: { name: 'Calculadora', level: 'Iniciante', description: 'Calculadora funcional' } }
  ];
  window.fetchPublicCertificates = async () => [
    { subject_id: 'html', title: 'HTML - Básico', issued_at: '2026-08-01T00:00:00.000Z' }
  ];

  window.location.hash = '#publico/u-pub';
  await tick(); await tick();
  check(window.isPublicPortfolioHash(), 'hash #publico/ é reconhecido como rota pública');
  await window.init();
  await tick(); await tick();
  check(publicView().style.display === 'block', 'rota #publico/ abre a visão pública sem login');
  check(publicContent().textContent.includes('Nome Público'), 'nome do perfil público é exibido');
  check(publicContent().textContent.includes('Calculadora'), 'projetos públicos são exibidos');
  check(publicContent().textContent.includes('HTML'), 'certificados públicos são exibidos');
  const pubText = publicContent().textContent;
  check(!pubText.includes('secreto@exemplo.com') && !pubText.includes('99 anos') && !pubText.toLowerCase().includes('admin'),
    'email, idade e is_admin não são expostos na visão pública');

  // Perfil inexistente ou privado → mensagem apropriada
  window.fetchPublicProfile = async () => null;
  window.location.hash = '#publico/nao-existe';
  await tick(); await tick();
  check(publicContent().textContent.includes('não existe ou está privado'), 'perfil inexistente/privado mostra mensagem apropriada');

  // Falha de rede → estado de erro
  window.fetchPublicProfile = async () => { throw new Error('Network'); };
  window.location.hash = '#publico/erro';
  await tick(); await tick();
  check(publicContent().textContent.includes('Não foi possível carregar'), 'falha de rede na visão pública mostra erro');

  // Link sem identificador → mensagem de link inválido
  window.location.hash = '#publico/';
  await tick(); await tick();
  check(publicContent().textContent.includes('Link inválido'), 'rota pública sem id mostra link inválido');

  // XSS na visão pública
  const payloadPublic = '<img src=x onerror="window.__xss=1">';
  window.fetchPublicProfile = async () => ({ id: 'u-x', name: payloadPublic, track: payloadPublic, goal: payloadPublic, level: payloadPublic, xp: 0, portfolio_public: true });
  window.location.hash = '#publico/xss';
  await tick(); await tick();
  check(!publicContent().querySelector('img'), 'visão pública escapa nome malicioso (sem elemento img)');
  check(publicContent().textContent.includes('<img src=x'), 'visão pública exibe nome malicioso como texto');

  // Voltar → fluxo normal (login/sessão)
  window.leavePublicView();
  await tick(); await tick();
  check(publicView().style.display === 'none', 'voltar da visão pública fecha a tela');
  check(window.document.getElementById('landing-screen').style.display === 'block'
    && window.document.getElementById('login-screen').style.display === 'none',
    'voltar da visão pública cai na página inicial');

  // ============================================================
  // PORTFÓLIO PÚBLICO — código (supabase.js, schema.sql, HTML)
  // ============================================================
  check(supabaseSource.includes("select('id, name, track, goal, level, xp, portfolio_public, avatar_url')"),
    'leitura pública seleciona só as colunas autorizadas (incluindo avatar_url)');
  check(supabaseSource.includes('fetchPublicProfile') && supabaseSource.includes('fetchPublicProjects') && supabaseSource.includes('fetchPublicCertificates'),
    'cliente tem as funções de leitura pública');
  check(supabaseSource.includes('setPortfolioPublic'), 'cliente tem função para publicar/tornar privado');
  const publicSection = supabaseSource.slice(supabaseSource.indexOf('PORTFÓLIO PÚBLICO'), supabaseSource.indexOf('setPortfolioPublic'));
  check(!publicSection.includes("select('*')"), 'leitura pública nunca usa select(*)');

  const schema = fs.readFileSync(path.join(root, 'database/schema.sql'), 'utf8');
  const avatarMigration = fs.readFileSync(path.join(root, 'database/migracao-portfolio-avatar.sql'), 'utf8');
  check(schema.includes('portfolio_public boolean not null default false'), 'schema.sql tem a coluna portfolio_public');
  check(schema.includes('profiles_public_read') && schema.includes('user_projects_public_read') && schema.includes('certificates_public_read'),
    'schema.sql tem as três políticas de leitura anônima');
  check(schema.includes('for select to anon'), 'políticas de leitura valem para o papel anon');
  check(schema.includes('grant select (id, name, track, goal, level, xp, portfolio_public) on public.profiles to anon'),
    'grant por coluna não libera email/idade/is_admin ao anon');
  check(html.includes('id="public-view"') && html.includes('id="public-portfolio"'), 'existe a tela pública sem login no HTML');
  check(script.includes('isPublicPortfolioHash()') && script.includes('openPublicView()'), 'init roteia a rota pública sem sessão');
  check(script.includes('portfolio_public'), 'script.js usa a coluna portfolio_public');

  // ============================================================
  // FOTO DE PERFIL (AVATAR) — estrutura da aba Perfil
  // ============================================================
  check(html.includes('id="avatar-file-input"'), 'existe o seletor de arquivo da foto');
  check(/id="avatar-file-input"[^>]*accept="image\/jpeg,image\/png"/.test(html), 'seletor aceita apenas JPG e PNG');
  check(html.includes('Alterar foto') && html.includes('Remover foto'), 'Perfil tem botões de alterar e remover a foto');
  check(html.includes('id="avatar-preview"') && html.includes('id="avatar-preview-img"') && html.includes('Salvar foto'), 'existe prévia da foto com botão de salvar');
  check(html.includes('id="nav-avatar"'), 'foto aparece no topo (visível no dashboard)');
  check(css.includes('.avatar-foto') && css.includes('.avatar-circle'), 'estilos redondos do avatar existem no CSS');

  // ============================================================
  // FOTO DE PERFIL (AVATAR) — fluxo completo na aba Perfil
  // ============================================================
  const avatarProfile = { id: 'u1', name: 'Ana', age: 17, goal: 'Estágio', track: 'Front-end', level: 1, xp: 0, quiz_done: true, is_admin: false, portfolio_public: false, avatar_url: null };
  window.fetchProfile = async () => ({ ...avatarProfile });
  window.fetchAvatarSignedUrl = async () => null;
  window.__testHooks.setUser({ ...avatarProfile });
  window.__testHooks.setAuth('u1');
  window.__testHooks.setCompleted([]); window.__testHooks.setCerts([]);
  window.renderProfile();
  const profAvatar = () => window.document.getElementById('prof-avatar');
  check(!profAvatar().querySelector('img') && profAvatar().textContent.trim() === 'A', 'sem foto, Perfil usa a bolinha com a inicial');
  check(window.document.getElementById('btn-avatar-remove').classList.contains('hidden'), 'botão Remover foto fica oculto sem foto');

  // Validação de tipo: GIF é recusado antes de qualquer prévia ou upload
  await window.handleAvatarFileChange({ target: { files: [{ name: 'foto.gif', type: 'image/gif', size: 1024 }], value: '' } });
  check(window.document.getElementById('toast-container').textContent.includes('JPG ou PNG'), 'tipo inválido é rejeitado com aviso em português');
  check(window.document.getElementById('avatar-preview').classList.contains('hidden'), 'arquivo de tipo inválido não abre prévia');

  // Validação de tamanho: acima de 2 MB é recusado
  await window.handleAvatarFileChange({ target: { files: [{ name: 'grande.jpg', type: 'image/jpeg', size: 3 * 1024 * 1024 }], value: '' } });
  check(window.document.getElementById('toast-container').textContent.includes('no máximo 2 MB'), 'foto acima de 2 MB é rejeitada');
  check(window.document.getElementById('avatar-preview').classList.contains('hidden'), 'arquivo muito grande não abre prévia');

  // Arquivo válido (PNG, 10 KB): prévia ANTES de salvar, sem enviar nada
  const uploads = [];
  window.uploadAvatar = async (userId, file, prev) => { uploads.push({ userId, name: file.name, prev }); avatarProfile.avatar_url = 'u1/avatar.png'; return 'u1/avatar.png'; };
  let signCalls = 0;
  window.fetchAvatarSignedUrl = async (path) => { signCalls++; return 'https://signed.example/' + path + '?token=abc'; };
  await window.handleAvatarFileChange({ target: { files: [{ name: 'minha.png', type: 'image/png', size: 10 * 1024 }], value: '' } });
  check(!window.document.getElementById('avatar-preview').classList.contains('hidden'), 'PNG válido abre a prévia antes de salvar');
  check(window.document.getElementById('avatar-preview-img').getAttribute('src').startsWith('blob:preview'), 'prévia usa URL temporária gerada do arquivo local');
  check(uploads.length === 0, 'a prévia ainda não enviou nada ao Storage');

  // Confirmar: envia, grava avatar_url e exibe via URL assinada
  await window.saveAvatar();
  check(uploads.length === 1 && uploads[0].userId === 'u1' && uploads[0].name === 'minha.png', 'salvar envia o arquivo ao bucket na pasta do usuário');
  check(profAvatar().querySelector('img') && profAvatar().querySelector('img').src.includes('signed.example/u1/avatar.png'), 'após salvar, a foto aparece via URL assinada');
  check(!window.document.getElementById('btn-avatar-remove').classList.contains('hidden'), 'botão Remover foto aparece quando há foto');
  check(window.document.getElementById('avatar-preview').classList.contains('hidden'), 'prévia fecha depois de salvar');
  check(window.document.getElementById('toast-container').textContent.includes('Foto de perfil atualizada'), 'salvar a foto mostra toast de sucesso');
  check(window.document.getElementById('nav-avatar').querySelector('img') && window.document.getElementById('nav-avatar').querySelector('img').src.includes('signed.example'), 'foto também aparece no topo (dashboard)');

  // Remoção com confirmação: apaga o arquivo e volta ao fallback
  const removals = [];
  window.removeAvatar = async (userId, path) => { removals.push({ userId, path }); avatarProfile.avatar_url = null; };
  const removalPromise = window.removeProfileAvatar();
  await tick();
  check(!window.document.getElementById('confirm-modal').classList.contains('hidden'), 'remover a foto pede confirmação no modal');
  window.resolveConfirm(true);
  await removalPromise; await tick();
  check(removals.length === 1 && removals[0].userId === 'u1' && removals[0].path === 'u1/avatar.png', 'remover apaga o arquivo correto do Storage');
  check(!profAvatar().querySelector('img') && profAvatar().textContent.trim() === 'A', 'após remover, Perfil volta à bolinha com a inicial');
  check(window.document.getElementById('btn-avatar-remove').classList.contains('hidden'), 'botão Remover foto some junto com a foto');

  // ============================================================
  // FOTO DE PERFIL (AVATAR) — visão pública #publico/<id>
  // ============================================================
  let publicSignCalls = 0;
  window.fetchAvatarSignedUrl = async (path) => { publicSignCalls++; return 'https://signed.example/' + path + '?token=pub'; };
  window.fetchPublicProfile = async () => ({
    id: 'u-pub', name: 'Nome Público', track: 'Front-end', goal: 'Estágio em 6 meses',
    level: 3, xp: 250, portfolio_public: true, avatar_url: 'u-pub/avatar.jpg',
    email: 'secreto@exemplo.com', age: 99, is_admin: true // nunca devem aparecer
  });
  window.location.hash = '#publico/u-pub';
  await tick(); await tick(); await tick();
  const pubAvatarImg = () => publicContent().querySelector('img');
  check(publicSignCalls > 0 && pubAvatarImg() && pubAvatarImg().src.includes('u-pub/avatar.jpg'), 'visão pública exibe a foto via URL assinada');
  check(pubAvatarImg().alt === 'Foto de perfil de Nome Público', 'foto pública tem texto alternativo com o nome do aluno');

  // Sem avatar_url: nenhuma URL assinada é pedida e a inicial permanece
  publicSignCalls = 0;
  window.fetchPublicProfile = async () => ({
    id: 'u-sem', name: 'Sem Foto', track: 'Back-end', goal: null, level: 2, xp: 120, portfolio_public: true
  });
  window.location.hash = '#publico/u-sem';
  await tick(); await tick(); await tick();
  check(publicSignCalls === 0, 'perfil público sem foto não pede URL assinada');
  check(!publicContent().querySelector('img'), 'visão pública sem foto mantém a bolinha com a inicial');

  // URL assinada maliciosa não injeta atributos executáveis
  window.fetchAvatarSignedUrl = async () => 'x" onerror="window.__xssAvatar=1';
  window.fetchPublicProfile = async () => ({
    id: 'u-x', name: 'Avatar Malicioso', track: null, goal: null, level: 1, xp: 0, portfolio_public: true, avatar_url: 'u-x/a.png'
  });
  window.location.hash = '#publico/u-x';
  await tick(); await tick(); await tick();
  check(!publicContent().querySelector('img[onerror]'), 'URL de avatar maliciosa não injeta atributos na foto');

  // Falha ao assinar a URL: o portfólio segue íntegro com o fallback
  window.fetchAvatarSignedUrl = async () => { throw new Error('Storage down'); };
  window.location.hash = '#publico/u-x';
  await tick(); await tick(); await tick();
  check(publicContent().textContent.includes('Avatar Malicioso'), 'sem URL assinada, o restante da visão pública continua funcionando');

  window.leavePublicView();
  await tick(); await tick();

  // ============================================================
  // FOTO DE PERFIL (AVATAR) — código (supabase.js, schema.sql, script.js)
  // ============================================================
  check(supabaseSource.includes("db.storage.from('avatars')"), 'cliente usa o bucket avatars do Storage');
  check(supabaseSource.includes('createSignedUrl'), 'foto é exibida por URL assinada (bucket privado)');
  check(supabaseSource.includes('uploadAvatar') && supabaseSource.includes('removeAvatar'), 'cliente tem upload e remoção da foto');
  check(supabaseSource.includes("update({ avatar_url: path })") && supabaseSource.includes("update({ avatar_url: null })"), 'cliente grava e limpa avatar_url no perfil');
  check(script.includes('2 * 1024 * 1024') && script.includes("'image/jpeg', 'image/png'"), 'cliente valida tamanho (2 MB) e tipo (JPG/PNG)');
  check(schema.includes('avatar_url text'), 'schema.sql tem a coluna avatar_url');
  check(schema.includes("values ('avatars', 'avatars', false)") && schema.includes('file_size_limit = 2097152') && schema.includes("allowed_mimetypes = '{image/jpeg,image/png}'"), 'bucket avatars é privado; limites de 2 MB e JPG/PNG aplicados quando a coluna existir');
  check(schema.includes('grant select (avatar_url) on public.profiles to anon'), 'anon recebe só a coluna avatar_url, sem abrir email/idade');
  check(schema.includes('avatars_owner_insert') && schema.includes('avatars_owner_update') && schema.includes('avatars_owner_delete'), 'dono tem políticas de upload, update e delete');
  check(schema.includes('avatars_public_read') && schema.includes('avatars_owner_read'), 'existem políticas de leitura anônima e autenticada');
  check(/avatars_public_read[\s\S]*portfolio_public = true/.test(schema), 'leitura anônima do Storage consulta portfolio_public');
  check(schema.includes("(storage.foldername(name))[1] = auth.uid()::text"), 'escrita no Storage exige a pasta do próprio usuário');

  // ============================================================
  // XP NO SERVIDOR — trigger, SECURITY DEFINER e RLS dos certificados
  // ============================================================
  // O trigger revertia (new.xp := old.xp) o XP concedido pelas RPCs,
  // porque elas rodavam como o próprio aluno. As quatro funções passaram
  // a SECURITY DEFINER e o trigger libera esse caso.
  check(/current_user = 'postgres'[\s\S]*?return new;/.test(schema),
    'trigger protect_profile_fields libera as funções SECURITY DEFINER (postgres)');
  check(/create or replace function public\.protect_profile_fields[\s\S]*?new\.xp := old\.xp/.test(schema),
    'trigger continua revertendo XP/nível para o cliente comum');
  check(['award_quiz_xp', 'award_subject_view_xp', 'award_exercise_xp', 'award_project_xp'].every(fn =>
    new RegExp(`create or replace function public\\.${fn}\\([\\s\\S]*?language plpgsql security definer set search_path = public`).test(schema)),
    'as 4 funções de XP são security definer com search_path fixo');
  check(['admin_reset_xp', 'admin_delete_student'].every(fn =>
    new RegExp(`create or replace function public\\.${fn}\\([\\s\\S]*?security invoker`).test(schema)),
    'funções de admin seguem security invoker (autorizadas por current_is_admin)');
  check(/create policy certificates_insert on public\.certificates for insert with check \(user_id=auth\.uid\(\)\)/.test(schema)
    && /grant select, insert on public\.certificates to authenticated/.test(schema),
    'certificados têm política e grant de INSERT para o próprio aluno');

  // Reexecutar o schema.sql num banco já existente não pode abortar:
  // toda create policy precisa de um drop policy if exists da mesma
  // política imediatamente antes (mesmo nome, mesma tabela).
  const allPolicies = [...schema.matchAll(/create policy\s+(\w+)\s+on\s+(public|storage)\.(\w+)/g)];
  check(allPolicies.every((m) => {
    const before = schema.slice(0, m.index);
    return new RegExp(`drop policy if exists\\s+${m[1]}\\s+on\\s+${m[2]}\\.${m[3]};\\s*$`).test(before);
  }), 'toda create policy tem drop policy if exists correspondente logo antes');

  const migrationPolicies = [...avatarMigration.matchAll(/create policy\s+(\w+)\s+on\s+(public|storage)\.(\w+)/g)];
  check(avatarMigration.includes("values ('avatars', 'avatars', false)")
    && migrationPolicies.length === 8
    && migrationPolicies.every((m) => {
      const before = avatarMigration.slice(0, m.index);
      return new RegExp(`drop policy if exists\\s+${m[1]}\\s+on\\s+${m[2]}\\.${m[3]};\\s*$`).test(before);
    }), 'migração existente do portfólio/avatar é idempotente e cria o bucket privado');

  // ============================================================
  // BLOQUEIO ADMINISTRATIVO DE USUÁRIOS — login/sessão
  // ============================================================
  // Sessão bloqueada: o cliente desloga e recusa o acesso (fonte da
  // verdade é o banco, mas o reflexo no cliente impede entrar no app).
  let logoutCalls = 0;
  window.supabaseLogout = async () => { logoutCalls++; };
  window.__testHooks.setUser({ id: 'blk', name: 'B', is_blocked: true });
  let rejectedMsg = null;
  try { await window.rejectBlockedSession(); } catch (e) { rejectedMsg = e.message; }
  check(logoutCalls === 1 && rejectedMsg && rejectedMsg.includes('bloqueada'),
    'sessão bloqueada é deslogada e o acesso é recusado');

  // Login de conta bloqueada: mostra aviso e não entra no app.
  window.supabaseLogin = async () => ({ id: 'blk' });
  window.fetchProfile = async () => ({ id: 'blk', name: 'B', is_blocked: true });
  window.document.getElementById('login-email').value = 'b@b.com';
  window.document.getElementById('login-password').value = '123456';
  await window.handleLogin();
  check(window.document.getElementById('login-error').textContent.includes('bloqueada'),
    'login de conta bloqueada mostra aviso em português');

  // ============================================================
  // BLOQUEIO ADMINISTRATIVO DE USUÁRIOS — painel Admin
  // ============================================================
  window.fetchAllProfiles = async () => [
    { id: 'beta',  name: 'Beta',  email: 'beta@b.com', age: 16, level: 2, xp: 60,  track: 'Back-end', quiz_done: true, is_admin: false, is_blocked: true  },
    { id: 'alfa',  name: 'Alfa',  email: 'alfa@a.com', age: 17, level: 3, xp: 120, track: 'Front-end', quiz_done: true, is_admin: false, is_blocked: false },
    { id: 'admin', name: 'Admin', email: 'a@a.com',    age: 18, level: 5, xp: 300, track: 'Full Stack', quiz_done: true, is_admin: true,  is_blocked: false }
  ];
  window.__testHooks.setAuth('admin');
  await window.renderAdminPanel();
  const adminBody = window.document.getElementById('admin-table-body');
  check(adminBody.textContent.includes('Bloqueado') && adminBody.textContent.includes('Ativo'),
    'tabela admin mostra status Ativo/Bloqueado');
  check(adminBody.textContent.includes('Bloquear') && adminBody.textContent.includes('Desbloquear'),
    'tabela admin tem botões Bloquear/Desbloquear');

  // O admin nunca consegue bloquear a própria conta: a linha própria não
  // mostra o botão e o banco também recusa (verificado mais abaixo).
  const selfRow = [...adminBody.querySelectorAll('tr')].find(tr => tr.textContent.includes('Admin'));
  check(!!selfRow && !selfRow.textContent.includes('Bloquear') && selfRow.textContent.includes('você'),
    'admin não pode bloquear a própria conta (linha própria sem botão)');

  // Bloquear pede confirmação e, confirmado, chama adminSetBlocked.
  const blockCalls = [];
  window.adminSetBlocked = async (id, v) => blockCalls.push({ id, v });
  const blockPromise = window.adminHandleToggleBlock('beta', 'Beta', false);
  await tick();
  const confirmShown = !window.document.getElementById('confirm-modal').classList.contains('hidden');
  window.resolveConfirm(true);
  await blockPromise; await tick();
  check(confirmShown && blockCalls.length === 1 && blockCalls[0].id === 'beta' && blockCalls[0].v === true,
    'bloquear pede confirmação e chama adminSetBlocked corretamente');

  // ============================================================
  // BLOQUEIO ADMINISTRATIVO DE USUÁRIOS — banco (schema + migração)
  // ============================================================
  const blockMigration = fs.readFileSync(path.join(root, 'database/migracao-bloqueio-usuarios.sql'), 'utf8');
  check(schema.includes('is_blocked boolean not null default false')
    && blockMigration.includes('is_blocked boolean not null default false'),
    'schema e migração têm a coluna is_blocked');
  check(blockMigration.includes('current_is_blocked') && blockMigration.includes('ensure_not_blocked') && blockMigration.includes('admin_set_blocked'),
    'migração tem as funções de bloqueio no banco');
  check(blockMigration.includes('target_id = auth.uid()') && blockMigration.includes('bloquear a própria conta'),
    'admin_set_blocked impede bloquear a própria conta no banco');
  const blockAwardFns = ['award_quiz_xp', 'award_subject_view_xp', 'award_exercise_xp', 'award_project_xp'];
  check(blockAwardFns.every(fn => new RegExp(`function public\\.${fn}\\([\\s\\S]*?ensure_not_blocked\\(\\)`).test(blockMigration)),
    'ações de XP recusam usuário bloqueado no banco (ensure_not_blocked)');
  check(/profiles_public_read[\s\S]*?is_blocked, false/.test(blockMigration)
    && /user_projects_public_read[\s\S]*?is_blocked, false/.test(blockMigration)
    && /certificates_public_read[\s\S]*?is_blocked, false/.test(blockMigration)
    && /avatars_public_read[\s\S]*?is_blocked, false/.test(blockMigration),
    'bloqueados somem dos portfólios públicos (perfil, projetos, certificados e foto)');

  // ============================================================
  // MEU NIVELAMENTO — card no Perfil com as respostas do quiz
  // ============================================================
  check(html.includes('id="prof-nivelamento"') && html.includes('Meu nivelamento'),
    'Perfil tem o card Meu nivelamento');

  window.__testHooks.setUser({ id: 'u1', name: 'Ana', age: 17, goal: 'Estágio', track: 'Front-end', level: 1, xp: 0, quiz_done: false, is_admin: false });
  window.__testHooks.setQuizRows([]);
  window.renderProfile();
  check(window.document.getElementById('prof-nivelamento').textContent.includes('não realizado'),
    'sem quiz, o nivelamento avisa que ainda não foi realizado');

  window.__testHooks.setUser({ id: 'u1', name: 'Ana', age: 17, goal: 'Estágio', track: 'Front-end', level: 1, xp: 0, quiz_done: true, is_admin: false });
  window.__testHooks.setQuizRows([
    { question: 1, answer: 'Iniciante total' },
    { question: 2, answer: 'Front-end' },
    { question: 3, answer: 'Estágio em 6 meses' }
  ]);
  window.renderProfile();
  const nivel = window.document.getElementById('prof-nivelamento');
  check(nivel.textContent.includes('Qual área mais te interessa?') && nivel.textContent.includes('Front-end'),
    'nivelamento exibe a pergunta real (e não o número) junto com a resposta');
  check(nivel.textContent.includes('Qual seu nível atual?') && nivel.textContent.includes('Qual seu objetivo profissional?'),
    'nivelamento mostra as três respostas do quiz');

  // ============================================================
  // CENTRO DE ESTUDOS — progresso, trilha, selo ✓ e conteúdo rico
  // ============================================================
  check(html.includes('id="subjects-counter"') && html.includes('id="studies-track"'),
    'Centro de Estudos tem o contador e a área de trilha recomendada');

  const extras = window.__testHooks.getExtras();
  const subjectsList = window.__testHooks.getSubjects();
  const extrasValues = Object.values(extras);
  check(Object.keys(extras).length === subjectsList.length && subjectsList.length === 12,
    'existem exatamente 12 matérias com conteúdo extra');
  check(extrasValues.every(e => e.level && e.time),
    'as 12 matérias têm nível e tempo estimado');
  check(extrasValues.every(e => Array.isArray(e.mistakes) && e.mistakes.length >= 3),
    'as 12 matérias têm a seção Erros comuns');
  check(extrasValues.every(e => Array.isArray(e.deepDive) && e.deepDive.length >= 3 && e.deepDive.every(d => d.label && d.url)),
    'as 12 matérias têm links para se aprofundar');
  check(extrasValues.every(e => Array.isArray(e.quiz) && e.quiz.length === 3 && e.quiz.every(q => q.q && Array.isArray(q.options) && Number.isInteger(q.answer))),
    'as 12 matérias têm quiz de conhecimento com 3 perguntas');

  window.__testHooks.setUser({ id: 'u1', name: 'Ana', track: 'Front-end', level: 1, xp: 0, quiz_done: true, is_admin: false });
  window.__testHooks.setProgress([]);
  window.renderSubjects();
  check(window.document.getElementById('subjects-counter').textContent === '0 de 12',
    'contador começa em 0 de 12');
  check(window.document.getElementById('studies-track').textContent.includes('Front-end'),
    'trilha recomendada mostra a área do quiz');

  const gridEmpty = window.document.getElementById('subjects-grid');
  check(gridEmpty.textContent.includes('Comece por aqui'),
    'com a trilha vazia, a primeira matéria ganha o destaque Comece por aqui');

  window.__testHooks.setProgress(['html', 'css']);
  window.renderSubjects();
  check(window.document.getElementById('subjects-counter').textContent === '2 de 12',
    'contador reflete as matérias já estudadas');
  const grid = window.document.getElementById('subjects-grid');
  check(grid.textContent.includes('✓ Estudada'),
    'matérias estudadas exibem o selo ✓');
  const jsCard = [...grid.querySelectorAll('.subject-card')].find(c => c.textContent.includes('JavaScript'));
  check(!!jsCard && jsCard.textContent.includes('Comece por aqui'),
    'Comece por aqui pula as matérias estudadas e aponta para a próxima da trilha');

  // Matéria aberta: erros comuns, links e teste rápido
  window.fetchProfile = async () => ({ id: 'u1', name: 'Ana', age: 17, goal: 'Estágio', track: 'Front-end', level: 1, xp: 0, quiz_done: true, is_admin: false });
  await window.openSubject('html');
  const studyContent = window.document.getElementById('study-content');
  check(studyContent.textContent.includes('Erros comuns') && studyContent.textContent.includes('Para se aprofundar'),
    'matéria aberta mostra Erros comuns e Para se aprofundar');
  check(studyContent.textContent.includes('Teste rápido de conhecimento'),
    'matéria aberta mostra o teste rápido de conhecimento');
  check(window.document.getElementById('subject-quiz').querySelectorAll('button').length === 9,
    'quiz por matéria tem 3 perguntas com 3 opções cada');

  // Correção na hora: acerto e erro são destacados imediatamente
  window.answerSubjectQuiz('html', 0, 0); // opção correta é a 0
  const q0First = window.document.getElementById('sq-html-0-0');
  check(q0First.textContent.includes('✓') && q0First.disabled,
    'resposta correta ganha ✓ na hora e trava as opções');
  window.answerSubjectQuiz('html', 1, 1); // erra (correta é a 0)
  const q1Wrong = window.document.getElementById('sq-html-1-1');
  const q1Right = window.document.getElementById('sq-html-1-0');
  check(q1Wrong.textContent.includes('✗') && q1Right.textContent.includes('✓'),
    'após errar, a opção errada ganha ✗ e a correta é destacada');
  check(window.document.getElementById('subject-quiz-score').textContent.includes('1 de 2'),
    'placar do teste rápido contabiliza acertos na hora');

  check(passed === 155, 'suíte contém 156 verificações de regressão');
  console.log(`\n${passed} verificações passaram.`);
  window.close();
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});

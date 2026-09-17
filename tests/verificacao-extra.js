// ============================================================
//  verificacao-extra.js — menu mobile, certificado visual e
//  painel admin
//
//  Suíte complementar às outras duas: cobre a gaveta do menu
//  mobile (abrir/fechar, Esc, resize e troca de aba), o diploma
//  visual em canvas (desenho, download em PNG, impressão e
//  fechamento) e as ações do painel admin (confirmar e cancelar,
//  detalhes do aluno com erro) — além de pickAvatarFile,
//  renderCareers, o botão de conclusão do briefing (sucesso e
//  falha) e o escapamento escJsStr. Tudo com jsdom e backend
//  mockado, sem rede e sem banco real.
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

  // viewport controlado pelo teste: começa em desktop
  let viewportMobile = false;
  window.matchMedia = (query) => ({
    matches: viewportMobile, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false
  });

  // Contexto 2D fake que registra os textos desenhados no diploma.
  const fillTexts = [];
  const gradient = { addColorStop() {} };
  window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
    get(target, prop) {
      if (prop === 'fillText') return (text) => { fillTexts.push(String(text)); };
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => gradient;
      if (prop === 'measureText') return () => ({ width: 10 });
      if (prop in target) return target[prop];
      return () => {};
    },
    set(target, prop, value) { target[prop] = value; return true; }
  });
  window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,FAKEPNG';
  let printCalls = 0;
  window.print = () => { printCalls++; };
  let downloaded = null; // intercepta o <a download> do certificado
  window.HTMLAnchorElement.prototype.click = function () { downloaded = { name: this.download, href: this.href }; };

  // ── estado simulado do backend ──────────────────────────────
  const mainProfile = { id: 'u1', name: 'Admin Ana', email: 'ana@b.com', age: 17, level: 2, xp: 120, track: 'Front-end', goal: 'Estágio em 6 meses', quiz_done: true, is_admin: true, portfolio_public: false, avatar_url: null };
  const bruno = { id: 'u2', name: 'Bruno Lima', email: 'bruno@b.com', age: 16, level: 1, xp: 40, track: null, goal: null, quiz_done: true, is_admin: false, is_blocked: false };
  const adminCalls = { resetXP: [], setAdmin: [], setBlocked: [], delete: [] };
  const failProjects = new Set();

  Object.assign(window, {
    getSession: async () => null,
    supabaseLogin: async () => ({ id: 'u1' }),
    supabaseRegister: async () => ({ id: 'u1' }),
    supabaseLogout: async () => {},
    fetchProfile: async (id) => {
      if (id === 'u3') throw new Error('falha proposital');
      return { ...(id === 'u2' ? bruno : mainProfile) };
    },
    fetchUserProjects: async (id) => id === 'u2' ? [{ project_id: 1, projects: { name: 'Calculadora', level: 'Iniciante' } }] : [],
    fetchCertificates: async (id) => id === 'u2' ? [{ subject_id: 'html', title: 'HTML - Básico', issued_at: '2026-08-19T12:00:00.000Z' }] : [],
    fetchSubjectProgress: async () => [],
    fetchAllProfiles: async () => [{ ...mainProfile }, { ...bruno }],
    fetchQuizAnswers: async (id) => id === 'u2' ? [{ question: 1, answer: 'Iniciante total' }] : [],
    awardProjectXP: async (id) => { if (failProjects.has(id)) throw new Error('rede caiu'); },
    awardQuizXP: async () => {}, awardSubjectViewXP: async () => {}, awardExerciseXP: async () => {},
    adminResetXP: async (id) => { adminCalls.resetXP.push(id); },
    adminSetIsAdmin: async (id, value) => { adminCalls.setAdmin.push([id, value]); },
    adminSetBlocked: async (id, value) => { adminCalls.setBlocked.push([id, value]); },
    adminDeleteStudent: async (id) => { adminCalls.delete.push(id); },
    fetchPublicProfile: async () => null, fetchPublicProjects: async () => [], fetchPublicCertificates: async () => [],
    setPortfolioPublic: async () => {},
    uploadAvatar: async () => 'u1/avatar.jpg', removeAvatar: async () => {}, fetchAvatarSignedUrl: async () => null
  });
  window.eval(script + `\nwindow.__testHooks = {
    getCompleted() { return completedProjects.slice(); },
    getLastCertModel() { return lastCertModel; }
  };`);
  await tick();

  // entra no app como admin
  window.document.getElementById('login-email').value = 'ana@b.com';
  window.document.getElementById('login-password').value = '123456';
  await window.handleLogin();

  const sidebar = () => window.document.getElementById('app-sidebar');
  const backdrop = () => window.document.getElementById('sidebar-backdrop');
  const menuToggle = () => window.document.getElementById('menu-toggle');
  const toastText = () => window.document.getElementById('toast-container').textContent;

  // ============================================================
  // 1. MENU MOBILE (gaveta)
  // ============================================================
  check(window.isMobileLayout() === false, 'isMobileLayout é falso em viewport de desktop');
  viewportMobile = true;
  check(window.isMobileLayout() === true, 'isMobileLayout é verdadeiro em viewport de celular');

  window.toggleMobileMenu();
  check(sidebar().classList.contains('open'), 'toggleMobileMenu abre a gaveta');
  check(backdrop().hidden === false && backdrop().classList.contains('open'), 'abrir a gaveta mostra o fundo escurecido');
  check(menuToggle().getAttribute('aria-expanded') === 'true', 'botão do menu informa aria-expanded="true"');
  check(window.document.body.style.overflow === 'hidden', 'gaveta aberta trava o scroll do fundo no mobile');

  window.toggleMobileMenu();
  check(!sidebar().classList.contains('open') && backdrop().hidden === true
    && menuToggle().getAttribute('aria-expanded') === 'false' && window.document.body.style.overflow === '',
    'toggleMobileMenu de novo fecha gaveta, fundo e destrava o scroll');

  window.toggleMobileMenu();
  window.closeMobileMenu();
  check(!sidebar().classList.contains('open') && backdrop().hidden === true, 'closeMobileMenu fecha a gaveta aberta');

  window.toggleMobileMenu();
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
  check(!sidebar().classList.contains('open'), 'apertar Esc fecha a gaveta');

  window.toggleMobileMenu();
  viewportMobile = false; // simula a volta para o layout desktop
  window.dispatchEvent(new window.Event('resize'));
  check(!sidebar().classList.contains('open'), 'redimensionar para desktop fecha a gaveta');

  viewportMobile = true;
  window.toggleMobileMenu();
  window.switchTab('estudos');
  check(!sidebar().classList.contains('open'), 'trocar de aba fecha a gaveta automaticamente');

  viewportMobile = false;
  window.toggleMobileMenu();
  check(window.document.body.style.overflow === '', 'abrir a gaveta em desktop não trava o scroll');
  window.closeMobileMenu();

  // ============================================================
  // 2. CERTIFICADO VISUAL (diploma em canvas)
  // ============================================================
  window.openDemoCertificate();
  await tick(); await tick();
  const certModal = () => window.document.getElementById('certificate-modal');
  const certCanvas = window.document.getElementById('cert-canvas');
  check(!certModal().classList.contains('hidden'), 'openDemoCertificate abre o modal do diploma');
  check(certCanvas.width === 2800 && certCanvas.height === 1980 && certCanvas.style.width === '100%',
    'diploma é desenhado em 2800x1980 (escala 2x) e ocupa 100% da largura');
  check(fillTexts.includes('CERTIFICADO DE CONCLUSÃO'), 'diploma desenha o título CERTIFICADO DE CONCLUSÃO');
  check(fillTexts.includes('Aluno Exemplo'), 'diploma desenha o nome do aluno do modelo de demonstração');
  check(fillTexts.includes('HTML') && fillTexts.includes('HTML - Básico'), 'diploma desenha a matéria e o título do módulo');
  check(fillTexts.includes('Front-end • Nível 3 • 240 XP'), 'diploma desenha trilha, nível e XP do aluno');
  check(fillTexts.includes('DATA DE EMISSÃO') && fillTexts.some(t => t.startsWith('Código de verificação')),
    'diploma desenha data de emissão e código de verificação');

  downloaded = null;
  window.downloadCertificate();
  check(downloaded && downloaded.name === 'certificado-praticadev-html.png',
    'download salva o PNG com o nome certificado-praticadev-html.png');

  const printRoot = () => window.document.getElementById('certificate-print-root');
  window.printCertificate();
  const printImg = printRoot().querySelector('img');
  check(!!printImg && printImg.alt === 'Certificado Pratica.dev 2.0' && printImg.src.startsWith('data:image/png'),
    'imprimir prepara a imagem do diploma na área de impressão');
  printImg.onload();
  check(printCalls === 1, 'carregar a imagem dispara window.print()');
  window.dispatchEvent(new window.Event('afterprint'));
  check(printRoot().children.length === 0, 'depois da impressão a área de impressão é limpa');

  window.closeCertificate();
  check(certModal().classList.contains('hidden'), 'closeCertificate fecha o modal do diploma');
  check(window.__testHooks.getLastCertModel() === null, 'fechar o diploma limpa o modelo em memória');

  // ============================================================
  // 3. PAINEL ADMIN — confirmações e cancelamentos
  // ============================================================
  window.switchTab('admin');
  await tick(); await tick();
  check(window.document.getElementById('admin-total').textContent === '2'
    && window.document.getElementById('admin-table-body').textContent.includes('Bruno Lima'),
    'painel admin lista os alunos cadastrados');

  // resolveConfirm(true/false) é o handler dos botões do modal de confirmação;
  // é chamado diretamente porque handlers onclick inline não rodam no jsdom.
  const confirmModal = () => window.document.getElementById('confirm-modal');
  const confirmOk = () => window.document.getElementById('confirm-ok-btn');

  let p = window.adminHandleResetXP('u2', 'Bruno');
  await tick();
  check(!confirmModal().classList.contains('hidden')
    && window.document.getElementById('confirm-message').textContent === 'Resetar XP e nível de Bruno para zero?',
    'resetar XP abre o modal de confirmação com a mensagem certa');
  check(confirmOk().className.includes('btn-primary') && !confirmOk().className.includes('bg-red-500'),
    'botão de confirmar o reset não usa o estilo de perigo');
  window.resolveConfirm(true);
  await p;
  check(adminCalls.resetXP.length === 1 && adminCalls.resetXP[0] === 'u2', 'confirmar o reset chama adminResetXP com o aluno certo');
  check(toastText().includes('XP de Bruno foi resetado.'), 'reset confirmado mostra o toast de sucesso');

  p = window.adminHandleResetXP('u2', 'Bruno');
  await tick();
  window.resolveConfirm(false);
  await p;
  check(adminCalls.resetXP.length === 1, 'cancelar o reset não chama o backend');

  p = window.adminHandleToggleAdmin('u2', 'Bruno', false);
  await tick();
  check(window.document.getElementById('confirm-message').textContent.includes('Tornar Bruno administrador?'),
    'promover a admin explica a consequência no modal');
  window.resolveConfirm(true);
  await p;
  check(adminCalls.setAdmin.length === 1 && adminCalls.setAdmin[0][0] === 'u2' && adminCalls.setAdmin[0][1] === true
    && toastText().includes('Bruno agora é admin.'), 'confirmar promove o aluno a admin e avisa em toast');

  p = window.adminHandleToggleBlock('u2', 'Bruno', false);
  await tick();
  check(window.document.getElementById('confirm-message').textContent.includes('Bloquear Bruno?'),
    'bloquear aluno pede confirmação com o nome da pessoa');
  check(confirmOk().className.includes('bg-red-500'), 'botão de confirmar o bloqueio usa o estilo de perigo');
  window.resolveConfirm(true);
  await p;
  check(adminCalls.setBlocked.length === 1 && adminCalls.setBlocked[0][0] === 'u2' && adminCalls.setBlocked[0][1] === true
    && toastText().includes('Bruno foi bloqueado.'), 'confirmar bloqueia o aluno e avisa em toast');

  p = window.adminHandleDelete('u2', 'Bruno');
  await tick();
  check(window.document.getElementById('confirm-message').textContent.includes('Excluir Bruno permanentemente?'),
    'excluir aluno avisa que a ação é permanente');
  window.resolveConfirm(true);
  await p;
  check(adminCalls.delete.length === 1 && adminCalls.delete[0] === 'u2'
    && toastText().includes('Bruno foi excluído.'), 'confirmar exclui o aluno e avisa em toast');

  p = window.adminHandleDelete('u2', 'Bruno');
  await tick();
  window.resolveConfirm(false);
  await p;
  check(adminCalls.delete.length === 1, 'cancelar a exclusão não chama o backend');

  // ============================================================
  // 4. PAINEL ADMIN — detalhes do aluno
  // ============================================================
  p = window.adminShowDetails('u2');
  check(!window.document.getElementById('admin-detail-modal').classList.contains('hidden'),
    'adminShowDetails abre o modal de detalhes');
  await p;
  check(window.document.getElementById('admin-detail-name').textContent === 'Bruno Lima'
    && window.document.getElementById('admin-detail-email').textContent === 'bruno@b.com',
    'detalhes mostram nome e e-mail do aluno');
  const detailContent = window.document.getElementById('admin-detail-content').innerHTML;
  check(detailContent.includes('Qual seu nível atual?') && detailContent.includes('Iniciante total'),
    'detalhes mostram a pergunta do quiz junto com a resposta');
  check(detailContent.includes('Calculadora'), 'detalhes mostram o projeto concluído pelo aluno');
  check(detailContent.includes('cert-mini') && detailContent.includes('HTML'), 'detalhes mostram o certificado do aluno');
  window.closeAdminDetailModal();
  check(window.document.getElementById('admin-detail-modal').classList.contains('hidden'),
    'closeAdminDetailModal fecha o modal');

  await window.adminShowDetails('u3'); // fetchProfile falha de propósito
  check(window.document.getElementById('admin-detail-content').innerHTML.includes('Erro ao carregar detalhes'),
    'falha ao carregar detalhes aparece no modal em vez de quebrar a tela');
  window.closeAdminDetailModal();

  // ============================================================
  // 5. DIVERSOS — avatar, carreiras, briefing e escapamento
  // ============================================================
  let avatarClicked = false;
  window.document.getElementById('avatar-file-input').click = () => { avatarClicked = true; };
  window.pickAvatarFile();
  check(avatarClicked, 'pickAvatarFile aciona o seletor de arquivo oculto');

  window.renderCareers();
  const careersGrid = window.document.getElementById('careers-grid');
  check(careersGrid.querySelectorAll('.career-card').length === 9 && careersGrid.textContent.includes('💰'),
    'renderCareers mostra as 9 carreiras com faixa salarial');

  window.switchTab('projetos');
  window.openBriefing(1);
  const startBtn = window.document.getElementById('briefing-start-btn');
  check(!window.document.getElementById('briefing-modal').classList.contains('hidden')
    && startBtn.disabled === false && startBtn.textContent === 'Concluir Projeto',
    'briefing abre com o botão Concluir Projeto habilitado');

  await startBtn.onclick();
  const cardBtn1 = window.document.querySelector('#projects-grid button[onclick*="startProject(1,"]');
  check(window.document.getElementById('briefing-modal').classList.contains('hidden')
    && window.__testHooks.getCompleted().includes(1) && cardBtn1.textContent.includes('✅ Concluído!'),
    'concluir pelo briefing fecha o modal e marca o projeto como concluído');

  failProjects.add(2);
  window.openBriefing(2);
  await window.document.getElementById('briefing-start-btn').onclick();
  const cardBtn2 = window.document.querySelector('#projects-grid button[onclick*="startProject(2,"]');
  check(cardBtn2.textContent === 'Tentar novamente' && cardBtn2.disabled === false,
    'falha ao concluir o projeto devolve o botão com Tentar novamente');
  check(toastText().includes('Não foi possível salvar o projeto. Verifique sua conexão e tente novamente.'),
    'falha ao concluir o projeto mostra o toast de erro');

  window.openBriefing(999);
  check(toastText().includes('Briefing indisponível para este projeto.'),
    'projeto sem briefing mostra toast em vez de abrir modal vazio');

  check(window.escJsStr("O'Brien") === "O\\'Brien" && window.escJsStr('a\\b') === 'a\\\\b',
    'escJsStr escapa apóstrofos e barras para uso em onclick inline');

  check(passed === 54, 'verificacao-extra contém 55 verificações');
  console.log(`\n${passed} verificações passaram.`);
  window.close();
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});

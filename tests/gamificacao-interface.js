// Estados, privacidade e concorrência das telas, com backend simulado.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; console.log(`✓ ${message}`); }

(async () => {
  const dom = new JSDOM(read('index.html'), { url: 'https://joaocaetano19.github.io/TCC/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  const el = id => w.document.getElementById(id);
  const clone = data => JSON.parse(JSON.stringify(data));
  w.console.warn = () => {}; w.lucide = { createIcons() {} };
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  const profiles = {
    a: { id: 'a', name: 'Ana', age: 18, email: 'ana@exemplo.com', level: 1, xp: 90, quiz_done: true, portfolio_public: false, is_admin: false },
    b: { id: 'b', name: 'Bia', age: 18, email: 'bia@exemplo.com', level: 4, xp: 350, quiz_done: true, portfolio_public: false, is_admin: false }
  };
  const saved = {
    a: { theme: 'original', frame: 'simples', ranking_joined: false, ranking_alias: null },
    b: { theme: 'aurora', frame: 'violeta', ranking_joined: false, ranking_alias: null }
  };
  let selected = 'a', signedIn = null, rankingCalls = 0, appearanceCalls = 0, participationCalls = 0;
  let appearanceWait = null, settingsWait = null, challengeWait = null, rankingWait = null, participationWait = null;
  let challengeError = false, rankingError = false, appearanceErrorAfterSave = false, joinErrorAfterSave = false;
  let challengeData = { lessons: 2, projects: 2, certificates: 1 };
  let rankingRows = [{ ranking_position: 1, alias: '<img src=x onerror=1>', xp: 450, is_self: false }, { ranking_position: 2, alias: 'Lua_Dev', xp: 100, is_self: true }];
  Object.assign(w, {
    getSession: async () => null,
    supabaseLogin: async () => { signedIn = selected; return { id: selected }; },
    supabaseLogout: async () => { signedIn = null; },
    fetchProfile: async id => clone(profiles[id]),
    fetchUserProjects: async () => [], fetchCertificates: async () => [], fetchQuizAnswers: async () => [],
    fetchCourseProgress: async () => ({ lessons: [], exercises: [], attempts: [] }), fetchAvatarSignedUrl: async () => null,
    fetchGamificationSettings: async () => { const wait = settingsWait; if (wait) return wait.promise; return clone(saved[signedIn]); },
    saveProfileAppearance: async (theme, frame) => {
      appearanceCalls++;
      const owner = signedIn;
      if (appearanceWait) await appearanceWait.promise;
      saved[owner].theme = theme; saved[owner].frame = frame;
      if (appearanceErrorAfterSave) throw new Error('resposta perdida');
      return { theme, frame };
    },
    fetchChallengeProgress: async () => { const wait = challengeWait; if (wait) return wait.promise; if (challengeError) throw new Error('rede'); return clone(challengeData); },
    setRankingParticipation: async (join, alias) => {
      participationCalls++;
      const owner = signedIn;
      if (participationWait) await participationWait.promise;
      saved[owner].ranking_joined = join; saved[owner].ranking_alias = join ? alias : null;
      if (joinErrorAfterSave) throw new Error('resposta perdida');
      return { joined: join, alias: join ? alias : null };
    },
    fetchOptionalRanking: async () => { rankingCalls++; const wait = rankingWait; if (wait) return wait.promise; if (rankingError) throw new Error('rede'); return clone(rankingRows); },
    fetchPublicProfile: async () => ({ id: 'b', name: 'Bia Pública', track: 'Front-end', level: 4, xp: 350, portfolio_public: true }),
    fetchPublicProjects: async () => [], fetchPublicCertificates: async () => [],
    fetchPublicProfileAppearance: async () => ({ theme: 'aurora', frame: 'violeta' })
  });
  w.eval(read('gamification.js') + '\n' + read('course-content.js') + '\n' + read('script.js') + `\nwindow.__gamificationTest = {
    setXP(xp) { currentUser.xp = xp; currentUser.level = Math.floor(xp/100)+1; },
    state() { return { user: currentAuthId, xp: currentUser && currentUser.xp }; }
  };`);
  const login = async id => { selected = id; el('login-email').value = 'a@b.com'; el('login-password').value = '123456'; await w.handleLogin(); await tick(); await tick(); };
  try {
    await tick(); await login('a');
    w.switchTab('perfil');
    check(el('profile-customization').textContent.includes('90 XP') && el('appearance-theme-original').getAttribute('aria-pressed') === 'true', 'perfil carrega personalização e seleção padrão com XP atual');
    check(el('appearance-theme-oceano').disabled && el('appearance-frame-menta').disabled && el('profile-customization').textContent.includes('100 XP para desbloquear'), 'itens bloqueados explicam o XP necessário e não podem ser selecionados');
    await w.Gamification.chooseAppearance('theme', 'cosmos');
    check(appearanceCalls === 0 && el('profile-customization').textContent.includes('nunca comprados'), 'chamada direta pela interface não salva item bloqueado e informa que XP não é gasto');
    profiles.a.xp = 100; profiles.a.level = 2; w.__gamificationTest.setXP(100); w.renderProfile();
    appearanceWait = deferred();
    const first = w.Gamification.chooseAppearance('theme', 'oceano');
    const duplicate = w.Gamification.chooseAppearance('theme', 'oceano');
    check(appearanceCalls === 1 && el('appearance-theme-oceano').disabled, 'salvamento pendente bloqueia cliques duplicados');
    appearanceWait.resolve(); await first; await duplicate; appearanceWait = null;
    await w.Gamification.chooseAppearance('frame', 'menta');
    check(el('profile-shell').dataset.profileTheme === 'oceano' && el('prof-avatar').classList.contains('avatar-frame-menta') && el('nav-avatar').classList.contains('avatar-frame-menta'), 'tema e moldura aparecem no perfil e no avatar da navegação');
    check(el('appearance-theme-oceano').getAttribute('aria-pressed') === 'true' && el('appearance-frame-menta').getAttribute('aria-pressed') === 'true' && w.__gamificationTest.state().xp === 100, 'escolhas ficam selecionadas sem alterar o XP');
    w.switchTab('portfolio');
    check(el('portfolio-content').dataset.profileTheme === 'oceano' && el('portfolio-content').querySelector('.avatar-frame-menta'), 'portfólio próprio usa tema e moldura selecionados');
    await w.handleLogout(); await login('a'); w.switchTab('perfil');
    check(el('profile-shell').dataset.profileTheme === 'oceano' && el('prof-avatar').classList.contains('avatar-frame-menta'), 'preferências persistem após novo login');

    appearanceErrorAfterSave = true;
    await w.Gamification.chooseAppearance('theme', 'original');
    check(el('profile-customization').textContent.includes('Não foi possível confirmar') && !el('appearance-theme-original'), 'resposta perdida não é apresentada como escolha confirmada');
    appearanceErrorAfterSave = false; await w.Gamification.loadSettings();
    check(el('profile-shell').dataset.profileTheme === 'original' && el('appearance-theme-original').getAttribute('aria-pressed') === 'true', 'nova leitura reconcilia gravação que ocorreu antes da falha de rede');

    w.switchTab('desafios'); await tick();
    check(el('challenge-content').querySelectorAll('.challenge-card').length === 6 && el('challenge-content').textContent.includes('3 de 6 metas concluídas'), 'seis metas usam progresso acumulado, inclusive histórico anterior');
    check(el('challenge-content').querySelector('[data-challenge="aula-3"] progress').value === 2 && el('challenge-content').querySelector('[data-challenge="aula-3"] progress').max === 3, 'barra nativa e acessível representa o progresso da meta');
    check(el('tab-desafios').textContent.includes('não concedem XP extra') && el('tab-desafios').textContent.includes('conclusão manual'), 'metas descrevem as fontes e não prometem recompensas extras');
    check(el('ranking-content').textContent.includes('VOCÊ NÃO ESTÁ PARTICIPANDO') && rankingCalls === 0 && participationCalls === 0, 'ranking começa fora e não lê nem adere automaticamente');
    check(el('tab-desafios').textContent.includes('Somente participantes') && el('tab-desafios').textContent.includes('pode ser manipulado') && el('tab-desafios').textContent.includes('portfólio estiver privado'), 'explicação de privacidade e limitação do XP aparece antes da adesão');

    el('ranking-alias').value = 'e@x'; await w.Gamification.submitRanking();
    check(participationCalls === 0 && el('ranking-alias').getAttribute('aria-invalid') === 'true' && el('ranking-feedback').textContent.includes('sem @'), 'validação do apelido não envia e indica erro acessível');
    el('ranking-alias').value = 'Lua_Dev'; el('ranking-alias').dispatchEvent(new w.Event('input', { bubbles: true }));
    rankingWait = deferred();
    await w.Gamification.submitRanking();
    check(saved.a.ranking_joined && el('ranking-content').textContent.includes('VOCÊ ESTÁ PARTICIPANDO') && rankingCalls === 1, 'participação explícita passa a consultar a lista');
    el('ranking-alias').value = 'Novo apelido'; w.Gamification.setRankingDraft(el('ranking-alias').value); el('ranking-alias').focus();
    rankingWait.resolve(clone(rankingRows)); await tick(); rankingWait = null;
    check(el('ranking-alias').value === 'Novo apelido' && w.document.activeElement.id === 'ranking-alias', 'resposta tardia do placar preserva edição e foco do apelido');
    check(el('ranking-content').textContent.includes('<img src=x onerror=1>') && !el('ranking-content').querySelector('img') && el('ranking-content').querySelector('.ranking-row.is-self'), 'apelidos são escapados e a própria linha é identificada');
    await w.Gamification.submitRanking(); await tick();
    check(saved.a.ranking_alias === 'Novo apelido' && el('ranking-content').textContent.includes('Apelido atualizado'), 'participante pode atualizar o apelido');
    await w.Gamification.leaveRanking();
    check(!saved.a.ranking_joined && !el('ranking-content').querySelector('.ranking-list') && el('ranking-content').textContent.includes('Você saiu') && w.__gamificationTest.state().xp === 100, 'sair remove o placar e não altera o XP');

    joinErrorAfterSave = true;
    el('ranking-alias').value = 'Lua_Dev';
    await w.Gamification.submitRanking();
    check(saved.a.ranking_joined && el('ranking-content').textContent.includes('Não foi possível confirmar') && !el('ranking-content').querySelector('.ranking-list'), 'falha ambígua na adesão não inventa um estado nem exibe placar');
    joinErrorAfterSave = false; await w.Gamification.loadSettings(); await tick();
    check(el('ranking-content').textContent.includes('VOCÊ ESTÁ PARTICIPANDO') && !!el('ranking-content').querySelector('.ranking-list'), 'releitura recupera adesão que foi salva antes da falha');
    rankingError = true; await w.Gamification.loadRanking();
    check(el('ranking-content').textContent.includes('Não foi possível carregar o ranking'), 'falha na lista é exibida sem dados antigos');
    rankingError = false; await w.Gamification.loadRanking();
    check(!!el('ranking-content').querySelector('.ranking-list'), 'ranking pode ser atualizado após falha');
    const slowRanking = deferred(); rankingWait = slowRanking;
    const pendingRanking = w.Gamification.loadRanking();
    await w.Gamification.leaveRanking(); slowRanking.resolve(clone(rankingRows)); await pendingRanking; rankingWait = null;
    check(!el('ranking-content').querySelector('.ranking-list') && el('ranking-content').textContent.includes('Você saiu'), 'resposta antiga do placar não reaparece depois de sair');

    challengeError = true; await w.Gamification.loadChallenges();
    check(el('challenge-content').textContent.includes('Não foi possível carregar') && !el('challenge-content').querySelector('.challenge-card'), 'falha de progresso não inventa metas zeradas');
    challengeError = false; await w.Gamification.loadChallenges();
    check(el('challenge-content').querySelectorAll('.challenge-card').length === 6, 'tentar novamente recupera as metas');
    challengeData = { lessons: '', projects: true, certificates: null }; await w.Gamification.loadChallenges();
    check(el('challenge-content').textContent.includes('Não foi possível carregar'), 'contagens malformadas não são convertidas em progresso falso');
    challengeData = { lessons: 2, projects: 2, certificates: 1 };
    const old = deferred(); challengeWait = old; const oldLoad = w.Gamification.loadChallenges();
    challengeWait = null; challengeData = { lessons: 6, projects: 3, certificates: 1 };
    await w.Gamification.loadChallenges(); old.resolve({ lessons: 0, projects: 0, certificates: 0 }); await oldLoad;
    check(el('challenge-content').textContent.includes('6 de 6 metas concluídas'), 'resposta antiga de progresso não sobrescreve atualização mais recente');

    await w.renderPublicPortfolio('b');
    check(el('public-portfolio').querySelector('[data-profile-theme="aurora"]') && el('public-portfolio').querySelector('.avatar-frame-violeta'), 'portfólio público aplica somente aparência recebida e permitida pelo XP');
    w.fetchPublicProfileAppearance = async () => ({ theme: 'cosmos" onmouseover="alert(1)', frame: 'solar' });
    await w.renderPublicPortfolio('b');
    check(el('public-portfolio').querySelector('[data-profile-theme="original"]') && !el('public-portfolio').querySelector('[onmouseover]') && !el('public-portfolio').querySelector('.avatar-frame-solar'), 'IDs desconhecidos e molduras acima do XP não injetam atributos nem são aplicados');
    w.fetchPublicProfileAppearance = async () => { throw new Error('migração ausente'); };
    await w.renderPublicPortfolio('b');
    check(el('public-portfolio').textContent.includes('Bia Pública') && el('public-portfolio').querySelector('[data-profile-theme="original"]'), 'portfólio continua disponível no estilo original se aparência pública falhar');
    const oldPublic = deferred();
    w.fetchPublicProfile = async id => ({ id, name: id === 'old' ? 'Perfil antigo' : 'Perfil novo', xp: 350, level: 4, portfolio_public: true });
    w.fetchPublicProfileAppearance = async id => id === 'old' ? oldPublic.promise : { theme: 'aurora', frame: 'violeta' };
    const oldView = w.renderPublicPortfolio('old'); await oldView;
    check(el('public-portfolio').textContent.includes('Perfil antigo') && el('public-portfolio').querySelector('[data-profile-theme="original"]'), 'aparência lenta não impede o carregamento do portfólio');
    await w.renderPublicPortfolio('new'); oldPublic.resolve({ theme: 'oceano', frame: 'menta' }); await tick();
    check(el('public-portfolio').textContent.includes('Perfil novo') && el('public-portfolio').querySelector('[data-profile-theme="aurora"]') && !el('public-portfolio').textContent.includes('Perfil antigo'), 'aparência antiga não substitui portfólio aberto mais recentemente');

    // Uma leitura antiga da mesma conta não pode preencher uma sessão nova.
    await w.handleLogout();
    const pendingSettings = deferred(); settingsWait = pendingSettings;
    await login('a');
    await w.handleLogout(); settingsWait = null; await login('b'); w.switchTab('perfil');
    pendingSettings.resolve({ theme: 'cosmos', frame: 'solar', ranking_joined: true, ranking_alias: 'Outra pessoa' }); await tick();
    check(w.__gamificationTest.state().user === 'b' && el('profile-shell').dataset.profileTheme === 'aurora' && el('prof-avatar').classList.contains('avatar-frame-violeta'), 'preferências atrasadas não vazam para outra conta');
    check(!el('appearance-theme-aurora').disabled && !el('appearance-frame-violeta').disabled && el('appearance-theme-cosmos').disabled && el('appearance-frame-solar').disabled, 'interface respeita os limiares intermediários e superiores de XP');
    w.switchTab('desafios'); await tick();
    check(el('ranking-content').textContent.includes('VOCÊ NÃO ESTÁ PARTICIPANDO') && !el('ranking-content').textContent.includes('Outra pessoa'), 'nova conta não herda participação ou apelido de sessão anterior');

    // Também invalida a resposta de uma gravação depois de trocar de conta.
    participationWait = deferred(); el('ranking-alias').value = 'Bia_Dev';
    const oldJoin = w.Gamification.submitRanking();
    await w.handleLogout(); await login('a'); w.switchTab('desafios'); await tick();
    participationWait.resolve(); await oldJoin; participationWait = null;
    check(w.__gamificationTest.state().user === 'a' && !el('ranking-content').textContent.includes('Bia_Dev'), 'adesão pendente de outra conta não altera a tela da sessão atual');

    // A foto recebe a moldura: uma assinatura pendente não pode levar a
    // imagem de uma conta para outra após uma troca de sessão.
    await w.handleLogout();
    const oldPhoto = deferred(); profiles.a.avatar_url = 'a/avatar.png'; profiles.b.avatar_url = null;
    w.fetchAvatarSignedUrl = async path => path === 'a/avatar.png' ? oldPhoto.promise : null;
    await login('a'); await w.handleLogout(); await login('b'); w.switchTab('perfil');
    oldPhoto.resolve('https://exemplo.test/foto-privada-ana.png'); await tick();
    check(!el('nav-avatar').querySelector('img') && !el('prof-avatar').querySelector('img') && el('prof-avatar').textContent.trim() === 'B', 'foto assinada atrasada não aparece na conta seguinte');

    let removals = 0;
    w.removeAvatar = async () => { removals++; };
    await w.handleLogout(); w.fetchAvatarSignedUrl = async () => null; await login('a');
    const pendingRemoval = w.removeProfileAvatar(); await tick();
    await w.handleLogout(); await login('b'); w.resolveConfirm(true); await pendingRemoval;
    check(removals === 0 && w.__gamificationTest.state().user === 'b', 'confirmação de remoção antiga não age sobre a nova sessão');

    await w.handleLogout(); await login('a');
    const pendingUpload = deferred();
    w.uploadAvatar = async () => pendingUpload.promise;
    await w.handleAvatarFileChange({ target: { files: [{ name: 'nova.png', type: 'image/png', size: 1024 }], value: '' } });
    const oldSave = w.saveAvatar();
    await w.handleLogout(); await login('b'); w.switchTab('perfil');
    pendingUpload.resolve(); await oldSave;
    check(w.__gamificationTest.state().user === 'b' && el('prof-name').textContent === 'Bia' && !el('btn-avatar-save').disabled, 'upload atrasado não altera a nova sessão nem mantém o botão bloqueado');
    console.log(`\n${checks} verificações de interface da gamificação passaram.`);
  } finally { dom.window.close(); }
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });

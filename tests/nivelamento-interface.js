// Fluxo do diagnóstico inicial: navegação, erros, resultado e sessões.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
};
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; console.log(`✓ ${message}`); }

(async () => {
  const dom = new JSDOM(read('index.html'), { url: 'https://joaocaetano19.github.io/TCC/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.console.warn = () => {};
  w.lucide = { createIcons() {} };
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  let loginId = 'u1';
  const profiles = {
    u1: { id: 'u1', name: 'Ana Souza', email: 'ana@exemplo.com', age: 18, level: 1, xp: 0, track: null, goal: null, quiz_done: false, is_admin: false },
    u2: { id: 'u2', name: 'Bruno Lima', email: 'bruno@exemplo.com', age: 19, level: 1, xp: 50, track: 'Back-end', goal: 'Freelancer', quiz_done: true, is_admin: false }
  };
  const saved = {
    u1: [],
    u2: [{ question: 1, answer: 'Já sei o básico' }, { question: 2, answer: 'Back-end' }, { question: 3, answer: 'Freelancer' }]
  };
  let delayedRows = deferred();
  let saveGate = null;
  let slowProfile = null;
  let saveCalls = 0;
  let subjectOpened = null;
  Object.assign(w, {
    getSession: async () => null,
    supabaseLogin: async () => ({ id: loginId }), supabaseLogout: async () => {},
    fetchProfile: async id => { if (slowProfile && id === 'u1') await slowProfile.promise; return { ...profiles[id] }; },
    fetchUserProjects: async () => [], fetchCertificates: async () => [],
    fetchQuizAnswers: async id => {
      if (id === 'u1' && delayedRows) { const gate = delayedRows; await gate.promise; return []; }
      return saved[id].map(row => ({ ...row }));
    },
    fetchCourseProgress: async () => ({ lessons: [], exercises: [], attempts: [] }),
    fetchAvatarSignedUrl: async () => null,
    awardSubjectViewXP: async id => { subjectOpened = id; },
    awardQuizXP: async (answers, track, goal) => {
      const id = loginId;
      saveCalls++;
      if (saveGate) await saveGate.promise;
      if (!profiles[id].quiz_done) profiles[id].xp += 50;
      profiles[id].track = track; profiles[id].goal = goal; profiles[id].quiz_done = true;
      saved[id] = Array.from(answers, (answer, i) => ({ question: i + 1, answer }));
    },
    fetchPublicProfile: async () => null, fetchPublicProjects: async () => [], fetchPublicCertificates: async () => []
  });
  w.eval(read('course-content.js') + '\n' + read('script.js') + `\nwindow.__quizTest = {
    user: () => currentUser,
    rows: () => userQuizRows.slice(),
    answers: () => quizAnswers.slice(),
    phase: () => quizPhase,
    setRows: rows => { userQuizRows = rows; },
    recommended: () => recommendedTrack()
  };`);
  const el = id => w.document.getElementById(id);
  const text = () => el('quiz-steps').textContent;
  const modalOpen = () => !el('quiz-modal').classList.contains('hidden');
  const login = async () => {
    el('login-email').value = 'ana@exemplo.com'; el('login-password').value = '123456';
    await w.handleLogin(); await tick();
  };
  const answer = async (step, option) => { w.selectQuizAnswer(step, option); await w.nextQuizStep(); };
  try {
    await tick(); await login();
    check(modalOpen() && text().includes('Sobre você') && text().includes('Desafios rápidos'), 'novo usuário recebe apresentação com perfil e desafios');
    check(text().includes('não é uma prova') && text().includes('Continuar depois') && text().includes('salvas ao finalizar') && text().includes('administradores autorizados'), 'introdução explica o caráter formativo, a gravação e quem acessa as respostas');
    check(el('quiz-modal').getAttribute('aria-modal') === 'true' && el('quiz-modal').getAttribute('aria-labelledby') === 'quiz-dialog-title', 'diálogo tem rótulo acessível');
    w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    check(!modalOpen() && saveCalls === 0, 'é possível adiar o diagnóstico sem gravar ou conceder XP');
    check(el('main-app').contains(w.document.activeElement), 'ao adiar, o foco retorna ao aplicativo');
    w.switchTab('perfil');
    check(el('prof-nivelamento').textContent.includes('Iniciar diagnóstico'), 'Perfil permite iniciar o diagnóstico adiado');
    w.showQuiz(); w.startQuiz();
    check(text().includes('1 de 10') && el('quiz-next').disabled, 'primeira pergunta mostra progresso e exige uma seleção');
    check(el('quiz-steps').querySelectorAll('input[type=radio]').length === 3 && el('quiz-steps').querySelector('fieldset legend'), 'alternativas usam radio buttons e legenda semântica');
    w.nextQuizStep();
    check(text().includes('Escolha uma opção') && text().includes('1 de 10'), 'não avança sem resposta mesmo por chamada direta');
    el('quiz-close').focus();
    const reverseTab = new w.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    w.document.dispatchEvent(reverseTab);
    check(reverseTab.defaultPrevented && el('quiz-modal').contains(w.document.activeElement), 'Tab reverso permanece dentro do diálogo');
    w.selectQuizAnswer(0, 0);
    check(!el('quiz-next').disabled && el('quiz-option-0-0').checked, 'selecionar libera a próxima etapa');
    await w.nextQuizStep(); w.selectQuizAnswer(1, 0); w.previousQuizStep();
    check(text().includes('1 de 10') && el('quiz-option-0-0').checked, 'voltar mantém a resposta anterior');
    await w.nextQuizStep();
    check(el('quiz-option-1-0').checked, 'voltar e avançar mantém a seleção seguinte');
    w.selectQuizAnswer(0, 2);
    check(el('quiz-option-1-0').checked, 'resposta fora da etapa atual é ignorada');
    await w.nextQuizStep(); await answer(2, 0); await answer(3, 0); await answer(4, 0);
    check(el('quiz-steps').innerHTML.includes('&lt;nav&gt;') && !el('quiz-steps').querySelector('nav'), 'alternativas de código aparecem escapadas');
    await answer(5, 1); await answer(6, 0); await answer(7, 2); await answer(8, 2);
    w.selectQuizAnswer(9, 3);
    check(text().includes('10 de 10') && el('quiz-option-9-3').checked, 'último desafio aceita Ainda não sei');

    saveGate = deferred();
    const first = w.nextQuizStep();
    w.nextQuizStep();
    check(saveCalls === 1 && el('quiz-close').disabled && el('quiz-steps').querySelector('fieldset').disabled, 'envio pendente bloqueia cliques concorrentes e edição');
    w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    check(modalOpen(), 'envio pendente não pode ser fechado antes da confirmação');
    saveGate.reject(new Error('rede indisponível'));
    await first;
    check(modalOpen() && text().includes('Não foi possível salvar') && el('quiz-option-9-3').checked && !el('quiz-next').disabled, 'falha preserva respostas e permite tentar novamente');
    check(!profiles.u1.quiz_done && profiles.u1.xp === 0 && w.__quizTest.rows().length === 0, 'falha não inventa conclusão ou recompensa');
    saveGate = null;
    slowProfile = deferred();
    await w.nextQuizStep();
    check(text().includes('3/6') && text().includes('1 resposta ficou') && text().includes('Revise seus desafios'), 'resultado separa acertos, dúvidas e explicações');
    check(text().includes('Resposta correta: 5') && text().includes('Como 2 é maior ou igual'), 'feedback mostra resposta correta e motivo');
    const recommendations = [...el('quiz-steps').querySelectorAll('.quiz-recommendation-list button')].map(button => button.textContent);
    check(recommendations.length === 3 && recommendations[0].includes('CSS') && recommendations[1].includes('Lógica') && recommendations[2].includes('SQL'), 'recomendações priorizam lacunas e área escolhida');
    check(profiles.u1.quiz_done && profiles.u1.xp === 50 && w.__quizTest.rows().length === 10, 'conclusão salva dez respostas e concede a recompensa uma vez');
    check(w.__quizTest.phase() === 'result', 'resultado aparece sem esperar a leitura lenta do perfil');
    delayedRows.resolve(); delayedRows = null;
    await tick(); await tick();
    check(w.__quizTest.rows().length === 10, 'leitura antiga do perfil não apaga respostas recém-salvas');
    w.closeQuiz();
    check(!modalOpen() && el('prof-nivelamento').textContent.includes('3 de 6 acertos'), 'Perfil mostra o diagnóstico após fechar');
    slowProfile.resolve(); slowProfile = null; await tick(); await tick();
    check(el('dash-xp').textContent === '50 XP', 'atualização de perfil reflete a recompensa no dashboard');
    check(el('dash-recommendation').textContent.includes('CSS'), 'dashboard apresenta o próximo curso sugerido pelo diagnóstico');
    check(w.__quizTest.recommended()[0] === 'css', 'Centro de Estudos usa as respostas para priorizar uma lacuna');
    w.showQuizResultFromProfile();
    check(modalOpen() && text().includes('3/6'), 'resultado e feedback podem ser reabertos pelo Perfil');
    w.openQuizRecommendation('css'); await tick();
    check(!modalOpen() && subjectOpened === 'css' && el('tab-estudos').classList.contains('active'), 'sugestão abre diretamente o curso escolhido');

    w.switchTab('perfil'); w.showQuiz(); w.startQuiz();
    const allCorrect = [0, 0, 0, 1, 2, 1, 1, 2, 2, 1];
    for (let i = 0; i < allCorrect.length; i++) await answer(i, allCorrect[i]);
    await tick();
    check(text().includes('6/6') && profiles.u1.xp === 50, 'refazer pode mudar o resultado sem adicionar XP no fluxo');
    w.closeQuiz();
    check(el('prof-nivelamento').textContent.includes('6 de 6 acertos'), 'Perfil passa a mostrar o resultado mais recente');

    // Um retorno atrasado de outro login não pode exibir resultados na sessão atual.
    w.showQuiz(); w.startQuiz();
    for (let i = 0; i < allCorrect.length - 1; i++) await answer(i, allCorrect[i]);
    w.selectQuizAnswer(9, allCorrect[9]);
    saveGate = deferred();
    const pending = w.nextQuizStep();
    await w.handleLogout();
    loginId = 'u2';
    await login();
    saveGate.resolve(); saveGate = null;
    await pending; await tick();
    w.switchTab('perfil');
    check(w.__quizTest.user().id === 'u2' && !modalOpen() && !el('prof-nivelamento').textContent.includes('6 de 6 acertos'), 'resposta atrasada não vaza para outra sessão');
    check(el('prof-nivelamento').textContent.includes('respostas anteriores foram mantidas') && el('prof-nivelamento').textContent.includes('Back-end'), 'contas antigas mantêm as três respostas e podem refazer');
    w.__quizTest.setRows([{ question: 1, answer: '<img src=x onerror=alert(1)>' }]);
    w.renderNivelamento();
    check(el('prof-nivelamento').textContent.includes('<img src=x onerror=alert(1)>') && !el('prof-nivelamento').querySelector('img'), 'respostas armazenadas são exibidas sem executar HTML');
    console.log(`\n${checks} verificações da interface de nivelamento passaram.`);
  } finally {
    w.close();
  }
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });

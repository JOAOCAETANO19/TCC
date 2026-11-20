// Interface e execução dos cinco laboratórios, com DOM e backend simulados.
// O teste do isolamento real do navegador é complementar: jsdom não aplica CSP.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const solutions = require('./fixtures/projetos-solucoes');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const deferred = () => { let resolve, reject; const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; }); return { promise, resolve, reject }; };
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; console.log(`✓ ${message}`); }

// Executa o documento do iframe em um DOM separado, usando somente soluções
// controladas pelo teste. A política de origem/CSP exige navegador real.
async function executeFrame(html) {
  return new Promise((resolve, reject) => {
    const console = new VirtualConsole();
    const errors = [];
    console.on('jsdomError', error => errors.push(error.message));
    let dom;
    const timeout = setTimeout(() => { if (dom) dom.window.close(); reject(new Error('O laboratório não terminou em 16 segundos')); }, 16000);
    dom = new JSDOM(html, {
      url: 'https://iframe.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: console,
      beforeParse(window) {
        window.postMessage = message => {
          if (message.type !== 'results' && message.type !== 'fatal') return;
          clearTimeout(timeout);
          setTimeout(() => { dom.window.close(); resolve({ message, errors }); }, 0);
        };
      }
    });
  });
}

async function executePreview(html) {
  return new Promise((resolve, reject) => {
    let dom;
    const timeout = setTimeout(() => { if (dom) dom.window.close(); reject(new Error('Prévia não iniciou')); }, 5000);
    dom = new JSDOM(html, {
      url: 'https://iframe.test/', runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(window) {
        window.postMessage = message => {
          if (message.type !== 'ready') return;
          clearTimeout(timeout);
          setTimeout(() => {
            const result = { ...dom.window.document.body.dataset };
            dom.window.close(); resolve(result);
          }, 0);
        };
      }
    });
  });
}

(async () => {
  const dom = new JSDOM(read('index.html'), { url: 'https://joaocaetano19.github.io/TCC/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.console.warn = () => {};
  w.lucide = { createIcons() {} };
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  const profiles = {
    u1: { id: 'u1', name: 'Ana Souza', email: 'ana@example.com', age: 18, level: 1, xp: 0, track: 'Front-end', goal: 'Estágio em 6 meses', quiz_done: true, is_admin: false },
    u2: { id: 'u2', name: 'Bruno Lima', email: 'bruno@example.com', age: 19, level: 1, xp: 20, track: 'Back-end', goal: 'Freelancer', quiz_done: true, is_admin: false }
  };
  let awardCalls = [], awardFailure = false, awardGate = null, projectLoadGate = null;
  Object.assign(w, {
    getSession: async () => null, supabaseLogout: async () => {},
    fetchProfile: async id => ({ ...profiles[id] }),
    fetchUserProjects: async () => projectLoadGate ? projectLoadGate.promise : [],
    fetchCertificates: async () => [], fetchQuizAnswers: async () => [],
    fetchCourseProgress: async () => ({ lessons: [], exercises: [], attempts: [] }), fetchAvatarSignedUrl: async () => null,
    awardProjectXP: async id => {
      awardCalls.push(id);
      if (awardGate) await awardGate.promise;
      if (awardFailure) throw new Error('rede indisponível');
      profiles.u1.xp = 100;
    },
    fetchPublicProfile: async () => null, fetchPublicProjects: async () => [], fetchPublicCertificates: async () => []
  });
  w.eval(read('course-content.js') + '\n' + read('script.js') + '\n' + read('project-labs.js') + `\nwindow.__labsTest = {
    user: () => currentUser,
    completed: () => completedProjects.slice(),
    setSession: (user, completed = []) => { currentUser = user; currentAuthId = user.id; completedProjects = completed; },
    setCompleted: rows => { completedProjects = rows; }
  };`);
  const el = id => w.document.getElementById(id);
  const status = () => el('project-lab-test-status').textContent;
  const setCode = (part, value) => { const input = el('lab-code-' + part); input.value = value; input.dispatchEvent(new w.Event('input', { bubbles: true })); };
  const currentFrame = () => el('project-lab-test-slot').querySelector('iframe');
  const sendResult = (frame, message, source = frame.contentWindow) => w.dispatchEvent(new w.MessageEvent('message', { source, data: message }));
  const tokenOf = frame => {
    const match = frame.srcdoc.match(/"mode":"test","id":\d+,"token":"([a-f0-9]+)"/);
    assert.ok(match, 'token do ambiente de teste'); return match[1];
  };
  async function runFrameAndDeliver(frame) {
    const result = await executeFrame(frame.srcdoc);
    check(!result.errors.length && result.message.type === 'results', 'ambiente de teste executa sem erro interno');
    sendResult(frame, result.message);
    return result.message;
  }

  try {
    await tick();
    w.__labsTest.setSession({ ...profiles.u1 });
    el('main-app').classList.remove('hidden');
    w.switchTab('projetos');
    const grid = el('projects-grid');
    check([1, 2, 3, 4, 6].every(id => grid.querySelector(`button[onclick="openProjectLab(${id})"]`)), 'os cinco projetos viáveis têm laboratório no site');
    check([5, 7, 8, 9].every(id => grid.querySelector(`button[onclick^="startProject(${id},"]`)) && grid.textContent.includes('Conclusão manual'), 'os quatro projetos com backend preservam conclusão manual identificada');
    const manualButton = w.document.createElement('button');
    await w.startProject(1, 'Calculadora', manualButton);
    check(awardCalls.length === 0 && el('toast-container').textContent.includes('Passe nos testes'), 'interface não conclui projeto de laboratório antes dos testes');

    w.openBriefing(1);
    check(el('briefing-start-btn').textContent === 'Abrir laboratório', 'briefing da calculadora encaminha ao laboratório');
    el('briefing-start-btn').click();
    check(!el('project-lab').classList.contains('hidden') && el('projects-overview').classList.contains('hidden') && el('project-lab-title').textContent === 'Calculadora', 'laboratório abre a partir do briefing');
    check(w.document.activeElement === el('project-lab-title'), 'foco vai para o título do laboratório');
    const previewSandbox = el('project-lab-preview').getAttribute('sandbox').split(/\s+/);
    check(previewSandbox.includes('allow-scripts') && previewSandbox.includes('allow-forms') && !previewSandbox.includes('allow-same-origin') && el('project-lab-preview').getAttribute('referrerpolicy') === 'no-referrer', 'prévia permite formulários e usa sandbox sem acesso à mesma origem');
    const starter = { html: el('lab-code-html').value, css: el('lab-code-css').value, js: el('lab-code-js').value };
    check(el('project-lab-preview').srcdoc.includes("connect-src 'none'") && el('project-lab-preview').srcdoc.includes("form-action 'none'"), 'prévia restringe rede e envio de formulários');
    check(el('lab-tab-html').getAttribute('aria-selected') === 'true' && !el('lab-panel-html').hidden && el('lab-panel-js').hidden, 'editor tem abas e rótulos acessíveis');
    el('lab-tab-html').dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    check(el('lab-tab-css').getAttribute('aria-selected') === 'true' && !el('lab-panel-css').hidden && w.document.activeElement === el('lab-tab-css'), 'abas permitem navegação por teclado');
    w.selectProjectLabTab('js');
    const previewFrame = el('project-lab-preview');
    const previewToken = previewFrame.srcdoc.match(/"mode":"preview","id":\d+,"token":"([a-f0-9]+)"/)[1];
    sendResult(previewFrame, { channel: 'pratica-lab', token: previewToken, type: 'runtime-error', message: 'Erro de exemplo' });
    sendResult(previewFrame, { channel: 'pratica-lab', token: previewToken, type: 'ready' });
    check(el('project-lab-preview-status').textContent.includes('Erro de exemplo'), 'erro de execução não é escondido pela mensagem de prévia pronta');
    const malicious = '</script><script>parent.document.body.dataset.pwned="yes"</script>';
    setCode('html', malicious);
    sendResult(previewFrame, { channel: 'pratica-lab', token: previewToken, type: 'ready' });
    check(el('project-lab-preview-status').textContent.includes('código mudou'), 'mensagem antiga da prévia não esconde uma edição pendente');
    w.runProjectLabPreview();
    check(el('project-lab-preview').srcdoc.includes('\\u003c/script\\u003e') && !el('project-lab-preview').srcdoc.includes(malicious), 'código com fechamento de script é serializado sem escapar do iframe');
    setCode('html', starter.html);
    setCode('js', `
      localStorage.clear();
      localStorage.setItem('primeiro', 'a'.repeat(19000)); localStorage.setItem('segundo', 'b'.repeat(19000));
      localStorage.setItem('primeiro', 'c'.repeat(19000));
      document.body.dataset.replaced = String(localStorage.getItem('primeiro').startsWith('c'));
      localStorage.clear();
      for (let i = 0; i < 100; i++) localStorage.setItem('chave' + i, 'ok');
      try { localStorage.setItem('excesso', 'valor'); } catch (_) { document.body.dataset.limited = 'true'; }
      document.body.dataset.total = String(localStorage.length);
    `);
    w.runProjectLabPreview();
    const quota = await executePreview(el('project-lab-preview').srcdoc);
    check(quota.replaced === 'true' && quota.limited === 'true' && quota.total === '100', 'armazenamento virtual permite substituir valores e sinaliza excesso de chaves');
    const activePreviewToken = previewFrame.srcdoc.match(/"mode":"preview","id":\d+,"token":"([a-f0-9]+)"/)[1];
    const originalSetItem = w.Storage.prototype.setItem;
    w.Storage.prototype.setItem = function () { throw new Error('Armazenamento indisponível'); };
    sendResult(previewFrame, { channel: 'pratica-lab', token: activePreviewToken, type: 'storage', storage: { chave: 'valor' } });
    sendResult(previewFrame, { channel: 'pratica-lab', token: activePreviewToken, type: 'ready' });
    check(el('project-lab-preview-status').textContent.includes('Não foi possível salvar'), 'falha ao guardar dados da prévia permanece visível');
    w.runProjectLabPreview();
    check(el('project-lab-save').textContent.includes('Não foi possível salvar'), 'falha ao guardar rascunho orienta copiar o código');
    w.Storage.prototype.setItem = originalSetItem;
    setCode('js', '// rascunho da Ana');
    check(el('project-lab-preview-status').textContent.includes('código mudou'), 'edição avisa que a prévia precisa ser atualizada');
    w.dispatchEvent(new w.Event('pagehide'));
    check(JSON.parse(w.localStorage.getItem('pratica.lab.draft.v1:u1:1')).js === '// rascunho da Ana', 'fechar ou recarregar a página salva o rascunho pendente');
    w.closeProjectLab(); w.openProjectLab(1);
    check(el('lab-code-js').value === '// rascunho da Ana', 'rascunho é recuperado neste navegador ao reabrir');
    w.ProjectLab.reset(); w.__labsTest.setSession({ ...profiles.u2 }); w.openProjectLab(1);
    check(el('lab-code-js').value !== '// rascunho da Ana', 'rascunhos são separados por conta no navegador');
    w.ProjectLab.reset(); w.__labsTest.setSession({ ...profiles.u1 }); w.openProjectLab(1);
    check(el('lab-code-js').value === '// rascunho da Ana', 'trocar de conta não apaga o rascunho anterior');
    let restore = w.ProjectLab.restoreStarter(); w.resolveConfirm(false); await restore;
    check(el('lab-code-js').value === '// rascunho da Ana', 'cancelar restauração preserva o rascunho');
    restore = w.ProjectLab.restoreStarter(); w.resolveConfirm(true); await restore;
    check(el('lab-code-js').value === starter.js && status().includes('restaurado'), 'restaurar após confirmação substitui o código inicial');

    setCode('js', ''); w.testProjectLab();
    let frame = currentFrame();
    const testSandbox = frame.getAttribute('sandbox').split(/\s+/);
    check(testSandbox.includes('allow-forms') && testSandbox.includes('allow-scripts') && !testSandbox.includes('allow-same-origin') && frame.srcdoc.includes("form-action 'none'"), 'testes usam sandbox com formulários e sem acesso à origem');
    const correctToken = tokenOf(frame);
    const fake = { channel: 'pratica-lab', token: correctToken, type: 'results', results: [{ name: 'falso', passed: true, detail: '' }] };
    sendResult(frame, fake, w); sendResult(frame, { ...fake, token: 'errado' }); sendResult(frame, fake);
    check(el('project-lab-complete').disabled && status().includes('Executando'), 'mensagens de outra origem, token incorreto ou relatório parcial são ignorados');
    const bad = await runFrameAndDeliver(frame);
    check(bad.results.some(result => !result.passed) && el('project-lab-complete').disabled && status().includes('Revise'), 'código incompleto falha com feedback e não libera conclusão');
    w.testProjectLab(); frame = currentFrame();
    const staleFrame = frame, staleToken = tokenOf(frame);
    setCode('js', '// nova edição');
    sendResult(staleFrame, { ...fake, token: staleToken });
    check(!currentFrame() && el('project-lab-complete').disabled && status().includes('código mudou'), 'editar cancela o teste antigo e impede resultado atrasado');
    w.closeProjectLab();

    for (const id of [2, 3, 4, 6]) {
      w.openProjectLab(id); w.testProjectLab(); frame = currentFrame();
      const first = await runFrameAndDeliver(frame);
      if (id === 2 || id === 6) await runFrameAndDeliver(currentFrame());
      check(first.results.some(result => !result.passed) && el('project-lab-complete').disabled, `código inicial incompleto não é aprovado no projeto ${id}`);
      w.closeProjectLab();
    }

    // Cada solução de referência passa pelos testes realmente executados em
    // um DOM separado; lista e quiz também passam por uma segunda inicialização.
    const previewData = JSON.stringify({ sentinela: 'não alterar' });
    w.localStorage.setItem('pratica.lab.storage.v1:u1:2', previewData);
    for (const id of [1, 2, 3, 4, 6]) {
      w.openProjectLab(id);
      if (id === 1) { setCode('html', starter.html); setCode('css', starter.css); }
      setCode('js', solutions[id]);
      w.testProjectLab(); frame = currentFrame();
      const first = await runFrameAndDeliver(frame);
      check(first.results.every(result => result.passed), `solução funcional passa nos testes iniciais do projeto ${id}`);
      if (id === 2 || id === 6) {
        frame = currentFrame();
        check(!!frame && frame.srcdoc.includes('"phase":"restore"'), `projeto ${id} é reiniciado para verificar persistência`);
        const restored = await runFrameAndDeliver(frame);
        check(restored.results.every(result => result.passed), `dados do projeto ${id} sobrevivem ao recarregamento`);
      }
      if (id === 2) check(w.localStorage.getItem('pratica.lab.storage.v1:u1:2') === previewData, 'dados dos testes não alteram o armazenamento da prévia');
      check(!el('project-lab-complete').disabled && /testes passaram/.test(status()), `testes concluídos liberam o botão do projeto ${id}`);
      if (id === 1) {
        projectLoadGate = deferred();
        const slowLoad = w.loadUserExtras('u1');
        awardFailure = true;
        await w.ProjectLab.complete();
        check(!w.__labsTest.completed().includes(1) && !el('project-lab-complete').disabled && el('toast-container').textContent.includes('Não foi possível salvar'), 'falha da rede não inventa conclusão e permite tentar de novo');
        awardFailure = false;
        await w.ProjectLab.complete();
        check(w.__labsTest.completed().includes(1) && el('project-lab-complete').disabled && el('project-lab-complete').textContent.includes('já concluído'), 'conclusão só aparece após confirmação do backend');
        projectLoadGate.resolve([]); await slowLoad; projectLoadGate = null;
        check(w.__labsTest.completed().includes(1), 'leitura atrasada não apaga a conclusão recém-confirmada');
        const calls = awardCalls.length;
        await w.ProjectLab.complete();
        check(awardCalls.length === calls, 'projeto concluído não pede XP novamente');
      }
      if (id === 3) {
        awardGate = deferred();
        const delayed = w.ProjectLab.complete();
        w.switchTab('dashboard'); w.switchTab('projetos'); w.openProjectLab(4);
        check(el('project-lab-complete').disabled && el('project-lab-complete').textContent === 'Concluir projeto', 'outro laboratório começa sem aprovação enquanto a gravação está pendente');
        awardGate.resolve(); awardGate = null; await delayed;
        check(w.__labsTest.completed().includes(3) && el('project-lab-title').textContent === 'Dashboard Analytics' && el('project-lab-complete').disabled && el('project-lab-complete').textContent === 'Concluir projeto', 'conclusão atrasada não altera botão de outro laboratório na mesma conta');
      }
      if (id === 4) {
        setCode('js', solutions[id] + '\n// alteração depois da aprovação');
        check(el('project-lab-complete').disabled && status().includes('código mudou'), 'alterar código aprovado invalida a aprovação imediatamente');
      }
      if (id !== 6) w.closeProjectLab();
    }

    // Uma confirmação tardia da conta anterior não deve afetar a sessão atual.
    awardGate = deferred();
    const pending = w.ProjectLab.complete();
    check(el('lab-code-js').disabled, 'edição fica bloqueada durante a conclusão');
    await w.handleLogout();
    w.__labsTest.setSession({ ...profiles.u2 }); w.switchTab('projetos'); w.openProjectLab(1);
    check(!el('lab-code-js').disabled && !w.__labsTest.completed().includes(6), 'outra conta abre laboratório sem herdar a conclusão pendente');
    awardGate.resolve(); awardGate = null; await pending; await tick();
    check(w.__labsTest.user().id === 'u2' && !w.__labsTest.completed().includes(6), 'resposta atrasada não altera a nova sessão');
    check(el('project-lab').textContent.includes('não comprovam autoria') && el('project-lab').textContent.includes('apenas neste navegador'), 'interface explica limites dos testes e armazenamento local');
    w.ProjectLab.reset();
    console.log(`\n${checks} verificações dos laboratórios de projetos passaram.`);
  } finally {
    w.close();
  }
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });

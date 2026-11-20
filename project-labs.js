// Laboratórios locais de projetos. A prévia e os testes rodam em iframes
// de origem opaca. Os testes são formativos: não são uma verificação segura
// para certificados ou uma proteção contra manipulação do XP.
(() => {
  'use strict';

  const baseCSS = `* { box-sizing: border-box; }
body { margin: 0; padding: 24px; font-family: Arial, sans-serif; background: #f2f5fa; color: #172337; }
main { max-width: 640px; margin: auto; padding: 22px; background: white; border-radius: 14px; }
button, input, select { font: inherit; padding: 9px; }
button { cursor: pointer; }
`;
  const labs = {
    1: {
      title: 'Calculadora',
      intro: 'Crie uma calculadora com operações básicas e veja o resultado na prévia.',
      goal: 'Implemente a lógica dos botões para realizar as quatro operações.',
      requirements: ['Somar, subtrair, multiplicar e dividir.', 'Limpar o visor, apagar o último dígito e tratar divisão por zero.', 'Use o visor para mostrar números e mensagens de erro.'],
      contract: 'Para os testes reconhecerem sua interface, mantenha o id display e os atributos data-key dos botões. O JavaScript deve ficar na aba JavaScript.',
      html: `<main>
  <h1>Calculadora</h1>
  <output id="display" aria-label="Visor">0</output>
  <div class="teclas">
    <button type="button" data-key="C">C</button>
    <button type="button" data-key="Backspace">Apagar</button>
    <button type="button" data-key="/">÷</button>
    <button type="button" data-key="*">×</button>
    <button type="button" data-key="7">7</button><button type="button" data-key="8">8</button><button type="button" data-key="9">9</button><button type="button" data-key="-">−</button>
    <button type="button" data-key="4">4</button><button type="button" data-key="5">5</button><button type="button" data-key="6">6</button><button type="button" data-key="+">+</button>
    <button type="button" data-key="1">1</button><button type="button" data-key="2">2</button><button type="button" data-key="3">3</button><button type="button" data-key="=">=</button>
    <button type="button" data-key="0">0</button><button type="button" data-key=".">.</button>
  </div>
</main>`,
      css: baseCSS + `#display { display: block; min-height: 54px; margin-bottom: 12px; padding: 12px; background: #eef3f9; text-align: right; font-size: 1.5rem; }
.teclas { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.teclas button { min-height: 44px; }
`,
      js: `// Dica: guarde o número atual, a operação e o primeiro número.
const visor = document.getElementById('display');
document.querySelectorAll('[data-key]').forEach((botao) => {
  botao.addEventListener('click', () => {
    const tecla = botao.dataset.key;
    // TODO: atualize o visor e implemente as operações.
  });
});
`
    },
    2: {
      title: 'Lista de Tarefas',
      intro: 'Construa uma lista que ajude a organizar o dia e mantenha as tarefas salvas.',
      goal: 'Adicione, conclua e remova tarefas. Guarde a lista no armazenamento da prévia.',
      requirements: ['Não permitir tarefas vazias.', 'Atualizar o contador de pendentes ao marcar ou remover.', 'Salvar e recuperar as tarefas usando localStorage.getItem e setItem.'],
      contract: 'Mantenha os ids task-form, task-input, task-list e pending-count. Cada tarefa deve ser um li com checkbox e um botão data-action="remove". Não use dados pessoais reais.',
      html: `<main>
  <h1>Minhas tarefas</h1>
  <form id="task-form">
    <label for="task-input">Nova tarefa</label>
    <input id="task-input" autocomplete="off" placeholder="O que você precisa fazer?">
    <button type="submit">Adicionar</button>
  </form>
  <p>Pendentes: <strong id="pending-count">0</strong></p>
  <ul id="task-list"></ul>
</main>`,
      css: baseCSS + `form { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
ul { padding: 0; list-style: none; }
li { display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #ddd; }
`,
      js: `const formulario = document.getElementById('task-form');
const entrada = document.getElementById('task-input');
const lista = document.getElementById('task-list');
const contador = document.getElementById('pending-count');
// Dica: carregue suas tarefas de localStorage e redesenhe a lista.
formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  // TODO: ignore textos vazios, adicione e salve a tarefa.
});
// TODO: permita marcar e remover cada tarefa e atualize o contador.
`
    },
    3: {
      title: 'Relógio Digital',
      intro: 'Monte um relógio com data e um cronômetro para acompanhar o tempo.',
      goal: 'Mostre hora e data, alterne o formato e controle o cronômetro.',
      requirements: ['Mostrar hora, minuto e segundo atualizados e a data em português.', 'Alternar entre formatos 24h e 12h.', 'Iniciar, pausar, retomar e zerar o cronômetro.'],
      contract: 'Mantenha os ids clock-time, clock-date, clock-format, stopwatch-time, stopwatch-start, stopwatch-pause e stopwatch-reset. Mostre o cronômetro como mm:ss ou hh:mm:ss.',
      html: `<main>
  <h1>Relógio digital</h1>
  <p id="clock-time" aria-live="off">--:--:--</p>
  <p id="clock-date">Data</p>
  <button type="button" id="clock-format">Alternar 12h / 24h</button>
  <h2>Cronômetro</h2>
  <p id="stopwatch-time">00:00</p>
  <button type="button" id="stopwatch-start">Iniciar</button>
  <button type="button" id="stopwatch-pause">Pausar</button>
  <button type="button" id="stopwatch-reset">Zerar</button>
</main>`,
      css: baseCSS + `#clock-time, #stopwatch-time { font-size: 2rem; font-weight: bold; font-variant-numeric: tabular-nums; }
button { margin: 4px; }
`,
      js: `const hora = document.getElementById('clock-time');
const data = document.getElementById('clock-date');
const cronometro = document.getElementById('stopwatch-time');
// TODO: use Date e setInterval para atualizar a hora e a data.
// TODO: implemente a troca entre 12h e 24h.
// TODO: implemente iniciar, pausar, retomar e zerar o cronômetro.
`
    },
    4: {
      title: 'Dashboard Analytics',
      intro: 'Crie um painel com indicadores e gráficos usando dados de exemplo.',
      goal: 'Carregue os dados fornecidos, calcule os indicadores e permita filtrar o período.',
      requirements: ['Exibir total de vendas, ticket médio e visitas para o período escolhido.', 'Construir dois gráficos com os valores de vendas e visitas.', 'Mostrar carregamento e uma mensagem quando não houver dados.'],
      contract: 'Mantenha os ids dashboard-period, dashboard-loading, dashboard-empty, dashboard-sales, dashboard-ticket, dashboard-visits, chart-sales e chart-visits. Em cada gráfico, use elementos com data-value contendo os valores da série. Use LAB.buscarDashboard(periodo); requisições de dados externas são bloqueadas na prévia.',
      html: `<main>
  <h1>Dashboard</h1>
  <label for="dashboard-period">Período</label>
  <select id="dashboard-period"><option value="hoje">Hoje</option><option value="semana">Semana</option><option value="vazio">Sem dados</option></select>
  <p id="dashboard-loading" hidden>Carregando...</p>
  <p id="dashboard-empty" hidden>Nenhum dado encontrado.</p>
  <div class="indicadores">
    <p>Vendas: <strong id="dashboard-sales">0</strong></p>
    <p>Ticket médio: <strong id="dashboard-ticket">0</strong></p>
    <p>Visitas: <strong id="dashboard-visits">0</strong></p>
  </div>
  <h2>Vendas</h2><div id="chart-sales" class="grafico"></div>
  <h2>Visitas</h2><div id="chart-visits" class="grafico"></div>
</main>`,
      css: baseCSS + `.indicadores { display: flex; flex-wrap: wrap; gap: 16px; }
.grafico { display: flex; align-items: end; gap: 8px; min-height: 100px; }
.grafico [data-value] { padding: 12px; background: #b6e9cf; }
`,
      js: `const periodo = document.getElementById('dashboard-period');
// LAB.buscarDashboard(periodo) retorna uma Promise com:
// { vendas, pedidos, visitas, vendasPorDia, visitasPorDia }.
// Exemplo de uso: const dados = await LAB.buscarDashboard('hoje');
// TODO: mostre carregamento, calcule os indicadores e desenhe os gráficos.
// TODO: atualize tudo ao mudar o período e trate a opção sem dados.
`
    },
    6: {
      title: 'Quiz Interativo',
      intro: 'Crie um quiz com perguntas, tempo, pontuação e ranking local.',
      goal: 'Use as perguntas de exemplo para montar uma rodada de dez questões.',
      requirements: ['Mostrar uma pergunta de cada vez e contar acertos.', 'Avançar quando o tempo acabar e parar o timer ao terminar.', 'Salvar o ranking no localStorage e embaralhar ao reiniciar.'],
      contract: 'Mantenha os ids quiz-question, quiz-options, quiz-timer, quiz-score, quiz-result, quiz-ranking e quiz-restart. Em quiz-question, use data-question-id com o id da pergunta; cada alternativa é um botão data-answer com o índice, e cada item do ranking é um li data-score. Use LAB.perguntas e LAB.tempoPorPergunta.',
      html: `<main>
  <h1>Quiz interativo</h1>
  <p>Tempo: <strong id="quiz-timer">--</strong> s</p>
  <p id="quiz-question" data-question-id="">Pergunta</p>
  <div id="quiz-options"></div>
  <section id="quiz-result" hidden>
    <h2>Resultado</h2><p>Acertos: <strong id="quiz-score">0</strong></p>
  </section>
  <h2>Ranking</h2><ol id="quiz-ranking"></ol>
  <button type="button" id="quiz-restart" hidden>Jogar novamente</button>
</main>`,
      css: baseCSS + `#quiz-options { display: grid; gap: 8px; }
#quiz-options button { text-align: left; }
`,
      js: `// LAB.perguntas contém 10 objetos: { id, pergunta, opcoes, correta }.
// LAB.tempoPorPergunta indica quantos segundos usar no timer.
// TODO: embaralhe as perguntas e mostre uma por vez.
// TODO: conte acertos, avance ao expirar o tempo e pare o timer no fim.
// TODO: salve o ranking no localStorage e permita jogar novamente.
`
    }
  };

  const dashboardData = {
    hoje: { vendas: 180, pedidos: 3, visitas: 120, vendasPorDia: [60, 120], visitasPorDia: [40, 80] },
    semana: { vendas: 600, pedidos: 3, visitas: 900, vendasPorDia: [100, 200, 300], visitasPorDia: [200, 300, 400] },
    vazio: { vendas: 0, pedidos: 0, visitas: 0, vendasPorDia: [], visitasPorDia: [] }
  };
  const questions = [
    { id: 'q1', pergunta: 'Qual linguagem estrutura uma página?', opcoes: ['HTML', 'CSS', 'SQL', 'Git'], correta: 0 },
    { id: 'q2', pergunta: 'Qual tecnologia define cores e fontes?', opcoes: ['SQL', 'CSS', 'Git', 'HTML'], correta: 1 },
    { id: 'q3', pergunta: 'Qual linguagem permite interações na página?', opcoes: ['CSS', 'HTML', 'JavaScript', 'Git'], correta: 2 },
    { id: 'q4', pergunta: 'Quanto é 2 + 3?', opcoes: ['4', '5', '6', '7'], correta: 1 },
    { id: 'q5', pergunta: 'O Git ajuda a acompanhar o quê?', opcoes: ['O clima', 'A rede elétrica', 'Versões do projeto', 'Fotos do celular'], correta: 2 },
    { id: 'q6', pergunta: 'SQL é usado principalmente para quê?', opcoes: ['Consultar dados', 'Editar imagens', 'Criar fontes', 'Fazer desenhos'], correta: 0 },
    { id: 'q7', pergunta: 'Qual símbolo representa uma soma?', opcoes: ['/', '-', '+', '*'], correta: 2 },
    { id: 'q8', pergunta: 'Qual tag cria um botão HTML?', opcoes: ['button', 'color', 'database', 'scripture'], correta: 0 },
    { id: 'q9', pergunta: 'O que pode guardar um valor em JavaScript?', opcoes: ['Uma cor', 'Uma variável', 'Uma imagem', 'Um monitor'], correta: 1 },
    { id: 'q10', pergunta: 'Qual é uma boa prática ao programar?', opcoes: ['Ignorar erros', 'Nunca testar', 'Apagar o histórico', 'Testar o resultado'], correta: 3 }
  ];

  // Esta função é serializada para o iframe, sem acesso ao DOM ou às
  // credenciais da aplicação principal. Não depende do escopo externo.
  function frameBootstrap(config) {
    'use strict';
    const send = (type, extra = {}) => parent.postMessage({ channel: 'pratica-lab', token: config.token, type, ...extra }, '*');
    const errors = [];
    window.addEventListener('error', event => {
      const message = String(event.message || 'Erro no JavaScript').slice(0, 250);
      errors.push(message);
      send('runtime-error', { message });
    });
    window.addEventListener('unhandledrejection', event => {
      const message = String(event.reason && event.reason.message || event.reason || 'Erro assíncrono').slice(0, 250);
      errors.push(message);
      send('runtime-error', { message });
    });

    const values = Object.create(null);
    for (const [key, value] of Object.entries(config.storage || {})) {
      if (typeof value === 'string') values[key] = value;
    }
    const storage = {
      get length() { return Object.keys(values).length; },
      key(index) { return Object.keys(values)[index] ?? null; },
      getItem(key) { return Object.prototype.hasOwnProperty.call(values, String(key)) ? values[String(key)] : null; },
      setItem(key, value) {
        key = String(key); value = String(value);
        const isNew = !Object.prototype.hasOwnProperty.call(values, key);
        const next = { ...values, [key]: value };
        if (key.length > 200 || value.length > 20000 || (isNew && Object.keys(values).length >= 100) || JSON.stringify(next).length > 50000) {
          throw new Error('Limite de armazenamento do laboratório atingido.');
        }
        values[key] = value;
        if (config.mode === 'preview') send('storage', { storage: { ...values } });
      },
      removeItem(key) { delete values[String(key)]; if (config.mode === 'preview') send('storage', { storage: { ...values } }); },
      clear() { Object.keys(values).forEach(key => delete values[key]); if (config.mode === 'preview') send('storage', { storage: {} }); }
    };
    try { Object.defineProperty(window, 'localStorage', { value: storage, configurable: false }); }
    catch (_) { errors.push('O armazenamento da prévia não está disponível neste navegador.'); }

    window.LAB = Object.freeze({
      perguntas: config.questions.map(q => ({ ...q, opcoes: q.opcoes.slice() })),
      tempoPorPergunta: config.mode === 'test' ? 1 : 15,
      buscarDashboard: periodo => new Promise(resolve => setTimeout(() => {
        const data = config.dashboardData[periodo] || config.dashboardData.vazio;
        resolve(JSON.parse(JSON.stringify(data)));
      }, 120))
    });

    // A ordem do quiz é reproduzível durante a avaliação; a prévia continua
    // usando o gerador normal do navegador.
    if (config.mode === 'test' && config.id === 6) {
      let seed = 0x5eed1234;
      Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    }

    // O relógio de teste sempre começa às 13:04, independentemente do fuso
    // ou do horário real do aluno. O tempo continua avançando normalmente.
    if (config.mode === 'test' && config.id === 3) {
      const RealDate = Date;
      const started = RealDate.now();
      const base = new RealDate(2026, 2, 15, 13, 4, 5).getTime();
      window.Date = class extends RealDate {
        constructor(...args) { super(...(args.length ? args : [base + RealDate.now() - started])); }
        static now() { return base + RealDate.now() - started; }
      };
    }

    const parsed = new DOMParser().parseFromString(config.files.html, 'text/html');
    parsed.querySelectorAll('script, iframe, object, embed, base, meta, link').forEach(node => node.remove());
    document.body.replaceChildren(...Array.from(parsed.body.childNodes).map(node => document.importNode(node, true)));
    const style = document.createElement('style');
    style.textContent = config.files.css;
    document.head.appendChild(style);
    const userScript = document.createElement('script');
    userScript.textContent = config.files.js;
    document.body.appendChild(userScript);
    userScript.remove();

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const el = id => {
      const node = document.getElementById(id);
      if (!node) throw new Error('Não encontrei o elemento #' + id + '.');
      return node;
    };
    const click = node => { if (!node) throw new Error('Não encontrei o botão esperado.'); node.click(); };
    const visible = node => {
      if (!node.isConnected) return false;
      for (let current = node; current; current = current.parentElement) {
        const css = getComputedStyle(current);
        if (current.hidden || css.display === 'none' || css.visibility === 'hidden' || css.visibility === 'collapse') return false;
      }
      return true;
    };
    const text = node => String(node.textContent || '').trim();
    const numeric = node => {
      let str = text(node).replace(/\s/g, '').replace(/[^\d,.-]/g, '');
      if (str.includes(',')) str = str.replace(/\./g, '').replace(',', '.');
      return str ? Number(str) : NaN;
    };
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const results = [];
    const test = async (name, work) => {
      try { await work(); results.push({ name, passed: true, detail: '' }); }
      catch (error) { results.push({ name, passed: false, detail: String(error.message || error).slice(0, 260) }); }
    };
    const quizId = () => el('quiz-question').getAttribute('data-question-id') || '';
    const selectOption = () => {
      const question = config.questions.find(q => q.id === quizId());
      if (!question) throw new Error('Use o id da pergunta em data-question-id.');
      const button = el('quiz-options').querySelector('[data-answer="' + question.correta + '"]');
      if (!button) throw new Error('Crie os botões com data-answer e o índice da alternativa.');
      return button;
    };

    async function runTests() {
      if (config.phase === 'restore') {
        if (config.id === 2) {
          await test('Tarefas continuam após recarregar', async () => {
            await sleep(80);
            check(text(el('task-list')).includes('Praticar JS') && numeric(el('pending-count')) === 1, 'Recupere a lista e o contador a partir do localStorage.');
          });
        } else if (config.id === 6) {
          await test('Ranking continua após recarregar', async () => {
            await sleep(80);
            const scores = [...el('quiz-ranking').querySelectorAll('li[data-score]')].map(node => Number(node.dataset.score));
            check(scores.length > 0 && scores.every(Number.isFinite), 'Recupere e mostre o ranking salvo no localStorage.');
            check(scores.every((score, i) => i === 0 || scores[i - 1] >= score), 'Ordene o ranking do maior para o menor.');
          });
        }
        return;
      }
      if (config.id === 1) {
        const key = value => {
          const node = [...document.querySelectorAll('[data-key]')].find(item => item.getAttribute('data-key') === value);
          click(node);
        };
        const operation = async (keys, expected) => {
          key('C'); for (const k of keys) key(k); await sleep(30);
          check(numeric(el('display')) === expected, 'O visor deve mostrar ' + expected + '.');
        };
        await test('Soma e subtração', async () => { await operation(['2', '+', '3', '='], 5); await operation(['7', '-', '3', '='], 4); });
        await test('Multiplicação e divisão', async () => { await operation(['4', '*', '3', '='], 12); await operation(['8', '/', '2', '='], 4); });
        await test('Limpar e apagar último dígito', async () => {
          key('C'); key('1'); key('2'); key('Backspace'); await sleep(30);
          check(numeric(el('display')) === 1, 'Depois de digitar 12 e apagar, o visor deve mostrar 1.');
          key('C'); await sleep(30);
          check(text(el('display')) === '' || numeric(el('display')) === 0, 'Limpar deve deixar o visor vazio ou em zero.');
        });
        await test('Divisão por zero', async () => {
          key('C'); ['8', '/', '0', '='].forEach(key); await sleep(30);
          const output = text(el('display'));
          check(/erro|inválid|impossível|zero|não/i.test(output) && !/infinity|nan/i.test(output), 'Mostre uma mensagem clara para divisão por zero.');
        });
      } else if (config.id === 2) {
        const submit = async value => {
          const input = el('task-input'); input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const button = el('task-form').querySelector('button[type="submit"], button:not([type]), input[type="submit"]');
          click(button);
          await sleep(50);
        };
        await test('Não adicionar tarefa vazia', async () => {
          const before = el('task-list').querySelectorAll('li').length;
          await submit('   ');
          check(el('task-list').querySelectorAll('li').length === before, 'Ignore uma tarefa em branco.');
        });
        await test('Adicionar e contar tarefas', async () => {
          await submit('Estudar HTML'); await submit('Praticar JS');
          check(text(el('task-list')).includes('Estudar HTML') && text(el('task-list')).includes('Praticar JS'), 'Mostre as duas tarefas na lista.');
          check(numeric(el('pending-count')) === 2, 'O contador deve mostrar 2 tarefas pendentes.');
        });
        await test('Marcar e desmarcar tarefa', async () => {
          const item = [...el('task-list').querySelectorAll('li')].find(node => text(node).includes('Estudar HTML'));
          const box = item && item.querySelector('input[type="checkbox"]');
          click(box); await sleep(40);
          check(numeric(el('pending-count')) === 1, 'Ao concluir uma tarefa, o contador deve mostrar 1.');
          const updatedItem = [...el('task-list').querySelectorAll('li')].find(node => text(node).includes('Estudar HTML'));
          click(updatedItem && updatedItem.querySelector('input[type="checkbox"]')); await sleep(40);
          check(numeric(el('pending-count')) === 2, 'Ao desmarcar, o contador deve voltar para 2.');
        });
        await test('Remover uma tarefa', async () => {
          const item = [...el('task-list').querySelectorAll('li')].find(node => text(node).includes('Estudar HTML'));
          click(item && item.querySelector('[data-action="remove"]')); await sleep(50);
          check(!text(el('task-list')).includes('Estudar HTML') && text(el('task-list')).includes('Praticar JS'), 'Remova somente a tarefa escolhida.');
          check(numeric(el('pending-count')) === 1, 'Depois de remover, deve restar 1 pendente.');
        });
      } else if (config.id === 3) {
        await test('Hora e data em português', async () => {
          await sleep(80);
          check(/13:04:\d{2}/.test(text(el('clock-time'))), 'Comece mostrando a hora no formato 24h com segundos.');
          const date = text(el('clock-date')).toLowerCase();
          check(date.includes('15') && (date.includes('mar') || date.includes('/03/')) && date.includes('2026'), 'Mostre dia, mês e ano em português.');
        });
        await test('Hora atualiza e alterna 12h / 24h', async () => {
          const before = text(el('clock-time')); await sleep(1150);
          check(text(el('clock-time')) !== before, 'Atualize os segundos do relógio.');
          click(el('clock-format')); await sleep(40);
          check(/\b0?1:04:\d{2}/.test(text(el('clock-time'))), 'No formato 12h, 13 horas deve aparecer como 1 hora.');
          click(el('clock-format')); await sleep(40);
          check(/13:04:\d{2}/.test(text(el('clock-time'))), 'Ao alternar novamente, volte ao formato 24h.');
        });
        const seconds = () => {
          const parts = text(el('stopwatch-time')).match(/\d+/g);
          if (!parts || parts.length < 2 || parts.length > 3) return NaN;
          return parts.reduce((total, part) => total * 60 + Number(part), 0);
        };
        await test('Iniciar, pausar e retomar cronômetro', async () => {
          click(el('stopwatch-start')); await sleep(1200); click(el('stopwatch-pause')); await sleep(50);
          const paused = seconds(); check(paused >= 1, 'O cronômetro deve contar ao iniciar.');
          await sleep(1150); check(seconds() === paused, 'O cronômetro deve parar enquanto estiver pausado.');
          click(el('stopwatch-start')); await sleep(1200); click(el('stopwatch-pause')); await sleep(40);
          check(seconds() > paused, 'Ao retomar, continue a contagem sem zerá-la.');
        });
        await test('Zerar cronômetro', async () => { click(el('stopwatch-reset')); await sleep(40); check(seconds() === 0, 'Zerar deve voltar o cronômetro para 00:00.'); });
      } else if (config.id === 4) {
        const points = id => [...el(id).querySelectorAll('[data-value]')].map(node => Number(node.getAttribute('data-value')));
        const equalPoints = (actual, expected) => actual.length === expected.length && actual.every((number, i) => number === expected[i]);
        const choose = async value => { const node = el('dashboard-period'); node.value = value; node.dispatchEvent(new Event('change', { bubbles: true })); };
        await test('Indicadores e gráficos de hoje', async () => {
          await sleep(250);
          check(numeric(el('dashboard-sales')) === 180 && numeric(el('dashboard-ticket')) === 60 && numeric(el('dashboard-visits')) === 120, 'Para hoje, mostre vendas 180, ticket médio 60 e visitas 120.');
          check(equalPoints(points('chart-sales'), [60, 120]) && equalPoints(points('chart-visits'), [40, 80]), 'Mostre as duas séries nos gráficos usando data-value.');
        });
        await test('Filtro por período e carregamento', async () => {
          await choose('semana'); await sleep(20);
          check(visible(el('dashboard-loading')), 'Mostre o estado de carregamento enquanto busca os dados.');
          await sleep(220);
          check(!visible(el('dashboard-loading')), 'O carregamento deve desaparecer após receber os dados.');
          check(numeric(el('dashboard-sales')) === 600 && numeric(el('dashboard-ticket')) === 200 && numeric(el('dashboard-visits')) === 900, 'Atualize os três indicadores para os dados da semana.');
          check(equalPoints(points('chart-sales'), [100, 200, 300]) && equalPoints(points('chart-visits'), [200, 300, 400]), 'Atualize os dois gráficos com os dados da semana.');
        });
        await test('Período sem dados', async () => {
          await choose('vazio'); await sleep(230);
          check(visible(el('dashboard-empty')) && text(el('dashboard-empty')).length > 0, 'Mostre a mensagem de dados vazios.');
          check(points('chart-sales').length === 0 && points('chart-visits').length === 0, 'Não mantenha valores do período anterior nos gráficos.');
        });
      } else if (config.id === 6) {
        const firstOrder = [];
        await test('Pergunta e alternativas', async () => {
          check(config.questions.length === 10 && config.questions.some(q => q.id === quizId()), 'Mostre uma das dez perguntas com seu data-question-id.');
          check(el('quiz-options').querySelectorAll('[data-answer]').length >= 2, 'Mostre as alternativas com data-answer.');
          firstOrder.push(quizId());
        });
        await test('Resposta avança apenas uma vez', async () => {
          const before = quizId(); const button = selectOption(); click(button); await sleep(70);
          const after = quizId(); check(after && after !== before, 'Após responder, avance para outra pergunta.');
          firstOrder.push(after); click(button); await sleep(70);
          check(quizId() === after, 'Uma pergunta já respondida não deve avançar novamente.');
        });
        await test('Tempo esgotado avança', async () => {
          const before = quizId(); await sleep(1350);
          check(quizId() && quizId() !== before, 'Quando o tempo chegar a zero, avance para a próxima pergunta.');
        });
        await test('Dez perguntas e pontuação', async () => {
          let guard = 0;
          while (!visible(el('quiz-result')) && guard++ < 12) {
            const id = quizId(); if (!firstOrder.includes(id)) firstOrder.push(id);
            click(selectOption()); await sleep(55);
          }
          check(visible(el('quiz-result')) && firstOrder.length === 10, 'A rodada deve terminar após dez perguntas diferentes.');
          check(numeric(el('quiz-score')) === 9, 'Ao acertar nove e deixar uma expirar, a pontuação deve ser 9.');
        });
        await test('Timer para ao terminar', async () => {
          const timer = text(el('quiz-timer')); await sleep(1250);
          check(text(el('quiz-timer')) === timer && visible(el('quiz-result')), 'Pare o timer depois de mostrar o resultado.');
        });
        await test('Ranking salvo e ordenado', async () => {
          const scores = [...el('quiz-ranking').querySelectorAll('li[data-score]')].map(node => Number(node.dataset.score));
          check(scores.includes(9) && scores.every(Number.isFinite), 'Mostre a pontuação no ranking com data-score.');
          check(scores.every((score, i) => i === 0 || scores[i - 1] >= score), 'Ordene o ranking do maior para o menor.');
          check(Object.keys(values).length > 0, 'Salve o ranking usando localStorage.');
        });
        await test('Reiniciar e embaralhar', async () => {
          click(el('quiz-restart')); await sleep(60);
          const secondOrder = []; let guard = 0;
          while (!visible(el('quiz-result')) && guard++ < 12) {
            secondOrder.push(quizId()); click(selectOption()); await sleep(45);
          }
          check(secondOrder.length === 10 && visible(el('quiz-result')), 'Reiniciar deve iniciar outra rodada de dez perguntas.');
          check(secondOrder.join('|') !== firstOrder.join('|'), 'Embaralhe a ordem ao reiniciar.');
        });
      }
      await test('JavaScript sem erros de execução', async () => {
        check(errors.length === 0, errors[0] || 'Corrija os erros no JavaScript.');
      });
    }

    const ready = async () => {
      send('ready');
      if (config.mode !== 'test') return;
      try { await runTests(); send('results', { results, storage: { ...values } }); }
      catch (error) { send('fatal', { message: String(error.message || error).slice(0, 250) }); }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
    else ready();
  }

  const sourceLimit = 50000;
  // Uma resposta parcial ou de outra execução não libera a conclusão. Isso
  // evita erros acidentais, mas não torna os testes locais antifraude.
  const expectedTests = {
    1: { main: ['Soma e subtração', 'Multiplicação e divisão', 'Limpar e apagar último dígito', 'Divisão por zero', 'JavaScript sem erros de execução'] },
    2: { main: ['Não adicionar tarefa vazia', 'Adicionar e contar tarefas', 'Marcar e desmarcar tarefa', 'Remover uma tarefa', 'JavaScript sem erros de execução'], restore: ['Tarefas continuam após recarregar'] },
    3: { main: ['Hora e data em português', 'Hora atualiza e alterna 12h / 24h', 'Iniciar, pausar e retomar cronômetro', 'Zerar cronômetro', 'JavaScript sem erros de execução'] },
    4: { main: ['Indicadores e gráficos de hoje', 'Filtro por período e carregamento', 'Período sem dados', 'JavaScript sem erros de execução'] },
    6: { main: ['Pergunta e alternativas', 'Resposta avança apenas uma vez', 'Tempo esgotado avança', 'Dez perguntas e pontuação', 'Timer para ao terminar', 'Ranking salvo e ordenado', 'Reiniciar e embaralhar', 'JavaScript sem erros de execução'], restore: ['Ranking continua após recarregar'] }
  };
  let state = null;
  let saveTimer = null;
  const byId = id => document.getElementById(id);
  const sessionActive = () => !!state && !!currentUser && currentAuthId === state.userId;
  const draftKey = (userId, projectId) => `pratica.lab.draft.v1:${userId}:${projectId}`;
  const storageKey = (userId, projectId) => `pratica.lab.storage.v1:${userId}:${projectId}`;
  const copyStarter = lab => ({ html: lab.html, css: lab.css, js: lab.js });
  const readEditors = () => ({ html: byId('lab-code-html').value, css: byId('lab-code-css').value, js: byId('lab-code-js').value });
  const sameFiles = (a, b) => !!a && !!b && ['html', 'css', 'js'].every(key => a[key] === b[key]);
  const validFiles = files => files && ['html', 'css', 'js'].every(key => typeof files[key] === 'string' && files[key].length <= sourceLimit);
  const validStorage = value => value && typeof value === 'object' && !Array.isArray(value) &&
    Object.entries(value).length <= 100 && Object.entries(value).every(([key, entry]) => key.length <= 200 && typeof entry === 'string' && entry.length <= 20000) && JSON.stringify(value).length <= 50000;

  function readLocal(key, fallback) {
    try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : fallback; }
    catch (_) { return fallback; }
  }
  function writeLocal(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }
  function saveDraft() {
    clearTimeout(saveTimer); saveTimer = null;
    if (!state) return;
    const files = readEditors();
    const saved = validFiles(files) && writeLocal(draftKey(state.userId, state.id), files);
    byId('project-lab-save').textContent = saved ? 'Salvo neste navegador' : 'Não foi possível salvar; copie seu código';
  }
  function queueSave() {
    clearTimeout(saveTimer);
    byId('project-lab-save').textContent = 'Salvando neste navegador...';
    saveTimer = setTimeout(saveDraft, 350);
  }
  function token() {
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    return Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
  }
  function safeJSON(value) {
    return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, character => ({ '<': '\\u003c', '>': '\\u003e', '&': '\\u0026', '\u2028': '\\u2028', '\u2029': '\\u2029' }[character]));
  }
  function frameDocument(config) {
    const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";
    const source = '(' + frameBootstrap.toString().replace(/<\/script/gi, '<\\/script') + ')(' + safeJSON(config) + ');';
    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="' + csp + '"><title>Prévia do laboratório</title></head><body><script>' + source + '<\/script></body></html>';
  }
  function makeConfig(mode, files, runToken, phase, storage) {
    return { mode, id: state.id, token: runToken, phase, files, storage, questions, dashboardData };
  }
  function resetFrame(frame) {
    if (!frame) return;
    frame.removeAttribute('srcdoc');
    frame.src = 'about:blank';
  }
  function clearTestFrame() {
    if (!state) return;
    clearTimeout(state.testTimer);
    state.testTimer = null;
    byId('project-lab-test-slot').replaceChildren();
    state.testFrame = null;
    state.testToken = null;
    state.testing = false;
    byId('project-lab-test').disabled = !!state.completing;
  }
  function invalidateTests(message) {
    if (!state) return;
    clearTestFrame();
    state.passedFiles = null;
    state.results = [];
    byId('project-lab-results').replaceChildren();
    byId('project-lab-test-status').textContent = message || 'O código mudou. Faça os testes novamente.';
    refresh();
  }
  function populateList(id, strings) {
    const list = byId(id); list.replaceChildren();
    strings.forEach(value => { const item = document.createElement('li'); item.textContent = value; list.appendChild(item); });
  }
  function selectTab(tab) {
    if (!['html', 'css', 'js'].includes(tab)) return;
    for (const id of ['html', 'css', 'js']) {
      const selected = id === tab;
      byId('lab-tab-' + id).setAttribute('aria-selected', String(selected));
      byId('lab-tab-' + id).tabIndex = selected ? 0 : -1;
      byId('lab-panel-' + id).hidden = !selected;
    }
  }
  function open(id) {
    if (!currentUser || !currentAuthId || !labs[id] || !PROJECT_LAB_IDS.has(id)) return;
    if (state) reset();
    state = { id, userId: currentAuthId, previewToken: null, previewFiles: null, previewError: null, previewStorageError: false, testToken: null, testFrame: null, testTimer: null, testing: false, completing: false, passedFiles: null, results: [], phase: null };
    const lab = labs[id];
    const stored = readLocal(draftKey(state.userId, id), null);
    const files = validFiles(stored) ? stored : copyStarter(lab);
    for (const key of ['html', 'css', 'js']) byId('lab-code-' + key).value = files[key];
    byId('project-lab-title').textContent = lab.title;
    byId('project-lab-intro').textContent = lab.intro;
    byId('project-lab-goal').textContent = lab.goal;
    byId('project-lab-contract').textContent = lab.contract;
    populateList('project-lab-requirements', lab.requirements);
    byId('project-lab-results').replaceChildren();
    byId('project-lab-test-status').textContent = 'Execute os testes para ver o que falta.';
    byId('project-lab-preview-status').textContent = 'Clique em Executar projeto para atualizar a prévia.';
    byId('project-lab-save').textContent = validFiles(stored) ? 'Rascunho recuperado neste navegador' : 'Rascunho salvo neste navegador';
    selectTab('html');
    byId('projects-overview').classList.add('hidden');
    byId('project-lab').classList.remove('hidden');
    refresh();
    preview();
    byId('project-lab-title').focus({ preventScroll: true });
    const main = byId('main-content'); if (main) main.scrollTop = 0;
  }
  function reset() {
    if (!state) return;
    saveDraft();
    clearTestFrame();
    resetFrame(byId('project-lab-preview'));
    ['html', 'css', 'js'].forEach(id => { byId('lab-code-' + id).disabled = false; });
    state = null;
    byId('project-lab').classList.add('hidden');
    byId('projects-overview').classList.remove('hidden');
  }
  function close() {
    if (!state || state.completing) return;
    const id = state.id;
    reset();
    renderProjects();
    const button = byId('projects-grid').querySelector(`button[onclick="openProjectLab(${id})"]`);
    if (button) button.focus({ preventScroll: true });
  }
  function refresh() {
    if (!state) return;
    const button = byId('project-lab-complete');
    const done = completedProjects.includes(state.id);
    const ready = sessionActive() && !state.testing && !state.completing && sameFiles(state.passedFiles, readEditors());
    button.disabled = done || !ready;
    button.textContent = done ? '✅ Projeto já concluído' : state.completing ? 'Salvando...' : 'Concluir projeto';
    byId('project-lab-test').disabled = state.testing || state.completing;
  }
  function preview() {
    if (!sessionActive() || state.completing) return;
    const files = readEditors();
    if (!validFiles(files)) { byId('project-lab-preview-status').textContent = 'O código ultrapassa o limite de 50.000 caracteres por arquivo.'; return; }
    saveDraft();
    const savedStorage = readLocal(storageKey(state.userId, state.id), {});
    const storage = validStorage(savedStorage) ? savedStorage : {};
    state.previewToken = token();
    state.previewFiles = files;
    state.previewError = null;
    state.previewStorageError = false;
    byId('project-lab-preview-status').textContent = 'Preparando a prévia...';
    byId('project-lab-preview').srcdoc = frameDocument(makeConfig('preview', files, state.previewToken, 'main', storage));
  }
  function paintResults(results) {
    const list = byId('project-lab-results'); list.replaceChildren();
    results.forEach(result => {
      const item = document.createElement('li');
      item.className = result.passed ? 'is-passed' : 'is-failed';
      item.textContent = (result.passed ? '✓ ' : '✕ ') + result.name + (result.detail ? ' — ' + result.detail : '');
      list.appendChild(item);
    });
  }
  function startTestFrame(phase, storage) {
    if (!state) return;
    const iframe = document.createElement('iframe');
    // Formulários precisam disparar submit no código do aluno; a CSP
    // form-action 'none' continua bloqueando a navegação e o envio de dados.
    iframe.setAttribute('sandbox', 'allow-scripts allow-forms');
    iframe.setAttribute('title', 'Ambiente isolado dos testes');
    iframe.setAttribute('tabindex', '-1');
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    state.testToken = token(); state.phase = phase; state.testFrame = iframe;
    byId('project-lab-test-slot').replaceChildren(iframe);
    iframe.srcdoc = frameDocument(makeConfig('test', state.testFiles, state.testToken, phase, storage));
  }
  function test() {
    if (!sessionActive() || state.testing || state.completing) return;
    const files = readEditors();
    if (!validFiles(files)) { byId('project-lab-test-status').textContent = 'O código ultrapassa o limite de 50.000 caracteres por arquivo.'; return; }
    saveDraft();
    invalidateTests('Executando os testes...');
    state.testing = true; state.testFiles = files; state.results = [];
    byId('project-lab-test-status').textContent = 'Executando os testes. Relógio e quiz podem levar alguns segundos.';
    refresh();
    startTestFrame('main', {});
    const run = state;
    state.testTimer = setTimeout(() => {
      if (state !== run || !state.testing) return;
      clearTestFrame();
      byId('project-lab-test-status').textContent = 'Os testes não terminaram. Confira loops ou erros e tente novamente.';
      refresh();
    }, 22000);
  }
  function finishTests() {
    if (!state) return;
    const results = state.results.slice();
    const snapshot = state.testFiles;
    clearTestFrame();
    paintResults(results);
    const passed = results.length > 0 && results.every(result => result.passed);
    state.passedFiles = passed && sameFiles(snapshot, readEditors()) ? snapshot : null;
    const count = results.filter(result => result.passed).length;
    byId('project-lab-test-status').textContent = `${count} de ${results.length} testes passaram. ` +
      (state.passedFiles ? 'Você pode concluir o projeto.' : 'Revise os itens indicados e teste novamente.');
    refresh();
  }
  function validResults(value) {
    const expected = state && expectedTests[state.id] && expectedTests[state.id][state.phase];
    return Array.isArray(expected) && Array.isArray(value) && value.length === expected.length && value.every((result, index) => result &&
      result.name === expected[index] && typeof result.passed === 'boolean' &&
      typeof result.detail === 'string' && result.detail.length <= 260);
  }
  window.addEventListener('message', event => {
    if (!sessionActive() || !event.data || event.data.channel !== 'pratica-lab') return;
    const msg = event.data;
    const previewFrame = byId('project-lab-preview');
    if (event.source === previewFrame.contentWindow && msg.token === state.previewToken) {
      if (msg.type === 'runtime-error') state.previewError = String(msg.message || 'Erro no JavaScript').slice(0, 250);
      else if (msg.type === 'storage' && validStorage(msg.storage)) {
        state.previewStorageError = !writeLocal(storageKey(state.userId, state.id), msg.storage);
      }
      if (['ready', 'runtime-error', 'storage'].includes(msg.type)) {
        const previewStatus = byId('project-lab-preview-status');
        if (!sameFiles(state.previewFiles, readEditors())) previewStatus.textContent = 'O código mudou. Clique em Executar projeto para atualizar a prévia.';
        else if (state.previewError) previewStatus.textContent = 'Erro na prévia: ' + state.previewError;
        else if (state.previewStorageError) previewStatus.textContent = 'Não foi possível salvar os dados da prévia neste navegador.';
        else if (msg.type === 'ready' || msg.type === 'storage') previewStatus.textContent = 'Prévia atualizada. Chamadas a APIs e scripts externos são bloqueados neste quadro.';
      }
      return;
    }
    if (!state.testing || !state.testFrame || event.source !== state.testFrame.contentWindow || msg.token !== state.testToken) return;
    if (msg.type === 'fatal') {
      clearTestFrame();
      byId('project-lab-test-status').textContent = 'Não foi possível executar os testes: ' + String(msg.message || '').slice(0, 250);
      refresh(); return;
    }
    if (msg.type !== 'results' || !validResults(msg.results)) return;
    state.results.push(...msg.results);
    if (state.phase === 'main' && (state.id === 2 || state.id === 6)) {
      startTestFrame('restore', validStorage(msg.storage) ? msg.storage : {});
    } else finishTests();
  });
  function canComplete(id) {
    return sessionActive() && state.id === id && !state.testing && sameFiles(state.passedFiles, readEditors());
  }
  async function complete() {
    if (!state || state.completing || !canComplete(state.id) || completedProjects.includes(state.id)) return;
    const run = state;
    run.completing = true;
    ['html', 'css', 'js'].forEach(id => { byId('lab-code-' + id).disabled = true; });
    refresh();
    try {
      // O botão visível é compartilhado entre projetos. Use um botão isolado
      // para que uma resposta tardia não altere a interface de outro laboratório.
      const requestButton = document.createElement('button');
      await startProject(run.id, labs[run.id].title, requestButton);
      if (state === run && completedProjects.includes(run.id)) {
        byId('project-lab-test-status').textContent = 'Projeto concluído. Seus testes foram feitos neste navegador.';
        renderProjects();
      }
    } finally {
      if (state === run) {
        ['html', 'css', 'js'].forEach(id => { byId('lab-code-' + id).disabled = false; });
        run.completing = false;
        refresh();
      }
    }
  }
  async function restoreStarter() {
    if (!sessionActive() || state.completing) return;
    const run = state;
    if (!await themedConfirm('Restaurar o código inicial? O rascunho atual deste projeto será substituído.')) return;
    if (state !== run || !sessionActive()) return;
    const files = copyStarter(labs[run.id]);
    for (const key of ['html', 'css', 'js']) byId('lab-code-' + key).value = files[key];
    invalidateTests('Código inicial restaurado. Faça os testes depois de implementar.');
    saveDraft(); preview();
  }
  for (const id of ['html', 'css', 'js']) {
    byId('lab-code-' + id).addEventListener('input', () => {
      if (!state || state.completing) return;
      invalidateTests();
      byId('project-lab-preview-status').textContent = 'O código mudou. Clique em Executar projeto para atualizar a prévia.';
      queueSave();
    });
    byId('lab-tab-' + id).addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = ['html', 'css', 'js']; const current = tabs.indexOf(id);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[next]); byId('lab-tab-' + tabs[next]).focus();
    });
  }
  window.addEventListener('pagehide', () => { if (state) saveDraft(); });
  window.ProjectLab = { open, close, reset, refresh, selectTab, preview, test, complete, canComplete, restoreStarter };
})();

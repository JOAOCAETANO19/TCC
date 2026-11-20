// Soluções de referência usadas somente nos testes dos laboratórios.
// A interface entregue aos alunos começa com os trechos incompletos.
module.exports = {
  1: `
const display = document.getElementById('display');
let atual = '0', primeiro = null, operador = null, novo = false;
function mostrar() { display.textContent = atual; }
function calcular(a, b, op) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b === 0 ? 'Erro: divisão por zero' : a / b;
  return b;
}
document.querySelectorAll('[data-key]').forEach(botao => botao.addEventListener('click', () => {
  const t = botao.dataset.key;
  if (t === 'C') { atual = '0'; primeiro = null; operador = null; novo = false; }
  else if (t === 'Backspace') { atual = atual.length > 1 ? atual.slice(0, -1) : '0'; }
  else if (/^\\d$/.test(t)) { atual = novo || atual === '0' || atual.startsWith('Erro') ? t : atual + t; novo = false; }
  else if (t === '.') { if (novo) { atual = '0'; novo = false; } if (!atual.includes('.')) atual += '.'; }
  else if (['+', '-', '*', '/'].includes(t)) { primeiro = Number(atual); operador = t; novo = true; }
  else if (t === '=' && operador) { atual = String(calcular(primeiro, Number(atual), operador)); operador = null; novo = true; }
  mostrar();
}));
`,
  2: `
const formulario = document.getElementById('task-form');
const entrada = document.getElementById('task-input');
const lista = document.getElementById('task-list');
const contador = document.getElementById('pending-count');
let tarefas = JSON.parse(localStorage.getItem('tarefas') || '[]');
function salvar() { localStorage.setItem('tarefas', JSON.stringify(tarefas)); }
function renderizar() {
  lista.replaceChildren();
  tarefas.forEach((tarefa, indice) => {
    const item = document.createElement('li');
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = tarefa.feita;
    checkbox.addEventListener('change', () => { tarefa.feita = checkbox.checked; salvar(); renderizar(); });
    const texto = document.createElement('span'); texto.textContent = tarefa.texto;
    const remover = document.createElement('button'); remover.type = 'button'; remover.dataset.action = 'remove'; remover.textContent = 'Remover';
    remover.addEventListener('click', () => { tarefas.splice(indice, 1); salvar(); renderizar(); });
    item.append(checkbox, texto, remover); lista.append(item);
  });
  contador.textContent = tarefas.filter(tarefa => !tarefa.feita).length;
}
formulario.addEventListener('submit', evento => {
  evento.preventDefault(); const texto = entrada.value.trim(); if (!texto) return;
  tarefas.push({ texto, feita: false }); entrada.value = ''; salvar(); renderizar();
});
renderizar();
`,
  3: `
const hora = document.getElementById('clock-time');
const data = document.getElementById('clock-date');
const cronometro = document.getElementById('stopwatch-time');
let dozeHoras = false, inicio = null, acumulado = 0;
function atualizarRelogio() {
  const agora = new Date();
  hora.textContent = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: dozeHoras });
  data.textContent = agora.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}
document.getElementById('clock-format').addEventListener('click', () => { dozeHoras = !dozeHoras; atualizarRelogio(); });
function atualizarCronometro() {
  const ms = acumulado + (inicio === null ? 0 : Date.now() - inicio);
  const segundos = Math.floor(ms / 1000);
  cronometro.textContent = String(Math.floor(segundos / 60)).padStart(2, '0') + ':' + String(segundos % 60).padStart(2, '0');
}
document.getElementById('stopwatch-start').addEventListener('click', () => { if (inicio === null) inicio = Date.now(); atualizarCronometro(); });
document.getElementById('stopwatch-pause').addEventListener('click', () => { if (inicio !== null) { acumulado += Date.now() - inicio; inicio = null; } atualizarCronometro(); });
document.getElementById('stopwatch-reset').addEventListener('click', () => { inicio = null; acumulado = 0; atualizarCronometro(); });
atualizarRelogio(); atualizarCronometro(); setInterval(atualizarRelogio, 250); setInterval(atualizarCronometro, 100);
`,
  4: `
const periodo = document.getElementById('dashboard-period');
const loading = document.getElementById('dashboard-loading');
const vazio = document.getElementById('dashboard-empty');
function grafico(id, valores) {
  const caixa = document.getElementById(id); caixa.replaceChildren();
  valores.forEach(valor => { const barra = document.createElement('div'); barra.dataset.value = valor; barra.textContent = valor; barra.style.height = (20 + valor / 4) + 'px'; caixa.append(barra); });
}
async function atualizar() {
  loading.hidden = false; vazio.hidden = true;
  const dados = await LAB.buscarDashboard(periodo.value);
  document.getElementById('dashboard-sales').textContent = dados.vendas;
  document.getElementById('dashboard-ticket').textContent = dados.pedidos ? dados.vendas / dados.pedidos : 0;
  document.getElementById('dashboard-visits').textContent = dados.visitas;
  grafico('chart-sales', dados.vendasPorDia); grafico('chart-visits', dados.visitasPorDia);
  vazio.hidden = dados.vendasPorDia.length > 0; loading.hidden = true;
}
periodo.addEventListener('change', atualizar); atualizar();
`,
  6: `
const perguntaEl = document.getElementById('quiz-question');
const opcoesEl = document.getElementById('quiz-options');
const timerEl = document.getElementById('quiz-timer');
const scoreEl = document.getElementById('quiz-score');
const resultEl = document.getElementById('quiz-result');
const rankingEl = document.getElementById('quiz-ranking');
const restartEl = document.getElementById('quiz-restart');
let ordem = [], indice = 0, pontos = 0, timer = null, respondida = false;
let ranking = JSON.parse(localStorage.getItem('ranking') || '[]');
function renderRanking() {
  rankingEl.replaceChildren();
  ranking.slice().sort((a, b) => b - a).forEach(score => { const item = document.createElement('li'); item.dataset.score = score; item.textContent = score + ' acertos'; rankingEl.append(item); });
}
function embaralhar() {
  const copia = LAB.perguntas.slice();
  for (let i = copia.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copia[i], copia[j]] = [copia[j], copia[i]]; }
  return copia;
}
function finalizar() {
  clearInterval(timer); timer = null; timerEl.textContent = '0';
  resultEl.hidden = false; restartEl.hidden = false; scoreEl.textContent = pontos; opcoesEl.replaceChildren();
  ranking.push(pontos); localStorage.setItem('ranking', JSON.stringify(ranking)); renderRanking();
}
function avancar() { clearInterval(timer); timer = null; indice++; if (indice >= ordem.length) finalizar(); else exibir(); }
function exibir() {
  respondida = false; const atual = ordem[indice]; perguntaEl.textContent = atual.pergunta; perguntaEl.dataset.questionId = atual.id;
  opcoesEl.replaceChildren();
  atual.opcoes.forEach((opcao, numero) => {
    const botao = document.createElement('button'); botao.type = 'button'; botao.dataset.answer = numero; botao.textContent = opcao;
    const posicao = indice;
    botao.addEventListener('click', () => { if (respondida || indice !== posicao) return; respondida = true; if (numero === atual.correta) pontos++; avancar(); });
    opcoesEl.append(botao);
  });
  let restante = LAB.tempoPorPergunta; timerEl.textContent = restante;
  timer = setInterval(() => { restante--; timerEl.textContent = restante; if (restante <= 0) { respondida = true; avancar(); } }, 1000);
}
function iniciar() { clearInterval(timer); ordem = embaralhar(); indice = 0; pontos = 0; resultEl.hidden = true; restartEl.hidden = true; exibir(); }
restartEl.addEventListener('click', iniciar); renderRanking(); iniciar();
`
};

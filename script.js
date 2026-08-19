// ===== DATA (inalterado) =====

const careers = [
  { name: "Front-end",        desc: "Cria interfaces visuais de sites e apps",           salary: "R$4.000 - R$15.000", skills: ["HTML","CSS","JavaScript","React","TypeScript"],     time: "6-12 meses",  color: "text-blue-400"   },
  { name: "Back-end",         desc: "Desenvolve a lógica e servidores das aplicações",   salary: "R$5.000 - R$18.000", skills: ["Python","Java","Node.js","SQL","APIs"],              time: "8-14 meses",  color: "text-green-400"  },
  { name: "Full Stack",       desc: "Domina front-end e back-end completo",              salary: "R$6.000 - R$20.000", skills: ["HTML/CSS/JS","Node.js","SQL","Git","DevOps"],        time: "12-18 meses", color: "text-purple-400" },
  { name: "Mobile",           desc: "Desenvolve apps para iOS e Android",                salary: "R$5.000 - R$16.000", skills: ["React Native","Flutter","Kotlin","Swift"],           time: "8-14 meses",  color: "text-cyan-400"   },
  { name: "QA / Testes",      desc: "Garante qualidade e confiabilidade do software",    salary: "R$3.500 - R$12.000", skills: ["Testes","Selenium","Cypress","Lógica"],              time: "4-8 meses",   color: "text-yellow-400" },
  { name: "Banco de Dados",   desc: "Administra e otimiza bancos de dados",              salary: "R$5.000 - R$14.000", skills: ["SQL","MySQL","PostgreSQL","MongoDB"],                time: "6-10 meses",  color: "text-orange-400" },
  { name: "UX/UI Design",     desc: "Projeta experiências e interfaces de usuário",      salary: "R$4.000 - R$14.000", skills: ["Figma","Design","Pesquisa","Prototipação"],          time: "6-12 meses",  color: "text-pink-400"   },
  { name: "DevOps",           desc: "Automatiza deploys e infraestrutura",               salary: "R$7.000 - R$22.000", skills: ["Linux","Docker","CI/CD","AWS","Git"],                time: "10-16 meses", color: "text-red-400"    },
  { name: "Analista de Sistemas", desc: "Analisa requisitos e projeta soluções",         salary: "R$5.000 - R$15.000", skills: ["UML","Processos","SQL","Documentação"],              time: "6-12 meses",  color: "text-teal-400"   }
];

const subjects = [
  { id: "html",   name: "HTML",          icon: "🌐", color: "bg-orange-500/20 border-orange-500/30" },
  { id: "css",    name: "CSS",           icon: "🎨", color: "bg-blue-500/20 border-blue-500/30"    },
  { id: "js",     name: "JavaScript",    icon: "⚡", color: "bg-yellow-500/20 border-yellow-500/30" },
  { id: "sql",    name: "SQL",           icon: "🗄️", color: "bg-cyan-500/20 border-cyan-500/30"    },
  { id: "python", name: "Python",        icon: "🐍", color: "bg-green-500/20 border-green-500/30"  },
  { id: "java",   name: "Java",          icon: "☕", color: "bg-red-500/20 border-red-500/30"      },
  { id: "poo",    name: "POO",           icon: "🧩", color: "bg-purple-500/20 border-purple-500/30" },
  { id: "git",    name: "Git/GitHub",    icon: "🔀", color: "bg-gray-500/20 border-gray-500/30"   },
  { id: "redes",  name: "Redes",         icon: "🌍", color: "bg-teal-500/20 border-teal-500/30"   },
  { id: "apis",   name: "APIs",          icon: "🔗", color: "bg-indigo-500/20 border-indigo-500/30" },
  { id: "banco",  name: "Banco de Dados",icon: "💾", color: "bg-amber-500/20 border-amber-500/30"  },
  { id: "logica", name: "Lógica",        icon: "🧠", color: "bg-pink-500/20 border-pink-500/30"   }
];

const subjectContent = {
  html:   { title:"HTML - HyperText Markup Language", summary:"HTML é a linguagem de marcação padrão para criar páginas web.", topics:["Tags e elementos","Estrutura básica (DOCTYPE, head, body)","Semântica (header, nav, main, footer)","Formulários e inputs","Tabelas e listas","Links e imagens","Atributos e classes"], example:`<!DOCTYPE html>\n<html>\n<head>\n  <title>Minha Página</title>\n</head>\n<body>\n  <h1>Olá, Mundo!</h1>\n  <p>Meu primeiro site.</p>\n</body>\n</html>`, exercise:"Crie uma página HTML com um cabeçalho, parágrafo, lista e um link para o Google.", video:"https://www.youtube.com/embed/Ejkb_YpuHWs" },
  css:    { title:"CSS - Cascading Style Sheets", summary:"CSS é a linguagem que estiliza páginas web, controlando cores, fontes, layouts e animações.", topics:["Seletores e propriedades","Box Model (margin, padding, border)","Flexbox e Grid","Responsividade (media queries)","Animações e transições","Variáveis CSS","Pseudo-classes e pseudo-elementos"], example:`body {\n  font-family: Arial;\n  background: #1a1a2e;\n  color: white;\n}\n\n.card {\n  display: flex;\n  padding: 20px;\n  border-radius: 12px;\n  background: rgba(255,255,255,0.05);\n}`, exercise:"Estilize um card com Flexbox, borda arredondada e sombra.", video:"https://www.youtube.com/embed/GPK8A-A156o" },
  js:     { title:"JavaScript - Linguagem da Web", summary:"JavaScript é a linguagem de programação que torna páginas web interativas e dinâmicas.", topics:["Variáveis (let, const, var)","Funções e Arrow Functions","DOM Manipulation","Eventos e Listeners","Arrays e Objetos","Promises e Async/Await","LocalStorage e Fetch API"], example:`const btn = document.querySelector('#meuBtn');\n\nbtn.addEventListener('click', () => {\n  alert('Clicou!');\n});\n\nconst soma = (a, b) => a + b;\nconsole.log(soma(2, 3)); // 5`, exercise:"Crie um contador que incrementa ao clicar em um botão e mostra o valor na tela.", video:"https://www.youtube.com/embed/i6Oi-YtXnAU" },
  sql:    { title:"SQL - Structured Query Language", summary:"SQL é a linguagem padrão para gerenciar e consultar bancos de dados relacionais.", topics:["SELECT, INSERT, UPDATE, DELETE","WHERE e condições","JOIN (INNER, LEFT, RIGHT)","GROUP BY e ORDER BY","Funções agregadas (COUNT, SUM, AVG)","Subqueries","Índices e otimização"], example:`SELECT nome, idade\nFROM alunos\nWHERE curso = 'Desenvolvimento'\nORDER BY nome ASC;\n\nINSERT INTO alunos (nome, idade)\nVALUES ('João', 17);`, exercise:"Escreva uma query que retorne todos os alunos maiores de 16 anos ordenados por nome.", video:"https://www.youtube.com/embed/byHcYRpMgI4" },
  python: { title:"Python - Linguagem Versátil", summary:"Python é uma linguagem poderosa e fácil de aprender, usada em web, dados, IA e automação.", topics:["Variáveis e tipos de dados","Estruturas condicionais (if/elif/else)","Loops (for, while)","Funções e módulos","Listas, dicionários e tuplas","Orientação a objetos","Bibliotecas populares (Flask, Pandas)"], example:`def saudacao(nome):\n    return f"Olá, {nome}!"\n\nalunos = ["Ana", "João", "Maria"]\nfor aluno in alunos:\n    print(saudacao(aluno))`, exercise:"Crie uma função que recebe uma lista de notas e retorna a média.", video:"https://www.youtube.com/embed/S9uPNppGsGo" },
  java:   { title:"Java - Linguagem Corporativa", summary:"Java é uma das linguagens mais usadas no mundo corporativo, robusta e orientada a objetos.", topics:["Classes e objetos","Tipos primitivos e wrappers","Herança e polimorfismo","Interfaces e classes abstratas","Collections (List, Map, Set)","Exceções (try/catch)","Spring Boot (introdução)"], example:`public class Aluno {\n    private String nome;\n    private int idade;\n\n    public Aluno(String nome, int idade) {\n        this.nome = nome;\n        this.idade = idade;\n    }\n\n    public String getNome() {\n        return this.nome;\n    }\n}`, exercise:"Crie uma classe Carro com atributos marca, modelo e ano, e um método que exibe as informações.", video:"https://www.youtube.com/embed/grEKMHGYyns" },
  poo:    { title:"POO - Programação Orientada a Objetos", summary:"POO é um paradigma que organiza código em objetos com atributos e comportamentos.", topics:["Classes e Objetos","Encapsulamento","Herança","Polimorfismo","Abstração","Interfaces","Princípios SOLID (introdução)"], example:`class Animal {\n  constructor(nome) {\n    this.nome = nome;\n  }\n  falar() {\n    return "...";\n  }\n}\n\nclass Cachorro extends Animal {\n  falar() {\n    return "Au au!";\n  }\n}`, exercise:"Crie uma hierarquia de classes: Forma → Retângulo e Círculo, cada um com método calcularArea().", video:"https://www.youtube.com/embed/QY0Kdg83orY" },
  git:    { title:"Git & GitHub - Controle de Versão", summary:"Git permite versionar código e GitHub é a plataforma para colaboração e portfólio.", topics:["git init, add, commit","Branches e merge","git push e pull","Pull Requests","Conflitos e resolução","GitHub Pages",".gitignore e README"], example:`git init\ngit add .\ngit commit -m "primeiro commit"\ngit remote add origin https://github.com/user/repo.git\ngit push -u origin main`, exercise:"Inicialize um repositório, faça 3 commits diferentes e crie uma branch chamada 'feature'.", video:"https://www.youtube.com/embed/UBAX-13g8aw" },
  redes:  { title:"Redes de Computadores", summary:"Redes conectam computadores permitindo comunicação e compartilhamento de recursos.", topics:["Modelo OSI e TCP/IP","IP, DNS e portas","HTTP e HTTPS","Roteadores e switches","Protocolos (FTP, SSH, SMTP)","Firewall e segurança","Wi-Fi e cabeamento"], example:`IP Local: 192.168.1.100\nMáscara: 255.255.255.0\nGateway: 192.168.1.1\nDNS: 8.8.8.8\n\nHTTP GET /api/dados → 200 OK`, exercise:"Explique a diferença entre IP público e privado e como funciona o NAT.", video:"https://www.youtube.com/embed/Tq4RFqdaKPM" },
  apis:   { title:"APIs - Application Programming Interface", summary:"APIs permitem que sistemas se comuniquem entre si, essencial para apps modernos.", topics:["O que é uma API REST","Métodos HTTP (GET, POST, PUT, DELETE)","JSON e formato de dados","Headers e autenticação","Status codes (200, 404, 500)","Fetch API no JavaScript","Documentação (Swagger)"], example:`// Consumindo uma API\nfetch('https://api.exemplo.com/users')\n  .then(res => res.json())\n  .then(data => {\n    console.log(data);\n  })\n  .catch(err => console.error(err));`, exercise:"Consuma a API JSONPlaceholder e exiba uma lista de posts em uma página HTML.", video:"https://www.youtube.com/embed/vGuqKIRWosk" },
  banco:  { title:"Banco de Dados", summary:"Bancos de dados armazenam e organizam informações de forma estruturada e eficiente.", topics:["Modelagem de dados (MER)","Banco relacional vs NoSQL","Normalização (1FN, 2FN, 3FN)","Chaves primárias e estrangeiras","Relacionamentos (1:1, 1:N, N:N)","MySQL, PostgreSQL, MongoDB","Transações e ACID"], example:`CREATE TABLE alunos (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  nome VARCHAR(100) NOT NULL,\n  email VARCHAR(100) UNIQUE,\n  curso_id INT,\n  FOREIGN KEY (curso_id) REFERENCES cursos(id)\n);`, exercise:"Modele um banco de dados para uma biblioteca com tabelas: livros, autores e empréstimos.", video:"https://www.youtube.com/embed/Ofktsne-utM" },
  logica: { title:"Lógica de Programação", summary:"Base fundamental para qualquer linguagem. Ensina a pensar como um programador.", topics:["Algoritmos e fluxogramas","Variáveis e tipos de dados","Estruturas condicionais","Loops (repetição)","Vetores e matrizes","Funções e procedimentos","Debugging e resolução de problemas"], example:`// Algoritmo: Verificar se é par ou ímpar\nfuncao verificarParidade(numero):\n  se (numero % 2 == 0):\n    retornar "Par"\n  senao:\n    retornar "Ímpar"`, exercise:"Crie um algoritmo que receba 5 números e retorne o maior e o menor.", video:"https://www.youtube.com/embed/8mei6uVttho" }
};

const projects = [
  {
    level: "Iniciante", color: "text-green-400", border: "border-green-500/30",
    items: [
      { name: "Calculadora",      desc: "Calculadora funcional com operações básicas",               difficulty: "⭐",    dbId: 1 },
      { name: "Lista de Tarefas", desc: "Todo list com adicionar, remover e marcar como concluído",  difficulty: "⭐",    dbId: 2 },
      { name: "Relógio Digital",  desc: "Relógio com hora, data e cronômetro",                       difficulty: "⭐",    dbId: 3 }
    ]
  },
  {
    level: "Intermediário", color: "text-yellow-400", border: "border-yellow-500/30",
    items: [
      { name: "Dashboard Analytics", desc: "Painel com gráficos e dados dinâmicos",                  difficulty: "⭐⭐", dbId: 4 },
      { name: "Sistema de Login",    desc: "Autenticação com rotas protegidas",                       difficulty: "⭐⭐", dbId: 5 },
      { name: "Quiz Interativo",     desc: "Quiz com pontuação, timer e ranking",                     difficulty: "⭐⭐", dbId: 6 }
    ]
  },
  {
    level: "Avançado", color: "text-red-400", border: "border-red-500/30",
    items: [
      { name: "E-commerce",         desc: "Loja virtual com carrinho, filtros e checkout",            difficulty: "⭐⭐⭐", dbId: 7 },
      { name: "Rede Social",        desc: "Feed, perfis, posts e interações",                         difficulty: "⭐⭐⭐", dbId: 8 },
      { name: "Chat em Tempo Real", desc: "Mensagens instantâneas com WebSocket",                     difficulty: "⭐⭐⭐", dbId: 9 }
    ]
  }
];


// ===== STATE =====
let currentUser    = null;  // dados do perfil (tabela profiles)
let currentAuthId  = null;  // UUID do auth.users
let completedProjects = []; // array de project_id já concluídos
let userCerts      = [];    // array de { subject_id, title }
let quizAnswers    = [];


// ===== HELPERS UI =====

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

function setLoading(btnId, loading, originalText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Aguarde...' : originalText;
}

function showRegister() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
}

function showLogin() {
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
}


// ===== UI GENÉRICA: CONFIRMAÇÃO E TOAST =====
// Substituem confirm()/alert() nativos do navegador por um modal e
// notificações no mesmo visual do resto do site.

let _confirmResolve = null;

function themedConfirm(message, danger = false) {
  document.getElementById('confirm-message').textContent = message;
  const okBtn = document.getElementById('confirm-ok-btn');
  okBtn.className = 'flex-1 py-2.5 rounded-lg text-sm font-semibold transition ' +
    (danger ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-primary');
  document.getElementById('confirm-modal').classList.remove('hidden');
  return new Promise(resolve => { _confirmResolve = resolve; });
}

function resolveConfirm(value) {
  document.getElementById('confirm-modal').classList.add('hidden');
  if (_confirmResolve) { _confirmResolve(value); _confirmResolve = null; }
}

function showToast(message, type = 'error') {
  const colors = type === 'success'
    ? 'bg-green-500/15 border-green-500/40 text-green-300'
    : 'bg-red-500/15 border-red-500/40 text-red-300';
  const toast = document.createElement('div');
  toast.className = `card-glass border ${colors} rounded-lg px-4 py-3 text-sm shadow-lg transition-opacity duration-300`;
  toast.style.opacity = '1';
  toast.textContent = message;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; }, 3200);
  setTimeout(() => { toast.remove(); }, 3600);
}


// ===== AUTH — LOGIN =====

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  if (!email || !pass) { showError('login-error', 'Preencha todos os campos.'); return; }

  setLoading('btn-login', true, 'Entrar');

  try {
    const user = await supabaseLogin(email, pass);
    currentAuthId = user.id;
    currentUser   = await fetchProfile(user.id);
    await loadUserExtras(user.id);
    enterApp();
  } catch (err) {
    showError('login-error', traduzirErroAuth(err.message));
  } finally {
    setLoading('btn-login', false, 'Entrar');
  }
}


// ===== AUTH — CADASTRO =====

async function handleRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const age   = document.getElementById('reg-age').value;
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-password').value;

  if (!name || !age || !email || !pass) { showError('reg-error', 'Preencha todos os campos.'); return; }
  if (pass.length < 6)                  { showError('reg-error', 'A senha precisa ter pelo menos 6 caracteres.'); return; }

  setLoading('btn-register', true, 'Cadastrar');

  try {
    const user = await supabaseRegister(email, pass, name, age);
    currentAuthId = user.id;
    currentUser   = await fetchProfile(user.id);
    completedProjects = [];
    userCerts         = [];
    enterApp();
  } catch (err) {
    showError('reg-error', traduzirErroAuth(err.message));
  } finally {
    setLoading('btn-register', false, 'Cadastrar');
  }
}


// ===== AUTH — LOGOUT =====

async function handleLogout() {
  await supabaseLogout();
  currentUser       = null;
  currentAuthId     = null;
  completedProjects = [];
  userCerts         = [];
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('login-screen').style.display = 'flex';
}


// ===== TRADUÇÃO DE ERROS DO SUPABASE =====

function traduzirErroAuth(msg) {
  if (msg.includes('Invalid login'))        return 'Email ou senha incorretos.';
  if (msg.includes('already registered'))   return 'Este email já está cadastrado.';
  if (msg.includes('valid email'))          return 'Informe um email válido.';
  if (msg.includes('Password should be'))   return 'A senha precisa ter pelo menos 6 caracteres.';
  if (msg.includes('Network'))              return 'Erro de conexão. Verifique sua internet.';
  return msg;
}


// ===== CARREGAR EXTRAS (projetos e certificados) =====

async function loadUserExtras(userId) {
  const [projs, certs] = await Promise.all([
    fetchUserProjects(userId),
    fetchCertificates(userId)
  ]);
  completedProjects = projs.map(p => p.project_id);
  userCerts         = certs;
}


// ===== APP ENTRY =====

function enterApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-app').classList.remove('hidden');

  // Mostra a aba Admin no menu só para quem tem is_admin = true no perfil
  document.getElementById('nav-admin-item').classList.toggle('hidden', !currentUser.is_admin);

  if (!currentUser.quiz_done) {
    showQuiz();
  } else {
    renderDashboard();
  }
  lucide.createIcons();
}


// ===== QUIZ =====

const quizQuestions = [
  { q: "Qual seu nível atual?",            options: ["Iniciante total", "Já sei o básico", "Intermediário"] },
  { q: "Qual área mais te interessa?",     options: ["Front-end", "Back-end", "Full Stack", "Mobile", "Ainda não sei"] },
  { q: "Qual seu objetivo profissional?",  options: ["Estágio em 6 meses", "Primeiro emprego em 1 ano", "Freelancer", "Criar meu próprio produto"] }
];

function showQuiz() {
  document.getElementById('quiz-modal').classList.remove('hidden');
  renderQuizStep(0);
}

function renderQuizStep(step) {
  const container = document.getElementById('quiz-steps');
  if (step >= quizQuestions.length) { finishQuiz(); return; }
  const q = quizQuestions[step];
  container.innerHTML = `
    <p class="font-semibold mb-4 text-lg">${step + 1}. ${q.q}</p>
    <div class="space-y-3">
      ${q.options.map((o, i) => `
        <button onclick="answerQuiz(${step}, ${i}, '${o}')"
          class="w-full text-left card-glass p-4 rounded-lg hover:border-green-400/50 transition border border-white/10">
          ${o}
        </button>
      `).join('')}
    </div>
    <p class="text-white/30 text-xs mt-4">${step + 1} de ${quizQuestions.length}</p>
  `;
}

function answerQuiz(step, idx, answer) {
  quizAnswers[step] = answer;
  renderQuizStep(step + 1);
}

async function finishQuiz() {
  const track = quizAnswers[1] || 'Full Stack';
  const goal  = quizAnswers[2] || 'Primeiro emprego';

  try {
    // XP e nível são calculados no banco (função award_quiz_xp), não aqui.
    // O cliente só manda as respostas e a trilha/objetivo escolhidos.
    await awardQuizXP(quizAnswers, track, goal);
    currentUser = await fetchProfile(currentAuthId);
  } catch (e) {
    console.warn('Erro ao salvar quiz:', e.message);
  }

  document.getElementById('quiz-modal').classList.add('hidden');
  renderDashboard();
}


// ===== TABS =====

function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  const renderers = {
    dashboard: renderDashboard,
    perfil:    renderProfile,
    evolucao:  renderCareers,
    estudos:   renderSubjects,
    projetos:  renderProjects,
    portfolio: renderPortfolio,
    admin:     renderAdminPanel
  };
  if (renderers[tab]) renderers[tab]();
}


// ===== RENDER: DASHBOARD =====

function renderDashboard() {
  if (!currentUser) return;
  document.getElementById('nav-user').textContent  = currentUser.name;
  document.getElementById('nav-level').textContent = 'Nível ' + currentUser.level;
  document.getElementById('nav-xp').textContent    = currentUser.xp + ' XP';
  document.getElementById('dash-name').textContent  = currentUser.name.split(' ')[0];
  document.getElementById('dash-level').textContent = 'Nível ' + currentUser.level;
  document.getElementById('dash-xp').textContent    = currentUser.xp + ' XP';
  document.getElementById('dash-track').textContent = currentUser.track || 'Não definida';

  const progress = Math.min(100, Math.round((currentUser.xp / 1000) * 100));
  document.getElementById('dash-progress').style.width = progress + '%';
  document.getElementById('dash-progress-text').textContent = progress;

  const recs = [
    "Comece estudando HTML no Centro de Estudos",
    "Pratique CSS criando um card responsivo",
    "Aprenda JavaScript criando uma calculadora",
    "Explore Git/GitHub para versionar seus projetos",
    "Tente criar seu primeiro projeto com banco de dados"
  ];
  document.getElementById('dash-recommendation').textContent = recs[currentUser.level - 1] || recs[0];
}


// ===== RENDER: PERFIL =====

function renderProfile() {
  document.getElementById('prof-name').textContent  = currentUser.name;
  document.getElementById('prof-age').textContent   = currentUser.age + ' anos';
  document.getElementById('prof-goal').textContent  = currentUser.goal  || 'Não definido';
  document.getElementById('prof-level').textContent = 'Nível ' + currentUser.level;
  document.getElementById('prof-xp').textContent    = currentUser.xp + ' XP';

  const certsHtml = userCerts.length
    ? userCerts.map(c => `<div class="bg-white/5 rounded-lg p-3 text-sm">🏆 ${c.title}</div>`).join('')
    : '<p class="text-white/40 text-sm">Nenhum certificado ainda. Continue estudando!</p>';
  document.getElementById('prof-certs').innerHTML = certsHtml;

  const projsHtml = completedProjects.length
    ? completedProjects.map(id => {
        const proj = projects.flatMap(g => g.items).find(p => p.dbId === id);
        return proj ? `<div class="bg-white/5 rounded-lg p-3 text-sm">✅ ${proj.name}</div>` : '';
      }).join('')
    : '<p class="text-white/40 text-sm">Nenhum projeto concluído. Vá para a aba Projetos!</p>';
  document.getElementById('prof-projects').innerHTML = projsHtml;
}


// ===== RENDER: CARREIRAS =====

function renderCareers() {
  document.getElementById('careers-grid').innerHTML = careers.map(c => `
    <div class="card-glass career-card rounded-xl p-5 border border-white/5">
      <h4 class="font-bold ${c.color} mb-2">${c.name}</h4>
      <p class="text-white/60 text-sm mb-3">${c.desc}</p>
      <p class="text-xs text-white/40 mb-1">💰 ${c.salary}</p>
      <p class="text-xs text-white/40 mb-2">⏱️ ${c.time} para entrar</p>
      <div class="flex flex-wrap gap-1">
        ${c.skills.map(s => `<span class="text-xs bg-white/10 px-2 py-1 rounded">${s}</span>`).join('')}
      </div>
    </div>
  `).join('');
}


// ===== RENDER: MATÉRIAS =====

function renderSubjects() {
  document.getElementById('study-content').classList.add('hidden');
  document.getElementById('subjects-grid').innerHTML = subjects.map(s => `
    <div class="subject-card card-glass rounded-xl p-5 border ${s.color} text-center" onclick="openSubject('${s.id}')">
      <div class="text-3xl mb-2">${s.icon}</div>
      <p class="font-semibold text-sm">${s.name}</p>
    </div>
  `).join('');
  document.getElementById('subjects-grid').classList.remove('hidden');
}

async function openSubject(id) {
  const content = subjectContent[id];
  if (!content) return;

  document.getElementById('subjects-grid').classList.add('hidden');
  const el = document.getElementById('study-content');
  el.classList.remove('hidden');
  el.innerHTML = `
    <button onclick="closeSubject()" class="btn-secondary mb-4 px-4 py-2 rounded-lg text-sm">← Voltar</button>
    <div class="card-glass rounded-xl p-6 mb-4">
      <h3 class="text-xl font-bold text-green-400 mb-2">${content.title}</h3>
      <p class="text-white/70 mb-4">${content.summary}</p>
      <h4 class="font-semibold mb-2">📚 Tópicos Principais:</h4>
      <ul class="text-white/60 text-sm space-y-1 mb-4">${content.topics.map(t => `<li>• ${t}</li>`).join('')}</ul>
    </div>
    <div class="card-glass rounded-xl p-6 mb-4">
      <h4 class="font-semibold mb-2 text-yellow-400">💻 Exemplo Prático:</h4>
      <pre class="bg-black/40 rounded-lg p-4 text-sm text-green-300 overflow-x-auto font-mono">${content.example}</pre>
    </div>
    <div class="card-glass rounded-xl p-6 mb-4">
      <h4 class="font-semibold mb-2 text-purple-400">🎯 Exercício:</h4>
      <p class="text-white/70 text-sm">${content.exercise}</p>
      <button onclick="completeExercise('${id}')" class="btn-primary mt-3 px-4 py-2 rounded-lg text-sm">
        Marcar como concluído (+30 XP)
      </button>
    </div>
    <div class="card-glass rounded-xl p-6">
      <h4 class="font-semibold mb-3 text-blue-400">🎬 Vídeo de Apoio:</h4>
      <div class="aspect-video rounded-lg overflow-hidden bg-black/30">
        <iframe src="${content.video}" class="w-full h-full" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>
    </div>
  `;

  // +10 XP por abrir o conteúdo — calculado e salvo no banco (award_subject_view_xp),
  // não somado aqui no cliente.
  try {
    await awardSubjectViewXP(id);
    currentUser = await fetchProfile(currentAuthId);
  } catch (e) {
    console.warn('Erro ao salvar progresso:', e.message);
  }

  renderDashboard();
}

function closeSubject() {
  document.getElementById('study-content').classList.add('hidden');
  document.getElementById('subjects-grid').classList.remove('hidden');
}

async function completeExercise(id) {
  const subj = subjects.find(s => s.id === id);
  const certTitle = subj ? subj.name + ' - Básico' : id + ' - Básico';

  try {
    // +30 XP, progresso e certificado — tudo em uma função só no banco
    // (award_exercise_xp), que também impede repetir o mesmo exercício
    // pra farmar XP de novo.
    await awardExerciseXP(id, certTitle);
    currentUser = await fetchProfile(currentAuthId);
    userCerts   = await fetchCertificates(currentAuthId);
  } catch (e) {
    console.warn('Erro ao concluir exercício:', e.message);
  }

  renderDashboard();

  const btn = event.target;
  btn.textContent = '✅ Concluído!';
  btn.disabled = true;
  btn.classList.add('opacity-50');
}


// ===== RENDER: PROJETOS =====

function renderProjects() {
  document.getElementById('projects-grid').innerHTML = projects.map(level => `
    <div>
      <h3 class="font-bold ${level.color} mb-3">${level.level}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        ${level.items.map(p => {
          const done = completedProjects.includes(p.dbId);
          return `
            <div class="card-glass rounded-xl p-5 border ${level.border}">
              <h4 class="font-semibold mb-1">${p.name}</h4>
              <p class="text-white/50 text-xs mb-2">${p.desc}</p>
              <p class="text-xs mb-3">${p.difficulty}</p>
              <button onclick="startProject(${p.dbId}, '${p.name}', this)"
                class="btn-primary px-3 py-1.5 rounded text-xs w-full ${done ? 'opacity-50' : ''}"
                ${done ? 'disabled' : ''}>
                ${done ? '✅ Concluído!' : 'Iniciar Projeto'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
}

async function startProject(projectId, projectName, btn) {
  if (completedProjects.includes(projectId)) return;

  btn.disabled = true;
  btn.textContent = 'Salvando...';

  completedProjects.push(projectId);

  try {
    // +100 XP calculado e salvo no banco (award_project_xp), que também
    // impede marcar o mesmo projeto duas vezes pra ganhar XP repetido.
    await awardProjectXP(projectId);
    currentUser = await fetchProfile(currentAuthId);
  } catch (e) {
    console.warn('Erro ao salvar projeto:', e.message);
  }

  btn.textContent = '✅ Concluído!';
  btn.classList.add('opacity-50');
  renderDashboard();
}


// ===== RENDER: PORTFÓLIO =====

function renderPortfolio() {
  const certNames = userCerts.map(c =>
    `<span class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">${c.title.replace(' - Básico','')}</span>`
  ).join('') || '<span class="text-white/40 text-xs">Nenhuma ainda</span>';

  const projNames = completedProjects.length
    ? completedProjects.map(id => {
        const proj = projects.flatMap(g => g.items).find(p => p.dbId === id);
        return proj ? `<div class="bg-white/5 rounded-lg p-3 mb-2 text-sm">✅ ${proj.name}</div>` : '';
      }).join('')
    : '<p class="text-white/40 text-xs">Complete projetos na aba Projetos para preencher seu portfólio!</p>';

  document.getElementById('portfolio-content').innerHTML = `
    <div class="text-center mb-6">
      <div class="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-purple-500 mx-auto mb-3 flex items-center justify-center text-2xl font-bold">
        ${currentUser.name.charAt(0)}
      </div>
      <h3 class="text-xl font-bold">${currentUser.name}</h3>
      <p class="text-white/50">Estudante de Desenvolvimento de Sistemas</p>
      <p class="text-green-400 text-sm">${currentUser.track || 'Explorando'} • Nível ${currentUser.level}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <h4 class="font-semibold text-sm text-white/60 mb-2">🛠️ Habilidades</h4>
        <div class="flex flex-wrap gap-2">${certNames}</div>
      </div>
      <div>
        <h4 class="font-semibold text-sm text-white/60 mb-2">📊 Estatísticas</h4>
        <p class="text-xs text-white/50">
          ${currentUser.xp} XP • ${completedProjects.length} projetos • ${userCerts.length} certificados
        </p>
      </div>
    </div>
    <div>
      <h4 class="font-semibold text-sm text-white/60 mb-2">📁 Projetos</h4>
      ${projNames}
    </div>
  `;
}


// ===== RENDER: ADMIN =====
// Lista todos os alunos cadastrados. A tabela vem vazia (só o
// próprio usuário) se a chamada cair em alguém que não é admin —
// a proteção de verdade é a política RLS lá no Supabase, isso
// aqui só monta a tela pra quem tem acesso.

// Escapa aspas simples e barras pra poder colocar o texto com segurança
// dentro de um atributo onclick="..." (ex: nomes com apóstrofo).
function escJsStr(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function renderAdminPanel() {
  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = '<tr><td class="p-3 text-white/40" colspan="8">Carregando...</td></tr>';

  try {
    const alunos = await fetchAllProfiles();
    document.getElementById('admin-total').textContent = alunos.length;

    tbody.innerHTML = alunos.length
      ? alunos.map(a => {
          const nomeEsc = escJsStr(a.name);
          const isSelf  = a.id === currentAuthId;

          const acoes = isSelf
            ? '<span class="text-white/30 text-xs">— você —</span>'
            : `
              <div class="flex gap-1 flex-wrap">
                <button onclick="adminHandleResetXP('${a.id}', '${nomeEsc}')"
                  class="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition">
                  Resetar XP
                </button>
                <button onclick="adminHandleToggleAdmin('${a.id}', '${nomeEsc}', ${!!a.is_admin})"
                  class="text-xs px-2 py-1 rounded transition ${a.is_admin ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' : 'bg-white/10 hover:bg-white/20'}">
                  ${a.is_admin ? 'Remover admin' : 'Tornar admin'}
                </button>
                <button onclick="adminHandleDelete('${a.id}', '${nomeEsc}')"
                  class="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition">
                  Excluir
                </button>
              </div>
            `;

          return `
            <tr class="border-b border-white/5">
              <td class="p-3">
                <button onclick="adminShowDetails('${a.id}')" class="hover:underline hover:text-green-400 transition text-left">${a.name}</button>${a.is_admin ? ' <span class="text-purple-400 text-xs">(admin)</span>' : ''}
              </td>
              <td class="p-3 text-white/60">${a.email}</td>
              <td class="p-3">${a.age ?? '-'}</td>
              <td class="p-3">Nível ${a.level}</td>
              <td class="p-3">${a.xp} XP</td>
              <td class="p-3">${a.track || '-'}</td>
              <td class="p-3">${a.quiz_done ? '✅' : '—'}</td>
              <td class="p-3">${acoes}</td>
            </tr>
          `;
        }).join('')
      : '<tr><td class="p-3 text-white/40" colspan="8">Nenhum aluno encontrado.</td></tr>';
  } catch (e) {
    tbody.innerHTML = `<tr><td class="p-3 text-red-400" colspan="8">Erro ao carregar: ${e.message}</td></tr>`;
  }
}

// ===== ADMIN: AÇÕES (resetar XP, tornar/remover admin, excluir) =====
// Cada função confirma com o admin antes de agir (modal no tema do site,
// não o confirm() cinza do navegador), chama o Supabase e recarrega a
// tabela. Erros do banco (ex: RLS bloqueando porque quem chamou não é
// admin de verdade) aparecem num toast, não num alert().

async function adminHandleResetXP(id, nome) {
  const ok = await themedConfirm(`Resetar XP e nível de ${nome} para zero?`);
  if (!ok) return;
  try {
    await adminResetXP(id);
    renderAdminPanel();
    showToast(`XP de ${nome} foi resetado.`, 'success');
  } catch (e) {
    showToast('Erro ao resetar XP: ' + e.message, 'error');
  }
}

async function adminHandleToggleAdmin(id, nome, isCurrentlyAdmin) {
  const msg = isCurrentlyAdmin
    ? `Remover privilégio de admin de ${nome}?`
    : `Tornar ${nome} administrador? Essa pessoa passará a ver esta mesma tela de admin.`;
  const ok = await themedConfirm(msg);
  if (!ok) return;
  try {
    await adminSetIsAdmin(id, !isCurrentlyAdmin);
    renderAdminPanel();
    showToast(isCurrentlyAdmin ? `${nome} não é mais admin.` : `${nome} agora é admin.`, 'success');
  } catch (e) {
    showToast('Erro ao alterar admin: ' + e.message, 'error');
  }
}

async function adminHandleDelete(id, nome) {
  const msg = `Excluir ${nome} permanentemente?\n\nIsso remove perfil, XP, certificados, projetos e respostas do quiz. Não pode ser desfeito.`;
  const ok = await themedConfirm(msg, true); // true = estilo de perigo (vermelho)
  if (!ok) return;
  try {
    await adminDeleteStudent(id);
    renderAdminPanel();
    showToast(`${nome} foi excluído.`, 'success');
  } catch (e) {
    showToast('Erro ao excluir aluno: ' + e.message, 'error');
  }
}


// ===== ADMIN: DETALHES DE UM ALUNO (quiz, projetos, certificados) =====

// "Pergunta 1" salvo no banco não tem o texto da pergunta, só o número.
// Aqui a gente recupera o texto real usando o mesmo array quizQuestions
// que monta o quiz — assim o admin vê a pergunta, não só "Pergunta 1".
function quizQuestionLabel(question) {
  const m = /Pergunta (\d+)/.exec(question || '');
  if (m) {
    const idx = parseInt(m[1], 10) - 1;
    if (quizQuestions[idx]) return quizQuestions[idx].q;
  }
  return question;
}

async function adminShowDetails(id) {
  const modal = document.getElementById('admin-detail-modal');
  document.getElementById('admin-detail-name').textContent  = 'Carregando...';
  document.getElementById('admin-detail-email').textContent = '';
  document.getElementById('admin-detail-content').innerHTML = '';
  modal.classList.remove('hidden');

  try {
    const [profile, quizRows, projRows, certRows] = await Promise.all([
      fetchProfile(id),
      fetchQuizAnswers(id),
      fetchUserProjects(id),
      fetchCertificates(id)
    ]);
    document.getElementById('admin-detail-name').textContent  = profile.name;
    document.getElementById('admin-detail-email').textContent = profile.email;
    renderStudentDetailModal(quizRows, projRows, certRows);
  } catch (e) {
    document.getElementById('admin-detail-content').innerHTML =
      `<p class="text-red-400 text-sm">Erro ao carregar detalhes: ${e.message}</p>`;
  }
}

function closeAdminDetailModal() {
  document.getElementById('admin-detail-modal').classList.add('hidden');
}

function renderStudentDetailModal(quizRows, projRows, certRows) {
  const quizHtml = quizRows.length
    ? quizRows.map(q => `
        <div class="bg-white/5 rounded-lg p-3 mb-2 text-sm">
          <p class="text-white/40 text-xs mb-1">${quizQuestionLabel(q.question)}</p>
          <p>${q.answer}</p>
        </div>
      `).join('')
    : '<p class="text-white/40 text-sm">Quiz não realizado.</p>';

  const projHtml = projRows.length
    ? projRows.map(p => `
        <div class="bg-white/5 rounded-lg p-3 mb-2 text-sm">
          ✅ ${p.projects ? p.projects.name : ('Projeto #' + p.project_id)}
          ${p.projects && p.projects.level ? `<span class="text-white/40 text-xs"> • ${p.projects.level}</span>` : ''}
        </div>
      `).join('')
    : '<p class="text-white/40 text-sm">Nenhum projeto concluído.</p>';

  const certHtml = certRows.length
    ? certRows.map(c => `
        <div class="bg-white/5 rounded-lg p-3 mb-2 text-sm">
          🏆 ${c.title}
          ${c.issued_at ? `<span class="text-white/40 text-xs"> • ${new Date(c.issued_at).toLocaleDateString('pt-BR')}</span>` : ''}
        </div>
      `).join('')
    : '<p class="text-white/40 text-sm">Nenhum certificado ainda.</p>';

  document.getElementById('admin-detail-content').innerHTML = `
    <div class="mb-6">
      <h3 class="font-bold text-purple-400 mb-2">📝 Respostas do Quiz</h3>
      ${quizHtml}
    </div>
    <div class="mb-6">
      <h3 class="font-bold text-yellow-400 mb-2">💻 Projetos Concluídos</h3>
      ${projHtml}
    </div>
    <div>
      <h3 class="font-bold text-green-400 mb-2">🏆 Certificados</h3>
      ${certHtml}
    </div>
  `;
}


// ===== INIT =====

async function init() {
  try {
    const session = await getSession();

    if (session) {
      currentAuthId = session.user.id;
      currentUser   = await fetchProfile(session.user.id);
      await loadUserExtras(session.user.id);
      enterApp();
    } else {
      document.getElementById('login-screen').style.display = 'flex';
    }
  } catch (e) {
    console.warn('Erro no init:', e.message);
    document.getElementById('login-screen').style.display = 'flex';
  }

  lucide.createIcons();
}

init();
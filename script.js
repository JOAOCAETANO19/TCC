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


// ===== BRIEFING DOS PROJETOS =====
// Cada projeto tem um briefing no formato usado no mercado: contexto do
// cliente, requisitos funcionais, entregáveis e critérios de aceite.
// A chave é o dbId do projeto.
const projectBriefings = {
  1: {
    contexto: "Uma escola de reforço quer uma calculadora simples no site para os alunos conferirem contas rapidamente durante os exercícios.",
    tempo: "2 a 4 horas",
    tecnologias: ["HTML", "CSS", "JavaScript"],
    requisitos: [
      "Operações de soma, subtração, multiplicação e divisão",
      "Botão de limpar (C) e de apagar o último dígito",
      "Exibir a operação em andamento e o resultado no visor",
      "Tratar divisão por zero sem quebrar a interface"
    ],
    entregaveis: [
      "Página funcional publicada (GitHub Pages ou similar)",
      "Repositório com README explicando como rodar",
      "Print ou GIF da calculadora em uso"
    ],
    criterios: [
      "Todas as operações retornam o valor correto",
      "Nenhum erro no console do navegador",
      "Layout utilizável no celular"
    ]
  },
  2: {
    contexto: "Um profissional autônomo precisa organizar as tarefas do dia em uma lista rápida, sem depender de aplicativos pagos.",
    tempo: "3 a 5 horas",
    tecnologias: ["HTML", "CSS", "JavaScript", "localStorage"],
    requisitos: [
      "Adicionar tarefa com texto digitado pelo usuário",
      "Marcar e desmarcar tarefa como concluída",
      "Remover tarefa da lista",
      "Salvar as tarefas no localStorage para não perder ao recarregar",
      "Mostrar contador de tarefas pendentes"
    ],
    entregaveis: [
      "Aplicação publicada e funcional",
      "Código no GitHub com commits organizados",
      "README com as funcionalidades listadas"
    ],
    criterios: [
      "As tarefas continuam salvas após atualizar a página",
      "Não é possível adicionar tarefa vazia",
      "Interface responsiva"
    ]
  },
  3: {
    contexto: "Um estúdio de podcast quer um relógio na tela do estúdio mostrando hora atual e um cronômetro para controlar o tempo de gravação.",
    tempo: "2 a 4 horas",
    tecnologias: ["HTML", "CSS", "JavaScript", "setInterval"],
    requisitos: [
      "Exibir hora, minuto e segundo atualizando em tempo real",
      "Mostrar a data por extenso em português",
      "Cronômetro com iniciar, pausar e zerar",
      "Alternar entre formato 12h e 24h"
    ],
    entregaveis: [
      "Página publicada com o relógio rodando",
      "Repositório versionado no GitHub"
    ],
    criterios: [
      "O relógio não atrasa nem duplica o intervalo ao pausar",
      "O cronômetro conta corretamente após pausar e retomar",
      "Legível a distância (fonte grande e contraste alto)"
    ]
  },
  4: {
    contexto: "Uma loja online quer acompanhar vendas, visitas e produtos mais vendidos em um painel único, em vez de abrir várias planilhas.",
    tempo: "8 a 12 horas",
    tecnologias: ["HTML", "CSS", "JavaScript", "Chart.js", "API REST"],
    requisitos: [
      "Cards de indicadores (total de vendas, ticket médio, visitas)",
      "Pelo menos dois gráficos diferentes (linha e barra ou pizza)",
      "Filtro por período que atualiza os gráficos",
      "Carregar dados de uma API ou arquivo JSON",
      "Estado de carregamento e mensagem para lista vazia"
    ],
    entregaveis: [
      "Dashboard publicado e navegável",
      "Código no GitHub com estrutura de pastas organizada",
      "README com print do painel e origem dos dados"
    ],
    criterios: [
      "Os gráficos refletem o filtro selecionado",
      "O painel funciona em tela de notebook e de celular",
      "Nenhum dado fixo escrito direto no HTML"
    ]
  },
  5: {
    contexto: "Uma clínica precisa de uma área restrita onde apenas usuários autenticados vejam a agenda de pacientes.",
    tempo: "8 a 12 horas",
    tecnologias: ["JavaScript", "Supabase ou Firebase Auth", "Rotas protegidas"],
    requisitos: [
      "Tela de cadastro e tela de login com validação dos campos",
      "Mensagens de erro claras para senha ou e-mail inválidos",
      "Sessão persistente ao recarregar a página",
      "Página interna acessível apenas com usuário logado",
      "Botão de logout que limpa a sessão"
    ],
    entregaveis: [
      "Aplicação publicada com fluxo completo de login",
      "Repositório com instruções de configuração do provedor de autenticação",
      "Usuário de teste documentado no README"
    ],
    criterios: [
      "Acessar a rota interna deslogado redireciona para o login",
      "Senha nunca aparece no console ou na URL",
      "Erros de autenticação não quebram a tela"
    ]
  },
  6: {
    contexto: "Um professor quer aplicar quizzes rápidos em sala e mostrar o ranking da turma no telão.",
    tempo: "6 a 10 horas",
    tecnologias: ["HTML", "CSS", "JavaScript"],
    requisitos: [
      "Banco com no mínimo 10 perguntas de múltipla escolha",
      "Timer por pergunta que avança automaticamente ao zerar",
      "Pontuação calculada ao final com número de acertos",
      "Ranking com os melhores resultados salvos localmente",
      "Botão para refazer o quiz embaralhando as perguntas"
    ],
    entregaveis: [
      "Quiz publicado e jogável do início ao fim",
      "Repositório no GitHub",
      "README explicando como adicionar novas perguntas"
    ],
    criterios: [
      "Não é possível responder a mesma pergunta duas vezes",
      "O timer para quando o quiz termina",
      "O ranking ordena corretamente por pontuação"
    ]
  },
  7: {
    contexto: "Um pequeno comércio de roupas quer vender pela internet com catálogo, carrinho e finalização de pedido.",
    tempo: "20 a 30 horas",
    tecnologias: ["JavaScript", "Framework de UI", "API REST", "Banco de dados"],
    requisitos: [
      "Catálogo de produtos com imagem, preço e descrição",
      "Filtro por categoria e busca por nome",
      "Carrinho com alterar quantidade e remover item",
      "Cálculo de subtotal, frete e total",
      "Tela de checkout com validação dos dados de entrega",
      "Persistência do carrinho entre sessões"
    ],
    entregaveis: [
      "Loja publicada e navegável",
      "Repositório com README e instruções de instalação",
      "Documentação das rotas ou do modelo de dados usado"
    ],
    criterios: [
      "O total do carrinho sempre bate com os itens listados",
      "O checkout não aceita dados obrigatórios em branco",
      "A loja é usável no celular"
    ]
  },
  8: {
    contexto: "Uma comunidade de estudantes quer um espaço próprio para publicar dúvidas, comentar e acompanhar outros membros.",
    tempo: "25 a 40 horas",
    tecnologias: ["JavaScript", "Framework de UI", "Autenticação", "Banco de dados"],
    requisitos: [
      "Cadastro e login de usuários",
      "Perfil com foto, biografia e lista de publicações",
      "Feed com posts em ordem cronológica",
      "Curtir e comentar publicações",
      "Seguir e deixar de seguir outros perfis",
      "Feed filtrado apenas com quem o usuário segue"
    ],
    entregaveis: [
      "Aplicação publicada com fluxo completo",
      "Repositório organizado no GitHub",
      "Modelo de dados documentado (tabelas e relações)"
    ],
    criterios: [
      "Um usuário só edita ou apaga os próprios posts",
      "Contadores de curtidas e comentários batem com o banco",
      "O feed carrega sem travar com muitos posts"
    ]
  },
  9: {
    contexto: "Uma equipe remota precisa de um chat interno simples para conversar em tempo real durante os plantões.",
    tempo: "20 a 30 horas",
    tecnologias: ["JavaScript", "WebSocket ou Supabase Realtime", "Banco de dados"],
    requisitos: [
      "Envio e recebimento de mensagens em tempo real",
      "Identificação do autor e horário de cada mensagem",
      "Histórico carregado ao entrar na sala",
      "Indicador de usuários online",
      "Aviso de digitando quando alguém está escrevendo"
    ],
    entregaveis: [
      "Chat publicado e testado com dois navegadores abertos",
      "Repositório com README explicando o servidor de tempo real",
      "Vídeo curto ou GIF da conversa acontecendo"
    ],
    criterios: [
      "A mensagem aparece para os dois lados sem recarregar a página",
      "O histórico permanece após sair e voltar",
      "Mensagem vazia não é enviada"
    ]
  }
};


// ===== STATE =====
let currentUser    = null;  // dados do perfil (tabela profiles)
let currentAuthId  = null;  // UUID do auth.users
let completedProjects = []; // array de project_id já concluídos
let userCerts      = [];    // array de { subject_id, title }
let quizAnswers    = [];
let lastCertModel  = null;  // certificado atualmente aberto no modal
let adminDetailStudent = null;
let adminDetailCerts = [];
let publicProfile  = null;  // perfil carregado na visão pública (sem login)
let publicCerts    = [];    // certificados carregados na visão pública

const CERT_W = 1400;
const CERT_H = 990;
const CERT_ACCENTS = {
  html: '#f97316', css: '#60a5fa', js: '#facc15', sql: '#22d3ee',
  python: '#4ade80', java: '#f87171', poo: '#c084fc', git: '#d1d5db',
  redes: '#2dd4bf', apis: '#818cf8', banco: '#fbbf24', logica: '#f472b6'
};


// ===== CERTIFICADO VISUAL =====
// O diploma é desenhado em canvas para a tela, o PNG e a impressão
// ficarem iguais. Não substitui a tabela certificates: só apresenta
// o que o banco já emitiu ao concluir um exercício.

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function certVerificationCode(userId, subjectId) {
  const raw = String(userId || 'demo') + ':' + String(subjectId || 'mod');
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 6);
  const prefix = String(subjectId || 'MOD').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'MOD';
  return 'PD-' + prefix + '-' + hex;
}

function formatCertDate(iso) {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function buildCertViewModel(cert, student) {
  const who = student || currentUser || {};
  const subj = subjects.find(s => s.id === cert.subject_id);
  return {
    studentName: who.name || 'Aluno',
    subjectName: subj ? subj.name : (cert.subject_id || 'Módulo'),
    subjectId: cert.subject_id || 'modulo',
    title: cert.title || ((subj ? subj.name : 'Módulo') + ' - Básico'),
    issuedAt: cert.issued_at || new Date().toISOString(),
    code: certVerificationCode(who.id || currentAuthId, cert.subject_id),
    level: who.level || 1,
    xp: who.xp || 0,
    track: who.track || '',
    isDemo: !!(student && student.id === 'demo')
  };
}

async function ensureCertFonts() {
  if (!document.fonts || !document.fonts.load) return;
  await Promise.all([
    document.fonts.load('700 64px Cinzel'),
    document.fonts.load('600 42px Cinzel'),
    document.fonts.load('400 22px Cinzel'),
    document.fonts.load('400 36px "Great Vibes"'),
    document.fonts.load('600 22px "Plus Jakarta Sans"'),
    document.fonts.load('600 18px "JetBrains Mono"')
  ]).catch(() => {});
}

function fitCanvasText(ctx, text, maxWidth, maxSize, minSize, fontFor) {
  let size = maxSize;
  ctx.font = fontFor(size);
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = fontFor(size);
  }
  return size;
}

function wrapCanvasText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCertCorner(ctx, x, y, dx, dy, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(x, y + dy * 34);
  ctx.lineTo(x, y);
  ctx.lineTo(x + dx * 34, y);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + dx * 8, y + dy * 26);
  ctx.lineTo(x + dx * 8, y + dy * 8);
  ctx.lineTo(x + dx * 26, y + dy * 8);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + dx * 14, y + dy * 22);
  ctx.lineTo(x + dx * 22, y + dy * 14);
  ctx.lineTo(x + dx * 14, y + dy * 6);
  ctx.lineTo(x + dx * 6, y + dy * 14);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCertificate(canvas, model) {
  const scale = 2;
  canvas.width = CERT_W * scale;
  canvas.height = CERT_H * scale;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  const w = CERT_W;
  const h = CERT_H;
  const accent = CERT_ACCENTS[model.subjectId] || '#00ff88';

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0b1024');
  bg.addColorStop(0.45, '#14133a');
  bg.addColorStop(1, '#0c1b2e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 40, w * 0.5, h * 0.42, 520);
  glow.addColorStop(0, 'rgba(139, 92, 246, 0.22)');
  glow.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.045)';
  ctx.lineWidth = 1;
  for (let x = 40; x < w; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 40; y < h; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();

  const gold = ctx.createLinearGradient(120, 0, w - 120, 0);
  gold.addColorStop(0, '#8a6b1f');
  gold.addColorStop(0.5, '#f3e5ab');
  gold.addColorStop(1, '#8a6b1f');

  ctx.strokeStyle = gold;
  ctx.lineWidth = 5;
  roundedRectPath(ctx, 36, 36, w - 72, h - 72, 18);
  ctx.stroke();
  ctx.lineWidth = 1.4;
  roundedRectPath(ctx, 50, 50, w - 100, h - 100, 14);
  ctx.stroke();

  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1;
  roundedRectPath(ctx, 64, 64, w - 128, h - 128, 10);
  ctx.stroke();
  ctx.globalAlpha = 1;

  drawCertCorner(ctx, 78, 78, 1, 1, '#d4af37');
  drawCertCorner(ctx, w - 78, 78, -1, 1, '#d4af37');
  drawCertCorner(ctx, 78, h - 78, 1, -1, '#d4af37');
  drawCertCorner(ctx, w - 78, h - 78, -1, -1, '#d4af37');

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '700 28px "JetBrains Mono", monospace';
  ctx.fillStyle = '#4ade80';
  ctx.fillText('<Pratica.dev/>', w / 2 - 28, 118);
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#c4b5fd';
  ctx.fillText('2.0', w / 2 + 132, 118);

  ctx.strokeStyle = gold;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 170, 148);
  ctx.lineTo(w / 2 + 170, 148);
  ctx.stroke();

  ctx.font = '700 46px Cinzel, "Times New Roman", serif';
  ctx.fillStyle = gold;
  ctx.letterSpacing = '6px';
  ctx.fillText('CERTIFICADO DE CONCLUSÃO', w / 2, 198);
  ctx.letterSpacing = '0px';

  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.fillText('Curso Técnico em Desenvolvimento de Sistemas', w / 2, 242);

  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(243, 229, 171, 0.85)';
  ctx.fillText('Certificamos que', w / 2, 300);

  const nameSize = fitCanvasText(
    ctx,
    model.studentName,
    980,
    58,
    28,
    size => '700 ' + size + 'px Cinzel, "Times New Roman", serif'
  );
  ctx.font = '700 ' + nameSize + 'px Cinzel, "Times New Roman", serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(model.studentName, w / 2, 358);

  ctx.strokeStyle = gold;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 260, 392);
  ctx.lineTo(w / 2 + 260, 392);
  ctx.stroke();

  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('concluiu com aproveitamento o módulo', w / 2, 430);

  const subjectSize = fitCanvasText(
    ctx,
    model.subjectName,
    900,
    48,
    26,
    size => '700 ' + size + 'px Cinzel, "Times New Roman", serif'
  );
  ctx.font = '700 ' + subjectSize + 'px Cinzel, "Times New Roman", serif';
  ctx.fillStyle = accent;
  ctx.fillText(model.subjectName, w / 2, 482);

  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#f3e5ab';
  ctx.fillText(model.title, w / 2, 526);

  ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  const body = 'demonstrando dedicação aos estudos e domínio dos fundamentos apresentados na plataforma educacional Pratica.dev 2.0, mentor digital de carreira em tecnologia.';
  const lines = wrapCanvasText(ctx, body, 920);
  lines.forEach((line, i) => ctx.fillText(line, w / 2, 572 + i * 26));

  if (model.isDemo) {
    ctx.save();
    ctx.translate(w / 2, h / 2 + 20);
    ctx.rotate(-Math.PI / 7);
    ctx.font = '700 92px Cinzel, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.055)';
    ctx.fillText('MODELO', 0, 0);
    ctx.restore();
  }

  const sealX = w / 2;
  const sealY = 768;
  const sealGlow = ctx.createRadialGradient(sealX, sealY, 10, sealX, sealY, 78);
  sealGlow.addColorStop(0, 'rgba(212, 175, 55, 0.28)');
  sealGlow.addColorStop(1, 'rgba(212, 175, 55, 0)');
  ctx.fillStyle = sealGlow;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 78, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = gold;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 56, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 46, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 38, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.font = '700 22px Cinzel, serif';
  ctx.fillStyle = '#f3e5ab';
  ctx.fillText('PD', sealX, sealY - 6);
  ctx.font = '600 12px "JetBrains Mono", monospace';
  ctx.fillStyle = accent;
  ctx.fillText('2.0', sealX, sealY + 16);

  ctx.textAlign = 'left';
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(243, 229, 171, 0.7)';
  ctx.fillText('DATA DE EMISSÃO', 160, 730);
  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(formatCertDate(model.issuedAt), 160, 762);
  ctx.font = '400 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText((model.track ? model.track + ' • ' : '') + 'Nível ' + model.level + ' • ' + model.xp + ' XP', 160, 792);

  ctx.textAlign = 'right';
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w - 160, 770);
  ctx.lineTo(w - 360, 770);
  ctx.stroke();
  ctx.font = '400 34px "Great Vibes", cursive';
  ctx.fillStyle = '#f3e5ab';
  ctx.fillText('Pratica.dev', w - 170, 752);
  ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('Plataforma educacional', w - 160, 796);

  ctx.textAlign = 'center';
  ctx.font = '500 14px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.fillText('Código de verificação  ' + model.code, w / 2, 900);
}

async function openCertificate(cert, student) {
  if (!cert) return;
  lastCertModel = buildCertViewModel(cert, student);
  const modal = document.getElementById('certificate-modal');
  const canvas = document.getElementById('cert-canvas');
  if (!modal || !canvas) return;
  modal.classList.remove('hidden');
  drawCertificate(canvas, lastCertModel);
  try {
    await ensureCertFonts();
    if (lastCertModel) drawCertificate(canvas, lastCertModel);
  } catch (_) { /* mantém o desenho com fontes de fallback */ }

  if (!student && cert.subject_id && currentUser) {
    history.replaceState(null, '', '#certificado=' + encodeURIComponent(cert.subject_id));
  }
}

function closeCertificate() {
  const modal = document.getElementById('certificate-modal');
  if (modal) modal.classList.add('hidden');
  lastCertModel = null;
  if (/^#certificado=/.test(location.hash)) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

function downloadCertificate() {
  const canvas = document.getElementById('cert-canvas');
  if (!canvas || !lastCertModel) return;
  const slug = String(lastCertModel.subjectName || 'modulo')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const link = document.createElement('a');
  link.download = 'certificado-praticadev-' + slug + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function printCertificate() {
  const canvas = document.getElementById('cert-canvas');
  const root = document.getElementById('certificate-print-root');
  if (!canvas || !root || !lastCertModel) return;
  const img = new Image();
  img.alt = 'Certificado Pratica.dev 2.0';
  const cleanup = () => {
    root.innerHTML = '';
    window.removeEventListener('afterprint', cleanup);
  };
  img.onload = () => {
    window.addEventListener('afterprint', cleanup);
    window.print();
  };
  img.src = canvas.toDataURL('image/png');
  root.innerHTML = '';
  root.appendChild(img);
}

function openDemoCertificate() {
  openCertificate({
    subject_id: 'html',
    title: 'HTML - Básico',
    issued_at: '2026-08-19T12:00:00.000Z'
  }, {
    id: 'demo',
    name: 'Aluno Exemplo',
    level: 3,
    xp: 240,
    track: 'Front-end'
  });
}

function renderCertMiniCard(cert, index, source) {
  const subj = subjects.find(s => s.id === cert.subject_id);
  const icon = subj ? subj.icon : '🏆';
  const name = subj ? subj.name : (cert.subject_id || 'Módulo');
  const date = cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('pt-BR') : '';
  const handler = source === 'admin'
    ? 'openCertificate(adminDetailCerts[' + index + '], adminDetailStudent)'
    : source === 'public'
      ? 'openCertificate(publicCerts[' + index + '], publicProfile)'
      : 'openCertificate(userCerts[' + index + '])';
  return `
    <button type="button" onclick="${handler}" class="cert-mini w-full text-left">
      <div class="cert-mini-inner">
        <div class="cert-mini-seal">${icon}</div>
        <p class="cert-mini-kicker">Pratica.dev 2.0</p>
        <p class="cert-mini-title">${escapeHtml(name)}</p>
        <p class="cert-mini-sub">${escapeHtml(cert.title || '')}</p>
        <p class="cert-mini-date">${date ? 'Emitido em ' + date : 'Abrir certificado visual'}</p>
      </div>
    </button>`;
}

function renderCertificates() {
  const el = document.getElementById('certs-gallery');
  if (!el) return;
  if (!userCerts.length) {
    el.innerHTML = `
      <div class="card-glass rounded-xl p-6 md:col-span-2">
        <p class="text-white/60 mb-3">Nenhum certificado ainda. Conclua um exercício no Centro de Estudos para emitir o diploma visual.</p>
        <button type="button" onclick="switchTab('estudos')" class="btn-primary px-4 py-2 rounded-lg text-sm">Ir para o Centro de Estudos</button>
      </div>`;
    return;
  }
  el.innerHTML = userCerts.map((cert, index) => renderCertMiniCard(cert, index, 'own')).join('');
}

function tryOpenCertFromHash() {
  const match = /^#certificado=([a-z0-9_-]+)/i.exec(location.hash || '');
  if (!match || !currentUser) return;
  const cert = userCerts.find(item => item.subject_id === decodeURIComponent(match[1]));
  if (cert) openCertificate(cert);
}


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
    completedProjects = [];
    userCerts = [];
    enterApp();
    loadUserExtrasSafe(user.id);
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
  if (name.length < 2 || name.length > 120) { showError('reg-error', 'O nome deve ter entre 2 e 120 caracteres.'); return; }
  const parsedAge = Number(age);
  if (!Number.isInteger(parsedAge) || parsedAge < 10 || parsedAge > 120) { showError('reg-error', 'A idade deve ser um número entre 10 e 120 anos.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('reg-error', 'Informe um email válido.'); return; }
  if (pass.length < 6) { showError('reg-error', 'A senha precisa ter pelo menos 6 caracteres.'); return; }

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

function traduzirErroAuth(msg = '') {
  if (msg.includes('Invalid login'))        return 'Email ou senha incorretos.';
  if (msg.includes('already registered'))   return 'Este email já está cadastrado.';
  if (msg.includes('valid email'))          return 'Informe um email válido.';
  if (msg.includes('Password should be'))   return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/profiles_(age|name)_check|violates check constraint/i.test(msg))
    return 'Os dados do cadastro são inválidos. Confira se o nome tem entre 2 e 120 caracteres e se a idade está entre 10 e 120 anos.';
  if (/Network|Failed to fetch|fetch failed/i.test(msg)) return 'Erro de conexão. Verifique sua internet.';
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

// Projetos e certificados não devem impedir a entrada no app.
async function loadUserExtrasSafe(userId) {
  try {
    await loadUserExtras(userId);
    renderDashboard();
  } catch (e) {
    console.warn('Carga secundária indisponível:', e.message);
    showToast('Seu perfil abriu, mas projetos e certificados não puderam ser carregados. Tente novamente mais tarde.', 'error');
  }
}


// ===== APP ENTRY =====

function enterApp() {
  document.getElementById('boot-screen').style.display = 'none';
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
  tryOpenCertFromHash();
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


// ===== MENU MOBILE =====
// A sidebar vira uma gaveta em telas até 768px. Em telas maiores o CSS
// mantém o menu fixo, então estas funções não têm efeito visual.

function isMobileLayout() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function setMobileMenu(open) {
  const sidebar  = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggle   = document.getElementById('menu-toggle');
  if (!sidebar || !backdrop) return;

  sidebar.classList.toggle('open', open);
  backdrop.classList.toggle('open', open);
  backdrop.hidden = !open;
  if (toggle) toggle.setAttribute('aria-expanded', String(open));
  // Trava o scroll do fundo enquanto a gaveta está aberta
  document.body.style.overflow = open && isMobileLayout() ? 'hidden' : '';
}

function toggleMobileMenu() {
  const sidebar = document.getElementById('app-sidebar');
  setMobileMenu(!(sidebar && sidebar.classList.contains('open')));
}

function closeMobileMenu() {
  setMobileMenu(false);
}

// Fecha a gaveta ao apertar Esc e ao voltar para o layout desktop
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});

window.addEventListener('resize', () => {
  if (!isMobileLayout()) closeMobileMenu();
});


// ===== TABS =====

function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  // No mobile, escolher uma aba fecha o menu automaticamente
  closeMobileMenu();

  const renderers = {
    dashboard:    renderDashboard,
    perfil:       renderProfile,
    certificados: renderCertificates,
    evolucao:     renderCareers,
    estudos:      renderSubjects,
    projetos:     renderProjects,
    portfolio:    renderPortfolio,
    admin:        renderAdminPanel
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
    ? userCerts.map((c, i) => renderCertMiniCard(c, i, 'own')).join('')
    : '<p class="text-white/40 text-sm md:col-span-2">Nenhum certificado ainda. Continue estudando!</p>';
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
  const btn = event && event.target;

  const markDone = () => {
    if (!btn) return;
    btn.textContent = '✅ Concluído!';
    btn.disabled = true;
    btn.classList.add('opacity-50');
  };

  const existing = userCerts.find(c => c.subject_id === id);
  if (existing) {
    markDone();
    openCertificate(existing);
    showToast('Certificado já emitido para este módulo.', 'success');
    return;
  }

  try {
    // +30 XP, progresso e certificado — tudo em uma função só no banco
    // (award_exercise_xp), que também impede repetir o mesmo exercício
    // pra farmar XP de novo.
    await awardExerciseXP(id, certTitle);
    currentUser = await fetchProfile(currentAuthId);
    userCerts   = await fetchCertificates(currentAuthId);
  } catch (e) {
    console.warn('Erro ao concluir exercício:', e.message);
    showToast('Não foi possível emitir o certificado: ' + e.message, 'error');
    return;
  }

  renderDashboard();
  markDone();

  const issued = userCerts.find(c => c.subject_id === id);
  if (issued) {
    openCertificate(issued);
    showToast('Certificado visual emitido! +30 XP', 'success');
  }
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
              <button onclick="openBriefing(${p.dbId})"
                class="btn-secondary px-3 py-1.5 rounded text-xs w-full mb-2">
                Ver briefing
              </button>
              <button onclick="startProject(${p.dbId}, '${p.name}', this)"
                class="btn-primary px-3 py-1.5 rounded text-xs w-full ${done ? 'opacity-50' : ''}"
                ${done ? 'disabled' : ''}>
                ${done ? '✅ Concluído!' : 'Concluir Projeto'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
}

// ===== BRIEFING: ABRIR / FECHAR =====

function findProjectById(projectId) {
  for (const level of projects) {
    const found = level.items.find(p => p.dbId === projectId);
    if (found) return { ...found, level: level.level };
  }
  return null;
}

function openBriefing(projectId) {
  const project  = findProjectById(projectId);
  const briefing = projectBriefings[projectId];
  if (!project || !briefing) {
    showToast('Briefing indisponível para este projeto.', 'error');
    return;
  }

  const done = completedProjects.includes(projectId);

  document.getElementById('briefing-title').textContent = project.name;
  document.getElementById('briefing-meta').textContent =
    `${project.level} • ${project.difficulty} • Estimativa: ${briefing.tempo}`;

  const list = items => `<ul>${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;

  document.getElementById('briefing-body').innerHTML = `
    <div class="briefing-section">
      <h4>Contexto do cliente</h4>
      <p>${escapeHtml(briefing.contexto)}</p>
    </div>
    <div class="briefing-section">
      <h4>Tecnologias sugeridas</h4>
      <div class="briefing-tags">
        ${briefing.tecnologias.map(t => `<span class="briefing-tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    </div>
    <div class="briefing-section">
      <h4>Requisitos funcionais</h4>
      ${list(briefing.requisitos)}
    </div>
    <div class="briefing-section">
      <h4>Entregáveis</h4>
      ${list(briefing.entregaveis)}
    </div>
    <div class="briefing-section">
      <h4>Critérios de aceite</h4>
      ${list(briefing.criterios)}
    </div>
  `;

  // O botão do rodapé conclui o projeto e fecha o briefing
  const startBtn = document.getElementById('briefing-start-btn');
  startBtn.disabled = done;
  startBtn.classList.toggle('opacity-50', done);
  startBtn.textContent = done ? '✅ Concluído!' : 'Concluir Projeto';
  startBtn.onclick = done ? null : async () => {
    closeBriefing();
    const cardBtn = document.querySelector(`#projects-grid button[onclick*="startProject(${projectId},"]`);
    if (cardBtn) {
      await startProject(projectId, project.name, cardBtn);
    } else {
      await startProject(projectId, project.name, startBtn);
      renderProjects();
    }
  };

  document.getElementById('briefing-modal').classList.remove('hidden');
}

function closeBriefing() {
  document.getElementById('briefing-modal').classList.add('hidden');
}

async function startProject(projectId, projectName, btn) {
  if (completedProjects.includes(projectId)) return;

  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    // Só atualiza o estado local depois de o banco confirmar a transação.
    await awardProjectXP(projectId);
    currentUser = await fetchProfile(currentAuthId);
    completedProjects.push(projectId);
    btn.textContent = '✅ Concluído!';
    btn.classList.add('opacity-50');
    renderDashboard();
  } catch (e) {
    console.warn('Erro ao salvar projeto:', e.message);
    btn.disabled = false;
    btn.textContent = 'Tentar novamente';
    btn.classList.remove('opacity-50');
    showToast('Não foi possível salvar o projeto. Verifique sua conexão e tente novamente.', 'error');
  }
}


// ===== RENDER: PORTFÓLIO =====

// Link público no formato: https://.../TCC/#publico/<id>
// A rota #publico/<id> abre a visão pública SEM exigir login.
function portfolioPublicUrl() {
  const id = currentAuthId || (currentUser && currentUser.id) || '';
  return location.origin + location.pathname + '#publico/' + encodeURIComponent(id);
}

function renderPortfolio() {
  const isPublic = !!currentUser.portfolio_public;
  const publicUrl = portfolioPublicUrl();

  const certNames = userCerts.map((c, i) =>
    `<button type="button" onclick="openCertificate(userCerts[${i}])" class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500/30 transition">${escapeHtml(c.title.replace(' - Básico',''))}</button>`
  ).join('') || '<span class="text-white/40 text-xs">Nenhuma ainda</span>';

  const projNames = completedProjects.length
    ? completedProjects.map(id => {
        const proj = projects.flatMap(g => g.items).find(p => p.dbId === id);
        return proj ? `<div class="bg-white/5 rounded-lg p-3 mb-2 text-sm">✅ ${escapeHtml(proj.name)}</div>` : '';
      }).join('')
    : '<p class="text-white/40 text-xs">Complete projetos na aba Projetos para preencher seu portfólio!</p>';

  document.getElementById('portfolio-content').innerHTML = `
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-white/5 border ${isPublic ? 'border-green-500/30' : 'border-white/10'}">
      <div class="min-w-0">
        <p class="font-semibold text-sm">${isPublic ? '🟢 Portfólio público' : '🔴 Portfólio privado'}</p>
        <p class="text-xs text-white/50 mt-1">${isPublic
          ? 'Qualquer pessoa com o link consegue ver seu portfólio, mesmo sem login.'
          : 'Só você consegue ver. Publique para gerar o link de compartilhamento.'}</p>
        ${isPublic ? `<p class="text-xs text-green-400/80 mt-1 font-mono break-all">${escapeHtml(publicUrl)}</p>` : ''}
      </div>
      <div class="flex gap-2 flex-wrap">
        <button id="btn-portfolio-toggle" type="button" onclick="togglePortfolioVisibility()"
          class="${isPublic ? 'btn-secondary' : 'btn-primary'} px-4 py-2 rounded-lg text-sm font-semibold">
          ${isPublic ? 'Tornar privado' : 'Publicar portfólio'}
        </button>
        <button id="btn-copy-portfolio-link" type="button" onclick="copyPortfolioLink()"
          class="btn-secondary px-4 py-2 rounded-lg text-sm">
          📋 Copiar link público
        </button>
      </div>
    </div>
    <div class="text-center mb-6">
      <div class="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-purple-500 mx-auto mb-3 flex items-center justify-center text-2xl font-bold">
        ${escapeHtml(currentUser.name.charAt(0))}
      </div>
      <h3 class="text-xl font-bold">${escapeHtml(currentUser.name)}</h3>
      <p class="text-white/50">Estudante de Desenvolvimento de Sistemas</p>
      <p class="text-green-400 text-sm">${escapeHtml(currentUser.track || 'Explorando')} • Nível ${escapeHtml(currentUser.level)}</p>
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

// Publica ou torna privado o portfólio (coluna profiles.portfolio_public).
async function togglePortfolioVisibility() {
  const btn = document.getElementById('btn-portfolio-toggle');
  if (!btn) return;
  const next = !currentUser.portfolio_public;
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    await setPortfolioPublic(currentAuthId, next);
    currentUser = await fetchProfile(currentAuthId);
    renderPortfolio();
    showToast(next ? 'Portfólio publicado! Compartilhe o link público.' : 'Portfólio agora está privado.', 'success');
  } catch (e) {
    console.warn('Erro ao alterar visibilidade:', e.message);
    btn.disabled = false;
    btn.textContent = currentUser.portfolio_public ? 'Tornar privado' : 'Publicar portfólio';
    showToast('Não foi possível alterar a visibilidade: ' + traduzirErroAuth(e.message), 'error');
  }
}

// Copia o link público (#publico/<id>) para a área de transferência.
async function copyPortfolioLink() {
  const url = portfolioPublicUrl();
  let ok = false;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      ok = true;
    }
  } catch (_) { /* tenta o fallback abaixo */ }

  if (!ok) {
    try {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand('copy');
      ta.remove();
    } catch (_) { ok = false; }
  }

  showToast(ok ? 'Link público copiado!' : 'Não foi possível copiar o link automaticamente: ' + url, ok ? 'success' : 'error');
}


// ===== VISÃO PÚBLICA DO PORTFÓLIO (sem login) =====
// A rota #publico/<id> renderiza perfil, projetos e certificados
// usando a chave anon e as políticas de leitura anônima. Não exige
// sessão, e nunca busca/renderiza email, idade ou is_admin.

function isPublicPortfolioHash() {
  return /^#publico\//i.test(location.hash || '');
}

function publicPortfolioIdFromHash() {
  const match = /^#publico\/([\w-]+)/i.exec(location.hash || '');
  return match ? decodeURIComponent(match[1]) : null;
}

function openPublicView() {
  document.getElementById('boot-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('public-view').style.display = 'block';
  renderPublicPortfolio(publicPortfolioIdFromHash());
}

function closePublicView() {
  const view = document.getElementById('public-view');
  if (view) view.style.display = 'none';
  publicProfile = null;
  publicCerts = [];
}

// Sai da visão pública e volta ao fluxo normal (login ou sessão).
function leavePublicView() {
  closePublicView();
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  init();
}

async function renderPublicPortfolio(userId) {
  const container = document.getElementById('public-portfolio');
  if (!container) return;

  if (!userId) {
    container.innerHTML = `
      <div class="card-glass rounded-2xl p-10 text-center">
        <p class="text-5xl mb-4">🔗</p>
        <h2 class="text-xl font-bold mb-2">Link inválido</h2>
        <p class="text-white/60 text-sm mb-6">Este link de portfólio não tem um identificador válido.</p>
        <button type="button" onclick="leavePublicView()" class="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold">Entrar no Pratica.dev</button>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="card-glass rounded-2xl p-10 text-center">
      <div class="boot-spinner mx-auto mb-4" aria-hidden="true"></div>
      <p class="text-white/60">Carregando portfólio público...</p>
    </div>`;

  try {
    // Só os dados liberados pela política anon: perfil publicado,
    // projetos do catálogo e certificados. Nada de email/idade/admin.
    const [profile, projRows, certs] = await Promise.all([
      fetchPublicProfile(userId),
      fetchPublicProjects(userId),
      fetchPublicCertificates(userId)
    ]);

    if (!profile) {
      container.innerHTML = `
        <div class="card-glass rounded-2xl p-10 text-center">
          <p class="text-5xl mb-4">🔒</p>
          <h2 class="text-xl font-bold mb-2">Portfólio indisponível</h2>
          <p class="text-white/60 text-sm mb-6">Este portfólio não existe ou está privado. Se for seu, publique-o na aba Portfólio do Pratica.dev.</p>
          <button type="button" onclick="leavePublicView()" class="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold">Entrar no Pratica.dev</button>
        </div>`;
      return;
    }

    publicProfile = profile;
    publicCerts = certs;
    container.innerHTML = renderPublicPortfolioHTML(profile, projRows, certs);
  } catch (e) {
    console.warn('Erro ao carregar portfólio público:', e.message);
    container.innerHTML = `
      <div class="card-glass rounded-2xl p-10 text-center">
        <p class="text-5xl mb-4">⚠️</p>
        <h2 class="text-xl font-bold mb-2">Não foi possível carregar</h2>
        <p class="text-white/60 text-sm mb-6">${escapeHtml(traduzirErroAuth(e.message))}</p>
        <button type="button" onclick="leavePublicView()" class="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold">Voltar</button>
      </div>`;
  }
}

// Monta o HTML da visão pública. Só usa campos autorizados do perfil:
// name, track, goal, level e xp — nunca email, age ou is_admin.
function renderPublicPortfolioHTML(profile, projRows, certs) {
  const skills = certs.map(c => {
    const subj = subjects.find(s => s.id === c.subject_id);
    return subj ? subj.name : (c.subject_id || 'Módulo');
  });

  const projs = projRows.map(r => r.projects || { name: 'Projeto #' + r.project_id, level: '', description: '' });

  const projHtml = projs.length
    ? projs.map(p => `
        <div class="bg-white/5 rounded-lg p-4 mb-3 text-sm border border-white/5">
          <p class="font-semibold">✅ ${escapeHtml(p.name)}</p>
          ${p.level ? `<p class="text-white/40 text-xs mt-1">${escapeHtml(p.level)}</p>` : ''}
          ${p.description ? `<p class="text-white/50 text-xs mt-1">${escapeHtml(p.description)}</p>` : ''}
        </div>`).join('')
    : '<p class="text-white/40 text-sm">Nenhum projeto concluído ainda.</p>';

  const certHtml = certs.length
    ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-3">${certs.map((c, i) => renderCertMiniCard(c, i, 'public')).join('')}</div>`
    : '<p class="text-white/40 text-sm">Nenhum certificado ainda.</p>';

  return `
    <div class="text-center mb-8">
      <div class="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-purple-500 mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
        ${escapeHtml((profile.name || '?').charAt(0))}
      </div>
      <h2 class="text-2xl font-bold">${escapeHtml(profile.name || 'Aluno')}</h2>
      <p class="text-white/50">Estudante de Desenvolvimento de Sistemas</p>
      <p class="text-green-400 text-sm mt-1">${escapeHtml(profile.track || 'Explorando')} • Nível ${escapeHtml(profile.level)} • ${escapeHtml(profile.xp)} XP</p>
      ${profile.goal ? `<p class="text-white/60 text-sm mt-2">🎯 ${escapeHtml(profile.goal)}</p>` : ''}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div class="card-glass rounded-xl p-5">
        <h3 class="font-semibold text-sm text-white/60 mb-2">🛠️ Habilidades</h3>
        ${skills.length
          ? `<div class="flex flex-wrap gap-2">${skills.map(s => `<span class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">${escapeHtml(s)}</span>`).join('')}</div>`
          : '<p class="text-white/40 text-xs">Nenhuma habilidade registrada ainda.</p>'}
      </div>
      <div class="card-glass rounded-xl p-5">
        <h3 class="font-semibold text-sm text-white/60 mb-2">📊 Estatísticas</h3>
        <p class="text-xs text-white/50">${escapeHtml(profile.xp)} XP • ${projs.length} projetos • ${certs.length} certificados</p>
      </div>
    </div>
    <div class="card-glass rounded-xl p-6 mb-6">
      <h3 class="font-semibold text-sm text-white/60 mb-3">📁 Projetos</h3>
      ${projHtml}
    </div>
    <div class="card-glass rounded-xl p-6">
      <h3 class="font-semibold text-sm text-white/60 mb-3">🏆 Certificados</h3>
      ${certHtml}
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
          // encodeURIComponent mantém o nome fora da sintaxe do HTML/JS inline.
          const nomeArg = encodeURIComponent(a.name);
          const isSelf  = a.id === currentAuthId;

          const acoes = isSelf
            ? '<span class="text-white/30 text-xs">— você —</span>'
            : `
              <div class="flex gap-1 flex-wrap">
                <button onclick="adminHandleResetXP('${a.id}', decodeURIComponent('${nomeArg}'))"
                  class="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition">
                  Resetar XP
                </button>
                <button onclick="adminHandleToggleAdmin('${a.id}', decodeURIComponent('${nomeArg}'), ${!!a.is_admin})"
                  class="text-xs px-2 py-1 rounded transition ${a.is_admin ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' : 'bg-white/10 hover:bg-white/20'}">
                  ${a.is_admin ? 'Remover admin' : 'Tornar admin'}
                </button>
                <button onclick="adminHandleDelete('${a.id}', decodeURIComponent('${nomeArg}'))"
                  class="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition">
                  Excluir
                </button>
              </div>
            `;

          return `
            <tr class="border-b border-white/5">
              <td class="p-3">
                <button onclick="adminShowDetails('${a.id}')" class="hover:underline hover:text-green-400 transition text-left">${escapeHtml(a.name)}</button>${a.is_admin ? ' <span class="text-purple-400 text-xs">(admin)</span>' : ''}
              </td>
              <td class="p-3 text-white/60">${escapeHtml(a.email)}</td>
              <td class="p-3">${a.age ?? '-'}</td>
              <td class="p-3">Nível ${a.level}</td>
              <td class="p-3">${a.xp} XP</td>
              <td class="p-3">${escapeHtml(a.track || '-')}</td>
              <td class="p-3">${a.quiz_done ? '✅' : '—'}</td>
              <td class="p-3">${acoes}</td>
            </tr>
          `;
        }).join('')
      : '<tr><td class="p-3 text-white/40" colspan="8">Nenhum aluno encontrado.</td></tr>';
  } catch (e) {
    tbody.innerHTML = `<tr><td class="p-3 text-red-400" colspan="8">Erro ao carregar: ${escapeHtml(e.message)}</td></tr>`;
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
    adminDetailStudent = profile;
    adminDetailCerts = certRows;
    renderStudentDetailModal(quizRows, projRows, certRows);
  } catch (e) {
    document.getElementById('admin-detail-content').innerHTML =
      `<p class="text-red-400 text-sm">Erro ao carregar detalhes: ${escapeHtml(e.message)}</p>`;
  }
}

function closeAdminDetailModal() {
  document.getElementById('admin-detail-modal').classList.add('hidden');
}

function renderStudentDetailModal(quizRows, projRows, certRows) {
  const quizHtml = quizRows.length
    ? quizRows.map(q => `
        <div class="bg-white/5 rounded-lg p-3 mb-2 text-sm">
          <p class="text-white/40 text-xs mb-1">${escapeHtml(quizQuestionLabel(q.question))}</p>
          <p>${escapeHtml(q.answer)}</p>
        </div>
      `).join('')
    : '<p class="text-white/40 text-sm">Quiz não realizado.</p>';

  const projHtml = projRows.length
    ? projRows.map(p => `
        <div class="bg-white/5 rounded-lg p-3 mb-2 text-sm">
          ✅ ${escapeHtml(p.projects ? p.projects.name : ('Projeto #' + p.project_id))}
          ${p.projects && p.projects.level ? `<span class="text-white/40 text-xs"> • ${escapeHtml(p.projects.level)}</span>` : ''}
        </div>
      `).join('')
    : '<p class="text-white/40 text-sm">Nenhum projeto concluído.</p>';

  const certHtml = certRows.length
    ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-3">${certRows.map((c, i) => renderCertMiniCard(c, i, 'admin')).join('')}</div>`
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
  const boot = document.getElementById('boot-screen');
  const message = document.getElementById('boot-message');
  const retry = document.getElementById('boot-retry');

  // Rota pública #publico/<id>: abre o portfólio SEM verificar sessão.
  if (isPublicPortfolioHash()) {
    openPublicView();
    return;
  }

  boot.style.display = 'flex';
  message.textContent = 'Verificando sua sessão...';
  retry.classList.add('hidden');
  document.getElementById('login-screen').style.display = 'none';

  const slowWarning = setTimeout(() => {
    message.textContent = 'A conexão está demorando mais que o normal. Ainda estamos tentando...';
  }, 4000);

  try {
    const session = await getSession();
    clearTimeout(slowWarning);

    if (session) {
      currentAuthId = session.user.id;
      currentUser = await fetchProfile(session.user.id);
      completedProjects = [];
      userCerts = [];
      enterApp();
      loadUserExtrasSafe(session.user.id);
    } else {
      boot.style.display = 'none';
      document.getElementById('login-screen').style.display = 'flex';
    }
  } catch (e) {
    clearTimeout(slowWarning);
    console.warn('Erro no init:', e.message);
    message.textContent = 'Não foi possível verificar sua sessão: ' + traduzirErroAuth(e.message);
    retry.classList.remove('hidden');
  }

  lucide.createIcons();
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeCertificate();
});
window.addEventListener('hashchange', () => {
  if (isPublicPortfolioHash()) {
    openPublicView();
  } else {
    closePublicView();
    tryOpenCertFromHash();
  }
});

init();
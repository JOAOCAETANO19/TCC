const quiz = [
  {
    q: "Qual seu nível?",
    a: ["Nunca programei", "Iniciante", "Intermediário", "Avançado"]
  },
  {
    q: "Qual área?",
    a: ["Front-end", "Back-end", "Mobile", "Dados", "IA"]
  },
  {
    q: "Objetivo?",
    a: ["Estágio", "Emprego", "Freelance", "Hobby"]
  }
];

const modules = [
  { name: "HTML", xp: 20 },
  { name: "CSS", xp: 20 },
  { name: "JavaScript", xp: 30 },
  { name: "APIs", xp: 30 }
];

const projects = [
  "Página de Perfil",
  "Landing Page",
  "To-do List",
  "Weather App"
];

let step = 0;
let answers = [];
let typingStarted = false;

const quizModal = document.getElementById("quizModal");
const quizStep = document.getElementById("quizStep");

function renderQuiz() {
  if (localStorage.getItem("quizDone")) {
    quizModal.classList.remove("active");
    loadApp();
    return;
  }

  const current = quiz[step];
  let html = "<h3>" + current.q + "</h3>";

  current.a.forEach(function(option) {
    html +=
      '<button class="quiz-btn" onclick="answerQuiz(\'' +
      option +
      '\')">' +
      option +
      "</button>";
  });

  quizStep.innerHTML = html;
}

function answerQuiz(value) {
  answers.push(value);
  step++;

  if (step < quiz.length) {
    renderQuiz();
  } else {
    localStorage.setItem("quizDone", "true");
    localStorage.setItem("profile", JSON.stringify(answers));
    quizModal.classList.remove("active");
    loadApp();
  }
}

function resetQuiz() {
  localStorage.clear();
  location.reload();
}

function loadApp() {
  loadDashboard();
  loadModules();
  loadProjects();
  loadPortfolio();
  loadProfile();
  startTyping();
}

function loadDashboard() {
  const xp = Number(localStorage.getItem("xp")) || 0;

  document.getElementById("xp").textContent = xp;
  document.getElementById("level").textContent =
    Math.floor(xp / 50) + 1;
}

function loadModules() {
  const box = document.getElementById("modules");
  box.innerHTML = "";

  modules.forEach(function(module, index) {
    const done = localStorage.getItem("m" + index);

    const card =
      '<div class="module">' +
      "<h3>" + module.name + "</h3>" +
      "<p>" + module.xp + " XP</p>" +
      '<button onclick="completeModule(' + index + ')" ' +
      (done ? "disabled" : "") +
      ">" +
      (done ? "Concluído" : "Concluir") +
      "</button>" +
      "</div>";

    box.innerHTML += card;
  });
}

function completeModule(index) {
  if (localStorage.getItem("m" + index)) return;

  localStorage.setItem("m" + index, "true");

  let xp = Number(localStorage.getItem("xp")) || 0;
  xp += modules[index].xp;

  localStorage.setItem("xp", xp);

  loadApp();
}

function loadProjects() {
  const box = document.getElementById("projectList");
  box.innerHTML = "";

  projects.forEach(function(project, index) {
    const unlocked = localStorage.getItem("m" + index);

    const card =
      '<div class="project">' +
      "<h3>" + project + "</h3>" +
      "<p>" +
      (unlocked ? "Desbloqueado" : "Bloqueado") +
      "</p>" +
      "</div>";

    box.innerHTML += card;
  });
}

function loadPortfolio() {
  const box = document.getElementById("portfolioList");
  box.innerHTML = "";

  projects.forEach(function(project, index) {
    if (localStorage.getItem("m" + index)) {
      box.innerHTML += "<div>" + project + "</div>";
    }
  });
}

function loadProfile() {
  const profile =
    JSON.parse(localStorage.getItem("profile")) || [];

  document.getElementById("userProfile").textContent =
    profile.join(" • ");
}

function startTyping() {
  if (typingStarted) return;
  typingStarted = true;

  const messages = [
    "Próximo módulo: CSS",
    "Projeto recomendado: Landing Page",
    "Você está pronto para estágio!"
  ];

  const target = document.getElementById("typing");

  let msg = 0;
  let char = 0;

  setInterval(function() {
    target.textContent =
      messages[msg].slice(0, char);

    char++;

    if (char > messages[msg].length) {
      char = 0;
      msg = (msg + 1) % messages.length;
    }
  }, 120);
}

document
  .getElementById("menuBtn")
  .addEventListener("click", function() {
    document
      .getElementById("menu")
      .classList.toggle("open");
  });

function scrollToSection(id) {
  document
    .getElementById(id)
    .scrollIntoView({
      behavior: "smooth"
    });
}

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

document
  .querySelectorAll(".reveal")
  .forEach(function(el) {
    observer.observe(el);
  });

const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener(
  "resize",
  resizeCanvas
);

const particles = [];

for (let i = 0; i < 70; i++) {
  particles.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2 + 1
  });
}

function animateParticles() {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle =
    "rgba(59,130,246,0.5)";

  particles.forEach(function(p) {
    ctx.beginPath();
    ctx.arc(
      p.x,
      p.y,
      p.r,
      0,
      Math.PI * 2
    );
    ctx.fill();

    p.y += 0.3;

    if (p.y > window.innerHeight) {
      p.y = 0;
    }
  });

  requestAnimationFrame(
    animateParticles
  );
}

animateParticles();
renderQuiz();
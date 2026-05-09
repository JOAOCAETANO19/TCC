// =====================
// DADOS
// =====================

const quiz = [
  {
    q: "Qual seu nível?",
    a: ["Nunca programei", "Iniciante", "Intermediário"]
  },
  {
    q: "Qual área?",
    a: ["Front-end", "Back-end", "Mobile"]
  }
];

const modules = [
  { name: "HTML", total: 3 },
  { name: "CSS", total: 3 },
  { name: "JavaScript", total: 3 }
];

const projects = [
  "Landing Page",
  "To-do List",
  "Dashboard"
];

let currentQuiz = 0;


// =====================
// INICIALIZAÇÃO
// =====================

document.addEventListener("DOMContentLoaded", init);

function init(){
  setupMenu();
  checkLogin();
  renderQuiz();
  loadApp();
}


// =====================
// LOGIN
// =====================

function register(){
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!email || !password){
    alert("Preencha tudo");
    return;
  }

  localStorage.setItem(
    "user",
    JSON.stringify({ email, password })
  );

  alert("Cadastro realizado!");
}

function login(){
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const user =
    JSON.parse(localStorage.getItem("user"));

  if(
    user &&
    user.email === email &&
    user.password === password
  ){
    localStorage.setItem("logged","true");
    checkLogin();
    alert("Login realizado!");
  }else{
    alert("Dados inválidos");
  }
}

function logout(){
  localStorage.removeItem("logged");
  checkLogin();
}

function checkLogin(){
  const status =
    document.getElementById("userStatus");

  const user =
    JSON.parse(localStorage.getItem("user"));

  const logged =
    localStorage.getItem("logged");

  if(user && logged){
    status.textContent =
      "Logado: " + user.email;
  }else{
    status.textContent =
      "Não logado";
  }
}


// =====================
// QUIZ
// =====================

function renderQuiz(){

  const modal =
    document.getElementById("quizModal");

  const box =
    document.getElementById("quizStep");

  if(localStorage.getItem("quizDone")){
    modal.classList.remove("active");
    return;
  }

  modal.classList.add("active");

  const q = quiz[currentQuiz];

  let html =
    `<h3>${q.q}</h3>`;

  q.a.forEach(function(op){
    html += `
      <button
        class="quiz-btn"
        onclick="answerQuiz('${op}')">
        ${op}
      </button>
    `;
  });

  box.innerHTML = html;
}

function answerQuiz(answer){
  currentQuiz++;

  if(currentQuiz < quiz.length){
    renderQuiz();
  }else{
    localStorage.setItem(
      "quizDone",
      "true"
    );

    document
      .getElementById("quizModal")
      .classList.remove("active");
  }
}


// =====================
// DASHBOARD
// =====================

function loadDashboard(){
  const xp =
    Number(localStorage.getItem("xp")) || 0;

  document.getElementById("xp").textContent =
    xp;

  document.getElementById("level").textContent =
    Math.floor(xp/50)+1;

  document.getElementById("nextStep").textContent =
    "Finalize Flexbox";
}


// =====================
// TRILHAS
// =====================

function loadModules(){

  const box =
    document.getElementById("modules");

  box.innerHTML = "";

  modules.forEach(function(m,i){

    const done =
      Number(localStorage.getItem("m"+i)) || 0;

    const percent =
      (done/m.total)*100;

    box.innerHTML += `
      <div class="module">
        <h3>${m.name}</h3>
        <p>${done}/${m.total} etapas</p>

        <div class="progress">
          <div
            class="progress-fill"
            style="width:${percent}%">
          </div>
        </div>

        <button onclick="nextStep(${i})">
          Avançar
        </button>
      </div>
    `;
  });
}

function nextStep(i){

  let done =
    Number(localStorage.getItem("m"+i)) || 0;

  if(done < modules[i].total){
    done++;

    localStorage.setItem("m"+i,done);

    let xp =
      Number(localStorage.getItem("xp")) || 0;

    localStorage.setItem(
      "xp",
      xp + 10
    );
  }

  loadApp();
}


// =====================
// PROJETOS
// =====================

function loadProjects(){

  const box =
    document.getElementById("projectList");

  box.innerHTML = "";

  projects.forEach(function(p){
    box.innerHTML += `
      <div class="project">
        <h3>${p}</h3>
      </div>
    `;
  });
}


// =====================
// PORTFÓLIO
// =====================

function loadPortfolio(){
  document.getElementById(
    "portfolioList"
  ).innerHTML =
    "<div>Seu portfólio cresce com seu progresso.</div>";
}


// =====================
// APP
// =====================

function loadApp(){
  loadDashboard();
  loadModules();
  loadProjects();
  loadPortfolio();
}


// =====================
// MENU MOBILE
// =====================

function setupMenu(){
  const btn =
    document.getElementById("menuBtn");

  const menu =
    document.getElementById("menu");

  btn.addEventListener("click",()=>{
    menu.classList.toggle("open");
  });
}
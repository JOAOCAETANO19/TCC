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
  { name:"HTML", steps:3 },
  { name:"CSS", steps:3 },
  { name:"JavaScript", steps:3 }
];

const projects = [
  "Landing Page",
  "To-do List",
  "Dashboard"
];

let step = 0;

const quizModal =
document.getElementById("quizModal");

const quizStep =
document.getElementById("quizStep");


function renderQuiz(){

  if(localStorage.getItem("quizDone")){
    quizModal.classList.remove("active");
    loadApp();
    return;
  }

  const q = quiz[step];

  let html = "<h3>"+q.q+"</h3>";

  q.a.forEach(function(op){
    html +=
    `<button class="quiz-btn"
      onclick="answerQuiz('${op}')">
      ${op}
    </button>`;
  });

  quizStep.innerHTML = html;
}


function answerQuiz(v){
  step++;

  if(step < quiz.length){
    renderQuiz();
  }else{
    localStorage.setItem(
      "quizDone",
      "true"
    );

    quizModal.classList.remove(
      "active"
    );

    loadApp();
  }
}


function continueLearning(){
  document
  .getElementById("trilhas")
  .scrollIntoView({
    behavior:"smooth"
  });
}


function loadDashboard(){

  const xp =
  Number(
    localStorage.getItem("xp")
  ) || 0;

  document.getElementById(
    "xp"
  ).textContent = xp;

  document.getElementById(
    "level"
  ).textContent =
  Math.floor(xp/50)+1;

  document.getElementById(
    "nextStep"
  ).textContent =
  "Finalize Flexbox";
}


function loadModules(){

  const box =
  document.getElementById(
    "modules"
  );

  box.innerHTML = "";

  modules.forEach(function(m,i){

    let done =
    Number(
      localStorage.getItem(
        "m"+i
      )
    ) || 0;

    let percent =
    (done/m.steps)*100;

    box.innerHTML += `
      <div class="module">
        <h3>${m.name}</h3>
        <p>${done}/${m.steps}</p>

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
  Number(
    localStorage.getItem(
      "m"+i
    )
  ) || 0;

  if(done < modules[i].steps){
    done++;

    localStorage.setItem(
      "m"+i,
      done
    );

    let xp =
    Number(
      localStorage.getItem("xp")
    ) || 0;

    localStorage.setItem(
      "xp",
      xp+10
    );
  }

  loadApp();
}


function loadProjects(){

  const box =
  document.getElementById(
    "projectList"
  );

  box.innerHTML = "";

  projects.forEach(function(p){
    box.innerHTML +=
    `<div class="project">
      <h3>${p}</h3>
    </div>`;
  });
}


function loadPortfolio(){
  document.getElementById(
    "portfolioList"
  ).innerHTML =
  "<div>Seu portfólio cresce com seu progresso.</div>";
}


function loadApp(){
  loadDashboard();
  loadModules();
  loadProjects();
  loadPortfolio();
}


/* LOGIN */

function register(){

  const email =
  document.getElementById("email").value;

  const password =
  document.getElementById("password").value;

  if(!email || !password){
    alert("Preencha tudo");
    return;
  }

  localStorage.setItem(
    "user",
    JSON.stringify({
      email,
      password
    })
  );

  alert("Cadastro realizado");
}


function login(){

  const email =
  document.getElementById("email").value;

  const password =
  document.getElementById("password").value;

  const user =
  JSON.parse(
    localStorage.getItem("user")
  );

  if(
    user &&
    user.email === email &&
    user.password === password
  ){
    localStorage.setItem(
      "logged",
      "true"
    );

    document.getElementById(
      "userStatus"
    ).textContent =
    "Logado: "+email;

    alert("Login realizado");
  }else{
    alert("Dados inválidos");
  }
}


function logout(){
  localStorage.removeItem("logged");

  document.getElementById(
    "userStatus"
  ).textContent =
  "Não logado";
}


renderQuiz();
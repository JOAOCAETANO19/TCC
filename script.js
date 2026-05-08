// =========================
// QUIZ INICIAL
// =========================
const quiz = [
  {
    q: 'Qual seu nível atual?',
    a: ['Nunca programei', 'Iniciante', 'Intermediário', 'Avançado']
  },
  {
    q: 'Qual área deseja seguir?',
    a: ['Front-end', 'Back-end', 'Mobile', 'Dados', 'IA']
  },
  {
    q: 'Qual seu objetivo?',
    a: ['Estágio', 'Emprego', 'Freelance', 'Hobby']
  }
];

let currentStep = 0;
let answers = [];

const quizModal = document.getElementById('quizModal');
const quizStep = document.getElementById('quizStep');

function renderQuiz() {
  if (localStorage.getItem('quizDone')) {
    quizModal.classList.remove('active');
    loadApp();
    return;
  }

  const item = quiz[currentStep];

  quizStep.innerHTML = `
    <h3>${item.q}</h3>
    ${item.a.map(opt =>
      `<button class="quiz-btn" onclick="answerQuiz('${opt}')">${opt}</button>`
    ).join('')}
  `;
}

function answerQuiz(value) {
  answers.push(value);
  currentStep++;

  if (currentStep < quiz.length) {
    renderQuiz();
  } else {
renderQuiz();
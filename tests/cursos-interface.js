// Fluxos de falha, persistência e isolamento da nova interface de estudos.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const content = fs.readFileSync(path.join(root, 'course-content.js'), 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; console.log(`✓ ${message}`); }

(async () => {
  const dom = new JSDOM(html, { url: 'https://joaocaetano19.github.io/TCC/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.console.warn = () => {};
  w.lucide = { createIcons() {} };
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  let profileFails = false;
  let loadFails = true;
  let saveFails = false;
  let examLoadFails = false;
  let gradingFails = false;
  let saveCalls = 0;
  let gradingCalls = 0;
  let lessonCalls = 0;
  let deferredLesson = null;
  const rows = { lessons: [], exercises: [], attempts: [] };
  const certs = [];
  const exam = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, question: i === 0 ? '<img src=x onerror=alert(1)>' : `Questão ${i + 1}`, options: ['Resposta correta', '<img src=x onerror=alert(1)>', 'Outra', 'Última'] }));
  const profile = { id: 'u1', name: 'Ana', email: 'ana@b.com', age: 18, level: 1, xp: 0, track: 'Front-end', quiz_done: true, is_admin: false };
  Object.assign(w, {
    getSession: async () => null,
    supabaseLogin: async () => ({ id: 'u1' }), supabaseLogout: async () => {},
    fetchProfile: async () => { if (profileFails) throw new Error('rede'); return { ...profile }; },
    fetchUserProjects: async () => [], fetchCertificates: async () => certs.slice(), fetchQuizAnswers: async () => [],
    fetchCourseProgress: async () => { if (loadFails) throw new Error('tabela ausente'); return { lessons: rows.lessons.slice(), exercises: rows.exercises.slice(), attempts: rows.attempts.slice() }; },
    markCourseLesson: async (subject_id, lesson_index) => {
      lessonCalls++;
      if (deferredLesson) await deferredLesson.promise;
      rows.lessons.push({ subject_id, lesson_index });
    },
    saveCourseExercise: async (subject_id, answer) => {
      saveCalls++;
      if (saveFails) throw new Error('rede');
      rows.exercises = rows.exercises.filter(r => r.subject_id !== subject_id);
      rows.exercises.push({ subject_id, answer });
    },
    getCourseAssessment: async () => { if (examLoadFails) throw new Error('rede'); return { minimum_percent: 80, questions: exam }; },
    submitCourseAssessment: async (subject_id, answers) => {
      gradingCalls++;
      if (gradingFails) throw new Error('rede');
      const correct_count = answers.filter(a => a === 0).length;
      const passed = correct_count >= 5;
      const issued_now = passed && !certs.some(c => c.subject_id === subject_id);
      if (issued_now) certs.push({ subject_id, title: 'HTML - Básico', issued_at: new Date().toISOString() });
      const result = { subject_id, correct_count, question_count: 6, score_percent: Math.round(correct_count * 100 / 6), minimum_percent: 80, passed, issued_now,
        feedback: answers.map((answer, i) => ({ id: i + 1, correct: answer === 0, explanation: 'Revise este assunto.' })),
        certificate: passed ? certs.find(c => c.subject_id === subject_id) : null };
      rows.attempts.unshift(result);
      return result;
    },
    awardSubjectViewXP: async () => {}, fetchAvatarSignedUrl: async () => null,
    fetchPublicProfile: async () => null, fetchPublicProjects: async () => [], fetchPublicCertificates: async () => []
  });
  w.eval(content + '\n' + script + `\nwindow.__courseTest = {
    catalog: courseLessons,
    progress: () => courseProgress,
    certs: () => userCerts.slice(),
    session: () => courseSessionVersion
  };`);
  try {
    await tick();
    check(Object.keys(w.__courseTest.catalog).length === 12 && Object.values(w.__courseTest.catalog).every(lessons => lessons.length === 3 && new Set(lessons.map(l => l.videoId)).size === 3 && lessons.every(l => /^[\w-]{11}$/.test(l.videoId) && l.title && l.focus && l.practice)), 'cada um dos 12 cursos tem três vídeos distintos, objetivos e atividades');
    w.document.getElementById('login-email').value = 'ana@b.com';
    w.document.getElementById('login-password').value = '123456';
    await w.handleLogin(); await tick();
    w.switchTab('estudos');
    check(w.document.getElementById('course-load-status').textContent.includes('Não foi possível carregar'), 'erro ao carregar progresso é visível e não inventa conclusão');
    await w.openSubject('html');
    check(w.document.getElementById('course-lesson-complete').disabled && w.document.getElementById('course-assessment').textContent.includes('bloqueada'), 'falha de progresso bloqueia gravação e avaliação sem esconder o conteúdo');
    check(w.document.querySelector('.course-video-wrap iframe').getAttribute('title') && w.document.querySelector('.course-video-note a').href.includes('youtube.com/watch'), 'vídeo tem título acessível e link alternativo externo');
    loadFails = false;
    w.retryCourseProgress(); await tick();
    check(!w.document.getElementById('course-lesson-complete').disabled, 'tentar novamente restaura as ações após conexão voltar');
    await w.completeCourseLesson('html', 2);
    check(lessonCalls === 0, 'interface não envia conclusão fora de ordem');

    let release;
    deferredLesson = { promise: new Promise(resolve => { release = resolve; }) };
    const first = w.completeCourseLesson('html', 1);
    const duplicate = w.completeCourseLesson('html', 1);
    check(lessonCalls === 1 && w.document.getElementById('course-lesson-complete').disabled, 'clique duplo não envia duas conclusões concorrentes');
    release(); await first; await duplicate; deferredLesson = null;
    check(rows.lessons.length === 1 && w.document.getElementById('course-progress-summary').textContent.includes('1 de 3'), 'aula confirmada avança e salva o progresso');
    await w.completeCourseLesson('html', 2);
    await w.completeCourseLesson('html', 3);
    check(w.document.getElementById('course-exercise-answer').disabled === false && w.document.getElementById('course-assessment').textContent.includes('Salve sua atividade'), 'aulas liberam a atividade, mas não o certificado');
    w.answerSubjectQuiz('html', 0, 0); w.answerSubjectQuiz('html', 0, 0);
    check(w.document.getElementById('subject-quiz-score').textContent.includes('1 de 1'), 'teste de fixação não conta uma questão duas vezes');
    w.document.getElementById('course-exercise-answer').value = 'curto';
    await w.submitCourseExercise('html');
    check(saveCalls === 0 && w.document.getElementById('toast-container').textContent.includes('30 e 4000'), 'atividade curta é rejeitada antes da chamada');
    const answer = 'Esta é uma solução prática com mais de trinta caracteres.';
    w.document.getElementById('course-exercise-answer').value = answer;
    saveFails = true;
    await w.submitCourseExercise('html');
    check(w.document.getElementById('course-exercise-answer').value === answer && !w.document.getElementById('course-exercise-answer').disabled && w.document.getElementById('course-assessment').textContent.includes('bloqueada'), 'falha ao salvar preserva o rascunho e não libera a prova');
    saveFails = false; await w.submitCourseExercise('html');
    check(rows.exercises.length === 1 && w.document.getElementById('course-assessment-start'), 'atividade confirmada libera a avaliação');
    examLoadFails = true; await w.startCourseAssessment('html');
    check(w.document.getElementById('course-assessment-start') && w.document.getElementById('toast-container').textContent.includes('Não foi possível carregar a avaliação'), 'falha ao iniciar prova permite nova tentativa');
    examLoadFails = false; await w.startCourseAssessment('html');
    check(w.document.querySelectorAll('.course-question').length === 6 && !w.document.getElementById('course-assessment').querySelector('img'), 'questões recebidas são exibidas com HTML escapado');
    await w.submitCourseAssessmentUI('html');
    check(gradingCalls === 0 && w.document.getElementById('course-assessment-validation').textContent.includes('todas'), 'não envia avaliação incompleta');
    for (let i = 1; i <= 6; i++) w.document.querySelector(`input[name="assessment-html-${i}"][value="${i <= 2 ? 1 : 0}"]`).checked = true;
    gradingFails = true; await w.submitCourseAssessmentUI('html');
    check(w.document.querySelectorAll('#course-assessment input:checked').length === 6 && !w.document.getElementById('course-assessment-submit').disabled && certs.length === 0, 'falha na correção preserva respostas e não concede certificado');
    gradingFails = false; await w.submitCourseAssessmentUI('html');
    check(certs.length === 0 && w.document.getElementById('course-assessment').textContent.includes('4 de 6') && w.document.querySelectorAll('.course-feedback-item').length === 6, 'reprovação exibe feedback por questão e permite refazer');
    w.closeSubject(); await w.openSubject('html');
    check(w.document.getElementById('course-exercise-answer').value === answer && w.document.getElementById('course-assessment').textContent.includes('Última tentativa:') && w.document.getElementById('course-assessment').textContent.includes('Ver feedback'), 'voltar ao curso mantém atividade e feedback');
    await w.startCourseAssessment('html');
    for (let i = 1; i <= 6; i++) w.document.querySelector(`input[name="assessment-html-${i}"][value="0"]`).checked = true;
    let resolveOldCerts;
    w.fetchCertificates = () => new Promise(resolve => { resolveOldCerts = resolve; });
    const staleExtras = w.loadUserExtrasSafe('u1');
    profileFails = true; await w.submitCourseAssessmentUI('html'); profileFails = false;
    check(certs.length === 1 && w.__courseTest.certs().length === 1 && w.document.getElementById('course-assessment').textContent.includes('Você foi aprovado'), 'falha ao atualizar perfil não desfaz aprovação confirmada');
    check(w.document.getElementById('toast-container').textContent.includes('aprovação foi salva'), 'falha de atualização do XP é informada sem negar a aprovação');
    resolveOldCerts([]); await staleExtras;
    check(w.__courseTest.certs().length === 1, 'carregamento atrasado de certificados não apaga diploma emitido durante a leitura');
    w.fetchCertificates = async () => certs.slice();
    await w.startCourseAssessment('html');
    for (let i = 1; i <= 6; i++) w.document.querySelector(`input[name="assessment-html-${i}"][value="0"]`).checked = true;
    let resolveProfile;
    w.fetchProfile = () => new Promise(resolve => { resolveProfile = resolve; });
    await w.submitCourseAssessmentUI('html');
    check(w.document.getElementById('course-assessment').textContent.includes('Você foi aprovado'), 'resultado aparece sem esperar uma atualização lenta do perfil');
    resolveProfile({ ...profile }); await tick();
    w.fetchProfile = async () => ({ ...profile });

    // Um carregamento antigo não pode preencher a sessão seguinte do mesmo usuário.
    let resolveOldLoad;
    w.fetchCourseProgress = () => new Promise(resolve => { resolveOldLoad = resolve; });
    w.retryCourseProgress();
    const oldSession = w.__courseTest.session();
    await w.handleLogout();
    w.fetchCourseProgress = async () => ({ lessons: [], exercises: [], attempts: [] });
    await w.handleLogin(); await tick();
    resolveOldLoad({ lessons: [{ subject_id: 'python', lesson_index: 1 }], exercises: [], attempts: [] });
    await tick();
    check(w.__courseTest.session() !== oldSession && !w.__courseTest.progress().lessons.some(row => row.subject_id === 'python'), 'resposta atrasada da sessão anterior não vaza para novo login');
    console.log(`\n${checks} verificações da interface de cursos passaram.`);
  } finally {
    w.close();
  }
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });

/* LIFT.ME — app.js */

const STATE = {
  name: '',
  xp: 0,
  nivel: 1,
  projetos: {},
  totalEtapas: 0,
  projetosCompletos: 0,
  conquistas: {
    'first-step': false,
    'first-proj': false,
    'level5':     false,
    '10steps':    false,
  }
};

const XP_POR_NIVEL = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];
const NOMES_NIVEL  = ['', 'Iniciante', 'Aprendiz', 'Desenvolvedor Jr', 'Desenvolvedor', 'Sênior', 'Especialista', 'Mestre', 'Expert', 'Lenda', 'God Mode'];
const XP_POR_ETAPA = { p1: 10, p2: 14, p3: 16, p4: 12 };

function saveState() {
  localStorage.setItem('liftme_state', JSON.stringify(STATE));
}

function loadState() {
  const raw = localStorage.getItem('liftme_state');
  if (!raw) return false;
  try { Object.assign(STATE, JSON.parse(raw)); return true; }
  catch { return false; }
}

document.addEventListener('DOMContentLoaded', () => {
  const loaded = loadState();
  if (loaded && STATE.name) {
    document.getElementById('modal-overlay').classList.add('hidden');
    applyState();
    restoreChecklists();
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); goTo(link.dataset.page); });
  });

  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') startApp();
  });
});

function startApp() {
  const input = document.getElementById('name-input').value.trim();
  if (!input) { document.getElementById('name-input').style.borderColor = '#ff4444'; return; }
  STATE.name = input;
  document.getElementById('modal-overlay').classList.add('hidden');
  applyState();
  saveState();
}

function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
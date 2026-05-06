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

  document.getElementById('start-btn').addEventListener('click', startApp);
});

function startApp() {
  const input = document.getElementById('name-input').value.trim();
  if (!input) {
    document.getElementById('name-input').style.borderColor = '#ff4444';
    return;
  }
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function applyState() {
  const initials  = STATE.name ? STATE.name.slice(0, 2).toUpperCase() : 'EU';
  const nivelNome = NOMES_NIVEL[STATE.nivel] || 'Expert';
  const nivelTxt  = `⭐ Nível ${STATE.nivel} — ${nivelNome}`;
  const xpMin = XP_POR_NIVEL[STATE.nivel - 1] || 0;
  const xpMax = XP_POR_NIVEL[STATE.nivel] || 100;
  const xpPct = Math.min(100, ((STATE.xp - xpMin) / (xpMax - xpMin)) * 100);

  document.getElementById('avatar-initials').textContent  = initials;
  document.getElementById('user-name-nav').textContent    = STATE.name || 'Estudante';
  document.getElementById('user-level-nav').textContent   = nivelTxt;
  document.getElementById('xp-fill-mini').style.width     = xpPct + '%';
  document.getElementById('xp-label-nav').textContent     = `${STATE.xp} / ${xpMax} XP`;
  document.getElementById('dash-initials').textContent    = initials;
  document.getElementById('dash-name').textContent        = STATE.name || 'Estudante';
  document.getElementById('dash-level-text').textContent  = nivelTxt;
  document.getElementById('xp-fill-big').style.width      = xpPct + '%';
  document.getElementById('xp-num').textContent           = `${STATE.xp - xpMin} / ${xpMax - xpMin} XP para o próximo nível`;
  document.getElementById('stat-xp').textContent          = STATE.xp;
  document.getElementById('stat-nivel').textContent       = STATE.nivel;
  document.getElementById('stat-projetos').textContent    = STATE.projetosCompletos;
  document.getElementById('stat-etapas').textContent      = STATE.totalEtapas;

  updateConquistas();
}

function handleCheck(checkbox) {
  const proj    = checkbox.dataset.proj;
  const step    = parseInt(checkbox.dataset.step);
  const checked = checkbox.checked;
  if (!STATE.projetos[proj]) STATE.projetos[proj] = [false,false,false,false,false];
  const wasChecked = STATE.projetos[proj][step];
  const xpVal = XP_POR_ETAPA[proj] || 10;
  if (checked && !wasChecked) { STATE.xp += xpVal; STATE.totalEtapas += 1; showXPToast(xpVal); }
  else if (!checked && wasChecked) { STATE.xp = Math.max(0, STATE.xp - xpVal); STATE.totalEtapas = Math.max(0, STATE.totalEtapas - 1); }
  STATE.projetos[proj][step] = checked;
  updateProjectProgress(proj);
  checkNivelUp();
  checkConquistas();
  applyState();
  saveState();
}

function updateProjectProgress(proj) {
  const done  = (STATE.projetos[proj] || []).filter(Boolean).length;
  const pct   = (done / 5) * 100;
  const bar   = document.getElementById(`prog-${proj}`);
  const label = document.getElementById(`prog-label-${proj}`);
  if (bar)   bar.style.width = pct + '%';
  if (label) label.textContent = `${done} / 5 etapas`;
  let completos = 0;
  for (const p of ['p1','p2','p3','p4']) {
    if ((STATE.projetos[p] || []).filter(Boolean).length === 5) completos++;
  }
  STATE.projetosCompletos = completos;
}

function restoreChecklists() {
  for (const proj of ['p1','p2','p3','p4']) {
    const steps = STATE.projetos[proj];
    if (!steps) continue;
    steps.forEach((checked, i) => {
      const cb = document.querySelector(`input[data-proj="${proj}"][data-step="${i}"]`);
      if (cb) cb.checked = checked;
    });
    updateProjectProgress(proj);
  }
}

function checkNivelUp() {
  let novoNivel = 1;
  for (let i = 1; i < XP_POR_NIVEL.length; i++) {
    if (STATE.xp >= XP_POR_NIVEL[i]) novoNivel = i + 1;
    else break;
  }
  novoNivel = Math.min(novoNivel, XP_POR_NIVEL.length - 1);
  if (novoNivel > STATE.nivel) { STATE.nivel = novoNivel; showLevelUpToast(novoNivel); }
  else if (novoNivel < STATE.nivel) { STATE.nivel = novoNivel; }
}

function checkConquistas() {
  if (STATE.totalEtapas >= 1)       STATE.conquistas['first-step'] = true;
  if (STATE.projetosCompletos >= 1) STATE.conquistas['first-proj'] = true;
  if (STATE.nivel >= 5)             STATE.conquistas['level5']     = true;
  if (STATE.totalEtapas >= 10)      STATE.conquistas['10steps']    = true;
}

function updateConquistas() {
  const map = {
    'first-step': 'c-first-step',
    'first-proj': 'c-first-proj',
    'level5':     'c-level5',
    '10steps':    'c-10steps'
  };
  for (const [key, elId] of Object.entries(map)) {
    const el = document.getElementById(elId);
    if (!el) continue;
    el.classList.toggle('unlocked', !!STATE.conquistas[key]);
    el.classList.toggle('locked',  !STATE.conquistas[key]);
  }
}

function showXPToast(xp) {
  const toast = document.getElementById('xp-toast');
  document.getElementById('toast-xp').textContent = xp;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function showLevelUpToast(nivel) {
  const toast = document.getElementById('xp-toast');
  toast.querySelector('span').innerHTML = `🎉 Subiu para Nível ${nivel} — ${NOMES_NIVEL[nivel]}!`;
  toast.style.background = '#ffb800';
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.style.background = '';
    toast.querySelector('span').innerHTML = `⚡ +<span id="toast-xp">0</span> XP ganhos!`;
  }, 3000);
}
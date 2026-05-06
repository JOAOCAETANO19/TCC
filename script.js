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
  try { localStorage.setItem('liftme_state', JSON.stringify(STATE)); } catch(e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('liftme_state');
    if (raw) Object.assign(STATE, JSON.parse(raw));
  } catch(e) {}
}

function startApp() {
  const input = document.getElementById('name-input').value.trim();
  if (!input) {
    const inputEl = document.getElementById('name-input');
    inputEl.style.borderColor = '#ff4444';
    setTimeout(() => inputEl.style.borderColor = '', 1500);
    return;
  }

  STATE.name = input;
  saveState();

  document.getElementById('modal-overlay').style.display = 'none';
  goTo('home');
  applyState();
  restoreChecklists();
}

function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  const link = document.querySelector(`[data-page="${page}"]`);
  if (link) link.classList.add('active');

  document.getElementById('sidebar').classList.remove('open');
  window.scrollTo(0, 0);
}

function applyState() {
  const initials = STATE.name ? STATE.name.slice(0, 2).toUpperCase() : 'EU';
  const nivelNome = NOMES_NIVEL[STATE.nivel] || 'Expert';
  const nivelTxt = `⭐ Nível ${STATE.nivel} — ${nivelNome}`;
  
  const xpMin = XP_POR_NIVEL[STATE.nivel - 1] || 0;
  const xpMax = XP_POR_NIVEL[STATE.nivel] || 100;
  const xpPct = Math.min(100, ((STATE.xp - xpMin) / (xpMax - xpMin)) * 100);

  document.getElementById('avatar-initials').textContent = initials;
  document.getElementById('user-name-nav').textContent = STATE.name || 'Estudante';
  document.getElementById('user-level-nav').textContent = nivelTxt;
  document.getElementById('xp-fill-mini').style.width = xpPct + '%';
  document.getElementById('xp-label-nav').textContent = `${STATE.xp} / ${xpMax} XP`;

  document.getElementById('dash-initials').textContent = initials;
  document.getElementById('dash-name').textContent = STATE.name || 'Estudante';
  document.getElementById('dash-level-text').textContent = nivelTxt;
  document.getElementById('xp-fill-big').style.width = xpPct + '%';
  document.getElementById('xp-num').textContent = `${STATE.xp - xpMin} / ${xpMax - xpMin} XP para o próximo nível`;

  document.getElementById('stat-xp').textContent = STATE.xp;
  document.getElementById('stat-nivel').textContent = STATE.nivel;
  document.getElementById('stat-projetos').textContent = STATE.projetosCompletos;
  document.getElementById('stat-etapas').textContent = STATE.totalEtapas;

  updateConquistas();
}

// ... (as demais funções: handleCheck, updateProjectProgress, restoreChecklists, etc.)

function handleCheck(checkbox) {
  const proj = checkbox.dataset.proj;
  const step = parseInt(checkbox.dataset.step);
  const checked = checkbox.checked;

  if (!STATE.projetos[proj]) STATE.projetos[proj] = [false,false,false,false,false];

  const wasChecked = STATE.projetos[proj][step];
  const xpVal = XP_POR_ETAPA[proj] || 10;

  if (checked && !wasChecked) {
    STATE.xp += xpVal;
    STATE.totalEtapas += 1;
    showXPToast(xpVal);
  } else if (!checked && wasChecked) {
    STATE.xp = Math.max(0, STATE.xp - xpVal);
    STATE.totalEtapas = Math.max(0, STATE.totalEtapas - 1);
  }

  STATE.projetos[proj][step] = checked;
  updateProjectProgress(proj);
  checkNivelUp();
  checkConquistas();
  applyState();
  saveState();
}

function updateProjectProgress(proj) {
  const steps = STATE.projetos[proj] || [];
  const done = steps.filter(Boolean).length;
  const pct = (done / 5) * 100;
  const bar = document.getElementById('prog-' + proj);
  const label = document.getElementById('prog-label-' + proj);
  if (bar) bar.style.width = pct + '%';
  if (label) label.textContent = done + ' / 5 etapas';

  let completos = 0;
  ['p1','p2','p3','p4'].forEach(p => {
    if ((STATE.projetos[p] || []).filter(Boolean).length === 5) completos++;
  });
  STATE.projetosCompletos = completos;
}

function restoreChecklists() {
  ['p1','p2','p3','p4'].forEach(proj => {
    const steps = STATE.projetos[proj];
    if (!steps) return;
    steps.forEach((checked, i) => {
      const cb = document.querySelector(`input[data-proj="${proj}"][data-step="${i}"]`);
      if (cb) cb.checked = checked;
    });
    updateProjectProgress(proj);
  });
}

function checkNivelUp() {
  let novoNivel = 1;
  for (let i = 1; i < XP_POR_NIVEL.length; i++) {
    if (STATE.xp >= XP_POR_NIVEL[i]) novoNivel = i + 1;
    else break;
  }
  if (novoNivel > STATE.nivel) {
    STATE.nivel = novoNivel;
    showLevelUpToast(novoNivel);
  } else if (novoNivel < STATE.nivel) {
    STATE.nivel = novoNivel;
  }
}

function checkConquistas() {
  if (STATE.totalEtapas >= 1) STATE.conquistas['first-step'] = true;
  if (STATE.projetosCompletos >= 1) STATE.conquistas['first-proj'] = true;
  if (STATE.nivel >= 5) STATE.conquistas['level5'] = true;
  if (STATE.totalEtapas >= 10) STATE.conquistas['10steps'] = true;
}

function updateConquistas() {
  const map = { 'first-step':'c-first-step', 'first-proj':'c-first-proj', 'level5':'c-level5', '10steps':'c-10steps' };
  for (let key in map) {
    const el = document.getElementById(map[key]);
    if (!el) continue;
    if (STATE.conquistas[key]) {
      el.classList.remove('locked');
      el.classList.add('unlocked');
    } else {
      el.classList.remove('unlocked');
      el.classList.add('locked');
    }
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
  toast.querySelector('span').innerHTML = `🎉 Nível ${nivel} — ${NOMES_NIVEL[nivel]}!`;
  toast.style.background = '#ffb800';
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.style.background = '';
    toast.querySelector('span').innerHTML = `⚡ +<span id="toast-xp">0</span> XP ganhos!`;
  }, 3000);
}

// INIT
window.onload = function() {
  loadState();

  if (STATE.name) {
    document.getElementById('modal-overlay').style.display = 'none';
    goTo('home');
    applyState();
    restoreChecklists();
  }

  document.getElementById('start-btn').onclick = startApp;

  document.getElementById('name-input').onkeydown = function(e) {
    if (e.key === 'Enter') startApp();
  };

  document.querySelectorAll('.nav-link').forEach(link => {
    link.onclick = function(e) {
      e.preventDefault();
      goTo(link.dataset.page);
    };
  });

  document.getElementById('sidebar-toggle').onclick = function() {
    document.getElementById('sidebar').classList.toggle('open');
  };
};
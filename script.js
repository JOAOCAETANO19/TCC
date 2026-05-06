// ====================== LIFT.ME - SCRIPT.JS ======================

const STATE = {
  name: '',
  xp: 0,
  nivel: 1,
  projetos: {},
  totalEtapas: 0,
  projetosCompletos: 0,
  carreiraEscolhida: '',
  conquistas: {
    'first-step': false,
    'first-proj': false,
    'level5': false,
    '10steps': false,
    'portfolio-ready': false
  }
};

const XP_POR_NIVEL = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];
const NOMES_NIVEL = ['', 'Iniciante', 'Aprendiz', 'Desenvolvedor Jr', 'Desenvolvedor', 'Sênior', 'Especialista', 'Mestre', 'Expert', 'Lenda', 'God Mode'];

const XP_POR_ETAPA = { p1: 20, p2: 25, p3: 30, p4: 22 };

function saveState() {
  localStorage.setItem('liftme_state', JSON.stringify(STATE));
}

function loadState() {
  try {
    const raw = localStorage.getItem('liftme_state');
    if (raw) {
      Object.assign(STATE, JSON.parse(raw));
    }
  } catch (e) {
    console.warn("Erro ao carregar estado");
  }
}

function startApp() {
  const nameInput = document.getElementById('name-input');
  const name = nameInput.value.trim();
  const carreira = document.getElementById('carreira-select').value;

  if (!name) {
    nameInput.style.borderColor = '#ff4444';
    setTimeout(() => nameInput.style.borderColor = '', 1500);
    return;
  }

  STATE.name = name;
  STATE.carreiraEscolhida = carreira;
  saveState();

  document.getElementById('modal-overlay').style.display = 'none';
  goTo('home');
  applyState();
  restoreChecklists();
  showRecomendacao();
}

function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  const link = document.querySelector(`[data-page="${page}"]`);
  if (link) link.classList.add('active');

  window.scrollTo(0, 0);
}

function applyState() {
  const initials = STATE.name ? STATE.name.slice(0, 2).toUpperCase() : 'EU';
  const nivelNome = NOMES_NIVEL[STATE.nivel] || 'Iniciante';

  // Atualiza sidebar e dashboard
  document.getElementById('avatar-initials').textContent = initials;
  document.getElementById('user-name-nav').textContent = STATE.name || 'Estudante';
  document.getElementById('dash-name').textContent = STATE.name || 'Estudante';
  document.getElementById('dash-initials').textContent = initials;

  const xpMin = XP_POR_NIVEL[STATE.nivel - 1] || 0;
  const xpMax = XP_POR_NIVEL[STATE.nivel] || 100;
  const xpPct = Math.min(100, ((STATE.xp - xpMin) / (xpMax - xpMin)) * 100);

  document.getElementById('xp-fill-mini').style.width = xpPct + '%';
  document.getElementById('xp-fill-big').style.width = xpPct + '%';
  document.getElementById('xp-label-nav').textContent = `${STATE.xp} / ${xpMax} XP`;
  document.getElementById('xp-num').textContent = `${STATE.xp - xpMin} / ${xpMax - xpMin} XP para o próximo nível`;
  document.getElementById('user-level-nav').textContent = `⭐ Nível ${STATE.nivel} — ${nivelNome}`;
  document.getElementById('dash-level-text').textContent = `⭐ Nível ${STATE.nivel} — ${nivelNome}`;
}

function showRecomendacao() {
  const box = document.getElementById('recomendacao-home');
  if (!box) return;

  let texto = "Comece criando seu **Portfólio Pessoal** (Projeto p1)!";
  
  if (STATE.projetosCompletos >= 2) {
    texto = "Ótimo progresso! Experimente projetos mais avançados.";
  } else if (STATE.projetosCompletos >= 1) {
    texto = "Próximo recomendado: **To-Do List Avançada**";
  }

  box.innerHTML = `<strong>🎯 Recomendação:</strong> ${texto}`;
}

function handleCheck(checkbox) {
  const proj = checkbox.dataset.proj;
  const step = parseInt(checkbox.dataset.step);
  const checked = checkbox.checked;

  if (!STATE.projetos[proj]) STATE.projetos[proj] = [false, false, false, false, false];

  const wasChecked = STATE.projetos[proj][step];
  const xpVal = XP_POR_ETAPA[proj] || 20;

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
  showRecomendacao();
}

function updateProjectProgress(proj) {
  const steps = STATE.projetos[proj] || [];
  const done = steps.filter(Boolean).length;
  const pct = (done / 5) * 100;

  const bar = document.getElementById('prog-' + proj);
  const label = document.getElementById('prog-label-' + proj);

  if (bar) bar.style.width = pct + '%';
  if (label) label.textContent = `${done} / 5`;

  // Atualiza total de projetos completos
  let completos = 0;
  ['p1', 'p2', 'p3', 'p4'].forEach(p => {
    if ((STATE.projetos[p] || []).filter(Boolean).length === 5) completos++;
  });
  STATE.projetosCompletos = completos;
}

function restoreChecklists() {
  ['p1', 'p2', 'p3', 'p4'].forEach(proj => {
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
  }
}

function checkConquistas() {
  if (STATE.totalEtapas >= 1) STATE.conquistas['first-step'] = true;
  if (STATE.projetosCompletos >= 1) STATE.conquistas['first-proj'] = true;
  if (STATE.nivel >= 5) STATE.conquistas['level5'] = true;
  if (STATE.totalEtapas >= 10) STATE.conquistas['10steps'] = true;
  if (STATE.projetosCompletos >= 3) STATE.conquistas['portfolio-ready'] = true;
}

function showXPToast(xp) {
  const toast = document.getElementById('xp-toast');
  toast.textContent = `⚡ +${xp} XP`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function showLevelUpToast(nivel) {
  const toast = document.getElementById('xp-toast');
  toast.style.background = '#ffb800';
  toast.textContent = `🎉 Nível ${nivel} Desbloqueado!`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.style.background = '';
  }, 3000);
}

// ====================== INIT ======================
window.onload = function () {
  loadState();

  if (STATE.name) {
    document.getElementById('modal-overlay').style.display = 'none';
    goTo('home');
    applyState();
    restoreChecklists();
    showRecomendacao();
  }

  document.getElementById('start-btn').onclick = startApp;

  // Enter no input
  document.getElementById('name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startApp();
  });

  // Navegação
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(link.dataset.page);
    });
  });
};
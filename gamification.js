// Personalização e metas: o banco é a fonte da verdade. Nenhuma escolha
// desconta XP, e as metas apenas leem o progresso que já existe.
window.Gamification = (() => {
  // Mantenha IDs e limiares alinhados à migração SQL.
  const THEMES = [
    { id: 'original', name: 'Original', minXp: 0, note: 'O clássico Pratica.dev' },
    { id: 'oceano', name: 'Oceano', minXp: 100, note: 'Azul tranquilo' },
    { id: 'aurora', name: 'Aurora', minXp: 250, note: 'Verde luminoso' },
    { id: 'cosmos', name: 'Cosmos', minXp: 500, note: 'Violeta profundo' }
  ];
  const FRAMES = [
    { id: 'simples', name: 'Simples', minXp: 0, note: 'Sem moldura' },
    { id: 'menta', name: 'Menta', minXp: 100, note: 'Brilho verde' },
    { id: 'violeta', name: 'Violeta', minXp: 300, note: 'Brilho lilás' },
    { id: 'solar', name: 'Solar', minXp: 600, note: 'Brilho dourado' }
  ];
  const CHALLENGES = [
    { id: 'aula-1', kind: 'lessons', target: 1, title: 'O primeiro passo', detail: 'Marque sua primeira aula como concluída.', label: 'ESTUDOS / 01', action: 'Ir às aulas', tab: 'estudos' },
    { id: 'aula-3', kind: 'lessons', target: 3, title: 'Pegando o ritmo', detail: 'Conclua 3 aulas, em qualquer curso.', label: 'ESTUDOS / 02', action: 'Ir às aulas', tab: 'estudos' },
    { id: 'aula-6', kind: 'lessons', target: 6, title: 'Aprender é constante', detail: 'Chegue a 6 aulas concluídas.', label: 'ESTUDOS / 03', action: 'Ir às aulas', tab: 'estudos' },
    { id: 'projeto-1', kind: 'projects', target: 1, title: 'Mão na massa', detail: 'Registre seu primeiro projeto concluído.', label: 'PRÁTICA / 01', action: 'Ver projetos', tab: 'projetos' },
    { id: 'projeto-3', kind: 'projects', target: 3, title: 'Ideias em ação', detail: 'Registre 3 projetos concluídos.', label: 'PRÁTICA / 02', action: 'Ver projetos', tab: 'projetos' },
    { id: 'certificado-1', kind: 'certificates', target: 1, title: 'Uma conquista para guardar', detail: 'Conquiste seu primeiro certificado.', label: 'CONQUISTAS / 01', action: 'Explorar cursos', tab: 'estudos' }
  ];

  const byId = id => document.getElementById(id);
  const freshState = () => ({
    settings: { status: 'idle', theme: 'original', frame: 'simples', joined: false, alias: null },
    challenges: { status: 'idle', counts: null },
    ranking: { status: 'idle', rows: [], feedback: '', invalid: false },
    draft: '', busy: false, settingsRequest: 0, challengeRequest: 0, rankingRequest: 0
  });
  let state = freshState();
  let epoch = 0;

  function snapshot() { return { epoch, userId: currentAuthId }; }
  function active(run) { return run.epoch === epoch && !!run.userId && run.userId === currentAuthId && !!currentUser; }
  function xpValue(value) {
    const xp = Number(value);
    return Number.isFinite(xp) && xp >= 0 ? xp : 0;
  }
  function findAllowed(catalog, id, xp) {
    return catalog.find(item => item.id === id && item.minXp <= xp) || catalog[0];
  }
  function ownAppearance() {
    const xp = currentUser ? xpValue(currentUser.xp) : 0;
    return {
      theme: findAllowed(THEMES, state.settings.theme, xp).id,
      frame: findAllowed(FRAMES, state.settings.frame, xp).id
    };
  }
  function normalizeAppearance(appearance, xp = Infinity) {
    const source = appearance || {};
    return { theme: findAllowed(THEMES, source.theme, xp).id, frame: findAllowed(FRAMES, source.frame, xp).id };
  }
  function themeId(appearance, xp) {
    return appearance === undefined ? ownAppearance().theme : normalizeAppearance(appearance, xpValue(xp)).theme;
  }
  function frameClass(appearance, xp) {
    const frame = appearance === undefined ? ownAppearance().frame : normalizeAppearance(appearance, xpValue(xp)).frame;
    return 'avatar-frame-' + frame;
  }
  function applyTheme(el) {
    if (el) el.dataset.profileTheme = ownAppearance().theme;
  }
  function applyAvatar(el) {
    if (!el) return;
    FRAMES.forEach(frame => el.classList.remove('avatar-frame-' + frame.id));
    el.classList.add(frameClass());
  }
  function applyPublicAppearance(container, appearance, xp) {
    const root = container?.querySelector('.public-appearance');
    if (!root) return;
    root.dataset.profileTheme = themeId(appearance || null, xp);
    const avatar = root.querySelector('.public-profile-hero .avatar-circle');
    if (avatar) {
      FRAMES.forEach(frame => avatar.classList.remove('avatar-frame-' + frame.id));
      avatar.classList.add(frameClass(appearance || null, xp));
    }
  }

  function reset() {
    epoch++;
    state = freshState();
    ['profile-customization', 'challenge-content', 'ranking-content'].forEach(id => {
      const el = byId(id); if (el) el.replaceChildren();
    });
    applyTheme(byId('profile-shell'));
    applyTheme(byId('portfolio-content'));
    applyAvatar(byId('nav-avatar'));
    applyAvatar(byId('prof-avatar'));
  }

  function refreshAppearanceViews() {
    if (!currentUser) return;
    renderDashboard();
    if (byId('tab-perfil')?.classList.contains('active')) renderProfile();
    if (byId('tab-portfolio')?.classList.contains('active')) renderPortfolio();
  }
  function start() {
    reset();
    loadSettings();
    // A aba pode continuar selecionada após sair e entrar novamente.
    if (isChallengesActive()) openChallenges();
  }

  async function loadSettings() {
    if (!currentUser || !currentAuthId || state.busy) return;
    const run = snapshot();
    const request = ++state.settingsRequest;
    state.settings.status = 'loading';
    renderCustomization();
    renderRanking();
    try {
      const data = await fetchGamificationSettings();
      if (!active(run) || request !== state.settingsRequest) return;
      if (!data || typeof data.ranking_joined !== 'boolean' || (data.ranking_joined && typeof data.ranking_alias !== 'string')) {
        throw new Error('Preferências inválidas');
      }
      state.settings.theme = findAllowed(THEMES, data.theme, xpValue(currentUser.xp)).id;
      state.settings.frame = findAllowed(FRAMES, data.frame, xpValue(currentUser.xp)).id;
      state.settings.joined = data.ranking_joined;
      state.settings.alias = data.ranking_joined ? data.ranking_alias : null;
      if (data.ranking_joined) state.draft = data.ranking_alias;
      state.settings.status = 'ready';
      state.ranking.feedback = '';
      state.ranking.invalid = false;
    } catch (e) {
      if (!active(run) || request !== state.settingsRequest) return;
      console.warn('Preferências indisponíveis:', e.message);
      state.settings.status = 'error';
      state.ranking.rows = [];
      state.ranking.status = 'idle';
    }
    if (!active(run) || request !== state.settingsRequest) return;
    refreshAppearanceViews();
    renderCustomization();
    renderRanking();
    if (state.settings.status === 'ready' && state.settings.joined && isChallengesActive()) loadRanking();
  }

  function rememberFocus(container) {
    const el = document.activeElement;
    if (!el || !el.id || !container.contains(el)) return null;
    let start = null, end = null;
    if (typeof el.selectionStart === 'number') { start = el.selectionStart; end = el.selectionEnd; }
    return { id: el.id, start, end };
  }
  function restoreFocus(focus) {
    if (!focus) return;
    const el = byId(focus.id);
    if (!el || el.disabled) return;
    el.focus({ preventScroll: true });
    if (focus.start !== null && typeof el.setSelectionRange === 'function') el.setSelectionRange(focus.start, focus.end);
  }

  function renderCustomization() {
    const el = byId('profile-customization');
    if (!el || !currentUser) return;
    if (state.settings.status === 'idle' || state.settings.status === 'loading') {
      el.innerHTML = '<p class="journey-status" role="status">Carregando suas opções...</p>';
      return;
    }
    if (state.settings.status === 'error') {
      el.innerHTML = '<div class="journey-error" role="alert"><span>Não foi possível confirmar suas preferências. Verifique a conexão e tente novamente. Se o problema persistir, peça ao administrador para conferir a migração de personalização.</span><button type="button" class="journey-button journey-button-quiet" onclick="Gamification.loadSettings()">Tentar novamente</button></div>';
      return;
    }
    const focus = rememberFocus(el);
    const xp = xpValue(currentUser.xp);
    const appearance = ownAppearance();
    const choices = (items, kind) => items.map(item => {
      const unlocked = xp >= item.minXp;
      const selected = appearance[kind] === item.id;
      const status = selected ? 'Em uso' : unlocked ? 'Disponível' : `${item.minXp} XP para desbloquear`;
      return `<button id="appearance-${kind}-${item.id}" type="button" class="appearance-choice ${selected ? 'is-selected' : ''}" aria-pressed="${selected}" ${!unlocked || state.busy ? 'disabled' : ''} onclick="Gamification.chooseAppearance('${kind}', '${item.id}')">
        <span class="appearance-swatch ${kind}-swatch-${item.id}" aria-hidden="true">${kind === 'frame' ? '<span></span>' : '<i></i><i></i>'}</span>
        <span class="appearance-choice-copy"><strong>${item.name}</strong><small>${status}</small></span>
        <span class="appearance-choice-mark" aria-hidden="true">${selected ? '✓' : unlocked ? '↗' : '⌁'}</span>
      </button>`;
    }).join('');
    el.innerHTML = `<div class="customizer-summary"><span>SEU XP ATUAL</span><strong>${xp} XP</strong><small>Os itens são liberados, nunca comprados.</small></div>
      <fieldset class="appearance-fieldset"><legend>Temas</legend><p>Um toque de cor no perfil e no portfólio.</p><div class="appearance-grid">${choices(THEMES, 'theme')}</div></fieldset>
      <fieldset class="appearance-fieldset"><legend>Molduras</legend><p>Escolha como destacar sua foto ou inicial.</p><div class="appearance-grid">${choices(FRAMES, 'frame')}</div></fieldset>
      <p class="customizer-privacy">Se seu portfólio estiver público, o tema e a moldura também aparecem nele. O ranking não mostra sua foto.</p>`;
    restoreFocus(focus);
  }

  function renderProfile() {
    applyTheme(byId('profile-shell'));
    applyAvatar(byId('prof-avatar'));
    renderCustomization();
  }

  async function chooseAppearance(kind, id) {
    if (!currentUser || !currentAuthId || state.settings.status !== 'ready' || state.busy) return;
    const catalog = kind === 'theme' ? THEMES : kind === 'frame' ? FRAMES : [];
    const item = catalog.find(option => option.id === id);
    if (!item || item.minXp > xpValue(currentUser.xp)) return;
    const old = ownAppearance();
    if (old[kind] === id) return;
    const desired = { ...old, [kind]: id };
    const run = snapshot();
    state.busy = true;
    renderCustomization(); renderRanking();
    try {
      const data = await saveProfileAppearance(desired.theme, desired.frame);
      if (!active(run)) return;
      if (!data || data.theme !== desired.theme || data.frame !== desired.frame) throw new Error('Resposta inválida');
      state.settings.theme = data.theme;
      state.settings.frame = data.frame;
      showToast('Estilo salvo! Seu XP e nível continuam os mesmos.', 'success');
    } catch (e) {
      if (!active(run)) return;
      console.warn('Não foi possível confirmar o estilo:', e.message);
      // A rede pode falhar depois de o banco gravar. Recarregue antes de
      // mostrar uma escolha como confirmada ou permitir outra alteração.
      state.settings.status = 'error';
      state.ranking.rows = [];
      state.ranking.status = 'idle';
      ++state.rankingRequest;
      showToast('Não foi possível confirmar o estilo. Atualize suas preferências e tente novamente.', 'error');
    } finally {
      if (active(run)) {
        state.busy = false;
        refreshAppearanceViews(); renderCustomization(); renderRanking();
        const button = byId(`appearance-${kind}-${id}`);
        if (button && !button.disabled && byId('tab-perfil')?.classList.contains('active')) button.focus({ preventScroll: true });
        if (state.settings.status === 'ready' && state.settings.joined && isChallengesActive() && state.ranking.status === 'idle') loadRanking();
      }
    }
  }

  function isChallengesActive() { return !!byId('tab-desafios')?.classList.contains('active'); }
  function openChallenges() {
    renderRanking();
    loadChallenges();
    if (state.settings.status === 'ready' && state.settings.joined && !state.busy) loadRanking();
  }
  function validCount(value) {
    if (typeof value !== 'number' && !(typeof value === 'string' && /^\d+$/.test(value))) return false;
    return Number.isSafeInteger(Number(value)) && Number(value) >= 0;
  }
  async function loadChallenges() {
    if (!currentUser || !currentAuthId) return;
    const run = snapshot();
    const request = ++state.challengeRequest;
    state.challenges.status = 'loading';
    renderChallenges();
    try {
      const data = await fetchChallengeProgress();
      if (!active(run) || request !== state.challengeRequest) return;
      if (!data || !['lessons', 'projects', 'certificates'].every(key => data[key] !== null && data[key] !== undefined && validCount(data[key]))) throw new Error('Progresso inválido');
      state.challenges.counts = Object.fromEntries(['lessons', 'projects', 'certificates'].map(key => [key, Number(data[key])]));
      state.challenges.status = 'ready';
    } catch (e) {
      if (!active(run) || request !== state.challengeRequest) return;
      console.warn('Metas indisponíveis:', e.message);
      state.challenges.status = 'error';
    }
    if (active(run) && request === state.challengeRequest) renderChallenges();
  }

  function renderChallenges() {
    const el = byId('challenge-content');
    if (!el) return;
    if (state.challenges.status === 'idle' || state.challenges.status === 'loading') {
      el.innerHTML = '<p class="journey-status" role="status">Carregando suas metas...</p>'; return;
    }
    if (state.challenges.status === 'error') {
      el.innerHTML = '<div class="journey-error" role="alert"><span>Não foi possível carregar suas metas. Seu progresso continua salvo. Confira a conexão e, se necessário, a migração de desafios.</span><button type="button" class="journey-button journey-button-quiet" onclick="Gamification.loadChallenges()">Tentar novamente</button></div>'; return;
    }
    const counts = state.challenges.counts;
    const finished = CHALLENGES.filter(challenge => counts[challenge.kind] >= challenge.target).length;
    const units = { lessons: ['aula', 'aulas'], projects: ['projeto', 'projetos'], certificates: ['certificado', 'certificados'] };
    el.innerHTML = `<div class="challenge-summary"><span>${finished} de ${CHALLENGES.length} metas concluídas</span><button type="button" onclick="Gamification.loadChallenges()">Atualizar progresso ↻</button></div>
      <div class="challenge-grid">${CHALLENGES.map(challenge => {
        const count = Math.min(counts[challenge.kind], challenge.target);
        const done = count >= challenge.target;
        const unit = units[challenge.kind][challenge.target === 1 ? 0 : 1];
        return `<article class="challenge-card challenge-${challenge.kind} ${done ? 'is-complete' : ''}" data-challenge="${challenge.id}">
          <div class="challenge-card-top"><span class="challenge-icon" aria-hidden="true">${done ? '✓' : '✦'}</span><span class="challenge-state">${done ? 'CONCLUÍDO' : 'EM PROGRESSO'}</span></div>
          <p class="challenge-label">${challenge.label}</p><h4>${challenge.title}</h4><p class="challenge-detail">${challenge.detail}</p>
          <div class="challenge-progress-label"><span>Progresso</span><strong>${count} / ${challenge.target}</strong></div>
          <progress value="${count}" max="${challenge.target}" aria-label="${challenge.title}: ${count} de ${challenge.target} ${unit}"></progress>
          <button type="button" class="challenge-action" onclick="switchTab('${challenge.tab}')">${challenge.action} <span aria-hidden="true">↗</span></button>
        </article>`;
      }).join('')}</div>`;
  }

  function setRankingDraft(value) { state.draft = value; }
  function renderRanking() {
    const el = byId('ranking-content');
    if (!el || !currentUser) return;
    if (state.settings.status === 'idle' || state.settings.status === 'loading') {
      el.innerHTML = '<p class="journey-status" role="status">Carregando sua preferência...</p>'; return;
    }
    if (state.settings.status === 'error') {
      el.innerHTML = '<div class="journey-error" role="alert"><span>Não foi possível confirmar se você participa. Atualize suas preferências para verificar seu estado; nenhuma adesão é presumida.</span><button type="button" class="journey-button journey-button-quiet" onclick="Gamification.loadSettings()">Tentar novamente</button></div>'; return;
    }
    const focus = rememberFocus(el);
    const joined = state.settings.joined;
    const feedback = state.ranking.feedback
      ? `<p id="ranking-feedback" class="ranking-feedback ${state.ranking.invalid ? 'is-error' : ''}" role="${state.ranking.invalid ? 'alert' : 'status'}">${escapeHtml(state.ranking.feedback)}</p>` : '';
    const results = !joined ? '' : state.ranking.status === 'loading' || state.ranking.status === 'idle'
      ? '<p class="journey-status" role="status">Carregando ranking...</p>'
      : state.ranking.status === 'error'
        ? '<div class="journey-error" role="alert"><span>Não foi possível carregar o ranking.</span><button type="button" class="journey-button journey-button-quiet" onclick="Gamification.loadRanking()">Tentar novamente</button></div>'
        : renderRankingRows();
    el.innerHTML = `<div class="ranking-controls"><div><p class="ranking-membership">${joined ? '<span aria-hidden="true">●</span> VOCÊ ESTÁ PARTICIPANDO' : '<span aria-hidden="true">○</span> VOCÊ NÃO ESTÁ PARTICIPANDO'}</p><h4>${joined ? 'Seu apelido no ranking' : 'Quer fazer parte?'}</h4><p>${joined ? 'Você pode alterar seu apelido ou sair sem afetar seu XP.' : 'Escolha um apelido para entrar. Não use nome completo nem dados pessoais.'}</p></div>
      <form id="ranking-form" class="ranking-form" onsubmit="event.preventDefault(); Gamification.submitRanking()">
        <label for="ranking-alias">Apelido</label><div class="ranking-form-row"><input id="ranking-alias" name="alias" type="text" minlength="2" maxlength="24" required autocomplete="off" spellcheck="false" placeholder="Ex.: dev_lua" value="${escapeHtml(state.draft)}" aria-describedby="ranking-alias-hint${state.ranking.feedback ? ' ranking-feedback' : ''}" aria-invalid="${state.ranking.invalid}" oninput="Gamification.setRankingDraft(this.value)" ${state.busy ? 'disabled' : ''}>
        <button id="ranking-submit" type="submit" class="journey-button journey-button-primary" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Salvando...' : joined ? 'Salvar apelido' : 'Participar do ranking'}</button></div>
        <p id="ranking-alias-hint">De 2 a 24 caracteres; não use @ nem dados pessoais.</p>${feedback}
      </form>
      ${joined ? `<button id="ranking-leave" type="button" class="ranking-leave" onclick="Gamification.leaveRanking()" ${state.busy ? 'disabled' : ''}>Sair do ranking</button>` : ''}</div>
      ${joined ? `<div class="ranking-board"><div class="ranking-board-heading"><div><h4>Placar da comunidade</h4><p>Até 50 participantes, mais você se estiver fora dos 50. Empates compartilham a posição.</p></div><button type="button" class="ranking-refresh" onclick="Gamification.loadRanking()" ${state.busy || state.ranking.status === 'loading' ? 'disabled' : ''}>Atualizar ↻</button></div>${results}</div>` : ''}`;
    restoreFocus(focus);
  }

  function renderRankingRows() {
    if (!state.ranking.rows.length) return '<p class="journey-status">Ainda não há participantes no ranking.</p>';
    return `<ol class="ranking-list" aria-label="Classificação por XP">${state.ranking.rows.map(row => `<li class="ranking-row ${row.is_self ? 'is-self' : ''}">
      <span class="ranking-position">${row.ranking_position}º</span><span class="ranking-alias">${escapeHtml(row.alias)}${row.is_self ? ' <small>VOCÊ</small>' : ''}</span><strong class="ranking-xp">${row.xp} <small>XP</small></strong>
    </li>`).join('')}</ol>`;
  }

  async function loadRanking() {
    if (!currentUser || !currentAuthId || state.settings.status !== 'ready' || !state.settings.joined || state.busy) return;
    const run = snapshot();
    const request = ++state.rankingRequest;
    state.ranking.status = 'loading';
    renderRanking();
    try {
      const rows = await fetchOptionalRanking();
      if (!active(run) || request !== state.rankingRequest || !state.settings.joined) return;
      if (!Array.isArray(rows) || rows.some(row => !row || typeof row.alias !== 'string' || !validCount(row.xp) || !validCount(row.ranking_position) || Number(row.ranking_position) < 1 || typeof row.is_self !== 'boolean')) throw new Error('Ranking inválido');
      state.ranking.rows = rows.map(row => ({ alias: row.alias, xp: Number(row.xp), ranking_position: Number(row.ranking_position), is_self: row.is_self }));
      state.ranking.status = 'ready';
    } catch (e) {
      if (!active(run) || request !== state.rankingRequest || !state.settings.joined) return;
      console.warn('Ranking indisponível:', e.message);
      state.ranking.rows = [];
      state.ranking.status = 'error';
    }
    if (active(run) && request === state.rankingRequest) renderRanking();
  }

  async function submitRanking() {
    if (state.settings.status !== 'ready' || state.busy) return;
    const input = byId('ranking-alias');
    const alias = (input ? input.value : state.draft).trim();
    state.draft = input ? input.value : state.draft;
    if (Array.from(alias).length < 2 || Array.from(alias).length > 24 || /[@\u0000-\u001f\u007f-\u009f]/u.test(alias)) {
      state.ranking.feedback = 'Use um apelido de 2 a 24 caracteres, sem @ ou caracteres de controle.';
      state.ranking.invalid = true;
      renderRanking();
      byId('ranking-alias')?.focus({ preventScroll: true });
      return;
    }
    await changeParticipation(true, alias);
  }
  async function leaveRanking() {
    if (state.settings.status !== 'ready' || !state.settings.joined || state.busy) return;
    await changeParticipation(false, null);
  }
  async function changeParticipation(join, alias) {
    if (!currentUser || !currentAuthId || state.busy) return;
    const run = snapshot();
    const wasJoined = state.settings.joined;
    state.busy = true;
    ++state.rankingRequest; // respostas iniciadas antes da mudança não reaparecem
    state.ranking.rows = [];
    state.ranking.status = 'idle';
    state.ranking.feedback = '';
    state.ranking.invalid = false;
    renderRanking(); renderCustomization();
    try {
      const data = await setRankingParticipation(join, alias);
      if (!active(run)) return;
      if (!data || data.joined !== join || (join && typeof data.alias !== 'string')) throw new Error('Resposta inválida');
      state.settings.joined = join;
      state.settings.alias = join ? data.alias : null;
      state.draft = join ? data.alias : '';
      state.ranking.feedback = join ? (wasJoined ? 'Apelido atualizado.' : 'Você entrou no ranking. Pode sair quando quiser.') : 'Você saiu do ranking. Seu XP permanece igual.';
      showToast(state.ranking.feedback, 'success');
    } catch (e) {
      if (!active(run)) return;
      console.warn('Não foi possível confirmar a participação:', e.message);
      state.settings.status = 'error';
      showToast('Não foi possível confirmar a alteração. Atualize suas preferências para verificar.', 'error');
    } finally {
      if (active(run)) {
        state.busy = false;
        renderRanking(); renderCustomization();
        if (state.settings.status === 'ready' && state.settings.joined && isChallengesActive()) loadRanking();
      }
    }
  }

  return { start, reset, loadSettings, renderProfile, applyTheme, applyAvatar, applyPublicAppearance, themeId, frameClass,
    chooseAppearance, openChallenges, loadChallenges, setRankingDraft, submitRanking, leaveRanking, loadRanking };
})();

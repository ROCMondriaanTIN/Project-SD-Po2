// Heel eenvoudige, goed begrijpbare versie zonder geschiedenis/tijd
document.addEventListener('DOMContentLoaded', () => {
  // ====== Config ======
  const START_BALANCE = 100;
  const LS_KEY = 'sebri_balance_v3';

  // ====== Elementen (querySelector gebruikt zoals gevraagd) ======
  const balanceEl = document.querySelector('#balance');
  const stakeInput = document.querySelector('#stake');
  const riskInput = document.querySelector('#risk');
  const riskVal = document.querySelector('#risk-val');
  const goBtn = document.querySelector('#go');
  const resetBtn = document.querySelector('#reset');
  const messageEl = document.querySelector('#message');
  const barFill = document.querySelector('#bar-fill');
  const barThreshold = document.querySelector('#bar-threshold');
  const barText = document.querySelector('#bar-text');
  const celebrateEl = document.querySelector('#celebrate');
  const multiplierOut = document.querySelector('#multiplierOut');
  const payoutOut = document.querySelector('#payoutOut');
  const preview = document.querySelector('#bar-preview');
  const track = document.querySelector('#risk-track');

  // ====== State ======
  let balance = loadBalance();

  // ====== Helpers ======
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function tryParseInt(n, fallback = 0) {
    const v = parseInt(n, 10);
    return Number.isFinite(v) ? v : fallback;
  }

  // ====== Persistence ======
  function loadBalance() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return START_BALANCE;
      const n = Number(raw);
      return Number.isFinite(n) ? n : START_BALANCE;
    } catch (e) {
      console.warn('localStorage niet beschikbaar', e);
      return START_BALANCE;
    }
  }

  function saveBalance() {
    try {
      localStorage.setItem(LS_KEY, String(balance));
    } catch (e) {
      console.warn('Kon saldo niet opslaan:', e);
    }
  }

  // ====== UI Updates ======
  function updateBalanceUI() {
    if (balanceEl) balanceEl.textContent = balance.toFixed(0);
  }

  function updateRiskUI() {
    const r = clamp(tryParseInt(riskInput.value, 20), 1, 95);
    if (riskVal) riskVal.textContent = String(r);
    if (barThreshold) barThreshold.style.left = `${r}%`;
    if (preview) {
      preview.style.width = `${r}%`;
      preview.setAttribute('data-percent', `${r}%`);
    }
    const multiplier = computeMultiplier(r);
    if (multiplierOut) multiplierOut.textContent = `${multiplier.toFixed(3)}×`;
    const stake = Math.max(0, tryParseInt(stakeInput.value, 0));
    const totalReturn = stake * multiplier;
    if (payoutOut) payoutOut.textContent = `${totalReturn.toFixed(2)}€`;
  }

  function showMessage(text, cls = '') {
    if (messageEl) {
      messageEl.textContent = text;
      messageEl.className = 'message ' + cls;
    }
  }

  // noop: geschiedenis uitgeschakeld (geen tijd/timestamps)
  function addHistory(/* text */) {
    // geschiedenis is verwijderd per verzoek
  }

  function animateWin() {
    if (!celebrateEl) return;
    celebrateEl.classList.add('show');
    setTimeout(() => celebrateEl.classList.remove('show'), 1200);
  }

  // ====== Multiplier (eenvoudige, uitlegbare formule) ======
  function computeMultiplier(riskPercent) {
    const r = clamp(tryParseInt(riskPercent, 1), 1, 95);
    return Math.max(1, 1 + (100 - r) / 50);
  }

  // ====== Game ======
  function go() {
    const stake = tryParseInt(stakeInput.value, 0);
    const risk = clamp(tryParseInt(riskInput.value, 0), 1, 95);

    if (stake <= 0) { showMessage('Inzet moet groter zijn dan €0', 'warning'); return; }
    if (stake > balance) { showMessage('Onvoldoende saldo', 'warning'); return; }

    goBtn.disabled = true;


    const roll = Math.floor(Math.random() * 100) + 1;

    if (barFill) barFill.style.width = `${roll}%`;
    if (barText) barText.textContent = `${roll}%`;

    const isWin = roll <= risk;
    const multiplier = computeMultiplier(risk);
    const payout = isWin ? Math.round(stake * multiplier) : 0;
    const netGain = isWin ? (payout - stake) : -stake;

    setTimeout(() => {
      if (isWin) {
        balance += payout;
        addHistory(`Win! inzet ${stake}€, risk ${risk}% — roll ${roll}% — +${netGain}€`);
        showMessage(`Gewonnen! +${netGain}€`, 'success');
        animateWin();
      } else {
        balance -= stake;
        addHistory(`Verloren — inzet ${stake}€, risk ${risk}% — roll ${roll}% — -${stake}€`);
        showMessage(`Verloren —${stake}€`, 'loss');
      }

      saveBalance();
      updateBalanceUI();
      updateRiskUI();
      goBtn.disabled = false;
    }, 450);
  }

  // ====== Reset ======
  function reset() {
    if (!confirm('Reset saldo naar beginwaarde?')) return;
    balance = START_BALANCE;
    saveBalance();
    updateBalanceUI();
    if (barFill) barFill.style.width = '0%';
    if (barText) barText.textContent = '—';
    showMessage('Saldo gereset. Veel succes!');
  }

  // ====== Drag / click voor threshold ======
  (function thresholdDrag() {
    const trackEl = document.querySelector('.bar-track');
    if (!trackEl || !barThreshold) return;

    function setByClientX(clientX) {
      const rect = trackEl.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      const perc = Math.round((x / rect.width) * 100);
      const r = clamp(perc, 1, 95);
      riskInput.value = r;
      updateRiskUI();
    }

    let dragging = false;

    barThreshold.addEventListener('pointerdown', (e) => {
      dragging = true;
      barThreshold.setPointerCapture(e.pointerId);
    });

    document.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      setByClientX(e.clientX);
    });

    document.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      try { barThreshold.releasePointerCapture(e.pointerId); } catch (err) {}
    });

    trackEl.addEventListener('click', (e) => setByClientX(e.clientX));
  })();

  // ====== Events ======
  if (goBtn) goBtn.addEventListener('click', go);
  if (resetBtn) resetBtn.addEventListener('click', reset);
  if (riskInput) riskInput.addEventListener('input', updateRiskUI);
  if (stakeInput) stakeInput.addEventListener('input', updateRiskUI);
  if (stakeInput) stakeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });

  // ====== Init ======
  updateBalanceUI();
  updateRiskUI();
  showMessage('Plaats inzet en druk GO om te starten.');
});
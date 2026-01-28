document.addEventListener('DOMContentLoaded', () => {
  const START_BALANCE = 100;            
  const LS_KEY = 'sebri_balance_v3';    
  const balanceEl = document.querySelector('#balance');       
  const stakeInput = document.querySelector('#stake');       
  const riskInput = document.querySelector('#risk');          // range input voor risk (%)
  const riskVal = document.querySelector('#risk-val');        // tekstweergave van risk (%)
  const goBtn = document.querySelector('#go');              
  const resetBtn = document.querySelector('#reset');          
  const messageEl = document.querySelector('#message');       
  const barFill = document.querySelector('#bar-fill');        // visuele balk die roll toont (breedte = roll%)
  const barThreshold = document.querySelector('#bar-threshold'); // marker voor gekozen risk (positie = risk%)
  const barText = document.querySelector('#bar-text');        
  const celebrateEl = document.querySelector('#celebrate');  
  const multiplierOut = document.querySelector('#multiplierOut'); // toont berekende multiplier (×)
  const payoutOut = document.querySelector('#payoutOut');    
  const preview = document.querySelector('#bar-preview');     // preview-vulling onder de threshold
  const track = document.querySelector('#risk-track');  // bar aanpassen

  let balance = loadBalance(); // het huidige saldo (geladen uit localStorage of START_BALANCE)


  // clamp: houdt een getal binnen [a, b]
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // tryParseInt: parse een string naar int, retourneer fallback als het niet lukt
  function tryParseInt(n, fallback = 0) {
    const v = parseInt(n, 10);
    return Number.isFinite(v) ? v : fallback;
  }


  // loadBalance: probeer saldo uit localStorage te lezen, val terug op START_BALANCE bij fouten
  function loadBalance() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return START_BALANCE;              // niets gevonden -> startwaarde
      const n = Number(raw);
      return Number.isFinite(n) ? n : START_BALANCE; // valideer dat het een nummer is
    } catch (e) {
      // localStorage kan onbeschikbaar zijn (private mode, errors) -> log en fallback
      console.warn('localStorage niet beschikbaar', e);
      return START_BALANCE;
    }
  }

  // saveBalance: sla huidig saldo op in localStorage (veilig in try/catch)
  function saveBalance() {
    try {
      localStorage.setItem(LS_KEY, String(balance));
    } catch (e) {
      console.warn('Kon saldo niet opslaan:', e);
    }
  }

  // ====== UI Updates ======

  // updateBalanceUI: toon het saldo (zonder decimalen) in de DOM
  function updateBalanceUI() {
    if (balanceEl) balanceEl.textContent = balance.toFixed(0);
  }

  // updateRiskUI: update alles wat met de risk-instelling te maken heeft:
  // - toont het risk percentage
  // - zet de threshold marker in de bar (positie = risk%)
  // - preview van de gekozen zone
  // - toont berekende multiplier en geschatte payout bij winst
  function updateRiskUI() {
    // lees risk uit input, met fallback 20 indien input leeg/ongeldig
    const r = clamp(tryParseInt(riskInput.value, 20), 1, 95); // beperking 1..95
    if (riskVal) riskVal.textContent = String(r);            // update percentage tekst
    if (barThreshold) barThreshold.style.left = `${r}%`;     // verplaats threshold marker
    if (preview) {
      preview.style.width = `${r}%`;                         // preview-vulling tot threshold
      preview.setAttribute('data-percent', `${r}%`);         // optioneel attribuut voor CSS/ARIA
    }
    // bereken multiplier en laat zien
    const multiplier = computeMultiplier(r);
    if (multiplierOut) multiplierOut.textContent = `${multiplier.toFixed(3)}×`;

    // bereken wat je krijgt bij winst (stake × multiplier) en toon dat
    const stake = Math.max(0, tryParseInt(stakeInput.value, 0));
    const totalReturn = stake * multiplier;
    if (payoutOut) payoutOut.textContent = `${totalReturn.toFixed(2)}€`;
  }

  // showMessage: zet een tekst en (optioneel) een CSS-klasse op het message element
  // classes kunnen gebruikt worden voor styling: 'warning', 'success', 'loss', etc.
  function showMessage(text, cls = '') {
    if (messageEl) {
      messageEl.textContent = text;
      messageEl.className = 'message ' + cls;
    }
  }

  // addHistory: in deze eenvoudige versie is geschiedenis uitgeschakeld (noop)
  // in meer gevorderde versies zou je hier de laatste ronden loggen in een lijst
  function addHistory(/* text */) {
    // geen implementatie — geschiedenis weggelaten op verzoek
  }

  // animateWin: speel een eenvoudige win-animatie (emoji en CSS class)
  function animateWin() {
    if (!celebrateEl) return;
    celebrateEl.classList.add('show');
    setTimeout(() => celebrateEl.classList.remove('show'), 1200);
  }

  // ====== Multiplier (eenvoudige, uitlegbare formule) ======
  // computeMultiplier: bepaalt hoeveel keer je je inzet terugkrijgt bij winst.
  // Simpele formule: hogere risk => lager extra rendement, lagere risk => hogere reward.
  function computeMultiplier(riskPercent) {
    const r = clamp(tryParseInt(riskPercent, 1), 1, 95);
    // voorbeeld: r = 50 -> 1 + (100 - 50) / 50 = 1 + 1 = 2×
    // zorgt altijd voor minimaal 1× (tenminste je krijgt niets minder dan je inzet terug bij winst).
    return Math.max(1, 1 + (100 - r) / 50);
  }

  // ====== Game logic (GO) ======
  // Dit is de kern: wordt uitgevoerd als je op GO klikt.
  function go() {
    // veilige parsing van inputs
    const stake = tryParseInt(stakeInput.value, 0);                  // inzet in €
    const risk = clamp(tryParseInt(riskInput.value, 0), 1, 95);     // risk in %

    // Validatie: controleer inzet en risk voordat we gaan rollen
    if (stake <= 0) { showMessage('Inzet moet groter zijn dan €0', 'warning'); return; }
    if (stake > balance) { showMessage('Onvoldoende saldo', 'warning'); return; }

    // knop uitschakelen zodat gebruiker niet meerdere keren kan klikken
    goBtn.disabled = true;

    // Randomized outcome 1..100
    // Math.random() geeft een getal in [0, 1) (uniform).
    // *100 geeft [0, 100) en Math.floor(...) + 1 geeft integer 1..100.
    // Dit betekent: elk getal 1..100 is even waarschijnlijk.
    const roll = Math.floor(Math.random() * 100) + 1;

    // Update visuele balk en tekst: barFill breedte = roll%
    if (barFill) barFill.style.width = `${roll}%`;
    if (barText) barText.textContent = `${roll}%`;

    // Bepaal of speler wint: we interpreteren 'risk' als de win-kans in procenten.
    // Als roll <= risk dan is het een winst. Met risk = 30 -> kans 30/100 = 30%.
    const isWin = roll <= risk;

    // Bereken multiplier en payout
    const multiplier = computeMultiplier(risk);
    // Bij winst: payout = stake * multiplier; anders 0
    const payout = isWin ? Math.round(stake * multiplier) : 0;
    // netto winst/verlies: bij winst payout - stake, anders -stake
    const netGain = isWin ? (payout - stake) : -stake;

    // korte timeout zodat de gebruiker de bar kan zien bewegen voordat we resultaten tonen
    setTimeout(() => {
      if (isWin) {
        // update saldo met winst
        balance += netGain; // netGain is positief bij winst
        addHistory(`Win! inzet ${stake}€, risk ${risk}% — roll ${roll}% — +${netGain}€`);
        showMessage(`Gewonnen! +${netGain}€ 🎉`, 'success');
        animateWin();
      } else {
        // verlies: trek inzet af van saldo
        balance += netGain; // netGain is negatief bij verlies (dus aftrekken)
        addHistory(`Verloren — inzet ${stake}€, risk ${risk}% — roll ${roll}% — ${netGain}€`);
        showMessage(`Verloren —${-netGain}€ 😞`, 'loss');
      }

      // persist en update UI
      saveBalance();
      updateBalanceUI();
      goBtn.disabled = false; // knop weer beschikbaar maken
    }, 450);
  }

  // ====== Reset ======
  function reset() {
    if (!confirm('Reset saldo naar beginwaarde?')) return;
    balance = START_BALANCE;
    saveBalance();
    updateBalanceUI();
    // reset visuele indicatoren
    if (barFill) barFill.style.width = '0%';
    if (barText) barText.textContent = '—';
    showMessage('Saldo gereset. Veel succes!');
  }

  // ====== Drag / click voor threshold (deze code maakt de bar klik- en sleepbaar) ======
  (function thresholdDrag() {
    const trackEl = document.querySelector('.bar-track');
    if (!trackEl || !barThreshold) return;

    // zet threshold op basis van clientX (muis/touch positie)
    function setByClientX(clientX) {
      const rect = trackEl.getBoundingClientRect();
      // x = muis positie binnen de track (0..rect.width)
      const x = clamp(clientX - rect.left, 0, rect.width);
      // perc = afgeronde percentage positie
      const perc = Math.round((x / rect.width) * 100);
      // clamp tussen 1 en 95 (zoals elders in code)
      const r = clamp(perc, 1, 95);
      // update input en UI
      riskInput.value = r;
      updateRiskUI();
    }

    // mouse events voor desktop
    let dragging = false;
    trackEl.addEventListener('mousedown', (ev) => { dragging = true; setByClientX(ev.clientX); });
    window.addEventListener('mousemove', (ev) => { if (dragging) setByClientX(ev.clientX); });
    window.addEventListener('mouseup', () => { dragging = false; });

    // touch events voor mobiel
    trackEl.addEventListener('touchstart', (ev) => { setByClientX(ev.touches[0].clientX); ev.preventDefault(); });
    trackEl.addEventListener('touchmove', (ev) => { setByClientX(ev.touches[0].clientX); ev.preventDefault(); });
  })();
  
  goBtn.addEventListener('click', go);
  resetBtn.addEventListener('click', reset);
  riskInput.addEventListener('input', updateRiskUI);
  stakeInput.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });

  // Toon initiele waarden (saldo, risk, multiplier, payout)
  updateBalanceUI();
  updateRiskUI();
});
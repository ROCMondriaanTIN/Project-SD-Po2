(() => {
	// ====== Config / constants ======
	const START_BALANCE = 100; // beginbedrag bij eerste gebruik of na reset
	const LS_KEY = 'sebri_balance_v2'; // sleutel voor localStorage opslag

	// ====== Element-referenties ======
const balanceEl = document.querySelector('#balance');          // toont huidig saldo
const stakeInput = document.querySelector('#stake');           // input voor inzet
const riskInput = document.querySelector('#risk');             // range input voor risk (%)
const riskVal = document.querySelector('#risk-val');           // label dat huidige risk toont
const goBtn = document.querySelector('#go');                   // GO knop element
const resetBtn = document.querySelector('#reset');             // Reset knop element
const messageEl = document.querySelector('#message');          // gebied voor statusmeldingen
const historyEl = document.querySelector('#history');          // lijst met recente rondes
const barFill = document.querySelector('#bar-fill');           // visuele balk die roll toont
const barThreshold = document.querySelector('#bar-threshold'); // visuele threshold positie
const barText = document.querySelector('#bar-text');           // tekst onder de balk met roll %
const celebrateEl = document.querySelector('#celebrate');      // element voor win-animatie / emoji

	// NIEUW: outputs voor multiplier en payout
	const multiplierOut = document.getElementById('multiplierOut'); // toont multiplier (×)
	const payoutOut = document.getElementById('payoutOut'); // toont totale terugbetaling in €

	// ====== State ======
	let balance = loadBalance(); // laad saldo (of startwaarde)

	// Initialisatie UI
	updateBalanceUI(); // update saldo weergave
	updateRiskUI(); // update risk/multiplier weergave

	// ====== Persistance ======
	function loadBalance() { // laad balance uit localStorage
		const raw = localStorage.getItem(LS_KEY); // haal opgeslagen waarde op
		if (raw === null) return START_BALANCE; // geen opgeslagen waarde => startwaarde
		const n = Number(raw); // parse naar nummer
		return Number.isFinite(n) ? n : START_BALANCE; // valideer of number geldig is
	}

	function saveBalance() { // sla balance op in localStorage
		localStorage.setItem(LS_KEY, String(balance)); // zet als string
	}

	// ====== UI Update Helpers ======
	function updateBalanceUI() { // update DOM met huidig balance
		balanceEl.textContent = balance.toFixed(0); // toon als geheel getal
	}

	function updateRiskUI() { // update risk-label, threshold en multiplier/payout preview
		const r = Number(riskInput.value); // huidige risk (1..95)
		riskVal.textContent = String(r); // toon risk in UI
		// zet threshold visueel (linker positie in %)
		barThreshold.style.left = `${r}%`;

		// bereken multiplier en update de weergave
		const multiplier = computeMultiplier(r); // bereken multiplier op basis van risk
		multiplierOut.textContent = `${multiplier.toFixed(3)}×`; // toon met 3 decimalen

		// bereken en toon totale terugbetaling bij winst (stake × multiplier)
		const stake = Math.max(0, Math.floor(Number(stakeInput.value) || 0)); // veilige parse van inzet
		const totalReturn = (stake * multiplier); // totale payout
		payoutOut.textContent = `${totalReturn.toFixed(2)}€`; // toon met 2 decimalen
	}

	// ====== UI / History / Messages ======
	function showMessage(text, cls = '') { // simpele helper om statusboodschap te tonen
		messageEl.textContent = text; // zet tekst
		messageEl.className = cls; // optionele CSS-klasse (warning, success, loss)
	}

	function addHistory(text) { // voeg regel toe aan geschiedenis
		const li = document.createElement('li'); // maak li element
		li.textContent = `${new Date().toLocaleTimeString()} — ${text}`; // timestamp + tekst
		historyEl.prepend(li); // voeg bovenaan toe
		// bewaar max 12 items, verwijder oudste indien nodig
		while (historyEl.children.length > 12) historyEl.removeChild(historyEl.lastChild);
	}

	function animateWin() { // eenvoudige visuele win-animatie
		celebrateEl.classList.add('show'); // toon emoji
		setTimeout(() => celebrateEl.classList.remove('show'), 1200); // verwijder na 1.2s
		balanceEl.classList.add('win'); // pulse effect op saldo
		setTimeout(() => balanceEl.classList.remove('win'), 900); // verwijder pulse na 0.9s
	}

	// ====== Multiplier formule ======
	// Deze functie bepaalt hoeveel keer de inzet terugbetaald wordt bij winst
	// We gebruiken een calibratie zodat:
	//  - risk = 95  => multiplier ≈ 1.007
	//  - risk = 13  => multiplier ≈ 2.900
	// De formule is m = A / risk + B, en wordt geclamped naar minimaal 1.
	function computeMultiplier(riskPercent) {
		const A = 28.5; // calibratie-constant A
		const B = 0.707; // calibratie-constant B
		const r = Math.max(1, Number(riskPercent) || 1); // zorg dat risk minimaal 1 is (geen deling door 0)
		const m = A / r + B; // basisberekening
		return Math.max(1, m); // garandeer dat multiplier minimaal 1 is
	}

	// ====== Game / Roll ======
	function go() { // wordt aangeroepen bij klikken op GO
		const stake = Math.floor(Number(stakeInput.value) || 0); // parse inzet (gehele euro)
		const risk = Math.floor(Number(riskInput.value) || 0); // parse risk (geheel procent)

		// Validatie input
		if (stake <= 0) { showMessage('Inzet moet groter zijn dan €0', 'warning'); return; } // check inzet
		if (stake > balance) { showMessage('Onvoldoende saldo voor deze inzet', 'warning'); return; } // check genoeg saldo
		if (risk < 1 || risk > 95) { showMessage('Kies een risk tussen 1% en 95%', 'warning'); return; } // check geldige risk

		goBtn.disabled = true; // voorkom dubbelklikken tijdens ronde

		// Random roll 1..100
		const roll = Math.floor(Math.random() * 100) + 1; // random integer 1..100

		// Update visuele balk en tekst
		barFill.style.width = `${roll}%`; // vul balk tot roll%
		barText.textContent = `${roll}%`; // toon roll%

		// Bepaal of speler wint: roll <= risk -> winst (hier interpreteert risk als win-kans %)
		const isWin = roll <= risk; // boolean: true bij winst

		// Bereken payout met multiplier
		const multiplier = computeMultiplier(risk); // bepaal multiplier
		const payout = isWin ? Math.round(stake * multiplier) : 0; // totaal terug bij winst (afronden)
		const netGain = isWin ? (payout - stake) : -stake; // netto winst of verlies berekenen

		// Kleine delay zodat visuele overgang zichtbaar is
		setTimeout(() => {
			if (isWin) {
				balance += payout; // tel volledige payout bij balance (inclusief inzet)
				addHistory(`Win! inzet ${stake}€, risk ${risk}% — roll ${roll}% — +${netGain}€`); // log
				showMessage(`Gewonnen! +${netGain}€ 🎉`, 'success'); // positieve boodschap
				animateWin(); // visuele feedback
			} else {
				balance -= stake; // verlies: inzet gaat van balance af
				addHistory(`Verloren — inzet ${stake}€, risk ${risk}% — roll ${roll}% — -${stake}€`); // log verlies
				showMessage(`Verloren —${stake}€ 😞`, 'loss'); // negatieve boodschap
			}

			saveBalance(); // persist saldo
			updateBalanceUI(); // update saldo weergave
			updateRiskUI(); // update multiplier/payout preview (voor het geval stake is veranderd)
			goBtn.disabled = false; // opnieuw inzetten mogelijk
		}, 450); // 450ms delay
	}

	// ====== Reset ======
	function reset() { // reset naar beginwaarde
		if (!confirm('Reset saldo naar beginwaarde?')) return; // simpele confirm
		balance = START_BALANCE; // zet balance terug
		saveBalance(); // sla op
		updateBalanceUI(); // update weergave
		historyEl.innerHTML = ''; // leeg historie
		barFill.style.width = '0%'; // reset balk
		barText.textContent = '—'; // reset tekst
		showMessage('Saldo gereset. Veel succes!'); // informeer gebruiker
	}

	// ====== Events ======
	goBtn.addEventListener('click', go); // GO knop -> go()
	resetBtn.addEventListener('click', reset); // Reset knop -> reset()
	riskInput.addEventListener('input', updateRiskUI); // slider moved -> update preview
	stakeInput.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }); // enter op inzet -> go()
	stakeInput.addEventListener('input', updateRiskUI); // wijziging inzet -> update payout preview

	// ====== Init ======
	updateRiskUI(); // init risk/multiplier preview
	showMessage('Plaats inzet en druk op GO om te starten.'); // startboodschap
})();
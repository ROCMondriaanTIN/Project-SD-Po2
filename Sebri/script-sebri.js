/* DICE Game — Stake + Risk
	 - Risk (%) controls win chance. Lower risk -> higher payout.
	 - GO button triggers roll; result is randomized 1..100 against risk.
	 - Visual bar shows roll and threshold; balance persistence via localStorage.
	 - Optional: click sound and win animation implemented with WebAudio + CSS.
*/

(() => {
	const START_BALANCE = 100;
	const LS_KEY = 'sebri_balance_v2';

	// Elements
	const balanceEl = document.getElementById('balance');
	const stakeInput = document.getElementById('stake');
	const riskInput = document.getElementById('risk');
	const riskVal = document.getElementById('risk-val');
	const goBtn = document.getElementById('go');
	const resetBtn = document.getElementById('reset');
	const messageEl = document.getElementById('message');
	const historyEl = document.getElementById('history');
	const barFill = document.getElementById('bar-fill');
	const barThreshold = document.getElementById('bar-threshold');
	const barText = document.getElementById('bar-text');
	const celebrateEl = document.getElementById('celebrate');

	let balance = loadBalance();
	updateBalanceUI();
	updateRiskUI();

	// Audio context for simple sounds
	const audioCtx = typeof window.AudioContext !== 'undefined' ? new AudioContext() : null;

	function loadBalance() {
		const raw = localStorage.getItem(LS_KEY);
		if (raw === null) return START_BALANCE;
		const n = Number(raw);
		return Number.isFinite(n) ? n : START_BALANCE;
	}

	function saveBalance() {
		localStorage.setItem(LS_KEY, String(balance));
	}

	function updateBalanceUI() {
		balanceEl.textContent = balance.toFixed(0);
	}

	function updateRiskUI() {
		const r = Number(riskInput.value);
		riskVal.textContent = String(r);
		// show threshold position
		barThreshold.style.left = `${r}%`;
	}

	function playClick() {
		if (!audioCtx) return;
		const o = audioCtx.createOscillator();
		const g = audioCtx.createGain();
		o.type = 'sine';
		o.frequency.value = 500;
		o.connect(g); g.connect(audioCtx.destination);
		g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
		g.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.01);
		o.start();
		setTimeout(() => { o.stop(); }, 120);
	}

	function playWin() {
		if (!audioCtx) return;
		const t0 = audioCtx.currentTime;
		for (let i = 0; i < 3; i++) {
			const o = audioCtx.createOscillator();
			const g = audioCtx.createGain();
			o.type = 'triangle';
			o.frequency.value = 600 + i * 120;
			o.connect(g); g.connect(audioCtx.destination);
			g.gain.setValueAtTime(0.0001, t0 + i * 0.06);
			g.gain.exponentialRampToValueAtTime(0.12, t0 + i * 0.06 + 0.02);
			o.start(t0 + i * 0.06);
			o.stop(t0 + i * 0.06 + 0.12);
		}
	}

	function showMessage(text, cls = '') {
		messageEl.textContent = text;
		messageEl.className = cls;
	}

	function addHistory(text) {
		const li = document.createElement('li');
		li.textContent = `${new Date().toLocaleTimeString()} — ${text}`;
		historyEl.prepend(li);
		while (historyEl.children.length > 12) historyEl.removeChild(historyEl.lastChild);
	}

	function animateWin() {
		celebrateEl.classList.add('show');
		setTimeout(() => celebrateEl.classList.remove('show'), 1200);
		balanceEl.classList.add('win');
		setTimeout(() => balanceEl.classList.remove('win'), 900);
	}

	function go() {
		const stake = Math.floor(Number(stakeInput.value) || 0);
		const risk = Math.floor(Number(riskInput.value) || 0);

		// Validation
		if (stake <= 0) { showMessage('Inzet moet groter zijn dan €0', 'warning'); return; }
		if (stake > balance) { showMessage('Onvoldoende saldo voor deze inzet', 'warning'); return; }
		if (risk < 1 || risk > 95) { showMessage('Kies een risk tussen 1% en 95%', 'warning'); return; }

		// Play click sound
		playClick();
		goBtn.disabled = true;

		// Randomized outcome 1..100
		const roll = Math.floor(Math.random() * 100) + 1;

		// Fill bar and show roll value
		barFill.style.width = `${roll}%`;
		barText.textContent = `${roll}%`;

		// Determine win: roll <= risk -> win
		const isWin = roll <= risk;

		// Payout calculation: lower risk -> larger payout
		const payoutMultiplier = Math.max(1, Math.floor((100 - risk) / Math.max(1, risk)));
		const winGain = isWin ? Math.max(1, Math.floor(stake * payoutMultiplier)) : 0;

		// Small delay to show bar
		setTimeout(() => {
			if (isWin) {
				balance += winGain;
				addHistory(`Win! inzet ${stake}€, risk ${risk}% — roll ${roll}% — +${winGain}€`);
				showMessage(`Gewonnen! +${winGain}€ 🎉`, 'success');
				animateWin();
				playWin();
			} else {
				balance -= stake;
				addHistory(`Verloren — inzet ${stake}€, risk ${risk}% — roll ${roll}% — -${stake}€`);
				showMessage(`Verloren —${stake}€ 😞`, 'loss');
			}

			saveBalance();
			updateBalanceUI();
			goBtn.disabled = false;
		}, 450);
	}

	function reset() {
		if (!confirm('Reset saldo naar beginwaarde?')) return;
		balance = START_BALANCE;
		saveBalance();
		updateBalanceUI();
		historyEl.innerHTML = '';
		barFill.style.width = '0%';
		barText.textContent = '—';
		showMessage('Saldo gereset. Veel succes!');
	}

	// Events
	goBtn.addEventListener('click', go);
	resetBtn.addEventListener('click', reset);
	riskInput.addEventListener('input', updateRiskUI);
	stakeInput.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });

	// Init UI
	updateRiskUI();
	showMessage('Plaats inzet en druk op GO om te starten.');
})();

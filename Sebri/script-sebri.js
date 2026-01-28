// Start saldo
let balance = 100;

// Elementen ophalen (ALLEEN querySelector)
const balanceText   = document.querySelector("#balance");
const stakeInput    = document.querySelector("#stake");
const riskInput     = document.querySelector("#risk");
const riskValue     = document.querySelector("#riskValue");
const goButton      = document.querySelector("#go");
const resetButton   = document.querySelector("#reset");
const message       = document.querySelector("#message");
const barFill       = document.querySelector("#barFill");
const rollText      = document.querySelector("#rollText");
const multiplierTxt = document.querySelector("#multiplier");
const payoutTxt     = document.querySelector("#payout");


function updateInfo() {
  let risk = Number(riskInput.value);
  let stake = Number(stakeInput.value);

  riskValue.textContent = risk;

  let multiplier = 1 + (100 - risk) / 50;
  multiplierTxt.textContent = multiplier.toFixed(2) + "×";

  let payout = stake * multiplier;
  payoutTxt.textContent = payout.toFixed(2) + "€";
}

function playGame() {
  let stake = Number(stakeInput.value);
  let risk = Number(riskInput.value);

  if (stake <= 0) {
    message.textContent = "Inzet moet groter zijn dan 0";
    return;
  }

  if (stake > balance) {
    message.textContent = "Niet genoeg saldo";
    return;
  }

  let roll = Math.floor(Math.random() * 100) + 1;

  rollText.textContent = "Roll: " + roll;  // Toon roll
  barFill.style.width = roll + "%";

  if (roll <= risk) {
    let multiplier = 1 + (100 - risk) / 50;
    let winAmount = stake * multiplier;

    balance = balance + winAmount - stake;
    message.textContent = "Je wint!";
  } else {
    balance = balance - stake;
    message.textContent = "Je verliest!";
  }

  balanceText.textContent = Math.round(balance);   // Update saldo
}
function resetGame() {
  balance = 100;
  balanceText.textContent = balance;
  barFill.style.width = "0%";
  rollText.textContent = "—";
  message.textContent = "Spel gereset";
}

goButton.addEventListener("click", playGame);
resetButton.addEventListener("click", resetGame);
riskInput.addEventListener("input", updateInfo);
stakeInput.addEventListener("input", updateInfo);

updateInfo();

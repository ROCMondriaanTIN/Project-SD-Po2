const cardEl = document.getElementById("card");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const msgEl = document.getElementById("msg");
const higherBtn = document.getElementById("higher");
const lowerBtn = document.getElementById("lower");
const resetBtn = document.getElementById("reset");

const rankTL = document.getElementById("rankTL");
const suitTL = document.getElementById("suitTL");
const rankBR = document.getElementById("rankBR");
const suitBR = document.getElementById("suitBR");
const centerSuit = document.getElementById("centerSuit");

let prev = null;
let score = 0;
let lives = 3;

const suits = [
  { sym: "♠", color: "black" },
  { sym: "♥", color: "red" },
  { sym: "♦", color: "red" },
  { sym: "♣", color: "black" },
];

function randCard() {
  const value = Math.floor(Math.random() * 13) + 1;
  const s = suits[Math.floor(Math.random() * suits.length)];
  return { value, suit: s.sym, color: s.color };
}
function label(v) {
  if (v === 1) return "A";
  if (v === 11) return "J";
  if (v === 12) return "Q";
  if (v === 13) return "K";
  return v.toString();
}
function updateHUD() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}
function applyCardToDOM(card) {
  rankTL.textContent = label(card.value);
  rankBR.textContent = label(card.value);
  suitTL.textContent = card.suit;
  suitBR.textContent = card.suit;
  centerSuit.textContent = card.suit;

  cardEl.classList.remove("front-red", "front-black");
  if (card.color === "red") cardEl.classList.add("front-red");
  else cardEl.classList.add("front-black");
}

function start() {
  score = 0;
  lives = 3;
  prev = randCard();
  applyCardToDOM(prev);
  msgEl.textContent = "Raad: hoger of lager";
  updateHUD();
  enable(true);
}

function enable(v) {
  higherBtn.disabled = !v;
  lowerBtn.disabled = !v;
}

function makeGuess(wantHigher) {
  const next = randCard();

  applyCardToDOM(next);

  if (next.value === prev.value) {
    msgEl.textContent = `Gelijk (${label(next.value)}) — niks gebeurt`;
  } else {
    const realHigher = next.value > prev.value;
    if (realHigher === wantHigher) {
      score += 10;
      msgEl.textContent = `Goed! ${label(prev.value)} → ${label(
        next.value
      )} (+10)`;
    } else {
      lives -= 1;
      msgEl.textContent = `Fout! ${label(prev.value)} → ${label(
        next.value
      )} (-1 leven)`;
    }
  }

  prev = next;
  updateHUD();

  if (lives <= 0) {
    msgEl.textContent = `Game over — score: ${score}`;
    enable(false);
  }
}

higherBtn.addEventListener("click", () => makeGuess(true));
lowerBtn.addEventListener("click", () => makeGuess(false));
resetBtn.addEventListener("click", start);

window.addEventListener("keydown", (e) => {
  if (e.key === "h" || e.key === "H") higherBtn.click();
  if (e.key === "l" || e.key === "L") lowerBtn.click();
  if (e.key === "r" || e.key === "R") resetBtn.click();
});

start();
    
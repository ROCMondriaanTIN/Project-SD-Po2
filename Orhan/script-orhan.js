let money = 1000;
let bet = 0;

let deck = [];
let playerHand = [];
let dealerHand = [];

const moneyDisplay = document.querySelector("#money");
const chips = document.querySelectorAll(".chip");

const dealBtn = document.querySelector("#deal");
const hitBtn = document.querySelector("#hit");
const standBtn = document.querySelector("#stand");

const playerHandEl = document.querySelector("#player-hand");
const dealerHandEl = document.querySelector("#dealer-hand");
const effectMessage = document.querySelector("#effect-message");

function showEffect(type, text) {
    effectMessage.className = "";
    effectMessage.classList.add(type);
    effectMessage.textContent = text;

    setTimeout(() => {
        effectMessage.classList.add("show");
    }, 10);

    setTimeout(() => {
        effectMessage.classList.remove("show");
    }, 2000);
}

function createDeck() {
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const ranks = [
        { r: "A", v: 11 },
        { r: "2", v: 2 }, { r: "3", v: 3 }, { r: "4", v: 4 },
        { r: "5", v: 5 }, { r: "6", v: 6 }, { r: "7", v: 7 },
        { r: "8", v: 8 }, { r: "9", v: 9 }, { r: "10", v: 10 },
        { r: "J", v: 10 }, { r: "Q", v: 10 }, { r: "K", v: 10 }
    ];

    deck = [];

    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({ suit, rank: rank.r, value: rank.v });
        });
    });
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function getSuitSymbol(suit) {
    return {
        hearts: "♥",
        diamonds: "♦",
        clubs: "♣",
        spades: "♠"
    }[suit];
}

function renderCard(card, target) {
    const div = document.createElement("div");
    div.classList.add("card");
    div.classList.add(card.suit === "hearts" || card.suit === "diamonds" ? "red" : "black");

    div.innerHTML = `
        <div class="rank">${card.rank}</div>
        <div class="suit">${getSuitSymbol(card.suit)}</div>
    `;

    target.appendChild(div);

    setTimeout(() => div.classList.add("show"), 50);
}

function dealCard(hand, target) {
    const card = deck.pop();
    hand.push(card);
    renderCard(card, target);
}

function calculateScore(hand) {
    let total = hand.reduce((sum, c) => sum + c.value, 0);

    hand.filter(c => c.rank === "A").forEach(() => {
        if (total > 21) total -= 10;
    });

    return total;
}

function startGame() {
    if (bet === 0) {
        showEffect("draw", "Plaats inzet");
        return;
    }

    playerHand = [];
    dealerHand = [];
    playerHandEl.innerHTML = "";
    dealerHandEl.innerHTML = "";

    createDeck();
    shuffleDeck();

    dealCard(playerHand, playerHandEl);
    dealCard(dealerHand, dealerHandEl);
    dealCard(playerHand, playerHandEl);
    dealCard(dealerHand, dealerHandEl);

    showEffect("draw", "Nieuwe ronde");
}

function dealerTurn() {
    while (calculateScore(dealerHand) < 17) {
        dealCard(dealerHand, dealerHandEl);
    }
}

chips.forEach(chip => {
    chip.addEventListener("click", () => {
        const value = Number(chip.dataset.value);

        if (money >= value) {
            money -= value;
            bet += value;
            moneyDisplay.textContent = money;
            showEffect("draw", `Inzet: $${bet}`);
        } else {
            showEffect("lose", "Onvoldoende geld");
        }
    });
});

dealBtn.addEventListener("click", startGame);

hitBtn.addEventListener("click", () => {
    dealCard(playerHand, playerHandEl);

    const score = calculateScore(playerHand);

    if (score > 21) {
        showEffect("lose", "BUST!");
    }
});

standBtn.addEventListener("click", () => {
    dealerTurn();

    const p = calculateScore(playerHand);
    const d = calculateScore(dealerHand);

    if (d > 21 || p > d) {
        showEffect("win", "WIN!");
        money += bet * 2;   // inzet + winst
    } else if (p < d) {
        showEffect("lose", "LOSE!");
   
    } else {
        showEffect("draw", "DRAW");
        money += bet;       // inzet terug
    }

    bet = 0;
    moneyDisplay.textContent = money;
});

document.querySelector("#quitBtn").addEventListener("click", function () {
  window.location.href = "Home/index-start.html";
});



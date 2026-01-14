let Money = 1000;
let WinRate = [17, 18, 19, 20, 21];
let bet = 5;
let testNum =  10000;

// screen cast
console.log(Money);
showInHtmlMoney();

// main
function Placebet(){
    betInput()
}

function play() {
    if (Money < bet) { 
        alert("Niet genoeg saldo!");
        AddMoney();
        showInHtmlMoney();
        return;
    }
    SpinMachine()
    showInHtmlMoney();
    hideVerdict()
}

// additionalcode
function betInput(){

   let userInput = Number(document.getElementById("betBox").value);

    if(userInput >= 5){
        bet = userInput;
    }else{
        bet = 5;
    }
}

function SpinMachine(){
    Money -= bet;
    NumberGeneration()

    if(mageWin === 10000){
        ShowSlotMegaWin()

        console.log("Mega Jackpot!!!");
        document.querySelector("#I5").textContent = "Mega Jackpot!!";
        Money += bet*5000;
        console.log(Money);
    }else{
        if(bigWin === 2000){
            ShowSlotBigWin()

            console.log("jackpot!!!");
            document.querySelector("#I5").textContent = "Jackpot!!";
            Money += bet*1000;
            console.log(Money);

        }else{
            let isWinningNumber = false

            for (let i = 0; i < WinRate.length; i++) {
                if( WinNum === WinRate[i] ) 
                    isWinningNumber = true
            }

            if( isWinningNumber ){
                ShowSlotWin()

                console.log("win");
                document.querySelector("#I5").textContent = "Win!";
                Money += bet*2 + bet;
                console.log(Money);
            }else{
                ShowSlotLose()

                console.log("loser");
                document.querySelector("#I5").textContent = "loser!";
                console.log(Money);
            }
        }
    }
}

function NumberGeneration(){
    Num1 = Math.floor(Math.random() * 20) + 1;
    Num2 = Math.floor(Math.random() * 20) + 1;
    WinNum = Num1 + Num2;

    bigWin = Math.floor(Math.random() * 2000) + 1;
    mageWin = Math.floor(Math.random() * 10000) + 1;
}

function AddMoney(){
    if(Money <= 10){
    alert("laad saldo");
    Money += 1000;
    console.log(Money);
    }else{
        alert("je hebt nog: $" + Money);
    }
}

// cenection to html
document.querySelector("#I1").addEventListener("click", play);
document.querySelector("#I2").addEventListener("click", Placebet);
document.querySelector("#I3").addEventListener("click", AddMoney);

// show in html
function showInHtmlMoney(){
    document.querySelector("#I4").textContent = "Saldo: $" + Money;
}

function hideVerdict() {
  setTimeout(function Hide() {
    document.querySelector("#I5").textContent = "";
  }, 500);
}

// result icone html show

function SpinEffect(){

}

function ShowSlotMegaWin(){
document.querySelector("#s1").textContent = "🍀";
document.querySelector("#s2").textContent = "🍀";
document.querySelector("#s3").textContent = "🍀";
}

function ShowSlotBigWin(){
document.querySelector("#s1").textContent = "⭐";
document.querySelector("#s2").textContent = "⭐";
document.querySelector("#s3").textContent = "⭐";
}

function ShowSlotWin(){
document.querySelector("#s1").textContent = "🪙";
document.querySelector("#s2").textContent = "🪙";
document.querySelector("#s3").textContent = "🪙";
}

function ShowSlotLose(){
let RI = Math.floor(Math.random() * 10) + 1;

    if (RI === 1) {
        document.querySelector("#s1").textContent = "🪙";
        document.querySelector("#s2").textContent = "🪙";
        document.querySelector("#s3").textContent = "⭐";
    }
    else if (RI === 2) {
        document.querySelector("#s1").textContent = "⭐";
        document.querySelector("#s2").textContent = "⭐";
        document.querySelector("#s3").textContent = "🍀";
    }
    else if (RI === 3) {
        document.querySelector("#s1").textContent = "🍀";
        document.querySelector("#s2").textContent = "🍀";
        document.querySelector("#s3").textContent = "🪙";
    }
    else if (RI === 4) {
        document.querySelector("#s1").textContent = "🪙";
        document.querySelector("#s2").textContent = "⭐";
        document.querySelector("#s3").textContent = "🪙";
    }
    else if (RI === 5) {
        document.querySelector("#s1").textContent = "⭐";
        document.querySelector("#s2").textContent = "🍀";
        document.querySelector("#s3").textContent = "⭐";
    }
    else if (RI === 6) {
        document.querySelector("#s1").textContent = "🍀";
        document.querySelector("#s2").textContent = "🪙";
        document.querySelector("#s3").textContent = "🍀";
    }
    else if (RI === 7) {
        document.querySelector("#s1").textContent = "🪙";
        document.querySelector("#s2").textContent = "⭐";
        document.querySelector("#s3").textContent = "🍀";
    }
    else if (RI === 8) {
        document.querySelector("#s1").textContent = "⭐";
        document.querySelector("#s2").textContent = "🍀";
        document.querySelector("#s3").textContent = "🪙";
    }
    else {
        document.querySelector("#s1").textContent = "🍀";
        document.querySelector("#s2").textContent = "🪙";
        document.querySelector("#s3").textContent = "⭐";
    }   
}
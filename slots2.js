let Money = 1000;
let WinRate = [17, 18, 19, 20, 21];
let bet = 5;
let testNum =  10000;

// screen cast
console.log(Money);

// main
function Placebet(){
    betInput()
}

function play() {
    if (Money < bet) { 
        alert("Niet genoeg saldo!");
        AddMoney();
        return;
    }
    SpinMachine()
    showSpin()
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
        console.log("Mega Jackpot!!!");
        Money += bet*5000;
        console.log(Money);
    }else{
        if(bigWin === 2000){
            console.log("jackpot!!!");
            Money += bet*1000;
            console.log(Money);

        }else{
            let isWinningNumber = false

            for (let i = 0; i < WinRate.length; i++) {
                if( WinNum === WinRate[i] ) 
                    isWinningNumber = true
            }

            if( isWinningNumber ){
                console.log("win");
                Money += bet*2 + bet;
                console.log(Money);
            }else{
                console.log("loser");
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
    if(Money === 0){
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

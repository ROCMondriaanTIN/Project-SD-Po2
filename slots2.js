let Money = 1000;
let WinRate = [34, 95, 11, 77, 124];
let bet = 5;

// screen cast
console.log(Money);

// main
function Placebet(){
    betInput()
    takeBet()
    console.log(Money);
}

function play() {
    if (Money < bet) { alert("Niet genoeg saldo!"); return }
    SpinMachine()

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

    if(WinNum === 140){
        console.log("jackpot!!!");
        Money += bet*10000 + bet;
        console.log(Money)

    } else {
        let isWinningNumber = false

        for (let i = 0; i < WinRate.length; i++) {
            if( WinNum === WinRate[i] ) 
                isWinningNumber = true
        }

        if( isWinningNumber ){
            console.log("win");
            Money += bet*6;
            console.log(Money)
        }else{
            console.log("loser");
            console.log(Money);
        }
    }
}

function NumberGeneration(){
    Num1 = Math.floor(Math.random() * 35) + 1;
    Num2 = Math.floor(Math.random() * 35) + 1;
    Num3 = Math.floor(Math.random() * 35) + 1;
    Num4 = Math.floor(Math.random() * 35) + 1;
    WinNum = Num1 + Num2 + Num3 + Num4;
}
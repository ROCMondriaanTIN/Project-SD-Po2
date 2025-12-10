let Money = 1000;
let bet = 5;
let WinStreak = 0;
let WinRate = [13, 27, 31, 45, 50, 64, 79, 88, 96, 100, 105];
let testNum = 13;

document.querySelector("SpinButton").onClick = 

// steps
function play() {
    Placebet()
    SpinMachine()
    CheckResult()
}

// main code
function Placebet(){
    
}


function SpinMachine(){
    TakeBalance()
}


function CheckResult(){
    NumberGeneration()

    let isWinningNumber = false

    for (let i = 0; i < WinRate.length; i++) {
        if( testNum === WinRate[i] ) 
            isWinningNumber = true
    }

    if( isWinningNumber ){
        console.log("win");
        Money += bet*2;
        console.log(Money)
    }else{
        console.log("loser");
        console.log(Money);
    }
}


// additional code
function TakeBalance(){
    Money -= bet;
    console.log(Money);
} 

function NumberGeneration(){
Num1 = Math.floor(Math.random() * 35) + 1;
Num2 = Math.floor(Math.random() * 35) + 1;
Num3 = Math.floor(Math.random() * 35) + 1;
WinNum = Num1 + Num2 + Num3;
}

play();

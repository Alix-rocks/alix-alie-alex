
//***
// - En cas de transfer, exits va être l'accès le plus direct à l'autre ligne en fonction de la direction à prendre
//    - 1. Vérifier si les deux stations sont sur la même ligne (lineDep == lineArr)
//    - 2. Sinon, établir quel station de transfer est la plus appropriée... ?!
// - En cas de deux parcours différents (ex: Jarry - Snowdon: Orange only or transfer at Jean-Talon?)
//    - Vérifier les différences de temps avec Google Maps et déceler une règle mathématique pour voir quand ça vaudrait la peine d'offrir le choix
//    - Offrir le choix avec plus (transfer à Jean-Talon) ou moins de marche (Orange tout le long)
// - Ligne verte (s'il y a réellement les deux types de trains...) faire un code différent pour la ligne verte et afficher les deux trains!

//** get the checked animation through javascript instead (less id and css to write)

let lines = ["Orange", "Bleue", "Verte", "Jaune"];

let allStations, listDep, listArr, lineDep, statDep, lineArr, statArr, dirX, exitN, exits;

function choosingLine(whichL){
  let linesList = ``;
  lines.forEach((line) => {
    linesList += `
      <input type="radio" class="cossin" name="lines" id="${line + whichL}" value="${line}" onchange="lineChosen(event,'${whichL}')">
      <label for="${line + whichL}" class="metroChoices mCLines">${line}</label>`;
  });
  let title = "";
  whichL == "DL" ? title = "Départ" : whichL == "AL" ? title = "Arrivée" : title = "We're lost...";
  let addChoices = `
    <h3 class="metroDetA" style="margin: 1.6em 0 0.9em;">${title}</h3>
    <div class="metroToggleWhole">
      <div class="choosingEither choosingLine">
        <h3>Ligne:</h3>
        <div>
          <input id="metroToggler${whichL}" type="checkbox" class="cossin"/>
          <label for="metroToggler${whichL}" class="metroToggleLabel"><span class="typcn icon typcn-media-play" id="metroToggleIcon${whichL}"></span><span id="metroToggleLabelText${whichL}" class="metroToggleLabelText">Ligne</span></label>
          <div id="metroToggleList${whichL}" class="metroToggleList">${linesList}</div>
        </div>
      </div>
      <div class="choosingEither choosingStation" id="choosingStation${whichL}"></div>`;

  whichL == "DL" ? document.getElementById("metroPage").innerHTML = addChoices : whichL == "AL" ? document.getElementById("afterDLS").innerHTML = addChoices : document.getElementById("metroPage").innerHTML = "We're lost...";
};

function lineChosen(event, whichL){
  whichL == "DL" ? lineDep = event.currentTarget.value : whichL == "AL" ? lineArr = event.currentTarget.value : console.log("We're lost...");
  let chosenLine = event.currentTarget.value;
  document.getElementById("metroToggleLabelText" + whichL).innerText = chosenLine;
  document.getElementById("metroToggleLabelText" + whichL).classList.add("metroChosen");
  document.getElementById("metroToggler" + whichL).checked = false;
  let whichS = whichL + "S";
  choosingStation(chosenLine, whichL, whichS);
};

function choosingStation(line, whichL, whichS){
  let stationsList = ``;
  window.getLinesStations(line).then(allStations => {
    // console.log(allStations.stationsList);
    whichS == "DLS" ? listDep = allStations.stationsList : whichS == "ALS" ? listArr = allStations.stationsList : console.log("We're lost...");
    allStations.stationsList.forEach((station) => {
      stationsList += `<input type="radio" class="cossin" name="lines" id="${station + whichS}" value="${station}" onchange="stationChosen(event,'${whichS}')"><label for="${station + whichS}" class="metroChoices mCStations">${station}</label>`;
    });
  document.getElementById("choosingStation" + whichL).innerHTML = `
    <h3>Station:</h3>
    <div>
      <input id="metroToggler${whichS}" type="checkbox" class="cossin"/>
      <label for="metroToggler${whichS}" class="metroToggleLabel stationWide"><span class="typcn icon typcn-media-play" id="metroToggleIcon${whichS}"></span><span id="metroToggleLabelText${whichS}" class="metroToggleLabelText">Station</span></label>
      <div id="metroToggleList${whichS}" class="metroToggleList">${stationsList}</div>
    </div>
    <div id="after${whichS}" style="margin-bottom: 15vh;"></div>`;
  document.getElementById("metroToggler" + whichL).addEventListener("click", event => {
    if(event.target.checked){
      document.getElementById("choosingStation" + whichL).innerHTML = ``;
    }
  })
});
};

function stationChosen(event, whichS){
  console.log(listDep, listArr);
  whichS == "DLS" ? statDep = event.currentTarget.value : whichS == "ALS" ? statArr = event.currentTarget.value : console.log("We're lost...");
  document.getElementById("metroToggleLabelText" + whichS).innerText = event.currentTarget.value;
  document.getElementById("metroToggleLabelText" + whichS).classList.add("metroChosen");
  document.getElementById("metroToggler" + whichS).checked = false;
  document.getElementById("metroToggler" + whichS).addEventListener("click", event => {
    if(event.target.checked){
      document.getElementById("after" + whichS).innerHTML = ``;
    }
  })
  whichS == "DLS" ? choosingLine("AL") : whichS == "ALS" ? nextButton() : console.log("We're lost...");
};
// Si applicable, choix de sortie!
function nextButton(){
  document.getElementById("afterALS").innerHTML = `
  <button class="timeFormButtonSmall metroButton" onclick="window.checkExit()">Sortie(s)?</button>`;
}

function exitRadioChange(){
let exitInputs = document.querySelectorAll(".exitInput");
for(i = 0; i < exitInputs.length; i++){
  if(exitInputs[i].checked){
    document.getElementById("exit" + i + "Label").classList.add("exitRadioChecked");
    //register which exit has been chosen (exitN)
    exitN = i;
    console.log("exit= " + i);
  } else{
    document.getElementById("exit" + i + "Label").classList.remove("exitRadioChecked");}
};
document.getElementById("goBtn").classList.remove("displayNone");
//Remembers what exit you took for this statArr! but in localhost (no google account)
}
choosingLine("DL");

function calcTrajet(){
  window.getStatTrajet();
}

let tX = 0;
function depart(station, direction, color){
  console.log(station, direction, color);
  document.getElementById("metroPage").innerHTML = `
    <h3 class="sign stationSign">STATION<br/><span>${station}</span></h3>
    <h3 class="sign directionSign ${color}">DIRECTION <span>${direction}</span></h3>
    <div class="train" id="train${tX}"></div>
    <hr class="quai"/>`;
};

function trainLeft(w, d, t){
  let wagonsLeft = ``;
  for (let i = 1; i < w + 1; i++){
    let doorsLeft = ``;
    for (let a = 1; a < d + 1; a++){
      doorsLeft += `<div class="door" id="t${t}w${i}d${a}"></div>`;
    }
    wagonsLeft += `
      <div class="wagonTD${i == 1 ? ` headLeft head` : i == w ? ` headRight` : ``}" style="width: calc(90vw / ${w});">
        <span class="wagonNum">${i}</span>
        ${doorsLeft}
      </div>`  
  }
  document.getElementById("train"+t).innerHTML = wagonsLeft;
};
    
function trainRight(w, d, t){
  let wagonsRight = ``;
  for (let i = w; i > 0; i--){
    let doorsRight = ``;
    for (let a = d; a > 0; a--){
      doorsRight += `<div class="door" id="t${t}w${i}d${a}"></div>`;
    }
    wagonsRight += `
      <div class="wagonTD${i == w ? ` headLeft` : i == 1 ? ` headRight head` : ``}" style="width: calc(90vw / ${w});">
        <span class="wagonNum">${i}</span>
        ${doorsRight}
      </div>`  
  }
  document.getElementById("train"+t).innerHTML = wagonsRight;
};

function addTransfer(station, direction, color){
  tX += 1; 
  let addTransfer = document.createElement("div");
  addTransfer.innerHTML = `
    <div class="starsTransfer">
      <div class="allStars"></div>
      <h2 class="sTransfer">TRANSFER</h2>
      <div class="allStars"></div>
    </div>
    <h3 class="sign stationSign">STATION<br/><span id="station${tX}">${station}</span></h3>
    <h3 class="sign directionSign ${color}">DIRECTION <span id="direction${tX}">${direction}</span></h3>
    <div class="train" id="train${tX}"></div>
    <hr class="quai"/>`
  document.getElementById("metroPage").appendChild(addTransfer);
  tStars();
};

function tStars(){
  let tStarsNum = Math.round(((window.innerWidth - ((window.innerWidth/100) * 0.87 + 147.83))/2)/35);
  console.log(tStarsNum);
  document.querySelectorAll(".allStars").forEach(stars => {
    for (let i = 1; i < tStarsNum + 1; i++){
      let newStar = document.createElement("div");
      newStar.innerHTML = "&nbsp;&nbsp;¤&nbsp;&nbsp;";
      stars.appendChild(newStar);
    }
  })
};

function optionsGold(){
  // let exits = ["w4d1", "w4d2", "w4d3"];
  exits.map((exit) => {
    document.getElementById("t" + tX + exit).classList.add("opti");
  });
  //blue for elevator exits
};


// //Adding the color through the variable
// depart("JEAN&#8209TALON", "CÔTE&#8209VERTU", orangeColor);
// trainRight(9, 3, tX);
// optionsGold();
// //adding the color through the class
// addTransfer("CRÉMAZIE", "MONTMORENCY", "verte");
// trainLeft(6, 4, tX);
// optionsGold();
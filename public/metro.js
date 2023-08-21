
//***
// - Comment sauver dans le localstorage que pour telle station, on choisi telle sortie...
// - Arranger la ligne qui dit à quelle station descendre
// - Afficher (sous le quai?) différentes options ou légende des portes (ascenceur, plus rapide, moins rapide, autre sortie (ça ça pourrait juste faire un "back" et ramener à l'étape où tu choisi la sortie... si c'est pas trop de jus que de recréer le train au complet), etc)
// - En cas de transfer, exits va être l'accès le plus direct à l'autre ligne en fonction de la direction à prendre
//    - 1. Vérifier si les deux stations sont sur la même ligne (lineDep == lineArr)
//    - 2. Sinon, établir quel station de transfer est la plus appropriée... ?!
// - En cas de deux parcours différents (ex: Jarry - Snowdon: Orange only or transfer at Jean-Talon?)
//    - Vérifier les différences de temps avec Google Maps et déceler une règle mathématique pour voir quand ça vaudrait la peine d'offrir le choix
//    - Offrir le choix avec plus (transfer à Jean-Talon) ou moins de marche (Orange tout le long)
// - Ligne verte (s'il y a réellement les deux types de trains...) faire un code différent pour la ligne verte et afficher les deux trains!

//** get the checked animation through javascript instead (less id and css to write)

let lines = ["Orange", "Bleue", "Verte", "Jaune"];

let allStations, listDep, listArr, lineDep, statDepName, statDep, lineArr, statArrName, statArr, dirX, exitN, exits;

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

  whichL == "DL" ? document.getElementById("metroForm").innerHTML = addChoices : whichL == "AL" ? document.getElementById("afterDLS").innerHTML = addChoices : document.getElementById("metroForm").innerHTML = "We're lost...";
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
  window.getLinesStations(line).then(allStations => {
    // console.log(allStations.stationsList);
    let list = [];
    // et si, on utilisait le forEach pour enlever les * de listDep (pour pouvoir s'en servir pour le trajet?), est-ce que la deuxième fois qu'on fait apparaître la liste, on perd les ascenseurs? est-ce que forEach peut créer un nouvel array? Sinon, utiliser map!
    let stationsList = allStations.stationsList.map((station) => {
      let classe;
      if(station.startsWith("*", 0)){
        console.log("asc!!");
        station = station.slice(1, station.length);
        list.push(station);
        classe = "stationAsc";
      } else{
        classe = "displayNone";
        list.push(station);
      }
      return `<input type="radio" class="cossin" name="lines" id="${station + whichS}" value="${station}" onchange="stationChosen(event,'${whichS}')"><label for="${station + whichS}" class="metroChoices mCStations">${station}<span class="material-symbols-outlined elevatorIcon ${classe}">elevator</span></label>`;
    }).join("");
    whichS == "DLS" ? listDep = list : whichS == "ALS" ? listArr = list : console.log("We're lost...");
    console.log(list);
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

// function choosingStation(line, whichL, whichS){
//   let stationsList = ``;
//   window.getLinesStations(line).then(allStations => {
//     // console.log(allStations.stationsList);
//     whichS == "DLS" ? listDep = allStations.stationsList : whichS == "ALS" ? listArr = allStations.stationsList : console.log("We're lost...");
//     // et si, on utilisait le forEach pour enlever les * de listDep (pour pouvoir s'en servir pour le trajet?), est-ce que la deuxième fois qu'on fait apparaître la liste, on perd les ascenseurs? est-ce que forEach peut créer un nouvel array? Sinon, utiliser map!
//     allStations.stationsList.forEach((station) => {
//       let stationName, classe;
//       if(station.startsWith("*", 0)){
//         console.log("asc!!");
//         stationName = station.slice(1, station.length);
//         classe = "stationAsc";
//       } else{
//         stationName = station;
//         classe = "displayNone";
//       }
//       stationsList += `<input type="radio" class="cossin" name="lines" id="${stationName + whichS}" value="${stationName}" onchange="stationChosen(event,'${whichS}')"><label for="${stationName + whichS}" class="metroChoices mCStations">${stationName}<span class="material-symbols-outlined elevatorIcon ${classe}">elevator</span></label>`;
//     });
//     console.log(allStations.stationsList);
//   document.getElementById("choosingStation" + whichL).innerHTML = `
//     <h3>Station:</h3>
//     <div>
//       <input id="metroToggler${whichS}" type="checkbox" class="cossin"/>
//       <label for="metroToggler${whichS}" class="metroToggleLabel stationWide"><span class="typcn icon typcn-media-play" id="metroToggleIcon${whichS}"></span><span id="metroToggleLabelText${whichS}" class="metroToggleLabelText">Station</span></label>
//       <div id="metroToggleList${whichS}" class="metroToggleList">${stationsList}</div>
//     </div>
//     <div id="after${whichS}" style="margin-bottom: 15vh;"></div>`;
//   document.getElementById("metroToggler" + whichL).addEventListener("click", event => {
//     if(event.target.checked){
//       document.getElementById("choosingStation" + whichL).innerHTML = ``;
//     }
//   })
// });
// };

function stationChosen(event, whichS){
  console.log(listDep, listArr);
  whichS == "DLS" ? statDepName = event.currentTarget.value : whichS == "ALS" ? statArrName = event.currentTarget.value : console.log("We're lost...");
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
function depart(station, direction, color, descente){
  console.log(station, direction, color);
  document.getElementById("metroForm").classList.add("displayNone");
  document.getElementById("metroWhole").classList.remove("displayNone");
  document.getElementById("metroResult").innerHTML = `
    <button class="metroBack" onclick="metroBack()" title="Back"><span class="typcn typcn-chevron-right chevronBack"></span></button>
    <h3 class="sign stationSign">STATION<br/><span>${station}</span></h3>
    <h3 class="sign directionSign ${color}">DIRECTION <span>${direction}</span></h3>
    <div class="train" id="train${tX}"></div>
    <hr class="quai"/>
    <div class="descends">
      <div class="descendsLeft"></div>
      <h3 class="sign stationSign">DESCENDS À <span>${descente}</span></h3>
      <div class="descendsRight"></div>
    </div>`;
    descends();
};

function metroBack(){
  document.getElementById("metroForm").classList.remove("displayNone");
  document.getElementById("metroWhole").classList.add("displayNone");
}

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

function descends(){
  let flecheNum = Math.round(((window.innerWidth - ((window.innerWidth/100) * 0.87 + 147.83))/2)/35);
  console.log(flecheNum);
  for (let i = 1; i < flecheNum + 1; i++){
    let newflecheLeft = document.createElement("div");
    newflecheLeft.innerHTML = `<span class="typcn icon typcn-chevron-right" style="padding: 0 10%;"></span>`;
    document.querySelector(".descendsLeft").appendChild(newflecheLeft);
  }
  for (let i = 1; i < flecheNum + 1; i++){
    let newflecheRight = document.createElement("div");
    newflecheRight.innerHTML = `<span class="typcn icon typcn-chevron-left" style="padding: 0 10%;"></span>`;
    document.querySelector(".descendsRight").appendChild(newflecheRight);
  }
};

function optionsGold(){
  // let exits = ["w4d1", "w4d2", "w4d3"];
  let door, classe;
  exits.map((exit) => {
    if(exit.endsWith("A")){
      door = exit.slice(0, -1);
      classe = "asc";
      let ascLogo = document.createElement("span");
      ascLogo.classList.add("material-symbols-outlined", "elevatorIcon", "ascLogo");
      ascLogo.innerText = "elevator";
      document.getElementById("t" + tX + door).appendChild(ascLogo);
    } else if(exit.endsWith("V")){
      door = exit.slice(0, -1);
      classe = "vite";
      let viteLogo = document.createElement("span");
      viteLogo.classList.add("viteLogo");
      viteLogo.innerText = "V";
      document.getElementById("t" + tX + door).appendChild(viteLogo);
    } else if(exit.endsWith("B")){
      door = exit.slice(0, -1);
      classe = "both";
      let ascLogo = document.createElement("span");
      ascLogo.classList.add("material-symbols-outlined", "elevatorIcon", "ascLogo");
      ascLogo.innerText = "elevator";
      document.getElementById("t" + tX + door).appendChild(ascLogo);
      let viteLogo = document.createElement("span");
      viteLogo.classList.add("viteLogo");
      viteLogo.innerText = "V";
      document.getElementById("t" + tX + door).appendChild(viteLogo);
    } else{
      door = exit;
      classe = "opti";
    }
    document.getElementById("t" + tX + door).classList.add(classe);
    
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
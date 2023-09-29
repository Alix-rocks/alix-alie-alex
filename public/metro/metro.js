
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
import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
//import { getDocs, getDoc, query, doc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { db } from "../myFirebase.js";

let lines = ["Orange", "Bleue", "Verte", "Jaune"];

let allStations, listDep, listArr, lineDep, statDepName, statDep, lineArr, statArrName, statArr, dirX, exitN, exits;

function choosingLine(whichL){
  let linesList = ``;
  lines.forEach((line) => {
    linesList += `
      <input type="radio" class="cossin" name="lines" id="${line + whichL}" value="${line}" data-dl="${whichL}">
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
  document.querySelectorAll("[name='lines']").forEach(line => {
    line.addEventListener("change", lineChosen);
  });
};

function lineChosen(event){
  let whichL = event.currentTarget.dataset.dl;
  whichL == "DL" ? lineDep = event.currentTarget.value : whichL == "AL" ? lineArr = event.currentTarget.value : console.log("We're lost...");
  let chosenLine = event.currentTarget.value;
  document.getElementById("metroToggleLabelText" + whichL).innerText = chosenLine;
  document.getElementById("metroToggleLabelText" + whichL).classList.add("metroChosen");
  document.getElementById("metroToggler" + whichL).checked = false;
  let whichS = whichL + "S";
  choosingStation(chosenLine, whichL, whichS);
};

function choosingStation(line, whichL, whichS){
  getLinesStations(line).then(allStations => {
    let list = [];
    // et si, on utilisait le forEach pour enlever les * de listDep (pour pouvoir s'en servir pour le trajet?), est-ce que la deuxième fois qu'on fait apparaître la liste, on perd les ascenseurs? est-ce que forEach peut créer un nouvel array? Sinon, utiliser map!
    let stationsList = allStations.stationsList.map((station) => {
      let classe;
      if(station.startsWith("*", 0)){
        station = station.slice(1, station.length);
        list.push(station);
        classe = "stationAsc";
      } else{
        classe = "displayNone";
        list.push(station);
      }
      return `<input type="radio" class="cossin" name="stations" id="${station + whichS}" value="${station}" data-dls="${whichS}"><label for="${station + whichS}" class="metroChoices mCStations">${station}<span class="material-symbols-outlined elevatorIcon ${classe}">elevator</span></label>`;
    }).join("");
    //effet de bord (aurait du être un if/else)
    whichS == "DLS" ? listDep = list : whichS == "ALS" ? listArr = list : console.log("We're lost...");
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
    document.querySelectorAll("[name='stations']").forEach(station => {
      station.addEventListener("change", stationChosen);
    });
  });
};



function stationChosen(event){
  let whichS = event.currentTarget.dataset.dls;
  console.log("oui!!");
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
  <button id="exitButtonSorties" class="timeFormButtonSmall metroButton">Sortie(s)?</button>`;
  document.getElementById("exitButtonSorties").addEventListener("click", checkExit);
}

function exitRadioChange(event){
  exitN = event.currentTarget.dataset.idx;
  document.getElementById("goBtn").classList.remove("displayNone");
//Remembers what exit you took for this statArr! but in localstorage (no google account)
}
// choosingLine("DL");
choosingLine("DL");


let tX = 0;
function depart(station, direction, color, descente){
  console.log(station, direction, color);
  document.getElementById("metroForm").classList.add("displayNone");
  document.getElementById("metroWhole").classList.remove("displayNone");
  document.getElementById("metroResult").innerHTML = `
    <button class="metroBack" title="Back"><span class="typcn typcn-chevron-right chevronBack"></span></button>
    <h3 class="sign stationSign">STATION<br/><span>${station}</span></h3>
    <h3 class="sign directionSign ${color}">DIRECTION <span>${direction}</span></h3>
      <div class="allTrain">
        <div class="train" id="train${tX}"></div>
      </div>
    <hr class="quai"/>
    <div class="descends">
      <div class="descendsLeft"></div>
      <h3 class="sign stationSign">DESCENDS À <span>${descente}</span></h3>
      <div class="descendsRight"></div>
    </div>`;
    descends();
    document.querySelector(".metroBack").addEventListener("click", metroBack);
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
  document.querySelector(".train").style.animation = "wroom-left 2s";
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
  document.querySelector(".train").style.animation = "wroom-right 2s";
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
  document.querySelector(".train").addEventListener("animationend", () => {
    document.querySelectorAll(".door>span").forEach(sign => {
      sign.style.opacity = "1";
    });
  });

  
};


//**************************/

async function getLinesStations(chosenLine){
  if(localStorage.getItem("allStations-" + chosenLine)){
    allStations = JSON.parse(localStorage.getItem("allStations-" + chosenLine));
  } else{
    const getLinesStations = await getDoc(doc(db, "metro", chosenLine));
    allStations = getLinesStations.data();
    localStorage.setItem("allStations-" + chosenLine, JSON.stringify(allStations));
    console.log("digged");
  }
  return allStations;
}

async function checkExit(){
  if(localStorage.getItem("statArr-" + statArrName)){
    statArr = JSON.parse(localStorage.getItem("statArr-" + statArrName));
  } else{
    const getStatArr = await getDoc(doc(db, "metro", lineArr, "station", statArrName));
    statArr = getStatArr.data();
    localStorage.setItem("statArr-" + statArrName, JSON.stringify(statArr));
    console.log("digged");
  }
  if(statArr.exit.length == 1 && statArr.exit.name != undefined){
    document.getElementById("afterALS").innerHTML = `<p style="margin: 1em 0 .6em;">Il n'y a qu'une seule sortie à cette station-là:</p>
    <div>
      <input type="radio" name="exitInput" class="cossin exitInput" id="exit${statArr.exit.index}" data-idx="${statArr.exit.index}"/>
      <label for="exit${statArr.exit.index}" class="exitLabel" id="exit${statArr.exit.index}Label">
        <span class="exitRadio">
          <span></span>
        </span>
        <div>
          <h3>${statArr.exit.name}</h3>
          <p>${statArr.exit.options}</p>
        </div>
        ${exit.asc ? `<span class="material-symbols-outlined elevatorIcon exitAsc">
        elevator
        </span>` : ``}  
      </label>
    </div>
    <button id="goBtn" class="timeFormButton metroButton">Let's GO!</button>`;
  } else if(statArr.exit.length > 1){
    let exitList = statArr.exit.map((exit, idx) => {
      return `<input type="radio" name="exitInput" class="cossin exitInput" id="exit${idx}" data-idx="${idx}"/>
      <label for="exit${idx}" class="exitLabel" id="exit${idx}Label">
        <span class="exitRadio">
          <span></span>
        </span>
        <div>
          <h3>${exit.name}</h3>
          <p>${exit.options}</p>
        </div>
        ${exit.asc ? `<span class="material-symbols-outlined elevatorIcon exitAsc">
        elevator
        </span>` : ``}        
      </label>`;
    });
    document.getElementById("afterALS").innerHTML = `<p style="margin: 1em 0 .6em;">Choisi la sortie que tu veux:</p>
    <div>${exitList.join("")}</div>
    <button id="goBtn" class="timeFormButton metroButton displayNone">Let's GO!</button>`;
  } else if(statArr.exit.length == 1 && statArr.exit.name == undefined){
    document.getElementById("afterALS").innerHTML = `<h6>Oups... y'a comme un problème, là...<br/>Soit la station a explosé et on peut juste pu en sortir,<br/>soit Alex a juste pas encore eu le temps de répertorier les sorties de cette station-là...<br/>À moins que...<br/>Ouin, vu qu'on est à Montréal, la station est probablement juste fermée pour cause de construction et/ou festival!<br/>Fac on va dire que c'est ça, ok?!</h6>`;
  };
  document.querySelectorAll("[name='exitInput']").forEach(exitInput => {
    exitInput.addEventListener("change", exitRadioChange);
  });
  document.getElementById("goBtn").addEventListener("click", getStatTrajet);
}

//listDep, lineDep, statDep, listArr, lineArr, statArr, exitN
async function getStatTrajet(){
  // console.log(lineDep, statDepName, lineArr, statArrName);
  if(localStorage.getItem("statDep-" + statDepName)){
    statDep = JSON.parse(localStorage.getItem("statDep-" + statDepName));
  } else{
    const getStatDep = await getDoc(doc(db, "metro", lineDep, "station", statDepName));
    statDep = getStatDep.data();
    localStorage.setItem("statDep-" + statDepName, JSON.stringify(statDep));
    console.log("digged");
  }
  if(lineDep == lineArr){
    let direction = statArr.ordre - statDep.ordre > 0 ? statDep.dirA : statDep.dirB;
    // depart(statDep.name, direction.name, statDep.line, statArr.name);
    depart(statDepName, direction.name, lineDep, statArrName);
    // statDep.line devrait être lineDep (comme ça, si il y a plus d'une line, t'es safe!)
    exits = statArr.exit[exitN].doors;
    let w = statDep.wagon;
    let d = statDep.door;
    direction.head == "right" ? trainRight(w, d, tX) : direction.head == "left" ? trainLeft(w, d, tX) : console.log("We're lost...");
    optionsGold();
    // C'EST CORRECT, LISTDEP ET LISTARR SONT DES ARRAY AVEC JUSTE LES NOMS SANS *!! {Tu peux peut-être pas utiliser listDep (stationsList) parce qu'il y a des * devant les noms des stations avec ascenseur, alors tu pourras pas retrouver les index à partir des noms de station... statDep.line.includes(lineArr)}
  } else if(listDep.includes(statArrName) || listArr.includes(statDepName)){ //CELUI-LÀ DEVRAIT ALLER AU DÉBUT AVANT LE lineDep == lineArr
    // ça veut dire qu'une ou les deux stations sont des stations de transfer
    if(listDep.includes(statArrName)){
      //distance entre statDep et statArr sur lineDep => Choix 1
      let distA = distance(listDep, statDepName, statArrName);
      console.log("Choix 1: " + distA + "stations, sans transfer, sur la ligne " + lineDep);
      // Autre choix: faire un transfer!!
    }
    if(listArr.includes(statDepName)){
      //distance entre statDep et statArr sur lineArr => Choix 2
      let distB = distance(listArr, statDepName, statArrName);
      console.log("Choix 2: " + distB + "stations, sans transfer, sur la ligne " + lineArr);
      // Autre choix: faire un transfer!!
    }
  } else{
    //On a déjà établi qu'aucune des stations (dep et arr) n'est une des stations de transfert
    if([lineDep, lineArr].includes("Orange")){
      if([lineDep, lineArr].includes("Bleue")){
        let transA = "JEAN-TALON";
        let distA = distance(listDep, statDepName, transA) + distance(listArr, statArrName, transA);
        let transB = "SNOWDON";
        let distB = distance(listDep, statDepName, transB) + distance(listArr, statArrName, transB);
      } else if([lineDep, lineArr].includes("Verte")){
        let transA = "BERRI-UQAM";
        let transB = "LIONEL-GROULX";
      } else{
        // Jaune
        let trans = "BERRI-UQAM";
      }
    } else if([lineDep, lineArr].includes("Bleue")){
      if([lineDep, lineArr].includes("Verte")){
        let transA = "JEAN-TALON";
        let distA = distance(listDep, statDepName, transA) + distance(listArr, statArrName, transA);
        let transB = "SNOWDON";
        let distB = distance(listDep, statDepName, transB) + distance(listArr, statArrName, transB);
        let transC = "BERRI-UQAM";
        let distC = distance(listDep, statDepName, transC) + distance(listArr, statArrName, transC);
        let transD = "LIONEL-GROULX";
        let distD = distance(listDep, statDepName, transD) + distance(listArr, statArrName, transD);
      } else{
        // Jaune
        let transA = "JEAN-TALON";
        let transB = "SNOWDON";
        let trans = "BERRI-UQAM";
      }
    } else if([lineDep, lineArr].includes("Verte")){
      // Jaune
      let trans = "BERRI-UQAM";
    }
  } 
}

function distance(list, dep, arr){
  let depIdx = list.indexOf(dep);
  let arrIdx = list.indexOf(arr);
  let dist = Math.abs(depIdx - arrIdx);
  return dist;
}
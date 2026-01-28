import { rtdb, getDatabase, ref, set, onValue } from "/myFirebase.js";

let allSlides = [];
//let allMiniSlides = null;
const emojiRegex = /\p{Emoji}/gu; // 'g' for global, 'u' for Unicode mode
const diapoMain = document.querySelector("#diapoMain");
let screenHeight;
let screenWidth;
(() => {
  screenHeight = window.innerHeight - 16;
  screenWidth = window.innerWidth - 16;
})();

function updateViewportVars() {
  screenHeight = window.innerHeight - 16;
  screenWidth = window.innerWidth - 16;
  document.documentElement.style.setProperty('--vh', `${screenHeight}px`);
  document.documentElement.style.setProperty('--vw', `${screenWidth}px`);
}

window.addEventListener('resize', updateViewportVars);
window.addEventListener('orientationchange', updateViewportVars);


const timeNow = document.getElementById("timeNow");
setInterval(() => {
  timeNow.innerText = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}, 1000); // 1000 = 1 second

const timeDurationShow = document.querySelector("#timeDurationShow");  //remplissage
const timeDurationShowZone = document.querySelector("#timeDurationShowZone");  //encadré pour le remplissage
const timeDurationShowZoneWidth = getComputedStyle(timeDurationShowZone).width;  //largeur de l'encadré
const totalWidthNum = parseFloat(getComputedStyle(timeDurationShowZone).width);  //largeur de l'encadré; chiffre seulement (sans l'unité "px")
//document.getElementById("timeDurationShow").innerText = timeDurationShowZoneWidth;

const intervalInput = document.querySelector("#intervalInput");
let interval = intervalInput.value * 60 * 1000; // la value est en minute; on le met en secondes

const timeDurationStartInput = document.querySelector("#timeDurationStartInput");  // input pour l'heure de début
const timeDurationEndInput = document.querySelector("#timeDurationEndInput");  // input pour l'heure de fin
let totalDuration = 0; 




// let startTime = timeDurationStartInput.value;  // or localStorage
// let endTime = timeDurationEndInput.value;  // or localStorage

// let totalDuration = durationCalculation(startTime, endTime);
// let totalWidthNum = parseFloat(timeDurationShowZoneWidth);  // or parseFloat(getComputedStyle(timeDurationShowZone).width)
// let pxPerSec = totalWidthNum * 1000 / totalDuration;
// let pastDuration = durationCalculation(startTime, new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
// let pastWidth =  






if(localStorage.getItem("WCTimeStart") && localStorage.getItem("WCTimeStart") !== "" // Si on a une heure de début
&& localStorage.getItem("WCTimeEnd") && localStorage.getItem("WCTimeEnd") !== ""   // Et une heure de fin
&& localStorage.getItem("WCTimeEnd") >= new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })){  //Et que l'heure de fin est plus grande que maintenant
  timeDurationStartInput.value = localStorage.getItem("WCTimeStart");   //on met ces valeurs dans les inputs de temps
  timeDurationEndInput.value = localStorage.getItem("WCTimeEnd");

  totalDuration = durationCalculation(timeDurationStartInput.value, timeDurationEndInput.value); 
  let pastDuration = durationCalculation(timeDurationStartInput.value, new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  let pastWidth = totalWidthNum * pastDuration / totalDuration;

  let restDuration = totalDuration - pastDuration;

  updateRigs();
  timeDurationShow.animate([{width: pastWidth + "px"},{width: timeDurationShowZoneWidth}], restDuration);
} else if(timeDurationStartInput.value !== null && timeDurationEndInput.value !== null){
  totalDuration = durationCalculation(timeDurationStartInput.value, timeDurationEndInput.value);
  localStorage.clear();
};

timeDurationEndInput.addEventListener("input", () => {

  if(timeDurationEndInput.value !== null && timeDurationStartInput.value !== null){
    totalDuration = durationCalculation(timeDurationStartInput.value, timeDurationEndInput.value);

    updateRigs();
  
    timeDurationShow.animate([{width: "0"},{width: timeDurationShowZoneWidth}], totalDuration);

    localStorage.setItem("WCTimeStart", timeDurationStartInput.value);
    localStorage.setItem("WCTimeEnd", timeDurationEndInput.value);
  };
});

intervalInput.addEventListener("change", () => {
  interval = intervalInput.value !== null ? intervalInput.value * 60 * 1000 : 300000; // la value est en minute => on le met en secondes ; si la value est null, on met 5 min (300 000 secondes)
  updateRigs();
});

function updateRigs(){
  //on enlève les rigs déjà là
  removeRigs();
  console.log(totalDuration);
  console.log(interval);
  const nbrOfSection = (totalDuration / interval);
  const nbrOfRig = nbrOfSection - 1;
  const rigWidth = 2;
  const sectionWidth = (totalWidthNum - (nbrOfRig * rigWidth)) / nbrOfSection;
  for(let r = 0; r < nbrOfRig; r++){
    let left = (sectionWidth * (r + 1)) + (r * rigWidth);
    timeDurationShowZone.insertAdjacentHTML("beforeend", `<span class="rig" style="left: ${left}px"></span>`);
  };
};

function removeRigs(){
  let allRigs = timeDurationShowZone.querySelectorAll(".rig");
  allRigs.forEach(rig => {
    rig.remove();
  });
};
  

function resetLocalTime(){
  timeDurationStartInput.value = "";
  timeDurationEndInput.value = "";
  localStorage.clear();
  timeDurationShow.style.width = "0";
  removeRigs();
};
window.resetLocalTime = resetLocalTime;

function durationCalculation(startV, endV){
  let start = startV.split(":");
  let end = endV.split(":");
  let startDate = new Date(0, 0, 0, start[0], start[1], 0);
  let endDate = new Date(0, 0, 0, end[0], end[1], 0);
  return endDate.getTime() - startDate.getTime();
};

function handleFeedback(need, info){
  switch(need){
    case "cs":
      console.log("currentSlideSetting " + info);
      currentSlideSetting(info);
      break;
    case "wddc":
      wordDropdownCreation(info);
      break;
    case "sbf":
      stepButtonFixing(info);
      break;
    case "all":
      allSlidesCreation(info);
      break;
    case "display":
      console.log("DISPLAY");
      console.log(info);
      stepButtonFixing(info.steps); //object
      notesFilling(info.notes);
      diapoMainFilling(info.html);
      currentSlideSetting(info.current); //object

      // if(info?.words?.length > 0) {
      //   wordDropdownCreation(info.words); //array
      // };  
      // if(info?.phrases?.length > 0) {
      //   toUnveilDropdownCreation(info.phrases); //array of objects
      // };    
      break;
    case "refresh":
      console.log("REFRESH");
      console.log(info);
      allSlidesCreation(info.slides); //array of objects
      stepButtonFixing(info.steps); //object
      notesFilling(info.notes);
      diapoMainFilling(info.html);
      currentSlideSetting(info.current); //object

      // if(info?.words?.length > 0) {
      //   wordDropdownCreation(info.words); //array
      // };
      // if(info?.phrases?.length > 0) {
      //   toUnveilDropdownCreation(info.phrases); //array of objects
      // };
      break;
    default:
      console.log(need, info);
      break;
  };
};

// let currentSlideInfo = {
//     num: sectionShowed.dataset.slide,
//     titre: sectionShowed.dataset.titre,
//     type: sectionShowed.dataset.type
//   };

const notes = document.querySelector("#notes");

function notesFilling(html){
  notes.innerHTML = "";
  if(notes !== ""){
    notes.innerHTML = html;
  };
};

function diapoMainFilling(html){
  console.log(html);
  diapoMain.innerHTML = "";
  diapoMain.innerHTML = html;
  const cloudBoardTotal = diapoMain.querySelector("#cloudBoardTotal");
  if(cloudBoardTotal){
    cloudBoardTotal.remove();
  };
};


window.makeThisAppear = function (el) {
  const uuid = el.dataset.uuid;

  let infoToSend = {
    action: "makeThisAppear",
    data: uuid
  };
  sendActionData(infoToSend);
};


function currentSlideSetting(info){
  // diapoMain.innerHTML = "";
  
  // diapoTitle.innerHTML = `<span class="diapoTitleTitre">${info.titre}</span><span class="diapoTitleType">${info.type}</span>`;

  if(info.words) {
    wordDropdownCreation(); //array
  };
  if(info.phrases) {
    toUnveilDropdownCreation(); //array of objects
  };

  document.querySelector(`#mini${info.num}`).checked = true;
  centerActiveMiniSlide();

  let nombreSlides = allSlides.length;
  let numeroSlide = Number(info.num);
  document.querySelector("#pagePrev").disabled = numeroSlide == 1 ? true : false;
  document.querySelector("#pageNext").disabled = numeroSlide == nombreSlides ? true : false;

};

function allSlidesCreation(info){
  allSlides = info;
  let allDivs = allSlides.map(slide => {
    return `<input type="radio" name="miniSlides" id="mini${slide.num}" value="${slide.num}" class="displayNone" /><label for="mini${slide.num}" class="miniSlide"><span class="miniTitre">${slide.titre}</span><span class="miniType">${slide.type}</span></label>`;
  }).join("");
  document.querySelector("#allPages").innerHTML = allDivs;
  //allMiniSlides = document.querySelectorAll(".miniSlide");
  document.querySelectorAll('input[type="radio"][name="miniSlides"]').forEach(radio => {
    radio.addEventListener("change", event => {
      if (event.target.checked) {
        //center to that slide
        centerActiveMiniSlide();
         //send control to get that slide
        let slideNum = radio.value; 
        diapoMain.innerHTML = "";
        let infoToSend = {
          action: "thisSlide",
          data: slideNum
        };
        sendActionData(infoToSend);
      };
    });
  });
};

function centerActiveMiniSlide() {
  const checkedRadio = document.querySelector(
    '#allPages input[type="radio"]:checked'
  );

  if (!checkedRadio) return;
  console.log(checkedRadio);
  

  const label = checkedRadio.nextElementSibling;

  if (!label) return;
  console.log(label);
  

  label.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest'
  });
}


// /* Optional: keep centered on resize */
// window.addEventListener('resize', centerActiveMiniSlide);

// /* Optional: initial centering on load */
// window.addEventListener('load', centerActiveMiniSlide);


function slideNext(){
  diapoMain.innerHTML = "";
  sendAction("slideNext");
};
window.slideNext = slideNext;

function slidePrev(){
  diapoMain.innerHTML = "";
  sendAction("slidePrev");
};
window.slidePrev = slidePrev;

function stepNext(){
  sendAction("stepNext");
};
window.stepNext = stepNext;

function stepPrev(){
  sendAction("stepPrev");
};
window.stepPrev = stepPrev;

function stepButtonFixing(info){
  let nextState = info.next;
  let prevState = info.prev;
  document.querySelector("#diapoActionsNext").disabled = nextState ? false : true;
  document.querySelector("#diapoActionsPrev").disabled = prevState ? false : true;
};

function wordDropdownCreation(){
  // let wordDropdownOptions = words.map(group => {
  //   let title = group[0];
  //   let options = group.map((word, idx) => {
  //     if(idx !== 0){
  //       return `<option value="${word.match(emojiRegex) ? word.match(emojiRegex) : word.replaceAll(`"`, `'`)}">${word}</option>`;
  //     };
  //   }).join("");
  //   return `<optgroup label="${title}">
  //     ${options}
  //   </optgroup>`;
  // }).join("");

  // diapoMain.innerHTML = `<select class="selectTheirChoice" id="wordDropdown">
  //     <option value="">--Options--</option>
  //     ${wordDropdownOptions}
  //   </select>
  //   <input class="addTheirChoice" id="wordInput" type="text"></input>`;

  // diapoMain.querySelector("select").innerHTML = `
  //     <option value="">--Options--</option>
  //     ${wordDropdownOptions}`;
    
  let action = "rain";
  activateSelector(action);

  activateInputAdder(action);
  console.log("words == true; everything's activated");
};

function toUnveilDropdownCreation(){
  // let phrasesDropdownOptions = phrases.map((sentence) => {
  //   return `<option value="${sentence.code}">${sentence.phrase}</option>`;
  // }).join("");

  // diapoMain.innerHTML = `<select class="selectTheirChoice" id="phraseDropdown"">
  //     <option value="">--Options--</option>
  //     ${phrasesDropdownOptions}
  //   </select>
  //   <input class="addTheirChoice" id="phraseInput" type="text"></input>`;
    
    let action = "unveilIt";
    activateSelector(action);

    let action2 = "addWisdom";
    activateInputAdder(action2)
 
};

function activateSelector(action){
  let selector = diapoMain.querySelector("select.selectTheirChoice");
  selector.addEventListener("change",  () => {
    let value = selector.value.replaceAll(`'`, `"`);
    console.log(value);
    let infoToSend = {
      action: action, //rain or unveilIt or addWisdom
      data: value
    };
    sendActionData(infoToSend);
    removeOption(value);
    selector.value = "";
  });

};
function activateInputAdder(action){
  let adder = diapoMain.querySelector("input.addTheirChoice");
  adder.addEventListener("change", () => {
    let infoToSend = {
      action: action,
      data: adder.value
    };
    sendActionData(infoToSend);
    adder.value = "";
  });
};
function sendActionData({action, data}){
  set(ref(rtdb, "workshop/control"), {
    action: action,
    data: data,
    timestamp: Date.now()
  });
};
function removeOption(option){
  diapoMain.querySelector(`option[value="${option.replaceAll(`"`, `'`)}"]`).remove();
};

function sendAction(action){
  set(ref(rtdb, "workshop/control"), {
    action: action,
    timestamp: Date.now()
  });
};

// document.querySelector("#fullScreenCB").addEventListener("change", ev => {
//   if(ev.target.checked){
//     fullscreen()
//   } else{
//     exitFullscreen()
//   };
// });

// function fullscreen(){
//   sendAction("fs");
// };

// function exitFullscreen() {
//   sendAction("efs");
// };

set(ref(rtdb, "workshop/control"), null);
set(ref(rtdb, "workshop/feedback"), null);

onValue(ref(rtdb, "workshop/feedback"), (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  handleFeedback(data.need, data.info);

  set(ref(rtdb, "workshop/feedback"), null);
});

function askRefresh(){
  sendAction("refresh");
};
window.askRefresh = askRefresh;
askRefresh();






document.body.style.visibility = "visible";
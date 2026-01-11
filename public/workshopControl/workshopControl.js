import { rtdb, getDatabase, ref, set, onValue } from "../../myFirebase.js";

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
}, 1000);

const timeDurationShow = document.querySelector("#timeDurationShow");
const timeDurationShowZone = document.querySelector("#timeDurationShowZone");
const timeDurationShowZoneWidth = getComputedStyle(timeDurationShowZone).width;
//document.getElementById("timeDurationShow").innerText = timeDurationShowZoneWidth;

const timeDurationStartInput = document.querySelector("#timeDurationStartInput");
const timeDurationEndInput = document.querySelector("#timeDurationEndInput");

if(localStorage.getItem("WCTimeStart") && localStorage.getItem("WCTimeStart") !== "" 
&& localStorage.getItem("WCTimeEnd") && localStorage.getItem("WCTimeEnd") !== "" 
&& localStorage.getItem("WCTimeEnd") >= new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })){
  timeDurationStartInput.value = localStorage.getItem("WCTimeStart");
  timeDurationEndInput.value = localStorage.getItem("WCTimeEnd");

  let totalDuration = durationCalculation(timeDurationStartInput.value, timeDurationEndInput.value); 
  let pastDuration = durationCalculation(timeDurationStartInput.value, new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  let totalWidthNum = parseFloat(getComputedStyle(timeDurationShowZone).width);
  let pastWidth = totalWidthNum * pastDuration / totalDuration;

  let restDuration = totalDuration - pastDuration;

  timeDurationShow.animate([{width: pastWidth + "px"},{width: timeDurationShowZoneWidth}], restDuration);
} else{
  localStorage.clear();
};

timeDurationEndInput.addEventListener("input", () => {

  if(timeDurationEndInput.value !== null && timeDurationStartInput.value !== null){
    let duration = durationCalculation(timeDurationStartInput.value, timeDurationEndInput.value);
  
    timeDurationShow.animate([{width: "0"},{width: timeDurationShowZoneWidth}], duration);

    localStorage.setItem("WCTimeStart", timeDurationStartInput.value);
    localStorage.setItem("WCTimeEnd", timeDurationEndInput.value);
  };
});

function resetLocalTime(){
  timeDurationStartInput.value = "";
  timeDurationEndInput.value = "";
  localStorage.clear();
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
      currentSlideSetting(info.current); //object
      stepButtonFixing(info.steps); //object
      if(info?.words?.length > 0) {
        wordDropdownCreation(info.words); //array
      };  
      if(info?.phrases?.length > 0) {
        toUnveilDropdownCreation(info.phrases); //array of objects
      };    
      break;
    case "refresh":
      allSlidesCreation(info.slides); //array of objects
      console.log("REFRESH currentSlideSetting " + info);
      currentSlideSetting(info.current); //object
      stepButtonFixing(info.steps); //object
      if(info?.words?.length > 0) {
        wordDropdownCreation(info.words); //array
      };
      if(info?.phrases?.length > 0) {
        toUnveilDropdownCreation(info.phrases); //array of objects
      };
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

const diapoTitle = document.querySelector("#diapoTitle");

function currentSlideSetting(info){
  diapoMain.innerHTML = "";
  
  diapoTitle.innerHTML = `<span class="diapoTitleTitre">${info.titre}</span><span class="diapoTitleType">${info.type}</span>`;

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

function wordDropdownCreation(words){
  let wordDropdownOptions = words.map(group => {
    let title = group[0];
    let options = group.map((word, idx) => {
      if(idx !== 0){
        return `<option value="${word.match(emojiRegex) ? word.match(emojiRegex) : word}">${word}</option>`;
      };
    }).join("");
    return `<optgroup label="${title}">
      ${options}
    </optgroup>`;
  }).join("");

  diapoMain.innerHTML = `<select class="selectTheirChoice" id="wordDropdown"">
      <option value="">--Options--</option>
      ${wordDropdownOptions}
    </select>
    <input class="addTheirChoice" id="wordInput" type="text"></input>`;
    
  let action = "rain";
  activateSelector(action);

  activateInputAdder(action);
  
};

function toUnveilDropdownCreation(phrases){
  let phrasesDropdownOptions = phrases.map((sentence) => {
    return `<option value="${sentence.code}">${sentence.phrase}</option>`;
  }).join("");

  diapoMain.innerHTML = `<select class="selectTheirChoice" id="phraseDropdown"">
      <option value="">--Options--</option>
      ${phrasesDropdownOptions}
    </select>
    <input class="addTheirChoice" id="phraseInput" type="text"></input>`;
    
    let action = "unveilIt";
    activateSelector(action);

    let action2 = "addWisdom";
    activateInputAdder(action2)
 
};

function activateSelector(action){
  let selector = diapoMain.querySelector("select.selectTheirChoice");
  selector.addEventListener("change",  () => {
    let value = selector.value;
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
  diapoMain.querySelector(`option[value="${option}"]`).remove();
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
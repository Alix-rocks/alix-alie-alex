import { rtdb, getDatabase, ref, set, onValue } from "../../myFirebase.js";

set(ref(rtdb, "workshop/control"), null);
set(ref(rtdb, "workshop/feedback"), null);

onValue(ref(rtdb, "workshop/feedback"), (snapshot) => {
  if (!snapshot.val()) return;
  handleFeedback(snapshot.val().need, snapshot.val().info);
  set(ref(rtdb, "workshop/feedback"), null);
});

set(ref(rtdb, "workshop/control"), {
  action: "refresh",
  timestamp: Date.now()
});

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
      if(info?.words?.length > 0) {
        wordDropdownCreation(info.words); //array
      };
      stepButtonFixing(info.steps); //object
      currentSlideSetting(info.current); //object
      break;
    case "refresh":
      if(info?.words?.length > 0) {
        wordDropdownCreation(info.words); //array
      };
      stepButtonFixing(info.steps); //object
      allSlidesCreation(info.slides); //array of objects
      console.log("REFRESH currentSlideSetting " + info);
      currentSlideSetting(info.current); //object
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
  
  diapoTitle.innerHTML = `<span class="diapoTitleTitre">${info.titre}</span><span class="diapoTitleType">${info.type}</span>`;

  // allMiniSlides.forEach(mini => {
  //   if(mini.dataset.slide == info.num){
  //     mini.classList.add("highlighted");
  //   } else{
  //     mini.classList.remove("highlighted");
  //   };
  // });

  document.querySelector(`#mini${info.num}`).checked = true;

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
         //send control to get that slide
        let slideNum = radio.value; 
        diapoMain.innerHTML = "";
        set(ref(rtdb, "workshop/control"), {
          action: "thisSlide",
          data: slideNum,
          timestamp: Date.now()
        });
      };
    });
  });
};

function slideNext(){
  diapoMain.innerHTML = "";
  set(ref(rtdb, "workshop/control"), {
    action: "slideNext",
    timestamp: Date.now()
  });
};
window.slideNext = slideNext;

function slidePrev(){
  diapoMain.innerHTML = "";
  set(ref(rtdb, "workshop/control"), {
    action: "slidePrev",
    timestamp: Date.now()
  });
};
window.slidePrev = slidePrev;

function stepNext(){
  set(ref(rtdb, "workshop/control"), {
    action: "stepNext",
    timestamp: Date.now()
  });
};
window.stepNext = stepNext;

function stepPrev(){
  set(ref(rtdb, "workshop/control"), {
    action: "stepPrev",
    timestamp: Date.now()
  });
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

  diapoMain.innerHTML = `<select id="wordDropdown"">
      <option value="">--Options--</option>
      ${wordDropdownOptions}
    </select>
    <input id="wordInput" type="text"></input>`;
  let selector = diapoMain.querySelector("#wordDropdown");
  selector.addEventListener("change",  () => {
    makeItRain(selector.value);
    selector.value = "";
});
  
  let adder = diapoMain.querySelector("#wordInput");
  adder.addEventListener("change", () => {
    makeItRain(adder.value);
    adder.value = "";
  });
  
  function makeItRain(water){
    console.log(water);
    if(water !== ""){
      console.log(water);
      set(ref(rtdb, "workshop/control"), {
        action: "rain",
        data: water,
        timestamp: Date.now()
      });
    };
  };
};

document.querySelector("#fullScreenCB").addEventListener("change", ev => {
  if(ev.target.checked){
    fullscreen()
  } else{
    exitFullscreen()
  };
});

function fullscreen(){
  set(ref(rtdb, "workshop/control"), {
    action: "fs",
    timestamp: Date.now()
  });
  // const elem = document.documentElement; // The entire page         
  // // Activate fullscreen
  // if (elem.requestFullscreen) {
  //     elem.requestFullscreen();
  // } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, and Opera
  //     elem.webkitRequestFullscreen();
  // } else if (elem.msRequestFullscreen) { // IE/Edge
  //     elem.msRequestFullscreen();
  // };
};

function exitFullscreen() {
  set(ref(rtdb, "workshop/control"), {
    action: "efs",
    timestamp: Date.now()
  });
  // if (document.fullscreenElement) {
  //   if (document.exitFullscreen) {
  //     document.exitFullscreen();
  //   } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
  //     document.webkitExitFullscreen();
  //   } else if (document.msExitFullscreen) { // IE/Edge
  //     document.msExitFullscreen();
  //   };
  // };
};



document.body.style.visibility = "visible";
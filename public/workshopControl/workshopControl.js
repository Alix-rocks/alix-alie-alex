import { rtdb, getDatabase, ref, set, onValue } from "../../myFirebase.js";

set(ref(rtdb, "workshop/control"), null);
set(ref(rtdb, "workshop/feedback"), null);

onValue(ref(rtdb, "workshop/feedback"), (snapshot) => {
  if (!snapshot.val()) return;
  handleFeedback(snapshot.val().need, snapshot.val().info);
  set(ref(rtdb, "workshop/feedback"), null);
});

let screenHeight;
let screenWidth;
(() => {
  screenHeight = window.innerHeight - 16;
  screenWidth = window.innerWidth - 16;
  document.querySelector(':root').style.setProperty('--vw', `${screenWidth}px`);
  document.querySelector(':root').style.setProperty('--vh', `${screenHeight}px`);
})();


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

timeDurationEndInput.addEventListener("input", () => {
  if(timeDurationEndInput.value !== null && timeDurationStartInput.value !== null){
    console.log(timeDurationEndInput.value + " " + timeDurationStartInput.value);
    let start = timeDurationStartInput.value.split(":");
    let end = timeDurationEndInput.value.split(":");
    let startDate = new Date(0, 0, 0, start[0], start[1], 0);
    let endDate = new Date(0, 0, 0, end[0], end[1], 0);
    let duration = endDate.getTime() - startDate.getTime();
    console.log(duration);
    console.log(timeDurationShowZoneWidth);
    
    
    timeDurationShow.animate([{width: "0"},{width: timeDurationShowZoneWidth}], duration);
  };
});

function handleFeedback(need, info){
  switch(need){
    case "wddc":
      wordDropdownCreation(info);
      break;
    case "sbf":
      stepButtonFixing(info);
      break;
    default:
      console.log(need, info);
      break;
  };
};

const emojiRegex = /\p{Emoji}/gu; // 'g' for global, 'u' for Unicode mode
const diapoMain = document.querySelector("#diapoMain");

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
  let wordDropdownOptions = words.map(word => {
      return `<option value="${word.match(emojiRegex) ? word.match(emojiRegex) : word}">${word}</option>`;
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
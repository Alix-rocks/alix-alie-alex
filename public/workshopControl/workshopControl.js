import { rtdb, getDatabase, ref, set, onValue } from "../../myFirebase.js";

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

function slideNext(){
  set(ref(rtdb, "workshop/control"), {
    action: "next",
    timestamp: Date.now()
  });
};
window.slideNext = slideNext;
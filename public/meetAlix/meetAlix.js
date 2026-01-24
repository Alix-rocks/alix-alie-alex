// alix.rocks/meetAlix/?type=friend
// alix.rocks/meetAlix/?type=client
// alix.rocks/meetAlix/?lang=en
// alix.rocks/meetAlix/?lang=fr
import { app, analytics, db, auth, provider, getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp, getAuth, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, onAuthStateChanged, rtdb, getDatabase, ref, get, push, update, onValue, onChildChanged, remove } from "/myFirebase.js";
import i18n from "./i18n.js";

let unknownStartDate = "2026-02-15"; //The day the "Not sure yet" section starts

let myEmail = "alexblade.23.49@gmail.com";

const params = new URLSearchParams(window.location.search);

const formType = params.get("type") || "default";
console.log(window.location.href);
console.log(window.location.search);

const formConfigs = {
  puzzle: {
    meet: true,
    form: "#puzzleTour",
    meal: true
  },
  friend: {
    meet: true,
    form: "#meetAlix",
    meal: true
  },
  client: {
    meet: true,
    form: "#Book a meeting",
    meal: false
  },
  default: {
    meet: false,
    form: "#meetAlix",
    meal: true
  }
};
const config = formConfigs[formType];
console.log(config);

const lang =
  params.get("lang") ||
  navigator.language.slice(0, 2) ||
  "en";

function t(key, vars = {}) {
  let text = i18n[lang]?.[key] || i18n.en[key] || key;

  for (const v in vars) {
    text = text.replaceAll(`{${v}}`, vars[v]);
  };

  return text;
};

function translatePage() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.innerHTML = t(key);
  });
};
translatePage();




const weeksDayArray = [{
  day: 0,
  name: "dimanche",
  letter: "D",
  code: "D0"
}, {
  day: 1,
  name: "lundi",
  letter: "L",
  code: "L1"
}, {
  day: 2,
  name: "mardi",
  letter: "M",
  code: "M2"
}, {
  day: 3,
  name: "mercredi",
  letter: "M",
  code: "M3"
}, {
  day: 4,
  name: "jeudi",
  letter: "J",
  code: "G4"
}, {
  day: 5,
  name: "vendredi",
  letter: "V",
  code: "V5"
}, {
  day: 6,
  name: "samedi",
  letter: "S",
  code: "S6"
}];

let landscapeMode;
let screenHeight;
let screenWidth;
(() => {
  screenHeight = window.innerHeight - 16;
  screenWidth = window.innerWidth - 16;
  if(screenWidth > screenHeight){ //if true => landscape mode (16:9)
    landscapeMode = true;
    screenWidth = screenHeight * 16 / 9;
  } else if(screenHeight > screenWidth){ // portrait mode (20:9)
    landscapeMode = false;
    screenHeight = screenWidth * 20 / 9;
  };
    document.documentElement.style.setProperty('--vh', `${screenHeight}px`);
    document.documentElement.style.setProperty('--vw', `${screenWidth}px`);
})();

const SLOTS_PER_DAY = 97; // 24h * 4 slots/h + 1 slot (for after "midnight")

const allTheEdges = []
//0 0-0 - 0-11 D am
//1 0-23 - 1-11 D-L
//2 1-23 - 2-11 L-M
//3 2-23 - 3-11 M-M
//4 3-23 - 4-11 M-J
//5 4-23 - 5-11 J-V
//6 5-23 - 6-11 V-S
//7 6-23 - 6-24 S pm

for(let d = 0; d < 8; d++){
  let startSlotInfo = {
    dayIndex: d == 0 ? 0 : d - 1,
    hour: d == 0 ? 0 : 23,
    minute: 0
  };
  let startSlot = dateTimeToSlot(startSlotInfo);

  let endSlotInfo = {
    dayIndex: d,
    hour: d == 7 ? 24 : 11,
    minute: 0
  };
  let endSlot = dateTimeToSlot(endSlotInfo);

  let daySlots = {
    start: startSlot,
    end: endSlot
  };
  allTheEdges.push(daySlots); //Les ajouter dans unavailableRanges
};
console.log(allTheEdges);

const container = document.querySelector(".weeklyContainer");
const mealLegend = document.querySelector("#mealLegend");
mealLegend.style.display = config.meal ? "flex" : "none";
const formContainer = document.querySelector(config.form);
const form = formContainer.querySelector("form");
const selectedTime = formContainer.querySelector(".selectedTime");
const handle = formContainer.querySelector(".handle");
handle.addEventListener("click", () => {
  formContainer.classList.toggle("expanded");
});
const submitBtn = formContainer.querySelector(".submitBtn");

let myBusies = [];
const unavailableRanges = [];

const userSelection = {
  date: null,
  dayIndex: null,
  col: null,
  startSlot: null,
  startRow: null,
  endSlot: null,
  endRow: null,
  topIsTouching: false,
  bottomIsTouching: false,
  status: "",
  uuid: ""
};


const formFields = {
  date: {
    selector: ".dateComplete",
    type: "simple"
  },
  dalle: {
    selector: ".dalleTime",
    type: "dalle"
  },
  alle: {
    selector: ".alleTime",
    type: "alle"
  },
  name: {
    selector: ".nameInput",
    type: "simple"
  },
  email: {
    selector: ".emailInput",
    type: "simple"
  },
  cell: {
    selector: ".cellInput",
    type: "simple"
  },
  messengerName: {
    selector: ".messengerNameInput",
    type: "simple"
  },
  whatsAppNumber: {
    selector: ".whatsAppNumberInput",
    type: "simple"
  },
  where: {
    selector: '[name="whereRadios"]',
    type: "radio"
  },
  yourAddress: {
    selector: ".yourAddressInput",
    type: "simple"
  },
  whereReal: {
    selector: ".whereRealInput",
    type: "simple"
  },
  why: {
    selector: ".whyInput",
    type: "simple"
  }
};

const formState = Object.fromEntries(
  Object.keys(formFields).map(key => [key, ""])
);
console.log(formState);
// That code (up) basically creates this (down):
// const formState = {
//   date: "",
//   dalle: "",
//   alle: "",
//   name: "",
//   email: "",
//   cell: "",
//   messengerName: "",
//   whatsAppNumber: "",
//   where: "",
//   yourAddress: "",
//   whereReal: "",
//   why: ""
// };

const inputs = {};

for (const key in formFields) {
  const { selector, type } = formFields[key];
  if (type === "radio"){
    inputs[key] = formContainer.querySelectorAll(selector);
  } else{
    inputs[key] = formContainer.querySelector(selector);
  };
};
console.log(inputs);
// That code (up) basically does this (down):
// const dateComplete = formContainer.querySelector(".dateComplete");
// const dalleTime = formContainer.querySelector(".dalleTime");
// const alleTime = formContainer.querySelector(".alleTime");
// const nameInput = formContainer.querySelector(".nameInput");
// const emailInput = formContainer.querySelector(".emailInput");
// const cellInput = formContainer.querySelector(".cellInput");
// const messengerNameInput = formContainer.querySelector(".messengerNameInput");
// const whatsAppNumberInput = formContainer.querySelector(".whatsAppNumberInput");
// const whereRadios = formContainer.querySelector('[name="whereRadios"]');
// const yourAddressInput = formContainer.querySelector(".yourAddressInput");
// const whereRealInput = formContainer.querySelector(".whereRealInput");
// const whyInput = formContainer.querySelector(".whyInput");
// and creates this:
// const inputs = {
//   date: dateComplete,
//   dalle: dalleTime,
//   alle: alleTime,
//   name: nameInput,
//   email: emailInput,
//   cell: cellInput,
//   messengerName: messengerNameInput,
//   whatsAppNumber: whatsAppNumberInput,
//   yourAddress: yourAddressInput,
//   whereReal: whereRealInput,
//   why: whyInput
// };

const savedFormState = localStorage.getItem("meetAlixFormState");

if (savedFormState) {
  Object.assign(formState, JSON.parse(savedFormState));
} else {
  localStorage.setItem(
    "meetAlixFormState",
    JSON.stringify(formState)
  );
};
console.log(formState);
// That code (up) basically creates this (down):
//  if(localStorage.getItem("meetAlixFormState")){
//     let tempFS = JSON.parse(localStorage.meetAlixFormState);
//     formState.date = tempFS.date;
//     formState.dalle = tempFS.dalle;
//     formState.alle = tempFS.alle;
//     formState.name = tempFS.name;
//     formState.email = tempFS.email;
//     formState.cell = tempFS.cell;
//     formState.messengerName = tempFS.messengerName;
//     formState.whatsAppNumber = tempFS.whatsAppNumber;
//     formState.where = tempFS.where;
//     formState.yourAddress = tempFS.yourAddress;
//     formState.whereReal = tempFS.whereReal;
//     formState.why = tempFS.why;
//   } else {
//     localStorage.setItem("meetAlixFormState", JSON.stringify(formState));
//   };

const fieldHandlers = {
  simple(key) {
    console.log("simple " + key + " " + inputs[key]);
    inputs[key].addEventListener("change", e => {
      formState[key] = e.target.value;
      localStorage.setItem(
        "meetAlixFormState",
        JSON.stringify(formState)
      );
    });
  },
// WE NEED TO ADD ONE FOR DATE TOO! THAT WILL CHANGE USERSELECTION AND USERMEETING!
  dalle(key) {
    console.log("dalle " + key + " " + inputs[key]);
    inputs[key].addEventListener("change", e => {
      const value = e.target.value; // e.g., "10:07"
      if (!value) return;
      const formattedTime = roundFifteenTime(value);
      console.log(formattedTime);
      
      //If there's overlapping, adjust the time to the nearest possible; don't just snap back to the previous time
      let [hours, minutes] = formattedTime.split(':').map(Number);
      let info = {
        dayIndex: userSelection.dayIndex,
        hour: hours,
        minute: minutes
      };
      let newStartSlot = dateTimeToSlot(info);
      let newDalleSlot = checkNewDalleSlot(newStartSlot, userSelection.endSlot);
      //CHECK WITH EDGES TOO!! (Edges have been added to unavailableRanges)
      // let newDalleTime = slotToTime(newDalleSlot);
      userSelection.startSlot = newDalleSlot;
      userSelection.startRow = slotToRow(newDalleSlot);
      updateUserMeeting();
      updateSelectedTime(); // formContainer is technically already expanded
      //updateSelectedTime includes: 
      // e.target.value = newDalleTime;
      // formState.dalle = newDalleTime;
      // localStorage.meetAlixFormState = JSON.stringify(formState);
    });
  },

  alle(key) {
    console.log("alle " + key + " " + inputs[key]);
    inputs[key].addEventListener("change", e => {
      const value = e.target.value; // e.g., "10:07"
      if (!value) return;
      const formattedTime = roundFifteenTime(value);
      console.log(formattedTime);
      
      //If there's overlapping, adjust the time to the nearest possible; don't just snap back to the previous time
      let [hours, minutes] = formattedTime.split(':').map(Number);
      let info = {
        dayIndex: userSelection.dayIndex,
        hour: hours,
        minute: minutes
      };
      let newEndSlot = dateTimeToSlot(info);
      let newAlleSlot = checkNewAlleSlot(userSelection.startSlot, newEndSlot);
      //CHECK WITH EDGES TOO!!
      let newAlleTime = slotToTime(newAlleSlot);
      userSelection.endSlot = newAlleSlot;
      userSelection.endRow = slotToRow(newAlleSlot);
      updateUserMeeting();
      updateSelectedTime(); // formContainer is technically already expanded
      //updateSelectedTime includes: 
      // e.target.value = newDalleTime;
      // formState.dalle = newDalleTime;
      // localStorage.meetAlixFormState = JSON.stringify(formState);
    });
  },

  radio(key) {
    console.log("radio " + key + " " + inputs[key]);
    inputs[key].forEach(radio => {
      radio.addEventListener("change", e => {
        if (e.target.checked) {
          formState[key] = e.target.value;
          localStorage.setItem(
            "meetAlixFormState",
            JSON.stringify(formState)
          );
        };
      });
    });
  }
};

for (const key in formFields) {
  const { selector, type } = formFields[key];

  const handler = fieldHandlers[type];

  handler(key);
};





// That code (up) basically creates this (down):



// const storedBookings =
//       JSON.parse(localStorage.getItem("meetAlixBookings")) || [];
// //NOOOO We need to verify, at download, if the storedBookings is up to date according to the rtdb...

(() => {
  if(localStorage.getItem("meetAlixUserSelection")){
    let tempUS = JSON.parse(localStorage.meetAlixUserSelection);
      userSelection.date = tempUS.date;
      userSelection.startSlot = tempUS.startSlot;
      userSelection.startRow = tempUS.startRow;
      userSelection.endSlot = tempUS.endSlot;
      userSelection.endRow = tempUS.endRow;
      userSelection.dayIndex = tempUS.dayIndex;
      userSelection.col = tempUS.col;
      userSelection.topIsTouching = tempUS.topIsTouching;
      userSelection.bottomIsTouching = tempUS.bottomIsTouching;
      userSelection.status = tempUS.status;
      userSelection.uuid = tempUS.uuid;
  } else {
    //resetUserSelection();
    localStorage.setItem("meetAlixUserSelection", JSON.stringify(userSelection));
  };
})();




// dateComplete.addEventListener("change", (e) => {
//   formState.date = e.target.value;
//   localStorage.meetAlixFormState = JSON.stringify(formState);
// });
// dalleTime.addEventListener("change", (e) => {
  
// });
// alleTime.addEventListener("change", (e) => {
//   const value = e.target.value; // e.g., "10:07"
//   if (!value) return;
//   const formattedTime = roundFifteenTime(value); // => 10:15

//   let [hours, minutes] = formattedTime.split(':').map(Number);
//   let info = {
//     dayIndex: userSelection.dayIndex,
//     hour: hours,
//     minute: minutes
//   };
//   let newEndSlot = dateTimeToSlot(info);
//   let newAlleSlot = checkNewAlleSlot(userSelection.startSlot, newEndSlot);
//   //CHECK WITH EDGES TOO!!
//   let newAlleTime = slotToTime(newAlleSlot);
//   userSelection.endSlot = newAlleSlot;
//   userSelection.endRow = slotToRow(newAlleSlot);
//   updateUserMeeting();
//   updateSelectedTime(); // formContainer is technically already expanded
//   // e.target.value = newAlleTime;
//   // formState.alle = newAlleTime;
//   // //ADD AN UPDATE OF SELECTEDTIME (but not the big whole function; we need smaller functions)
//   // localStorage.meetAlixFormState = JSON.stringify(formState);
// });

function roundFifteenTime(value){
  let [hours, minutes] = value.split(':').map(Number);
  // Round to the nearest 15
  minutes = Math.round(minutes / 15) * 15;
  if (minutes === 60) {
    minutes = 0;
    hours = (hours + 1) % 24;
  };
  // Format back to HH:mm
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// nameInput.addEventListener("change", (e) => {
//   formState.name = e.target.value;
//   localStorage.meetAlixFormState = JSON.stringify(formState);
// });
// emailInput.addEventListener("change", (e) => {
//   formState.email = e.target.value;
//   localStorage.meetAlixFormState = JSON.stringify(formState);
// });
// cellInput.addEventListener("change", (e) => {
//   formState.cell = e.target.value;
//   localStorage.meetAlixFormState = JSON.stringify(formState);
// });
// messengerNameInput.addEventListener("change", (e) => {
//   formState.messengerName = e.target.value;
//   localStorage.meetAlixFormState = JSON.stringify(formState);
// });
// whatsAppNumberInput.addEventListener("change", (e) => {
//   formState.whatsAppNumber = e.target.value;
//   localStorage.meetAlixFormState = JSON.stringify(formState);
// });
// whereRadios.addEventListener("change", (e) => {
//   console.log(e.target.value);
//   formState.where = e.target.value;
//   console.log(formState.where);
//   localStorage.meetAlixFormState = JSON.stringify(formState);
// });
// yourAddressInput.addEventListener("change", (e) => {
//   formState.yourAddress = e.target.value;
//   localStorage.meetAlixFormState = JSON.stringify(formState);
// });
// whereRealInput.addEventListener("change", (e) => {
//   formState.whereReal = e.target.value;
//   localStorage.meetAlixFormState = JSON.stringify(formState);
// });
// whyInput.addEventListener("change", (e) => {
//   formState.why = e.target.value;
//   localStorage.meetAlixFormState = JSON.stringify(formState);
// });


onChildChanged(ref(rtdb, "meetAlix"), (snap) => {
  const booking = { key: snap.key, ...snap.val() };
  //check if booking.key already is in bookingQueue, and if yes, then update that one, otherwise, push it
  const bookingIndex = storedBookings.findIndex(book => book.key === booking.key);
  if(bookingIndex !== -1){
    storedBookings[bookingIndex].status = booking.status;
  } else{
    storedBookings.push(booking);
  };
  
});

const storedBookings = JSON.parse(
  localStorage.getItem("meetAlixBookings") || "[]"
);

async function updateBookings() {
  await Promise.all(
    storedBookings.map(async book => {
      const snap = await get(ref(rtdb, `meetAlix/${book.key}`));

      if (!snap.exists()) {
        book.status = "cancelled";
        return;
      };

      const rtdbData = snap.val();
      if (rtdbData.status !== book.status) {
        book.status = rtdbData.status;
      };
    })
  );

  localStorage.setItem(
    "meetAlixBookings",
    JSON.stringify(storedBookings)
  );
}
updateBookings();


async function getMyBusies() {
  // const getBusies = await getDoc(doc(db, "randomTask", myEmail));
  const getBusies = await getDoc(doc(db, "randomTask", myEmail, "mySchedule", "myBusies"));
  /* if(localStorage.getItem("myBusies")){
    myBusies = JSON.parse(localStorage.myBusies);
  } else  */
  if(getBusies.exists() && getBusies.data().myBusies){
    myBusies = getBusies.data().myBusies;
    //localStorage.myBusies = JSON.stringify(myBusies);
  };
  /*  else{
    localStorage.myBusies = JSON.stringify([]);
  }; */
  // if(localStorage.getItem("mySettings")){
  //   mySettings = JSON.parse(localStorage.mySettings);
  // } else if(getBusies.exists() && getBusies.data().mySettings){
  //   mySettings = getBusies.data().mySettings;
  //   localStorage.mySettings = JSON.stringify(mySettings);
  // } else{
  //   localStorage.mySettings = JSON.stringify(mySettings);
  // };
  // myBusies = JSON.parse(localStorage.myBusies);
  
  getWeeklyCalendar();

  let item = document.querySelector(`[data-col="2"][data-row="4"]`);
  const itemWidth = window.getComputedStyle(item).getPropertyValue("width");
  const itemHeight = window.getComputedStyle(item).getPropertyValue("height");


  document.documentElement.style.setProperty('--itemWidth', `${itemWidth}`);
  document.documentElement.style.setProperty('--itemHeight', `${itemHeight}`);

  document.body.style.visibility = "visible";
};

getMyBusies();




//*** WEEKLY CALENDAR

let date = new Date();
let todayDate = date.getDate();
let year = date.getFullYear();
let month = date.getMonth(); //pour vrai, enlève le "+ 1"
let monthName = date.toLocaleString('fr-CA', { month: 'long' }).toLocaleUpperCase();
let todayWholeDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(todayDate).padStart(2, "0")}`

function getWeeklyCalendar(){
  let arrayItem = [];
  let rowYear = `<div class="weeklyItem weeklyTitle" style="grid-row:1; border-bottom-width: 1px;"><button class="weeklyBtn" id="weekBackward" style="float: left; border-radius: 2px 5px 5px 0;"><span class="typcn typcn-media-play-reverse"></span></button><span id="weeklyYearSpan">${year}</span><button class="weeklyBtn" id="weekForward" style="float: right; border-radius: 5px 2px 0 5px;"><span class="typcn typcn-media-play"></span></button></div>`;
  let rowMonth = `<div class="weeklyItem weeklyTitle" style="grid-row:2; border-bottom-width: 2px;"><span id="weeklyMonthSpan">${monthName}</span></div>`;
  arrayItem.push(rowYear, rowMonth);
  let myDay = 11;
  for(let c = 1; c < 9; c++){
    let arrayC = [];
    let rowDay = `<div 
      ${c == 2 ? `id="Dday"` : c == 8 ? `id="Sday"` : ``} 
      class="weeklyItem weeklyDay" 
      style="
        grid-column:${c}; 
        grid-row:3; 
        ${c == 1 ? " border-radius:2px 0 0 2px; border-right:1px solid rgba(47, 79, 79, .5);" : ""}
      "
      ${c > 1 ? ` data-dayindex="${c - 2}"><span class="weeklyDaySpan">${weeksDayArray[c - 2].letter}</span><br /><span class="weeklyDateSpan"></span>` : `>`}
    </div>`;
    arrayC.push(rowDay);
    let line = 4;
    for(let r = 1; r < 13; r++){ // 12 weeklyItem per day (because it starts at 11:00 and ends at 23:00)
      let item = `<div 
        class="weeklyItem${c > 1 && config.meet ? `" onclick="addMe(this)` : ` unavailable`}" 
        style="grid-column:${c}; grid-row:${line} / ${line + 4};${c == 1 ? " border-radius:2px 0 0 2px; border-right:1px solid rgba(47, 79, 79, .5);" : ""}" 
        data-col="${c}" 
        data-row="${line}"
      >${c == 1 ? `${String(myDay).padStart(2, "0")}:00` : ``}</div>`; 
      arrayC.push(item);
      line += 4;
      myDay++;
    };
    let lastWeeklyItem = `<div class="weeklyItem unavailable invisible" style="grid-column:${c}; grid-row:52 / 53;"></div>`;
    arrayC.push(lastWeeklyItem);
    let arrayCs = arrayC.join("");
    arrayItem.push(arrayCs);
  };
  let nomiCol = weeksDayArray.map((giorno, idx) => {
    return `[col-${giorno.code}${idx == 0 ? ` col-start` : ``}] 1fr`;
  });
  let firstCol = `[col-Hour] 45px`;
  let lastCol = `[col-end]`;
  nomiCol.unshift(firstCol);
  nomiCol.push(lastCol);
  let nomiCols = nomiCol.join(" ");
  let nomiRow = [];
  myDay = 11;
  for(let h = 0; h < 12; h++){ //93 (quand h < 13)
    let rowH = `[row-${String(myDay).padStart(2, "0")}-00${h == 0 ? ` row-Day-end` : ``}] minmax(0, .25fr)`;
    let rowH15 = `[row-${String(myDay).padStart(2, "0")}-15] minmax(0, .25fr)`;
    let rowH30 = `[row-${String(myDay).padStart(2, "0")}-30] minmax(0, .25fr)`;
    let rowH45 = `[row-${String(myDay).padStart(2, "0")}-45] minmax(0, .25fr)`;
    nomiRow.push(rowH, rowH15, rowH30, rowH45);
    myDay++;
  };
  let firstRows = `[row-Year] 1fr [row-Month] 1fr [row-Day] 1.5fr`;
  let lastLine = `[row-23-00] minmax(0, 0) [row-end]`;
  // let lastLine = `[row-end]`;
  nomiRow.unshift(firstRows);
  nomiRow.push(lastLine);
  let nomiRows = nomiRow.join(" ");
  container.style.gridTemplateRows = nomiRows;
  container.style.gridTemplateColumns = nomiCols;
  
  //arrayItem.push(todayArea);
  let arrayItems = arrayItem.join("");
  container.innerHTML = arrayItems;

  let date = new Date();
  let dayIdx = date.getDay();
  date.setDate(date.getDate() - dayIdx);
  putDatesInWeek(date); //includes getThisWeekStuffAndUnavailableRanges(Dday, Sday); AND putShowsInWeek();

  document.querySelector("#weekBackward").addEventListener("click", () => {
    eraseWeekArea();
    eraseWeekEvent();
    let Dday = document.querySelector("#Dday").dataset.date;
    let Ddate = getDateFromString(Dday);
    Ddate.setDate(Ddate.getDate() - 7);
    putDatesInWeek(Ddate); //includes getThisWeekStuffAndUnavailableRanges(Dday, Sday); AND putShowsInWeek();
  });

  document.querySelector("#weekForward").addEventListener("click", () => {
    eraseWeekArea();
    eraseWeekEvent();
    let Sday = document.querySelector("#Sday").dataset.date;
    let Sdate = getDateFromString(Sday);
    Sdate.setDate(Sdate.getDate() + 1);
    putDatesInWeek(Sdate); //includes getThisWeekStuffAndUnavailableRanges(Dday, Sday); AND putShowsInWeek();
  });
};

function fromThisWeekStuffToUnavailableRanges(){
  unavailableRanges.length = 0;
  myThisWeekBusies.forEach(busy => {
    let start = {
      dayIndex: busy.day, //if we end up with multiple days events... we'll need startDayIndex and endDayIndex
      hour: busy.startHour,
      minute: busy.startMinute
    };
    let startSlot = dateTimeToSlot(start);
    let end = {
      dayIndex: busy.day, //if we end up with multiple days events... we'll need startDayIndex and endDayIndex
      hour: busy.endHour,
      minute: busy.endMinute
    };
    let endSlot = dateTimeToSlot(end);
    let busyRange = {
      start: startSlot,
      end: endSlot
    };
    unavailableRanges.push(busyRange);
  });

  if(config.meet && theirThisWeekBookings.length){
    theirThisWeekBookings.forEach(book => {
      // let start = {
      //   dayIndex: book.event.dayIndex, //if we end up with multiple days events... we'll need startDayIndex and endDayIndex
      //   hour: book.event.startHour,
      //   minute: book.event.startMinute
      // };
      // let startSlot = dateTimeToSlot(start);
      // let end = {
      //   dayIndex: book.event.dayIndex, //if we end up with multiple days events... we'll need startDayIndex and endDayIndex
      //   hour: book.event.endHour,
      //   minute: book.event.endMinute
      // };
      // let endSlot = dateTimeToSlot(end);
      let bookRange = {
        start: book.event.startSlot,
        end: book.event.endSlot
      };
      console.log(bookRange);
      unavailableRanges.push(bookRange);
    });
  };
  
  // Adding the edges 
  unavailableRanges.push(...allTheEdges);
  console.log(unavailableRanges);
}; 


function putDatesInWeek(date){
  let arrayDate = [];
  for(let d = 0; d < 7; d++){
    let thisDate = {
      date: String(date.getDate()),
      fullSlash: getSlashStringFromDate(date),
      fullDash: getDashStringFromDate(date)
    };
    arrayDate.push(thisDate);
    date.setDate(date.getDate() + 1);
  };
  let i = 0;
  document.querySelectorAll(".weeklyDateSpan").forEach(span => {
    span.innerHTML = arrayDate[i].date;
    span.parentElement.setAttribute("data-date", arrayDate[i].fullSlash);
    i++;
  });
  let today = getTodayDate();
  let dayIdx = meseDayICalc(today);
  const test = arrayDate.some(el => (el.fullDash == today));
  if(test){   
    let current = new Date();
    let currentHour = current.getHours();
    let currentMinute = current.getMinutes();
    let currentTime = roundFifteenArea(currentHour, currentMinute);
    let todayDay = `${weeksDayArray[dayIdx].code}`;
    let todayArea = `<div class="todayArea" style="grid-row: row-Day / row-end; grid-column: col-${todayDay};"></div>`;
    let nowArea = `<div class="nowArea" style="grid-row: row-${currentTime}; grid-column: col-${todayDay};"></div>`;  
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", todayArea);
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", nowArea);
    document.querySelector(`[data-dayindex="${weeksDayArray[dayIdx].day}"]`).classList.add("todayDayArea");
    document.querySelector("#weekBackward").classList.add("invisible");
  } else{
    document.querySelector("#weekBackward").classList.remove("invisible");
  };
  //updateSleepAreas();

// MARK: unknownDate
// See line 5 for the unknownStartDate
  
  let unknownArea;
  console.log(arrayDate);
  const unknownTestIn = arrayDate.some(el => (el.fullDash == unknownStartDate));
  if(unknownTestIn){
    let unknownStartIdx = meseDayICalc(unknownStartDate);
    let unknownStart = `${weeksDayArray[unknownStartIdx].code}`;
    unknownArea = `<div class="unknownArea" style="grid-row: row-Day / row-end; grid-column: col-${unknownStart} / col-end">Not sure yet!</div>`;
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", unknownArea);
  };
  const unknownTestAfter = unknownStartDate < arrayDate[0].fullDash ? true : false;
  if(unknownTestAfter){
    unknownArea = `<div class="unknownArea" style="grid-row: row-Day / row-end; grid-column: col-start / col-end">Not sure yet!</div>`;
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", unknownArea);
  };
  

  let Dday = arrayDate[0].fullDash;
  let Sday = arrayDate[arrayDate.length - 1].fullDash;
  let Ddate = getDateFromString(Dday);
  let Sdate = getDateFromString(Sday);
  let DYear = Ddate.getFullYear();
  let SYear = Sdate.getFullYear();
  let DMonthName = Ddate.toLocaleString('fr-CA', { month: 'long' }).toLocaleUpperCase();
  let SMonthName = Sdate.toLocaleString('fr-CA', { month: 'long' }).toLocaleUpperCase();
  document.querySelector("#weeklyYearSpan").innerHTML = `${DYear}${DYear !== SYear ? ` / ${SYear}` : ``}`;
  document.querySelector("#weeklyMonthSpan").innerHTML = `${DMonthName}${DMonthName !== SMonthName ? ` / ${SMonthName}` : ``}`;
  getThisWeekStuffAndUnavailableRanges(Dday, Sday);
  putShowsInWeek();
 
  if(userSelection.date !== null 
    && Dday <= userSelection.date && userSelection.date <= Sday 
    && userSelection.startSlot !== null 
    && userSelection.endSlot !== null
    && (userSelection.status == "" || userSelection.status == "selected")){
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div ${userSelection.uuid ? `data-uuid="${userSelection.uuid}"` : ``} class="userMeeting selected modifying${userSelection.topIsTouching ? `  topIsTouching` : ``}${userSelection.bottomIsTouching ? ` bottomIsTouching` : ``}" style="grid-column:${userSelection.col}; grid-row:${userSelection.startRow}/${userSelection.endRow};"></div>`);
    updateSelectedTime();
    formContainer.classList.remove("expanded");
  }; // add an other one for the confirmed ones
};





function updateSleepAreas(){
  container.querySelectorAll(".sleepArea").forEach(we => {
    we.remove();
  });
  let myDay = Number(mySettings.myTomorrow.substring(0, 2));
  let sleepAreas = mySettings.myWeeksDayArray.map((clock) => {
    return `<div class="sleepArea" style="grid-area: row-${String(myDay).padStart(2, "0")}-00 / col-${clock.day} / row-${clock.clockIn.replace(":", "-")} / col-${clock.day}"></div>
    <div class="sleepArea" style="grid-area: row-${clock.clockOut.replace(":", "-")} / col-${clock.day} / row-end / col-${clock.day}"></div>`;
  }).join("");
  document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", sleepAreas);
};


let myThisWeekBusies = [];
let theirThisWeekBookings = [];
function getThisWeekStuffAndUnavailableRanges(Dday, Sday){
  myThisWeekBusies = myBusies.filter(busy =>
    Dday <= busy.date && busy.date <= Sday
  );
  console.log(myThisWeekBusies);
  if(config.meet && storedBookings.length){
    theirThisWeekBookings = storedBookings.filter(book =>
      Dday <= book.event.date && book.event.date <= Sday
    );
  }; 

  fromThisWeekStuffToUnavailableRanges();
};


function putShowsInWeek() {
  myThisWeekBusies.forEach(busy => {
    createWeeklyshow(busy);
  });
  if(!theirThisWeekBookings.length) return
  theirThisWeekBookings.forEach(book => {
    createWeeklyBook(book);
  });
  updateLegend();
};

function createWeeklyshow(busy){
  document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div class="weeklyBuffer" style="grid-column:col-${busy.col}; grid-row:row-${busy.start}/row-${busy.end};"></div>`);
  if(config.meal && busy.meal){
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div class="weeklyMeal" style="grid-column:col-${busy.col}; grid-row:row-${busy.start}/span 6;">Meal</div>`);
  };
};

function createWeeklyBook(book){
  document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div 
    data-bookingkey="${book.key}" 
    data-status="${book.status}"
    onclick="openForm(this)" 
    class="userMeeting ${book.status}${book.event.topIsTouching ? ` topIsTouching` : ``}${book.event.bottomIsTouching ? ` bottomIsTouching` : ``}" 
    style="grid-column:${book.event.col}; grid-row:${book.event.startRow}/${book.event.endRow};">
      ${book.status == "cancelled" ? `<span class="iconBtn" onclick="trashCancelled(this)"><i class="fa-regular fa-trash-can"></i></span>` : ``}
  </div>`);
};

function updateLegend(){
  document.querySelectorAll(".userLegend").forEach(leg => {
    leg.classList.add("displayNone");
  });
  container.querySelectorAll(".userMeeting").forEach(book => {
    const status = book.dataset.status;
    if(status){
      document.querySelector(`#${status}Legend`).classList.remove("displayNone");
    };
  });
};

function trashCancelled(thisOne){ //That is when they click on the trash button in the cancelled event in the calendar (see userTrashMeeting for when they click the trash button from the formContainer)
  const book = thisOne.parentElement;
  const bookingKey = book.dataset.bookingkey;
  storedBookings = storedBookings.filter(
    booking => booking.key !== bookingKey
  ); // or, more acuratly, keeps all the booking that doesn't have that bookingKey
  // const bookingIndex = storedBookings.findIndex(book => book.key == bookingKey);
  // storedBookings.splice(bookingIndex, 1);
  localStorage.meetAlixBookings = JSON.stringify(storedBookings);
  trashBookingInRTDB(bookingKey); // Check if it's still in the rtdb, and if it is, remove it there too
  book.remove();
};
window.trashCancelled = trashCancelled;

function eraseWeekArea(){
  let todayAreaDiv = document.querySelector(".todayArea");
  if(todayAreaDiv){
    todayAreaDiv.remove();
  };
  let nowAreaDiv = document.querySelector(".nowArea");
  if(nowAreaDiv){
    nowAreaDiv.remove();
  };
  let todayDayAreaDiv = document.querySelector(".todayDayArea");
  if(todayDayAreaDiv){
    todayDayAreaDiv.classList.remove("todayDayArea");
  };
  let unknownAreaDiv = document.querySelector(".unknownArea");
  if(unknownAreaDiv){
    unknownAreaDiv.remove();
  };
};

function eraseWeekEvent(){
  container.querySelectorAll(".weeklyEvent").forEach(we => {
    we.remove();
  });
  container.querySelectorAll(".weeklyMeal").forEach(we => {
    we.remove();
  });
  container.querySelectorAll(".weeklyBuffer").forEach(we => {
    we.remove();
  });
  container.querySelectorAll(".userMeeting").forEach(we => {
    we.remove();
  });
  document.querySelectorAll(".userLegend").forEach(we => {
    we.classList.add("displayNone");
  });
};

function updateWeek(){
  eraseWeekArea();
  eraseWeekEvent();
  //updateSleepAreas();
  let Dday = document.querySelector("#Dday").dataset.date; //wouldn't work if we haven't already set the date attribute...
  let Ddate = getDateFromString(Dday);
  putDatesInWeek(Ddate);
};

function getTodayDate(){
  let date = new Date();
  // let currentHour = String(date.getHours()).padStart(2, "0");
  // let currentMinute = String(date.getMinutes()).padStart(2, "0");
  // let currentTime = `${currentHour}:${currentMinute}`;
  // let currentDay = currentTime <= mySettings.myTomorrow ? (date.getDate() - 1) : date.getDate();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

function getSlashStringFromDate(date){
  let currentDate = String(date.getDate()).padStart(2, "0");
  let currentMonth = String(date.getMonth()+1).padStart(2, "0");
  let currentYear = date.getFullYear();

  return `${currentYear}/${currentMonth}/${currentDate}`;
};
function getDashStringFromDate(date){
  let currentDate = String(date.getDate()).padStart(2, "0");
  let currentMonth = String(date.getMonth()+1).padStart(2, "0");
  let currentYear = date.getFullYear();

  return `${currentYear}-${currentMonth}-${currentDate}`;
};

function getDateFromString(date){
  let dalA = date.slice(0, 4);
  let dalM = date.slice(5, 7);
  // let dalG = date.slice(8, 10);
  let dalG = meseDateCalc(date);
  return new Date(dalA, dalM - 1, dalG);
};

function meseDateCalc(date){
  return date.slice(8, 10);
};

function meseDayICalc(date){
  let dateHere = getDateFromString(date);
  return dateHere.getDay();
};

function roundFifteenArea(hour, min){
  if(min < 15 ){
    min = 0;
  } else if(min > 15 && min < 30){
    min = 15;
  } else if(min > 30 && min < 45){
    min = 30;
  } else if(min > 45){
    min = 45;
  } else{
    min = min;
  };
  return `${String(hour).padStart(2, "0")}-${String(min).padStart(2, "0")}`;
};



/* Form
Date full (mercredi, le 5 mars 2024)
De: (hour of the selected item) (can be changed between the the row-end of the previous event and 1 hour before the row-start of the next event)
À: (1 hour later) (can be changed between 1 hour after the row-end of the previous event and the row-start of the next event)
Name
Pronoun
Email or phone number or Messenger name
What would you like us to be doing during that time?
Where shall we mee?
  online Messenger
  online Google Meet
  in person
    any preferences?
  somewhere else:

Please consider prep & travel times as well as meals
Les zones blanches sont celles où je suis disponible... à sortir de chez moi. Donc si la zone blanche commence à 11h00, et bien n'espérez pas que je puisse être à l'autre bout de la ville à 11h!

*/

/*
const unavailableRanges = [
  { start: 40, end: 44 }, // 10:00 → 11:00
  { start: 52, end: 56 }, // 13:00 → 14:00
];
*/

/* LEGEND
  Slot = 15 minute increment
  Range = more than 1 slot
  WeeklyItem = the div that covers the 4 slots of a given hour

*/




function dateTimeToSlot({ dayIndex, hour, minute }) {
  const timeSlot = hour * 4 + minute / 15;
  return dayIndex * SLOTS_PER_DAY + timeSlot;
};

function slotToDateTime(slot) {
  const dayIndex = Math.floor(slot / SLOTS_PER_DAY);
  const timeSlot = slot % SLOTS_PER_DAY;
  const hour24 = Math.floor(timeSlot / 4);
  const minute = (timeSlot % 4) * 15;

  return { dayIndex, hour24, minute };
};

function slotToRow(slot) {
  const timeSlot = slot % SLOTS_PER_DAY;
  const hour24 = Math.floor(timeSlot / 4);
  const minute = (timeSlot % 4) * 15;

  return `row-${hour24}-${String(minute).padStart(2, "0")}`;
}

function slotToTime(slot) {
  const timeSlot = slot % SLOTS_PER_DAY;
  const hour24 = Math.floor(timeSlot / 4);
  const minute = (timeSlot % 4) * 15;

  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}






function checkNewDalleSlot(newStart, end){
  let overlap = false;
  let newStartSlot;
  for (const unavailable of unavailableRanges) {
    if(end > unavailable.end && 
      newStart <= unavailable.end
    ) {
      userSelection.topIsTouching = true;
      overlap = true;
      newStartSlot = unavailable.end;
    };
  };
  newStartSlot = overlap ? newStartSlot : newStart;
  return newStartSlot;
};

function checkNewAlleSlot(start, newEnd){
  let overlap = false;
  let newEndSlot;
  for (const unavailable of unavailableRanges) {
    if(start < unavailable.start && 
      newEnd >= unavailable.start
    ) {
      userSelection.bottomIsTouching = true;
      overlap = true;
      newEndSlot = unavailable.start;
    };
  };
  newEndSlot = overlap ? newEndSlot : newEnd;
  return newEndSlot;
};

function analyzeRelation(selected, unavailable) {
  
  // overlap
  if (
    selected.startSlot < unavailable.end &&
    unavailable.start < selected.endSlot
  ) { // overlap
    if(
      selected.startSlot > unavailable.start && 
      selected.endSlot < unavailable.end
    ) { // full overlap
      let conclusion = {
        relation: "fullOverlap"
      };
      return conclusion;
    } else {
      let relation = "partialOverlap";
      let startSlot = selected.startSlot < unavailable.start ? selected.startSlot : unavailable.end;
      let endSlot = selected.startSlot < unavailable.start ? unavailable.start : selected.endSlot;
      //let touch = selected.startSlot < unavailable.start ? "bottomIsTouching" : "topIsTouching"; //we shouldn't need that one if we analyzeTouch at the end
      let firstSlots = selected.startSlot < unavailable.start ? 4 : selected.endSlot - unavailable.end;
      let lastSlots = selected.startSlot < unavailable.start ? unavailable.start - selected.startSlot : 4;

      let conclusion = {relation, startSlot, endSlot, firstSlots, lastSlots};
      return conclusion;
    };
  };

  // // unavailable ends exactly where selection starts
  // if (unavailable.end === selected.startSlot) {
  //   let conclusion = {
  //     relation: "touching",
  //     touch: "topIsTouching"
  //   };
  //   return conclusion;
  // };

  // // unavailable starts exactly where selection ends
  // if (unavailable.start === selected.endSlot) {
  //   let conclusion = {
  //     relation: "touching",
  //     touch: "bottomIsTouching"
  //   };
  //   return conclusion;
  // };

  let conclusion = {
    relation: "separate"
  };
  return conclusion;

};

// function analyzeEdges(selected, edge) {
//   //top of the day
//   if (selected.startSlot === edge.start) {
//     return "topIsTouching";
//   };

//   //bottom of the day
//   if (selected.endSlot === edge.end) {
//     return "bottomIsTouching";
//   };

// };


function addMe(thisOne) {

  // --- 1. Build the clicked weeklyItem info
  let selectedWeeklyItemInfo = {
    // dayIndex: mySettings.myWeeksDayArray[thisOne.style.gridColumnStart - 2].day, THAT IS FOR WHEN WE'LL USE mySettings
    dayIndex: weeksDayArray[thisOne.style.gridColumnStart - 2].day,
    hour: (thisOne.style.gridRowStart / 4) + 10,
    minute: 0
  };
  // --- 2. Convert to slot index (15-min resolution)
  let startSlot = dateTimeToSlot(selectedWeeklyItemInfo);
  let preChosenDate = document.querySelector(`[data-dayindex="${selectedWeeklyItemInfo.dayIndex}"]`).dataset.date;
  let chosenDate = preChosenDate.replaceAll("/", "-");
  let selectedWeeklyItem = {
    date: chosenDate,
    dayIndex: selectedWeeklyItemInfo.dayIndex,
    col: weeksDayArray[thisOne.style.gridColumnStart - 2].code,
    startSlot: startSlot,
    endSlot: startSlot + 4 // 4 slots of 15 min to make the 1-hour weeklyItem
  };
  //console.log(selectedWeeklyItem);
  
  let tempSelection = userSelection;
  
  if (selectedWeeklyItem.startSlot < (tempSelection.endSlot - 4) &&
    selectedWeeklyItem.endSlot > (tempSelection.startSlot + 4) || //That's the click on the middle of the userMeeting
    selectedWeeklyItem.startSlot === tempSelection.startSlot && 
    selectedWeeklyItem.endSlot === tempSelection.endSlot //That's the same one, when there's only one
  ){
    formContainer.classList.remove("displayNone");
    formContainer.classList.add("expanded");
    return
  };

  // --- Make sure there aren't already one selected in another day
  if(tempSelection.dayIndex !== null && tempSelection.dayIndex !== selectedWeeklyItem.dayIndex){

    tempSelection.startSlot = null;
    tempSelection.endSlot = null;
    // tempSelection.topIsTouching = false;
    // tempSelection.bottomIsTouching = false;  // no need, we do it at the end
  };

  let firstSlots = 4;
  let lastSlots = 4;

  // --- 4. Check against unavailable ranges
  for (const unavailable of unavailableRanges) {

    const conclusion = analyzeRelation(selectedWeeklyItem, unavailable);    

    // 🚫 OVERLAP → stop immediately
    if (conclusion.relation === "fullOverlap") {
      //Since it's just when the user clicks (and not changes the time input), we just do nothing
      return;
    };

    if (conclusion.relation === "partialOverlap") {
      selectedWeeklyItem.startSlot = conclusion.startSlot;
      selectedWeeklyItem.endSlot = conclusion.endSlot;
      firstSlots = conclusion.firstSlots;
      lastSlots = conclusion.lastSlots;
    };

  };

  if(tempSelection.startSlot == null || tempSelection.endSlot == null){
    tempSelection.startSlot = selectedWeeklyItem.startSlot;
    tempSelection.endSlot = selectedWeeklyItem.endSlot;
  } else if(tempSelection.startSlot == selectedWeeklyItem.startSlot && tempSelection.endSlot == selectedWeeklyItem.endSlot) { // second click
    trashUserMeeting();
    return
  } else if(tempSelection.startSlot == selectedWeeklyItem.startSlot){
    tempSelection.startSlot = tempSelection.startSlot + firstSlots;
  } else if(tempSelection.endSlot == selectedWeeklyItem.endSlot){
    tempSelection.endSlot = tempSelection.endSlot - lastSlots;
  } else { // < or >
    const envelopes = checkEnvelope(Math.min(tempSelection.startSlot, selectedWeeklyItem.startSlot), Math.max(tempSelection.endSlot, selectedWeeklyItem.endSlot))
    if(envelopes){
      tempSelection.startSlot = selectedWeeklyItem.startSlot; // to restart it
      tempSelection.endSlot = selectedWeeklyItem.endSlot; // to restart it
    } else {
      if(tempSelection.startSlot < selectedWeeklyItem.startSlot){
        tempSelection.startSlot = tempSelection.startSlot;
      } else{
        tempSelection.startSlot = selectedWeeklyItem.startSlot;
      };
      if(tempSelection.endSlot < selectedWeeklyItem.endSlot){
        tempSelection.endSlot = selectedWeeklyItem.endSlot;
      } else{
        tempSelection.endSlot = tempSelection.endSlot;
      };
    };
  };

  // check if there is an unavailableRange IN the selection
  function checkEnvelope(startSlot, endSlot){
    let envelopes = false;
    for (const unavailable of unavailableRanges){
      if (
        startSlot < unavailable.start &&
        unavailable.end < endSlot
      ) {
        envelopes = true;
      };
    };
    return envelopes;
  };

  // analyze if tempSelection is touching any unavailableRanges
  tempSelection.topIsTouching = false;
  tempSelection.bottomIsTouching = false;
  for (const unavailable of unavailableRanges){

    if(unavailable.end === tempSelection.startSlot){
      tempSelection.topIsTouching = true;
    };

    if (unavailable.start === tempSelection.endSlot){
      tempSelection.bottomIsTouching = true;
    };      
  };
  
  // userSelection = tempSelection;
  userSelection.date = selectedWeeklyItem.date;
  userSelection.startSlot = tempSelection.startSlot;
  userSelection.startRow = slotToRow(tempSelection.startSlot);
  userSelection.endSlot = tempSelection.endSlot;
  userSelection.endRow = slotToRow(tempSelection.endSlot);
  userSelection.dayIndex = selectedWeeklyItem.dayIndex;
  userSelection.col = `col-${selectedWeeklyItem.col}`;
  userSelection.topIsTouching = tempSelection.topIsTouching; 
  userSelection.bottomIsTouching = tempSelection.bottomIsTouching;
  userSelection.uuid = tempSelection.uuid == "" ? crypto.randomUUID() : tempSelection.uuid;
  userSelection.status = formState.key ? getBooking(formState.key).status : "selected";
  updateSelectedTime();
  updateUserMeeting();
  formContainer.classList.remove("expanded"); // formContainer is technically already not expanded
  console.log(userSelection);

};
window.addMe = addMe;

function closeTheForm(){
  formContainer.classList.add("displayNone"); //we should update expanded (add or remove?)
  formContainer.classList.remove("expanded");
};
window.closeTheForm = closeTheForm;

function trashUserMeeting(){
  if(!formState.key){ // means it's a selected!
    container.querySelector(".selected").remove(); //or use uuid
  } else{
    const bookingKey = formState.key;
    // removing the userMeeting from the calendar
    container.querySelector(`[data-bookingkey="${bookingKey}"]`).remove();
    // removing it from storedBookings
    storedBookings.filter(
      booking => booking.key !== bookingKey
    ); // or, more acuratly, keeps all the booking that doesn't have that bookingKey
    // const bookingIndex = storedBookings.findIndex(book => book.key == bookingKey);
    // storedBookings.splice(bookingIndex, 1);
    localStorage.meetAlixBookings = JSON.stringify(storedBookings);
    // removing it from rtdb (if it's still there)
    trashBookingInRTDB(bookingKey);
  }; 

  // reset everything
  resetUserSelection();
  updateSelectedTime(); // resets formState and remove formContainer too since userSelection is now null 
  form.reset();
};
window.trashUserMeeting = trashUserMeeting;

async function trashBookingInRTDB(bookingKey){
  try {
    await remove(ref(rtdb, `meetAlix/${bookingKey}`));
    messageBox.innerHTML = confirmTrashMessage;
  } catch (err) {
    console.error("Failed to delete booking", err);
    messageBox.innerHTML = errorMessage;
  };
};

function updateUserMeeting(){ // if it's a pending that we are modifying, it should look like it (yellow but with dashed borders!)
  console.log(formState);
  let currentUserMeeting = formState.key && formState.key !== "" ? container.querySelector(`[data-bookingkey="${formState.key}"]`) : container.querySelector(`[data-uuid="${userSelection.uuid}"]`); // depending if we're updating a userMeeting or an existing booking
  console.log(currentUserMeeting);
  // let currentUserMeeting = container.querySelector(`[data-uuid="${userSelection.uuid}"]`);
  console.log("container:", container);
console.log("uuid:", userSelection.uuid);
console.log(
  "found:",
  container.querySelectorAll(
    `[data-uuid="${CSS.escape(userSelection.uuid)}" ]`
  )
);

  // console.log(currentUserMeeting);
  if(currentUserMeeting){currentUserMeeting.remove();};

  if(userSelection.date !== null && userSelection.startSlot !== null && userSelection.endSlot !== null){
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div 
      ${formState.key ? `data-bookingkey="${formState.key}"` : ``} data-status="${userSelection.status}" ${userSelection.uuid ? `data-uuid="${userSelection.uuid}"` : ``} class="userMeeting ${!formState.key ? `selected` : `${userSelection.status}`} modifying${userSelection.topIsTouching ? `  topIsTouching` : ``}${userSelection.bottomIsTouching ? ` bottomIsTouching` : ``}" style="grid-column:${userSelection.col}; grid-row:${userSelection.startRow}/${userSelection.endRow};"></div>`);
  };
};

function resetUserSelection(){
  userSelection.date = null;
  userSelection.startSlot = null;
  userSelection.startRow = null;
  userSelection.endSlot = null;
  userSelection.endRow = null;
  userSelection.dayIndex = null;
  userSelection.col = null;
  userSelection.topIsTouching = false;
  userSelection.bottomIsTouching = false;
  userSelection.status = "";
  userSelection.uuid = "";
};
function resetFormState() {
  Object.assign(
    formState,
    Object.fromEntries(
      Object.keys(formFields).map(key => [key, ""])
    )
  );
  delete formState.key;
};
// That code (up) basically does this (down): 
// function resetFormState(){ 
//   const tempFormState = Object.fromEntries( Object.keys(formFields).map(key => [key, ""]) ); 
//   Object.assign(formState, tempFormState); 
// };
// That code (up) basically does this (down): (no need to use structuredClone because nobody is using that tempFormState notebook anyway)
// function resetFormState(){
//   formState.date = "";
//   formState.dalle = "";
//   formState.alle = "";
//   formState.name = "";
//   formState.email = "";
//   formState.cell = "";
//   formState.messengerName = "";
//   formState.where = "";
//   formState.yourAddress = "";
//   formState.whereReal = "";
//   formState.why = "";
// };

function updateSelectedTime(){
  //Update selectedTime
  if(userSelection.startSlot == null || userSelection.endSlot == null){
    selectedTime.innerHTML = "";
    formContainer.classList.add("displayNone"); 
    formContainer.classList.remove("expanded"); //par principe, même si on le voit plus
    //reset everything to be sure
    resetUserSelection();
    resetFormState();
    //save to localStorage
    localStorage.meetAlixUserSelection = JSON.stringify(userSelection);
    localStorage.meetAlixFormState = JSON.stringify(formState);
  } else{
    formContainer.classList.remove("displayNone");
    let startDateTime = slotToDateTime(userSelection.startSlot);
    let endDateTime = slotToDateTime(userSelection.endSlot);

    
    let chosenDate = document.querySelector(`[data-dayindex="${startDateTime.dayIndex}"]`).dataset.date;
    const thatDay = new Date(chosenDate);
    

    // 1️⃣ Get weekday, month, day, year
    const weekday = thatDay.toLocaleDateString("en-US", { weekday: "long" });
    const month = thatDay.toLocaleDateString("en-US", { month: "long" });
    const day = thatDay.getDate();
    const year = thatDay.getFullYear();

    // 2️⃣ Get ordinal suffix (st, nd, rd, th)
    function getOrdinalSuffix(n) {
      if (n >= 11 && n <= 13) return "th";
      switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    }

    const suffix = getOrdinalSuffix(day);

    // --- TIME PART ---
    function formatTime24to12({ dayIndex, hour24, minute }) {

      const period = hour24 >= 12 ? "pm" : "am";
      const hour12 = hour24 % 12 || 12;
      const paddedMinutes = minute.toString().padStart(2, "0");

      return {
        hour24,
        hour12,
        paddedMinutes,
        period
      };
      // return `${hour12}:${paddedMinutes} ${period}`;
    }

    const startFormatted = formatTime24to12(startDateTime);
    const endFormatted   = formatTime24to12(endDateTime);


    // 3️⃣ Inject into HTML (with <sup>)
    // selectedTime.innerHTML = `
    //   ${weekday}, ${month} ${day}<sup>${suffix}</sup> ${year}
    //   <br>
    //   from ${startFormatted.hour12}:${startFormatted.paddedMinutes} ${startFormatted.period} to ${endFormatted.hour12}:${endFormatted.paddedMinutes} ${endFormatted.period}
    // `;
    selectedTime.innerHTML = t("summary_date_time", {
      weekday: weekday,
      month: month,
      day: day,
      suffix: suffix,
      year: year,
      startHour24: startFormatted.hour24,
      startHour12: startFormatted.hour12,
      startMinutes: startFormatted.paddedMinutes,
      startPeriod: startFormatted.period,
      endHour24: endFormatted.hour24,
      endHour12: endFormatted.hour12,
      endMinutes: endFormatted.paddedMinutes,
      endPeriod: endFormatted.period
    });
    // dateComplete.value = getDashStringFromDate(thatDay);
    inputs.date.value = getDashStringFromDate(thatDay); // same as inputs["date"].value ! but [] will be prefered when the key is a variable... for exemple: let dateVariable = "date" then inputs[dateVariable].value
    // dalleTime.value = `${startFormatted.hour24}:${startFormatted.paddedMinutes}`;
    inputs.dalle.value = `${startFormatted.hour24}:${startFormatted.paddedMinutes}`;
    // alleTime.value = `${endFormatted.hour24}:${endFormatted.paddedMinutes}`;
    inputs.alle.value = `${endFormatted.hour24}:${endFormatted.paddedMinutes}`;

    //update the formState
    formState.date = getDashStringFromDate(thatDay);
    formState.dalle = `${startFormatted.hour24}:${startFormatted.paddedMinutes}`;
    formState.alle = `${endFormatted.hour24}:${endFormatted.paddedMinutes}`;

    //save in localStorage
    localStorage.meetAlixUserSelection = JSON.stringify(userSelection);
    localStorage.meetAlixFormState = JSON.stringify(formState);
  };
};

function getBooking(bookingKey){
  return storedBookings.find((book) => book.key == bookingKey);
};

function openForm(thisOne){
  console.log("openForm");
  const book = thisOne;
  console.log(book);
  const bookingKey = book.dataset.bookingkey;
  console.log(bookingKey);
  // form.dataset.bookingkey = bookingKey;
  const booking = storedBookings.find((book) => book.key == bookingKey);
  console.log(booking);

  // Do we want to update userSelection too?!
  Object.assign(userSelection, structuredClone(booking.event));
  userSelection.status = booking.status;
  // In case there is already a userMeeting.selected, we need it removed
  container.querySelectorAll(".userMeeting.selected").forEach(we => {
    we.remove();
  });

  //update formState
  Object.assign(formState, structuredClone(booking.form));
  // That code (up) basically does this (down): (but it creates a deep copy/clone instead of sharing reference (in case of nested objects), so I get two notebook on the table instead of one with two post-its which would have been Object.assign(formState, booking.form);.)
  // formState.date = booking.form.date;
  // formState.dalle = booking.form.dalle;
  // formState.alle = booking.form.alle;
  // formState.name = booking.form.name;
  // formState.email = booking.form.email;
  // formState.cell = booking.form.cell;
  // formState.messengerName = booking.form.messengerName;
  // formState.whatsAppNumber = booking.form.whatsAppNumber;
  // formState.where = booking.form.where;
  // formState.yourAddress = booking.form.yourAddress;
  // formState.whereReal = booking.form.whereReal;
  // formState.why = booking.form.why;

  //Add the bookingKey to formState
  formState.key = bookingKey;

  console.log(formState);
  //Fill up the form
  for (const key in inputs) {
    if (formState[key] !== undefined) {
      // console.log(`${inputs[key]} : ${inputs[key].value}`);
      // console.log(formState[key]);
      if(inputs[key] instanceof NodeList){
        
        inputs[key].forEach(radio => {
          radio.checked = radio.value == formState[key] ? true : false;
        });
      } else{
       inputs[key].value = formState[key];
      };
    };
  };
// That code (up) basically does this (down):
  // dateComplete.value = booking.form.date;
  // dalleTime.value = booking.form.dalle;
  // alleTime.value = booking.form.alle;
  // nameInput.value = booking.form.name;
  // emailInput.value = booking.form.email;
  // cellInput.value = booking.form.cell;
  // messengerNameInput.value = booking.form.messengerName;
  // whatsAppNumberInput.value = booking.form.whatsAppNumber;
  // whereRadios.value = booking.form.where;
  // yourAddressInput.value = booking.form.yourAddress;
  // whereRealInput.value = booking.form.whereReal;
  // whyInput.value = booking.form.why;

  //selectedTime.innerHTML = "";
  updateSelectedTime(); // since we have userSelection, and, anyway, if the user changes time and date, it will update SelectedTime, so might as well already have it!
  submitBtn.innerText = "Save";
  //formContainer.classList.remove("displayNone"); //already in updateSelectedTime()
  formContainer.classList.add("expanded");
  
  
};
window.openForm = openForm;

const messageBox = document.querySelector("#messageBox");
const waitingMessage = `<div id="waitingMessage" class="message">
    <button class="iconBtn topRightCorner" onclick="removeMessage()">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <h2>Wait For It…</h2>
    <span class="typcn typcn-wine" style="font-size: 50px; line-height: 1em;"></span>
    <h6 style="margin-top: 0.5em; margin-bottom: 2em;">Like an hourglass<br />but quicker</h6>
  </div>`;
const confirmMessage = `<div id="confirmMessage" class="message">
    <button class="iconBtn topRightCorner" onclick="removeMessage()">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <h2>You did it!</h2>
    <h3 style="margin-bottom: 0;">Alright,<br/>so now that you did your part;<br/>all you've got to do is<br/>sit tight and wait for me to do mine…</h3>
    <h6 style="margin-top: 0;">Team work makes the dream works!</h6>
    <h2 style="color: var(--pending-border)">See you soon!<br/>🤗</h2>
  </div>`;
const confirmTrashMessage = `<div id="confirmTrashMessage" class="message">
    <button class="iconBtn topRightCorner" onclick="removeMessage()">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <h2>Well… I guess this is goodbye then.</h2>
    <h3>The whole thing have been erased.</h3>
    <h6>As if it never existed in the first place! 😶</h6>
  </div>`;
const errorMessage = `<div id="errorMessage" class="message">
    <button class="iconBtn topRightCorner" onclick="removeMessage()">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <h2>Oooops…</h2>
    <h3>Something went wrong.<br/>Please try again 🙃</h3>
    <h6>And if that still doesn't work, please let me know!</h6>
  </div>`;


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // --- 1. UI: waiting state ---
  submitBtn.disabled = true;
  messageBox.innerHTML = waitingMessage;

  // --- 2. Gather form data ---
  // const formData = new FormData(form);
  // const formState = Object.fromEntries(formData.entries());

  try {
    let thisBooking = {};
    let thisUserMeeting = "";
    // --- 2. Check if the booking already exists
    console.log(formState.key);
    if(formState.key){
      // find the booking index in storedBooking
      const bookingIndex = storedBookings.findIndex(book => book.key == formState.key);
      // update the booking in storedBooking
      storedBookings[bookingIndex].status = "pending";
      storedBookings[bookingIndex].event = structuredClone(userSelection);
      storedBookings[bookingIndex].form = structuredClone(formState);
      storedBookings[bookingIndex].timestamp = Date.now();
        // status: pending (even if it was confirmed)
        // on update juste event (userSelection), form (formState) (what should we do about formState.key?), and timestamp
      // update the booking in rtdb and catch
      await update(ref(rtdb, `meetAlix/${formState.key}`), {
        status: "pending",
        data: structuredClone(formState),
        timestamp: Date.now()
      });
      thisBooking = storedBookings[bookingIndex];
      thisUserMeeting = container.querySelector(`[data-bookingkey="${formState.key}"]`);
    } else{
      // --- 3. Push to RTDB and get the reference ---
      const newBookingRef = await push(ref(rtdb, "meetAlix"), {
        type: formType,
        status: "pending",
        data: structuredClone(formState),
        timestamp: Date.now()
      });

      const bookingKey = newBookingRef.key; // 🔑 THIS is the magic
      console.log(bookingKey);
      userSelection.status = "pending";

      // --- 4. Store booking locally ---
      thisBooking = {
        key: bookingKey,
        status: "pending",
        type: formType,
        event: structuredClone(userSelection),
        form: structuredClone(formState),
        timestamp: Date.now()
      };
      storedBookings.push(thisBooking);
      // thisUserMeeting = container.querySelector(".userMeeting.selected");
      thisUserMeeting = container.querySelector(`[data-uuid="${userSelection.uuid}"]`);
    };

    localStorage.setItem(
      "meetAlixBookings",
      JSON.stringify(storedBookings)
    );

    // --- 5. SUCCESS ---
    // Show confirmation message
    messageBox.innerHTML = confirmMessage;

    // Remove userMeeting
    console.log(thisUserMeeting);
    thisUserMeeting.remove();

    // and create a new one from storedBooking
    createWeeklyBook(thisBooking);
    // add the proper legend if it isn't already there
    updateLegend();
  

    // Erase and remove the form
    form.reset();
    formContainer.classList.add("displayNone"); 
    formContainer.classList.remove("expanded");

    // Reset userSelection and formState
    resetUserSelection();
    resetFormState();
    //save to localStorage the resetted userSelection and formState
    localStorage.meetAlixUserSelection = JSON.stringify(userSelection);
    localStorage.meetAlixFormState = JSON.stringify(formState);

  } catch (error) {
    // --- 6. FAILURE ---
    console.error("Booking failed:", error);

    messageBox.innerHTML = errorMessage;
    submitBtn.disabled = false;
  };
});

function removeMessage(){
  messageBox.innerHTML = "";
};
window.removeMessage = removeMessage;





  

  //Change the color of the selected range genre orange

  // Ajoute, dans la légende le carré orange et que ça veut dire "Keep Calm and Be Patient! I'm either in an existential crisis, stuck in traffic, or simply at work, or sleeping, or... In any case, you just got to wait!"

  const pendingLegendHTML = ``;
  const confirmedLegendHTML = ``;
  const cancelledLegendHTML = ``;






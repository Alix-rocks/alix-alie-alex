import { app, analytics, db, auth, provider, getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp, getAuth, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, onAuthStateChanged, rtdb, getDatabase, onChildAdded, ref, get, push, update, onValue, onChildChanged, onChildRemoved, remove } from "/myFirebase.js";

const SLOTS_PER_DAY = 49; // 24h * 2 slots/h + 1 slot (for after "midnight")

const openHour = 8; // les buffers sont comptés, donc ta première séance commence "avant: '1:00'" 1h après openHour
const openMin = 0;
const closeHour = 18; // les buffers sont comptés, donc ta dernière séance fini "apres: '1:00'" 1h avant closeHour
const closeMin  = 30;
const lang = document.documentElement.lang;
const langShort = lang.slice(0, 2);
let choix = {
  service: {},  // exemple: {id: "sv_1h00", h4: `Séance virtuelle<br>1&#8239;heure`, prix: 15, duree: "1:00", avant: "1:00", apres: "1:00"}
  nbSlots: 0,
  date: "",  // "2026-07-27"
  time: ""  // "9:00", "14:00", etc
};
let currentStep = 0;

// const seances = {
//   virtuelle: {
//     _1h00: {
//       h4: `Séance virtuelle<br>1&#8239;heure`,
//       prix: 15,
//       duree: "1:00",
//       avant: "1:00",
//       après: "1:00"
//     },
//     _1h30: {
//       h4: `Séance virtuelle<br>1&#8239;heure 30&#8239;min`,
//       prix: 30,
//       duree: "1:30",
//       avant: "1:00",
//       après: "1:00"
//     },
//     _2h00: {
//       h4: `Séance virtuelle<br>2&#8239;heures`,
//       prix: 45,
//       duree: "2:00",
//       avant: "1:00",
//       après: "1:00"
//     }
//   }
// };


const steps = [  
  {
    icon: `<i class="fa-solid fa-hourglass-half"></i>`,
    status: "doing", //(to do, doing, done)
    fr: {
      name: "Durée",
      definition: `Choix de la durée<br>de la séance`,
      result: ""
    },
    en:{
      name: "Duration",
      definition: "",
      result: ""
    }
  }, {
    icon: `<i class="fa-regular fa-calendar"></i>
    <i class="fa-regular fa-clock"></i>`,
    status: "todo", //(to do, doing, done)
    fr: {
      name: "Date et heure",
      definition: `Choix de la date<br>puis de l'heure`,
      result: ""
    },
    en:{
      name: "Date & Time",
      definition: "",
      result: ""
    }
  }, {
    icon: `<i class="fa-regular fa-address-card"></i>`,
    status: "todo", //(to do, doing, done)
    fr: {
      name: "Profil",
      definition: `Informations personnelles<br>et consentements`,
      result: ""
    },
    en:{
      name: "Profil",
      definition: "",
      result: ""
    }
  }, {
    icon: `<i class="fa-solid fa-hand-holding-dollar"></i>`,
    status: "todo", //(to do, doing, done)
    fr: {
      name: "Contribution",
      definition: `Possibilité de faire une<br>contribution volontaire`,
      result: ""
    },
    en:{
      name: "Contribution",
      definition: "Volontary Contribution",
      result: ""
    }
  }, {
    icon: `<i class="fa-regular fa-credit-card"></i>`,
    status: "todo", //(to do, doing, done)
    fr: {
      name: "Paiement",
      definition: `Paiement<br>de la séance`,
      result: ""
    },
    en:{
      name: "Payment",
      definition: "",
      result: ""
    }
  }
];



const seances = {
  virtuelle: [
    {
      id: "sv_1h00",
      h4: `Séance virtuelle<br>1&#8239;heure`,
      prix: 15,
      duree: "1:00",
      avant: "1:00",
      apres: "1:00"
    },
    {
      id: "sv_1h30",
      h4: `Séance virtuelle<br>1&#8239;heure 30&#8239;min`,
      prix: 30,
      duree: "1:30",
      avant: "1:00",
      apres: "1:00"
    },
    {
      id: "sv_2h00",
      h4: `Séance virtuelle<br>2&#8239;heures`,
      prix: 45,
      duree: "2:00",
      avant: "1:00",
      apres: "1:00"
    }
  ]
};

const openingSlotInfo = {
  hour: openHour,
  minute: openMin
};
const openingSlot = timeToSlot(openingSlotInfo);
const closingSlotInfo = {
  hour: closeHour,
  minute: closeMin
};
const closingSlot = timeToSlot(closingSlotInfo);
const opened = {
  start: openingSlot,
  end: closingSlot
};
const closed = [
  {
    start: 0,
    end: openingSlot
  },
  {
    start: closingSlot,
    end: SLOTS_PER_DAY
  }
];
let myBusies = [];
let unknownStartDate = ""; //The day the "Not sure yet" section starts
let nextKnownDate = "";

const today = new Date();
const todayString = getDashStringFromDate(today);
console.log(today);
let first = new Date();
first.setDate(today.getDate() - today.getDay());
console.log(first);
let last = new Date();
// last.setDate(today.getDate() + 21 + (6 - today.getDay()));
last.setDate(first.getDate() + 27);
console.log(last);
let yearFirst = first.getFullYear();
let yearLast = last.getFullYear();
// let monthFirst = date.getMonth();
let monthNameFirst = first.toLocaleString(lang, { month: 'long' }).toLocaleUpperCase();
let monthNameLast = last.toLocaleString(lang, { month: 'long' }).toLocaleUpperCase();

//MARK: START

const bookingDiv = document.querySelector("#booking");
const service = seances?.[bookingDiv.dataset.service];
const progressSection = document.createElement("div");
progressSection.className = "progress-section";
const bookingSection = document.createElement("div");
bookingCreator();

function bookingCreator(){
  bookingDiv.append(progressSection, bookingSection);
  createProgress();
  createDuree();
};

function updateProgress(){
  steps.forEach((s, idx) => {
    if(idx < currentStep){
      s.status = "done";
    } else if(idx === currentStep){
      s.status = "doing";
    } else if(idx > currentStep){
      s.status = "todo";
    } else{
      console.log("oups, currentStep is... " + currentStep)
      s.status = "todo";
    };
  });
  createProgress();
};

function createProgress(){
  progressSection.innerHTML = steps.map((s, idx) => {
    return `<div>
      <div>
        <div class="progress-bar progress-bar-start${idx === 0 ? ` progress-bar-none` : ``}"></div>
        <div class="icon-set ${s.status}">
          ${s.icon}
          <i class="fa-solid fa-circle"></i>
          <i class="fa-solid fa-circle-check"></i>
          <i class="fa-regular fa-circle"></i>
        </div>
        <div class="progress-bar progress-bar-end${idx === steps.length - 1 ? ` progress-bar-none` : ``}"></div>
      </div>
      <h4>${s?.[langShort].name}</h4>
      <p>${s.status === "todo" ? `` : s.status === "doing" ? s?.[langShort].definition : s.status === "done" ? s?.[langShort].result : ``}</p>
    </div>`;
  }).join("");
};

//MARK: STEP 0 - DUREE

function createDuree(){
  // const bookingSection = document.querySelector("#booking");
  bookingSection.className = "booking-step1-Flex";
  bookingSection.innerHTML = service.map(type => {
    return `<div>
      <h4>${type.h4}</h4>
      <p>${type.prix} $</p>
      <button class="reserver" data-id="${type.id}">Réserver</button>
    </div>`;
  }).join("");
  currentStep = 0;
  addServiceListener();
};
 
function addServiceListener(){
  bookingSection.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      console.log(btn.value);
      choix.service = service.find(type => type.id === btn.dataset.id);
      choix.nbSlots = threeTimesAdditionToSlots(choix.service.duree, choix.service.avant, choix.service.apres);
      console.log(choix.nbSlots);

      steps[currentStep]?.[langShort]?.result = choix.service.result;
      updateProgress();
      createCalendar();
      addDayListeners();
    });
  });
};

//MARK: STEP 1 - DATE

function createCalendar(){
  bookingSection.className = "booking-step2-Grid";
  const nomRows = "[row-M-Y] 1fr [row-D] 1fr [row-0] 1fr [row-1] 1fr [row-2] 1fr [row-3] 1fr [row-4]";
  const nomCols = "[col-0] 1fr [col-1] 1fr [col-2] 1fr [col-3] 1fr [col-4] 1fr [col-5] 1fr [col-6] 1fr [col-7]"
  bookingSection.style.gridTemplateRows = nomRows;
  bookingSection.style.gridTemplateColumns = nomCols;
  let arrayItem = [];
  const row_M_Y = `<div class="row-M-Y">${yearFirst === yearLast && monthNameFirst === monthNameLast ? `${monthNameFirst} ${yearFirst}` : `${monthNameFirst} ${yearFirst} / ${monthNameLast} ${yearLast}`}</div>`;
  arrayItem.push(row_M_Y);
  let day = new Date(first);
  console.log(day);
  for(let d = 0; d < 7; d++){
    let div = `<div class="row-D col-${d}">${new Intl.DateTimeFormat(lang, { weekday: "narrow"}).format(day)}</div>`;
    arrayItem.push(div);
    day.setDate(day.getDate() + 1);
  };
  console.log(first);
  day = new Date(first);
  console.log(day);
  let c = 0;
  let r = 0;
  for(let d = 0; d < 28; d++){
    c = c < 7 ? c : 0;
    let date = getDashStringFromDate(day);
    // let date = day.toDateString(); // "Sat Aug 22 2026"
    let availClass = availCheck(date) && date > todayString ? "available" : "not-available";
    let div = `<button ${availClass === "available" ? `` : `disabled`} class="row-${r} col-${c} ${availClass}${date === todayString ? " today" : ""}" data-date="${date}">${day.getDate()}</button>`;
    arrayItem.push(div);
    day.setDate(day.getDate() + 1);
    c++;
    r++;
  };
  let arrayItems = arrayItem.join("");
  bookingSection.innerHTML = arrayItems;
  currentStep = 1;
};

function addDayListeners(){
  bookingSection.querySelectorAll(".available").forEach(a => {
    a.addEventListener("click", () => {
      const date = a.dataset.date;
      choix.date = date;
      choix.date_result = formattedDate(date);

      steps[currentStep]?.[langShort]?.result = choix.date_result;
      updateProgress();
      createListTime(date);
      addTimeListeners();
    });
  });
};

//MARK: STEP 1 - TIME

function createListTime(date){
  let myDateBusiesSlots = getMyDateBusiesSlots(date);
  let availableSlots = getAvailableSlots(myDateBusiesSlots);

  bookingSection.className = "booking-step3-Flex";
  bookingSection.innerHTML = availableSlots.map(slot => {
    let slotTime = slotToTime(slot);
    console.log(slotTime);
    let avant = choix.service.avant;
    let startTime = timeMath(slotTime, "plus", avant);
    console.log(startTime);
    let duree = choix.service.duree;
    let endTime = timeMath(startTime, "plus", duree)
    console.log(endTime);
    let text = ``;
    if(lang === "en-CA"){
      const [startH, startM] = startTime.split(":").map(Number);
      const startFormatted = formatTime24to12({
        hour24: startH, 
        minute: startM
      });
      const [endH, endM] = endTime.split(":").map(Number);
      const endFormatted   = formatTime24to12({
        hour24: endH, 
        minute: endM
      });
      text = `${startFormatted.hour12}:${startFormatted.paddedMinutes} ${startFormatted.period} to ${endFormatted.hour12}:${endFormatted.paddedMinutes} ${endFormatted.period}`;
    } else{
      text = `${startTime.replace(":", "h")} à ${endTime.replace(":", "h")}`;
    };        
    return `<button class="time" data-time="${startTime}">${text}</button>`;
  }).join("");
  currentStep = 1;
};

function addTimeListeners(){
  bookingSection.querySelectorAll(".time").forEach(t => {
    t.addEventListener("click", () => {
      const time = t.dataset.time;
      choix.time = time;
      choix.time_result = formattedTime(time);

      steps[currentStep]?.[langShort]?.result = `${choix.date_result} ${choix.time_result}`;
      updateProgress();
      // Create the form!
    })
  })
};

//MARK: STEP 2 - PROFIL






//MARK: STEP 3 - PAYMENT






//MARK: OTHER FUNCTIONS
function timeToSlot({ hour, minute }) {
  return hour * 2 + minute / 30;
};

function threeTimesAdditionToSlots(one, two, three){
  let date = new Date();
  const [oneH, oneM] = one.split(":").map(Number);
  date.setHours(oneH);
  date.setMinutes(oneM);
  const [twoH, twoM] = two.split(":").map(Number);
  const [threeH, threeM] = three.split(":").map(Number);
  date.setHours(date.getHours() + twoH + threeH);
  let hours = date.getHours();
  date.setMinutes(date.getMinutes() + twoM) + threeM;
  let minutes = date.getMinutes();
  return (hours * 60 + minutes) / 30;
};

function timeMath(one, math, two){
  let date = new Date();
  const [oneH, oneM] = one.split(":").map(Number);
  date.setHours(oneH);
  date.setMinutes(oneM);
  const [twoH, twoM] = two.split(":").map(Number);
  if(math == "minus"){
    date.setHours(date.getHours() - twoH);
    date.setMinutes(date.getMinutes() - twoM);
  } else if(math == "plus"){    
    date.setHours(date.getHours() + twoH);
    date.setMinutes(date.getMinutes() + twoM);
  };
  return `${String(date.getHours())}:${String(date.getMinutes()).padStart(2, "0")}`;
};

function slotToTime(slot){
  const timeSlot = slot % SLOTS_PER_DAY;
  const hour24 = Math.floor(timeSlot / 2);
  const minute = (timeSlot % 2) * 30;

  return `${String(hour24)}:${String(minute).padStart(2, "0")}`;
};

function formatTime24to12({ hour24, minute }) {
  const period = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 || 12;
  const paddedMinutes = minute.toString().padStart(2, "0");
  return {
    hour12,
    paddedMinutes,
    period
  };
;}

function getDashStringFromDate(date){
  let currentDate = String(date.getDate()).padStart(2, "0");
  let currentMonth = String(date.getMonth()+1).padStart(2, "0");
  let currentYear = date.getFullYear();

  return `${currentYear}-${currentMonth}-${currentDate}`;
};

function availCheck(date){
  console.log(date);
  let myDateBusiesSlots = getMyDateBusiesSlots(date);
  console.log(myDateBusiesSlots);
  if(myDateBusiesSlots.length === 0) return true; // if there's no busies at all, then the day is available, so we return true
  // 1. check if any are full day long
  const isFullDayLong = myDateBusiesSlots.some(m => m.start <= opened.start && m.end >= opened.end); // checks them all and return true if at least one of them respects the argument
  if(isFullDayLong) return false; // if isFullDayLong is true, that means the whole day is not-available, so we return false
  console.log("not full day");
  // 2. then check for each opened slot
  let availableSlots = getAvailableSlots(myDateBusiesSlots);
  console.log(availableSlots);
  if(availableSlots.length > 0) return true;
};

function getMyDateBusiesSlots(date){
  let myDateBusies = myBusies.filter(d => d.date === date);
  console.log(myDateBusies);
  let myDateBusiesSlots = myDateBusies.map(m => {
    let startSlotInfo = {
      hour: m.startHour,
      minute: m.startMinute
    };
    const startSlot = timeToSlot(startSlotInfo);
    let endSlotInfo = {
      hour: m.endHour < m.startHour ? 24 : m.endHour,
      minute: m.endMinute
    };
    const endSlot = timeToSlot(endSlotInfo);
    return {
      start: startSlot,
      end: endSlot
    };
  });
  return myDateBusiesSlots;
};

function getAvailableSlots(myDateBusiesSlots){
  let availableSlots = [];
  for(let s = opened.start; s < (opened.end + 1 - choix.nbSlots); s++){
    console.log(s);
    let testEnd = s + choix.nbSlots;
    let isSlotBusy = myDateBusiesSlots.some(m => m.start < testEnd && m.end > s);
    if(!isSlotBusy){
      availableSlots.push(s);
    };
  };
  return availableSlots;
};

function formattedDate(date){
  let formattedDate;
  if(lang === "en-CA"){

  } else{

  };
  return formattedDate;
};
function formattedTime(time){
  let formattedTime;
  if(lang === "en-CA"){

  } else{

  };
  return formattedTime;
};


//MARK: RTDB - ALIX.ROCKS
//async function addListeners() {
  onValue(ref(rtdb, "meetAlix/myBusies"), snapshot => {
  
    if (!snapshot.exists()) {
      myBusies = [];
      return;
    };
  
    let myNewBusies = Object.entries(snapshot.val()).map(([key, value]) => ({
      key,
      ...value
    }));
    //console.log(myBusies);
    //console.log(myNewBusies);
  
    if(myBusies == ""){
      console.log("debut!");
      myBusies = myNewBusies;
      console.log(myBusies);
      return; 
    } else if (JSON.stringify(myBusies) === JSON.stringify(myNewBusies)) {
      console.log("pareil!");
      console.log(myBusies);
      return; 
    } else{
      myBusies = myNewBusies;
      console.log(myBusies);
      //updateCurrentWeek(); //eraseWeekEvent(); getThisWeekStuffAndUnavailableRanges(); putShowsInWeek();
    };
    
  
    
  });
  
  onValue(ref(rtdb, "meetAlix/myBlurryDate"), snapshot => {
  
    if (!snapshot.exists()) {
      return;
    };
  
    if(unknownStartDate == ""){
      unknownStartDate = snapshot.val();
    } else{
      unknownStartDate = snapshot.val();
      updateCurrentWeek(); //eraseWeekEvent(); getThisWeekStuffAndUnavailableRanges(); putShowsInWeek();
    };
  });

  
  onValue(ref(rtdb, "meetAlix/myNetDate"), snapshot => {
  
    if (!snapshot.exists()) {
      return;
    };
    if(nextKnownDate == ""){
      nextKnownDate = snapshot.val();
    } else{
      nextKnownDate = snapshot.val();
      updateCurrentWeek(); //eraseWeekEvent(); getThisWeekStuffAndUnavailableRanges(); putShowsInWeek();
    };
  
  });

//};

initApp();


async function initApp() {
  //await addListeners();
    // await loadMyBusies();
    // await getBlurryDate();
    // await getNetDate();
  // createCalendar();
  document.body.style.visibility = "visible";
};
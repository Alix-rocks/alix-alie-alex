import { app, analytics, db, auth, provider, getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp, getAuth, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "../../myFirebase.js";

let unknownStartDate = "2026-01-24"; //The day the "Not sure yet" section starts


let myEmail = "alexblade.23.49@gmail.com";

let myBusies = [];
let unavailableRanges = [];

let weeksDayArray = [{
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
}]

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
      ${c > 1 ? `>${weeksDayArray[c - 2].letter}<br /><span class="weeklyDateSpan"></span>` : `>`}
    </div>`;
    arrayC.push(rowDay);
    let line = 4;
    for(let r = 1; r < 14; r++){ // 13 weeklyItem per day (because it starts at 11:00 and ends at 24:00)
      let item = `<div class="weeklyItem${c > 1 ? `" onclick="addMe(this)` : ` unavailable`}" style="grid-column:${c}; grid-row:${line} / ${line + 4};${c == 1 ? " border-radius:2px 0 0 2px; border-right:1px solid rgba(47, 79, 79, .5);" : ""}">${c == 1 ? `${String(myDay).padStart(2, "0")}:00` : ``}</div>`; 
      arrayC.push(item);
      line += 4;
      myDay++;
    };
    let lastWeeklyItem = `<div class="weeklyItem unavailable invisible" style="grid-column:${c}; grid-row:56 / 57;"></div>`;
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
  for(let h = 0; h < 13; h++){ //93
    let rowH = `[row-${String(myDay).padStart(2, "0")}-00${h == 0 ? ` row-Day-end` : ``}] minmax(0, .25fr)`;
    let rowH15 = `[row-${String(myDay).padStart(2, "0")}-15] minmax(0, .25fr)`;
    let rowH30 = `[row-${String(myDay).padStart(2, "0")}-30] minmax(0, .25fr)`;
    let rowH45 = `[row-${String(myDay).padStart(2, "0")}-45] minmax(0, .25fr)`;
    nomiRow.push(rowH, rowH15, rowH30, rowH45);
    myDay++;
  };
  let firstRows = `[row-Year] 1fr [row-Month] 1fr [row-Day] 1.5fr`;
  let lastLine = `[row-24-00] minmax(0, 0) [row-end]`;
  nomiRow.unshift(firstRows);
  nomiRow.push(lastLine);
  let nomiRows = nomiRow.join(" ");
  let container = document.querySelector(".weeklyContainer");
  container.style.gridTemplateRows = nomiRows;
  container.style.gridTemplateColumns = nomiCols;
  
  //arrayItem.push(todayArea);
  let arrayItems = arrayItem.join("");
  container.innerHTML = arrayItems;

  let date = new Date();
  let dayIdx = date.getDay();
  date.setDate(date.getDate() - dayIdx);
  putDatesInWeek(date); //includes getMyThisWeekBusiesAndUnavailableRanges(Dday, Sday); AND putShowsInWeek();
  document.querySelector("#weekBackward").addEventListener("click", () => {
    eraseWeekArea();
    eraseWeekEvent();
    let Dday = document.querySelector("#Dday").dataset.date;
    let Ddate = getDateFromString(Dday);
    Ddate.setDate(Ddate.getDate() - 7);
    putDatesInWeek(Ddate); //includes getMyThisWeekBusiesAndUnavailableRanges(Dday, Sday); AND putShowsInWeek();
  });
  document.querySelector("#weekForward").addEventListener("click", () => {
    eraseWeekArea();
    eraseWeekEvent();
    let Sday = document.querySelector("#Sday").dataset.date;
    let Sdate = getDateFromString(Sday);
    Sdate.setDate(Sdate.getDate() + 1);
    putDatesInWeek(Sdate); //includes getMyThisWeekBusiesAndUnavailableRanges(Dday, Sday); AND putShowsInWeek();
  });
};

function fromMyThisWeekBusiesToUnavailableRanges(){
  unavailableRanges = myThisWeekBusies.map(busy => {
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
    return {
      start: startSlot,
      end: endSlot
    };
  });
  console.log(unavailableRanges);
}; 


function putDatesInWeek(date){
  let arrayDate = [];
  for(let d = 0; d < 7; d++){
    let thisDate = {
      date: String(date.getDate()),
      full: getStringFromDate(date)
    };
    arrayDate.push(thisDate);
    date.setDate(date.getDate() + 1);
  };
  let i = 0;
  document.querySelectorAll(".weeklyDateSpan").forEach(span => {
    span.innerHTML = arrayDate[i].date;
    span.parentElement.setAttribute("data-date", arrayDate[i].full);
    i++;
  });
  let today = getTodayDate();
  let dayIdx = meseDayICalc(today);
  const test = arrayDate.some(el => (el.full == today));
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
    document.querySelector("#weekBackward").classList.add("invisible");
  } else{
    document.querySelector("#weekBackward").classList.remove("invisible");
  };
  //updateSleepAreas();

// MARK: unknownDate
// See line 5 for the unknownStartDate
  
  let unknownArea;
  console.log(arrayDate);
  const unknownTestIn = arrayDate.some(el => (el.full == unknownStartDate));
  if(unknownTestIn){
    let unknownStartIdx = meseDayICalc(unknownStartDate);
    let unknownStart = `${weeksDayArray[unknownStartIdx].day}`;
    unknownArea = `<div class="unknownArea" style="grid-row: row-Day / row-end; grid-column: col-${unknownStart} / col-end">Not sure yet!</div>`;
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", unknownArea);
  };
  const unknownTestAfter = unknownStartDate < arrayDate[0].full ? true : false;
  if(unknownTestAfter){
    unknownArea = `<div class="unknownArea" style="grid-row: row-Day / row-end; grid-column: col-start / col-end">Not sure yet!</div>`;
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", unknownArea);
  };
  

  let Dday = arrayDate[0].full;
  let Sday = arrayDate[arrayDate.length - 1].full;
  let Ddate = getDateFromString(Dday);
  let Sdate = getDateFromString(Sday);
  let DYear = Ddate.getFullYear();
  let SYear = Sdate.getFullYear();
  let DMonthName = Ddate.toLocaleString('fr-CA', { month: 'long' }).toLocaleUpperCase();
  let SMonthName = Sdate.toLocaleString('fr-CA', { month: 'long' }).toLocaleUpperCase();
  document.querySelector("#weeklyYearSpan").innerHTML = `${DYear}${DYear !== SYear ? ` / ${SYear}` : ``}`;
  document.querySelector("#weeklyMonthSpan").innerHTML = `${DMonthName}${DMonthName !== SMonthName ? ` / ${SMonthName}` : ``}`;
  getMyThisWeekBusiesAndUnavailableRanges(Dday, Sday);
  putShowsInWeek();
};





function updateSleepAreas(){
  document.querySelectorAll(".sleepArea").forEach(we => {
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
function getMyThisWeekBusiesAndUnavailableRanges(Dday, Sday){
  myThisWeekBusies = myBusies.filter(busy =>
    Dday <= busy.date && busy.date <= Sday
  );
  console.log(myThisWeekBusies);

  fromMyThisWeekBusiesToUnavailableRanges();
};

function putShowsInWeek() {
  myThisWeekBusies.forEach(busy => {
    createWeeklyshow(busy);
  });
};



function createWeeklyshow(busy){
  document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div class="weeklyBuffer" style="grid-column:col-${busy.col}; grid-row:row-${busy.start}/row-${busy.end};"></div>`);
  if(busy.meal){
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div class="weeklyMeal" style="grid-column:col-${busy.col}; grid-row:row-${busy.start}/span 6;">Meal</div>`);
  };
};

function eraseWeekArea(){
  let todayAreaDiv = document.querySelector(".todayArea");
  if(todayAreaDiv){
    todayAreaDiv.remove();
  };
  let nowAreaDiv = document.querySelector(".nowArea");
  if(nowAreaDiv){
    nowAreaDiv.remove();
  };
  let unknownAreaDiv = document.querySelector(".unknownArea");
  if(unknownAreaDiv){
    unknownAreaDiv.remove();
  };
};

function eraseWeekEvent(){
  document.querySelectorAll(".weeklyEvent").forEach(we => {
    we.remove();
  });
  document.querySelectorAll(".weeklyMeal").forEach(we => {
    we.remove();
  });
  document.querySelectorAll(".weeklyBuffer").forEach(we => {
    we.remove();
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

function getStringFromDate(date){
  let currentDate = String(date.getDate()).padStart(2, "0");
  let currentMonth = String(date.getMonth()+1).padStart(2, "0");
  let currentYear = date.getFullYear();
  let currentFullDate = `${currentYear}-${currentMonth}-${currentDate}`;
  return currentFullDate;
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



const SLOTS_PER_DAY = 97; // 24h * 4 slots/h + 1 slot (for after "midnight")

function dateTimeToSlot({ dayIndex, hour, minute }) {
  const timeSlot = hour * 4 + minute / 15;
  return dayIndex * SLOTS_PER_DAY + timeSlot;
};

function slotToDateTime(slot) {
  const dayIndex = Math.floor(slot / SLOTS_PER_DAY);
  const timeSlot = slot % SLOTS_PER_DAY;
  const hour = Math.floor(timeSlot / 4);
  const minute = (timeSlot % 4) * 15;

  return { dayIndex, hour, minute };
};

// Now we need a function that will identify the corresponding weeklyItem to a slot/{dayIndex, hour, minute}

const userSelection = {
  startSlot: null,
  endSlot: null
};
// userSelection.startSlot = ;
// userSelection.endSlot = ;

// function rangesOverlap(a, b) {
//  return a.startSlot < b.endSlot && b.startSlot < a.endSlot;
// } 

const allTheEdges = []
for(let d = 0; d < 7; d++){
  let startSlotInfo = {
    dayIndex: d,
    hour: 11,
    minute: 0
  };
  let startSlot = dateTimeToSlot(startSlotInfo);

  let endSlotInfo = {
    dayIndex: d,
    hour: 24,
    minute: 0
  };
  let endSlot = dateTimeToSlot(endSlotInfo);

  let daySlots = {
    start: startSlot,
    end: endSlot
  };

  allTheEdges.push(daySlots);
};


function analyzeRelation(selected, unavailable) {
  
  // overlap
  if (
    selected.startSlot < unavailable.end &&
    unavailable.start < selected.endSlot
  ) {
    return "overlap";
  };

  // unavailable ends exactly where selection starts
  if (unavailable.end === selected.startSlot) {
    return "topIsTouching";
  };

  // unavailable starts exactly where selection ends
  if (unavailable.start === selected.endSlot) {
    return "bottomIsTouching";
  };

  return "separate";
};

function analyzeEdges(selected, edge) {
  //top of the day
  if (selected.startSlot === edge.start) {
    return "topIsTouching";
  };

  //bottom of the day
  if (selected.endSlot === edge.end) {
    return "bottomIsTouching";
  };

};


function addMe(thisOne) {

  if(thisOne.classList.contains("selected")){
    thisOne.classList.remove("selected"); // Although you still need to update the userSelection... but if thisOne is in the middle... then we'll have a hole! So, do we only unselect if it's at start or end, or do we unselect the whole thing?
  };

  // --- 1. Build the clicked weeklyItem info
  let selectedWeeklyItemInfo = {
    // dayIndex: mySettings.myWeeksDayArray[thisOne.style.gridColumnStart - 2].day, THAT IS FOR WHEN WE'LL USE mySettings
    dayIndex: weeksDayArray[thisOne.style.gridColumnStart - 2].day,
    hour: (thisOne.style.gridRowStart / 4) + 10,
    minute: 0
  };
  // --- 2. Convert to slot index (15-min resolution)
  let startSlot = dateTimeToSlot(selectedWeeklyItemInfo);
  let selectedWeeklyItem = {
    startSlot: startSlot,
    endSlot: startSlot + 4 // 4 slots of 15 min to make the 1-hour weeklyItem
  };
  console.log(selectedWeeklyItem);
  
  // --- 3. Reset touching classes (important when clicking multiple times)
  thisOne.classList.remove("topIsTouching", "bottomIsTouching");

  // --- 4. Check against unavailable ranges
  for (const unavailable of unavailableRanges) {

    const relation = analyzeRelation(selectedWeeklyItem, unavailable);    

    // 🚫 OVERLAP → stop immediately
    if (relation === "overlap") {
      //Since it's just when the user clicks (and not changes the time input), we just do nothing
      return;
    };

    // ⬆️ touching before
    if (relation === "topIsTouching") {
      thisOne.classList.add("topIsTouching");
    };

    // ⬇️ touching after
    if (relation === "bottomIsTouching") {
      thisOne.classList.add("bottomIsTouching");
    };
  };

  for (const edge of allTheEdges) {
    const edging = analyzeEdges(selectedWeeklyItem, edge);

    // ⬆️ touching start of day
    if (edging === "topIsTouching") {
      thisOne.classList.add("topIsTouching");
    };

    // ⬇️ touching end of day
    if (edging === "bottomIsTouching") {
      thisOne.classList.add("bottomIsTouching");
    };
  }

  // --- 5. If we reach here, selection is valid
  thisOne.classList.add("selected");

  let tempSelection = userSelection;

  if(tempSelection.startSlot == null){
    tempSelection.startSlot = selectedWeeklyItem.startSlot;
  // } else if(tempSelection.startSlot < selectedWeeklyItem.startSlot && Math.abs(selectedWeeklyItem.startSlot - tempSelection.startSlot) > 4){
  } else {
    let diff = Math.abs(selectedWeeklyItem.startSlot - tempSelection.startSlot);
    if(tempSelection.startSlot < selectedWeeklyItem.startSlot){
      tempSelection.startSlot = tempSelection.startSlot;
    } else {
      tempSelection.startSlot = selectedWeeklyItem.startSlot;
    };
    if(diff > 4){
          console.log(diff);
      console.log("fillInTheBlanksStart");
    } else if (diff == 0){
      console.log("same one!");
      thisOne.classList.remove("selected");
    };
  };
    
    
    

  if(tempSelection.endSlot == null){
    tempSelection.endSlot = selectedWeeklyItem.endSlot;
  // } else if(tempSelection.endSlot < selectedWeeklyItem.endSlot && Math.abs(selectedWeeklyItem.endSlot - tempSelection.endSlot) > 4){
  } else {
    let diff = Math.abs(selectedWeeklyItem.endSlot - tempSelection.endSlot);
    if(tempSelection.endSlot < selectedWeeklyItem.endSlot){
    console.log("temp < selected END") 
      tempSelection.endSlot = selectedWeeklyItem.endSlot;
    } else {
      tempSelection.endSlot = tempSelection.endSlot;
    };

    if(diff > 4){
        console.log(diff);
      console.log("fillInTheBlanksEnd");
    } else if (diff == 0){
      console.log("same one!");
      thisOne.classList.remove("selected"); //C'est pas assez... ça marche pas dans toutes les circonstances
      // Et il faut updater le tempSelection! Est-ce qu'on fait juste endSlot - 4 ?? (et startSlot + 4, dans l'autre cas)
    };
  };
  if (selectedWeeklyItem.startSlot < tempSelection.end &&
    tempSelection.start < selectedWeeklyItem.endSlot){
      console.log("NEW same one!");
      thisOne.classList.remove("selected");
    };

  //You've got blanks to fill, ONLY if both start and end say "fillInTheBlanks"
      
     //On a le numéro du slot vide (ou du moins on peut le trouver...). Il faut juste, de un, s'assurer qu'il s'agit du premier slot d'une heure (minute = 00 et non 15, 30 ou 45) et convertir le numéro de slot en grid-row-start et le dayIndex en grid-column-start puis faire un queryselector...

      
      

  // tempSelection.startSlot = tempSelection.startSlot == null ? selectedWeeklyItem.startSlot : tempSelection.startSlot < selectedWeeklyItem.startSlot ? tempSelection.startSlot : selectedWeeklyItem.startSlot;
  // tempSelection.endSlot = tempSelection.endSlot == null ? selectedWeeklyItem.endSlot : tempSelection.endSlot < selectedWeeklyItem.endSlot ? selectedWeeklyItem.endSlot : tempSelection.endSlot;
  //mais si la différence entre userSelection.xxxSlot et selectedWeeklyItem.xxxSlot est de plus de 4, alors il y a un ou des weeklyItem entre les deux qui doivent être sélectionnés...



  // userSelection = tempSelection;
  userSelection.startSlot = tempSelection.startSlot;
  userSelection.endSlot = tempSelection.endSlot;

  console.log(userSelection);

};
window.addMe = addMe;

function letsMeet(meet) {
  
};


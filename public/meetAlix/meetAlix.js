import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { app, analytics, db, auth, provider } from "../myFirebase.js";

let myEmail = "alexblade.23.49@gmail.com";

let myBusies = [];

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
  // console.log(myBusies);
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
    let rowDay = `<div ${c == 2 ? `id="Dday"` : c == 8 ? `id="Sday"` : ``} class="weeklyItem weeklyDay" style="grid-column:${c}; grid-row:3; ${c == 1 ? " border-radius:2px 0 0 2px; border-right:1px solid rgba(47, 79, 79, .5);" : ""}"${c > 1 ? ` data-code="${weeksDayArray[c - 2].code}">${weeksDayArray[c - 2].letter}<br /><span class="weeklyDateSpan"></span>` : `>`}</div>`; //shall we add the date as an id, as a data-date or as an area?
    arrayC.push(rowDay);
    let line = 4;
    for(let r = 1; r < 14; r++){
      let item = `<div class="weeklyItem" ${c > 1 ? `onclick="addMe(this)"` : ``} style="grid-column:${c}; grid-row:${line} / ${line + 4};${c == 1 ? " border-radius:2px 0 0 2px; border-right:1px solid rgba(47, 79, 79, .5);" : ""}">${c == 1 ? `${String(myDay).padStart(2, "0")}:00` : ``}</div>`; //non, on va créer les zones où ils peuvent cliquer; ça sera pas les weeklyItem
      arrayC.push(item);
      line += 4;
      myDay++;
    };
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
  let lastLine = `[row-end]`;
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
  putDatesInWeek(date);
  
  document.querySelector("#weekBackward").addEventListener("click", () => {
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
    eraseWeek();
    let Dday = document.querySelector("#Dday").dataset.date;
    let Ddate = getDateFromString(Dday);
    Ddate.setDate(Ddate.getDate() - 7);
    putDatesInWeek(Ddate);
  });
  document.querySelector("#weekForward").addEventListener("click", () => {
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
    eraseWeek();
    let Sday = document.querySelector("#Sday").dataset.date;
    let Sdate = getDateFromString(Sday);
    Sdate.setDate(Sdate.getDate() + 1);
    putDatesInWeek(Sdate);
  });
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
    document.querySelector("#weekBackward").classList.add("disapeared");
  } else{
    document.querySelector("#weekBackward").classList.remove("disapeared");
  };
  //updateSleepAreas();

// MARK: unknownDate
  let unknownStartDate = "2024-06-15";
  let unknownArea;
  console.log(arrayDate);
  const unknownTestIn = arrayDate.some(el => (el.full == unknownStartDate));
  if(unknownTestIn){
    let unknownStartIdx = meseDayICalc(unknownStartDate);
    let unknownStart = `${weeksDayArray[unknownStartIdx].code}`;
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
  putShowsInWeek(Dday, Sday);
};





function updateSleepAreas(){
  document.querySelectorAll(".sleepArea").forEach(we => {
    we.remove();
  });
  let myDay = Number(mySettings.myTomorrow.substring(0, 2));
  let sleepAreas = mySettings.myWeeksDayArray.map((clock) => {
    return `<div class="sleepArea" style="grid-area: row-${String(myDay).padStart(2, "0")}-00 / col-${clock.code} / row-${clock.clockIn.replace(":", "-")} / col-${clock.code}"></div>
    <div class="sleepArea" style="grid-area: row-${clock.clockOut.replace(":", "-")} / col-${clock.code} / row-end / col-${clock.code}"></div>`;
  }).join("");
  document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", sleepAreas);
};

/* function putShowsInWeek(Dday, Sday){
  console.log(Dday);
  console.log(Sday);
  console.log(myBusies);
  let daysBusies = [[],[],[],[],[],[],[]];
  myBusies.forEach(busy => {
    // if(show.line == "recurringDay"){ 
    //   show.recurrys.map(recurry => {
    //   if(Dday <= recurry.date && recurry.date <= Sday){//takes only the ones that should show up this week
    //     createWeeklyshow(recurry);
    //   };
    //   })
    // } else 
    console.log(busy.date);
    if((Dday <= busy.date && busy.date <= Sday) || busy.type == "sempre"){//takes only the ones that should show up this week
      createWeeklyshow(busy);
      let idxS = busy.col;
      let idx = idxS.slice(1)
      daysBusies[idx].push(busy);
    };
  });
  console.log(daysBusies);
}; */

function putShowsInWeek(Dday, Sday){
  myBusies.forEach(busy => {
    if((Dday <= busy.date && busy.date <= Sday)){//takes only the ones that should show up this week
      console.log(busy.date);
      createWeeklyshow(busy);
    };
  });
};


function createWeeklyshow(busy){
  document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div class="weeklyBuffer" style="grid-column:col-${busy.col}; grid-row:row-${busy.start}/row-${busy.end};"></div>`);
  if(busy.meal){
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div class="weeklyMeal" style="grid-column:col-${busy.col}; grid-row:row-${busy.start}/span 6;">Meal</div>`);
  };
};



function eraseWeek(){
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
  eraseWeek();
  updateSleepAreas();
  let Dday = document.querySelector("#Dday").dataset.date;
  let Sday = document.querySelector("#Sday").dataset.date;
  putShowsInWeek(Dday, Sday);
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

*/
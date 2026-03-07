// alix.rocks/meetAlix/?type=friend
// alix.rocks/meetAlix/?type=client
// alix.rocks/meetAlix/?lang=en
// alix.rocks/meetAlix/?lang=fr
// alix.rocks/meetAlix/?type=friend&lang=en

import { app, analytics, db, auth, provider, getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp, getAuth, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, onAuthStateChanged, rtdb, getDatabase, onChildAdded, ref, get, push, update, onValue, onChildChanged, onChildRemoved, remove } from "/myFirebase.js";
import i18n from "./i18n.js";

const unknownStartDate = "2026-03-21"; //The day the "Not sure yet" section starts
const nextKnownDate = "2026-04-13";

const myEmail = "alexblade.23.49@gmail.com";

const params = new URLSearchParams(window.location.search);

const formType = params.get("type") || "default";

//console.log(window.location.href);
//console.log(window.location.search);

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
    meal: false
  }
};
const config = formConfigs[formType];
//console.log(config);

let type = params.get("type") || "client";
//console.log(type);
if(type === "friend"){
  document.querySelector(".topToggles").insertAdjacentHTML("beforeend", `<label class="beigeToggler">
      <input type="checkbox" id="beigeToggle">
      <span>beige</span>
      <i id="beigeCheck"></i>
    </label>`);
  const beigeToggle = document.querySelector("#beigeToggle");
  beigeToggle.addEventListener("change", (e) => {
    if(e.target.checked){
      type = "client";
      document.querySelectorAll(".weeklyMeal").forEach(wm => wm.classList.add("displayNone"));
    } else{
      type = "friend";
      document.querySelectorAll(".weeklyMeal").forEach(wm => wm.classList.remove("displayNone"));
    };
    translatePage();
  });
};
const allowedLangs = ["fr", "en"];
const localLang = localStorage.getItem("meetAlixLang");
const navLang = navigator.language.slice(0, 2);
let lang = localLang ? localLang : allowedLangs.includes(navLang) ? navLang : "en";
localStorage.setItem("meetAlixLang", lang);
const switchLang = document.querySelector("#switchLang");

  // params.get("lang") ? params.get("lang") : navigator.language.slice(0, 2) === "fr" ? "fr" : "en";
  // console.log(lang);

function t(key, vars = {}) {
  // console.log(i18n?.[type]?.[lang]?.[key]);
  let text =
    i18n?.[type]?.[lang]?.[key] ??
    key;
    
  for (const v in vars) {
    text = text.replaceAll(`{${v}}`, vars[v]);
  };

  return text;
};

function translatePage() {
  //console.log(lang);
  
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const text = t(key);

    if (text === "") {
      el.style.display = "none";
    } else {
      el.innerHTML = text;
      el.style.display = "";
    };
  });

  translateMonth();

  if (!formContainer.classList.contains("displayNone") && formState.date !== "") {
    //console.log(formState.date);
    let string = getDateTimeFromBook(formState);
    let stringLang = lang === "en" ? string : string.charAt(0).toUpperCase() + string.slice(1);
    selectedTime.innerHTML = stringLang;
  };
};
function updateSwitchLang() {
  switchLang.checked = lang === "en" ? true : false;
};

switchLang.addEventListener("change", (e) => {
  if(e.target.checked){
    lang = "en";
  } else{
    lang = "fr";
  };
  localStorage.meetAlixLang = lang;
  translatePage();
});

const deviceId =
  localStorage.getItem("meetAlixDeviceId") ||
  crypto.randomUUID();

localStorage.setItem("meetAlixDeviceId", deviceId);



const weeksDayArray = [{
  day: 0,
  name: "dimanche",
  i18n: "calendar_sunday",
  code: "D0"
}, {
  day: 1,
  name: "lundi",
  i18n: "calendar_monday",
  code: "L1"
}, {
  day: 2,
  name: "mardi",
  i18n: "calendar_tuesday",
  code: "M2"
}, {
  day: 3,
  name: "mercredi",
  i18n: "calendar_wednesday",
  code: "M3"
}, {
  day: 4,
  name: "jeudi",
  i18n: "calendar_thursday",
  code: "G4"
}, {
  day: 5,
  name: "vendredi",
  i18n: "calendar_friday",
  code: "V5"
}, {
  day: 6,
  name: "samedi",
  i18n: "calendar_saturday",
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
////console.log(allTheEdges);

const allTheOtherBookings = [];

const container = document.querySelector(".weeklyContainer");
const mealLegend = document.querySelector("#mealLegend");
mealLegend.style.display = config.meal ? "flex" : "none";
const formContainer = document.querySelector(".formContainer");  //config.form
const form = formContainer.querySelector("form");
const selectedTime = formContainer.querySelector(".selectedTime");
const handle = formContainer.querySelector(".handle");
handle.addEventListener("click", () => {
  formContainer.classList.toggle("expanded");
});
const submitBtn = formContainer.querySelector(".submitBtn");
const messageBox = document.querySelector("#messageBox");

let myBusies = [];
let Dday = "";
let Sday = "";
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
  // status: "",
  // uuid: "",
  // key: ""
};


const formFields = {
  date: {
    selector: ".dateComplete",
    type: "date"
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

const inputs = {};

for (const key in formFields) {
  const { selector, type } = formFields[key];
  if (type === "radio"){
    inputs[key] = formContainer.querySelectorAll(selector);
  } else{
    inputs[key] = formContainer.querySelector(selector);
  };
};

const savedFormState = localStorage.getItem("meetAlixFormState");

if (savedFormState) {
  Object.assign(formState, JSON.parse(savedFormState));
} else {
  localStorage.setItem(
    "meetAlixFormState",
    JSON.stringify(formState)
  );
};

const fieldHandlers = {
  simple(key) {
    inputs[key].addEventListener("change", e => {
      formState[key] = e.target.value;
      localStorage.setItem(
        "meetAlixFormState",
        JSON.stringify(formState)
      );
    });
  },
  date(key) { // WE NEED TO ADD ONE FOR DATE TOO! THAT WILL CHANGE USERSELECTION AND USERMEETING!
    inputs[key].addEventListener("change", e => {
      const value = e.target.value;
      if (!value) return;
      //Now, we need to check if that date & time is available...
      //Getting the dayIndex from the date with the safest method, in case of timezones
      const [y, m, d] = value.split("-");
      const dayIndex = new Date(y, m - 1, d).getDay();

      let selectedWeeklyItem = {
        date: value,
        dayIndex: dayIndex,
        col: weeksDayArray[dayIndex].code,
        startSlot: userSelection.startSlot,
        endSlot: userSelection.endSlot
      };
      confirmAvailability(selectedWeeklyItem); //includes pretty much everything...
    });
  },

  dalle(key) {
    inputs[key].addEventListener("change", e => {
      const value = e.target.value; // e.g., "10:07"
      if (!value) return;
      const formattedTime = roundFifteenTime(value);
      
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
    inputs[key].addEventListener("change", e => {
      const value = e.target.value; // e.g., "10:07"
      if (!value) return;
      const formattedTime = roundFifteenTime(value);
      
      //If there's overlapping, adjust the time to the nearest possible; don't just snap back to the previous time
      let [hours, minutes] = formattedTime.split(':').map(Number);
      let info = {
        dayIndex: userSelection.dayIndex,
        hour: hours,
        minute: minutes
      };
      let newEndSlot = dateTimeToSlot(info);
      let newAlleSlot = checkNewAlleSlot(userSelection.startSlot, newEndSlot);
      //CHECK WITH EDGES TOO!! (Edges have been added to unavailableRanges)
      // let newAlleTime = slotToTime(newAlleSlot);
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



// MARK: REFLEXIONS
/* 
userSelection n'existe que lorsque le user a selectionné quelque chose (et jamais dans le localStorage), que ce soit un carré vide ou un de ses bookings; userSelection est resetté en même temps que le .selected est removed ou que le Form est fermé (x) ou trashed

FormState apparait dans le localStorage seulement après que le user y a modifié quelque chose. 
FormState reste dans le localStorage tant et aussi longtemps que le user ne l'a pas trashed (par le Form ou par le weeklyItem), ou saved (donc envoyé pending).
Le FormState n'obtient un bookingKey qu'après avoir été sauvé/envoyé

Le user click sur un carré vide pour la première fois
  -> Si il y a un FormState, on rempli le Form (mais avec la nouvelle date et heures)
  -> On cré un nouveau userSelection et un .selected (en fonction des availabilities)
Le user click sur un deuxième carré vide (ou, plus tard, sur une extrémité du .selected (pour le racourcir))
  -> On update userSelection (en fonction des availabilities)
  -> On remove et recré le .selected
  -> On update FormState et le Form
Le user click sur un de ses bookings (pending, confirmed ou cancelled)
  -> On cré/update userSelection à partir de FormState (le weeklyItem possède le bookingKey)
  -> est-ce qu'on cré un .selected par-dessus ou est-ce qu'on remove et cré un nouveau weeklyItem (et si ça, est-ce qu'on met les borders en pointillés et on change la couleur, ou est-ce qu'on le laisse pareil (et est-il .selected quand même pour qu'on puisse le remove plus tard?))? 
    => Tant que le user n'a pas sauvé le Form, le weeklyItem garde sa couleur de status; 
    => Si le user save (après avoir modifié quelque chose; le bouton save devrait réapparaître et les borders deviennent pointillées?), il redevient "pending"
  OU
  On ne cré pas de userSelection et on ne remplit pas le Form; à la place, on présente une version officielle du Form (donc pas avec des champs modifiables, juste les infos) (avec un crayon dans un coin pour pouvoir le modifié)
    Si le user click sur le crayon:
      -> on cré un nouveau userSelection
      -> on remove le weeklyItem et cré un .selected
      -> on update le FormState (?? qu'est-ce qu'on y change? le status? status = "selected")
      Si le user click sur cancel
      -> on reset userSelection et remove .selected
      -> à partir du bookingKey du formState, on récupère la version qui est dans storedBooking et
      -> on recré le weeklyItem
      -> on rerempli le Form avec les données originales
*/


function fromBookToUserSelection(book){ //from storedBookings
  // book = {
  //   key: "",
  //   type: formType,
  //   status: "pending",
  //   data: {
  //     date: dateComplete,
  //     dalle: dalleTime,
  //     alle: alleTime,
  //     name: nameInput,
  //     email: emailInput,
  //     cell: cellInput,
  //     messengerName: messengerNameInput,
  //     whatsAppNumber: whatsAppNumberInput,
  //     yourAddress: yourAddressInput,
  //     whereReal: whereRealInput,
  //     why: whyInput
  //   },
  //   createdBy: deviceId,
  //   timestamp: Date.now()
  // }
  // book.data.date
  // book.data.dalle
  // book.data.alle
  userSelection.date = book.data.date;
  userSelection.dayIndex = getDayIndex(userSelection.date);
  userSelection.startSlot = getStartEndSlot(userSelection.dayIndex, book.data.dalle);
  userSelection.startRow = slotToRow(userSelection.startSlot);
  userSelection.endSlot = getStartEndSlot(userSelection.dayIndex, book.data.alle);
  userSelection.endRow = slotToRow(userSelection.endSlot);
  userSelection.col = `col-${weeksDayArray[userSelection.dayIndex].code}`;
  userSelection.topIsTouching = true; //comparing userSelection.slots with unavailableRanges.slots, but only the ones for this shown week... so we can't check that unless we know it's in the currently shown week...
  userSelection.bottomIsTouching = true; // So let's make them true so that the weeklyItem seems closed (rounded corners everywhere)
};


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

const storedBookings = [];
const existingKeys = new Set();
async function getBookings() {
  storedBookings.length = 0;
  existingKeys.clear();

  const snap = await get(ref(rtdb, "meetAlix/bookings"));

  if (!snap.exists()) return;
  const rtdbBookings = snap.val();
  
  for (const [key, remoteBook] of Object.entries(rtdbBookings)) {
    existingKeys.add(key);
    if (remoteBook.createdBy === deviceId){
      storedBookings.push({
        key,
        ...remoteBook
      });
    } else if(remoteBook.status === "pending"){
      allTheOtherBookings.push({
        key,
        ...remoteBook
      });
    };
  };
};

async function addListeners() {
  
  onChildAdded(ref(rtdb, "meetAlix/bookings"), snapshot => {
    const key = snapshot.key;
    const book = snapshot.val();

    if (existingKeys.has(key)) return;
    existingKeys.add(key);
    const booking = {
      key,
      ...book
    };

    if (booking.createdBy === deviceId){
      if(Dday <= booking.data.date && booking.data.date <= Sday){
        // and create a new one from storedBooking
        createWeeklyBook(booking);
        // add the proper legend if it isn't already there
        updateLegend();          
      };
      storedBookings.push(booking); // do we create the weeklyItem here or in the form.submit?
    } else{
      allTheOtherBookings.push(booking);
      if(Dday <= booking.data.date && booking.data.date <= Sday){
        createWeeklyOtherBook(booking);
      };
    };
  });

  onChildChanged(ref(rtdb, "meetAlix/bookings"), snapshot => {
    const key = snapshot.key;
    const book = snapshot.val();

    if (book.createdBy === deviceId){
      const bookingIndex = storedBookings.findIndex(book => book.key === key);
      if(bookingIndex !== -1){
        const booking = storedBookings[bookingIndex];
        booking.status = book.status;
       //update the corresponding weeklyItem if there is one
        const thisUserMeeting = container.querySelector(`[data-bookingkey="${key}"]`);
        if(thisUserMeeting){
          thisUserMeeting.remove();
        };
        if(Dday <= booking.data.date && booking.data.date <= Sday){
          // and create a new one from storedBooking
          createWeeklyBook(booking);
          // add the proper legend if it isn't already there
          updateLegend();          
        };
      };
    } else{
      if(book.status === "pending"){
        //add to array and create it if date
        const booking = {
          key,
          ...book
        };
        allTheOtherBookings.push(booking);
        if(Dday <= booking.data.date && booking.data.date <= Sday){
          createWeeklyOtherBook(booking);
        };
      } else {
        //if(book.status === "confirmed") remove from array and remove item, because there will be a busy instead
        //if(book.status === "cancelled") remove from array and remove item 
        const thisOtherMeeting = container.querySelector(`[data-bookingkey="${key}"]`);
        if(thisOtherMeeting){
          thisOtherMeeting.remove();// remove the corresponding weeklyItem if there is one!
        };
        const otherBookingIndex = allTheOtherBookings.findIndex(book => book.key === key);
        if(otherBookingIndex !== -1){
          allTheOtherBookings.splice(otherBookingIndex, 1);
        }; 
      };
    };
  });

  onChildRemoved(ref(rtdb, "meetAlix/bookings"), snapshot => {
    const key = snapshot.key;
    const book = snapshot.val();

    if (existingKeys.has(key)) {
      existingKeys.delete(key);
    };
    
    if (book.createdBy === deviceId){
      const thisUserMeeting = container.querySelector(`[data-bookingkey="${key}"]`);
      if(thisUserMeeting){
        thisUserMeeting.remove();// remove the corresponding weeklyItem if there is one!
      };
      const bookingIndex = storedBookings.findIndex(book => book.key === key);
      if(bookingIndex !== -1){
        storedBookings.splice(bookingIndex, 1);
      }; 
    } else{
      const thisOtherMeeting = container.querySelector(`[data-bookingkey="${key}"]`);
      if(thisOtherMeeting){
        thisOtherMeeting.remove();// remove the corresponding weeklyItem if there is one!
      };
      const otherBookingIndex = allTheOtherBookings.findIndex(book => book.key === key);
      if(otherBookingIndex !== -1){
        allTheOtherBookings.splice(otherBookingIndex, 1);
      }; 
    };
  });
};

async function loadMyBusies() {
  const busiesRef = ref(rtdb, "meetAlix/myBusies");
  const snap = await get(busiesRef);

  if (!snap.exists()) {
    myBusies = [];
    return;
  };

  const data = snap.val();

  // Convert object → array
  myBusies = Object.entries(data).map(([key, value]) => ({
    key,
    ...value
  }));

};

onValue(ref(rtdb, "meetAlix/myBusies"), snapshot => {

  if (!snapshot.exists()) {
    myBusies = [];
    return;
  };

  const data = snapshot.val();

  myBusies = Object.entries(data).map(([key, value]) => ({
    key,
    ...value
  }));

  updateCurrentWeek(); //eraseWeekEvent(); getThisWeekStuffAndUnavailableRanges(); putShowsInWeek();
});


function createCalendar(){
  getWeeklyCalendar();

  let item = document.querySelector(`[data-col="2"][data-row="4"]`);
  const itemWidth = window.getComputedStyle(item).getPropertyValue("width");
  const itemHeight = window.getComputedStyle(item).getPropertyValue("height");

  document.documentElement.style.setProperty('--itemWidth', `${itemWidth}`);
  document.documentElement.style.setProperty('--itemHeight', `${itemHeight}`);

};


initApp();


async function initApp() {
  await getBookings();
  await addListeners();
  await loadMyBusies();
  createCalendar();
  translatePage();
  updateSwitchLang();
  document.body.style.visibility = "visible";
};



//*** WEEKLY CALENDAR

let date = new Date();
let todayDate = date.getDate();
let year = date.getFullYear();
let month = date.getMonth(); //pour vrai, enlève le "+ 1"
let monthName = date.toLocaleString('fr-CA', { month: 'long' }).toLocaleUpperCase();
let todayWholeDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(todayDate).padStart(2, "0")}`

function getWeeklyCalendar(){
  let arrayItem = [];
  let rowYear = `<div class="weeklyItem weeklyTitle" style="grid-row:1; border-bottom-width: 1px; display: flex; flex-flow: row nowrap; align-items: center; justify-content: space-between;">
    <div>
      <button class="weeklyBtn" id="weekBackward" style="border-radius: 2px 5px 5px 0;">
        <span class="typcn typcn-media-play-reverse"></span>
      </button>
      <button class="weeklyBtn backToWeeklyTodayBtn displayNone" onclick="backToWeeklyToday()">
        <i class="fa-solid fa-calendar-day" style="font-size:16px;"></i>
      </button>
    </div>
    <span id="weeklyYearSpan">${year}</span>
    <div>
      <button class="weeklyBtn backToWeeklyTodayBtn displayNone" onclick="backToWeeklyToday()">
        <i class="fa-solid fa-calendar-day" style="font-size:16px;"></i>
      </button>
      <button class="weeklyBtn" id="weekForward" style="float: right; border-radius: 5px 2px 0 5px;">
        <span class="typcn typcn-media-play"></span>
      </button>
    </div>
  </div>`;
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
      ${c > 1 ? ` data-dayindex="${c - 2}"><span class="weeklyDaySpan" data-i18n="${weeksDayArray[c - 2].i18n}"></span><br /><span class="weeklyDateSpan"></span>` : `>`}
    </div>`;
    // weeksDayArray[c - 2].letter  ...   ${t(weeksDayArray[c - 2].i18n)}
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
  putDatesInWeek(date); //includes getThisWeekStuffAndUnavailableRanges(); AND putShowsInWeek();

  document.querySelector("#weekBackward").addEventListener("click", () => {
    eraseWeekArea();
    eraseWeekEvent();
    let DdaySlash = document.querySelector("#Dday").dataset.date;
    let Ddate = getDateFromString(DdaySlash);
    Ddate.setDate(Ddate.getDate() - 7);
    putDatesInWeek(Ddate); //includes getThisWeekStuffAndUnavailableRanges(); AND putShowsInWeek();
  });

  document.querySelector("#weekForward").addEventListener("click", () => {
    eraseWeekArea();
    eraseWeekEvent();
    let SdaySlash = document.querySelector("#Sday").dataset.date;
    let Sdate = getDateFromString(SdaySlash);
    Sdate.setDate(Sdate.getDate() + 1);
    putDatesInWeek(Sdate); //includes getThisWeekStuffAndUnavailableRanges(); AND putShowsInWeek();
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
      
      const dayIndex = getDayIndex(book.data.date);
      const startSlot = getStartEndSlot(dayIndex, book.data.dalle);
      const endSlot = getStartEndSlot(dayIndex, book.data.alle);

      let bookRange = {
        start: startSlot,
        end: endSlot
      };
      //console.log(bookRange);
      unavailableRanges.push(bookRange);
    });
  };

  if(config.meet && allTheOtherBookings.length){
    theOtherThisWeekBookings.forEach(book => {
      const dayIndex = getDayIndex(book.data.date);
      const startSlot = getStartEndSlot(dayIndex, book.data.dalle);
      const endSlot = getStartEndSlot(dayIndex, book.data.alle);
      
      let bookRange = {
        start: startSlot,
        end: endSlot
      };
      unavailableRanges.push(bookRange);
    });
  };
  
  // Adding the edges 
  unavailableRanges.push(...allTheEdges);
  //console.log(unavailableRanges);
}; 

function getDayIndex(date){ //2026-02-22
  const [y, m, d] = date.split("-");
  return new Date(y, m - 1, d).getDay();
};

function getStartEndSlot(dayIndex, time){ // 2, 11:30
  const [hours, minutes] = time.split(':').map(Number);
  const info = {
    dayIndex: dayIndex,
    hour: hours,
    minute: minutes
  };
  return dateTimeToSlot(info);
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
    document.querySelectorAll(".backToWeeklyTodayBtn").forEach(btn => {
      btn.classList.add("displayNone");
    });
    //ajout d'une zone pâle pour couvrir les jours passés
    if(dayIdx > 0){ // if dayIdx == 0, c'est dimanche, alors on n'a pas besoin de zone pâle
      let yesterdayDay = `${weeksDayArray[dayIdx].code}`;
      let pastArea = `<div class="pastArea" style="grid-row: row-Day-end / row-end; grid-column: col-start / col-${yesterdayDay}"></div>`;
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", pastArea);
    };
  } else{
    document.querySelector("#weekBackward").classList.remove("invisible");
    document.querySelectorAll(".backToWeeklyTodayBtn").forEach(btn => {
      btn.classList.remove("displayNone");
    });
  };
  //updateSleepAreas();
  
  let unknownArea;
  //console.log(arrayDate);
  const unknownTestIn = arrayDate.some(el => (el.fullDash == unknownStartDate));
  if(unknownTestIn){
    let unknownStartIdx = meseDayICalc(unknownStartDate);
    let unknownStart = `${weeksDayArray[unknownStartIdx].code}`;
    unknownArea = `<div class="unknownArea" style="grid-row: row-Day / row-end; grid-column: col-${unknownStart} / col-end"><p><span data-i18n="calendar_unknown">${t("calendar_unknown")}</span> ${nextKnownDate}</p></div>`;
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", unknownArea);
  };
  const unknownTestAfter = unknownStartDate < arrayDate[0].fullDash ? true : false;
  if(unknownTestAfter){
    unknownArea = `<div class="unknownArea" style="grid-row: row-Day / row-end; grid-column: col-start / col-end"><p><span data-i18n="calendar_unknown">${t("calendar_unknown")}</span> ${nextKnownDate}</p></div>`;
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", unknownArea);
  };
  

  Dday = arrayDate[0].fullDash;
  Sday = arrayDate[arrayDate.length - 1].fullDash;
  let Ddate = getDateFromString(Dday);
  let Sdate = getDateFromString(Sday);
  let DYear = Ddate.getFullYear();
  let SYear = Sdate.getFullYear();
  let DMonthName = Ddate.toLocaleString(`${lang}-CA`, { month: 'long' }).toLocaleUpperCase();
  let SMonthName = Sdate.toLocaleString(`${lang}-CA`, { month: 'long' }).toLocaleUpperCase();
  document.querySelector("#weeklyYearSpan").innerHTML = `${DYear}${DYear !== SYear ? ` / ${SYear}` : ``}`;
  document.querySelector("#weeklyMonthSpan").innerHTML = `${DMonthName}${DMonthName !== SMonthName ? ` / ${SMonthName}` : ``}`;
  getThisWeekStuffAndUnavailableRanges();
  putShowsInWeek();
 
  if(userSelection.date !== null 
    && Dday <= userSelection.date && userSelection.date <= Sday 
    && userSelection.startSlot !== null 
    && userSelection.endSlot !== null){
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div class="userMeeting selected modifying${userSelection.topIsTouching ? `  topIsTouching` : ``}${userSelection.bottomIsTouching ? ` bottomIsTouching` : ``}" style="grid-column:${userSelection.col}; grid-row:${userSelection.startRow}/${userSelection.endRow};"></div>`);
    updateSelectedTime();
    formContainer.classList.remove("expanded");
  }; // add an other one for the confirmed ones
};

function translateMonth(){
  let Ddate = getDateFromString(Dday);
  let Sdate = getDateFromString(Sday);
  let DMonthName = Ddate.toLocaleString(`${lang}-CA`, { month: 'long' }).toLocaleUpperCase();
  let SMonthName = Sdate.toLocaleString(`${lang}-CA`, { month: 'long' }).toLocaleUpperCase();
  document.querySelector("#weeklyMonthSpan").innerHTML = `${DMonthName}${DMonthName !== SMonthName ? ` / ${SMonthName}` : ``}`;
};

function backToWeeklyToday(){
  document.querySelectorAll(".backToWeeklyTodayBtn").forEach(btn => {
    btn.classList.add("displayNone");
  });
  eraseWeekArea();
  eraseWeekEvent();
  let date = new Date();
  let dayIdx = date.getDay();
  date.setDate(date.getDate() - dayIdx);
  putDatesInWeek(date);
};
window.backToWeeklyToday = backToWeeklyToday;



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
let theOtherThisWeekBookings = [];
function getThisWeekStuffAndUnavailableRanges(){
  myThisWeekBusies = myBusies.filter(busy =>
    Dday <= busy.date && busy.date <= Sday
  );
  //console.log(myThisWeekBusies);
  if(config.meet && storedBookings.length){
    theirThisWeekBookings = storedBookings.filter(book =>
      Dday <= book.data.date && book.data.date <= Sday
    );
  };
  
  if(config.meet && allTheOtherBookings.length){
    theOtherThisWeekBookings = allTheOtherBookings.filter(book => 
      Dday <= book.data.date && book.data.date <= Sday
    );
  };

  fromThisWeekStuffToUnavailableRanges();
};


function putShowsInWeek() {
  myThisWeekBusies.forEach(busy => {
    createWeeklyshow(busy);
  });
  if(theirThisWeekBookings.length){
    theirThisWeekBookings.forEach(book => {
      createWeeklyBook(book);
    });
  };
  if(theOtherThisWeekBookings.length){
    theOtherThisWeekBookings.forEach(book => {
      createWeeklyOtherBook(book);
    });
  };
  //console.log(theOtherThisWeekBookings);
  updateLegend();
};

function createWeeklyshow(busy){
  document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div class="weeklyBuffer" style="grid-column:col-${busy.col}; grid-row:row-${busy.start}/row-${busy.end};"></div>`);
  if(config.meal && busy.meal){
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div class="weeklyMeal${formType == "friend" && beigeToggle.checked ? " displayNone" : ""}" style="grid-column:col-${busy.col}; grid-row:row-${busy.start}/span 6;"><span data-i18n="meal">${t("meal")}</span></div>`);
  };
};

function createWeeklyBook(book){
  //fromBookToUserSelection(book);
  const tempSelection = structuredClone(userSelection);
  tempSelection.date = book.data.date;
  tempSelection.dayIndex = getDayIndex(tempSelection.date);
  tempSelection.startSlot = getStartEndSlot(tempSelection.dayIndex, book.data.dalle);
  tempSelection.startRow = slotToRow(tempSelection.startSlot);
  tempSelection.endSlot = getStartEndSlot(tempSelection.dayIndex, book.data.alle);
  tempSelection.endRow = slotToRow(tempSelection.endSlot);
  tempSelection.col = `col-${weeksDayArray[tempSelection.dayIndex].code}`;
  tempSelection.topIsTouching = true;
  tempSelection.bottomIsTouching = true;
  document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div 
    data-bookingkey="${book.key}" 
    data-status="${book.status}"
    onclick="openSummary(this)" 
    class="userMeeting ${book.status}${tempSelection.topIsTouching ? ` topIsTouching` : ``}${tempSelection.bottomIsTouching ? ` bottomIsTouching` : ``}" 
    style="grid-column:${tempSelection.col}; grid-row:${tempSelection.startRow}/${tempSelection.endRow};">
      ${book.status == "cancelled" ? `<span class="iconBtn" onclick="trashCancelled(this)"><i class="fa-regular fa-trash-can"></i></span>` : ``}
  </div>`);
};

function createWeeklyOtherBook(book){
  //console.log("other");
  let [y, m, d] = book.data.date.split("-");
  const dayIndex = new Date(y, m - 1, d).getDay();
  let col = weeksDayArray[dayIndex].code; //code
  let start = book.data.dalle.replace(":", "-"); // start time 11-00
  let end = book.data.alle.replace(":", "-"); // end time 23-00
  document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div class="weeklyBuffer" style="grid-column:col-${col}; grid-row:row-${start}/row-${end};"></div>`);
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
  //enlever aussi la zone pâle couvrant les jours passés
  let pastAreaDiv = document.querySelector(".pastArea");
  if(pastAreaDiv){
    pastAreaDiv.remove();
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

function updateCurrentWeek(){
  eraseWeekEvent();
  getThisWeekStuffAndUnavailableRanges();
  putShowsInWeek();
  //console.log("currentWeekUpdated");
};

function updateWeek(){
  eraseWeekArea();
  eraseWeekEvent();
  //updateSleepAreas();
  let DdaySlash = document.querySelector("#Dday").dataset.date; //wouldn't work if we haven't already set the date attribute...
  let Ddate = getDateFromString(DdaySlash);
  putDatesInWeek(Ddate);
};

function getTodayDate(){
  let date = new Date();
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
};

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

  let conclusion = {
    relation: "separate"
  };
  return conclusion;
};


function addMe(thisOne) {
  //console.log(userSelection);

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
  console.log(formState);
  confirmAvailability(selectedWeeklyItem);
  formContainer.classList.remove("expanded"); // formContainer is technically already not expanded
};

function confirmAvailability(selectedWeeklyItem){
  console.log(userSelection);
  let tempSelection = userSelection;
  console.log(tempSelection);
  
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
  updateSelectedTime();
  updateUserMeeting();
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
    container.querySelector(".selected").remove();
  } else{
    const bookingKey = formState.key;
    // removing the userMeeting from the calendar
    container.querySelector(`[data-bookingkey="${bookingKey}"]`).remove();

    trashBookingInRTDB(bookingKey); // it'll then be removed from storedBookings thanks to listeners
  }; 

  // reset everything
  resetUserSelection();
  updateSelectedTime(); // resets formState and remove formContainer too since userSelection is now null 
  form.reset();
};
window.trashUserMeeting = trashUserMeeting;

async function trashBookingInRTDB(bookingKey){
  try {
    await remove(ref(rtdb, `meetAlix/bookings/${bookingKey}`));
    messageBox.innerHTML = t("message_trash_confirm");
    updateLegend();
  } catch (err) {
    console.error("Failed to delete booking", err);
    messageBox.innerHTML = t("message_error");
  };
};

function updateUserMeeting(){ 
  console.log("updateUserMeeting");
  container.querySelectorAll(".userMeeting.selected").forEach(we => {
    we.remove();
  });

  if(userSelection.date !== null && userSelection.startSlot !== null && userSelection.endSlot !== null){
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", `<div 
      ${formState.key ? `data-bookingkey="${formState.key}"` : ``} class="userMeeting selected ${userSelection.topIsTouching ? `  topIsTouching` : ``}${userSelection.bottomIsTouching ? ` bottomIsTouching` : ``}" style="grid-column:${userSelection.col}; grid-row:${userSelection.startRow}/${userSelection.endRow};"></div>`);
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
    //localStorage.meetAlixUserSelection = JSON.stringify(userSelection);
    localStorage.meetAlixFormState = JSON.stringify(formState);
  } else{
    formContainer.classList.remove("displayNone");
    let startDateTime = slotToDateTime(userSelection.startSlot);
    let endDateTime = slotToDateTime(userSelection.endSlot);

    
    let chosenDate = document.querySelector(`[data-dayindex="${startDateTime.dayIndex}"]`).dataset.date;
    const thatDay = new Date(chosenDate);
    

    // 1️⃣ Get weekday, month, day, year
    let preWeekday = thatDay.toLocaleDateString(`${lang}-CA`, { weekday: "long" });
    const weekday = lang === "en" ? preWeekday : preWeekday.charAt(0).toUpperCase() + preWeekday.slice(1);
    const month = thatDay.toLocaleDateString(`${lang}-CA`, { month: "long" });
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
      };
    };

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
    //localStorage.meetAlixUserSelection = JSON.stringify(userSelection);
    localStorage.meetAlixFormState = JSON.stringify(formState);
  };
};

function getDateTimeFromBook(data){
  const thatDay = new Date(data.date);
    
  // 1️⃣ Get weekday, month, day, year
  const weekday = thatDay.toLocaleDateString(`${lang}-CA`, { weekday: "long" });
  const month = thatDay.toLocaleDateString(`${lang}-CA`, { month: "long" });
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
    };
  };

  const suffix = getOrdinalSuffix(day);

  // --- TIME PART ---
    function formatTime24to12(hour24, minute) {

      const period = hour24 >= 12 ? "pm" : "am";
      const hour12 = hour24 % 12 || 12;
      const paddedMinutes = minute.toString().padStart(2, "0");

      return {
        hour24,
        hour12,
        paddedMinutes,
        period
      };
    };
    let [startHours, startMinutes] = data.dalle.split(':').map(Number);
    let [endHours, endMinutes] = data.alle.split(':').map(Number);
    const startFormatted = formatTime24to12(startHours, startMinutes);
    const endFormatted   = formatTime24to12(endHours, endMinutes);

  let dateTime = t("summary_date_time", {
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

  return dateTime;
};

function getBooking(bookingKey){
  return storedBookings.find((book) => book.key == bookingKey);
};

function openSummary(thisOne){
  const book = thisOne;
  const bookingKey = book.dataset.bookingkey;
  const booking = storedBookings.find((book) => book.key == bookingKey);

  // In case there is already a userMeeting.selected, we need it removed
  container.querySelectorAll(".userMeeting.selected").forEach(we => {
    we.remove();
  });
  //Also remove the formContainer
  formContainer.classList.add("displayNone"); 
  formContainer.classList.remove("expanded");

  //NO NEED TO update formState (we'll do if they want to modify it)
  // Object.assign(formState, structuredClone(booking.data));
  
  //Add the bookingKey to formState
  // formState.key = bookingKey;

  //Create the booking summary
  let i18nWhere = "";
  let address = "";
  switch(booking.data.where){
    case "messenger":
      i18nWhere = "summary_where_on";
      address = t("summary_where_messenger");
      break;
    case "googleMeet":
      i18nWhere = "summary_where_on";
      address = t("summary_where_googleMeet");
      break;
    case "whatsApp":
      i18nWhere = "summary_where_on";
      address = t("summary_where_whatsApp");
      break;
    case "myRealWorld":
      i18nWhere = "summary_where_at";
      address = t("summary_where_mine");
      break;
    case "yourRealWorld":
      i18nWhere = "summary_where_at";
      address = booking.data.yourAddress;
      break;
    case "elseRealWorld":
      i18nWhere = "summary_where_at";
      address = booking.data.whereReal;
      break;
    default:
      console.log("oups!");
      break;
  };
  const color = `var(--${booking.status}-border)`;
  const summary = `<div id="summaryContainer">
    <div class="summary">
      <div class="topButtons">
        <button id="trashBookingFromSummary" class="iconBtn">
          <i class="fa-regular fa-trash-can"></i>
        </button>
        <button id="closeSummary" class="iconBtn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <h2 data-i18n="summary_presentation">${t("summary_presentation")}</h2>
      <h3>
        <span style="color:${color};">${booking.data.name}<span data-i18n="summary_andMe">${t("summary_andMe")}</span></span><br/>
        <span data-i18n="summary_shall">${t("summary_shall")}</span><br/>
        <span style="color:${color};">${getDateTimeFromBook(booking.data)}</span><br/>
        <span data-i18n="${i18nWhere}">${t(i18nWhere)}</span><br/>
        <span style="color:${color};">${address}</span>.
      </h3>
      <h3>
        <span data-i18n="summary_why">${t("summary_why")}</span><br/>
        ${booking.data.why}
      </h3>
      <p data-i18n="summary_note_${booking.status}"></p>
      <button id="modifyBooking" class="textBtn submitBtn" data-i18n="button_modify" style="margin: 2em auto 1em;">
        ${t("button_modify")}
      </button>
    </div>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", summary);

  document.querySelector("#trashBookingFromSummary").addEventListener("click", () => {
    document.querySelector("#summaryContainer").remove();
    //remove the weeklyItem
    container.querySelector(`[data-bookingkey="${bookingKey}"]`).remove();
    //remove in rtdb
    trashBookingInRTDB(bookingKey); //storedBookings will be updated through the change in rtdb
  });
  document.querySelector("#closeSummary").addEventListener("click", () => {
    document.querySelector("#summaryContainer").remove();
  });
  document.querySelector("#modifyBooking").addEventListener("click", () => {
    document.querySelector("#summaryContainer").remove();
    //remove the weeklyItem
    container.querySelector(`[data-bookingkey="${bookingKey}"]`).remove();
    
    //update userSelection
    fromBookToUserSelection(booking);
    
    //fill up formState from booking
    openForm(booking);

    //create the new userMeeting (selected)
    updateUserMeeting();
    
  });
};
window.openSummary = openSummary;

function openForm(booking){ //booking is from storedBookings

  //update formState
  Object.assign(formState, structuredClone(booking.data));
 

  //Add the bookingKey to formState
  formState.key = booking.key;

  localStorage.meetAlixFormState = JSON.stringify(formState);

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

  updateSelectedTime(); // since we have userSelection, and, anyway, if the user changes time and date, it will update SelectedTime, so might as well already have it!
  submitBtn.innerText = t("button_save");
  //formContainer.classList.remove("displayNone"); //already in updateSelectedTime()
  formContainer.classList.add("expanded");
  
};
window.openForm = openForm;




form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // --- 1. UI: waiting state ---
  submitBtn.disabled = true;
  messageBox.innerHTML = t("message_waiting");

  try {
    // --- 1. Check if the booking already exists
    if(formState.key){//if it already had a key, we're comming from openSummary
      const bookingKey = formState.key;
      delete formState.key;
      // update the booking in rtdb and it will update in storedBookings automatically AND be created in the calendar
      await update(ref(rtdb, `meetAlix/bookings/${bookingKey}`), {
        status: "pending", //if it already had a key, it had a status and the user was modifying it, so whatever the status was, now it's pending again!
        data: structuredClone(formState),
        timestamp: Date.now()
      });
    } else{
      // --- Push to RTDB and it will be added in storedBookings automatically AND be created in the calendar ---
      await push(ref(rtdb, "meetAlix/bookings"), {
        type: formType,
        status: "pending",
        data: structuredClone(formState),
        createdBy: deviceId,
        timestamp: Date.now()
      });
      container.querySelector(".selected").remove();
    };

    // --- 5. SUCCESS ---
    // Show confirmation message
    messageBox.innerHTML = t("message_confirm");  

    // Erase and remove the form
    form.reset();
    formContainer.classList.add("displayNone"); 
    formContainer.classList.remove("expanded");

    // Reset userSelection and formState
    resetUserSelection();
    resetFormState();
    //save to localStorage the resetted formState
    localStorage.meetAlixFormState = JSON.stringify(formState);

  } catch (error) {
    // --- 6. FAILURE ---
    console.error("Booking failed:", error);

    messageBox.innerHTML = t("message_error");
    submitBtn.disabled = false;
  };
});

form.addEventListener("reset", async (e) => {
  e.preventDefault();

  // --- 1. Check if the booking already exists
  if(formState.key){ //if it already had a key, we're comming from openSummary
    const booking = storedBookings.find((book) => book.key == formState.key);
    if(Dday <= booking.data.date && booking.data.date <= Sday){
      // and create a new one from storedBooking
      createWeeklyBook(booking);
      // add the proper legend if it isn't already there
      updateLegend();          
    };
  };

  //remove the userMeeting we created
  container.querySelectorAll(".userMeeting.selected").forEach(we => {
    we.remove();
  });

  // Erase and remove the form
  form.reset();
  formContainer.classList.add("displayNone"); 
  formContainer.classList.remove("expanded");

  // Reset userSelection and formState
  resetUserSelection();
  resetFormState();
  //save to localStorage the resetted formState
  localStorage.meetAlixFormState = JSON.stringify(formState);
});

function removeMessage(){
  messageBox.innerHTML = "";
};
window.removeMessage = removeMessage;





  

  //Change the color of the selected range genre orange

  // Ajoute, dans la légende le carré orange et que ça veut dire "Keep Calm and Be Patient! I'm either in an existential crisis, stuck in traffic, or simply at work, or sleeping, or... In any case, you just got to wait!"








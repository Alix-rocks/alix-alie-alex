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
  date: "",  // "2026-07-27"
  time: "",  // "9:00", "14:00", etc
  don: 0
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
    containerFixed: false,
    result: getChoixDureePrix,
    fn: createDuree,
    button_back: false,
    button_next: false,
    isComplete() {
      return true;
    },
    fr: {
      name: "Durée",
      definition: `Choix de la durée<br>de la séance`,
      instruction: `Choisissez la durée de votre séance&#8239;:`,
      exit_ariaLabel: "",
      back_ariaLabel: "",
      next: ""
    },
    en:{
      name: "Duration",
      definition: "",
      instruction: ``,
      exit_ariaLabel: "",
      back_ariaLabel: "",
      next: ""
    }
  }, {
    icon: `<i class="fa-regular fa-calendar"></i>
    <i class="fa-regular fa-clock"></i>`,
    status: "todo", //(to do, doing, done)
    containerFixed: true,
    result: getChoixDateTime,
    fn: createCalendar,
    button_back: true,
    button_next: true,
    isComplete() {
      return choix.date && choix.time;
    },
    fr: {
      name: "Date et heure",
      definition: `Choix de la date<br>puis de l'heure`,
      instruction: `Choisissez la date et l'heure de votre séance&#8239;:`,
      exit_ariaLabel: "Fermer la prise de rendez-vous",
      back_ariaLabel: "Changer la durée",
      next: "suivant"
    },
    en:{
      name: "Date & Time",
      definition: "",
      instruction: ``,
      exit_ariaLabel: "Close booking wizard",
      back_ariaLabel: "Change the duration",
      next: "next"
    }
  }, { // PROFIL ET/OU GOOGLE ACCOUNT!
    icon: `<i class="fa-regular fa-address-card"></i>`,
    status: "todo", //(to do, doing, done)
    containerFixed: true,
    result: getNames,
    fn: createForm,
    button_back: true,
    button_next: true,
    isComplete() {
      return quickValidateForm();
      // return form.checkValidity();
    },
    fr: {
      name: "Profil",
      definition: `Informations personnelles<br>et consentements`,
      instruction: ``,
      exit_ariaLabel: "Fermer la prise de rendez-vous",
      back_ariaLabel: "Changer la date ou l'heure",
      next: "suivant"
    },
    en:{
      name: "Profil",
      definition: "",
      instruction: ``,
      exit_ariaLabel: "Close booking wizard",
      back_ariaLabel: "Change the date or time",
      next: "next"
    }
  }, {
    icon: `<i class="fa-solid fa-hand-holding-dollar"></i>`,
    status: "todo", //(to do, doing, done)
    containerFixed: true,
    result: getChoixDon,
    button_back: true,
    button_next: true,
    isComplete() {
      return true;
    },
    fr: {
      name: "Contribution",
      definition: `Possibilité de faire une<br>contribution volontaire`,
      instruction: ``,
      exit_ariaLabel: "Fermer la prise de rendez-vous",
      back_ariaLabel: "Retour au profil",
      next: "suivant"
    },
    en:{
      name: "Contribution",
      definition: "Volontary Contribution",
      instruction: ``,
      exit_ariaLabel: "Close booking wizard",
      back_ariaLabel: "Go back to profil",
      next: "next"
    }
  }, {
    icon: `<i class="fa-regular fa-credit-card"></i>`,
    status: "todo", //(to do, doing, done)
    containerFixed: true,
    button_back: true,
    button_next: true,
    isComplete() {
      return true;
    },
    fr: {
      name: "Paiement",
      definition: `Paiement<br>de la séance`,
      instruction: ``,
      exit_ariaLabel: "Fermer la prise de rendez-vous",
      back_ariaLabel: "Retour aux contribution volontaire",
      next: "confirmer"
    },
    en:{
      name: "Payment",
      definition: "",
      instruction: ``,
      exit_ariaLabel: "Close booking wizard",
      back_ariaLabel: "Go back to volontary contribution",
      next: "next"
    }
  }
];



const seances = {
  virtuelle: {
    title: {
      fr: `Prise de rendez-vous pour<br>une séance virtuelle avec Alie`,
      en: `Booking a virtual session<br>with Alie`
    },
    services: [
      {
        id: "sv_1h00",
        h4: `1&#8239;heure`,
        prix: 15,
        duree: "1:00",
        avant: "1:00",
        apres: "1:00"
      },
      {
        id: "sv_1h30",
        h4: `1&#8239;heure 30&#8239;min`,
        prix: 30,
        duree: "1:30",
        avant: "1:00",
        apres: "1:00"
      },
      {
        id: "sv_2h00",
        h4: `2&#8239;heures`,
        prix: 45,
        duree: "2:00",
        avant: "1:00",
        apres: "1:00"
      }
    ]
  }
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
let first = new Date();
first.setDate(today.getDate() - today.getDay());
let last = new Date();
// last.setDate(today.getDate() + 21 + (6 - today.getDay()));
last.setDate(first.getDate() + 27);
let yearFirst = first.getFullYear();
let yearLast = last.getFullYear();
// let monthFirst = date.getMonth();
let monthNameFirst = first.toLocaleString(lang, { month: 'long' }).toLocaleUpperCase();
let monthNameLast = last.toLocaleString(lang, { month: 'long' }).toLocaleUpperCase();

//MARK: LOCALSTORAGE

function getChoixFromLocalStorage() {
  try {
    const saved = localStorage.getItem("meetCaliaChoix");

    if (saved !== null) {
      choix = JSON.parse(saved);
    };
  }
  catch (error) {
    console.error("Couldn't load booking choices:", error);

    localStorage.removeItem("meetCaliaChoix");
  };
};

function saveChoixToLocalStorage() {
  console.log(choix);
  try {
    localStorage.setItem("meetCaliaChoix", JSON.stringify(choix));
  }
  catch (error) {
    console.error("Couldn't save booking choices:", error);
  };
};

//MARK: START

const bookingDiv = document.querySelector("#booking");
const service = seances?.[bookingDiv.dataset.service];
const exitButton = document.createElement("button");
exitButton.className = "exit-button";
exitButton.setAttribute("aria-label", `${steps[currentStep]?.[langShort]?.exit_ariaLabel}`);
exitButton.innerHTML = `<i class="typcn typcn-times"></i>`;
const titleSection = document.createElement("div");
titleSection.className = "title-section";
titleSection.innerHTML = `<h2 id="booking-title" class="h3-style">${service.title?.[langShort]}</h2>`;
const progressSection = document.createElement("div");
progressSection.className = "progress-section";
const backSection = document.createElement("div");
backSection.className = "back-section";
backSection.innerHTML= `<button id="back-button" aria-label="${steps[currentStep]?.[langShort]?.back_ariaLabel}"><i class="typcn typcn-chevron-left-outline"></i></button><h3 id="booking-step-title" class="h2-style"></h3>`;
const nextSection = document.createElement("div");
nextSection.className = "next-section";
nextSection.innerHTML= `<button class="next-button">${steps[currentStep]?.[langShort]?.next}<i class="typcn typcn-chevron-right-outline"></i></button>`;
const bookingSection = document.createElement("div");
bookingSection.className = "booking-section";
bookingSection.setAttribute("aria-labelledby", "booking-step-title");
bookingSection.setAttribute("aria-live", "polite");
const timeSection = document.createElement("div");
timeSection.className = "booking-time-flex";
timeSection.setAttribute("aria-live", "polite");
getChoixFromLocalStorage();
bookingCreator();

function bookingCreator(){
  bookingDiv.append(exitButton, titleSection, progressSection, backSection, bookingSection);
  backSection.querySelector("button").addEventListener("click", backStep);
  createProgress();
  createDuree();
  updateScrollIndicators();
};

function updateScrollIndicators() {
  console.log("updateScrollIndicators");
  if(getComputedStyle(bookingDiv).position === "fixed"){
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = bookingSection;

    const canScroll =
      scrollHeight > clientHeight;

    const canScrollUp =
      canScroll && scrollTop > 0;

    const canScrollDown =
      canScroll && scrollTop + clientHeight < scrollHeight;

    backSection.classList.toggle("can-scroll-up", canScrollUp);

    nextSection.classList.toggle("can-scroll-down", canScrollDown);
  } else{
    backSection.classList.remove("can-scroll-up");

    nextSection.classList.remove("can-scroll-down");
  };
};

// When user scrolls
bookingSection.addEventListener("scroll", updateScrollIndicators);


// When screen size changes
window.addEventListener("resize", updateScrollIndicators);

const observer = new ResizeObserver(updateScrollIndicators);
observer.observe(bookingSection);

function updateProgress(){
  console.log("updateProgress");
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
  console.log("createProgress");
  progressSection.innerHTML = steps.map((s, idx) => {
    // const result = s.result();
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
      <p>${s.status === "todo" ? `` : s.status === "doing" ? s?.[langShort]?.definition : s.status === "done" ? s.result() : ``}</p>
    </div>`;
  }).join("");
  updateButtons();
};

function updateButtons(){
  console.log("updateButtons currentStep: " + currentStep);
  if(steps[currentStep]?.button_back){
    backSection.querySelector("button").classList.remove("display-none");
  } else{
    backSection.querySelector("button").classList.add("display-none");
  };
  if(steps[currentStep]?.button_next){
    if(!bookingDiv.contains(nextSection)){
      bookingSection.insertAdjacentElement("afterend", nextSection);
      nextSection.querySelector("button").addEventListener("click", nextStep);
    };
    nextSection.querySelector("button").innerHTML = `${steps[currentStep]?.[langShort]?.next}<i class="typcn typcn-chevron-right-outline"></i>`;
  } else{
    if(bookingDiv.contains(nextSection)){
      nextSection.remove();
    };
  };
  backSection.querySelector("h3").innerHTML = `${steps[currentStep]?.[langShort]?.instruction}`;
  console.log("updateButtons done");
};

function updateNextButton() {
  nextSection.querySelector("button").disabled = !steps[currentStep].isComplete();
};

function toggleContainer(){
  console.log("toggleContainer");
  console.log("currentStep " + currentStep);
  if(steps[currentStep]?.containerFixed){
    bookingDiv.classList.add("fixed");
    document.body.style.overflow = "hidden";
  } else{
    bookingDiv.classList.remove("fixed");
    document.body.style.overflow = "";   
  };
};

//MARK: NEXT STEP
function nextStep(){
  console.log("nextStep");
  currentStep++;
  console.log("nextStep currentStep:" + currentStep);
  updateProgress();
  console.log("calling nextStep");
  steps[currentStep]?.fn();
  updateNextButton();
  toggleContainer();
  //updateScrollIndicators();
};

//MARK: BACK STEP
function backStep(){
  console.log("backStep");
  currentStep--;
  updateProgress();
  steps[currentStep]?.fn();
  updateNextButton();
  toggleContainer();
  //updateScrollIndicators();
};

//MARK: STEP 0 - DUREE

function createDuree(){
  console.log("createDuree");
  updateNextButton();
  bookingSection.innerHTML = `<div class="booking-duree-flex"></div>`;
  const dureeSection = bookingSection.querySelector(".booking-duree-flex");
  dureeSection.innerHTML = service.services.map(type => {
    return `<div>
      <h4>${type.h4}</h4>
      <p>${type.prix} $</p>
      <button data-id="${type.id}">Réserver</button>
    </div>`;
  }).join("");
  currentStep = 0;
  addServiceListener();
  updateScrollIndicators();
};
 
function addServiceListener(){
  bookingSection.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      choix.service = service.services.find(type => type.id === btn.dataset.id);
      saveChoixToLocalStorage();
      // updateNextButton();

      // steps[currentStep]?.[langShort]?.result = choix.service.result;
      nextStep();
      // currentStep = 1;
      // updateProgress();
      // createCalendar();
    });
  });
};

//MARK: STEP 1 - DATE

function createCalendar(){
  updateNextButton(); 
  bookingSection.innerHTML = `<div class="booking-date-grid"></div>`;
  const calendarSection = bookingSection.querySelector(".booking-date-grid");
  let arrayItem = [];
  const row_M_Y = `<div class="row-M-Y">${yearFirst === yearLast && monthNameFirst === monthNameLast ? `${monthNameFirst} ${yearFirst}` : `${monthNameFirst} ${yearFirst} / ${monthNameLast} ${yearLast}`}</div>`;
  arrayItem.push(row_M_Y);
  let day = new Date(first);
  for(let d = 0; d < 7; d++){
    let div = `<div class="row-D col-${d}">${new Intl.DateTimeFormat(lang, { weekday: "narrow"}).format(day)}</div>`;
    arrayItem.push(div);
    day.setDate(day.getDate() + 1);
  };
  day = new Date(first);
  let c = 0;
  let r = 0;
  for(let d = 0; d < 28; d++){
    c = c < 7 ? c : 0;
    let date = getDashStringFromDate(day);
    // let date = day.toDateString(); // "Sat Aug 22 2026"
    let availClass = dateAvailCheck(date) && date > todayString ? "available" : "not-available";
    let div = `<button type="button" ${availClass === "available" ? `` : `disabled`} class="row-${r} col-${c} ${availClass}${date === todayString ? ` today aria-current="date"` : ``}" data-date="${date}"${choix.date !== "" && date === choix.date && availClass === "available" ? `aria-pressed="true"` : `aria-pressed="false"`}>${day.getDate()}</button>`;
    arrayItem.push(div);
    day.setDate(day.getDate() + 1);
    c++;
    r++;
  };
  let arrayItems = arrayItem.join("");
  calendarSection.innerHTML = arrayItems;
  currentStep = 1;
  
  if(choix.date !== ""  && calendarSection.querySelector(`button[data-date="${choix.date}"].available`)){
    createListTime(choix.date);
  };
  addDayListeners();
  updateScrollIndicators();
};

function addDayListeners(){
  bookingSection.querySelectorAll(".available").forEach(a => {
    a.addEventListener("click", () => {
      bookingSection.querySelector("button[aria-pressed='true']")?.setAttribute("aria-pressed", "false");
      a.setAttribute("aria-pressed", "true");
      const date = a.dataset.date;
      choix.date = date;
      choix.time = ""; // let's reset time
      saveChoixToLocalStorage();
      updateNextButton();
      currentStep = 1;
      // updateProgress();
      createListTime(date);
    });
  });
};

//MARK: STEP 1 - TIME

function createListTime(date){
  updateNextButton();
  if(!bookingDiv.contains(timeSection)){
    bookingSection.insertAdjacentElement("beforeend", timeSection);
  };  
  let myDateBusiesSlots = getMyDateBusiesSlots(date);
  let availableSlots = getAvailableSlots(myDateBusiesSlots);

  // bookingSection.className = "booking-step3-Flex";
  timeSection.innerHTML = availableSlots.map(slot => {
    let slotTime = slotToTime(slot);
    let avant = choix.service.avant;
    let startTime = timeMath(slotTime, "plus", avant);
    let duree = choix.service.duree;
    let endTime = timeMath(startTime, "plus", duree)
    let text = ``;
    if(langShort === "en"){
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
    return `<label class="time"><input type="radio" name="time" value="${startTime}"${choix.date !== "" && date === choix.date && choix.time !== "" && startTime === choix.time ? ` checked` : ``}>${text}</label>`;
  }).join("");
  currentStep = 1;
  addTimeListeners();
  updateScrollIndicators();
};

function addTimeListeners(){
  timeSection.querySelectorAll('input[name="time"]').forEach(t => {
    t.addEventListener("change", event => {
      // timeSection.querySelector("button[aria-selected='true']")?.setAttribute("aria-selected", "false");
      // t.setAttribute("aria-selected", "true");
      const time = event.target.value;
      choix.time = time;
      saveChoixToLocalStorage();
      updateNextButton();
      // choix.time_result = formattedTime(time);

      // steps[currentStep]?.[langShort]?.result = `${choix.date_result} ${choix.time_result}`;
      // nextStep();
      // currentStep = 2;
      // updateProgress();
      // Create the form!
    })
  })
};

//MARK: STEP 2 - PROFIL
let allInputs = [];
function createForm(){
  // updateNextButton(); 
  bookingSection.innerHTML = `<div class="booking-form-flex">
    <form id="bookingForm" novalidate>
      <fieldset class="form-section">
        <legend>Your information</legend>
        <div class="field">
          <label for="firstName">
            First name <span aria-hidden="true">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autocomplete="given-name"
            minlength="2"
            maxlength="40"
            required
          >
          <small class="error"></small>
        </div>
        <div class="field">
          <label for="lastName">
            Last name <span aria-hidden="true">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autocomplete="family-name"
            minlength="2"
            maxlength="40"
            required
          >
          <small class="error"></small>
        </div>
        <div class="field">
          <label for="email">
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
          >
          <small class="error"></small>
        </div>
        <div class="field">
          <label for="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autocomplete="tel"
            inputmode="tel"
            required
          >
          <small class="error"></small>
        </div>
      </fieldset>
      <fieldset class="form-section">
        <legend>Pronouns</legend>
        <small id="pronouns-error" class="error"></small>
        <label class="choice">
          <input type="radio" name="pronouns" value="she" aria-describedby="pronouns-error">
          She / Her
        </label>
        <label class="choice">
          <input type="radio" name="pronouns" value="he" aria-describedby="pronouns-error">
          He / Him
        </label>
        <label class="choice">
          <input type="radio" name="pronouns" value="they" aria-describedby="pronouns-error">
          They / Them
        </label>
        <label class="choice">
          <input type="radio" name="pronouns" value="other" aria-describedby="pronouns-error">
          Other
        </label>
        <label class="choice">
          <input type="radio" name="pronouns" value="none" aria-describedby="pronouns-error">
          Prefer not to say
        </label>
      </fieldset>
      <fieldset class="form-section">
        <legend>Consents</legend>
        <label class="choice">
          <input
            id="terms"
            type="checkbox"
            required
            aria-describedby="terms-error"
          >
          I have read and agree to the Terms & Conditions.
        </label>
        <small id="terms-error" class="error"></small>
        <label class="choice">
          <input
            id="privacy"
            type="checkbox"
            required
            aria-describedby="policy-error"
          >
          I have read the Privacy Policy.
        </label>
        <small id="policy-error" class="error"></small>
        <label class="choice">
          <input
            id="newsletter"
            type="checkbox"
          >
          I'd like to receive occasional updates.
        </label>
      </fieldset>
    </form>
  </div>`;
  // const formSection = bookingSection.querySelector(".booking-form-flex");
  const form = document.querySelector("#bookingForm");

  // 1. Grab all inputs and convert the NodeList to a standard Array
  const rawInputs = Array.from(form.querySelectorAll("input"));

  // 2. Filter out duplicate radios so we only keep one per group
  allInputs = rawInputs.filter((input, index, array) => {
    if (input.type === "radio") {
      // Keep this radio ONLY if it's the first one in the array with this name
      return array.findIndex(i => i.name === input.name) === index;
    }
    return true; // Keep all text, email, tel, and checkbox inputs
  });
  allInputs.forEach(input=>{
    input.addEventListener("input",()=>{
      clearError(input);
      input.setCustomValidity("");
    });
    input.addEventListener("blur",()=>{
      // const error = getErrorElement(input);
      // error.classList.remove("display-none");
      validateInput(input);
    });
  });
};

const validationMessages = {
  fr: {
    valueMissing: "Ce champ est requis.",
    typeMismatch: "Veuillez entrer une valeur valide.",
    tooShort: "Cette valeur est trop courte.",
    tooLong: "Cette valeur est trop longue.",
    patternMismatch: "Veuillez respecter le format attendu."
  },
  en: {
    valueMissing: "This field is required.",
    typeMismatch: "Please enter a valid value.",
    tooShort: "This value is too short.",
    tooLong: "This value is too long.",
    patternMismatch: "Please match the requested format."
  }
};

function validateInput(input){
  input.setCustomValidity("");
  const error = getErrorElement(input);
  if(error){
    error.textContent = "";
  };
  if(input.validity.valid){
    return true;
  };
  const currentMessages = validationMessages[langShort] || validationMessages["fr"];
  let message = "";
  for(const key in currentMessages){
    if(input.validity[key]){
      message = currentMessages[key];
      break;
    };
  };
  input.setCustomValidity(message);
  if(error){
    error.textContent = message;
  };
  return false;
};

function clearError(input){
  const error = getErrorElement(input);
  if(error){
    error.textContent = "";
  };
};

function getErrorElement(input){
  if (input.hasAttribute("aria-describedby")) {
    return document.getElementById(input.getAttribute("aria-describedby"));
  };
  if(input.closest(".field")){
    return input.closest(".field").querySelector(".error");
  };
  // if(input.type === "checkbox"){
  //   return input.closest("label").nextElementSibling;
  // };
  return null;
};

function validateForm(){
  let valid = true;
  const invalidInputs = [];
  allInputs.forEach(input=>{
    if(!validateInput(input)){
      valid = false;
      invalidInputs.push(input);
    };
  });
  if(invalidInputs.length){
    invalidInputs[0].focus();
    invalidInputs[0].reportValidity();
  };
  return valid;
};

function quickValidateForm(){
  let valid = true;
  allInputs.forEach(input=>{
    if(!quickValidateInput(input)){
      valid = false;
    };
  });
  return valid;
};

function quickValidateInput(input){
  if(input.validity.valid){
    return true;
  };
  return false;
};





//MARK: STEP 3 - PAYMENT

// if(bookingDiv.contains(timeSection)){
//     timeSection.remove();
//   };




//MARK: GETCLIENTDATA

function getChoixDureePrix(){
  let text = ``;
  if(langShort === "en"){
    text = `${choix.service.duree.replace(":", "h").replace("00", "")} for $${choix.service.prix}`;
  } else{
    text = `${choix.service.duree.replace(":", "h").replace("00", "")} à ${choix.service.prix}&#8239;$`;
  };
  return text;
};

function getChoixDateTime(){
  const date = formattedDate(choix.date);
  const time = formattedTime(choix.time);
  let text = ``;
  if(langShort === "en"){
    text = `${date}<br>at ${time}`;
  } else{
    text = `${date}<br>à ${time}`;
  };
  return text;
};

function getNames(){

};

function getChoixDon(){

};

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

function dateAvailCheck(date){
  let myDateBusiesSlots = getMyDateBusiesSlots(date);
  if(myDateBusiesSlots.length === 0) return true; // if there's no busies at all, then the day is available, so we return true
  // 1. check if any are full day long
  const isFullDayLong = myDateBusiesSlots.some(m => m.start <= opened.start && m.end >= opened.end); // checks them all and return true if at least one of them respects the argument
  if(isFullDayLong) return false; // if isFullDayLong is true, that means the whole day is not-available, so we return false
  // 2. then check for each opened slot
  let availableSlots = getAvailableSlots(myDateBusiesSlots);
  if(availableSlots.length > 0) return true;
};

function getMyDateBusiesSlots(date){
  let myDateBusies = myBusies.filter(d => d.date === date);
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
  const nbSlots = threeTimesAdditionToSlots(choix.service.duree, choix.service.avant, choix.service.apres);
  for(let s = opened.start; s < (opened.end + 1 - nbSlots); s++){
    let testEnd = s + nbSlots;
    let isSlotBusy = myDateBusiesSlots.some(m => m.start < testEnd && m.end > s);
    if(!isSlotBusy){
      availableSlots.push(s);
    };
  };
  return availableSlots;
};

function timeAvailCheck(date, time){
  let myDateBusiesSlots = getMyDateBusiesSlots(date);
  let availableSlots = getAvailableSlots(myDateBusiesSlots); // array of slots
  const [timeH, timeM] = choix.time.split(":").map(Number);
  let choix_slot = timeToSlot({ 
    hour: timeH, 
    minute:  timeM})
  const slotIsAvailable = availableSlots.some(s => s === choix_slot);
  return slotIsAvailable;
};

function getDateFromString(date){
  let dalA = date.slice(0, 4);
  let dalM = date.slice(5, 7);
  let dalG = date.slice(8, 10);
  return new Date(dalA, dalM - 1, dalG);
};

function formattedDate(date){ //2026-07-21
  let dateDate = getDateFromString(date);
  return new Intl.DateTimeFormat(lang, {
      dateStyle: "long"
    }).format(dateDate);
};

function formattedTime(time){ // 9:30, 13:00
  let formattedTime;
  if(langShort === "en"){
      const [timeH, timeM] = time.split(":").map(Number);
      const startFormatted = formatTime24to12({
        hour24: timeH, 
        minute: timeM
      });
      formattedTime = `${startFormatted.hour12}:${startFormatted.paddedMinutes} ${startFormatted.period}`;
    } else{
      formattedTime = time.replace(":", "h");
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
      console.log("new busies!");
      // if there are a date or time in choix/steps, then we need to check if it's conflicting with the new busies
      myBusies = myNewBusies;
      // const isDateStillAvailable = dateAvailCheck(choix.date);
      // const isTimeStillAvailable = timeAvailCheck(choix.date, choix.time);

      // scenario 0: the client is at currentStep 0 and haven't seen the calendar yet, so there's nothing to do
      // scenario 1: the client is looking at the calendar but haven't chosen anything yet
        if(currentStep === 1 && choix.date === "" && choix.time === ""){ // date and time step
          // -> update calendar
          createCalendar();
        } else if(currentStep === 1 && choix.date !== "" && choix.time === ""){ // scenario 2: the client has selected a date and is looking at the time (haven't chosen a time yet)
          // -> check if there are still availabilities in that date
          if(!dateAvailCheck(choix.date)){ // if not -> sorry message
            // sorry message
          } else{ // if so -> update time
            createListTime(choix.date);
          };
        }else if(currentStep === 1 && choix.date !== "" && choix.time !== ""){ // scenario 3: the client has selected a date and a time
          // -> check if there are still availabilities in that date
          if(!dateAvailCheck(choix.date)){ // if not -> sorry message
            // sorry message
            
            createCalendar(); // -> update calendar
            // remove time section
          } else{ // there are still availabilities in that date, now we need to check if their chosen time is still available
            createCalendar(); // -> update calendar
            if(timeAvailCheck(choix.date, choix.time)){
              createListTime(choix.date); // but make sure their slot is still selected!
            } else{
              // sorry message
              createListTime(choix.date); // their selected time will have been "erased"
            };
          };
        }else if(currentStep > 1 && choix.date !== "" && choix.time !== ""){ // scenario 4: the client has selected a date and a time but is at a subsequent step (not looking at the calendar/time anymore)
          if(!dateAvailCheck(choix.date)){ // if not -> sorry message
            // sorry message
            // button in message sends to step 1
          } else{ // there are still availabilities in that date, now we need to check if their chosen time is still available
            if(!timeAvailCheck(choix.date, choix.time)){
              // sorry message
              // button in message sends to step 1
            }; // if the time is still available, we don't need to do anything
          }; 
        };
      
      
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
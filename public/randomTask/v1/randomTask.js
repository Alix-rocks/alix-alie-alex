//Before currentTaskInfo

/** When you commit/push a big changes:
 * Run the code in the sandbox first to make the changes thanks to lines (in getTaskSettings AND in getDones), then upload the changes to firestore, then remove these lines (in getTaskSettings AND in getDones), THEN commit and push
**/

/* KEYBOARD SHORTCUTS
  Shift + Alt + A => Block Comment
  Ctrl + K ... Ctrl + 1 => Fold all the first levels
*/

import { app, analytics, db, auth, provider, getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp, getAuth, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, onAuthStateChanged, rtdb, get, onChildAdded, ref, remove } from "../../myFirebase.js";
import trans from "../../trans.js";
auth.languageCode = 'fr';

const cloudIt = document.querySelector("#cloudIt");
const earthIt = document.querySelector("#earthIt");
const movingzone = document.querySelector("#movingzone");

console.log(import.meta.url); 

getRedirectResult(auth)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
}).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    // const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
});

function logIn(){
  console.log("logIn");
  console.log(auth);
  console.log(provider);
  signInWithRedirect(auth, provider);
  console.log(user);
};
let userConnected = false;
onAuthStateChanged(auth, (user) => {
  if(user){
    userConnected = true;
    console.log(user);
    
    getCloudBC();
    getTasksSettings();
    getDones();
    settingsPage();
    // createBody();
    // getWeeklyCalendar();
    // logInScreen.classList.add("displayNone");
    if(auth.currentUser.email == "alexblade.23.49@gmail.com"){
      loadBookings();
    };
  } else{
    userConnected = false;
    console.log("no user");
    document.getElementById("loadingScreen").classList.replace("waitingScreen", "displayNone");
    logInScreen.classList.remove("displayNone");
    logInBtn.addEventListener("click", logIn);
    tryBtn.addEventListener("click", freeIn);
    cloudIt.classList.add("displayNone");
    earthIt.classList.add("displayNone");
  };
});

function logOut(){
  signOut(auth).then(() => {
    // Sign-out successful.
    localStorage.clear();
    location.reload();
  }).catch((error) => {
    // An error happened.
  });
};
window.logOut = logOut;

function isItOpenHour(){
  let todayDate = new Date();
  //lundi (1) au vendredi (5)
  let weekDays = [1, 2, 3, 4, 5];
  let todayDay = todayDate.getDay();
  //de 8 à 5
  let currentHour = String(todayDate.getHours()).padStart(2, "0");
  let currentMinute = String(todayDate.getMinutes()).padStart(2, "0");
  let currentTime = `${currentHour}:${currentMinute}`;

  return weekDays.includes(todayDay) && currentTime >= "08:00" && currentTime < "17:00" ? true : false;
};



// *** START
let searchSwitch = false;
let projectSwitch = false;
let openHourSwitch = isItOpenHour();
let openHourToggle = isItOpenHour(); //on pourrait le rajouter dans les settings
document.querySelector("#openHourTogglerInput").checked = openHourToggle ? true : false;
let listTasks = [];
let listDones = [];
let myBusies = [];
let mySettings = {
  mySide: "light",
  myTomorrow: "00:00",
  myFavoriteView: "switchPageInputList",
  myFirstDayOfTheWeek: "domenica",
  mySleepZones: true,
  myWeeksDayArray: [{
    day: 0,
    name0Maj: "domenica",
    name1Maj: "Domenica",
    nameNoAcc: "domenica",
    letter: "D",
    code: "D0",
    clockIn: "10:00", // meIn (for me), businessIn (for Calia), socialIn (for friends)
    clockOut: "02:00" // meOut (for me), businessOut (for Calia), socialOut (for friends)
  }, {
    day: 1,
    name0Maj: "lunedì",
    name1Maj: "Lunedì",
    nameNoAcc: "lunedi",
    letter: "L",
    code: "L1",
    clockIn: "10:00",
    clockOut: "02:00"
  }, {
    day: 2,
    name0Maj: "martedì",
    name1Maj: "Martedì",
    nameNoAcc: "martedi",
    letter: "M",
    code: "M2",
    clockIn: "10:00",
    clockOut: "02:00"
  }, {
    day: 3,
    name0Maj: "mercoledì",
    name1Maj: "Mercoledì",
    nameNoAcc: "mercoledi",
    letter: "M",
    code: "M3",
    clockIn: "10:00",
    clockOut: "02:00"
  }, {
    day: 4,
    name0Maj: "giovedì",
    name1Maj: "Giovedì",
    nameNoAcc: "giovedi",
    letter: "G",
    code: "G4",
    clockIn: "10:00",
    clockOut: "02:00"
  }, {
    day: 5,
    name0Maj: "venerdì",
    name1Maj: "Venerdì",
    nameNoAcc: "venerdi",
    letter: "V",
    code: "V5",
    clockIn: "10:00",
    clockOut: "02:00"
  }, {
    day: 6,
    name0Maj: "sabato",
    name1Maj: "Sabato",
    nameNoAcc: "sabato",
    letter: "S",
    code: "S6",
    clockIn: "10:00",
    clockOut: "02:00"
  }],
  myShowTypes: [],
  //myLabels: [],
  //myProjects: [], ???
  //myBaseColors: [],
  mySorting: []
};

let mySections = [{
  id: "urges",
  h3: `<span style="text-decoration-color: red;"><span style="color:red;">PRI</span><span style="color:#ff8400;">ORI</span><span style="color:#ffd000;">TY!</span></span>`,
  h5: `Once these are done, then you can go play with the other ones!`,
  togglable: true,
  default: "open",
  ifEmpty: "hide",
  sortable: false
}, {
  id: "actions",
  h3: `<span style="text-decoration-color: green;"><span style="color:green;">NEXT</span> <span style="color:blue;">ACTI</span><span style="color:purple;">ONS!</span></span>`,
  h5: `These are easy. I'VE GOT THIS!`,
  togglable: true,
  default: "open",
  ifEmpty: "hide",
  sortable: true
}, {
  id: "currentProject",
  title: "CURRENT PROJECTS",
  color: "#600061",
  h5: `Let's stick to those for now please...`,
  togglable: true,
  default: "open",
  ifEmpty: "hide",
  sortable: true
}, {
  id: "next",
  title: "NEXT",
  color: "darkgreen",
  h5: `Soon, soon it'll be your turn...`,
  togglable: true,
  default: "closed",
  ifEmpty: "hide",
  sortable: true
}, {
  id: "whenever",
  title: "WHENEVER",
  color: "midnightblue",
  h5: `The never ending list...`,
  togglable: true,
  default: "closed",
  addon: `<div class="listToggleList">
            <div class="relDiv">
              <h4 class="subList">The long term shit</h4>
              <div class="sortlistWhole">
                <input id="sortlongTermList" class="sortlistInput cossin" type="checkbox" />
                <div class="sortlistDiv">
                  <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
                  <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
                  <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
                  <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
                </div>
                <label for="sortlongTermList" class="sortlistLabel">
                  <i class="fa-solid fa-ellipsis sortUnchecked"></i>
                  <i class="typcn typcn-tick sortChecked"></i>
                </label>
              </div>
            </div>
            <ul id="longTermList" class="sortedList" data-sort="color"></ul>
            <div class="relDiv">
              <h4 class="subList">The one time thingies</h4>
              <div class="sortlistWhole">
                <input id="sortoneTimeList" class="sortlistInput cossin" type="checkbox" />
                <div class="sortlistDiv">
                  <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
                  <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
                  <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
                  <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
                </div>
                <label for="sortoneTimeList" class="sortlistLabel">
                  <i class="fa-solid fa-ellipsis sortUnchecked"></i>
                  <i class="typcn typcn-tick sortChecked"></i>
                </label>
              </div>
            </div> 
            <ul id="oneTimeList" class="sortedList" data-sort="color"></ul>
          </div>`,
  ifEmpty: "hide",
  //sortable: true
}, {
  id: "always",
  title: "ALWAYS",
  color: "goldenrod",
  h5: `Forever and ever...`,
  togglable: true,
  default: "closed",
  ifEmpty: "hide",
  sortable: true
}, {
  id: "wait",
  title: "WAITING",
  color: "rgb(100, 122, 122)",
  h5: `Wait for it...`,
  togglable: true,
  default: "closed",
  ifEmpty: "hide",
  sortable: true
}, {
  id: "think",
  title: "THINKING",
  color: "rgb(100, 122, 122)",
  h5: `Thinking about it...`,
  togglable: true,
  default: "closed",
  ifEmpty: "hide",
  sortable: true
}, {
  id: "idea",
  title: "Random Ideas",
  color: "rgb(239, 125, 144)",
  h5: `It's a <em>maybe-one-day-probably-never</em> kinda thing...`,
  togglable: true,
  default: "closed",
  ifEmpty: "hide",
  sortable: true
}, {
  id: "nevermind",
  title: "Nevermind",
  color: "rgba(47, 79, 79, .4)",
  h5: `Don't look, I'm trying to forget about these...`,
  togglable: true,
  default: "closed",
  ifEmpty: "hide",
  sortable: true
}, {
  id: "scheduled",
  title: "Scheduled",
  color: "inherit",
  h5: `All in good time...`,
  togglable: true,
  default: "closed",
  ifEmpty: "hide",
  sortable: false
}, {
  id: "recurring",
  title: "Recurring",
  color: "inherit",
  h5: `Don't worry, they'll be back...`,
  togglable: true,
  default: "closed",
  ifEmpty: "hide",
  sortable: true
}]


// `<section id="${sect.id}">
//   <input id="${sect.id}Input" type="checkbox" class="cossin listToggleInput" ${sect.default == "open" ? `checked` : ``} />
//   <div>
//     <label for="${sect.id}Input" class="listToggleLabel">
//       <h3>${sect.h3 ? sect.h3 : `<span style="text-decoration-color: ${sect.color}; color:${sect.color};">${sect.title}</span>`}</h3>
//       <h5>${sect.h5}</h5>
//       <span class="typcn typcn-chevron-right-outline listToggleChevron"></span>
//     </label>
//     <div class="listToggleList">
//       ${sect.sortable ? `<div class="relDiv noH4SubList noH4SubListClosed">
//         <!-- <h4 class="subList"></h4> -->
//         <div class="sortlistWhole">
//           <input id="sort${sect.id}List" class="sortlistInput cossin" type="checkbox" />
//           <div class="sortlistDiv">
//             <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
//             <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
//             <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
//             <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
//           </div>
//           <label for="sort${sect.id}List" class="sortlistLabel">
//             <i class="fa-solid fa-ellipsis sortUnchecked"></i>
//             <i class="typcn typcn-tick sortChecked"></i>
//           </label>
//         </div>
//       </div> ` : ``}
//       <ul id="${sect.id}List" class="sortedList" data-sort="color"></ul>
//     </div>
//   </div>
// </section>`



//localStorage.mySettings = JSON.stringify(mySettings);
let cBC;
let baseColors = [{
  colorBG: "var(--tx-color)", //black
  colorTX: "var(--bg-color)", //white
}, {
  colorBG: "orange", //yellow
  colorTX: "darkslategrey", //black
  tag: "people"
}, {
  colorBG: "red", //red
  colorTX: "darkslategrey", //black
  tag: "urgent"
}, {
  colorBG: "darkmagenta", //mauve
  colorTX: "white", //white
  tag: "errand"
}, {
  colorBG: "forestgreen", //green
  colorTX: "white", //white
  tag: "physic"
}, {
  colorBG: "mediumpurple", //mediumpurple
  colorTX: "darkslategrey", //black
  tag: "cell"
}, {
  colorBG: "dodgerblue", //blue
  colorTX: "darkslategrey", //black
  tag: "screen"
}, {
  colorBG: "darkslategrey", //black
  colorTX: "white", //white
  tag: "else"
}];
let colorsList = [ //showTypeChoices
{ // 0
  colorBG: "white", //white
  colorBG5: "rgba(255, 255, 255, .5)", //white 50%
  colorTX: "darkslategrey"
}, { // 1
  colorBG: "darkslategrey", //black
  colorBG5: "rgba(47, 79, 79, .5)", //black 50%
  colorTX: "white"
}, { // 2
  colorBG: "#7F7F7F", //grey
  colorBG5: "rgba(127, 127, 127, .5)", //grey 50%
  colorTX: "white"
}, { // 3
  colorBG: "goldenrod", //yellow
  colorBG5: "rgba(218, 165, 32, .5)", //yellow 50%
  colorTX: "darkslategrey"
}, { // 4
  colorBG: "#D5792B", //orange
  colorBG5: "rgba(213, 121, 43, .5)", //orange 50%
  colorTX: "darkslategrey"
}, { // 5
  colorBG: "crimson", //red
  colorBG5: "rgba(220, 20, 60, .5)", //red 50%
  colorTX: "white"
}, { // 6
  colorBG: "#C54776", //pink
  colorBG5: "rgba(197, 71, 118, .5)", //pink 50%
  colorTX: "white"
}, { // 7
  colorBG: "darkmagenta", //magenta
  colorBG5: "rgba(139, 0, 139, .5)", //magenta 50%
  colorTX: "white"
}, { // 8
  colorBG: "#895DBC", //mauve
  colorBG5: "rgba(137, 93, 188, .5)", //mauve 50%
  colorTX: "white"
}, { // 9
  colorBG: "#2E7BCD", //bleue
  colorBG5: "rgba(46, 123, 205, .5)", //bleue 50%
  colorTX: "white"
}, { // 10
  colorBG: "#06a9a9", //bleu-vert
  colorBG5: "rgba(6, 169, 169, .5)", //bleu-vert 50%
  colorTX: "darkslategrey"
}, { // 11
  colorBG: "#3B9869", //green
  colorBG5: "rgba(59, 152, 105, .5)", //green 50%
  colorTX: "white"
}];
let switchSortArray = ["fa-solid fa-arrow-right-arrow-left fa-rotate-90", "fa-solid fa-folder-closed fa-rotate-270", "fa-solid fa-hashtag", "fa-regular fa-hourglass-half", "typcn typcn-tag sortingTag", "fa-solid fa-arrow-down-a-z", "fa-solid fa-icons"];
let icons = ["fa-solid fa-comments", "fa-solid fa-lightbulb", "fa-solid fa-dollar-sign", "fa-solid fa-spider", "fa-solid fa-gavel", "fa-solid fa-couch", "fa-solid fa-head-side-virus", "fa-solid fa-screwdriver-wrench", "fa-solid fa-universal-access", "fa-solid fa-droplet", "fa-solid fa-code", "fa-solid fa-poo", "fa-solid fa-globe", "fa-solid fa-briefcase", "fa-solid fa-brain", "fa-solid fa-champagne-glasses", "fa-solid fa-seedling", "fa-solid fa-utensils", "fa-solid fa-heart-pulse", "fa-solid fa-sun", "fa-solid fa-broom", "fa-solid fa-people-group", "fa-solid fa-bullhorn", "fa-solid fa-magnifying-glass", "fa-solid fa-heart", "fa-solid fa-cake-candles", "fa-regular fa-hourglass-half", "fa-solid fa-road", "fa-solid fa-envelopes-bulk", "fa-solid fa-person-chalkboard", "fa-solid fa-house", "fa-regular fa-image", "fa-solid fa-music", "fa-solid fa-paperclip", "fa-solid fa-cart-shopping", "fa-solid fa-car-side", "fa-solid fa-mug-hot", "fa-solid fa-gift", "fa-solid fa-inbox", "fa-solid fa-trash", "fa-solid fa-bookmark", "fa-solid fa-book", "fa-regular fa-eye", "fa-solid fa-gears", "fa-solid fa-ticket", "fa-solid fa-tree", "fa-solid fa-hashtag", "fa-solid fa-dumpster-fire", "fa-regular fa-handshake", "fa-solid fa-snowflake", "fa-regular fa-sun", "fa-solid fa-stethoscope", "fa-solid fa-hand-holding-heart", "fa-solid fa-question", "fa-regular fa-credit-card", "fa-solid fa-mobile-screen-button", "fa-solid fa-laptop", "fa-solid fa-signature", "fa-solid fa-joint", "fa-solid fa-voicemail", "fa-solid fa-dumbbell", "fa-solid fa-weight-scale", "fa-solid fa-transgender", "fa-solid fa-tooth", "fa-solid fa-shoe-prints", "fa-solid fa-piggy-bank", "fa-solid fa-microscope", "fa-solid fa-masks-theater", "fa-solid fa-laptop-code", "fa-solid fa-kitchen-set", "fa-solid fa-hand-middle-finger", "fa-solid fa-dove", "fa-regular fa-face-grin-stars", "fa-regular fa-face-grin-hearts", "fa-regular fa-face-grin-squint", "fa-regular fa-face-smile-wink", "fa-regular fa-face-meh-blank", "fa-regular fa-face-flushed", "fa-regular fa-face-grimace", "fa-regular fa-face-rolling-eyes", "fa-regular fa-face-grin-beam-sweat", "fa-regular fa-face-surprise", "fa-regular fa-face-frown-open", "fa-regular fa-face-frown", "fa-regular fa-face-sad-tear", "fa-regular fa-face-tired", "fa-regular fa-face-sad-cry", "fa-regular fa-face-dizzy", "fa-regular fa-face-angry", "fa-solid fa-ban noIcon"];
let contactList = [
  {
    id: "1234",
    nickname: "Dave",
    prenom: "David",
    nom: "Gadoury",
    phone: "", //(si textos)
    email: "", //(si email)
    adresse: "",
    spaces: ["Messenger"], //(en ordre de préférence)
    groups: ["perso"], //caliaPR, caliaClient, caliaLead(potential client), perso, PAB, etc
    langue: ["fr"] //fr (français), en(english), fe(franglish)
  },
  {
    id: "1254",
    nickname: "Niamh",
    prenom: "Niamh",
    nom: "Devaney",
    phone: "", //(si textos)
    email: "", //(si email)
    adresse: "",
    spaces: ["Messenger"], //(en ordre de préférence)
    groups: ["perso"], //caliaPR, caliaClient, caliaLead(potential client), perso, PAB, etc
    langue: ["en"] //fr (français), en(english), fe(franglish)
  }
];

let previousPage;
const pageEvent = new Event("click");
(() => {
  document.querySelectorAll('input[name="switchPageRadios"]').forEach(radio => {
    radio.addEventListener("click", () => {
      if(radio.id == "switchPageInputSetting"){
        let previousPages = document.getElementsByClassName("bottomBtn menuLabel whiteOnPurple");
        previousPage = previousPages[0].dataset.page;
        settingsPage();
      };
      if(radio.id == "switchPageInputSearch"){
        let previousPages = document.getElementsByClassName("bottomBtn menuLabel whiteOnPurple");
        previousPage = previousPages[0].dataset.page;
        searchShowType();
      };
      document.querySelector("#switchMenuInput").checked = false;
      document.querySelectorAll(".onePage").forEach(page => {
        page.classList.add("displayNone");
      });
      let wantedPage = radio.nextElementSibling;
      wantedPage.classList.remove("displayNone");
      movingzone.className = `${wantedPage.dataset.movingzone}`;
      // window.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0 });
      document.querySelectorAll('input[name="switchPageRadios"]').forEach(radio => {
        radio.labels.forEach(label => {
          label.classList.replace("whiteOnPurple", "purpleOnWhite");
        });
      });
      radio.labels.forEach(label => {
        label.classList.replace("purpleOnWhite", "whiteOnPurple");
      });
    });
  });
})();

function getCloudBC(){
  if(localStorage.getItem("cBC")){
    cBC = localStorage.cBC;
    let cBCD = cBC >= 10 ? 1 : "." + cBC;
    cloudIt.style.backgroundColor = "rgba(237, 20, 61, " + cBCD + ")";
  } else {
    cBC = 0;
    localStorage.setItem("cBC", cBC);
  };
};

// MARK: getBookings
let bookingQueue = [];
async function loadBookings() {
  const snapshot = await get(ref(rtdb, "meetAlix"));
  if (!snapshot.exists()) return;

  bookingQueue = Object.entries(snapshot.val()).map(
    ([id, data]) => ({ id, ...data })
  );
  bookingQueue.sort((a, b) => a.timestamp - b.timestamp);
  console.log(bookingQueue[0]);
  updateInbox();
};

onChildAdded(ref(rtdb, "meetAlix"), (snap) => {
  const booking = { id: snap.key, ...snap.val() };

  bookingQueue.push(booking);
  updateInbox();
});

const newBookingAlert = document.querySelector("#newBookingAlert");
const newBookingList = document.querySelector("#newBookingList");
function updateInbox(){
  console.log(bookingQueue);
  newBookingAlert.innerText = bookingQueue.length;
  if(!bookingQueue.length){ // bookingQueue.length == 0
    newBookingAlert.classList.add("displayNone");
  } else{
    newBookingAlert.classList.remove("displayNone");
  };
  newBookingList.innerHTML = bookingQueue.map(meet => {
    return `<li data-rtdbKey="${meet.id}" onclick="toTIdeBQaC(this)">${meet.name}</li>`
  }).join("");
};

function toTIdeBQaC(thisOne){
  const key = thisOne.dataset.rtdbKey;
  const info = bookingQueue.find((meet) => meet.id == key);

  let todo = {
    newShit: true,
    id: crypto.randomUUID(),
    task: `Meet with ${info.name}`, 
    info: `Why: ${info.why}
    email: ${info.email}
    cell: ${info.cell}
    messengerName: ${info.messengerName}
    whatsAppNumber: ${info.whatsAppNumber}`,
    color: "0",
    icon: "fa-solid fa-hand-holding-heart",
    term: "showThing",
    busy: true,
    line: "todoDay",
    startDate: info.date,
    stopDate: info.date,
    startTime: info.dalle,
    stopTime: info.alle,
    tutto: false,
    busy: true,
    rtdbKey: key
  };

  if(info.type == "friend"){
    todo.showType = "Myself";
    todo.STColorBG = "#06a9a9";
    todo.STColorTX = "darkslategrey";
  };

  switch(info.where){
    case "messenger":
      todo.where = "Messenger";
      break;
    case "googleMeet":
      todo.where = "Google Meet";
      break;
    case "whatsApp":
      todo.where = "WhatsApp";
      break;
    case "myRealWorld":
      todo.where = "home";
      break;
    case "yourRealWorld":
     todo.where = info.yourAddress;
      break;
    case "elseRealWorld":
      todo.where = info.whereReal;
      break;
    default:
      console.log("oups!");
      break;
  };


  taskAddAllInfo(todo);

};
window.toTIdeBQaC = toTIdeBQaC;


let lastUpdateLocalStorageRandomTask = "";
let lastUpdateFireStore = "";

// MARK: getTasksSettings
let hierOggiTime;
let oggiDemainTime;
async function getTasksSettings() {
  const getTasks = await getDoc(doc(db, "randomTask", auth.currentUser.email));
  //lastUpdate
  if(localStorage.getItem("lastUpdateLocalStorageRandomTask")){
    lastUpdateLocalStorageRandomTask = localStorage.lastUpdateLocalStorageRandomTask;
  };
  if(getTasks.exists() && getTasks.data().lastUpdateFireStore){
    lastUpdateFireStore = getTasks.data().lastUpdateFireStore;
  };
  if((lastUpdateLocalStorageRandomTask !== "" && lastUpdateFireStore !== "" && lastUpdateLocalStorageRandomTask < lastUpdateFireStore) || lastUpdateLocalStorageRandomTask == ""){
    earthIt.style.backgroundColor = "rgb(237, 20, 61)";
  };
  //console.log(getTasks.data().mySettings);
  //mySettings
  if(localStorage.getItem("mySettings")){
    mySettings = JSON.parse(localStorage.mySettings);
  } else if(getTasks.exists() && getTasks.data().mySettings){
    mySettings = getTasks.data().mySettings;
    localStorage.mySettings = JSON.stringify(mySettings);
  } else{
    localStorage.mySettings = JSON.stringify(mySettings);
  };

  if(!mySettings.myBaseColors){
    mySettings.myBaseColors = baseColors;
    localStorage.mySettings = JSON.stringify(mySettings);
  };

  //Inserion de la date d'aujourd'hui
  document.getElementById("todaysDateSpan").innerHTML = getTodayDateString();
  document.getElementById("todaysDaySpan").innerHTML = getDayNameFromString(getTodayDateString());
  //firstPage favorite view
  document.getElementById(mySettings.myFavoriteView).checked = true;
  document.getElementById(mySettings.myFavoriteView).dispatchEvent(pageEvent);
  //light or dark mode
  if(mySettings.mySide == "light"){
    // document.getElementById("switchModeBall").className = "ballLight";
    // document.getElementById("switchModeBallUnder").className = "ballLight";
    document.querySelector(':root').style.setProperty('--bg-color', 'rgb(242, 243, 244)');
    document.querySelector(':root').style.setProperty('--bg-color-7', 'rgba(242, 243, 244, .7)');
    document.querySelector(':root').style.setProperty('--tx-color', 'darkslategrey');
  } else if(mySettings.mySide == "dark"){
    // document.getElementById("switchModeBall").className = "";
    // document.getElementById("switchModeBallUnder").className = "";
    document.querySelector(':root').style.setProperty('--bg-color', 'rgb(7, 10, 10)');
    document.querySelector(':root').style.setProperty('--bg-color-7', 'rgba(7, 10, 10, .7)');
    document.querySelector(':root').style.setProperty('--tx-color', 'rgba(242, 243, 244, .8)');
  };
  //labels
  if(mySettings.myLabels && mySettings.myLabels.length > 0){
    myLabelsGeneralChoice();
  };

  //listTasks
  if(localStorage.getItem("listTasks")){
    listTasks = JSON.parse(localStorage.listTasks);
  } else if(getTasks.exists() && getTasks.data().listTasks){
    listTasks = getTasks.data().listTasks;
    localStorage.listTasks = JSON.stringify(listTasks);
  } else{
    localStorage.listTasks = JSON.stringify([]);
  };
  colorUrges("first");
  localStorage.listTasks = JSON.stringify(listTasks);

  hierOggiTime = timeLimit("hierOggi");
  oggiDemainTime = timeLimit("oggiDemain");
  
  listTasks.forEach(todo => {
    
    if(!todo.pPosition || (todo.pPosition && todo.pPosition == "out")){
      //We could remove most of the recurryDates of the recurring var==anno that still have like 48 recurryDates in their array...!

      todoCreation(todo);
    };
  });
  localStorage.listTasks = JSON.stringify(listTasks);

  updateArrowsColor();
  // those that have an array, in mySettings.mySorting could have the class sortedList remove and so not be considered by sortItAll()
  if(mySettings.mySorting){ //cleaning justInCase
    for(let i = mySettings.mySorting.length - 1; i >= 0; i--){
      let list = document.getElementById(mySettings.mySorting[i].list);
      if(!list){
        mySettings.mySorting.splice(i, 1);
      };
    };
    localStorage.mySettings = JSON.stringify(mySettings);
    mySettings.mySorting.forEach((mySort, idx) => {
      let liste = document.getElementById(mySort.list);
      if(liste){
        liste.classList.remove("sortedList");
        let div = document.querySelector("#sort" + mySort.list + " + div.sortlistDiv");
        let i = 0;
        div.querySelectorAll("button > i").forEach(icon => {
          icon.className = mySort.sort[i];
          icon.style.color = mySort.sort[i] == switchSortArray[0] ? "slategrey" : "var(--tx-color)" ;
          i++;
        });
        sortItWell(idx);
      };
    });
  };
  
  sortItAll(); //for the lists that don't have a mySettings.mySorting
};
//{collection} randomTask
  //{document} email
    //{collection} mySchedule
      //{document} myBusies: [{type:_(sempre/once), date:_, col:_, start:_, end:_}, {}] (busy)

/* 
mySchedule = {
  weeksDayArray = [{
    day: 0,
    name: "dimanche",
    letter: "D",
    code: "D0",
    socialIn: "11-00",
    socialOut: "23-00"
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
}
*/

function myLabelsGeneralChoice(){
  let labelDivs = mySettings.myLabels.map((label, idx) => {
    return `<input id="myLabel${idx}" type="radio" name="labelRadio" class="displayNone" value="${idx}" /><label for="myLabel${idx}" id="myLabelLabel${idx}" class="labelLabel labelLabelRadio" style="color:${colorsList[label.color].colorBG};"><div style="background-color:${colorsList[label.color].colorBG};"></div>${label.name}</label>`;
  }).join("");
  document.querySelector("#labelSelectionDiv").innerHTML = `<input id="myLabels" type="checkbox" class="displayNone" /><label for="myLabels" class="labelLabel labelLabelCheck"><div></div>Label</label><div id="myLabelsList">
    <input id="myLabelAll" type="radio" name="labelRadio" class="displayNone" value="All" checked /><label for="myLabelAll" id="myLabelLabelAll" class="labelLabel labelLabelRadio" style="color:var(--tx-color); background-color:var(--tx-color-5); align-items: center;"><div style="background-color:var(--tx-color);"></div><span style="flex-shrink: 10; font-size: 10px; line-height: 10px;">Toute</br>la gang</span></label>
    ${labelDivs}
    <input id="myLabelNone" type="radio" name="labelRadio" class="displayNone" value="None" /><label for="myLabelNone" id="myLabelLabelNone" class="labelLabel labelLabelRadio" style="color:var(--tx-color); align-items: center;"><div style="background-color:var(--tx-color);"></div><span style="flex-shrink: 10; font-size: 12px; line-height: 12px;">no label</span></label>
  </div>`;
  document.querySelectorAll('input[name="labelRadio"]').forEach(radio => {
    radio.addEventListener("click", () => {
      document.querySelectorAll(".labelLabelRadio").forEach(label =>{
        label.style.backgroundColor = "var(--bg-color)";
        document.querySelector("#todoZone").querySelectorAll("ul").forEach(ul => {
          ul.innerHTML = "";
        });
      });
      if(radio.checked){
        if(radio.value == "All" || radio.value == "None"){
          document.querySelector("#myLabelLabel" + radio.value).style.backgroundColor = "var(--tx-color-5)";
          if(radio.value == "All"){
            listTasks.forEach(todo => {
              if(!todo.pPosition || (todo.pPosition && todo.pPosition == "out")){
                todoCreation(todo);
              };
            });
          } else if(radio.value == "None"){
            listTasks.forEach(todo => {
              if(!todo.label && (!todo.pPosition || (todo.pPosition && todo.pPosition == "out"))){
                todoCreation(todo);
              };
            });
          };
        } else{
          document.querySelector("#myLabelLabel" + radio.value).style.backgroundColor = colorsList[mySettings.myLabels[radio.value].color].colorBG5;
          listTasks.forEach(todo => {
            if(todo.label && todo.LName == mySettings.myLabels[radio.value].name && (!todo.pPosition || (todo.pPosition && todo.pPosition == "out"))){
              todoCreation(todo);
            };
          });
        };
        updateArrowsColor();
        if(mySettings.mySorting){
          mySettings.mySorting.forEach((mySort, idx) => {
            let liste = document.getElementById(mySort.list);
            if(liste){
              liste.classList.remove("sortedList");
              let div = document.querySelector("#sort" + mySort.list + " + div.sortlistDiv");
              let i = 0;
              div.querySelectorAll("button > i").forEach(icon => {
                icon.className = mySort.sort[i];
                icon.style.color = mySort.sort[i] == switchSortArray[0] ? "slategrey" : "var(--tx-color)" ;
                i++;
              });
              sortItWell(idx);
            };
          });
        };
        sortItAll(); //for the lists that don't have a mySettings.mySorting
      };
    });
  });
};

// MARK: getDones
async function getDones(){
  const getDones = await getDocs(collection(db, "randomTask", auth.currentUser.email, "myListDones"));
  let lastWeekDateString = getLastWeekDateString();
  if(localStorage.getItem("listDones")){
    listDones = JSON.parse(localStorage.listDones);
  } else if(getDones){
    getDones.forEach((donedDate) => {
      listDones.push({date: donedDate.id, list: donedDate.data().dones});
    });
    localStorageDones("first"); // fait juste pas updateCBC...
  };
  let sortedListDones = listDones.sort((d1, d2) => (d1.date > d2.date) ? 1 : (d1.date < d2.date) ? -1 : 0);
  sortedListDones.forEach(doned => {
    if (doned.list.length !== 0 && doned.date > lastWeekDateString) {
      let donedDate = doned.date;
      donedDateCreation(donedDate);
      doned.list.forEach(tidoned => {        
        donedCreation(donedDate, tidoned);
      });
    };
  });

  //Let's transfer all the past reminders from listTasks in the right listDones.date
  // listTasks.forEach((todo, idx) => {
  //   if(todo.term == "reminder"){
  //     let todoDateTime = `${todo.startDate}-${todo.startTime ? todo.startTime.replace(":", "-") : "5-00"}`;
  //     if(todoDateTime < hierOggiTime){
  //       let doned = listDones[listDones.findIndex(dd => dd.date == todo.startDate)];
  //       doned.list.push(todo);
  //       listTasks.splice(idx, 1);
  //     };
  //   };
  // });
  localStorage.listTasks = JSON.stringify(listTasks); // NOW we still have to stop the donedReminders from appearing in the doneZone AND make sure they'll appear in the calendars.
  

  refreshDoneId();
  localStorageDones("first");
  createBody();
  getWeeklyCalendar();
  logInScreen.classList.add("displayNone");
  document.getElementById("loadingScreen").classList.replace("waitingScreen", "displayNone");
};



function freeIn(){ 
  //mySettings
  if(localStorage.getItem("mySettings")){
    mySettings = JSON.parse(localStorage.mySettings);
  } else{
    localStorage.mySettings = JSON.stringify(mySettings);
  };
  if(!mySettings.myBaseColors){
    mySettings.myBaseColors = baseColors;
    localStorage.mySettings = JSON.stringify(mySettings);
  };
  
  //Inserion de la date d'aujourd'hui
  document.getElementById("todaysDateSpan").innerHTML = getTodayDateString();
  document.getElementById("todaysDaySpan").innerHTML = getDayNameFromString(getTodayDateString());
  //firstPage favorite view
  document.getElementById(mySettings.myFavoriteView).checked = true;
  document.getElementById(mySettings.myFavoriteView).dispatchEvent(pageEvent);
  //light or dark mode
  if(mySettings.mySide == "light"){
    // document.getElementById("switchModeBall").className = "ballLight";
    // document.getElementById("switchModeBallUnder").className = "ballLight";
    document.querySelector(':root').style.setProperty('--bg-color', 'rgb(242, 243, 244)');
    document.querySelector(':root').style.setProperty('--bg-color-7', 'rgba(242, 243, 244, .7)');
    document.querySelector(':root').style.setProperty('--tx-color', 'darkslategrey');
  } else if(mySettings.mySide == "dark"){
    // document.getElementById("switchModeBall").className = "";
    // document.getElementById("switchModeBallUnder").className = "";
    document.querySelector(':root').style.setProperty('--bg-color', 'rgb(7, 10, 10)');
    document.querySelector(':root').style.setProperty('--bg-color-7', 'rgba(7, 10, 10, .7)');
    document.querySelector(':root').style.setProperty('--tx-color', 'rgba(242, 243, 244, .8)');
  };
  //labels
  if(mySettings.myLabels && mySettings.myLabels.length > 0){
    myLabelsGeneralChoice();
  };
  //listTasks
  if(localStorage.getItem("listTasks")){
    listTasks = JSON.parse(localStorage.listTasks);
  } else{
    localStorage.listTasks = JSON.stringify([]);
  };
  if(listTasks.length > 0){
    colorUrges("first");
    localStorage.listTasks = JSON.stringify(listTasks);
    listTasks.forEach(todo => {
      if(!todo.pPosition || (todo.pPosition && todo.pPosition == "out")){
        todoCreation(todo);
      };
    });
    updateArrowsColor();
    if(mySettings.mySorting){
      mySettings.mySorting.forEach((mySort, idx) => {
        let liste = document.getElementById(mySort.list);
        if(liste){
          liste.classList.remove("sortedList");
          let div = document.querySelector("#sort" + mySort.list + " + div.sortlistDiv");
          let i = 0;
          div.querySelectorAll("button > i").forEach(icon => {
            icon.className = mySort.sort[i];
            icon.style.color = mySort.sort[i] == switchSortArray[0] ? "slategrey" : "var(--tx-color)" ;
            i++;
          });
          sortItWell(idx);
        };
      });
    };
    sortItAll(); //for the lists that don't have a mySettings.mySorting
  };
  //listDones
  if(localStorage.getItem("listDones")){
    listDones = JSON.parse(localStorage.listDones);
    let sortedListDones = listDones.sort((d1, d2) => (d1.date > d2.date) ? 1 : (d1.date < d2.date) ? -1 : 0);
    sortedListDones.forEach(doned => {
      if(doned.list.length !== 0 && doned.date > lastWeekDateString){
        let donedDate = doned.date;
        donedDateCreation(donedDate);
        doned.list.forEach(tidoned => {
          donedCreation(donedDate, tidoned);
        });
      };
    });
    refreshDoneId();
    localStorageDones("first");
  };
  //Calendar
  createBody();
  getWeeklyCalendar();
  logInScreen.classList.add("displayNone");
  document.getElementById("loadingScreen").classList.replace("waitingScreen", "displayNone");
};


//push date in modif everytime you modify it, then empty it when the update has been done.

function addModif(date){
  let modif = getModif();
  if(!modif.includes(date)){
    modif = [...modif, date];
    //localStorage.setItem("modif", JSON.stringify(modif));
    localStorage.modif = JSON.stringify(modif);
  };
};

function getModif(){
  let modif = [];
  if(localStorage.getItem("modif")){
    modif = JSON.parse(localStorage.modif);
  } else{
    modif = [];
  };
  return modif;
};

function resetModif(){
  localStorage.modif = JSON.stringify([]);
};

earthIt.addEventListener("click", updateFromCloud);


// *** CLOUDSAVE

async function saveToCloud(){
  let nowStamp = new Date().getTime();
  const batch = writeBatch(db);

  listTasks = JSON.parse(localStorage.listTasks);
  mySettings = JSON.parse(localStorage.mySettings);
  const docRefTasks = doc(db, "randomTask", auth.currentUser.email);
  const docSnapTasks = await getDoc(docRefTasks);
  
  if (docSnapTasks.exists()){
    batch.update(doc(db, "randomTask", auth.currentUser.email), { // or batch.update or await updateDoc
      listTasks: listTasks,
      mySettings: mySettings,
      lastUpdateFireStore: nowStamp
    });
  } else{
    batch.set(doc(db, "randomTask", auth.currentUser.email), { // or batch.set or await setDoc
      listTasks: listTasks,
      mySettings: mySettings,
      lastUpdateFireStore: nowStamp
    });
  }; 

  myBusies = [];
  listTasks.forEach(todo => {
    //Modify all the event to busy
    if(todo.term == "showThing" && todo.showType !== "Cancelled"){
      if(todo.line == "todoDay" ){
        busyZoneCreation(todo);
      } else if(todo.line == "recurringDay"){
        todo.recurryDates.forEach(recurryDate => {
          let tempRecurry = {
            startDate: recurryDate,
            prima: todo.prima,
            startTime: todo.startTime,
            dopo: todo.dopo,
            stopTime: todo.stopTime,
            showType: todo.showType,
          };
          busyZoneCreation(tempRecurry)
        });
      };
    } else if(todo.term !== "showThing" && todo.term !== "nevermind" && !todo.stock && todo.busy && (todo.startTime && todo.stopTime && todo.startTime !== todo.stopTime)){
      if(todo.line == "todoDay" ){
        let tempTodo = todo;
        tempTodo.showType = "task";
        busyZoneCreation(tempTodo);
      } else if(todo.line == "recurringDay"){
        todo.recurryDates.forEach(recurryDate => {
          let tempRecurry = {
            startDate: recurryDate,
            prima: todo.prima,
            startTime: todo.startTime,
            dopo: todo.dopo,
            stopTime: todo.stopTime,
            showType: "task",
          };
          busyZoneCreation(tempRecurry)
        });
      };
    };
  });
  const docRefBusies = doc(db, "randomTask", auth.currentUser.email, "mySchedule", "myBusies");
  const docSnapBusies = await getDoc(docRefBusies);
  console.log(myBusies);
  if (docSnapBusies.exists()){
    batch.update(doc(db, "randomTask", auth.currentUser.email, "mySchedule", "myBusies"), { // or batch.update or await updateDoc
      myBusies: myBusies
    });
  } else{
    batch.set(doc(db, "randomTask", auth.currentUser.email, "mySchedule", "myBusies"), { // or batch.set or await setDoc
      myBusies: myBusies
    });
  }; 
  listDones = JSON.parse(localStorage.listDones);
  const docRefDones = collection(db, "randomTask", auth.currentUser.email, "myListDones");
  const docSnapDones = await getDocs(docRefDones);
  let modif = getModif();
  modif.map(modifDate => {
    let doned = listDones.find((td) => td.date == modifDate);
    if(docSnapDones[modifDate]){
      batch.update(doc(db, "randomTask", auth.currentUser.email, "myListDones", modifDate), {
        dones: doned.list
      });
    } else{
      batch.set(doc(db, "randomTask", auth.currentUser.email, "myListDones", modifDate), {
        dones: doned.list
      });
    };
  });  
  /* WHEN YOU WANT TO UPDATE ALL THE DONES */
  // listDones.forEach(td => {
  //   if(docSnapDones[td.date]){
  //     batch.update(doc(db, "randomTask", auth.currentUser.email, "myListDones", td.date), {
  //       dones: td.list
  //     });
  //   } else{
  //     batch.set(doc(db, "randomTask", auth.currentUser.email, "myListDones", td.date), {
  //       dones: td.list
  //     });
  //   };
  // }); 

  await batch.commit();
  localStorage.lastUpdateLocalStorageRandomTask = nowStamp;
  resetCBC();
  resetModif();
};

cloudIt.addEventListener("click", saveToCloud);


function updateFromCloud(){
  localStorage.clear();
  document.querySelectorAll("#listPage ul").forEach(ul => {
    ul.innerHTML = "";
  });
  listTasks = [];
  listDones = [];
  wheneverList = [];
  resetModif();
  resetCBC();
  getTasksSettings();
  getDones();
  // createBody();
  // getWeeklyCalendar();
  settingsPage();
  updateArrowsColor();
  earthIt.style.backgroundColor = "rgba(237, 20, 61, 0)";
  localStorage.lastUpdateLocalStorageRandomTask = new Date().getTime();
};

function updateArrowsColor(){//update arrows color
  document.querySelectorAll("section").forEach(section => {
    if(section.querySelector("input.listToggleInput")){
      if(section.id == "limboSection"){
        if(section.querySelectorAll("li").length == 1){
          section.classList.remove("displayNone");
          section.querySelector("label").classList.remove("listToggleLabel");
          section.querySelector(".typcn-chevron-right-outline").classList.add("displayNone");
          section.querySelector("ul").classList.remove("listToggleList");
        } else if(section.querySelectorAll("li").length > 1){
          section.classList.remove("displayNone");
          section.querySelector("label").classList.add("listToggleLabel");
          section.querySelector(".typcn-chevron-right-outline").classList.remove("displayNone");
          section.querySelector("ul").classList.add("listToggleList");
        } else if(section.querySelectorAll("li").length == 0){
          section.classList.add("displayNone");
          section.querySelector("label").classList.remove("listToggleLabel");
          section.querySelector(".typcn-chevron-right-outline").classList.add("displayNone");
          section.querySelector("ul").classList.remove("listToggleList");
        };
      }; 
      if(section.querySelectorAll("li").length > 0){
        section.querySelector("span.listToggleChevron").classList.add("fullSection");
      } else{
        section.querySelector("span.listToggleChevron").classList.remove("fullSection");
      };
      
    } else if(section.id == "oupsSection" || section.id == "urgesSection"){
      if(section.querySelectorAll("li").length > 0){
        section.classList.remove("displayNone");
      } else if(section.querySelectorAll("li").length == 0){
        section.classList.add("displayNone");
      };
    };
  });
};

function updateCBC(){
  cBC++;
  localStorage.cBC = cBC;
  let cBCD = cBC >= 10 ? 1 : "." + cBC;
  cloudIt.style.backgroundColor = "rgba(237, 20, 61, " + cBCD + ")";
  updateArrowsColor();
};
function resetCBC(){
  cBC = 0;
  cloudIt.style.backgroundColor = "rgba(237, 20, 61, " + cBC + ")";
  localStorage.cBC = cBC;
};

// *** SETTINGS
//How to know if you need to update it? (otherwise, it would still show "updated"; if not, shows "update"). Update because the version you have is older than the version on the cloud (because last time you saved on the cloud it was from an other localStorage/device... but it can't be because myList and list are different, because that doesn't tell you which one is the newer one... timestamps?)
//Is there a real way to check if it all really worked out before changing it to "updated!"?
// settings.addEventListener("click", () => {
  // document.querySelectorAll(".onePage").forEach(page => {
  //   page.classList.add("displayNone");
  // });
  // settingsScreen.classList.remove("displayNone");
  function settingsPage(){//UPDATE
    let firstDayOptions = mySettings.myWeeksDayArray.map(day => {
      return `<option value="${day.code}">${day.name1Maj}</option>`;
    }).join("");
    let clockingOptions = mySettings.myWeeksDayArray.map(day => {
      return `<div id="${day.code}Clocks" class="dayClocksDiv">
      <p>${day.name1Maj}</p>
      <p>Clock in: <input id="${day.code}clockIn" class="clocks clockIn" type="time" value="${day.clockIn}" /></p>
      <p>Clock out: <input id="${day.code}clockOut" class="clocks clockOut" type="time" value="${day.clockOut}" /></p>
    </div>`;
    }).join("");
    document.querySelector("#settingsDiv").innerHTML = `<span id="exitX">x</span>
    <!--<button id="clearStorageBtn" style="margin-top: 15px;">Update</button>
    <hr />-->
    <h2>Settings</h2>
    <h3>What side are you on?</h3>
    <div id="switchModeSlider">
      <div id="switchModeDark" class="typcn typcn-weather-night"></div>
      <div id="switchModeLight" class="typcn typcn-weather-sunny"></div>
      <div id="switchModeBall" class="ballLight"></div>
      <div id="switchModeBallUnder" class="ballLight"></div>
    </div>
    <h3>What's the first thing you wanna see when you get here?</h3>
    <input id="choicePageInputList" value="switchPageInputList" name="choicePageRadios" type="radio" class="displayNone" ${mySettings.myFavoriteView == "switchPageInputList" ? `checked` : ``} />
    <label for="choicePageInputList" class="bottomBtn purpleOnWhite">
      <i class="fa-solid fa-list-check"></i>
    </label>
    <input id="choicePageInputMonth" value="switchPageInputMonth" name="choicePageRadios" type="radio" class="displayNone" ${mySettings.myFavoriteView == "switchPageInputMonth" ? `checked` : ``} />
    <label for="choicePageInputMonth" class="bottomBtn purpleOnWhite">
      <i class="fa-solid fa-calendar-days"></i>
    </label>
    <input id="choicePageInputWeek" value="switchPageInputWeek" name="choicePageRadios" type="radio" class="displayNone" ${mySettings.myFavoriteView == "switchPageInputWeek" ? `checked` : ``} />
    <label for="choicePageInputWeek" class="bottomBtn purpleOnWhite">
      <i class="fa-solid fa-calendar-week"></i>
    </label>
    <input id="choicePageInputConvo" value="switchPageInputConvo" name="choicePageRadios" type="radio" class="displayNone" ${mySettings.myFavoriteView == "switchPageInputConvo" ? `checked` : ``} />
    <label for="choicePageInputConvo" class="bottomBtn purpleOnWhite">
      <i class="fa-solid fa-comments" style="font-size: 20px;"></i>
    </label>
    <h3>What time does your day really end?</h3>
    <input id="timeInput" type="time">
    <h3>What day does your week actually start?</h3>
    <select id="firstDayOfWeekInput">
      ${firstDayOptions}
    </select>
    <h3>Do you want to see yourself sleeping?</h3>
    <input id="sleepZonesInput" type="checkbox" class="tuttoGiornoInput cossin" ${mySettings.mySleepZones ? `checked` : ``} />
      <div class="calendarInsideMargin tuttoGiornoDiv" style="justify-content: center;">
        <label for="sleepZonesInput" class="slideZone">
          <div class="slider">
            <span class="si">Sì</span>
            <span class="no">No</span>
          </div>
        </label>
      </div>
    <h3>Then when are you clocking in and out?</h3>
    <div class="clockingDiv">
      ${clockingOptions}
    </div>
    <button id="settingsBtn" class="ScreenBtn1">yep <span class="typcn typcn-thumbs-up" style="padding: 0;font-size: 1em;"></span></button>
    <button id="cancelBtn" class="ScreenBtn2">Cancel</button>
    <button id="logOutBtn" onclick="logOut()" class="ScreenBtn1" style="margin-right: 0; margin-bottom: 0; border-radius: 15px; font-size: .8em;">I'm out! <i class="fa-solid fa-person-through-window" style="display: block; margin-top: 3px;"></i></button>`;

    let switchModeSlider = document.querySelector("#switchModeSlider");
    let timeInput = document.querySelector("#timeInput");
    let sleepZonesInput = document.querySelector("#sleepZonesInput");
    let exitX = document.querySelector("#exitX");
    let cancelBtn = document.querySelector("#cancelBtn");
    let settingsBtn = document.querySelector("#settingsBtn");
    
    if(mySettings.myTomorrow){
      timeInput.value = mySettings.myTomorrow;
    };
    let previousTomorrow = timeInput.value;
    let previousSleepZones = mySettings.mySleepZones;
    if(mySettings.myFavoriteView){
      document.getElementById(mySettings.myFavoriteView).checked = true;
      document.getElementById(mySettings.myFavoriteView).dispatchEvent(pageEvent);
    };
    let previousFirstDay = document.querySelector("#firstDayOfWeekInput").value;

    if(mySettings.mySide == "light"){
      document.getElementById("switchModeBall").className = "ballLight";
      document.getElementById("switchModeBallUnder").className = "ballLight";
      document.querySelector(':root').style.setProperty('--bg-color', 'rgb(242, 243, 244)');
      document.querySelector(':root').style.setProperty('--bg-color-7', 'rgba(242, 243, 244, .7)');
      document.querySelector(':root').style.setProperty('--tx-color', 'darkslategrey');
    } else if(mySettings.mySide == "dark"){
      document.getElementById("switchModeBall").className = "";
      document.getElementById("switchModeBallUnder").className = "";
      document.querySelector(':root').style.setProperty('--bg-color', 'rgb(7, 10, 10)');
      document.querySelector(':root').style.setProperty('--bg-color-7', 'rgba(7, 10, 10, .7)');
      document.querySelector(':root').style.setProperty('--tx-color', 'rgba(242, 243, 244, .8)');
    };

    switchModeSlider.addEventListener("click", () => {
      document.getElementById("switchModeBall").classList.toggle("ballLight");
      document.getElementById("switchModeBallUnder").classList.toggle("ballLight");
      if(document.getElementById("switchModeBall").classList.contains("ballLight")){
        document.querySelector(':root').style.setProperty('--bg-color', 'rgb(242, 243, 244)');
        document.querySelector(':root').style.setProperty('--bg-color-7', 'rgba(242, 243, 244, .7)');
        document.querySelector(':root').style.setProperty('--tx-color', 'darkslategrey');
        document.querySelectorAll(".numberedCal").forEach(cal => {
          cal.classList.remove("numberedCalDark");
        });
      } else{
        document.querySelector(':root').style.setProperty('--bg-color', 'rgb(7, 10, 10)');
        document.querySelector(':root').style.setProperty('--bg-color-7', 'rgba(7, 10, 10, .7)');
        document.querySelector(':root').style.setProperty('--tx-color', 'rgba(242, 243, 244, .8)');
        document.querySelectorAll(".numberedCal").forEach(cal => {
          cal.classList.add("numberedCalDark");
        });
      };
    });

    exitX.addEventListener("click", () => {
      document.getElementById(previousPage).checked = true;
      document.getElementById(previousPage).dispatchEvent(pageEvent);
    });
    cancelBtn.addEventListener("click", () => {
      document.getElementById(previousPage).checked = true;
      document.getElementById(previousPage).dispatchEvent(pageEvent);
    });
    let clockChangeListener = false;
    document.querySelectorAll(".clocks").forEach(clock => {
      clock.addEventListener("change", () =>{
        clockChangeListener = true;
      });
    });

    settingsBtn.addEventListener("click", () => {
      mySettings.myTomorrow = `${timeInput.value}`;
      if(previousTomorrow !== mySettings.myTomorrow){
        document.getElementById("todaysDateSpan").innerHTML = getTodayDateString();
        document.getElementById("todaysDaySpan").innerHTML = getDayNameFromString(getTodayDateString());
        listTasks.forEach(todo => {
          todoCreation(todo);
        });
        updateArrowsColor();
        sortItAll();
        getWeeklyCalendar();
      };

      mySettings.myFavoriteView = document.querySelector('input[name="choicePageRadios"]:checked').value;
      
      mySettings.mySleepZones = sleepZonesInput.checked ? true : false;
      if(previousSleepZones !== mySettings.mySleepZones){
        getWeeklyCalendar();
      };

      if(document.getElementById("switchModeBall").classList.contains("ballLight")){
        mySettings.mySide = "light";
      } else {
        mySettings.mySide = "dark";
      };
      
      if(clockChangeListener){ //if there are clocks: mySettings.offAreas = true
        // document.querySelectorAll(".dayClocksDiv").forEach(div => {
        //   let thisCode = div.id.substring(0, 2);
        //   let codeIdx = mySettings.myWeeksDayArray.indexOf(day => day.code == thisCode);
        //   //let clockInTime = div.querySelector(".clockIn").value;
        //   mySettings.myWeeksDayArray[codeIdx].clockIn = div.querySelector(".clockIn").value;
        //   mySettings.myWeeksDayArray[codeIdx].clockOut = div.querySelector(".clockOut").value;
        // });
        //createBody(); I don't think we need to redo the monthly...
        //getWeeklyCalendar(); we don't need to redo the whole weekly either, just the sleepy area
        updateSleepAreas();
      };

      let firstDay = document.querySelector("#firstDayOfWeekInput").value;
      if(previousFirstDay !== firstDay){
        let run = true;
        while(run){
          if(mySettings.myWeeksDayArray[0].code == firstDay){
            run = false;
          } else{
            let removed = mySettings.myWeeksDayArray.shift();
            mySettings.myWeeksDayArray.push(removed);
            run = true;
          };
        };
        createBody(); //did not work at all! because that one is not created from the array
        getWeeklyCalendar();
      };
      localStorage.mySettings = JSON.stringify(mySettings);
      //  No more cloudSaveSettings() => we just do a updateCBC(); and let the user save it with everything else
      updateCBC();
      document.getElementById(previousPage).checked = true;
      document.getElementById(previousPage).dispatchEvent(pageEvent);
    });
  };
// });

// MARK: SEARCH

function searchShowType(){
  let optionShow = mySettings.myShowTypes.map((show, idx) => {
    return `<option value="${show.name}" style="background-color:${show.colorBG}; color:${show.colorTX};">${show.name}</option>`;
  }).join("");
  let allShow = `<option value="">any</option>${optionShow}`;
  document.querySelector("#searchShow").insertAdjacentHTML("afterbegin", allShow);

  let tagColors = mySettings.myBaseColors.map((color, idx) => {
    return `<option value="${idx}" style="background-color:${color.colorBG}; color:${color.colorTX};">${color.tag}</option>`;
  }).join("");
  let allColors = `<option value="">any</option>${tagColors}`;
  
  document.querySelector("#searchTag").insertAdjacentHTML("afterbegin", allColors);
};

function searchPage(){
  document.querySelector("#searchForm").addEventListener("submit", (e) =>{
    e.preventDefault();
    let nope = false;
    let AND = false;
    let searchTodo = document.getElementById("searchTodo");
    let searchDone = document.getElementById("searchDone");
    //only once we mix everything into one big list, and don't forget to find a way to show the date they've been doned!
    let searchTask = document.getElementById("searchTask");
    let searchDate = document.getElementById("searchDate");
    //let searchDeadline = document.getElementById("searchDeadline");
    let searchShow = document.getElementById("searchShow");
    let searchTerm = document.getElementById("searchTerm");
    let searchTag = document.getElementById("searchTag");

    document.querySelectorAll('input[name="andOr"]').forEach(andOr => {
      if(andOr.checked){
        AND = true;
      };
    });
  
    let resultAll = [];
    if(searchTask.value !== ""){
      searchSwitch = true;
      console.log(searchTask.value);
      let resultTask = listTasks.filter(todo => todo.task.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(searchTask.value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')));
      if(resultTask.length == 0){
        nope = true;
        searchSwitch = false;
      } else{
        nope = false;
        resultAll = resultTask; //should we copy it or is just like that ok?
        //also, if there's an AND, we shouldn't do the todoCreation yet! only at the end!
        resultTask.forEach(todo => {
          todoCreation(todo);
          console.log(todo);
        });
        searchSwitch = false;
      };
    };
    if(searchDate.value !== ""){
      let resultDate = [];
      // if("AND"){
      //   resultDate = resultAll;
      // };
      //is it AND or OR? if it's OR, follow this code, if it's AND, keep filtering resultAll
      searchSwitch = true;
      console.log(searchDate.value);
      resultDate = listTasks.filter(todo => todo.startDate == searchDate.value || todo.line == "recurringDay");
      let count = 0;
      if(resultDate.length == 0){
        searchSwitch = false;
      } else{
        resultDate.forEach(todo => {
          if(todo.line == "recurringDay"){
            let recurryDates = todo.recurryDates.filter(recurryDate => recurryDate == searchDate.value);
            if(recurryDates.length == 0){
            } else{
              todoCreation(todo);
              console.log(todo);
              count++;
              recurryDates.forEach(recurryDate => {
                recurryDateToTodoCreation(todo, recurryDate, "in");
                console.log(recurryDate);
                count++;
              });
            };
          } else{
            todoCreation(todo);
            console.log(todo);
            count++;
          };
        });
        searchSwitch = false;
      };
      nope = count > 0 ? false : true;
    };
    if(searchShow.value !== ""){
      searchSwitch = true;
      console.log(searchShow.value);
      let resultShow = listTasks.filter(todo => todo.term == "showThing" && todo.showType == searchShow.value);
      if(resultShow.length == 0){
        nope = true;
        searchSwitch = false;
      } else{
        nope = false;
        resultShow.forEach(todo => {
          todoCreation(todo);
          console.log(todo);
        });
        searchSwitch = false;
      };
    };
    if(searchTerm.value !== ""){
      searchSwitch = true;
      console.log(searchTerm.value);
      let resultTerm = listTasks.filter(todo => todo.term == searchTerm.value);
      if(resultTerm.length == 0){
        nope = true;
        searchSwitch = false;
      } else{
        nope = false;
        resultTerm.forEach(todo => {
          todoCreation(todo);
          console.log(todo);
        });
        searchSwitch = false;
      };
    };
    if(searchTag.value !== ""){
      searchSwitch = true;
      console.log(searchTag.value);
      let resultTag = listTasks.filter(todo => todo.color == searchTag.value);
      if(resultTag.length == 0){
        nope = true;
        searchSwitch = false;
      } else{
        nope = false;
        resultTag.forEach(todo => {
          todoCreation(todo);
          console.log(todo);
        });
        searchSwitch = false;
      };
    };


    
    
    if(nope){
      document.querySelector("#searchFound").insertAdjacentHTML("beforeend", `<h4>Nope...</h4>`);
    };
    searchSwitch = false;
  });

  document.querySelector("#searchClearFilters").addEventListener("click", () => {
    //nope = false;
    searchSwitch = false;
  });
  document.querySelector("#searchClearResults").addEventListener("click", () => {
    document.querySelector("#searchFound").innerHTML = ``;
    //nope = false;
    searchSwitch = false;
  });
};

searchPage();

// *** SWIPING SECTION (TODAY, TOMOROW, ETC...)
let thatDaySwitch = false;
let thatdayDate;
let thatdayTime;
let thatnextdayTime;
let todayDiv = document.querySelector("#todayDiv");

todayDiv.querySelector("#swipeTodayBtn").addEventListener("click", () => { //back to today
  thatDaySwitch = true;
  
  thatdayDate = getTodayDateString();
  thatdayTime = `${thatdayDate}-${mySettings.myTomorrow.replace(":", "-")}`;
  thatnextdayTime = `${getNextDateStringFromString(thatdayDate)}-${mySettings.myTomorrow.replace(":", "-")}`;

  todayDiv.querySelector("#todaysTitle").innerText = "Today's fun";
  todayDiv.querySelector("#todaysUnderTitle").innerText = "What shall be done today...";
  todayDiv.querySelector("#swipeBtns").classList.add("nextOnly");

  addThatdayTodos(); //sorts it too
  
  thatDaySwitch = false;
});
todayDiv.querySelector("#swipeNextBtn").addEventListener("click", () => { //one day forward
  thatDaySwitch = true;
  let thebeforedayDate = todayDiv.querySelector("#todaysDateSpan").innerText;
  thatdayDate = getNextDateStringFromString(thebeforedayDate);
  thatdayTime = `${thatdayDate}-${mySettings.myTomorrow.replace(":", "-")}`;
  thatnextdayTime = `${getNextDateStringFromString(thatdayDate)}-${mySettings.myTomorrow.replace(":", "-")}`;

  if(thebeforedayDate == getTodayDateString()){
    todayDiv.querySelector("#todaysTitle").innerText = "Tomorrow's plan";
  } else{
    todayDiv.querySelector("#todaysTitle").innerText = "That day's plan";
  };
  todayDiv.querySelector("#todaysUnderTitle").innerText = "Plan for the worst, aim for the best...";
  todayDiv.querySelector("#swipeBtns").classList.remove("nextOnly");

  addThatdayTodos(); //sorts it too
  
  thatDaySwitch = false;
});
todayDiv.querySelector("#swipePrevBtn").addEventListener("click", () => { //one day backward
  thatDaySwitch = true;
  let thebeforedayDate = todayDiv.querySelector("#todaysDateSpan").innerText;
  thatdayDate = getPrevDateStringFromString(thebeforedayDate);
  thatdayTime = `${thatdayDate}-${mySettings.myTomorrow.replace(":", "-")}`;
  thatnextdayTime = `${thebeforedayDate}-${mySettings.myTomorrow.replace(":", "-")}`;
  if(thatdayDate == getTodayDateString()){
    todayDiv.querySelector("#todaysTitle").innerText = "Today's fun";
    todayDiv.querySelector("#todaysUnderTitle").innerText = "What shall be done today...";
    todayDiv.querySelector("#swipeBtns").classList.add("nextOnly");
  } else{
    if(thatdayDate == getTomorrowDateSring()){
      todayDiv.querySelector("#todaysTitle").innerText = "Tomorrow's plan";
    } else{
      todayDiv.querySelector("#todaysTitle").innerText = "That day's plan";
    };
    todayDiv.querySelector("#todaysUnderTitle").innerText = "Plan for the worst, aim for the best...";
  };
  
  addThatdayTodos(); //sorts it too
  
  thatDaySwitch = false;
});

function addThatdayTodos(){
  todayDiv.querySelector("#listToday").innerHTML = ``;
  todayDiv.querySelector("#listTodayReminder").innerHTML = ``;
  todayDiv.querySelector("#todaysDateSpan").innerText = thatdayDate;
  todayDiv.querySelector("#todaysDaySpan").innerText = getDayNameFromString(thatdayDate);
  listTasks.forEach(todo => {
    let todoDateTime;
    let todoDeadlineTime;
    if(todo.deadline && todo.deadline !== todo.startDate){
      let modifiedDalle = todo.finoAlle ? todo.finoAlle.replace(":", "-") : "5-00";
      todoDeadlineTime = `${todo.deadline}-${modifiedDalle}`;
    };
    if(todo.startDate){
      let modifiedDalle = todo.startTime ? todo.startTime.replace(":", "-") : "5-00";
      todoDateTime = `${todo.startDate}-${modifiedDalle}`;
    } else if(todo.line == "recurringDay"){
      todo.recurryDates.forEach(recurryDate => {
        let modifiedDalle = todo.startTime ? todo.startTime.replace(":", "-") : "5-00";
        let todoTime = `${recurryDate}-${modifiedDalle}`;
        if((thatdayTime < todoTime) && (todoTime < thatnextdayTime) || (thatdayTime < todoDeadlineTime) && (todoDeadlineTime < thatnextdayTime)){
          recurryDateToTodoCreation(todo, recurryDate, "in");
        };
      });
    };
    if((thatdayTime < todoDateTime) && (todoDateTime < thatnextdayTime) || (thatdayTime < todoDeadlineTime) && (todoDeadlineTime < thatnextdayTime)){
      todoCreation(todo);
    };
  });
  sortIt("datetime", "listToday");
};


document.querySelector("#openHourTogglerInput").addEventListener("click", openOrCloseHour);
function openOrCloseHour(){
  openHourToggle = document.querySelector("#openHourTogglerInput").checked ? true : false;
  if(openHourToggle){
    document.querySelectorAll('[data-openHour="true"]').forEach(todo => {
      todo.classList.remove("displayNone");
    });
  } else{
    document.querySelectorAll('[data-openHour="true"]').forEach(todo => {
      todo.classList.add("displayNone");
    });
  };
};
  

// MARK: CREATION

function getTodoFrom(li) { //parent and offspring are global but it could be any other li or div
  let todo;
  if(li.dataset.rec && li.dataset.rec !== "undefined"){
    let recIndex = listTasks.findIndex(td => td.id == li.dataset.rec);
    let recurring = listTasks[recIndex];
    todo = getWholeRecurry(recurring, li.dataset.date, li.dataset.rec);
  } else{
    let liId = li.dataset.id ? li.dataset.id : li.id;
    let todoIndex = listTasks.findIndex(todo => todo.id == liId);
    todo = listTasks[todoIndex];
  };
  return todo;
};

function getWholeRecurry(todo, date, recId){
  let recurry = JSON.parse(JSON.stringify(todo));
  clearRecurringData(recurry);
  recurry.id = crypto.randomUUID();
  recurry.line = "todoDay";
  recurry.startDate = date;
  recurry.recurry = true;
  recurry.recId = recId;
  return recurry;
};

function recurryDateToTodoCreation(todo, recurryDate, fate){ //todo == the todo that todo.line == "recurryngDay"; recurryDate == date to create (from todo.recurryDates); fate == "out" (if needs to be pushed in listTasks, becoming a new todo, and the recurryDate taken out of recurryDates) OR "in" (if it's just temporary and the recurryDate shall stay in recurryDates; we're not creating a new todo)
  let recurry = getWholeRecurry(todo, recurryDate, todo.id);    
  todoCreation(recurry);
  if(fate == "out"){ // to remove the recurryDate from todo.recurryDates AND pushing the new recurry in listTasks
    todo.recurryDates = todo.recurryDates.filter(rD => rD !== recurryDate);
    delete recurry.recurry;
    delete recurry.recId;
    //il devient un todo normal!
    listTasks.push(recurry);
    localStorage.listTasks = JSON.stringify(listTasks);
  };
  
};

function todoCreation(todo){
  //Si on met les sections en array (au lieu d'en HTML), togoList va être quoi? l'objet au complet comme tel, son index dans l'array ou son id? J'imagine que ça va dépendre de comment on retrouve l'élément de la liste dans le HTML (getElementbyId)...
  let togoList;
  let numberedDays;
  let todayDate = getDateTimeFromString(getTodayDateString(), mySettings.myTomorrow);
  if(projectSwitch){
    togoList = "projectUl";
  } else if(searchSwitch){
    togoList = "searchFound";
  } else if(thatDaySwitch){ // ajuster plus haut pour s'assurer de ce qu'on envoie ici (recurry au lieu de recurryDate)
    todayDate = getDateTimeFromString(thatdayDate, mySettings.myTomorrow);
    if(todo.term == "reminder"){
      togoList = "listTodayReminder";
    } else {
      togoList = "listToday";
    };
  } else if(storageSwitch){
    togoList = "allStoreList";
  } else{
    togoList = getTogoList(todo);
  };
  
  if((todo.deadline && todo.deadline !== "") || togoList == "listOups"){
    let doneDate;
    if(todo.deadline && todo.deadline !== ""){
      let time = todo.finoAlle ? todo.finoAlle : mySettings.myTomorrow;
      doneDate = getDateTimeFromString(todo.deadline, time);
    } else if(togoList == "listOups"){
      let time = todo.startTime ? todo.startTime : mySettings.myTomorrow;
      doneDate = getDateTimeFromString(todo.startDate, time);
    };
    numberedDays = Math.floor((doneDate - todayDate)/(1000 * 3600 * 24));
  };
  //console.log(togoList);
  if(togoList !== ""){ //what happens if one is stock/stored AND recurring/recurry? (tried but don't need:  && togoList !== undefined)
    if(document.getElementById(togoList)){  
      let pColor = 0;
      if(todo.pColor){
        pColor = todo.pColor;
      } else if(!todo.pColor && todo.pParentId){
        let parentTodo = listTasks[listTasks.findIndex(td => td.id == todo.pParentId)];
        pColor = parentTodo.pColor;
      };

      if(todo.stock){
        document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-term="${todo.term}" ${todo.startTime ? `data-time="${todo.startTime}"` : ``}" 
          class="todoLi${todo.term == "showThing" ? todo.label ? ` showLi showLiLabel` : ` showLi` : todo.term == "sameHabit" ? ` sameHabit` : todo.term == "reminder" ? ` reminder` : ``}${pColor !== 0 ? todo.pColor ? ` projectLi` : ` offspringLi` : ``}${todo.startTime && todo.prima && todo.prima !== "00:00" ? ` showLiBuffer` : ``}" 
          style="${todo.term == "showThing" ? `background-color: ${todo.STColorBG}; color: ${todo.STColorTX};` : ``}${pColor !== 0 ? todo.pColor ? `outline-color: ${colorsList[pColor].colorBG5}; border-color:${colorsList[pColor].colorBG};` : `border-color:${colorsList[pColor].colorBG};` : ``}">
        ${todo.label ? `<div class="labelOnglet labelLiOnglet" style="background-color:${colorsList[todo.LColor].colorBG}; color:${colorsList[todo.LColor].colorTX};">${todo.LName}</div>` : `<div class="labelOnglet labelLiOnglet noLabel"></div>`}
        ${todo.pParentId && !projectSwitch ? `<div class="projectLiOngletDiv">${getProjectOnglets(todo)}</div>` : ``}
        ${todo.startTime && todo.prima && todo.prima !== "00:00" ? `<div class="primaLiBuffer">${timeMath(roundFifteenTime(todo.startTime), "minus", todo.prima).replace("-", ":")}</div>` : ``}
        <i class="typcn typcn-trash" onclick="trashStockEvent(this)"></i><i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}" ${todo.quicky ? `style="color:mediumvioletred;"` : ``}></i><div class="textDiv"><span class="text" onclick="${projectSwitch ? `toTIdePSaM(this)` : `toTIdeLIaM(this)`}" style="${todo.miniList ? `text-decoration:underline; text-decoration-thickness:1px;` : ``}${todo.term == "showThing" ? "" : ` color:${mySettings.myBaseColors[todo.color].colorBG}; flex-shrink: 0;`}">${todo.term == "reminder" ? `<i class="typcn typcn-bell" style="font-size: 1em; padding: 0 5px 0 0;"></i>` : ``}${todo.info ? '*' : ''}${todo.task}</span>${todo.term !== "showThing" ? `<hr style="border-color:${mySettings.myBaseColors[todo.color].colorBG};" />` : ``}<span class="timeSpan">${todo.startTime ? todo.startTime : ''}</span></div><i class="fa-solid fa-recycle" onclick="${searchSwitch ? `toTIdeSSaS(this)` : calendarStock ? `toTIdeCCaNS(this)` : projectStock ? `toTIdePaS(this)` : `toTIdeTZaS(this)`}"></i></li>`);
      } else if(todo.line == "recurringDay"){
        let time = todo.startTime ? todo.startTime : mySettings.myTomorrow;
        let nextDate;
        if(todo.recurryDates[0]){
          nextDate = getDateTimeFromString(todo.recurryDates[0], time);
        } else{
          console.log(todo);
        };
        numberedDays = Math.floor(Math.abs(nextDate.getTime() - todayDate.getTime())/(1000 * 3600 * 24));
        document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-term="${todo.term}" ${todo.startTime ? `data-time="${todo.startTime}"` : ``}" 
          class="todoLi${todo.term == "showThing" ? todo.label ? ` showLi showLiLabel` : ` showLi` : todo.term == "sameHabit" ? ` sameHabit` : todo.term == "reminder" ? ` reminder` : ``}${pColor !== 0 ? todo.pColor ? ` projectLi` : ` offspringLi` : ``}${todo.startTime && todo.prima && todo.prima !== "00:00" ? ` showLiBuffer` : ``}" 
          style="${todo.term == "showThing" ? `background-color: ${todo.STColorBG}; color: ${todo.STColorTX};` : ``}${pColor !== 0 ? todo.pColor ? `outline-color: ${colorsList[pColor].colorBG5}; border-color:${colorsList[pColor].colorBG};` : `border-color:${colorsList[pColor].colorBG};` : ``}">
        
        ${todo.label ? `<div class="labelOnglet labelLiOnglet" style="background-color:${colorsList[todo.LColor].colorBG}; color:${colorsList[todo.LColor].colorTX};">${todo.LName}</div>` : `<div class="labelOnglet labelLiOnglet noLabel"></div>`}
        ${todo.pParentId && !projectSwitch ? `<div class="projectLiOngletDiv">${getProjectOnglets(todo)}</div>` : ``}
        ${todo.startTime && todo.prima && todo.prima !== "00:00" ? `<div class="primaLiBuffer">${timeMath(roundFifteenTime(todo.startTime), "minus", todo.prima).replace("-", ":")}</div>` : ``}
        <i class="typcn typcn-trash" onclick="trashRecurringEvent(this)"></i>
        <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}" ${todo.quicky ? `style="color:mediumvioletred;"` : ``}></i>
        <div class="textDiv"><span class="text" onclick="${projectSwitch ? `toTIdePSaM(this)` : `toTIdeLIaM(this)`}" style="${todo.miniList ? `text-decoration:underline; text-decoration-thickness:1px;` : ``}${todo.term == "showThing" ? "" : ` color:${mySettings.myBaseColors[todo.color].colorBG};`}">${todo.term == "reminder" ? `<i class="typcn typcn-bell" style="font-size: 1em; padding: 0 5px 0 0;"></i>` : ``}${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan">${todo.startTime ? todo.startTime : ''}</span></div>
        <div class="numberedCal ${mySettings.mySide == "dark" ? `numberedCalDark` : ``}" onclick="smallCalendarChoice(this)"><i class="typcn typcn-calendar-outline calendarSpan ${todo.term == "showThing" ? "" : todo.dealine ? `doneDay` : todo.line}"></i><span style="${todo.term == "showThing" ? `text-shadow: -0.75px -0.75px 0 ${todo.STColorBG}, 0 -0.75px 0 ${todo.STColorBG}, 0.75px -0.75px 0 ${todo.STColorBG}, 0.75px 0 0 ${todo.STColorBG}, 0.75px 0.75px 0 ${todo.STColorBG}, 0 0.75px 0 ${todo.STColorBG}, -0.75px 0.75px 0 ${todo.STColorBG}, -0.75px 0 0 ${todo.STColorBG}; color:${todo.STColorTX};` : ``}">${numberedDays}</span></div></li>`);
      } else if(todo.term == "reminder"){ 
        /*??? ${todo.pParentId && !projectSwitch ? `<div class="projectLiOngletDiv">${getProjectOnglets(todo)}</div>` : ``} */
        document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" ${todo.startDate ? `data-date="${todo.startDate}"` : ``} ${todo.startTime ? `data-time="${todo.startTime}"` : ``} ${todo.recurry ? `data-rec="${todo.recId}"` : ``} class="todoLi reminderClass">
         
          <i class="typcn typcn-bell" style="font-size: 1em;"></i>
          <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}" style="font-size: .8em;"></i>
          <div class="textDiv"><span onclick="${projectSwitch ? `toTIdePSaM(this)` : `toTIdeLIaM(this)`}" class="text" style="${todo.miniList ? `text-decoration:underline; text-decoration-thickness:1px; ` : ``}color:${mySettings.myBaseColors[todo.color].colorBG}; font-size: 1em;">${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan" style="font-size: .8em;" onclick="timeItEvent(this)">${todo.startTime ? todo.startTime : ""}</span>
          <input type="time" class="displayNone"/></div>
        </li>`);
      } else if(!todo.pPosition || todo.pPosition == "out" || ((todo.pPosition == "in" || todo.pPosition == "done") && (projectSwitch || searchSwitch))){
        
        document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li 
          id="${todo.id}" 
          ${todo.startDate ? `data-date="${todo.startDate}"` : ``} 
          ${todo.startTime ? `data-time="${todo.startTime}"` : ``} 
          ${todo.recurry ? `data-rec="${todo.recId}"` : ``} 
          ${todo.term == "alwaysHere" ? `data-always="here"` : ``} 
          ${todo.openHour ? `data-openHour="true"` : ``} 
          class="todoLi${todo.term == "showThing" ? todo.label ? ` showLi showLiLabel` : ` showLi` : todo.term == "sameHabit" ? ` sameHabit` : ``}${pColor !== 0 ? todo.pColor ? ` projectLi` : todo.pPosition == "done" ? ` offspringLi doneOffspringLi` : ` offspringLi` : ``}${todo.startTime && todo.prima && todo.prima !== "00:00" ? ` showLiBuffer` : ``}${togoList == "listOups" && numberedDays < -5 ? ` selectedTask` : ``}${!openHourSwitch && !openHourToggle && todo.openHour ? ` displayNone` : ``}" 
          style="
          ${todo.term == "showThing" ? `background-color: ${todo.STColorBG}; color: ${todo.STColorTX};` : ``}
          ${pColor !== 0 ? todo.pColor ? `outline-color: ${colorsList[pColor].colorBG5}; border-color:${colorsList[pColor].colorBG};` : `border-color:${colorsList[pColor].colorBG};` : ``}
          ">
          ${todo.label ? `<div class="labelOnglet labelLiOnglet" style="background-color:${colorsList[todo.LColor].colorBG}; color:${colorsList[todo.LColor].colorTX};">${todo.LName}</div>` : `<div class="labelOnglet labelLiOnglet noLabel"></div>`}
          ${todo.pParentId && !projectSwitch ? `<div class="projectLiOngletDiv">${getProjectOnglets(todo)}</div>` : ``}
          ${todo.startTime && todo.prima && todo.prima !== "00:00" ? `<div class="primaLiBuffer">${timeMath(roundFifteenTime(todo.startTime), "minus", todo.prima).replace("-", ":")}</div>` : ``}
          <div class="checkOptions${projectSwitch ? " projectLiOptions" : ""}" style="${todo.urge ? `color: ${todo.urgeColor};` : ``}" onclick="checkOptions(this, ${pColor})">
          ${projectSwitch ? `<span class="circleInOut" ${todo.pPosition == "out" ? `style="border-color:${colorsList[pColor].colorBG};"` : ``}></span>` : ``}
            <i class="typcn typcn-media-stop-outline emptyCheck"></i>
            <span class="numUrge">${todo.urge ? todo.urgeNum : ``}</span>
          </div>
          <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}" ${todo.quicky ? `style="color:mediumvioletred;"` : ``}></i>
          <div class="textDiv"><span onclick="${projectSwitch ? `toTIdePSaM(this)` : `toTIdeLIaM(this)`}" class="text" style="${todo.miniList ? `text-decoration:underline; text-decoration-thickness:1px;` : ``}${todo.term == "showThing" ? `` : ` color:${mySettings.myBaseColors[todo.color].colorBG};`}">${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan" onclick="timeItEvent(this)">${todo.startTime ? todo.startTime : ""}</span>
          <input type="time" class="displayNone"/>
          ${togoList == "listOups" && numberedDays < -5 ? `<div class="proHelp">
          <h3>You have been procrastinating that one for ${Math.abs(numberedDays)} days...</h3>
          <p>Why haven't you done it yet?</p> 
          <p>Is it really worth doing? Why did you want to do it in the first place?</p>
          <p>Was it and is it still realistic to want to do it?</p>
      
          <h4>If you really still want to do it:</h4>
          <p>What is missing or what is unclear?</p>
          <p>What do you need or what would help you start this task?</p>
          <p>What's the very first 'next action'?</p>
      
          <h4>If you realize you don't actually want nor need to do it:</h4>
          <p>Then do yourself a favor and just delete it!</p>
          <button onclick="toTIdeLIaM(this.parentElement)">Yeah, thanks</button></div>` : ``}
          </div>
          <div class="numberedCal ${mySettings.mySide == "dark" ? `numberedCalDark` : ``}" onclick="smallCalendarChoice(this)">
            <i class="typcn typcn-calendar-outline calendarSpan ${todo.term == "showThing" ? `` : todo.recurry ? "recurry" : todo.deadline ? `doneDay` : todo.line}"></i>
            <span class="${(todo.deadline && todo.deadline !== "") || togoList == "listOups" ? `` : `displayNone`}" style="${todo.term == "showThing" ? `text-shadow: -0.75px -0.75px 0 ${todo.STColorBG}, 0 -0.75px 0 ${todo.STColorBG}, 0.75px -0.75px 0 ${todo.STColorBG}, 0.75px 0 0 ${todo.STColorBG}, 0.75px 0.75px 0 ${todo.STColorBG}, 0 0.75px 0 ${todo.STColorBG}, -0.75px 0.75px 0 ${todo.STColorBG}, -0.75px 0 0 ${todo.STColorBG}; color:${todo.STColorTX};` : ``}">${(todo.deadline && todo.deadline !== "") || togoList == "listOups" ? numberedDays : ``}</span>
          </div>
        </li>`);
      };
    } else if(!document.getElementById(togoList) && !todo.stock){
      alert(`Oups! "${todo.task}" doesn't have anywhere to go!`);
    };
  };
};



// MARK: getTogoList
function getTogoList(todo){ 
  //console.log(todo);
  let todoDateTime;
  let todoDeadlineTime;
  if(todo.deadline && todo.deadline !== todo.startDate){
    let modifiedDalle = todo.finoAlle ? todo.finoAlle.replace(":", "-") : "5-00";
    todoDeadlineTime = `${todo.deadline}-${modifiedDalle}`;
  };
  if(todo.startDate){
    let modifiedDalle = todo.startTime ? todo.startTime.replace(":", "-") : "5-00";
    todoDateTime = `${todo.startDate}-${modifiedDalle}`;
  };

  let togoList;
  if(todo.newShit){
    togoList = "listLimbo";
  } else if(todo.stock){
    togoList = "";
  } else if(todo.line == "recurringDay"){
    if(todo.recurryDates.length == 0){
      if(todo.fineOpt == "fineMai"){
        //alert(todo.task + " doesn't have any dates anymore (but should)!");
        sendRecurringBackToGetRecurryDates(todo, getMyTodayDate());
        togoList = "recurringList";
        recurryCreation(todo);
      } else{
        let answer = prompt(todo.task + ", C'est finnnniiiiiiii!!!\nLet's say goodbye!");
        if(answer == null){
          console.log("null");
          togoList = "";
        } else if(answer == ""){ // ok
          console.log("ok");
          let todoIndex = listTasks.findIndex(tod => tod.id == todo.id);
          console.log(todoIndex);
          listTasks.splice(todoIndex, 1);
          localStorage.listTasks = JSON.stringify(listTasks);
          updateCBC();
          togoList = "";
        };
      };
    } else if(todo.recurryDates.length == 1 && todo.fineOpt == "fineMai"){
      let date = getDateFromString(todo.recurryDates[0]);
      sendRecurringBackToGetRecurryDates(todo, date);
      togoList = "recurringList";
      recurryCreation(todo);
    } else{
      togoList = "recurringList";
      recurryCreation(todo);
    };
  } else if((todoDateTime < hierOggiTime) || (todoDeadlineTime < hierOggiTime)){
    if(todo.term == "showThing" || todo.term == "reminder"){ //date or deadline is before today
      togoList = "";
    } else{
      togoList = "listOups";
    };
  } else if(((hierOggiTime < todoDateTime) && (todoDateTime < oggiDemainTime)) || ((hierOggiTime < todoDeadlineTime) && (todoDeadlineTime < oggiDemainTime))){ //date or deadline is today
    if(todo.term == "reminder"){
      togoList = "listTodayReminder";
    } else {
      togoList = "listToday";
    };
  } else if(todoDateTime > oggiDemainTime){
    if(todo.term == "showThing" || todo.term == "reminder"){ //date is after today
    togoList = "";
    } else{
      togoList = "scheduledList";
    };
  } else{ // no date or deadline is after today
    togoList = todo.term + "List";
  };
  return togoList;
};

/* 
    `<div id="positionSwitch" class="projectOptions" onclick="projectOptionsEvent(this.parentElement)">
      <span class="circleInOut" ${todo.pPosition == "out" ? `style="border-color:${colorsList[pColor].colorBG};"` : ``}>
        <span class="textPosition">${todo.pPosition}</span>
      </span>
    </div>`
    `<input type="checkbox" id="positionSwitch" ${todo.pPosition == "out" ? `checked` : ``} />
    <label for="positionSwitch" class="circleInOut"></label>`
*/

function checkOptions(thisOne, pColor){ //context is either "normal" or "project" (that one means it's in a project's taskInfo projectUl)
  let list = thisOne.parentElement.parentElement.id;//That's the <ul>
  let li;
  if(list == "projectUl"){
    li = offspring = thisOne.parentElement; //That's the <li> inside the parent
  } else{
    li = parent = thisOne.parentElement; //That's the <li>
  };
  
  
  li.classList.add("selectedTask");
  let todo = getTodoFrom(li);
  li.insertAdjacentHTML("beforeend", `<div class="checkOptionsDiv">
    <i id="labelChoice" class="fa-solid fa-folder-closed fa-rotate-270" style="font-size: 1.2em;color:${todo.label ? colorsList[todo.LColor].colorBG : `var(--tx-color-5)`};"></i>
    ${list == "projectUl" ? `<input type="checkbox" id="positionSwitch" class="displayNone" ${todo.pPosition == "out" ? `checked` : ``} />
    <label for="positionSwitch" class="circleInOut" ${todo.pPosition == "out" ? `style="border-color:${colorsList[pColor].colorBG};"` : ``}></label>` : ``}
    ${list == "projectUl" && todo.pPosition == "done" ? `like recycleEvent from Done` : ``}
  ${todo.urge || todo.term == "topPriority" ? `<input id="newUrgeNumInput" type="number" value="${todo.urgeNum ? todo.urgeNum : 0}"/>` : ``}
  <i class="typcn typcn-input-checked-outline checkOptionsCheck" onclick="PartialCheckEvent(this.parentElement)"></i>
  ${todo.term == "alwaysHere" ? `` : `<i class="typcn typcn-input-checked checkOptionsCheck" onclick="TotalCheckEvent(this.parentElement)"></i>`}
  </div>`);
  let checkOptionsDiv = li.querySelector(".checkOptionsDiv");
  newClickScreenCreation(checkOptionsDiv);

  let labelChoice = li.querySelector("#labelChoice");
  labelChoice.addEventListener("click", () => {
    li.scrollIntoView();
    let labelDiv = li.querySelector(".labelLiOnglet");
    let options = {
      icon: labelChoice,
      where: checkOptionsDiv,
      labelDiv: labelDiv,
      myLabels: mySettings.myLabels && mySettings.myLabels.length > 0 ? true : false
    };
    creatingLabelPanel(todo, options);
  });

  let positionSwitch = li.querySelector("#positionSwitch");
  if(positionSwitch){
    positionSwitch.addEventListener("click", () => {
      if(positionSwitch.checked){
        li.querySelectorAll(".circleInOut").forEach(cio => {
          cio.style.borderColor = colorsList[pColor].colorBG;
        });
        todo.pPosition = "out";
        let togoList = getTogoList(todo);
        todoCreation(todo);
        if(togoList !== ""){ //revoir les méthodes de tri et s'assurer de tenir compte du storage aussi
          howToSortIt(togoList);
        } else{
          sortItAllWell();
        };
      } else{
        li.querySelectorAll(".circleInOut").forEach(cio => {
          cio.style.borderColor = "rgba(47, 79, 79, .4)";
        });
        todo.pPosition = "in";
        Array.from(document.querySelectorAll("li")).filter((li) => li.id.includes(todo.id)).forEach(tdLi => {
          console.log(tdLi.parentElement.id);
          if(tdLi.parentElement.id !== "projectUl"){
            tdLi.remove();
          };
        });
      };
      localStorage.listTasks = JSON.stringify(listTasks);
      updateCBC();
      //Sauf que ça update pas la liste, genre enlever le parent de la big liste s'il est maintenant in ou l'ajouter dans la big liste s'il est maintenant out. Au pire, ça va paraître au prochain refresh...
    });
  };

  if(todo.urge){
    let newUrgeNumInput = document.querySelector("#newUrgeNumInput");
    newUrgeNumInput.addEventListener("change", () => {
      if(newUrgeNumInput.value == 0){
        delete todo.urge;
        delete todo.urgeNum;
        delete todo.urgeColor;
        checkOptionsDiv.style.color = mySettings.myBaseColors[0].colorBG;
        checkOptionsDiv.querySelector("span").textContent = "";
        //urgeCheckDiv.setAttribute("onclick", "checkEvent(this)");
      } else{
        todo.urgeNum = newUrgeNumInput.value;
        checkOptionsDiv.querySelector("span").textContent = newUrgeNumInput.value;
      };
      localStorage.listTasks = JSON.stringify(listTasks);
      colorUrges("next");
      updateCBC();
    });
  };
  // parent = ``;
  // offspring = ``;
  //No need of them because the div is only removed by the newClickScreenRemoval, so it's taken care of.
};
window.checkOptions = checkOptions;

function newClickScreenCreation(div){
  let positionA = window.scrollY
  let zIndexDiv = window.getComputedStyle(div).getPropertyValue("z-index");
  let newClickScreen = `<div class="newClickScreen" style="z-index:${zIndexDiv - 1};"></div>`;
  div.parentElement.insertAdjacentHTML("beforeend", newClickScreen);
  newClickScreen = getTheHighestClickScreen();
  newClickScreen.addEventListener("click", () => {
    newClickScreenRemoval(div);
    window.scrollTo(0, positionA);
  });
};
function getTheHighestClickScreen(){
  let allNewClickScreen = Array.from(document.querySelectorAll(".newClickScreen"));
  let sortedClickScreens = allNewClickScreen.sort((c1, c2) => (window.getComputedStyle(c1).getPropertyValue("z-index") < window.getComputedStyle(c2).getPropertyValue("z-index") ? 1 : (window.getComputedStyle(c1).getPropertyValue("z-index") > window.getComputedStyle(c2).getPropertyValue("z-index")) ? -1 : 0));

  return sortedClickScreens[sortedClickScreens.length - 1];
};
function newClickScreenRemoval(div){
  if(div.id == "taskInfo"){
    document.querySelector("#projectSection").remove();
  };
  div.remove();
  let allNewClickScreen = document.querySelectorAll(".newClickScreen");
  let highestClickScreen = getTheHighestClickScreen();
  highestClickScreen.remove();
  if(parent && allNewClickScreen.length == 1){ //that way, we remove the selectedTask class only if it's the last clickscreen (that way, we're safe if it's only, for ex., iconPalet)!
    parent.classList.remove("selectedTask");
    document.querySelectorAll(".selectedTask").forEach(prt => {
      prt.classList.remove("selectedTask");
    });
    parent = ``;
  } else if(offspring){
    offspring.classList.remove("selectedTask");
    offspring = ``;
  };
  //ouin, pour l'Instant, on devrait p-e s'occuper du scroll au cas par cas et non ici...
};

function colorUrges(when){
  let filteredUrges = listTasks.filter(todo => todo.urge == true);
  if(filteredUrges.length == 1){
    filteredUrges[0].urgeNum = 1;
    filteredUrges[0].urgeColor = "red";
  } else if(filteredUrges.length > 1){
    let urges = filteredUrges.sort((u1, u2) => (u1.urgeNum < u2.urgeNum) ? -1 : (u1.urgeNum > u2.urgeNum) ? 1 : 0);
    let first = urges[0].urgeNum;
    let num = 1;
    for(let i = 0; i < urges.length; i++){
      if(urges[i].urgeNum == first){
        urges[i].urgeNum = num;
      } else{
        first = urges[i].urgeNum;
        num++;
        urges[i].urgeNum = num;
      };
      if(num <= 3){
        urges[i].urgeColor = "red";
      } else if(num > 3 && num <= 6){
        urges[i].urgeColor = "#ff8400";
      } else if(num > 6 && num <= 9){
        urges[i].urgeColor = "#ffd000";
      } else{
        urges[i].urgeColor = mySettings.myBaseColors[0].colorBG;
      };
      if(when == "next"){
        let li = document.getElementById(urges[i].id);
        li.querySelector("div.checkOptions").style.color = urges[i].urgeColor;
        li.querySelector("div.checkOptions > span").textContent = urges[i].urgeNum;
      };
    };
    sortIt("urge", "topPriorityList");
  };
};

function projectOptionsEvent(circle){
  // switch between "in", "out"
  //the border-color of circle changes color (0 if "in" and pColor if "out")
  //the border-color of the li (circle.parentElement) changes too
};
window.projectOptionsEvent = projectOptionsEvent;

function recurryCreation(todo){
  let idx = 0;
  let dateTime = `${todo.recurryDates[idx]}-${todo.startTime ? todo.startTime.replace(":", "-") : "5-00"}`;
  //console.log(todo.recurryDates[idx]);
  if(todo.recPileUP == true){
    while(dateTime < oggiDemainTime){
      let recurryDate = todo.recurryDates[idx];
      recurryDateToTodoCreation(todo, recurryDate, "out");
      dateTime = `${todo.recurryDates[idx]}-${todo.startTime ? todo.startTime.replace(":", "-") : "5-00"}`;
    };
  } else{
    while(dateTime < oggiDemainTime){
      if(dateTime < hierOggiTime){
        todo.recurryDates.splice(idx, 1);
        if(todo.recurryDates[idx]){
          dateTime = `${todo.recurryDates[idx]}-${todo.startTime ? todo.startTime.replace(":", "-") : "5-00"}`;
        } else{
          let answer = prompt(todo.task + ", C'est finnnniiiiiiii!!!\nLet's say goodbye!");
          if(answer == null){
            console.log("null");
          } else if(answer == ""){ // ok
            console.log("ok");
            let todoIndex = listTasks.findIndex(tod => tod.id == todo.id);
            console.log(todoIndex);
            listTasks.splice(todoIndex, 1);
            localStorage.listTasks = JSON.stringify(listTasks);
            updateCBC();
            //But how do we make it keep going to the next todo?!?!
          };
        };
      } else{
        let recurryDate = todo.recurryDates[idx];
        recurryDateToTodoCreation(todo, recurryDate, "in");
        idx++;
        dateTime = `${todo.recurryDates[idx]}-${todo.startTime ? todo.startTime.replace(":", "-") : "5-00"}`;
      };  
    };
  };
};

function sendRecurringBackToGetRecurryDates(todo, date){
  if(todo.var == "giorno"){
    ogniOgni(todo, date);
  } else if(todo.var == "settimana"){
    ogniSettimana(todo, date);
  } else if(todo.var == "mese"){
    if(todo.meseOpt == "ogniXDate"){
      ogniOgni(todo, date);
    } else if(todo.meseOpt == "ogniXDay"){
      ogniMeseDay(todo, date);
    };
  } else if(todo.var == "anno"){
      ogniOgni(todo, date);
  };
};


function donedCreation(donedDate, doned){
  document.getElementById(donedDate).insertAdjacentHTML("beforeend", `<li ${doned.term == "showThing" ? `class="showLi" style="background-color: ${doned.STColorBG}; color: ${doned.STColorTX};"` : ``}>
    <i class="typcn typcn-tick"></i>
    <span class="textDone" ${doned.term == "showThing" ? `` : `style="color:${mySettings.myBaseColors[doned.color].colorBG};"`}>${doned.task}</span>
    <i class="typcn typcn-trash" style="margin-right: 5px;" onclick="trashDoneEvent(this)"></i>
    <i class="fa-regular fa-calendar-xmark" style="margin-right: 5px;" onclick="reDateEvent(this)"></i>
    <i class="typcn typcn-arrow-sync" onclick="recycleEvent(this)"></i>
  </li>`);
};

function donedDateCreation(donedDate){
  let today = getTodayDateString();
  if(!document.getElementById(donedDate)){
    let donedUlP = document.createElement("p");
    donedUlP.setAttribute("id", donedDate + "p");
    donedUlP.innerText = donedDate;
    doneZone.insertAdjacentElement("afterbegin", donedUlP);
    let donedUl = document.createElement("ul");
    donedUl.setAttribute("id", donedDate);
    donedUlP.insertAdjacentElement("afterend", donedUl);
    if(donedDate == today){
      let todaySpan = document.createElement("span");
      todaySpan.innerText = "(aujourd'hui!)";
      donedUlP.insertAdjacentElement("beforeend", todaySpan);
    };
  };
};

function getUnderLiningWidth(input){
  let windowWidth = window.innerWidth;
  let pagePadBor = 22;
  let hourCol = 45;
  let dayNumber = 7;
  let eventBor = 2;
  let magicNum = 19;
  let padLeftPX = getComputedStyle(input).paddingLeft;
  let padLeft = Number(padLeftPX.slice(0, -2));
  let thisDiv = document.getElementById(`${input.id}-underLining`);
  thisDiv.style.width = `${(((windowWidth - pagePadBor - hourCol)/dayNumber) - eventBor) + magicNum + padLeft}px`;
};


// *** ADD
let addForm = document.querySelector("#addForm");
getUnderLiningWidth(addInput);
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let newTask = addInput.value;
  if(!newTask == ""){
    let todo = {
      newShit: true,
      id: crypto.randomUUID(),
      task: newTask,
      color: "0", // (== var(--tx-color))
      icon: "fa-solid fa-ban noIcon",
      term: "oneTime",
      line: "noDay"
    };
    listTasks.push(todo);
    localStorage.listTasks = JSON.stringify(listTasks);
    todoCreation(todo);
    updateCBC();
    addForm.reset();
  } else{
    toTIdeTZaN();
    addForm.reset();
  };
});

let storageSwitch = false;
//*** Faire quelque chose de similaire pour montrer les pinup (ceux qui ne s'effacent pas et qu'y'en a toujours juste un qu'on peut modifier qu'on sélect celui dans la liste ou celui dans la date todoDay/scheduled ou whereever et qui se "done" juste à moitié; un peu comme les always, mais un coup "done", il redevient noDay et disparait de la liste (les always gardent leur todoDay s'ils en avaient un))
function getStorage(){
  storageSwitch = true;
  document.body.insertAdjacentHTML("beforeend", `<div id="allStore" class="taskInfoClass">
    <span id="exitXallStore" class="exitX">x</span>
    <h3 class="topList"><span class="topListTitle">Storage</span></h3>
    <h5 class="topList">Recycling is good...</h5>
    <hr style="margin-top: 0;"/>
    <ul id="allStoreList"></ul>
  </div>`);
  document.querySelector("#exitXallStore").addEventListener("click", () => {
    document.querySelector("#allStore").remove();
  });
  listTasks.forEach(todo => {
    if(todo.stock){
      todoCreation(todo);
    };
  });
  storageSwitch = false;
  sortIt("text", "allStoreList");
  let stockLis = Array.from(document.querySelectorAll("#allStoreList > li"));
  for(let i = (stockLis.length - 1); i >= 0; i--){
    let term = stockLis[i].dataset.term;
    if(!document.getElementById(`allStock${term}SubList`)){
      stockLis[i].insertAdjacentHTML("beforebegin", `<h4 class="subList" id="allStock${term}SubList">${term}</h4>`);
    } else{
      document.getElementById(`allStock${term}SubList`).insertAdjacentElement("afterend", stockLis[i]);
    };
  };
};
window.getStorage = getStorage;

function recycleEvent(recycle){ //from Done
  let recycleLi = recycle.parentElement;
  let recycleId = recycleLi.id.slice(5);
  let recycleDate = recycleLi.parentElement.id;
  for (const i in listDones) {
    if (listDones[i].date == recycleDate) {
      let doned = listDones[i].list[recycleId];
      let todo = JSON.parse(JSON.stringify(doned));
      todo.id = crypto.randomUUID();
      clearRecurringData(todo);
      delete todo.recurry;
      delete todo.recId;
      delete todo.startDate; //doesn't work for shows
      delete todo.stopDate; //doesn't work for shows
      delete todo.stock;
      todo.line = "noDay"; //doesn't work for shows
      listTasks.push(todo);
      localStorage.listTasks = JSON.stringify(listTasks);
      //maybe we could do like in reuseItEvent and open taskInfo instead... then add todo.recycled YES!!!
      todoCreation(todo);
      sortItAll();
      updateCBC();
      let newLi = document.getElementById(todo.id);
      if(newLi){
        let list = newLi.parentElement;
        let section = list.closest("section");
        if(section.querySelector(".listToggleInput")){
          section.querySelector(".listToggleInput").checked = true;
        };
        newLi.scrollIntoView();
      } else{
        window.scrollTo({ top: 0 });
      };
    };
  };    
};
window.recycleEvent = recycleEvent;

function reDateEvent(thisOne){ // in Done Zone
  parent = thisOne.parentElement;
  parent.classList.add("selectedTask");
  let reDateDivHTML = `<div class="reDateDiv"><h5 class="calendarMargin">Then, when have you done that?!</h5><input id="reDateInput" type="date" class="calendarMargin" /><button id="reDateBtn" class="calendarMargin">STD<br /><span class="smallText">(Save The Date)</span></button></div>`;
  parent.insertAdjacentHTML("beforeend", reDateDivHTML);
  let reDateDiv = document.querySelector(".reDateDiv");
  newClickScreenCreation(reDateDiv);
  document.querySelector("#reDateBtn").addEventListener("click", () => {
    let newDate = document.querySelector("#reDateInput").value;
    let toRedateTask = parent.querySelector(".textDone").textContent;
    let toRedateUl = parent.parentElement;
    let oldDate = toRedateUl.id;
    let toRedateIndexOut = listDones.findIndex(done => done.date == oldDate);
    let toRedateIndexIn = listDones[toRedateIndexOut].list.findIndex(done => done.task == toRedateTask);
    let toRedateArray = listDones[toRedateIndexOut].list.splice(toRedateIndexIn, 1);
    let toRedate = toRedateArray[0];
    let dateFound = false;
    for (const i in listDones) {
      if (listDones[i].date == newDate) {
        dateFound = true;
        listDones[i].list.push(toRedate);
      };
    };
    if(!dateFound){
      let newList = [toRedate];
      let newDone = {
        date: newDate,
        list: newList
      };
      listDones.push(newDone);
    };
    addModif(oldDate);
    addModif(newDate);
    donedDateCreation(newDate);
    donedCreation(newDate, toRedate);
    refreshDoneId();
    localStorageDones("next");
    parent.remove();
    updateWeek();
    updateMonth();
    //newClickScreenRemoval(reDateDiv); //NO NEED FOR THAT! EVERYTHING IS IN THE PARENT!!
    parent = ``;
  });
};

window.reDateEvent = reDateEvent;

// *** DONE/ERASE
let num = 0;

doneNextBtn.addEventListener("click", () => {
  let doneId = wheneverList[num].id;
  let doneLi = document.getElementById(doneId);
  let doned = getTodoFrom(doneLi);
  if(!doneLi.dataset.always){
    doneLi.remove();
  };
  gotItDone(doned);
  updateCBC();
  wheneverList.splice(num, 1);
  if(wheneverList.length == 0){
    taskToDo.innerText = "aller t'reposer!";
  } else{
    num = num < wheneverList.length ? num : 0;
    taskToDo.innerText = wheneverList[num].task;
    taskToDo.style.color = mySettings.myBaseColors[wheneverList[num].color].colorBG;
    if(wheneverList[num].info){
      moreInfoWhole.classList.remove("displayNone");
      moreInfoDiv.innerText = wheneverList[num].info;
    } else{
      moreInfoWhole.classList.add("displayNone");
    };
  };
});



function PartialCheckEvent(emptyCheck){
  parent = emptyCheck.parentElement;
  let doned = getTodoFrom(parent);
  let checkOptionsDiv = parent.querySelector(".checkOptionsDiv");
  gotItHalfDone(doned);
  updateCBC();
  newClickScreenRemoval(checkOptionsDiv);//includes parent = offspring = ``;
  //Si c'est un pinup, on veut enlever la date et remettre noDay (pour qu'il disparaisse de la liste) et donc, on veut enlever le parent de la liste
};

window.PartialCheckEvent = PartialCheckEvent;

function TotalCheckEvent(emptyCheck){
  parent = emptyCheck.parentElement;
  let doned = getTodoFrom(parent);
  if(parent.parentElement.id == "projectUl"){
    let checkOptionsDiv = parent.querySelector(".checkOptionsDiv");
    newClickScreenRemoval(checkOptionsDiv);//includes parent = offspring = ``;
    parent.classList.add("doneOffspringLi");
  } else{
    parent.remove(); //The checkOptionsDiv AND the newClickScreen are both in that parent, so they are all removed at the same time! (so no need for newClickScreenRemoval) but we do need the parent = offspring = ``;
  };
  gotItDone(doned);
  //doneAction(parent); // need to wait until animation is over before moving on to the next (gotItDone and remove) (use metro app animation)
  updateCBC();
  parent = ``;
  offspring = ``;
};

window.TotalCheckEvent = TotalCheckEvent;

function doneAction(li){
  li.insertAdjacentHTML("beforeend", `<div class="doneAction"><div class="doneActionTopOpct"></div><div class="doneActionBtmLine"></div></div>`);
  /* the div would have two layers, the under one would be a horizontal line like the trashline in time app and the top one would be gradient of transparent on the right and opaque (bg-color) on the left. The whole thing would move from left to right until the whole li seems to have disapeared (see chronoMe) */
};

function getRecurryDateOut(todo){ //pour enlever la date d'un recurry de la list recurryDate de son recurring (ne delete pas todo.recurry et todo.recId)
  let recIndex = listTasks.findIndex(td => td.id == todo.recId);
  let recurring = listTasks[recIndex];
  recurring.recurryDates = recurring.recurryDates.filter(rD => rD !== todo.startDate);
};

function gotItHalfDone(doned){ //doned is either the todo per se or a fake todo created for the recurry
  let donedDate = getTodayDateString(); //return
  
  let dateFound = false;
  for (const i in listDones) {
    if (listDones[i].date == donedDate) {
      dateFound = true;
      listDones[i].list.push(doned);
    };
  };
  if(!dateFound){
    let doneList = [doned];
    let done = {
      date: donedDate,
      list: doneList
    };
    listDones.push(done);
  };
  
  addModif(donedDate);
  donedDateCreation(donedDate);
  donedCreation(donedDate, doned);
  refreshDoneId();
  localStorageDones("next");
};

function gotItDone(donedItem){ //donedItem is either the todo per se or a fake todo created for the recurry
  if(donedItem.recurry){
    getRecurryDateOut(donedItem); //removes the date from the recurryDates of its recurring
  } else if(donedItem.pParentId && donedItem.pParentId !== "null"){
    donedItem.pPosition = "done";
  } else{
    let donedIndex = listTasks.findIndex(todo => todo.id == donedItem.id);
    listTasks.splice(donedIndex, 1);
  };
  if(donedItem.urge){
    colorUrges("next");
  };    
  localStorage.listTasks = JSON.stringify(listTasks);
  console.log(donedItem);

  let donedDate = donedItem.term == "showThing" || donedItem.term == "reminder" ? donedItem.startDate : getTodayDateString(); //return
  
  let dateFound = false;
  for (const i in listDones) {
    if (listDones[i].date == donedDate) {
      dateFound = true;
      listDones[i].list.push(donedItem);
    };
  };
  if(!dateFound){
    let doneList = [donedItem];
    let done = {
      date: donedDate,
      list: doneList
    };
    listDones.push(done);
  };
  
  addModif(donedDate);
  donedDateCreation(donedDate);
  donedCreation(donedDate, donedItem);
  refreshDoneId();
  localStorageDones("next");
};

function trashDoneEvent(trashCan){ // From Done
  let trashedLi = trashCan.parentElement;
  let trashedDate = trashedLi.parentElement.id;
  let trashedTaskId = trashedLi.id.slice(5);
  for (const i in listDones) {
    if (listDones[i].date == trashedDate) {
      listDones[i].list.splice(trashedTaskId, 1);
      addModif(trashedDate);
      if(listDones[i].list.length == 0){
        document.getElementById(trashedDate + "p").remove();
        document.getElementById(trashedDate).remove();
        //listDones.splice(i, 1); //Et si, on l'enlève pas de la liste? Il va pouvoir se faire updater comme les autres addModif, mais avec un array vide; On a juste à empêcher la recréation du donedDateCreation si length == 0
        //addDeleted(trashedDate); //That's not working at all
      };
    };
  };
  trashedLi.remove();
  refreshDoneId();
  localStorageDones("next");  
};
window.trashDoneEvent = trashDoneEvent;

function trashStockEvent(thisOne){ //from Storage
  let trashLi = thisOne.parentElement;
  let trashIndex = listTasks.findIndex(todo => todo.id == trashLi.id);
  listTasks.splice(trashIndex, 1);
  localStorage.listTasks = JSON.stringify(listTasks);
  trashLi.remove();
  updateCBC();
};
window.trashStockEvent = trashStockEvent;

function trashRecurringEvent(thisOne){
  let trashLi = thisOne.parentElement;
  let trashId = trashLi.id;
  let trashIndex = listTasks.findIndex(todo => todo.id == trashId);
  listTasks[trashIndex].recurrys.forEach(recurry => { // we don't need that anymore! OR we could remove all the li that has the recId in dataset...
    if(document.getElementById(recurry.id)){
      document.getElementById(recurry.id).remove();
    };
  });
    //shouldn't we delete all the recurrys? YHes we should!!
  listTasks.splice(trashIndex, 1);
  localStorage.listTasks = JSON.stringify(listTasks);
  trashLi.remove();
  updateCBC();
};
window.trashRecurringEvent = trashRecurringEvent;

function localStorageDones(time){
  if(time == "next"){
    updateCBC();
  };
  // let lastWeek = getLastWeekDate();
  // let recent = listDones.filter((td) => td.date >= lastWeek);
  // localStorage.listDones = JSON.stringify(recent);
  localStorage.listDones = JSON.stringify(listDones);
};


// *** REFRESH
function refreshDoneId(){
  document.querySelectorAll("#doneZone ul").forEach(ul => {
    let idx = 0;
    ul.querySelectorAll("li").forEach(li => {
      li.setAttribute("id", "doned" + idx);
      idx++;
    });
  });
};

// MARK: SORT

function howToSortIt(listName){
  let ul; // or check if ul has the class "sortedList" ...
  let type;
  if(mySettings.mySorting){
    let listIdx = mySettings.mySorting.findIndex(sort => sort.list == listName);
    if(listIdx !== -1){
      sortItWell(listIdx);
    } else{
      ul = document.getElementById(listName);
      type = ul.dataset.sort;
      sortIt(type, listName);
    };
  } else{
    ul = document.getElementById(listName);
    type = ul.dataset.sort;
    sortIt(type, listName);
  };
};

function sortItAll(){
  document.querySelectorAll(".sortedList").forEach(list => {
    let type = list.dataset.sort; 
    let i, run, li, stop, first, second; 
    run = true; 
    while (run) { 
      run = false; 
      // li = list.getElementsByTagName("li"); //except those in miniList (and project)
      li = list.querySelectorAll("li:not(.allMiniLi)");
      // Loop traversing through all the list items 
      for (i = 0; i < (li.length - 1); i++) { 
        stop = false; 
        if(type == "label"){
          first = li[i].querySelector(".labelOnglet") ? li[i].querySelector(".labelOnglet").textContent : Infinity;
          second = li[i + 1].querySelector(".labelOnglet") ? li[i + 1].querySelector(".labelOnglet").textContent : Infinity;
        } else if(type == "text"){
          first = li[i].querySelector(".text").textContent.toLowerCase();
          first = first.startsWith("*") ? first.substring(1) : first;
          second = li[i + 1].querySelector(".text").textContent.toLowerCase();
          second = second.startsWith("*") ? second.substring(1) : second;
        } else if(type == "color"){
          first = mySettings.myBaseColors.findIndex(color => color.colorBG == li[i].querySelector(".text").style.color);
          second = mySettings.myBaseColors.findIndex(color => color.colorBG == li[i + 1].querySelector(".text").style.color);
        } else if(type == "date"){
          first = li[i].dataset.date;
          second = li[i + 1].dataset.date;
        } else if(type == "term"){
          first = li[i].dataset.term;
          second = li[i + 1].dataset.term;
        } else if(type == "urge"){
          first = li[i].querySelector("div.checkOptions > span").textContent;
          first = first > 0 ? first : Infinity;
          second = li[i + 1].querySelector("div.checkOptions > span").textContent;
          second = second > 0 ? second : Infinity;
        } else if(type == "datetime"){
          first = `${li[i].dataset.date ? li[i].dataset.date : ""}-${li[i].dataset.time ? li[i].dataset.time.replace(":", "-") : ""}`;
          second = `${li[i + 1].dataset.date ? li[i + 1].dataset.date : ""}-${li[i + 1].dataset.time ? li[i + 1].dataset.time.replace(":", "-") : ""}`;
        };
        if (first > second){ 
          stop = true; 
          break; 
        }; 
      }; 
      /* If the current item is smaller than the next item then adding it after it using insertBefore() method */ 
      if(stop){ 
        li[i].parentNode.insertBefore(li[i + 1], li[i]); 
        run = true; 
      }; 
    }; 
  });
  //Scheduled subLists
  let year;
  let previousYear = "0000";
  let month;
  let previousMonth = "00";
  document.querySelectorAll("#scheduledList > h4.subList").forEach(h => {
    h.remove();
  });
  // document.querySelectorAll("#scheduledList > div.subListDiv").forEach(h => {
  //   h.remove();
  // });
  document.querySelectorAll("#scheduledList > li").forEach(li => {
    let date = li.dataset.date;
    year = date.substring(0, 4);
    month = date.substring(5, 7);
    let first = new Date(year, month - 1, 1);
    let monthName = first.toLocaleString('it-IT', {month: 'long'});
    let finalMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    if(previousMonth < month){
      li.insertAdjacentHTML("beforebegin", `<h4 class="subList">${finalMonthName} ${year}</h4>`);
    //   li.insertAdjacentHTML("beforebegin", `<div class="relDiv subListDiv">
    //   <h4 class="subList">${finalMonthName} ${year}</h4>
    //   <div class="sortlistWhole">
    //     <input id="sortscheduledList${finalMonthName}${year}" class="sortlistInput cossin" type="checkbox" />
    //     <div class="sortlistDiv">
    //       <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
    //       <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
    //       <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
    //       <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
    //     </div>
    //     <label for="sortscheduledList${finalMonthName}${year}" class="sortlistLabel">
    //       <i class="fa-solid fa-ellipsis sortUnchecked"></i>
    //       <i class="typcn typcn-tick sortChecked"></i>
    //     </label>
    //   </div>
    // </div>`);
      previousMonth = month;
    } else if(previousMonth > month){
      li.insertAdjacentHTML("beforebegin", `<h4 class="subList">${finalMonthName} ${year}</h4>`);
      previousMonth = month;
      previousYear = year;
    };
  });
  //Recurring subLists
  document.querySelectorAll("#recurringList > h4.subList").forEach(h => {
    h.remove();
  });
  let recuLis = Array.from(document.querySelectorAll("#recurringList > li"));
  for(let i = (recuLis.length - 1); i >= 0; i--){
    let term = recuLis[i].dataset.term;
    if(!document.getElementById(`recu${term}SubList`)){
      recuLis[i].insertAdjacentHTML("beforebegin", `<h4 class="subList" id="recu${term}SubList">${term}</h4>`);
    } else{
      document.getElementById(`recu${term}SubList`).insertAdjacentElement("afterend", recuLis[i]);
    };
  };
  //Storage subLists
  document.querySelectorAll("#listStorage > h4.subList").forEach(h => {
    h.remove();
  });
  let stockLis = Array.from(document.querySelectorAll("#listStorage > li"));
  for(let i = (stockLis.length - 1); i >= 0; i--){
    let term = stockLis[i].dataset.term;
    if(!document.getElementById(`stock${term}SubList`)){
      stockLis[i].insertAdjacentHTML("beforebegin", `<h4 class="subList" id="stock${term}SubList">${term}</h4>`);
    } else{
      document.getElementById(`stock${term}SubList`).insertAdjacentElement("afterend", stockLis[i]);
    };
  };
};


function sortIt(type, listName) { 
  // Declaring Variables 
  let list, i, run, li, stop, first, second; 
  // Taking content of list as input 
  list = document.getElementById(listName); 
  run = true; 
  while (run) { 
    run = false; 
    // li = list.getElementsByTagName("li"); 
    li = list.querySelectorAll("li:not(.allMiniLi)"); 
    // Loop traversing through all the list items 
    for (i = 0; i < (li.length - 1); i++) { 
      stop = false; 
      if(type == "label"){
        first = li[i].querySelector(".labelOnglet") ? li[i].querySelector(".labelOnglet").textContent.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') : "|";
        second = li[i + 1].querySelector(".labelOnglet") ? li[i + 1].querySelector(".labelOnglet").textContent.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') : "|";
      } else if(type == "text"){
        first = li[i].querySelector(".text").textContent.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
          first = first.startsWith("*") ? first.substring(1) : first;
          second = li[i + 1].querySelector(".text").textContent.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
          second = second.startsWith("*") ? second.substring(1) : second;
      } else if(type == "color"){
        first = mySettings.myBaseColors.findIndex(color => color.colorBG == li[i].querySelector(".text").style.color);
        second = mySettings.myBaseColors.findIndex(color => color.colorBG == li[i + 1].querySelector(".text").style.color);
      } else if(type == "date"){
        first = li[i].dataset.date;
        second = li[i + 1].dataset.date;
      } else if(type == "order"){
        first = li[i].dataset.order;
        second = li[i + 1].dataset.order;
      } else if(type == "urge"){
        first = li[i].querySelector("div.checkOptions > span").textContent;
        first = first > 0 ? first : Infinity;
        second = li[i + 1].querySelector("div.checkOptions > span").textContent;
        second = second > 0 ? second : Infinity;
      } else if(type == "datetime"){
        first = `${li[i].dataset.date ? li[i].dataset.date : ""}-${li[i].dataset.time ? li[i].dataset.time.replace(":", "-") : ""}`;
          second = `${li[i + 1].dataset.date ? li[i + 1].dataset.date : ""}-${li[i + 1].dataset.time ? li[i + 1].dataset.time.replace(":", "-") : ""}`;
      } else if(type == "deadline"){
        first = li[i].querySelector("div.numberedCal > span").textContent ? Number(li[i].querySelector("div.numberedCal > span").textContent) : Infinity;
        second = li[i + 1].querySelector("div.numberedCal > span").textContent ? Number(li[i + 1].querySelector("div.numberedCal > span").textContent) : Infinity;
      };
      if (first > second){ 
        stop = true; 
        break; 
      }; 
    }; 
    /* If the current item is smaller than the next item then adding it after it using insertBefore() method */ 
    if(stop){ 
      li[i].parentNode.insertBefore(li[i + 1], li[i]); 
      run = true; 
    }; 
  }; 
}; 
window.sortIt = sortIt;



document.querySelectorAll(".switchSortBtn").forEach(btn => {
  let sortIndex = 0;
  btn.addEventListener("click", () => {
    sortIndex++;
    sortIndex = sortIndex == switchSortArray.length ? 0 : sortIndex;
    let icon = btn.querySelector("i");
    icon.className = switchSortArray[sortIndex];
    icon.style.color = sortIndex > 0 ? "var(--tx-color)" : "slategrey";
  });
});
document.querySelectorAll(".sortlistInput").forEach(check => {
  check.addEventListener("click", () => {
    let div = check.parentElement.parentElement;
    if(div.classList.contains("noH4SubList")){
      div.classList.toggle("noH4SubListClosed");
    };
    let listName = check.id.substring(4);
    let sortArray = [];
    if(!check.checked){
      check.parentElement.querySelectorAll("button > i").forEach(i => {
        sortArray.push(i.className);
      });
      if(!sortArray.every((i) => i == "fa-solid fa-arrow-right-arrow-left fa-rotate-90")){
        let sortIndex;
        if(!mySettings.mySorting){
          mySettings.mySorting = [];
          let newSort = {
            list: listName,
            sort: sortArray
          };
          sortIndex = mySettings.mySorting.push(newSort) - 1;
          localStorage.mySettings = JSON.stringify(mySettings);
          updateCBC();
        } else if(mySettings.mySorting){
          let listIdx = mySettings.mySorting.findIndex(sort => sort.list == listName);
          if(listIdx == -1){
            let newSort = {
              list: listName,
              sort: sortArray
            };
            sortIndex = mySettings.mySorting.push(newSort) - 1;
            localStorage.mySettings = JSON.stringify(mySettings);
            updateCBC();
          } else if(JSON.stringify(mySettings.mySorting[listIdx].sort) !== JSON.stringify(sortArray)){
            mySettings.mySorting[listIdx].sort = sortArray;
            localStorage.mySettings = JSON.stringify(mySettings);
            updateCBC();
            sortIndex = listIdx;
          } else{
            sortIndex = listIdx;
          };
        };
        sortItWell(sortIndex);
      } else if(mySettings.mySorting){ // c'est tous des arrows donc on annule le sort (donc on reviens au sort par default)
        let listIdx = mySettings.mySorting.findIndex(sort => sort.list == listName);
        if(listIdx !== -1){
          mySettings.mySorting.splice(listIdx);
          localStorage.mySettings = JSON.stringify(mySettings);
          let li = document.getElementById(listName);
          li.classList.add("sortedList");
          let type = li.dataset.sort;
          updateCBC();
          sortIt(type, listName);
        };
      };
    };
  });
});

function sortItWell(sortIndex){
  let list = document.getElementById(mySettings.mySorting[sortIndex].list);
  let ul = Array.from(list.querySelectorAll("li:not(.allMiniLi)"));
  let ulIdx = ul.map(li => {
    return li.id;
  });
  let todos = listTasks.filter(todo => ulIdx.includes(todo.id));
  
  let todoToSort = todos.map(todo => {
    return {
      id: todo.id,
      one: translateArray(mySettings.mySorting[sortIndex].sort[0]),
      two: translateArray(mySettings.mySorting[sortIndex].sort[1]),
      three: translateArray(mySettings.mySorting[sortIndex].sort[2]),
      four: translateArray(mySettings.mySorting[sortIndex].sort[3])
    };
    function translateArray(sort){
      let type;
      if(sort == "fa-solid fa-folder-closed fa-rotate-270"){
        type = todo.LName ? todo.LName.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') : "|";
      } else if(sort == "fa-solid fa-hashtag"){
        type = todo.term;
      }  else if(sort == "fa-regular fa-hourglass-half"){
        type = todo.deadline ? Number(todo.deadline.replaceAll("-", "")) : Infinity;
      } else if(sort == "typcn typcn-tag sortingTag"){
        type = todo.color;
      } else if(sort == "fa-solid fa-arrow-down-a-z"){
        //console.log(todo.task);
        //console.log(todo.id);
        type = todo.task.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      } else if(sort == "fa-solid fa-icons"){
        type = todo.icon;
      } else if(sort == ""){
        type = todo.startDate; //for schedule...
      } else if(sort == "fa-solid fa-arrow-right-arrow-left fa-rotate-90"){
        type = "none";
      };
      return type;
    };
  });

  let sortedTodos = todoToSort.sort((t1, t2) => 
  (t1.one < t2.one) ? -1 : (t1.one > t2.one) ? 1 : (t1.one == t2.one) ? (t1.two < t2.two) ? -1 : (t1.two > t2.two) ? 1 : (t1.two == t2.two) ? (t1.three < t2.three) ? -1 : (t1.three > t2.three) ? 1 : (t1.three == t2.three) ? (t1.four < t2.four) ? -1 : (t1.four > t2.four) ? 1 : 0 : 0 : 0 : 0);

  for(let i = sortedTodos.length - 1; i > -1; i--){
    let li = document.getElementById(sortedTodos[i].id);
    // if(i == sortedTodos.length - 1){
    //   list.prepend(`<h4 class="subList">${translateTerm(one)}</h4>`);
    // };
    list.prepend(li);
    // if(i !== 0 && sortedTodos[i].one !== sortedTodos[i + 1].one){
    //   list.prepend(`<h4 class="subList">${translateTerm(one)}</h4>`);// one of i + 1 (or, use [i - 1], then you can use the one of i) (en plus, juste (one), ça marchera pas; ça va prendre sortedTodos[i].one, genre!)
    // };
  };

  // color ex: blue = screen (need translate)
  // date ex: février 2024 (schedule) (need calcul)
  // label ex: Calia (LName)
  // term ex: oneTime (todo.term) or The one time thingies (with translate)
  // showTypes?

  function translateTerm(term){
    switch(term){
      case "Enter":
        return "";
      case "Space":
        return "";
      case "ArrowLeft":
        return "";
      case "ArrowUp":
        return "";
      case "ArrowRight":
        return "";
      case "ArrowDown":
        return "";
      default:
        console.log(evt.code);
        break;
    }
  };
};
window.sortItWell = sortItWell;

function sortItAllWell(){
  if(mySettings.mySorting){
    for(let i = mySettings.mySorting.length - 1; i >= 0; i--){
      let list = document.getElementById(mySettings.mySorting[i].list);
      if(!list){ //cleaning justInCase
        mySettings.mySorting.splice(i, 1);
      } else{
        sortItWell(i);
      };
    };
  };
  sortItAll(); //for the lists that don't have a mySettings.mySorting (or all of them if there isn't any mySettings.mySorting)
};

// *** SHUFFLE
// What about it's just amongst the 15 min or less tasks?
let wheneverList = [];
const listPage = document.querySelector("#listPage");
const toDoPage = document.querySelector("#toDoPage");
shuffleBtn.addEventListener("click", () => {
  let todayDate = getTodayDateString();
  wheneverList = listTasks.filter(task => (task.term == "oneTime" || task.term == "longTerm" || task.term == "alwaysHere") && !task.stock && task.line !== "recurringDay" && (task.line == "noDay" || task.startDate == todayDate) && task.quicky); 
  for (let i = wheneverList.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [wheneverList[i], wheneverList[j]] = [wheneverList[j], wheneverList[i]]; 
  };
  listPage.classList.toggle("displayNone");
  toDoPage.classList.toggle("displayNone");
  movingzone.classList.add("displayNone");
  num = 0;
  taskToDo.innerText = wheneverList[num].task;
  taskToDo.style.color = mySettings.myBaseColors[wheneverList[num].color].colorBG;
  if(wheneverList[num].info){ // add also if there's a miniList!!
    moreInfoWhole.classList.remove("displayNone");
    moreInfoDiv.innerText = wheneverList[num].info;
  } else{
    moreInfoWhole.classList.add("displayNone");
  };
});
/* shuffleBtn.addEventListener("click", () => {
  let todayDate = getTodayDateString(); //that might not work getTodayTime()
  // wheneverList = listTasks.filter(task => ((!task.date || task.date == "" || task.date <= todayDate) && (task.line !== "recurringDay" && !task.stock)) || (task.date > todayDate && task.line == "doneDay")); 
  wheneverList = listTasks.filter(task => (task.term == "oneTime" || task.term == "longTerm" || task.term == "alwaysHere") && !task.stock && task.line !== "recurringDay" && (task.line == "noDay" || task.startDate == todayDate)); 
  //WOLA il faudrait ajouter les recurry... et enlever les random... Bref, juste priority, today et whenever? ou juste whenever vu que le boutton est dans whenever...
  for (let i = wheneverList.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [wheneverList[i], wheneverList[j]] = [wheneverList[j], wheneverList[i]]; 
  };
  listPage.classList.toggle("displayNone");
  toDoPage.classList.toggle("displayNone");
  num = 0;
  taskToDo.innerText = wheneverList[num].task;
  taskToDo.style.color = mySettings.myBaseColors[wheneverList[num].color].colorBG;
  if(wheneverList[num].info){ // add also if there's a miniList!!
    moreInfoWhole.classList.remove("displayNone");
    moreInfoDiv.innerText = wheneverList[num].info;
  } else{
    moreInfoWhole.classList.add("displayNone");
  };
}); */

nopeNextBtn.addEventListener("click", () => {
  if(wheneverList.length == 0){
    taskToDo.innerText = "aller t'reposer!";
  } else{
    num = num < (wheneverList.length - 1) ? num + 1 : 0;
    taskToDo.innerText = wheneverList[num].task;
    taskToDo.style.color = mySettings.myBaseColors[wheneverList[num].color].colorBG;
    if(wheneverList[num].info){
      moreInfoWhole.classList.remove("displayNone");
      moreInfoDiv.innerText = wheneverList[num].info;
    } else{
      moreInfoWhole.classList.add("displayNone");
    };
  };
});
  
backBtn.addEventListener("click", () => {
  listPage.classList.toggle("displayNone");
  toDoPage.classList.toggle("displayNone");
  movingzone.classList.remove("displayNone");
});

// *** TIME
function timeItEvent(thisOne){
  thisOne.classList.add("displayNone");
  let li = thisOne.parentElement.parentElement;
  let list = li.parentElement.id;
  let input = li.querySelector("input[type='time']");
  let todo;
  let recIndex;
  let todoIndex;
  if(li.dataset.rec && li.dataset.rec !== "undefined"){
    let rec = li.dataset.rec;
    recIndex = listTasks.findIndex(todo => todo.id == rec);
    todoIndex = listTasks[recIndex].recurrys.findIndex(todo => todo.id == li.id);
    todo = listTasks[recIndex].recurrys[todoIndex];
  } else{
    todoIndex = listTasks.findIndex(todo => todo.id == li.id);
    todo = listTasks[todoIndex];
  };
  if(todo.startTime){
    input.value = todo.startTime;
  };
  input.classList.remove("displayNone");
  input.addEventListener("change", () => {
    if(!input.value){
      thisOne.innerHTML = `<i class="fa-regular fa-clock"></i>`;
      delete todo.startTime;
      delete todo.dalleRow;
      li.setAttribute("data-time", "");
    } else if(input.value){
      thisOne.textContent = input.value;
      todo.startTime = input.value;
      li.setAttribute("data-time", input.value);
    };
    thisOne.classList.remove("displayNone");
    input.classList.add("displayNone");
    if(list == "listToday" || list == "listTomorrow"){
      sortIt("datetime", list);
    };
    if(li.dataset.rec && li.dataset.rec !== "undefined"){ //That part needs to be reviewed! (old recurrys system!)
      delete li.dataset.rec;
      let oldRecurry = listTasks[recIndex].recurrys.splice(todoIndex, 1);
      delete oldRecurry[0].recurry;
      delete oldRecurry[0].out;
      delete oldRecurry[0].recId;
      listTasks.push(oldRecurry[0]);
    };
    if(todo.line == "recurringDay"){
      todo.recurrys.forEach(recurry => {
        recurry.startTime = todo.startTime;
        if(recurry.out){
          document.getElementById(recurry.id).setAttribute("data-time", todo.startTime);
        };
      });
    };
    
    localStorage.listTasks = JSON.stringify(listTasks);
    updateCBC();
  });
};
window.timeItEvent = timeItEvent;

// MARK: CALENDAR
let parent = ``;
let offspring = ``;
let changeRecurryDates = false;

//AJOUTER OFFSPRING
function smallCalendarChoice(thisOne){//thisOne = taskToDate est l'icon calendar
  let positionA = window.scrollY
  let list = thisOne.parentElement.parentElement.id;//That's the <ul>
  let li;
  if(list == "projectUl"){
    li = offspring = thisOne.parentElement; //That's the <li> inside the parent
  } else{
    li = parent = thisOne.parentElement; //That's the <li>
  };
  let recurryIsIt = li.dataset.rec && li.dataset.rec !== "undefined" ? true : false;
  li.classList.add("selectedTask");
  li.scrollIntoView();
  let todo = getTodoFrom(li);
  let parents = Array.from(document.querySelectorAll("li")).filter((il) => il.id.includes(todo.id));
  if(parents.length == 0){
    parents.push(li);
  };
  creatingCalendar(todo, thisOne, "onIcon");
  let calendarDiv = document.querySelector("#calendarDiv");
  newClickScreenCreation(calendarDiv);
 
  document.querySelector("#saveTheDateBtn").addEventListener("click", () => {
    if(recurryIsIt){
      getRecurryDateOut(todo); // donc la date du todo est enlevée des recurryDates de son recurringDay
      delete todo.recurry; //et todo redevient un todo normal!
      delete todo.recId; //et todo redevient un todo normal!
      listTasks.push(todo);// et le todo est maintenant dans la listTask!
    };
    calendarSave(todo); //
    if(todo.newShit){
      delete todo.newShit;
    };
    if(li == offspring){
      projectSwitch = true;
      todoCreation(todo); // creates it in the projectUL
      projectSwitch = false;
    } else{
      projectSwitch = false;
    };
    let togoList = getTogoList(todo);
    todoCreation(todo); //creates it in the todoZone if necessary
    // if(previousList !== togoList){
    //   if(togoList == ""){
    //     moving = false;
    //   } else{
    //     moving = true;
    //   };
    // };
    parents.forEach(parent => {
      parent.remove();
    });
    if(togoList !== ""){ //revoir les méthodes de tri et s'assurer de tenir compte du storage aussi
      howToSortIt(togoList);
    } else{
      sortItAllWell();
    };

    // now let's see if and where we should scroll...
    let newLi = document.getElementById(todo.id);
    if(newLi){
      let list = newLi.parentElement;
      let section = list.closest("section");
      if(section && section.querySelector(".listToggleInput")){
        section.querySelector(".listToggleInput").checked = true;
      };
      newLi.scrollIntoView();
    } else{
      // window.scrollTo({ top: 0 });
      window.scrollTo(0, positionA);
    };
    parent = ``;
    offspring = ``;
    //No need for the newClickScreenRemoval(calendarDiv) because everything is in the li (parent or offspring) which gets removed anyway; but we do need the parent = offspring = ``; because, even if the div dans be removed with newClickScreenRemoval(calendarDiv) (by click outside of the div), the div can also be removed with the save button (which removes the whole li)

    localStorage.listTasks = JSON.stringify(listTasks);
    updateWeek();
    updateMonth();
    //sortItAllWell(); //here's the sorting!!
    updateCBC();
  });

};

window.smallCalendarChoice = smallCalendarChoice;



function creatingCalendar(todo, home, classs){
  let newWidth;
  if(classs == "onIcon"){
    let div = parent.querySelector(".textDiv");
    let width = getComputedStyle(div).width;
    let num = width.slice(0, -2);
    newWidth = Number(num) + 44;
  };
  let rec = todo.line == "recurringDay" ? true : false;
  let shw = (todo.term == "showThing" || todo.term == "reminder") && !todo.stock ? true : false;
  let startDate = todo.startDate ? todo.startDate : rec ? todo.dal : getTodayDateString();
  let stopDate = todo.stopDate ? todo.stopDate : rec ? todo.dal : todo.startDate ? todo.startDate : getTodayDateString();
  //input duration for buffers
  let durationArray = [];
  let m = 0;
  let h = 0;
  for(let i = 0; i < (24 * 4); i++){
    let time = String(h).padStart(2, "0") + `:` + String(m).padStart(2, "0");
    durationArray = [...durationArray, `<option value="${time}">${time}</option>`];
    m = m == 45 ? 0 : m + 15;
    h = m == 0 ? h + 1 : h;
  };
  let duration = durationArray.join("");
  
  let daysWeek = mySettings.myWeeksDayArray.map((day, idx) => {
    return `<input type="checkbox" name="daysWeekChoice" class="cossin changeRecurryDates" id="${day.nameNoAcc}" value="${idx}" ${(rec && todo.var == "settimana" && todo.daysWeek && todo.daysWeek.includes(day.nameNoAcc)) ? `checked` : meseDayICalc(startDate) == idx ? `checked` : ``} />
    <label for="${day.nameNoAcc}" class="dayCircle">${day.letter}</label>`;
  }).join("");

  let todoDayDiv = `<div id="todoDaySection" ${todo.stock ? `class="displayNone"` : ``}>
  <input class="myRadio changeRecurryDates" type="radio" id="todoDayInput" name="whatDay" value="todoDay" ${todo.line == "todoDay" || (shw && todo.line !== "recurringDay") ? `checked` : ``} />
  <label for="todoDayInput" id="todoDayInputLabel" class="whatDayLabel calendarMargin"><p><span class="myRadio"></span><span class="normalText todoDay">${shw ? `Happening Day` : `To-do Day`}</span><br /><span class="smallText">${shw ? `(the day this is all gonna go down)` : `(the day you want to do it)`}</span></p></label>
  <div class="DaySection" id="oneDaySection">
    <h5 class="taskInfoInput" style="margin-left: 0;">It's a one time thing</h5>
    <div class="inDaySection" style="width: -webkit-fill-available; max-width: 300px;">
      <input id="oneTuttoGiornoInput" type="checkbox" class="tuttoGiornoInput cossin" ${todo.tutto ? `checked` : todo.tutto == false ? `` : `checked`} />
      <div class="calendarInsideMargin tuttoGiornoDiv">
        <p style="margin: 0;">Tutto il giorno?!</p>
        <label for="oneTuttoGiornoInput" class="slideZone">
          <div class="slider">
            <span class="si">Sì</span>
            <span class="no">No</span>
          </div>
        </label>
      </div>
      <div class="noneTuttoGiornoDiv calendarInsideMargin">
        <span>c'è un inizio?</span>
        <input type="date" id="oneDayStartDateInput" class="changeRecurryDates" value="${startDate}" />
        <input id="oneDayStartTimeInput" type="time" class="dalle dalleTxt" value="${todo.startTime ? todo.startTime : ``}" />
      </div>
      <div class="noneTuttoGiornoDiv calendarInsideMargin">
        <span>c'è una fine?</span>
        <input type="date" id="oneDayStopDateInput" class="changeRecurryDates" value="${stopDate}" />
        <input id="oneDayStopTimeInput" type="time" class="alle alleTxt" value="${todo.stopTime ? todo.stopTime : ``}" />
      </div>
    </div>
  </div>
</div>`;

  let recurringDayDiv = `<div id="recurringDaySection" ${todo.recurry || todo.stock ? `class="displayNone"` : ``}>
    <input class="myRadio changeRecurryDates" type="radio" id="recurringDayInput" name="whatDay" value="recurringDay" ${rec ? `checked` : ``} />
    <label for="recurringDayInput" class="whatDayLabel calendarMargin"><p><span class="myRadio"></span><span class="normalText recurringDay">Recurring Day</span><br /><span class="smallText">(let it come back on its own)</span></label></p></label>
    <div class="DaySection" id="recurryDaySection">
      <h5 class="taskInfoInput" style="margin-left: 0;">It's a recurring thing</h5>
      <div class="inDaySection" style="width: -webkit-fill-available; max-width: 280px;">
        <p class="calendarInsideMargin">Dal<input id="dalInput" type="date" class="changeRecurryDates" style="margin: 0 10px;" value="${startDate}" /></p>
        <input id="recuTuttoGiornoInput" type="checkbox" class="tuttoGiornoInput cossin" ${todo.tutto ? `checked` : todo.tutto == false ? `` : `checked`} />
        <div class="calendarInsideMargin tuttoGiornoDiv">
          <p style="margin: 0;">Tutto il giorno?!</p>
          <label for="recuTuttoGiornoInput" class="slideZone">
            <div class="slider">
              <span class="si">Sì</span>
              <span class="no">No</span>
            </div>
          </label>
        </div>
        <div class="noneTuttoGiornoDiv calendarInsideMargin">
          <p><span>c'è un inizio?</span><input id="recuTimeDalleInput" type="time" class="dalle dalleTxt" value="${todo.startTime ? todo.startTime : ``}" /></p>
          <p><span>c'è una fine?</span><input id="recuTimeAlleInput" type="time" class="alle alleTxt" value="${todo.stopTime ? todo.stopTime : ``}" /></p>
        </div>
        <p class="calendarInsideMargin">Si ripete ogni<input id="ogniInput" type="number" class="changeRecurryDates" style="width: 50px; margin: 0 10px;" value="${todo.ogni ? todo.ogni : ``}" />
        <select id="timeVariationInput" class="changeRecurryDates">
          <option value="giorno" ${rec && todo.var == "giorno" ? `selected` : ``}>giorno</option>
          <option value="settimana" ${rec && todo.var == "settimana" ? `selected` : ``}>settimana</option>
          <option value="mese" ${rec && todo.var == "mese" ? `selected` : ``}>mese</option>
          <option value="anno" ${rec && todo.var == "anno" ? `selected` : ``}>anno</option>
        </select></p>
        <div id="weekSection" class="calendarInsideMargin ${rec && todo.var == "settimana" ? `` : `displayNone`}" style="width: -webkit-fill-available;">
          <p>Da ripetere il</p>
          <div class="dayCircleWeek">
            ${daysWeek}
          </div>
        </div>
        <div id="monthSection" class="calendarInsideMargin ${rec && todo.var == "mese" ? `` : `displayNone`}">
          <p>Da ripetere</p>
          <input class="myRadio changeRecurryDates" type="radio" name="meseOptions" id="ogniXDate" ${rec && todo.var == "mese" && todo.meseOpt == "ogniXDate" ? `checked` : ``} value="ogniXDate" />
          <label for="ogniXDate" style="display: block;"><span class="myRadio"></span><span id="ogniXDateText"></span></label>
          <input class="myRadio changeRecurryDates" type="radio" name="meseOptions" id="ogniXDay" ${rec && todo.var == "mese" && todo.meseOpt == "ogniXDay" ? `checked` : ``} value="ogniXDay" />
          <label for="ogniXDay"><span class="myRadio"></span><span id="ogniXDayText"></span></label>
        </div>
        <div class="calendarInsideMargin">
          <p>Termina</p>
          <input class="myRadio changeRecurryDates" type="radio" name="fineOptions" id="fineMaiInput" value="fineMai" ${!rec ? `checked` : todo.fineOpt == "fineMai" ? `checked` : ``} />
          <label for="fineMaiInput" style="display: block;"><span class="myRadio"></span>Mai</label>
          <input class="myRadio changeRecurryDates" type="radio" name="fineOptions" id="fineGiornoInput" value="fineGiorno" ${rec && todo.fineOpt == "fineGiorno" ? `checked` : ``} />
          <label for="fineGiornoInput" style="display: block;"><span class="myRadio"></span>Il giorno<input id="fineDate" type="date" class="changeRecurryDates" style="margin: 0 10px;" value="${rec && todo.fineOpt == "fineGiorno" ? todo.fine : ``}" /></label>
          <input class="myRadio changeRecurryDates" type="radio" name="fineOptions" id="fineDopoInput" value="fineDopo" ${rec && todo.fineOpt == "fineDopo" ? `checked` : ``} />
          <label for="fineDopoInput" style="display: block;"><span class="myRadio"></span>Dopo<input id="fineCount" type="number" class="changeRecurryDates" style="width: 50px; margin: 0 10px;" value="${rec && todo.fineOpt == "fineDopo" ? todo.fineCount : ``}" />occorrenza</label>
        </div>
        <input id="pileUpInput" type="checkbox" class="tuttoGiornoInput cossin" ${todo.recPileUP == true ? `checked` : todo.recPileUP == false ? `` : ``} />
        <div class="calendarInsideMargin tuttoGiornoDiv">
          <p style="margin: 0;">Should they pile up?</p>
          <label for="pileUpInput" class="slideZone">
            <div class="slider">
              <span class="si">Sì</span>
              <span class="no">No</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>`;

  let noDayDiv = `<div id="noDaySection" ${shw ? `class="displayNone"` : ``}>
    <input class="myRadio changeRecurryDates" type="radio" id="noDayInput" name="whatDay" value="noDay" ${todo.line == "noDay" || todo.line == "" || !todo.line || todo.stock ? `checked` : ``} />
    <label for="noDayInput" id="noDayInputLabel" class="whatDayLabel calendarMargin"><p><span class="myRadio"></span><span class="normalText">No Day</span><br /><span class="smallText">${todo.stock ? `(let's put it away until we need it)` : `(just go with the flow)`}</span></label></p></label>
    <div class="DaySection" id="noDaySection">
      <h5 class="taskInfoInput" style="margin-left: 0;">Even if you don't know when that'll be...</h5>
      <div class="inDaySection" style="width: -webkit-fill-available; max-width: 200px;">
        <input id="noTuttoGiornoInput" type="checkbox" class="tuttoGiornoInput cossin" ${todo.tutto ? `checked` : todo.tutto == false ? `` : `checked`} />
        <div class="calendarInsideMargin tuttoGiornoDiv">
          <p style="margin: 0;">Ci vorrà tutto il giorno?!</p>
          <label for="noTuttoGiornoInput" class="slideZone">
            <div class="slider">
              <span class="si">Sì</span>
              <span class="no">No</span>
            </div>
          </label>
        </div>
        <div class="noneTuttoGiornoDiv calendarInsideMargin">
          <p><span>ci sarrà un inizio?</span><input id="noDayTimeDalleInput" type="time" class="dalle dalleTxt" value="${todo.startTime ? todo.startTime : ``}" /></p>
          <p><span>ci sarrà una fine?</span><input id="noDayTimeAlleInput" type="time" class="alle alleTxt" value="${todo.stopTime ? todo.stopTime : ``}" /></p>
        </div>
      </div>
    </div>
  </div>`;

  let openHourDiv = `<div id="openHourSection" class="calendarMargin" style="margin-top:20px;">
    <h5 class="taskInfoInput" style="margin-left: 0;">Is that only doable during opening hours?</h5>
    <div class="inDaySection" style="width: -webkit-fill-available; max-width: 200px;">
      <input id="openHourInput" type="checkbox" class="tuttoGiornoInput cossin" ${todo.openHour ? `checked` : ``} />
      <div class="calendarInsideMargin tuttoGiornoDiv">
        <p style="margin: 0;">8 à 5 du<br/>lundi au vendredi!</p>
        <label for="openHourInput" class="slideZone">
          <div class="slider">
            <span class="si">Sì</span>
            <span class="no">No</span>
          </div>
        </label>
      </div>
    </div>
  </div>`;

  let bufferDiv = `<div id="bufferSection" class="calendarMargin" style="margin-top:20px;">
    <h5 class="taskInfoInput" style="margin-left: 0;">How long will that really take?</h5>
    <div class="inDaySection" style="width: -webkit-fill-available; max-width: 200px;">
      <p style="margin-top: 10px;">
        <span>Before: </span>
        <!--<input id="primaBuffer" type="time" step="900" value="${todo.prima ? todo.prima : `00:00`}" />-->
        <select id="durationSelectPrima">
          ${duration}
        </select>
      </p>
      <p>
        <span>After: </span>
        <!--<input id="dopoBuffer" type="time" step="900" value="${todo.dopo ? todo.dopo : `00:00`}" />-->
        <select id="durationSelectDopo">
          ${duration}
        </select>
      </p>
    </div>
  </div>`;

  let busyDiv = `<div id="busySection" class="calendarMargin" style="margin-top:20px;">
    <h5 class="taskInfoInput" style="margin-left: 0;">Shall we consider you unavailable?</h5>
    <div class="inDaySection" style="width: -webkit-fill-available; max-width: 200px;">
      <input id="busyInput" type="checkbox" class="tuttoGiornoInput cossin" ${todo.busy || todo.term == "showThing" ? `checked` : ``} />
      <div class="calendarInsideMargin tuttoGiornoDiv">
        <p style="margin: 0;">Busy busy!</p>
        <label for="busyInput" class="slideZone">
          <div class="slider">
            <span class="si">Sì</span>
            <span class="no">No</span>
          </div>
        </label>
      </div>
    </div>
  </div>`;

  let deadlineDiv = `<div id="deadlineSection" class="calendarMargin${shw ? ` displayNone` : ``}">
  <h5 style="margin-left: 0; margin-bottom: 0;">Is there a deadline?</h5>
  <div class="inDaySection" style="width: -webkit-fill-available; max-width: 280px;">
    <p style="margin-top: 10px;"><span>Deadline:  </span><input id="deadlineInput" type="date" value="${todo.deadline ? todo.deadline : ``}" /></p>
    <div id="deadlineWithDate" ${todo.deadline && todo.deadline !== "" ? `` : `class="displayNone"`}>
      <input id="tuttoUltimoGiornoInput" type="checkbox" class="tuttoGiornoInput cossin" ${todo.tutto ? `checked` : todo.tutto == false ? `` : `checked`} />
      <div class="calendarInsideMargin tuttoGiornoDiv">
        <p style="margin: 0;">A qualunque ora??!</p>
        <label for="tuttoUltimoGiornoInput" class="slideZone">
          <div class="slider">
            <span class="si">Sì</span>
            <span class="no">No</span>
          </div>
        </label>
      </div>
      <div class="noneTuttoGiornoDiv calendarInsideMargin">
        <p><span>a che ora precisamente?</span><input id="lastDayTimeAlleInput" type="time" class="finoAlle finaleTxt" value="${todo.finoAlle ? todo.finoAlle : ``}" /></p>
      </div>
      <h5 style="margin-left: 0; margin-bottom: 0;">Do you want to set an alarm for it?</h5>
      <!-- How many (number) days/weeks/months (choice) before the deadline? -->
    </div>
  </div>
</div>`;

  let smallCalendar = `<div id="calendarDiv" class="${classs}"${classs == "onIcon" ? ` style="width:${newWidth}px;"` : ``}>
    ${classs == "onIcon" ? `<h5 class="taskInfoInput">Tell me when...</h5>` : ``}
    <div>
      ${todoDayDiv}
      ${recurringDayDiv}
      ${noDayDiv}
      <hr class="calendarhr"/>
      ${openHourDiv}
      <hr class="calendarhr"/>
      ${bufferDiv}
      <hr class="calendarhr"/>
      ${busyDiv}
      <hr class="calendarhr"/>
      ${deadlineDiv}
    </div>
    ${classs == "onIcon" ? `<button id="saveTheDateBtn" class="calendarMargin">STD<br /><span class="smallText">(Save The Date)</span></button>` : ``}
  </div>`;
  if(classs == "onIcon"){
    home.insertAdjacentHTML("afterend", smallCalendar);
  } else{
    home.insertAdjacentHTML("beforeend", smallCalendar);
  };
  
  let oneDayStartDate = document.querySelector("#oneDayStartDateInput");
  let oneDayStopDate = document.querySelector("#oneDayStopDateInput");
  let dalDate = document.querySelector("#dalInput");
  oneDayStartDate.addEventListener("change", () => {
    oneDayStopDate.value = oneDayStopDate.value < oneDayStartDate.value ? oneDayStartDate.value : oneDayStopDate.value;
    //dalDate.value = dalDate.value < oneDayStartDate.value ? oneDayStartDate.value : dalDate.value;
  });

  document.querySelector("#durationSelectPrima").value = todo.prima ? todo.prima : `00:00`;
  document.querySelector("#durationSelectDopo").value = todo.dopo ? todo.dopo : `00:00`;

  if(!todo.recurry){
    meseCalculate(startDate);//need it here otherwise the text just isn't there, because, ci-bas, meseCalculate only happens when var is changed, but if it is mese from the beginning, it wouldn't happen (week is taken care of earlier when we check them all)
    let weekSection = document.querySelector("#weekSection");
    let monthSection = document.querySelector("#monthSection");
    let timeVariationInput = document.querySelector("#timeVariationInput");

    timeVariationInput.addEventListener("change", () => {
      startDate = dalDate.value;
      if(timeVariationInput.value == "settimana"){
        weekCalculate(startDate);
        weekSection.classList.remove("displayNone");
        monthSection.classList.add("displayNone");
      } else if(timeVariationInput.value == "mese"){
        meseCalculate(startDate);
        weekSection.classList.add("displayNone");
        monthSection.classList.remove("displayNone");
      } else{
        weekSection.classList.add("displayNone");
        monthSection.classList.add("displayNone");
      };
    });
    document.querySelector("#dalInput").addEventListener("change", () => {
      startDate = dalDate.value;
      weekCalculate(startDate);
      meseCalculate(startDate);
    });
    document.querySelector("#fineDate").addEventListener("input", () => {
      document.querySelector("#fineGiornoInput").checked = true;
    });
    document.querySelector("#fineCount").addEventListener("input", () => {
      document.querySelector("#fineDopoInput").checked = true;
    });
  };
  
  document.querySelectorAll(".dalleTxt").forEach(dalle => {
    dalle.addEventListener("change", () => {
      if(dalle.value){
        dalle.parentElement.querySelector("span").textContent = "inizia alle:";
        let alle = dalle.parentElement.parentElement.querySelector(".alleTxt");
        alle.value = alle.value < dalle.value ? dalle.value : alle.value;
      } else{
        dalle.parentElement.querySelector("span").textContent = "c'è un inizio?";
      };
    });
  });
  document.querySelectorAll(".alleTxt").forEach(alle => {
    alle.addEventListener("change", () => {
      if(alle.value){
        alle.parentElement.querySelector("span").textContent = "finisce alle:";
      } else{
        alle.parentElement.querySelector("span").textContent = "c'è una fine?";
      };
    });
  });
  if(document.querySelector(".finaleTxt")){
    document.querySelector(".finaleTxt").addEventListener("change", (e) => {
      if(e.target.value){
        e.target.parentElement.querySelector("span").textContent = "ecco l'ora della verità:";
      } else{
        e.target.parentElement.querySelector("span").textContent = "a che ora precisamente?";
      };
    });
  };
  document.querySelector("#deadlineInput").addEventListener("change", (e) => {
    if(e.target.value){
      document.querySelector("#deadlineWithDate").classList.remove("displayNone");
    } else{
      document.querySelector("#deadlineWithDate").classList.add("displayNone");
    }
  });
  document.querySelectorAll(".changeRecurryDates").forEach(input => {
    input.addEventListener("change", () => {
      changeRecurryDates = true;
    });
  });
};

function clearRecurringData(todo){
  delete todo.dal;
  delete todo.ogni;
  delete todo.var;
  delete todo.daysWeek;
  delete todo.meseOpt;
  delete todo.meseDate;
  delete todo.meseDayN;
  delete todo.meseDayI;
  delete todo.fineOpt;
  delete todo.fine;
  delete todo.fineCount;
  delete todo.recurryDates;
  delete todo.recPileUP;
  //Don't delete todo.recurry nor todo.recId
};

function calendarSave(todo){ //
  todo.line = document.querySelector('input[name="whatDay"]:checked').value;
  // the 3 of them (noDay, todoDay and recurringDay) can have time and buffer
  let inDaySection = document.querySelector('input[name="whatDay"]:checked ~ div.DaySection > div.inDaySection');
  todo.tutto = inDaySection.querySelector('input[type="checkbox"].tuttoGiornoInput').checked ? true : false;
  let primaBuffer = document.querySelector("#durationSelectPrima");
  let dopoBuffer = document.querySelector("#durationSelectDopo");
  todo.prima = primaBuffer.value ? primaBuffer.value : "00:00";
  todo.dopo = dopoBuffer.value ? dopoBuffer.value : "00:00";
  if(todo.tutto){
    //delete todo.prima; //otherwise, if it's stock, we loose all the buffers!
    delete todo.startTime;
    delete todo.stopTime;
    //delete todo.dopo; //otherwise, if it's stock, we loose all the buffers!
  } else{
    let dalle = inDaySection.querySelector('input[type="time"].dalle');
    if(dalle && dalle.value !== ""){
      todo.startTime = dalle.value;
    } else{
      delete todo.startTime;
      todo.tutto = true;
    };
    let alle = inDaySection.querySelector('input[type="time"].alle');
    if(alle && alle.value !== ""){
      todo.stopTime = alle.value;
    } else{
      delete todo.stopTime;
    };
  };

  todo.openHour = document.querySelector("#openHourInput").checked ? true : false;
  
  todo.busy = document.querySelector("#busyInput").checked ? true : false;
  //busyZoneCreation(todo); (will be done when we save to cloud)

  if(todo.line == "noDay"){
    clearRecurringData(todo);
    delete todo.startDate;
    delete todo.stopDate; //there could still be a dalle, alle and tutto
 //if it was a recurry, it's gonna be arranged after calendarSave (delete of the recurry)
  } else if(todo.line == "recurringDay"){
    if(changeRecurryDates == true){
      clearRecurringData(todo);
      //**calculate todo.duration (stopDate-stopTime - startDate-startTime) before deleting startDate and stopDate!!
      delete todo.startDate;
      delete todo.stopDate;
      todo.dal = inDaySection.querySelector("#dalInput").value;
      let date = getDateFromString(todo.dal);
      todo.ogni = inDaySection.querySelector("#ogniInput").value;
      todo.var = inDaySection.querySelector("#timeVariationInput").value; 
      todo.fineOpt = inDaySection.querySelector('input[name="fineOptions"]:checked').value;
      if(todo.fineOpt == "fineGiorno"){
        todo.fine = inDaySection.querySelector("#fineDate").value;
      } else if(todo.fineOpt == "fineDopo"){
        todo.fineCount = inDaySection.querySelector("#fineCount").value;
      };
      if(todo.var == "giorno"){
        ogniOgni(todo, date);
      } else if(todo.var == "settimana"){
        todo.daysWeek = [];
        inDaySection.querySelectorAll('input[name="daysWeekChoice"]').forEach(choice => {
          if(choice.checked == true){
            todo.daysWeek.push(choice.value);
          };
        });
        ogniSettimana(todo, date);
      } else if(todo.var == "mese"){
        todo.meseOpt = inDaySection.querySelector('input[name="meseOptions"]:checked').value;
        if(todo.meseOpt == "ogniXDate"){
          todo.meseDate = meseDateCalc(todo.dal);
          ogniOgni(todo, date);
        } else if(todo.meseOpt == "ogniXDay"){
          todo.meseDayN = meseDayNCalc(todo.dal);
          todo.meseDayI = meseDayICalc(todo.dal);
          ogniMeseDay(todo, date);
        };
      } else if(todo.var == "anno"){
          ogniOgni(todo, date);
      };
    } else{
      todo.recPileUP = document.querySelector("#pileUpInput").checked ? true : false;
    };
  } else if(todo.line == "todoDay"){
    clearRecurringData(todo);
    todo.startDate = inDaySection.querySelector('#oneDayStartDateInput').value;
    todo.stopDate = inDaySection.querySelector('#oneDayStopDateInput').value;
  };
  let deadlineInput = document.querySelector("#deadlineInput");
  if(deadlineInput.value){
    todo.deadline = deadlineInput.value;
    todo.dlTutto = document.querySelector('#tuttoUltimoGiornoInput').checked ? true : false;
    if(!todo.dlTutto){
      let finoAlle = document.querySelector('input[type="time"].finoAlle');
      if(finoAlle && finoAlle.value){
        todo.finoAlle = finoAlle.value;
      } else{
        delete todo.finoAlle;
      };
    } else{
      delete todo.finoAlle;
    };
  } else if(!deadlineInput.value || deadlineInput.value == ""){
    delete todo.deadline;
    delete todo.dlTutto;
    delete todo.finoAlle;
  };
  changeRecurryDates = false;
};


// MARK: KEY/VALUES
/* 
todo.newShit => si présent et true, veut dire qu'il vient d'être créé (est deleted après)
todo.id
todo.task
todo.info
todo.color => number (index in mySettings.myBaseColors)
todo.icon
todo.term => {project: "wholeProject"}, {rappel: "reminder"}, {habit: "sameHabit"}, {task: "topPriority", "nextThing", "longTerm", "oneTime", "alwaysHere", "waitForIt", "thinkBoutIt", "crazyShit", "nevermind"}, {event: "showThing"}
todo.quicky => could be done in 15min or less
todo.urge
todo.urgeNum
todo.urgeColor
todo.miniList
  todo.miniList[].name
  todo.miniList[].type
  todo.miniList[].color number (index in mySettings.myBaseColors) 
  todo.miniList[].checked
todo.miniHide //the checked must be hidden if true
todo.showType => nom du showType (pas sûre que ça soit nécessaire/c'est utile pour la recherche!)
todo.STColorBG => couleur du background du showType
todo.STColorTX => couleur du texte du showType
todo.STColor => index of mySettings.myShowTypes but That doesn't work! we would want the index of colorsList (to rethink)
todo.startDate (anciennement todo.date) => date string
todo.stopDate => date string
todo.line => "todoDay", "recurringDay", "noDay"
todo.tutto => true/false si ça dure toute la journée ou si on considère 'dalle' et 'alle'. Par défaut: true
todo.deadline => date (string) du deadline (if no deadline, delete)
todo.dlTutto => true/false if deadline is all day or not (if no deadline, delete)
todo.finoAlle => heure (string) du deadline (if no deadline, delete)
todo.startTime (anciennement todo.dalle) => time à laquelle ça commence aussi anciennement todo.time (pour les event)
todo.stopTime (anciennement todo.alle) => time à laquelle ça fini
todo.prima => durée du buffer avant l'event
todo.dopo => durée du buffer après l'event
todo.stock => true/false (is a model in storage). Default: delete
todo.recycled => has been recycled from either a stock or a done (to remove once it's been saved, just like newShit)
todo.dal => date que ça commence
todo.ogni => numéro de répétition
todo.var => timeVariation, type de variation : "giorno", "settimana", "mese" or "anno"
todo.daysWeek => [] : "domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi" or "sabato" // these should be number...
todo.meseOpt => option mois : "ogniXDate" or "ogniXDay"
todo.meseDate => jour du mois où ça revient (xx)
todo.meseDayN => numéro du day (1e, 2e, 3e, ou 4e)
todo.meseDayI => index du day (0 = domenica, 1 = lunedi, 2 = martedi, etc)
todo.fineOpt => option quand ça fini: "fineMai", "fineGiorno" or "fineDopo"
todo.fine => jour que ça fini (date)
todo.fineCount => nombre d'occurences après lesquelles ça fini
todo.recurryDates =  [] array of the dates (previously called listDates)
todo.recId = id du todo qui est le recurring (l'original) (pour les recurry qui n'ont pas encore été pushed in listTasks seulement, pour qu'on puisse enlever sa date dans l'array recurryDate... non, let's keep the recId even after its been pushed in listTasks, in case one day we want to offer l'option "modify them all" or something like that) 
todo.recurry => true/false means it's one occurence of a recurring (calendar icon purple and cycle icon in taskInfo) (whether it's out in listTasks or not)
On sait si le <li> doit être dans les recurring ou dans les autres listes (donc présent dans listTasks) grâce à todo.line == "recurringDay" ou else
todo.recPileUP => once the date of the recurry is past, should it stick around and pile up (true) or should it be forgotten and erased (false). Default: (if not recurringDay)delete/(if recurringDay)false
xxx todo.out => (isn't used) true (le <li> du recurry a été créé) / false ou inexistant (le <li> n'a pas encore été créé)
todo.busy => (j'suis pus sûre si on le considère ou pas dans meetAlix, i.e. dans les busies, mais c'était l'idée). Default: false
todo.openHour => is it only relevant during business hours (Monday to Friday, from 8am to 5pm). Default: false
todo.label => true/false
todo.LName => string
todo.LColor => index of colorsList

**NOUVELLE VERSION SIMPLIFIÉES DES PROJECTS**
todo.pParentId = "(id of its closest parent; if it's the top parent, then "null")" (so, if todo.pParentId, then it's in the project category (either parent or offspring or both))
todo.pOffspringId = [array of the id of its offspring, in order] (if it's just an offspring then delete todo.pOffspringId, unless it's also a parent?)
todo.pColor = number (index of the colors of the project, only if it's a project. If it's an offspring, then we go check it's parent's colors' index)
todo.pName = nickname of the project (for the label), only if it's a project. If it's an offspring, then we go check it's parent's name
todo.pPosition => "out" (shows in the todoZone with the colors of its closest parent) -- "in" (doesn't show in the todoZone but shows in the Project's TaskInfo) -- "done" (shows in the doneZone; doesn't show in the todoZone but shows in the Project's TaskInfo but as done (crossLined))


mySettings.myShowTypes.name
mySettings.myShowTypes.colorBG => background-color
mySettings.myShowTypes.colorTX => color (text)
mySettings.myShowTypes.color => index of colorsList (only for newly created showTypes, not my 4 old ones) */


// MARK: RECURRING

function ogniOgni(todo, date){ //For ogni X days/month(on Y date)/year until fine o dopo Y occorrenza o 50 se mai
  let start;
  let stop;
  let listDates = [];
  let count = false;
  if(todo.fineOpt == "fineGiorno"){
    start = date;
    stop = getDateFromString(todo.fine);
  } else if(todo.fineOpt == "fineDopo"){
    start = 1;
    stop = Number(todo.fineCount);
    count = true;
  } else if(todo.fineOpt == "fineMai"){
    start = 1;
    stop = 3;
    count = true;
  } else{
    alert("y'a un prob de recurring (ogniOgni) avec " + todo.task);
    start = date;
    stop = getDateFromString("2024-12-31");
  };  
  while (start <= stop){
    let Sdate = getStringFromDate(date);
    listDates.push(Sdate);
    if(todo.var == "giorno"){
      date.setDate(date.getDate() + Number(todo.ogni));
    } else if(todo.var == "mese"){
      date.setMonth(date.getMonth() + Number(todo.ogni));
    } else if(todo.var == "anno"){
      date.setFullYear(date.getFullYear() + Number(todo.ogni));
    };
    //start = count ? start++ : date; //bugged the whole thing! so let's keep the naive way!
    if(count){
      start++;
    } else{
      start = date;
    };
  };
  todo.recurryDates = pruning(todo, listDates);
};

function ogniSettimana(todo, date){
  let start;
  let stop;
  let listDates = [];
  let count = false;
  let days = todo.daysWeek;
  let nw = 0;
  if(todo.fineOpt == "fineGiorno"){
    start = date;
    stop = getDateFromString(todo.fine);
  } else if(todo.fineOpt == "fineDopo"){
    start = 1;
    stop = Number(todo.fineCount);
    count = true;
  } else if(todo.fineOpt == "fineMai"){
    start = 1;
    stop = 3;
    count = true;
  } else{
    alert("y'a un prob de recurring (ogniOgni) avec " + todo.task);
    start = date;
    stop = getDateFromString("2024-11-30");
  }; 
  while (start <= stop){
    if(nw == 0 && days.includes(String(date.getDay()))){
      let Sdate = getStringFromDate(date);
      listDates.push(Sdate);
      if(count){
        start++;
      };
    };
    if(date.getDay() == 6){ //if == 1 nm => nm++ (mais le mettre avant pour que le 1 soit considéré...)
      nw++;
    };
    if(nw == Number(todo.ogni)){
      nw = 0;
    };
    date.setDate(date.getDate() + 1);
    if(!count){
      start = date;
    };
  };
  todo.recurryDates = pruning(todo, listDates);
};

function ogniMeseDay(todo, date){ //For ogni X month on Y° day until fine o dopo Y occorrenza o 50 se mai
  //todo.meseDayN c'est le combientième du mois
  //todo.meseDayI l'index dans le array des jours de la semaine 
  let start;
  let stop;
  let listDates = [];
  let count = false;
  let nd = Number(todo.meseDayN);
  let nm = 0;
  let endOfMonth;
  if(todo.fineOpt == "fineGiorno"){
    start = date;
    stop = getDateFromString(todo.fine);
  } else if(todo.fineOpt == "fineDopo"){
    start = 1;
    stop = Number(todo.fineCount);
    count = true;
  } else if(todo.fineOpt == "fineMai"){
    start = 1;
    stop = 3;
    count = true;
  } else{
    alert("y'a un prob de recurring (ogniOgni) avec " + todo.task);
    start = date;
    stop = getDateFromString("2024-11-30");
  }; 
  while (start <= stop){
    endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    if(nd == Number(todo.meseDayN) && String(date.getDay()) == Number(todo.meseDayI) && nm == 0){
      let Sdate = getStringFromDate(date);
      listDates.push(Sdate);
      if(count){
        start++;
      };
      nd = 1;
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      nm++;
    };
    if(nd == Number(todo.meseDayN) && String(date.getDay()) == Number(todo.meseDayI) && nm !== 0){
      nd = 1;
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      nm++;
    };
    if(String(date.getDay()) == Number(todo.meseDayI)){
      nd++;
    };
    if(nm == Number(todo.ogni)){
      nm = 0;
    };
    if(getStringFromDate(date) == getStringFromDate(endOfMonth)){
      nd = 1;
      nm++;
    };
    if(nd > 6){
      start = stop + 1;
    };
    date.setDate(date.getDate() + 1);
    if(!count){
      start = date;
    };
  };
  todo.recurryDates = pruning(todo, listDates);
};



function pruning(todo, listDates){
  let hierOggiTime = timeLimit("hierOggi");
  let time = todo.startTime ? todo.startTime.replace(":", "-") : "5-00";
  function isNewEnough(date){
    let dateTime = `${date}-${time}`;
    if(dateTime > hierOggiTime){
      return true;
    } else{
      return false;
    };
  };
  listDates = listDates.filter(isNewEnough);
  return listDates;
};


function weekCalculate(date){
  let dayI = meseDayICalc(date);
  let n = 0;
  document.getElementsByName("daysWeekChoice").forEach(choice => {
    if(dayI == n){
      choice.checked = true;
      n++;
    } else{
      choice.checked = false;
      n++;
    };
  });
};

function meseCalculate(date){
  let dalG = meseDateCalc(date);
  let dayIdx = meseDayICalc(date);
  let dayC = meseDayNCalc(date);
  document.querySelector("#ogniXDateText").innerText = `ogni mese, il giorno ${dalG}`;
  document.querySelector("#ogniXDayText").innerText = `ogni mese, il ${dayC}° ${mySettings.myWeeksDayArray[dayIdx].name0Maj}`;
};

// MARK: DATE CALCULE

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

function getDateTimeFromString(date, time){
  let dalA = date.slice(0, 4);
  let dalM = date.slice(5, 7);
  // let dalG = date.slice(8, 10);
  let dalG = meseDateCalc(date);
  let dalH = time.substring(0, 2);
  let dalMn = time.substring(3);
  return new Date(dalA, dalM - 1, dalG, dalH, dalMn);
};

function getNextDateStringFromString(dateString){
  let date = getDateFromString(dateString);
  date.setDate(date.getDate() + 1);
  return getStringFromDate(date);
};

function getPrevDateStringFromString(dateString){
  let date = getDateFromString(dateString);
  date.setDate(date.getDate() - 1);
  return getStringFromDate(date);
};

function meseDateCalc(date){
  return date.slice(8, 10);
};
function meseDayICalc(date){
  let dateHere = getDateFromString(date);
  return dateHere.getDay();
};
function meseDayNCalc(date){
  let dalA = date.slice(0, 4);
  let dalM = date.slice(5, 7);
  // let dalG = date.slice(8, 10);
  let dalG = meseDateCalc(date);
  let dayIdx = meseDayICalc(date);
  let dayC = 0;
  for(let n = 1; n < Number(dalG) + 1; n++){
    let dayN = new Date(dalA, dalM - 1, n).getDay();
    if(dayN == dayIdx){
      dayC++;
    };
  };
  return dayC;
};

function getDayNameFromString(date){
  let dayIdx = meseDayICalc(date);
  let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
  return `${mySettings.myWeeksDayArray[idx].name1Maj}`;
}

// *** DETAILS

let newLabel = {
  color : "",
  name : ""
};
//console.log(JSON.stringify(newLabel));
function newLabelReset(){
  newLabel = {
    color : "",
    name : ""
  };
};
let newlabelName = "";
let newlabelColor = "";

// MARK: TODO List
/*
***PROJECT
  - Créer projectOptionsEvent()
  - getStorage() mais pour offspring
***EnCours:
- weeklyFilter (l'icon filter est en displayNone en attendant que le reste du code soit fait)
pour commencer, je propose une liste des types de shows et task avec, pour chaque, un slider vert show/hide ou un oeil avec ou sans barre.
Avec deux bouttons: "let's see" (qui ne va pas sauver dans les settings) et "save as default" (qui va sauver dans les settings lors du prochain saveToCloud (donc on rougit le nuage))

***ÀFaire:

* Créer les pinup (liste d'épicerie)

* Mettre les sections dans un array, créées par js plutôt que dans HTML (comme ça, on va pouvoir les modifier comme on veut)
  Établir toutes les key/values des objects/sections
  Créer une page (et le bouton pour y accéder) (ou une section dans les settings) où on va pouvoir modifier les sections
    title
    slogan
    color
    sort array
    open/closed
    show/hide/delete
    position (in the array, thus in the screen)
  Ajuster le HTML
  Créer la fonction pour la création des sections
  Ajouter qqpart (à chaque "refresh" une fx qui check si des sections sont vides et, si oui, voir dans leur obj si elles doivent être cachée ou non lorsque vide) (là où change l'opacité des chevron en fx de si la section est vide ou pas (on faisait ça au début ou à chaque fois?))
  Assurer la sauvegarde de l'array mySections dans le cloud
    Pour la première fois, créer les crypto.randomUUID de chaque section
    Ensuite, aller modifier les todo.term de chaque todo dans la listTask (et dans les done?!)
      OU
    Ajuster le code pour qu'il utilise le todo.term de façon à ce que ça dérange pas si c'est un mot (pour les sections par défault) ou un UUID (pour les nouvelles sections)...
      OU
    Créer une fonction de traduction pour chaque fois qu'on utilise le todo.term et que c'est un mot qui va aller chercher le id correspondant (surtout pour les done si on les recycle!)


*Shuffle juste pour les 15min et moins

*Quand on copy: le bouton dit "Save & copy" et ferme le taskInfo (et enlève selectedTask) (bref, comme un save normal), mais rouvrir tout de suite après le taskInfo de la nouvelle copie (ou pourrait écrit "copy" en haut) pour qu'elle puisse être modifiée tout de suite.

*Faire qu'on peut soit recycler, soit modifier, les show passés à partir des calendriers (dans la DoneZone, on peut les recycler, mais dans les calendrier, ils sont inclickables...)

*Retester les miniLists et leur visibilité, parce que des fois ils disparaissent ou pas, mais pas comme ils devraient

*? Mettre le boutton SAVE (dans taskInfo) en haut plutôt qu'en bas pour pas avoir à enlever le clavier pour pouvoir sauver?

*Pouvoir ordonner les task dans Today's plan... (faire comme les schedules dans Time?)

*Simplier les codes pour les toTIdeTZaN et autres

*Let's lighten up the recurring "anno"
  (line 465)
  //We could remove most of the recurryDates of the recurring var==anno that still have like 48 recurryDates in their array...!

*Let's transfer all the past reminders from listTasks in the right listDones.date
  (line 635)
  // listTasks.forEach((todo, idx) => {
  //   if(todo.term == "reminder"){
  //     let todoDateTime = `${todo.startDate}-${todo.startTime ? todo.startTime.replace(":", "-") : "5-00"}`;
  //     if(todoDateTime < hierOggiTime){
  //       let doned = listDones[listDones.findIndex(dd => dd.date == todo.startDate)];
  //       doned.list.push(todo);
  //       listTasks.splice(idx, 1);
  //     };
  //   };
  // });
  // NOW we still have to stop the donedReminders from appearing in the doneZone AND make sure they'll appear in the calendars.


*Quand tu cliques sur un event A dans les calendar, puis sur un event B dans storage, il faudrait que ça modifie l'event A, avec la journée de l'event A, mais les heures et autres de l'event B. (et non la journée du dernier event que t'as créé... (PAB schedule creation))

**Dans monthly et weekly: On ne peut pas voir les reminder du passé s'ils sont recurring, parce que les dates du passé sont effacées de l'array recurryDates et qu'ils ne sont pas non plus dans la liste des dones! (les reminder du passé qui étaient todoDay, sont toutefois visibles, mais c'est parce qu'ils sont encore dans la todoList et non dans les dones...)

*Option to add an alarm if there is a deadline: how many days/weeks/months before the deadline do you want it to appear? (Maybe with an icon of clock at the beginning of the task, in the li ?) Just make it kind of an alert on the day of the alarm, just like the procrastination "alert"

*If we use recurring just like google, and use todoDay as todo.dal as well as todo.dalle/startTime et todo.alle/stopTime, we could calculate the recurryDates with todo.startDate and a todo.duration to calculate the new todo.stopDate... (create new function dateTimeMath)
1. Tout repenser le système de date pour pouvoir avoir dalle (date & time) et alle  (date & time)
  Dans weekly, le début est un jour/une col, la fin est un autre jour, la même col (dateTime < nextDayTime)
  Si c'est sur deux jours, comment qu'on le met dans le weekly? Un we from dateTimeBeg to endOfDay, un autre we from startOfDay to dateTimeEnd

  todo.startDate = "2024-06-19"
  todo.startTime = "11:00"
  todo.stopDate = "2024-06-20"
  todo.stopTime = "15:00"

  Where do we use date:
    - in search
    - swiping section (we basically recreate dateTime!)
    - getWholeRecurry(todo, date, recId) ...
    - todoCreation
      - we check the next recurryDate to show the days in the calendar icon
      - timeSpan/timeInput (in the li, we show the time)
    - getTogoList
      we basically recreate dateTime!
      we use the last recurryDate to create more recurryDates...
    - recurryCreation
      we recreate dateTime
    - getRecurryDateOut(todo)(we use recurry.date to remove that date from it's todo.recurryDates)
    - Sorts
    - shuffle
    - smallCalendar (create and save calendar)
    - calculating the recurryDates! (and all the meseCalculate, weekCalculate, etc) (quoique ça, on utilise todo.dal ...!)
    - when creating a new/stock todo: todo.date from monthly or weekly or today (if stock)
    - taskInfo: tell me when (date)
    - monthly: one less sorting to do (dateTime instead of date, then time)
    - weekly: 
      - compare date with Dday and Sday (we could add time to these two)
      - dalle and alle give you the row whereas date gives you the col
    - busyZoneCreation

10. Ajouter une zone prima au-dessus des li qui sont dans swiping section avec l'heure de début (dalle-prima) (un jour ça pourrait être un input qui permet de modifier le prima, mais pour l'instant ça peut juste être visuel)

3. Trouver une solution pour pouvoir afficher plus d'un évènement en même temps dans le weekly...

9. Review all the sorting functions... This is getting ridicule!

8. change gotItDone/gotItHalfDone for removeFromListTasks (une only for totalCheckEvent ... could also be used for trashStockEvent and trashRecurringEvent?) and addToDones (use for both checkEvent)

8.5. trashRecurringEvent must be updated...

7. in checkOptions, the change label doesn't really work...

1. Gérer le clickscreen (voir si on peut en créer un pour chaque niveau) (then we can erase the 'where: "todoZone"' in infos!)
  - On n'utilise pas de clickscreen pour les calendars weekly et monthly
  - On crée un nouveau clickscreen à chaque fois qu'on crée un addOn (taskInfo ou checkUrges ou iconPalet ou reDate ou label ou smallCalendar ou (?)): le z-index est de 1 de moins que celui du addOn et avec le addEventListener que si on click, on a addOn.remove() et clickscreen.remove() et un scrollBackToParent or top 

2. Revoir la sortie de taskInfo! --> il reste à gérer le clickHandlerAddOn qu'on a ajouté au clickscreen (est-ce qu'on garde ça ou pas?) (ou on add le même eventListener que pour cancel button. Et on fait juste remove le clickscreen...)

4. iconChoice (from the li) is still using recIndex.recurrys...
5. consider creating and removing the color and icon palets everytime instead of sometimes trashing it and sometimes moving it...

1. considérer afficher allStore dans le body à chaque fois? (peut-être même taskInfo aussi, vu que des fois, c'est la seule chose qui change d'un toTI à l'autre!)

3. if fineMai and recurryDates.length == 0 then alert and check if you can use alert "ok" to do erase and "cancel" to open taskInfo with the todo that is about to be erased!!)

...Si on met les recurry dans les search results, le toTIdeLIaM() est déjà arrangé pour recevoir les recurry!
*/

// MARK: ToGoToTI + RÉFLEXTION

//parent is global but we still have to give it a value (we might need to rethink parent being global when we want multiple clickscreens...)

//Parents are only necessairy if we're working on a todo that is in the swiping section (for example, you would have the one on wednesday and the one in scheduled) or if in search, we add the results of different searches together and a todo comes up more than once


/* 
On pourrait réduire encore plus le nombre de toTI... si:
  - on met les "thisOne.parentElement.parentElement" directement dans les onclick="...(thisOne.parentElement.parentElement)"
  - on ajoute qqch qui dit if(parent is <li>){parent.classList.add("selectedTask");}; (comme ça, les calendriers auront pas le selectedTask, mais les autres oui)
*/


// to go to taskAddAllInfo

function toTIdeTZaN(){ // de TodoZone à New (addForm but without the addInput.value, so when you directly click the add button (if you write an addInput.value, it directly goes to todoCreation, then after that you can click on it to go to taskInfo, in which case, it's a toTIdeLIaM))
  let todo = {
    newShit: true,
    id: crypto.randomUUID(),
    color: "0",
    icon: "fa-solid fa-ban noIcon",
    term: "oneTime",
    line: "noDay"
  };
  taskAddAllInfo(todo);
};

function toTIdePSaN(){ // de ProjectSection à New
  document.querySelector("#projectSection").remove();
  document.querySelector("#taskInfo").remove();
  document.querySelectorAll(".newClickScreen").forEach(ncs => {
    ncs.remove();
  });
  let newtodo = {
    newShit: true,
    id: crypto.randomUUID(),
    color: "0",
    icon: "fa-solid fa-ban noIcon",
    term: "oneTime",
    line: "noDay",
    pParentId: "",
    pPosition: "in"
  };
  taskAddAllInfo(newtodo);
};
window.toTIdePSaN = toTIdePSaN;

//Fonctionne pour (TodoZone, AllStorage, SearchScreen) à Modification 
function toTIdeLIaM(thisOne){ // de <li> à Modification (et à Procrastinator (this.parentElement))
  parent = thisOne.parentElement.parentElement;
  parent.classList.add("selectedTask");
  let todo = getTodoFrom(parent);
  taskAddAllInfo(todo);
};
window.toTIdeLIaM = toTIdeLIaM;

function toTIdePSaM(thisOne){ // de ProjectSection à Modification
  parent = thisOne.parentElement.parentElement;//C'est quand déjà qu'on utilise offspring au lieu de parent??
  parent.classList.add("selectedTask");
  let todo = getTodoFrom(parent);
  document.querySelector("#projectSection").remove();
  document.querySelector("#taskInfo").remove();
  document.querySelectorAll(".newClickScreen").forEach(ncs => {
    ncs.remove();
  });
  taskAddAllInfo(todo);
};
window.toTIdePSaM = toTIdePSaM;

function toTIdeTPSaM(thisOne){ // de Top ProjectSection à Modification
  parent = thisOne;
  let todo = getTodoFrom(parent);
  document.querySelector("#projectSection").remove();
  document.querySelector("#taskInfo").remove();
  document.querySelectorAll(".newClickScreen").forEach(ncs => {
    ncs.remove();
  });
  taskAddAllInfo(todo);
};
window.toTIdeTPSaM = toTIdeTPSaM;

function toTIdeTZaS(thisOne){ // de TodoZone à Stock reusage
  document.querySelector("#allStore").remove();
  let reuseLi = thisOne.parentElement;
  let reuseId = reuseLi.id;
  let reuseIndex = listTasks.findIndex(todo => todo.id == reuseId);
  let reuse = listTasks[reuseIndex];
  let todo = JSON.parse(JSON.stringify(reuse));
  todo.id = crypto.randomUUID();
  todo.line = "todoDay";
  todo.startDate = getTodayDateString();
  todo.recycled = true;
  delete todo.stock;
  let div = document.body;
  div.scrollIntoView();
  taskAddAllInfo(todo);
};
window.toTIdeTZaS = toTIdeTZaS;


let projectStock = false;

function toTIdePaS(thisOne){
  projectStock = true;
  document.querySelector("#allStore").remove();
};
window.toTIdePaS = toTIdePaS;


function toTIdeSSaS(thisOne){ // de SearchScreen à Stock reusage
  let reuseLi = thisOne.parentElement;
  let reuseId = reuseLi.id;
  let reuseIndex = listTasks.findIndex(todo => todo.id == reuseId);
  let reuse = listTasks[reuseIndex];
  let todo = JSON.parse(JSON.stringify(reuse));
  todo.id = crypto.randomUUID();
  todo.line = "todoDay";
  todo.startDate = getTodayDateString();
  todo.recycled = true;
  delete todo.stock;

  taskAddAllInfo(todo);
};
window.toTIdeSSaS = toTIdeSSaS;

let calendarStock = false;
let newTodoStockFromCal = {};

function toTIdeCMaN(thisOne){ // de CalMonthPage à New
  calendarStock = true;
  let kaseDate = thisOne.parentElement.dataset.wholedate;
  let todo = newTodoStockFromCal = {
    newShit: true,
    id: crypto.randomUUID(),
    color: "0",
    icon: "fa-solid fa-ban noIcon",
    term: "showThing",
    line: "todoDay",
    busy: true,
    tutto: true,
    startDate: kaseDate
  };
  taskAddAllInfo(todo);
};
window.toTIdeCMaN = toTIdeCMaN;

//Fonctionne pour (CalMonthPage, CalWeekPage) à Modification
function toTIdeCaM(thisOne){ // de Calendar (div) à Modification
  parent = thisOne; //if it's done (past), it won't work because it's not in listTasks anymore... do we want to be able to modify done ones? If so, we'll need to have a function to get the done in the listDones... and modify it there...
  let todo = getTodoFrom(parent);
  taskAddAllInfo(todo);
};
window.toTIdeCaM = toTIdeCaM;

function toTIdeCMaM(thisOne){ // de CalMonthPage à Modification
  parent = thisOne;
  let todo = getTodoFrom(parent);
  taskAddAllInfo(todo);
};
window.toTIdeCMaM = toTIdeCMaM;

function toTIdeCWaM(thisOne){ // de CalWeekPage à Modification
  parent = thisOne;
  let todo = getTodoFrom(parent);
  taskAddAllInfo(todo);
};
window.toTIdeCWaM = toTIdeCWaM;

function toTIdeCWaN(thisOne){ // de CalWeekPage à New
  calendarStock = true;
  let colNum = thisOne.style.gridColumnStart;
  let code = mySettings.myWeeksDayArray[colNum - 2].code;
  let colEl = document.querySelector(`[data-code="${code}"]`);
  let colDate = colEl.dataset.date;
  let todo = {
    newShit: true,
    id: crypto.randomUUID(),
    color: "0",
    icon: "fa-solid fa-ban noIcon",
    term: "showThing",
    busy: true,
    line: "todoDay",
    startDate: colDate
  };
  let rowName = thisOne.style.gridRowStart;
  if(rowName == "row-tutto"){
    todo.tutto = true;
  } else{
    let hourMath = Number(rowName.slice(4, 6));
    let hourEndMath = hourMath + 1;
    let hourEndNum = hourEndMath < 24 ? hourEndMath : hourEndMath - 24;
    todo.startTime = `${String(hourMath).padStart(2, "0")}:00`;
    todo.stopTime = `${String(hourEndNum).padStart(2, "0")}:00`;
    todo.tutto = false;
  };
  newTodoStockFromCal = todo;

  taskAddAllInfo(todo);
};
window.toTIdeCWaN = toTIdeCWaN;

function toTIdeCCaNS(thisOne){ //de calendar (month || weekly) à Stock reusage à partir de New (calendarStock)
  document.querySelector("#taskInfo").remove();
  document.querySelector("#allStore").remove();
  let reuseLi = thisOne.parentElement;
  let reuseId = reuseLi.id;
  let reuseIndex = listTasks.findIndex(todo => todo.id == reuseId);
  let reuse = listTasks[reuseIndex];
  let todo = JSON.parse(JSON.stringify(reuse));
  todo.id = crypto.randomUUID();
  let newTodo = newTodoStockFromCal;
  //Now we compare the todo with the newTodo
  todo.startDate = newTodo.startDate;
  todo.startTime = todo.startTime ? todo.startTime : newTodo.startTime;
  todo.stopTime = todo.stopTime ? todo.stopTime : newTodo.stopTime;
  todo.tutto = todo.startTime ? false : true;
  todo.line = "todoDay";
  todo.recycled = true;
  delete todo.stock;
  taskAddAllInfo(todo);
};
window.toTIdeCCaNS = toTIdeCCaNS;



function getProjectOnglets(todo) {
  let projectOnglets = [];
  if(todo.pColor && todo.pName){ //then it's a project, whether or not it has offsprings yet, then it also means we must do the borders accordingly 
    let onglet = `<div class="projectOnglet" style="background-color:${colorsList[todo.pColor].colorBG}; color:${colorsList[todo.pColor].colorTX};">${todo.pName}</div>`;
    projectOnglets.push(onglet);
  };
  if(todo.pParentId){ //then it's in project (could be anything)
    let pParentId = todo.pParentId;
    while (pParentId !== "null") {
      let parentTodo = listTasks[listTasks.findIndex(td => td.id == pParentId)];
      let onglet = `<div class="projectOnglet" style="background-color:${colorsList[parentTodo.pColor].colorBG}; color:${colorsList[parentTodo.pColor].colorTX};">${parentTodo.pName}</div>`;
      projectOnglets.push(onglet);
      pParentId = parentTodo.pParentId;
    };
  };
  if(projectOnglets.length > 0){
    projectOnglets = projectOnglets.join("");
  };
  return projectOnglets;
};

// MARK: TASKINFO

const checkSwitch = [
  "typcn typcn-media-stop-outline", 
  "typcn typcn-input-checked-outline", 
  "typcn typcn-input-checked"
];

function taskAddAllInfo(todo){
  let positionA = window.scrollY;
  let parents;
  console.log(todo);
 
  let myShows;
  if(mySettings.myShowTypes.length > 0){
    myShows = mySettings.myShowTypes.map((myShowType, idx) => {
      return `<div class="showTypeLabelDiv" id="div${myShowType.name}">
        <input class="showInput" type="radio" name="showOptions" id="${myShowType.name}Show" value="${myShowType.name}" ${(todo.term == "showThing" && todo.showType == myShowType.name) ? `checked` : (!todo.showType || todo.showType == "") && idx == 0 ? `checked` :  ``} />
        <label for="${myShowType.name}Show" class="showLi showTypeLabel" style="background-color:${myShowType.colorBG};color:${myShowType.colorTX};">${myShowType.name}<i class="typcn typcn-tick showTick"></i></label>
        <i class="typcn typcn-trash" onclick="trashShowTypeEvent(this)"></i>
      </div>`; //colorsList[myShowType.color].colorTX
    }).join("");
  } else{
    myShows = `<h6>pssst... You've got no types of show... yet</h6>`;
  };

  let pColors = colorsList.map((icon, idx) => {
    return `<input id="projectColor${idx}" type="radio" name="projectColorChoices" class="displayNone" value="${idx}" ${todo.pColor && colorsList[todo.pColor].colorBG == icon.colorBG ? "checked" : ""} /><label for="projectColor${idx}" class="showTypeIconsB projectColorChoix"><i class="fa-solid fa-folder-closed" style="color:${icon.colorBG};"></i></label>`;
  }).join("");
  let projectColorsChoice = `<div class="projectColorsDiv">${pColors}</div>`;
  
  let projectNamesChoice;
  let allProjects = listTasks.filter(td => td.pOffspringId);//means they're parents
  if(allProjects.length > 0){
    let allBigParents = allProjects.filter(td => td.pParentId == "null");
  //Temp C
  let projectNamesParents = allBigParents.map((parentProject) => {
    let part1 = `<option style="background-color:${colorsList[parentProject.pColor].colorBG}; color:${colorsList[parentProject.pColor].colorTX};" value="${parentProject.id}" ${todo.pParentId && todo.pParentId == parentProject.id ? `selected` : ``}>${parentProject.pName}</option>`;
    let part2 = ``;
    let allInsideProjects = allProjects.filter(td => td.pParentId == parentProject.id);
    if(allInsideProjects.length > 0){
      let insideProjects = allInsideProjects.map((insideProject) => {
        let part3 = `<option style="background-color:${colorsList[insideProject.pColor].colorBG}; color:${colorsList[insideProject.pColor].colorTX};" value="${insideProject.id}" ${todo.pParentId && todo.pParentId == insideProject.id ? `selected` : ``}>--${insideProject.pName}</option>`;
        let part4 = ``;
        let allInsideInsideProjects = allProjects.filter(tdI => tdI.pParentId == insideProject.id);
        console.log(allInsideInsideProjects);
        if(allInsideInsideProjects.length > 0){
          let insideInsideProjects = allInsideInsideProjects.map((insideInsideProject) => {
            let part5 = `<option style="background-color:${colorsList[insideInsideProject.pColor].colorBG}; color:${colorsList[insideInsideProject.pColor].colorTX};" value="${insideInsideProject.id}" ${todo.pParentId && todo.pParentId == insideInsideProject.id ? `selected` : ``}>----${insideInsideProject.pName}</option>`;
            let part6 = ``;
            let allInsideInsideInsideProjects = allProjects.filter(tdII => tdII.pParentId == insideInsideProject.id);
            if(allInsideInsideInsideProjects.length > 0){
              let insideInsideInsideProjects = allInsideInsideInsideProjects.map((insideInsideInsideProject) => {
                return `<option style="background-color:${colorsList[insideInsideInsideProject.pColor].colorBG}; color:${colorsList[insideInsideInsideProject.pColor].colorTX};" value="${insideInsideInsideProject.id}" ${todo.pParentId && todo.pParentId == insideInsideInsideProject.id ? `selected` : ``}>------${insideInsideInsideProject.pName}</option>`;
              }).join("");
              part6 = `${insideInsideInsideProjects}`;
            };
            return part5 + part6;
          }).join("");
          part4 = `${insideInsideProjects}`;
          console.log(part4);
        };
        return part3 + part4;
      }).join("");
      part2 = `${insideProjects}`;
    };
    return part1 + part2;
  }).join("");
  //Temp B
    // let projectNamesParents = allBigParents.map((parentProject) => {
    //   return `<option style="background-color:${colorsList[parentProject.pColor].colorBG}; color:${colorsList[parentProject.pColor].colorTX};" value="${parentProject.id}"${todo.pParentId && todo.pParentId == parentProject.id ? ` selected` : ``}>${parentProject.pName}</option>`;
    // }).join("");
  //Temp A
    // let projectNamesParents = allBigParents.map((parentProject) => {
      // let part1 = `<option style="background-color:${colorsList[parentProject.pColor].colorBG}; color:${colorsList[parentProject.pColor].colorTX};" value="${parentProject.id}" ${todo.pParentId && todo.pParentId == parentProject.id ? `selected` : ``}>${parentProject.pName}</option>`;
      // let part2 = ``;
      // let allInsideProjects = allProjects.filter(td => td.pParentId == parentProject.id);
      // if(allInsideProjects.length > 0){
      //   let insideProjects = allInsideProjects.map((insideProject) => {
      //     let part3 = `<option style="background-color:${colorsList[insideProject.pColor].colorBG}; color:${colorsList[insideProject.pColor].colorTX};" value="${insideProject.id}" ${todo.pParentId && todo.pParentId == insideProject.id ? `selected` : ``}>${insideProject.pName}</option>`;
      //     let part4 = ``;
      //     let allInsideInsideProjects = allInsideProjects.filter(td => td.pParentId == insideProject.id);
      //     if(allInsideInsideProjects.length > 0){
      //       let insideInsideProjects = allInsideInsideProjects.map((insideInsideProject) => {
      //         let part5 = `<option style="background-color:${colorsList[insideInsideProject.pColor].colorBG}; color:${colorsList[insideInsideProject.pColor].colorTX};" value="${insideInsideProject.id}" ${todo.pParentId && todo.pParentId == insideInsideProject.id ? `selected` : ``}>${insideInsideProject.pName}</option>`;
      //         let part6 = ``;
      //         let allInsideInsideInsideProjects = allInsideInsideProjects.filter(td => td.pParentId == insideInsideProject.id);
      //         if(allInsideInsideInsideProjects.length > 0){
      //           let insideInsideInsideProjects = allInsideInsideInsideProjects.map((insideInsideInsideProject) => {
      //             return `<option style="background-color:${colorsList[insideInsideInsideProject.pColor].colorBG}; color:${colorsList[insideInsideInsideProject.pColor].colorTX};" value="${insideInsideInsideProject.id}" ${todo.pParentId && todo.pParentId == insideInsideInsideProject.id ? `selected` : ``}>${insideInsideInsideProject.pName}</option>`;
      //           }).join("");
      //           part6 = `<optgroup label="under ${insideInsideProject.pName}">${insideInsideInsideProjects}</optgroup>`;
      //         };
      //         return part5 + part6;
      //         // return `<option style="background-color:${colorsList[insideInsideProject.pColor].colorBG}; color:${colorsList[insideInsideProject.pColor].colorTX};" value="${insideInsideProject.id}" ${todo.pParentId && todo.pParentId == insideInsideProject.id ? `selected` : ``}>${insideInsideProject.pName}</option>`;
      //       }).join("");
      //       part4 = `<optgroup label="under ${insideProject.pName}">${insideInsideProjects}</optgroup>`;
      //     };
      //     return part3 + part4;
      //   }).join("");
      //   part2 = `<optgroup label="under ${parentProject.pName}">${insideProjects}</optgroup>`;
      // };
      // return part1 + part2;
    // }).join("");
    // let projectNames = allProjects.map((project) => {
    //   return `<option style="background-color:${colorsList[project.pColor].colorBG}; color:${colorsList[project.pColor].colorTX};" value="${project.id}" ${todo.pParentId && todo.pParentId == project.id ? `selected` : ``}>${project.pName}</option>`;
    // }).join("");
    projectNamesChoice = `<select id="myProjectNames">
    <option value="null">Choose one</option>
    ${projectNamesParents}
  </select>`;
  } else{
    projectNamesChoice = `<h6 style="margin: 0;">pssst... First, you've got to create a project!</h6>`;
  };  

  let projectTaskInfoAll = [];
  let projectTaskInfoNum = 0;
  if(todo.pParentId){ //then it's in project (could be anything)
    let pParentId = todo.pParentId;
    while (pParentId !== "null") {
      let parentTodo = listTasks[listTasks.findIndex(td => td.id == pParentId)];
      let topTI = `<div id="${parentTodo.id}" onclick="toTIdeTPSaM(this)" class="projectTaskInfo" style="outline-color: ${colorsList[parentTodo.pColor].colorBG5}; border-color:${colorsList[parentTodo.pColor].colorBG};bottom:${(projectTaskInfoNum * 24) - 8}px;z-index:${999 - projectTaskInfoNum};"><div class="projectTaskInfolabel" style="background-color:${colorsList[parentTodo.pColor].colorBG}; color:${colorsList[parentTodo.pColor].colorTX};">${parentTodo.pName}</div></div>`;
      projectTaskInfoAll.push(topTI);
      pParentId = parentTodo.pParentId;
      projectTaskInfoNum++;
    };
  };
  if(projectTaskInfoAll.length > 0){
    projectTaskInfoAll = projectTaskInfoAll.join("");
  };


  let miniList;
  if(todo.miniList && todo.miniList.length > 0){
    miniList = todo.miniList.map((mini, idx) => {
      return `<li class="allMiniLi miniLi${mini.type == "title" ? ` miniTitle` : ``}${todo.miniHide && mini.checked ? ` displayNone` : ``}">
        <input id="miniCheck${idx}" type="checkbox" class="listCheckInput" ${mini.checked ? `checked` : ``} onclick="checkTest()" />
        <label class="listCheckLabel" for="miniCheck${idx}" ${mini.color ? `style="color:${mySettings.myBaseColors[mini.color].colorBG};"` : ``}>
          <i class="typcn typcn-media-stop-outline miniUnChecked"></i>
          <i class="typcn typcn-input-checked miniChecked"></i>
        </label>
        <input type="text" class="listNameInput" style="color:${mini.color ? mySettings.myBaseColors[mini.color].colorBG : `var(--tx-color)`};" value="${mini.name}" />
        <input id="miniOpt${idx}" type="checkbox" class="miniOptInput" />
        <div class="miniOptDiv">
          <i onclick="switchMiniType(this)" class="typcn typcn-arrow-repeat"></i>
          <i onclick="switchMiniColor(this)" class="fa-solid fa-palette" style="color:${mini.color ? mySettings.myBaseColors[mini.color].colorBG : `var(--tx-color)`};"></i>
          <i onclick="trashMini(this)" class="typcn typcn-trash"></i>
          <i onclick="moveMiniDown(this)" class="typcn typcn-arrow-down-outline"></i>
          <i onclick="moveMiniUp(this)" class="typcn typcn-arrow-up-outline"></i>
        </div>
        <label for="miniOpt${idx}" class="miniOptLabel">
          <i class="fa-solid fa-ellipsis-vertical" style="width:23px;"></i>
        </label>
      </li>`;
    }).join("");
  } else{
    miniList = `<h6 id="miniListEmpty" style="margin:0;">There's nothing here, yet...</h6>`;
  };

  console.log(projectTaskInfoNum);
  let taskAllInfo = `<div id="projectSection" style="height:${projectTaskInfoNum * 24}px;top:${positionA + 8}px;">${projectTaskInfoAll}</div>
  <div id="taskInfo" class="taskInfo taskInfoClass${todo.pOffspringId ? ` taskInfoProject` : ``}" style="top:${positionA + 8 + (projectTaskInfoNum * 24)}px;${todo.pOffspringId ? `outline-color: ${colorsList[todo.pColor].colorBG5}; border-color:${colorsList[todo.pColor].colorBG};` : todo.pParentId ? `border-width: 3.5px; border-color:${colorsList[listTasks[listTasks.findIndex(td => td.id == todo.pParentId)].pColor].colorBG};` : ``}">
    <div class="taskInfoWrapper">
      <div class="topSection topSectionFull">
        <div class="topSection topSectionPart">
          <button id="doneIt" class="iconOnlyBtn cornerItLabel">
            <i class="typcn typcn-media-stop-outline"></i>
          </button>
          <input id="quickyIt" type="checkbox" class="cossin cornerItInput" ${todo.quicky ? `checked` : ``} />
          <label for="quickyIt" class="cornerItLabel">
            <i class="fa-regular fa-clock cornerItUnChecked"></i>
            <i class="fa-solid fa-clock cornerItChecked"></i>
          </label>
          <input id="convoIt" type="checkbox" class="cossin cornerItInput" ${todo.convo ? `checked` : ``} />
          <label for="convoIt" class="cornerItLabel">
            <i class="fa-regular fa-comments cornerItUnChecked" style="font-size: 20px;"></i>
            <i class="fa-solid fa-comments cornerItChecked" style="font-size: 20px;"></i>
          </label>
        </div>
        <div class="topSection topSectionPart">
          <input id="trashIt" type="checkbox" class="cossin cornerItInput" />
          <label for="trashIt" class="cornerItLabel${(todo.newShit || todo.recycled) ? ` hidden` : ``}">
            <i class="fa-regular fa-trash-can cornerItUnChecked"></i>
            <i class="fa-solid fa-trash-can cornerItChecked"></i>
          </label>
          <input id="copyIt" type="checkbox" class="cossin cornerItInput" />
          <label for="copyIt" class="cornerItLabel">
            <i class="fa-regular fa-copy cornerItUnChecked"></i>
            <i class="fa-solid fa-copy cornerItChecked"></i>
          </label>
          ${todo.recurry || todo.line == "recurringDay" ? `
          <div class="cornerItLabel" >
            <span class="typcn typcn-arrow-repeat"></span>
          </div>` : todo.recycled ? `<div class="cornerItLabel" >
            <span class="fa-solid fa-recycle" style="line-height: 2.1em; font-size: 1.1em;"></span>
          </div>` : `<input id="storeIt" type="checkbox" class="cossin cornerItInput" ${todo.stock ? `checked` : ``} />
          <label for="storeIt" class="cornerItLabel">
            <span class="typcn typcn-pin-outline cornerItUnChecked"></span>
            <span class="typcn typcn-pin cornerItChecked"></span>
          </label>`}
        </div>
      </div>
    <div id="convoSection">
      <div class="convoStatusDiv">
        <input type="radio" name="convoStatusRadios" id="convoStatus1" value="cS1" ${todo.convoStatus == "cS1" ? `checked` : ``} />
        <label for="convoStatus1">
          <span class="outerRing" style="border-color: rgb(59, 152, 105);"></span>
          <span class="innerCircle" style="background-color: rgb(59, 152, 105);"></span>
          <span class="statusTitle">Tell, Ask, Relance...</span>
        </label>
        <input type="radio" name="convoStatusRadios" id="convoStatus2" value="cS2" ${todo.convoStatus == "cS2" ? `checked` : ``} />
        <label for="convoStatus2">
          <span class="outerRing" style="border-color: goldenrod;"></span>
          <span class="innerCircle" style="background-color: goldenrod;"></span>
          <span class="statusTitle">Wait to hear from...</span>
        </label>
        <input type="radio" name="convoStatusRadios" id="convoStatus3" value="cS3" ${todo.convoStatus == "cS3" ? `checked` : ``} />
        <label for="convoStatus3">
          <span class="outerRing" style="border-color: crimson;"></span>
          <span class="innerCircle" style="background-color: crimson;"></span>
          <span class="statusTitle">Let's reply to...</span>
        </label>
        <input type="radio" name="convoStatusRadios" id="convoStatus4" value="cS4" ${todo.convoStatus == "cS4" ? `checked` : ``} />
        <label for="convoStatus4">
          <span class="outerRing" style="border-color: darkslategray;"></span>
          <span class="innerCircle" style="background-color: darkslategray;"></span>
          <span class="statusTitle">We're done with...</span>
        </label>
      </div>
      <div id="convoContactDiv">
        <label>Contact: </label>
        <input type="text" id="contactSearchInput" value="${todo.convo ? contactList[contactList.findIndex(ct => ct.id == todo.convoContactId)].nickname : ``}" />
        <div id="contactSearchList"></div>
      </div>
    </div>
    <div class="taskInfoInput relDiv${calendarStock ? ` calendarStockVersion` : ``}">
      <div class="projectOngletDiv">${getProjectOnglets(todo)}</div>
      <span id="iconIt" class="IconI ${todo.icon}"></span>
      <div id="labelIt" class="labelOnglet labelTaskOnglet" style="left:-10px; top:2px; background-color:${todo.LColor ? colorsList[todo.LColor].colorBG : "initial"}; color:${todo.LColor ? colorsList[todo.LColor].colorTX : "inherit"};">${todo.LName ? todo.LName : "Label"}</div>
      <div class="underLining" id="taskTitle-underLining"></div>
      <input type="text" id="taskTitle" style="color:${todo.term == "showThing" ? mySettings.myBaseColors[0].colorBG : mySettings.myBaseColors[todo.color].colorBG};" value="${todo.task ? todo.task : ""}">
      <span id="colorIt" class="typcn typcn-tag tagSpan ${todo.term == "showThing" ? `hidden` : ``}" style="color:${mySettings.myBaseColors[todo.color].colorBG};"></span>
      ${calendarStock ? `<button class="addBtns" onclick="getStorage()"><span class="typcn typcn-shopping-bag"></span></button>` : ``}
    </div>
    <div id="trashedArea">
      <input id="tellWhyInput" type="checkbox" class="cossin taskToggleInput" />
      <div>
        <label for="tellWhyInput" class="taskToggleLabel taskInfoSectionLabel" style="margin-top: 10px;">
          <h5 class="topList">Tell me why...<span class="tellYou" id="tellYouWhy">${todo.info ? `(because)` : ``}</span></h5>
          <span class="typcn typcn-chevron-right-outline taskToggleChevron"></span>
        </label>
        <div class="taskToggleList relDiv" style="margin-bottom: 25px;">
          <textarea id="taskDetails" class="taskInfoInput taskDetails">${todo.info ? todo.info : ""}</textarea>
          <input id="switchTextareaSize" type="checkbox" class="switchDisplayInput cossin" />
          <label for="switchTextareaSize" style="float: right; margin-right: 15px; margin-top: -5px;">
            <i class="typcn typcn-plus switchDisplayUnChecked"></i>
            <i class="typcn typcn-minus switchDisplayChecked"></i>
          </label>
        </div>
      </div>

      <input id="tellHowInput" type="checkbox" class="cossin taskToggleInput" ${todo.pOffspringId ? `checked` : ``} />
      <div id="tellHowDiv" ${todo.pOffspringId ? `` : `class="displayNone"`}>
        <label for="tellHowInput" class="taskToggleLabel taskInfoSectionLabel" style="margin-top: 10px;">
          <h5 class="topList">Tell me how...<span class="tellYou" id="tellYouHow">${todo.pOffspringId && todo.pOffspringId.length > 0 ? `(step by step, oh baby)` : `(Where do I begin???)`}</span></h5>
          <span class="typcn typcn-chevron-right-outline taskToggleChevron"></span>
        </label>
        <div class="taskToggleList relDiv" style="margin-bottom: 25px;">
          <ul id="projectUl">
            ${todo.pOffspringId && todo.pOffspringId.length <= 0 ? `There's no one here...` : ``}
          </ul>
          <button id="addOffspringBtn" class="addBtns"><span class="typcn typcn-plus"></span></button>
          <button class="addBtns" onclick="getStorage()"><span class="typcn typcn-shopping-bag"></span></button>
        </div>
      </div>

      <input id="tellMoreInput" type="checkbox" class="cossin taskToggleInput" />
      <div>
        <label for="tellMoreInput" class="taskToggleLabel taskInfoSectionLabel" style="margin-top: 10px;">
          <h5 class="topList">Tell me more...<span class="tellYou" id="tellYouMore">${todo.miniList ? `(...)` : ``}</span></h5>
          <span class="typcn typcn-chevron-right-outline taskToggleChevron"></span>
        </label>
        <div id="miniListDiv" class="taskToggleList taskInfoInput">
          <ul>
            ${miniList}
            <li class="allMiniLi" id="addMiniListLi" style="margin: 15px 0 20px;}">
              <input id="hideMiniInput" type="checkbox" class="cossin" ${todo.miniHide ? `checked ` : ``}/>
              <label for="hideMiniInput" style="margin-right: 5px;">
                <span class="typcn typcn-eye-outline" style="font-size:1.7em"></span>
              </label>
              <form id="addMiniForm">
                <input type="text" id="addMiniListInput" class="listNameInput" style="border: 0.5px solid var(--tx-color); border-radius: 5px; padding: 0 7px;" placeholder="one more" />
                <button type="submit" class="iconOnlyBtn" id="addMiniListBtn" style="margin-left: 5px;"><span class="typcn typcn-plus"></span></button>
              </form>
            </li>
          </ul>
        </div>
      </div>
      
      <input id="tellWhatInput" type="checkbox" class="cossin taskToggleInput" />
      <div>
        <label for="tellWhatInput" class="taskToggleLabel taskInfoSectionLabel" style="margin-top: 20px;">
          <h5 class="topList">Tell me what...<span class="tellYou">(<span id="tellYouTermProject">${todo.pOffspringId ? `Project & ` : ``}</span><span id="tellYouTerm">${t(todo.term)}</span><span id="tellYouShowType">${todo.term == "showThing" ? ` - ${todo.showType ? todo.showType : mySettings.myShowTypes[0].name}` : ``}</span><span id="tellYouUrge">${todo.urge ? ` - Priority: ${todo.urgeNum}` : ``}</span>)</span></h5>
          <span class="typcn typcn-chevron-right-outline taskToggleChevron"></span>
        </label>
        <div class="taskToggleList taskInfoInput relDiv">
          <h5 class="taskInfoSubTitle" style="margin:10px 0 0 0;">Project</h5>
          <input class="myRadio" type="checkbox" name="projectOptions" id="partProjectInput" value="pOffspring" ${todo.pParentId && todo.pParentId !== "null" ? `checked` : ``} />
          <label for="partProjectInput" class="termLabel"><span class="myRadio myRadioBox"></span><span>It's part of something bigger</span><br />
          <span class="smallText otherSmallText">than itself</span></label>
          <div class="partProjectDiv">
            <h5 style="margin: 5px 0 0 0;">What project is it a part of?</h5>
            <div class="inDaySection" style="width: fit-content; margin-bottom: 10px; padding: 10px;">
              ${projectNamesChoice}
            </div>
          </div>
          <input class="myRadio" type="checkbox" name="projectOptions" id="wholeProjectInput" value="pParent" ${todo.pOffspringId ? `checked` : ``} />
          <label for="wholeProjectInput" class="termLabel"><span class="myRadio myRadioBox"></span><span>It's a whole big thing</span><br />
          <span class="smallText otherSmallText">with lots of little things in it</span></label>
          <div class="wholeProjectDiv">
            <h5 style="margin: 5px 0 0 0;">${todo.pOffspringId ? `Wanna change the label?` : `Let's give it a label`}</h5>
            <div class="inDaySection" style="width: fit-content; margin-bottom: 10px; padding: 10px;">
              <p>Choose a color: ${projectColorsChoice}</p>
              <p>Choose a nickname:</p>
              <input id="projectNickInput" type="text" value="${todo.pName ? todo.pName : ""}"/>
            </div>
          </div>

          <h5 class="taskInfoSubTitle" style="margin: 0;">Reminder</h5>
          <input class="myRadio" type="radio" name="termOptions" id="reminder" value="reminder" ${todo.term == "reminder" ? `checked` : ``} />
          <label for="reminder" class="termLabel"><span class="myRadio"></span><span style="font-size:14px;">It's such a special day...</span></label>
          
          <h5 class="taskInfoSubTitle" style="margin:10px 0 0 0;">Habit</h5>
          <input class="myRadio" type="radio" name="termOptions" id="sameHabit" value="sameHabit" ${todo.term == "sameHabit" ? `checked` : ``} />
          <label for="sameHabit" class="termLabel"><span class="myRadio"></span><span style="opacity:.6;font-size:14px;">It's always the same thing...</span></label>

          <h5 class="taskInfoSubTitle" style="margin:10px 0 0 0;">Event</h5>
          <input class="myRadio" type="radio" name="termOptions" id="showThing" value="showThing" ${todo.term == "showThing" ? `checked` : ``} />
          <label for="showThing" class="termLabel"><span class="myRadio"></span><span style="border-radius: 10px; border: 0.5px solid var(--tx-color); padding: 0 7px;">It's a whole show!</span></label>
          <div class="showDiv">
            <h5 class="taskInfoInput" style="margin-left: 0;">What kinda show is that?</h5>
            <div class="inDaySection">
              <div id="myShowDiv">
              ${myShows}
              </div>
              <div id="addShowTypeDiv">
                <input type="radio" name="showCreation" id="addShowType" class="cossin">
                <input type="radio" name="showCreation" id="saveShowType" class="cossin">
                <label for="addShowType" class="showTypeAdding"><i class="typcn typcn-plus"></i></label>
                <div class="showTypeCreation">
                  <div class="showTypeCreationInside">
                    <input id="showTypeCreationInput" type="text" placeholder="new type of show" />
                    <i id="showTypeChoiceIcon" class="typcn typcn-media-record"></i>
                  </div>
                  <label for="saveShowType" style="display: inline-block;"><i id="showTypeCreationConfirm" class="typcn typcn-tick" style="font-size: 2em;line-height: .5em;"></i></label>
                </div>
              </div> 
            </div>
          </div>
          
          <h5 class="taskInfoSubTitle" style="margin:10px 0 0 0;">Task</h5>
        
          <input class="myRadio" type="radio" name="termOptions" id="topPriority" value="topPriority" ${todo.term == "topPriority" ? `checked` : ``} />
          <label for="topPriority" class="termLabel"><span class="myRadio"></span><span style="color:red;">That's our top priority!</span></label>
          <div class="urgeDiv">
            <h5 style="margin: 5px 0 0 0;">How urgent is it?</h5>
            <div class="inDaySection" style="width: fit-content; margin-bottom: 10px;">
              <p><label for="urgeInput" style="display:inline-block;"><span style="color:red;">Pri</span><span style="color:#ff8400;">ori</span><span style="color:#ffd000;">ty:</span>  </label><input id="urgeInput" type="number" value="${todo.term == "topPriority" && todo.urge ? todo.urgeNum : "0"}" /></p>
            </div>
          </div>

          <input class="myRadio" type="radio" name="termOptions" id="nextActions" value="nextActions" ${todo.term == "nextActions" ? `checked` : ``} />
          <label for="nextActions" class="termLabel"><span class="myRadio"></span><span style="color:green;">That's the next easy action I've gotta do.</span></label>

          <input class="myRadio" type="radio" name="termOptions" id="currentProject" value="currentProject" ${todo.term == "currentProject" ? `checked` : ``} />
          <label for="currentProject" class="termLabel"><span class="myRadio"></span><span style="color:#600061 ;">It's what I'm trying to get done nowadays</span></label>

          <input class="myRadio" type="radio" name="termOptions" id="nextThing" value="nextThing" ${todo.term == "nextThing" ? `checked` : ``} />
          <label for="nextThing" class="termLabel"><span class="myRadio"></span><span style="color:darkgreen;">It's what I'm gonna do next</span></label>

          <input class="myRadio" type="radio" name="termOptions" id="longTerm" value="longTerm" ${todo.term == "longTerm" ? `checked` : ``} />
          <label for="longTerm" class="termLabel"><span class="myRadio"></span><span style="color:midnightblue;">It's a whenever kinda long term shit</span></label>

          <input class="myRadio" type="radio" name="termOptions" id="oneTime" value="oneTime" ${todo.term == "oneTime" ? `checked` : ``} />
          <label for="oneTime" class="termLabel"><span class="myRadio"></span><span style="color:midnightblue;">It's a whenever kinda one time thing</span></label>
          
          <input class="myRadio" type="radio" name="termOptions" id="alwaysHere" value="alwaysHere" ${todo.term == "alwaysHere" ? `checked` : ``} />
          <label for="alwaysHere" class="termLabel"><span class="myRadio"></span><span style="color:goldenrod;">Forever, forever ever?!</span></label>
          
          <input class="myRadio" type="radio" name="termOptions" id="waitForIt" value="waitForIt" ${todo.term == "waitForIt" ? `checked` : ``} />
          <label for="waitForIt" class="termLabel"><span class="myRadio"></span><span style="color:rgb(100, 122, 122);">It's what I've been waiting for</span></label>

          <input class="myRadio" type="radio" name="termOptions" id="thinkBoutIt" value="thinkBoutIt" ${todo.term == "thinkBoutIt" ? `checked` : ``} />
          <label for="thinkBoutIt" class="termLabel"><span class="myRadio"></span><span style="color:rgb(100, 122, 122);">It's what I need to think about</span></label>
          
          <input class="myRadio" type="radio" name="termOptions" id="crazyShit" value="crazyShit" ${todo.term == "crazyShit" ? `checked` : ``} />
          <label for="crazyShit" class="termLabel"><span class="myRadio"></span><span style="color:rgb(239, 125, 144);">It's just a <em>maybe-one-day-probably-never</em> kinda crazy idea</span></label>

          <input class="myRadio" type="radio" name="termOptions" id="nevermind" value="nevermind" ${todo.term == "nevermind" ? `checked` : ``} />
          <label for="nevermind" class="termLabel"><span class="myRadio"></span><span style="opacity: .4;">Let's just forget about that one...</span></label>
        </div>
      </div>
      <input id="tellWhereInput" type="checkbox" class="cossin taskToggleInput" />
      <div>
        <label for="tellWhereInput" class="taskToggleLabel taskInfoSectionLabel" style="margin-top: 20px;">
          <h5 class="topList">Tell me where...<span class="tellYou" id="tellYouWhere">${todo.where == "home" || !todo.where ? "(home)" : "(somewhere)"}</span></h5>
          <span class="typcn typcn-chevron-right-outline taskToggleChevron"></span>
        </label>
        <div class="taskToggleList taskInfoInput relDiv">
          <div class="inDaySection taskInfoInput" style="width: -webkit-fill-available; max-width: 280px;">
            <input id="whereHomeInput" type="checkbox" class="tuttoGiornoInput cossin" ${(!todo.where || (todo.where && todo.where == "home")) ? `checked` : ``} />
            <div class="calendarInsideMargin tuttoGiornoDiv" style="justify-content: flex-start;">
              <label for="whereHomeInput" class="slideZone">
                <div class="slider">
                  <span class="si">Sì</span>
                  <span class="no">No</span>
                </div>
              </label>
              <p id="hshText" style="margin: 0 0 0 10px;">Home Sweet Home</p>
            </div>
            <div class="noneTuttoGiornoDiv calendarInsideMargin">
              <label for="whereInput" style="display: block;">Destination:</label>
              <textarea id="whereInput" style="width: 100%; margin-bottom: 10px;">${todo.where && todo.where !== "home" && todo.where !== "not home" ? todo.where : ``}</textarea>
              <p style="text-align:right; margin:0;"><button onclick="copyText()"><i class="fa-regular fa-clipboard"></i></button></p>
            </div>
          </div>
        </div>
      </div>
      <input id="tellWhenInput" type="checkbox" class="cossin taskToggleInput" />
      <div>
        <label for="tellWhenInput" class="taskToggleLabel taskInfoSectionLabel" style="margin-top: 20px;">
          <h5 class="topList">Tell me when...<span class="tellYou">(<span id="tellYouWhen">${t(todo.line)}</span><span id="tellYouDay">${todo.startDate ? ` ${todo.startDate}` : ``}</span>)</span></h5>
          <span class="typcn typcn-chevron-right-outline taskToggleChevron"></span>
        </label>
        <div class="taskToggleList relDiv">
          <div id="calendarHome"></div>
        </div>
      </div>
    </div>
    <button id="taskInfoBtn">Save</button>
    <button class="ScreenBtn2" id="taskCancelBtn">Cancel</button>
  </div>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", taskAllInfo);

  let calendarHome = document.querySelector("#calendarHome");
  creatingCalendar(todo, calendarHome, "inHome");
  let calendarDiv = document.querySelector("#calendarDiv");
  calendarDiv.querySelectorAll('input[name="whatDay"]').forEach(radio => {
    radio.addEventListener("click", () => {
      document.querySelector("#tellYouWhen").innerText = t(radio.value);
      if(radio.value == "todoDay"){
        document.querySelector("#tellYouDay").innerText = ` ${document.querySelector("#oneDayStartDateInput").value}`;
      } else{
        document.querySelector("#tellYouDay").innerText = ``;
      };
    });
  });
  calendarDiv.querySelector("#oneDayStartDateInput").addEventListener("change", (e) => {
    document.querySelector("#tellYouDay").innerText = ` ${e.target.value}`;
  });
  
  //let taskInfo = document.querySelector("#taskInfo"); //instead of finding it by id, which won't work when we have a second one. We could create an array of all the .taskInfo and select the last one, since they keep being added at the end! 
  //Although, then we can't just put z-index = 1000 to all taskInfo... right? nope, because then all the newClickScreen will be at 999...
  //BTW on va probablement pouvoir enlever tout les clickscreen et moving (en tous cas, ceux associés à taskInfo)
  /* let allTaskInfo = document.querySelectorAll(".taskInfo");
  let topDiv;
  if(allTaskInfo.length > 1){
    topDiv = window.getComputedStyle(allTaskInfo[allTaskInfo.length - 2]).getPropertyValue("top");
  };// peut-être vérifier si le parentElement de chaque taskInfo est bel et bien le même div...
  let taskInfo = allTaskInfo[allTaskInfo.length - 1];
  taskInfo.style.zIndex = 1000 + (10 * (allTaskInfo.length - 1));
  taskInfo.style.top = topDiv + 50 + "px"; */
  let taskInfo = document.querySelector("#taskInfo");


  let doneIt = document.querySelector("#doneIt");
  let doneIcon = doneIt.querySelector("i");
  let quickyIt = document.querySelector("#quickyIt");
  let copyIt = document.querySelector("#copyIt");
  let trashIt = document.querySelector("#trashIt");
  let storeIt = document.querySelector("#storeIt");
  let taskTitle = document.querySelector("#taskTitle");
  getUnderLiningWidth(taskTitle);
  let miniListDiv = document.querySelector("#miniListDiv");
  let taskDetails = document.querySelector("#taskDetails");
  let switchTextareaSize = document.querySelector("#switchTextareaSize");
  let urgeInput = document.querySelector("#urgeInput");
  let whereCheck = document.querySelector("#whereHomeInput");
  //let SupClickScreen = document.querySelector("#SupClickScreen");
  let colorIt = document.querySelector("#colorIt");
  //let colorPalet = document.querySelector("#colorPalet");
  let contactSearchInput = document.querySelector("#contactSearchInput");
  let iconIt = document.querySelector("#iconIt");
  //let iconsPalet = document.querySelector("#iconsPalet");
  let taskInfoBtn = document.querySelector("#taskInfoBtn");
  let taskCancelBtn = document.querySelector("#taskCancelBtn");
  let busyInput = document.querySelector("#busyInput");

  
  newClickScreenCreation(taskInfo);
  // let zIndexDiv = window.getComputedStyle(taskInfo).getPropertyValue("z-index");
  // console.log(zIndexDiv);
  // let newClickScreen = `<div id="newClickScreen" class="newClickScreen" style="z-index:${zIndexDiv - 1};"></div>`;
  // document.body.insertAdjacentHTML("beforeend", newClickScreen);
  // newClickScreen = document.querySelector("#newClickScreen");
  // newClickScreen.addEventListener("click", cancelTaskInfo);

  taskCancelBtn.addEventListener("click", () => {
    newClickScreenRemoval(taskInfo);
    window.scrollTo(0, positionA);
  });

  // *** CONVO
  let thisStatus = "";
  let thisNickname = "";
  let thisContactIndex;
  document.querySelectorAll('input[name="convoStatusRadios"]').forEach(radio => {
    radio.addEventListener("click", () => {
      console.log(radio.value);
      thisStatus = t(radio.value);
      thisConvo();
      //taskTitle.value = t(radio.value);
    });
  });
  contactSearchInput.addEventListener("input", () => {
    let tip = contactSearchInput.value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    let result = contactList.filter(contact => (contact.nickname.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').startsWith(tip) || contact.prenom.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').startsWith(tip)) || contact.nom.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').startsWith(tip));
    console.log(result);
    document.querySelector("#contactSearchList").innerHTML = result.map((ct) => {
      return `<button id="${ct.id}" class="nickChoice" onclick="thisContact(this)">${ct.nickname}</button>`;
    }).join("") + `<button class="nickChoice" style="background-color: lightgrey;"  onclick="addNewContact()">add new contact</button>`;
  });
  
  function thisConvo(){
    taskTitle.value = thisStatus + " " + thisNickname;
  };

  function thisContact(div){
    thisContactIndex = contactList.findIndex(contact => contact.id == div.id);
    thisNickname = contactList[thisContactIndex].nickname;
    document.querySelector("#contactSearchList").innerHTML = "";
    contactSearchInput.value = thisNickname;
    thisConvo();
  };
  window.thisContact = thisContact;

  function addNewContact(){
    let start = contactSearchInput.value;
    //create a form to add new contact with "start" already in the nickname input
  };
  window.addNewContact = addNewContact;

  // *** LABEL
  let labelIt = document.querySelector("#labelIt");
  newLabelReset();
  newlabelName = todo.label ? todo.LName : "";
  newlabelColor = todo.label ? todo.LColor : "";
  let options = {
    where: taskInfo,
    labelDiv: labelIt,
    // screen: SupClickScreen,
    myLabels: mySettings.myLabels && mySettings.myLabels.length > 0 ? true : false
  };
  
  labelIt.addEventListener("click", () => {
    console.log("options");
    creatingLabelPanel(todo, options);
  });

  // *** PROJECT
  if(todo.pOffspringId && todo.pOffspringId.length > 0){
    projectSwitch = true;
    todo.pOffspringId.forEach(offspringId => {
      let offspring = listTasks[listTasks.findIndex(to => to.id == offspringId)];
      todoCreation(offspring);
    });
    projectSwitch = false;
  };

  document.querySelector("#addOffspringBtn").addEventListener("click", (e) => { // de ProjectSection à New
    saveTaskInfo(e);
    // document.querySelector("#projectSection").remove();
    // document.querySelector("#taskInfo").remove();
    // document.querySelectorAll(".newClickScreen").forEach(ncs => {
    //   ncs.remove();
    // });
    // parent.classList.remove("selectedTask");
    // parent = ``;
    let newTodo = {
      newShit: true,
      id: crypto.randomUUID(),
      color: "0",
      icon: "fa-solid fa-ban noIcon",
      term: "oneTime",
      line: "noDay",
      pParentId: todo.id,
      pPosition: "in"
    };
    if(todo.label){
      newTodo.label = true;
      newTodo.LName = todo.LName;
      newTodo.LColor = todo.LColor;
    };
    taskAddAllInfo(newTodo);
  });

  // *** OTHERS
  let newState = checkSwitch[0];
  doneIt.addEventListener("click", () => {
    let nowState = doneIcon.className;
    let nowStateIndex = checkSwitch.findIndex(state => state == nowState);
    newState = nowStateIndex == checkSwitch.length - 1 ? checkSwitch[0] : todo.term == "alwaysHere" ? checkSwitch[checkSwitch.length - 1] : checkSwitch[nowStateIndex + 1];
    doneIcon.className = newState;
    if(newState == checkSwitch[0]){
      taskInfoBtn.innerText = "Save";
    } else if(newState == checkSwitch[1]){
      taskInfoBtn.innerHTML = `Save & declare it...<br/>partially done!` ;
      trashIt.checked = false;
      copyIt.checked = false;      
    } else if(newState == checkSwitch[2]){
      trashIt.checked = false;
      copyIt.checked = false;
      taskInfoBtn.innerHTML = todo.term == "alwaysHere" ? `Save & declare it done!<br/>(for today)` : "Save & declare it done!";
    };
  });

  document.querySelector("#convoIt").addEventListener("click", () => {
    document.querySelector("#convoSection").classList.toggle("showing");
    // if(convoIt.checked){
    //   document.querySelector("#convoSection").classList.add("showing");
    // } else{
    //   document.querySelector("#convoSection").classList.remove("showing");
    // };
  });

  trashIt.addEventListener("click", () => {
    if(trashIt.checked){
      document.querySelector("#trashedArea").classList.add("displayNone");
      taskInfoBtn.innerText = "Trash it!";
      copyIt.checked = false;
      doneIcon.className = checkSwitch[0];
    } else{
      taskInfoBtn.innerText = "Save";
      document.querySelector("#trashedArea").classList.remove("displayNone");
    };
  });
  copyIt.addEventListener("click", () => {
    if(copyIt.checked){
      taskInfoBtn.innerText = "Save & Copy";
      trashIt.checked = false;
      doneIcon.className = checkSwitch[0];
    } else{
      taskInfoBtn.innerText = "Save";
    };
  });
  switchTextareaSize.addEventListener("click", () => {
    taskDetails.classList.toggle("taskDetailsFullHeight");
  })
  taskDetails.addEventListener("change", () => {
    document.querySelector("#tellYouWhy").innerText = taskDetails.value == "" ? "" : "(because)";
  });
  whereCheck.addEventListener("click", () => {
    document.querySelector("#tellYouWhere").innerText = whereCheck.checked ? "(home)" : "(somewhere)";
  });
  urgeInput.addEventListener("change", () => {
    document.querySelector("#tellYouUrge").innerText = urgeInput.value > 0 ? ` - Priority: ${urgeInput.value}` : ``;
  });

  // *** LIST
  //more with SHOW 
  let hideMiniInput = miniListDiv.querySelector("#hideMiniInput");
  checkTest();
  hideMiniInput.addEventListener("click", () => {
    if(hideMiniInput.checked){
      miniListDiv.querySelectorAll(".miniLi > .listCheckInput:checked").forEach(check => {
        check.parentElement.classList.add("displayNone");
      });
    } else{
      miniListDiv.querySelectorAll(".miniLi > .listCheckInput:checked").forEach(check => {
        check.parentElement.classList.remove("displayNone");
      });
    };
  });

  let idxMini = todo.miniList ? todo.miniList.length : 0;
  let addMiniForm = miniListDiv.querySelector("#addMiniForm");
  addMiniForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let newMini = miniListDiv.querySelector("#addMiniListInput").value;
    if(newMini){
      if(miniListDiv.querySelector("#miniListEmpty")){
        miniListDiv.querySelector("#miniListEmpty").remove();
        document.querySelector("#tellYouMore").innerText = "(...)";
      };
      miniListDiv.querySelector("#addMiniListLi").insertAdjacentHTML("beforebegin", `<li class="allMiniLi miniLi">
        <input id="miniCheck${idxMini}" type="checkbox" class="listCheckInput" onclick="checkTest()" />
        <label class="listCheckLabel" for="miniCheck${idxMini}">
          <i class="typcn typcn-media-stop-outline miniUnChecked"></i>
          <i class="typcn typcn-input-checked miniChecked"></i>
        </label>
        <input type="text" class="listNameInput" style="color:var(--tx-color);" value="${newMini}" />
        <input id="miniOpt${idxMini}" type="checkbox" class="miniOptInput" />
        <div class="miniOptDiv">
          <i onclick="switchMiniType(this)" class="typcn typcn-arrow-repeat"></i>
          <i onclick="switchMiniColor(this)" class="fa-solid fa-palette" style="color:var(--tx-color);"></i>
          <i onclick="trashMini(this)" class="typcn typcn-trash"></i>
          <i onclick="moveMiniDown(this)" class="typcn typcn-arrow-down-outline"></i>
          <i onclick="moveMiniUp(this)" class="typcn typcn-arrow-up-outline"></i>
        </div>
        <label for="miniOpt${idxMini}" class="miniOptLabel">
          <i class="fa-solid fa-ellipsis-vertical" style="width:23px;"></i>
        </label>
      </li>`);
      miniListDiv.querySelector("#addMiniListInput").value = "";
      checkTest();
      idxMini++;
    };
    addMiniForm.reset();
  });

  function checkTest(){
    let miniTot = 0;
    let miniTodo = 0;
    let good = 0;
    //querySelectorAll('.miniLi:not(.miniTitle)')
    miniListDiv.querySelectorAll('.miniLi').forEach(mini => {
      miniTot++;
      miniTodo = !mini.classList.contains("miniTitle") ? miniTodo + 1 : miniTodo;
      good = mini.querySelector(".listCheckInput").checked ? good + 1 : good;
      if(mini.querySelector(".listCheckInput").checked && ((hideMiniInput && hideMiniInput.checked) || todo.miniHide)){
        mini.classList.add("displayNone");
      };
    });
    document.querySelector("#tellYouMore").innerText = miniTot == 0 ? "" : miniTodo == good ? "(all good!)" : "(...)";
  };
  window.checkTest = checkTest;

  function switchMiniType(thisOne){
    let li = thisOne.parentElement.parentElement;
    li.classList.toggle("miniTitle");
    checkTest();
  };
  window.switchMiniType = switchMiniType;

  function switchMiniColor(thisOne){
    let li = thisOne.parentElement.parentElement;
    let firstColorIdx = mySettings.myBaseColors.findIndex(color => color.colorBG == thisOne.style.color);
    let nextColorIdx = firstColorIdx == mySettings.myBaseColors.length - 1 ? 0 : firstColorIdx + 1;
    li.querySelector(".listCheckLabel").style.color = mySettings.myBaseColors[nextColorIdx].colorBG;
    li.querySelector(".listNameInput").style.color = mySettings.myBaseColors[nextColorIdx].colorBG;
    li.querySelector(".fa-palette").style.color = mySettings.myBaseColors[nextColorIdx].colorBG;
  };
  window.switchMiniColor = switchMiniColor;

  function trashMini(thisOne){
    thisOne.parentElement.parentElement.remove();
    checkTest();
  };
  window.trashMini = trashMini;

  function moveMiniDown(thisOne){
    let li = thisOne.parentElement.parentElement;
    let liNext = li.nextElementSibling;
    if(liNext && liNext.id !== "addMiniListLi"){
      liNext.insertAdjacentElement("afterend", li);
    } else{
      let firstOne = li.parentElement.firstElementChild;
      firstOne.insertAdjacentElement("beforebegin", li);
    };
  };
  window.moveMiniDown = moveMiniDown;

  function moveMiniUp(thisOne){
    let li = thisOne.parentElement.parentElement;
    let liPrev = li.previousElementSibling;
    if(liPrev){
      liPrev.insertAdjacentElement("beforebegin", li);
    } else{
      let addOne = miniListDiv.querySelector("#addMiniListLi");
      addOne.insertAdjacentElement("beforebegin", li);
    };
  };
  window.moveMiniUp = moveMiniUp;

  // *** Project
  let tellHowDiv = document.querySelector("#tellHowDiv");
  let projectOngletDiv = document.querySelector(".projectOngletDiv");
  let newProjectColor = "";
  let newProjectNickname = "";
  let myParentProject = todo.pParentId ? listTasks[listTasks.findIndex(td => td.id == todo.pParentId)] : {};

  function getProjectOngletsTemp(){
    let projectOnglets = [];
    let tempColor = newProjectColor !== "" ? newProjectColor : todo.pColor ? todo.pColor : "";
    let tempName = newProjectNickname !== "" ? newProjectNickname : todo.pName ? todo.pName : "";
    let tempParentId = JSON.stringify(myParentProject) !== "{}" ? myParentProject.id : todo.pParentId ? todo.pParentId : "null";

    if(tempColor !== "" || tempName !== ""){
      let onglet = `<div class="projectOnglet" style="background-color:${tempColor !== "" ? colorsList[tempColor].colorBG : "var(--bg-color)"}; color:${tempColor !== "" ? colorsList[tempColor].colorTX : "var(--tx-color)"};">${tempName !== "" ? tempName : "Project"}</div>`;
      projectOnglets.push(onglet);
    };
    

    let pParentId = tempParentId;
    while (pParentId !== "null") {
      let parentTodo = listTasks[listTasks.findIndex(td => td.id == pParentId)];
      let onglet = `<div class="projectOnglet" style="background-color:${colorsList[parentTodo.pColor].colorBG}; color:${colorsList[parentTodo.pColor].colorTX};">${parentTodo.pName}</div>`;
      projectOnglets.push(onglet);
      pParentId = parentTodo.pParentId;
    };

    if(projectOnglets.length > 0){
      projectOnglets = projectOnglets.join("");
    };

    return projectOnglets;
  };

  //If pParent
  document.querySelectorAll('input[name="projectColorChoices"]').forEach(radio => {
    radio.addEventListener("click", () => {
      newProjectColor = radio.value;
      projectOngletDiv.innerHTML = getProjectOngletsTemp();
    });
  });
  let projectNickInput = document.querySelector("#projectNickInput");
  projectNickInput.addEventListener("change", () => {
    newProjectNickname = projectNickInput.value;
    projectOngletDiv.innerHTML = getProjectOngletsTemp();
  });
  // if pEnfant
  if(allProjects.length > 0){
    let myProjectNames = document.querySelector("#myProjectNames");
    myProjectNames.addEventListener("change", () => {
      if(myProjectNames.value !== "null"){
        myParentProject = listTasks[listTasks.findIndex(td => td.id == myProjectNames.value)];
        projectOngletDiv.innerHTML = getProjectOngletsTemp();
        // let allInsideProjects = allProjects.filter(td => td.pParentId == myProjectNames.value);
        // if(allInsideProjects.length > 0){
        //   let insideProjects = allInsideProjects.map((insideProject) => {
        //     return `<option style="background-color:${colorsList[insideProject.pColor].colorBG}; color:${colorsList[insideProject.pColor].colorTX};" value="${insideProject.id}"${todo.pParentId && todo.pParentId == insideProject.id ? ` selected` : ``}>${insideProject.pName}</option>`;
        //   }).join("");
        //   console.log(insideProjects);
        // };
      };
    });
  };

  document.querySelectorAll('input[name="projectOptions"]').forEach(checkbox => {
    checkbox.addEventListener("click", () => {
      if(document.querySelectorAll('input[name="projectOptions"]:checked').length === 0){//check les deux checkbox et si les deux sont unchecked, ben vide projectOngletDiv
        tellHowDiv.classList.add("displayNone");
        projectOngletDiv.innerHTML = "";
      } else if(checkbox.value == "pParent" && checkbox.checked == true){
        tellHowDiv.classList.remove("displayNone");
        projectOngletDiv.innerHTML = getProjectOngletsTemp();
      } else if(checkbox.value == "pParent" && checkbox.checked == false){
        tellHowDiv.classList.add("displayNone");
      };
    });
  });

  //If any of the offsprings are clicked, instead of an onclick that creates a new taskInfo, it should be an addEventListener here that ALSO saves that first taskInfo! Because we don't want to have to redo the whole trail for each step! So I guess, saving taskInfo would have to be a function (inside this one), that way, we can use the same whole thing for the save button AND everytime we move to an offspring or a parent!
  
  
  // *** COLOR
  let newcolor = todo.color;
  colorIt.addEventListener("click", () => {
    //création de colorPalet based on myBaseColors
    let colors = mySettings.myBaseColors.map((color, idx) => {
      if(idx > 0){
        let colorBG = color.colorBG.startsWith("#") ? color.colorBG.substring(1) : color.colorBG;
        return `<input type="radio" id="${colorBG}Radio" name="colorRadio" value="${idx}" />
        <label for="${colorBG}Radio">
          <div>
            <div class="colorDiv" style="background-color:${color.colorBG}; color:${color.colorTX};">${color.tag}</div>
          </div>
        </label>`;
      };
    }).join("");
    let colorPalet = `<div id="colorPalet" class="colorPaletClass">${colors}</div>`;
    taskInfo.insertAdjacentHTML("beforeend", colorPalet);
    colorPalet = document.querySelector("#colorPalet");
    newClickScreenCreation(colorPalet);
    document.querySelectorAll("input[name='colorRadio']").forEach(radio => {
      if(todo.color == radio.value){
        radio.checked = true;
      } else{
        radio.checked = false;
      };
      radio.addEventListener("click", () => {
        newcolor = radio.value;
        taskTitle.style.color = mySettings.myBaseColors[newcolor].colorBG;
        colorIt.style.color = mySettings.myBaseColors[newcolor].colorBG;
        newClickScreenRemoval(colorPalet);
        // no need for scrolling, right? otherwise, create a 
      // let positionB = window.scrollY and then, after the newClickScreenRemoval, window.scrollTo(0, positionB);
      });
    });
  });
  //ICON
  let newicon = todo.icon;
  iconIt.addEventListener("click", () => {
    //creation of iconsPalet
    let iconsAll = icons.map(icon => {
      let index = icon.search(" fa-") + 4;
      let subname = icon.substring(index);
      let name = subname.split('-').join('');
      name = name.replace(' ', '');
      return `<input type="radio" id="${name}Radio" name="iconRadio" value="${icon}" />
      <label for="${name}Radio">
        <div>
          <i class="${icon}"></i>
        </div>
      </label>`;
    }).join("");
    let iconsPalet = `<div id="iconsPalet" class="iconsPaletClass inTaskDiv">${iconsAll}</div>`;
    taskInfo.insertAdjacentHTML("beforeend", iconsPalet);
    iconsPalet = document.querySelector("#iconsPalet");
    newClickScreenCreation(iconsPalet);
    document.querySelectorAll("input[name='iconRadio']").forEach(radio => {
      if(todo.icon == radio.value){
        radio.checked = true;
      } else{
        radio.checked = false;
      };
      radio.addEventListener("click", () => {
        newicon = radio.value;
        iconIt.className = `IconI ${newicon}`;
        newClickScreenRemoval(iconsPalet);
        // no need for scrolling, right? otherwise, create a 
      // let positionB = window.scrollY and then, after the newClickScreenRemoval, window.scrollTo(0, positionB);
      });
    });
  });

  quickyIt.addEventListener("click", () => {
    iconIt.style.color = quickyIt.checked ? "mediumvioletred" : "inherit";
  });
  
  //SHOW TYPE
  let showTypeIcons = false;
  let newSTColor = false;
  let newSTColorBG;
  let newSTColorTX;
  let newSTColorIdx;
  let newSTing = false;
  let myShowDiv = document.querySelector("#myShowDiv");
  let showTypeCreationInput = document.querySelector("#showTypeCreationInput");
  let showTypeCreationConfirm = document.querySelector("#showTypeCreationConfirm");

  //Hiding lineOptions
  let todoDaySection = document.querySelector("#todoDaySection");
  let recurringDaySection = document.querySelector("#recurringDaySection");
  let noDaySection = document.querySelector("#noDaySection");
  let deadlineSection = document.querySelector("#deadlineSection");
  if(!todo.recurry && todo.line !== "recurringDay" && !todo.recycled){
    storeIt.addEventListener("click", () => {
      let radio = document.querySelector('input[name="termOptions"]:checked').value;
      if(storeIt.checked){
        setN();
        if(radio == "showThing"){
          colorIt.classList.add("hidden");
          taskTitle.style.color = mySettings.myBaseColors[0].colorBG;
          busyInput.checked = todo.busy ? true : todo.busy == false ? false : true;
        } else{
          colorIt.classList.remove("hidden");
          taskTitle.style.color = newcolor ? mySettings.myBaseColors[newcolor].colorBG : mySettings.myBaseColors[todo.color].colorBG;
          busyInput.checked = todo.busy ? true : todo.busy == false ? false : false;
        };
      } else if(radio == "showThing" || radio == "reminder"){
        setTR();
        if(radio == "showThing"){
          colorIt.classList.add("hidden");
          taskTitle.style.color = mySettings.myBaseColors[0].colorBG;
          busyInput.checked = todo.busy ? true : todo.busy == false ? false : true;
        } else if(radio == "reminder"){
          colorIt.classList.remove("hidden");
          taskTitle.style.color = newcolor ? mySettings.myBaseColors[newcolor].colorBG : mySettings.myBaseColors[todo.color].colorBG;
          busyInput.checked = todo.busy ? true : todo.busy == false ? false : false;
        };
      } else{
        colorIt.classList.remove("hidden");
        taskTitle.style.color = newcolor ? mySettings.myBaseColors[newcolor].colorBG : mySettings.myBaseColors[todo.color].colorBG;
        busyInput.checked = todo.busy ? true : todo.busy == false ? false : false;
        setTRN();
      };
    });
  };
  
  document.querySelectorAll('input[name="termOptions"]').forEach(radio => {
    radio.addEventListener("click", () => {
      document.querySelector("#tellYouTerm").innerText = t(radio.value);
      if(radio.value == "showThing" || radio.value == "reminder"){
        setTR();
        if(radio.value == "showThing"){
          colorIt.classList.add("hidden");
          taskTitle.style.color = mySettings.myBaseColors[0].colorBG;
          busyInput.checked = todo.busy ? true : todo.busy == false ? false : true;
        } else if(radio.value == "reminder"){
          colorIt.classList.remove("hidden");
          taskTitle.style.color = newcolor ? mySettings.myBaseColors[newcolor].colorBG : mySettings.myBaseColors[todo.color].colorBG;
          busyInput.checked = todo.busy ? true : todo.busy == false ? false : false;
          document.querySelector("#tellYouShowType").innerText = ``;
        };
      } else{
        colorIt.classList.remove("hidden");
        taskTitle.style.color = newcolor ? mySettings.myBaseColors[newcolor].colorBG : mySettings.myBaseColors[todo.color].colorBG;
        busyInput.checked = todo.busy ? true : todo.busy == false ? false : false;
        document.querySelector("#tellYouShowType").innerText = ``;
        if(storeIt && storeIt.checked && !todo.recycled){ // if it's a recurry, that used to make it bug because there was no storeIt to check if it's checked or not, so I added storeIt
          setN();
        } else{
          setTRN();
        };
      };
      if(radio.value !== "topPriority"){
        document.querySelector("#tellYouUrge").innerText = "";
      } else{
        document.querySelector("#tellYouUrge").innerText = urgeInput.value > 0 ? ` - Priority: ${urgeInput.value}` : ``;
      };
    });
  });
  
  function setTR(){ // A
    todoDaySection.classList.remove("displayNone");
    recurringDaySection.classList.remove("displayNone");
    noDaySection.classList.add("displayNone");
    deadlineSection.classList.add("displayNone");
    document.querySelector(`input[name="whatDay"]#${todo.line !== "recurringDay" ? "todoDay" : todo.line}Input`).checked = true;
    document.querySelector("#todoDayInputLabel").innerHTML = `<p><span class="myRadio"></span><span class="normalText todoDay">Happening Day</span><br /><span class="smallText">(the day this is all gonna go down)</span></p>`;
    document.querySelector("#noDayInputLabel span.smallText").innerText = `(just go with the flow)`;
    taskInfoBtn.innerText = "Save";
  };
  function setN(){ // B
    todoDaySection.classList.add("displayNone");
    recurringDaySection.classList.add("displayNone");
    noDaySection.classList.remove("displayNone"); 
    deadlineSection.classList.add("displayNone");
    document.querySelector("#noDayInput").checked = true;
    document.querySelector("#noDayInputLabel span.smallText").innerText = `(let's put it away until we need it)`;
    taskInfoBtn.innerText = "Save & put it away";
  };
  function setTRN(){ // C
    todoDaySection.classList.remove("displayNone");
    recurringDaySection.classList.remove("displayNone");
    noDaySection.classList.remove("displayNone"); 
    deadlineSection.classList.remove("displayNone");
    document.querySelector(`input[name="whatDay"]#${todo.line}Input`).checked = true;
    document.querySelector("#todoDayInputLabel").innerHTML = `<p><span class="myRadio"></span><span class="normalText todoDay">To-do Day</span><br /><span class="smallText">(the day you want to do it)</span></p>`;
    document.querySelector("#noDayInputLabel span.smallText").innerText = `(just go with the flow)`;
    taskInfoBtn.innerText = "Save";
  };

  showTypeCreationInput.addEventListener("input", () => {
    newSTing = true;
  });
  document.querySelector("#showTypeChoiceIcon").addEventListener("click", () => {
    if(showTypeIcons){
      document.querySelector(".showTypeIconsDiv").remove();
      showTypeIcons = false;
    } else{
      let STicons = colorsList.map((icon, idx) => {
        return `<div class="showTypeIconsB" data-index="${idx}"><div class="showTypeIconsC" style="background-color:${icon.colorBG};"><i class="typcn typcn-tick-outline" style="color:${icon.colorTX};"></i></div></div>`;
      }).join("");
      document.querySelector(".showTypeCreationInside").insertAdjacentHTML("beforeend", `<div class="showTypeIconsDiv">${STicons}</div>`);
      document.querySelectorAll(".showTypeIconsB").forEach(btn => {
        btn.addEventListener("click", (e) => {
          newSTColorIdx = e.currentTarget.dataset.index;
          newSTColorBG = colorsList[e.currentTarget.dataset.index].colorBG ;
          newSTColorTX = colorsList[e.currentTarget.dataset.index].colorTX;
          showTypeCreationInput.style.backgroundColor = newSTColorBG;
          showTypeCreationInput.style.color = newSTColorTX;
          newSTColor = true;
          document.querySelector(".showTypeIconsDiv").remove();
          showTypeIcons = false;
          newSTing = true;
        });
      });
      showTypeIcons = true;
    };
  });
  showTypeCreationConfirm.addEventListener("click", (e) => {
    showTypeCreationConfirm.style.color = mySettings.myBaseColors[0].colorBG;
    if(newSTColor && showTypeCreationInput.value){
      document.querySelector("#tellYouShowType").innerText = ` - ${showTypeCreationInput.value}`;
      let showType = {
        name: showTypeCreationInput.value,
        colorBG: newSTColorBG,
        colorTX: newSTColorTX,
        color: newSTColorIdx //index in colorsList
      };
      mySettings.myShowTypes.push(showType);
      if(mySettings.myShowTypes.length == 1){
        myShowDiv.innerHTML = ``;
      };
      myShowDiv.insertAdjacentHTML("beforeend", `<div class="showTypeLabelDiv" id="div${showType.name}">
        <input class="showInput" type="radio" name="showOptions" id="${showType.name}Show" value="${showType.name}" ${mySettings.myShowTypes.length == 1 ? `checked` : ``} />
        <label for="${showType.name}Show" class="showLi showTypeLabel" style="background-color:${colorsList[showType.color].colorBG};color:${colorsList[showType.color].colorTX};">${showType.name}<i class="typcn typcn-tick showTick"></i></label>
        <i class="typcn typcn-trash" onclick="trashShowTypeEvent(this)"></i>
      </div>`);//colorsList[showType.color].colorTX
      
      localStorage.mySettings = JSON.stringify(mySettings);
      document.querySelectorAll(".underh5").forEach(h => {
        h.remove();
      });
      showTypeCreationInput.value = "";
      showTypeCreationInput.style.backgroundColor = mySettings.myBaseColors[0].colorTX;
      showTypeCreationInput.style.color = mySettings.myBaseColors[0].colorBG;
      newSTColor = false;
      newSTing = false;
    } else if(newSTColor && !showTypeCreationInput.value){
      e.preventDefault();
      addShowTypeDiv.insertAdjacentHTML("afterend", `<h5 class="underh5">Ci serve anche un nome!</h5>`);
    } else if(!newSTColor && showTypeCreationInput.value){
      e.preventDefault();
      addShowTypeDiv.insertAdjacentHTML("afterend", `<h5 class="underh5">Ci serve anche un color!</h5>`);
    };
  });
  document.querySelectorAll('input[name="showOptions"]').forEach(radio => {
    radio.addEventListener("click", () => {
      document.querySelector("#tellYouShowType").innerText = ` - ${radio.value}`;
    });
  });


  // MARK: SAVE BUTTON
  function saveTaskInfo(e){ //add a stop if it's recurry to let them know that if they save it, it'll change it and isolate it... or we just don't care and they'll just have to figure that out on their own?
    if(!trashIt.checked){
      if(newSTing){
        console.log("should stop");
        e.preventDefault();//This is not working (just add an alert)
        e.currentTarget.insertAdjacentHTML("beforebegin", `<h5>Don't you want to save your brand new type of show?</h5>
        <h6>(If you don't, just click again!)</h6>`);
        showTypeCreationConfirm.style.color = "red";
        newSTing = false;
      };
      
      // *** PROJECT
      let isParent = false;
      let isOffspring = false;
      if(document.querySelector("#wholeProjectInput").checked){
        isParent = true;
        todo.pColor = newProjectColor !== "" ? newProjectColor : todo.pColor !== "" ? todo.pColor : alert("That project needs a color!"); //add dumbproofing
        todo.pName = newProjectNickname !== "" ? newProjectNickname : todo.pName !== "" ? todo.pName : alert("That project needs a nickname!");
        todo.pOffspringId = [...document.querySelectorAll("#projectUl > li")].map(li => {
          return li.id;
        });
      };
      if(document.querySelector("#partProjectInput").checked){
        isOffspring = true;
        todo.pPosition = todo.pPosition !== undefined ? todo.pPosition : JSON.stringify(myParentProject) !== "{}" ? "in" : "in"; //par défault
        if(!myParentProject.pOffspringId.includes(todo.id)){
          myParentProject.pOffspringId.push(todo.id);
        };
      };
      if(isParent || isOffspring){
        todo.pParentId = isOffspring == false ? "null" : JSON.stringify(myParentProject) !== "{}" ? myParentProject.id : todo.pParentId !== "" ? todo.pParentId : alert("If it's not in one of those projects, then create your own project first.");
      };
      //We need to figure out what to do and how to know if we remove an offspring from it's parent! Either by trashing it or by just letting it out on its own in the listTask! We need to at least remove its id from its parent.pOffspringId array. And its pPosition and pParentId... (and I think that's it...)

      
      // save convo
      if(convoIt.checked){
        todo.convo = true;
        todo.convoStatus = document.querySelector('input[name="convoStatusRadios"]:checked').value;
        todo.convoContactId = contactList[thisContactIndex].id;
      } else{
        delete todo.convo;
        delete todo.convoStatus;//?
        delete todo.convoContactId;//?
      };
      
  
      // save Label
      if(JSON.stringify(newLabel) !== '{"color":"","name":""}'){
        saveNewLabel();
        applyLabel(todo, newLabel.color, newLabel.name);
        newLabelReset();
      } else if(newlabelName == "" && newlabelColor == ""){
        removeLabel(todo);
      } else if(newlabelName !== "" && newlabelColor !== ""){
        applyLabel(todo, newlabelColor, newlabelName);
        newlabelColor = "";
        newlabelName = "";
      };
      
      
      todo.task = taskTitle.value.startsWith("*") ? taskTitle.value.substring(1) : taskTitle.value;

      if(taskDetails.value !== ""){
        todo.info = taskDetails.value;
      } else{
        delete todo.info;
      };

      let whereText = document.querySelector("#whereInput");
      todo.where = whereCheck.checked ? "home" : whereText.value !== "" ? whereText.value : "not home";

      todo.color = newcolor;
      todo.icon = newicon;

      todo.term = document.querySelector('input[name="termOptions"]:checked').value;
      if(todo.term == "showThing"){
        let chosen = false;
        document.querySelectorAll('input[name="showOptions"]').forEach(radio => {
          if(radio.checked){
            todo.showType = radio.value;
            let indexST = mySettings.myShowTypes.findIndex(show => show.name == todo.showType);
            todo.STColorBG = mySettings.myShowTypes[indexST].colorBG;
            todo.STColorTX = mySettings.myShowTypes[indexST].colorTX;
            todo.STColor = indexST; //That doesn't work! we would want the index of colorsList it should be "= mySettings.myShowTypes[indexST].color (see creation d'un showType)"
            chosen = true;
          };
        });
        if(!chosen){
          console.log("should stop");
          e.preventDefault();//This is not working
          e.currentTarget.insertAdjacentHTML("beforebegin", `<h5>You need to decide what kinda show that is</h5>`);
        };
      } else{
        delete todo.showType;
        delete todo.STColorBG;
        delete todo.STColorTX;
        delete todo.STColor;
      };

      if((urgeInput.value == "" || urgeInput.value == 0) || todo.term !== "topPriority"){
        delete todo.urge;
        delete todo.urgeNum;
        delete todo.urgeColor;
      } else if(urgeInput.value > 0 && todo.term == "topPriority"){
        todo.urge = true;
        todo.urgeNum = urgeInput.value;
        colorUrges("next");
      };

      if(miniListDiv.querySelector(".miniLi")){
        todo.miniList = Array.from(miniListDiv.querySelectorAll(".miniLi")).map((li) => {
          return {
            name: li.querySelector(".listNameInput").value,
            type: li.classList.contains("miniTitle") ? "title" : "item",
            color: mySettings.myBaseColors.findIndex(color => color.colorBG == li.querySelector(".listNameInput").style.color),
            checked: li.querySelector(".listCheckInput").checked ? true : false
          };
        });
        todo.miniHide = hideMiniInput.checked ? true : false;
      } else{
        delete todo.miniList;
        delete todo.miniHide;
      };

      if(!todo.recurry && todo.line !== "recurringDay"){
        if(!todo.stock && storeIt && storeIt.checked){
            todo.stock = true; //goes in storage
            todo.line = "noDay";
          } else if(todo.stock && storeIt && !storeIt.checked){
            delete todo.stock //is not in storage anymore
        };
      };

      delete todo.newShit;
      delete todo.recycled;
      //on aurait delete todo.copied aussi, si on cré aussitôt le taskInfo du nouveau todo après avoir "Save & Copy" l'autre
      
      if(todo.recurry == true){
        //we could add an alert saying that if you save it, it's gonna become a whole thing on itself in the big list
        getRecurryDateOut(todo); // donc la date (originale (vu qu'on met calendarSave APRÈS)) du todo est enlevée des recurryDates de son recurringDay
        delete todo.recurry;
        delete todo.recId; //et todo redevient un todo normal!
        listTasks.push(todo); // et le todo est maintenant dans la listTask!
      };
      calendarSave(todo); // 

      //WOLA si todo était stored ou stock et là devient reccuringDay?!

      let todoIndex = listTasks.findIndex(td => td.id == todo.id);
      if(todoIndex == -1){
        listTasks.push(todo);
      };

      if(quickyIt.checked){
        todo.quicky = true;
      } else{
        delete todo.quicky;
      };

      //Now we identify all the parents before doing any todoCreation
      //in the swipingDay Section if it's the date the todo is...)
      parents = Array.from(document.querySelectorAll("li")).filter((li) => li.id.includes(todo.id));
      console.log(parents);

      storageSwitch = todo.stock ? true : false;

      //projectSwitch
      //Pas besoin de penser à ça vu qu'on ouvre juste un taskInfo à la fois et qu'une task peut comme pas devenir son propre offspring! O.o

      if(copyIt.checked){ //WOLA! Si c'est stock, il faut enlever les storedId! Si c'est reccuring...
        let newTodo = JSON.parse(JSON.stringify(todo));
        newTodo.id = crypto.randomUUID();
        listTasks.push(newTodo);
        todoCreation(newTodo);
        //après avoir fermé ce taskInfo et enlevé "selectedParent" il faut recréer un autre taskInfo avec ce nouveau todo
      };
  
      if(newState == checkSwitch[0]){
        todoCreation(todo);
      } else if(newState == checkSwitch[1]){
        gotItHalfDone(todo);
        todoCreation(todo);
      } else if(newState == checkSwitch[2]){
        if(todo.term == "alwaysHere"){
          gotItHalfDone(todo);
          todoCreation(todo);
        } else{
          gotItDone(todo);
        };
      };

      storageSwitch = false;
      
    } else if(trashIt.checked){ //if it's new, there's nothing to do, the todo doesn't exist yet in the listTasks
      if(todo.recurry == true){ //the parent will be removed, but we need to remove the date in the recurring.recurryDates
        getRecurryDateOut(todo); // donc la date du todo est enlevée des recurryDates de son recurringDay        
      } else{
        let trashIndex = listTasks.findIndex(td => td.id == todo.id);
        if(trashIndex !== -1){
          listTasks.splice(trashIndex, 1);
        };
      };
      parents = Array.from(document.querySelectorAll("li")).filter((li) => li.id.includes(todo.id));
    };
    
    localStorage.listTasks = JSON.stringify(listTasks);
    updateWeek();
    updateMonth();

    //nouvelle version
    // pour les calendars, on vient de faire update
    // pour les listes, on a déjà fait todoCreation, il reste à enlever les parents et taskInfo et le clickscreen
    parents.forEach(parent => {
      parent.remove();
    });
    if(parent){
      parent.remove();
    };
    
    let togoList = getTogoList(todo);
    if(togoList !== ""){ //revoir les méthodes de tri et s'assurer de tenir compte du storage aussi //Ça pourrait aussi bien être dans la même section plus bas avec le newLi... (en théorie, on devrait pas avoir à re-trier l'ancienne liste...  juste la nouvelle (si le todo a changé de liste))
      howToSortIt(togoList);
    } else{
      sortItAllWell();
    };
    newClickScreenRemoval(taskInfo);
    // taskInfo.remove();
    // newClickScreen.remove();
    // parent.classList.remove("selectedTask");
    // parent = ``;
       

    //Si copyIt.checked, recré un nouveau taskInfo avec le nouveau todo (on pourrait mettre let newTodo plus global (dans cette fonction) et juste le réutiliser ici, ou mettre le if{copyIt.checked} au complet ici, après qu'on ait tout enlevé...)

    calendarStock = false;
    projectStock = false;
    updateArrowsColor();
    updateCBC();
    console.log(todo);
    parent = ``;
    console.log(parent);

    if(todo.rtdbKey && todo.rtdbKey !== null){
      remove(ref(rtdb, `meetAlix/${todo.rtdbKey}`));
      delete todo.rtdbKey;
    };
  };

  function moveOn(){
    // now let's see if and where we should scroll...
    let newLi = document.getElementById(todo.id);
    if(newLi){
      let list = newLi.parentElement;
      let section = list.closest("section");
      if(section && section.querySelector(".listToggleInput")){
        section.querySelector(".listToggleInput").checked = true;
      };
      newLi.scrollIntoView();
    } else{
      // window.scrollTo({ top: 0 });
      window.scrollTo(0, positionA);
    };
  };
  taskInfoBtn.addEventListener("click", (e) => {
    saveTaskInfo(e);
    moveOn();
  });
  
};
window.taskAddAllInfo = taskAddAllInfo;

function t(key){
  return trans.randomTask[key]?.or ?? key; // regarde si randomTask[key] existe, si oui retourne .or, si non retourne key
};

window.copyText = copyText;

function copyText(){
  let text = document.querySelector("#whereInput").value;
  navigator.clipboard.writeText(text);
};

function trashShowTypeEvent(thisOne){
  let div = thisOne.parentElement;
  let name = div.id.slice(3);
  let index = mySettings.myShowTypes.findIndex(show => show.name == name);
  mySettings.myShowTypes.splice(index, 1);
  div.remove();
  localStorage.mySettings = JSON.stringify(mySettings);
};
window.trashShowTypeEvent = trashShowTypeEvent;


window.listTasks = listTasks;
window.listDones = listDones;


// *** ICON
let iconTag;
function iconChoice(thisOne){
  iconTag = thisOne;
  parent = iconTag.parentElement;
  parent.classList.add("selectedTask");
  let li = iconTag.parentElement; //li and parent are the same!!!
  let liId = li.id;
  let todo;
  let recIndex;
  let todoIndex;
  if(li.dataset.rec && li.dataset.rec !== "undefined"){ // have a function to do that, that will return the todo. because with project, you'll have the same math to do
    let rec = li.dataset.rec;
    recIndex = listTasks.findIndex(todo => todo.id == rec);
    todoIndex = listTasks[recIndex].recurrys.findIndex(todo => todo.id == liId);
    todo = listTasks[recIndex].recurrys[todoIndex];
  } else{
    todoIndex = listTasks.findIndex(todo => todo.id == liId);
    todo = listTasks[todoIndex];
  };

  //creation of iconsPalet
  let iconsAll = icons.map(icon => {
    let index = icon.search(" fa-") + 4;
    let subname = icon.substring(index);
    let name = subname.split('-').join('');
    name = name.replace(' ', '');
    return `<input type="radio" id="${name}Radio" name="iconRadio" value="${icon}" />
    <label for="${name}Radio">
      <div>
        <i class="${icon}"></i>
      </div>
    </label>`;
  }).join("");
  let iconsPalet = `<div id="iconsPalet" class="iconsPaletClass">${iconsAll}</div>`;
  iconTag.insertAdjacentHTML("afterend", iconsPalet);
  iconsPalet = document.querySelector("#iconsPalet");
  newClickScreenCreation(iconsPalet);

  //Choisir l'icon
  document.querySelectorAll("input[name='iconRadio']").forEach(radio => {
    if(todo.icon == radio.value){
      radio.checked = true;
    } else{
      radio.checked = false;
    };
    radio.addEventListener("click", () => {
      let icon = radio.value;
      let liIcon = li.querySelector(".IconI");
      liIcon.className = `IconI ${icon}`;
      todo.icon = icon;
      if(li.dataset.rec && li.dataset.rec !== "undefined"){ //update that part!
        delete li.dataset.rec;
        let oldRecurry = listTasks[recIndex].recurrys.splice(todoIndex, 1);
        delete oldRecurry[0].recurry;
        delete oldRecurry[0].out;
        delete oldRecurry[0].recId;
        listTasks.push(oldRecurry[0]);
      };
      
      localStorage.listTasks = JSON.stringify(listTasks);
      updateCBC();
    
      howToSortIt(parent.parentElement.id); //adding a sorting (in case the section was sorted in terms of icons)
      newClickScreenRemoval(iconsPalet);
      // iconsPalet.remove();
      // newClickScreen.remove();
      // parent.classList.remove("selectedTask");
      // parent = ``;
        // no need for scrolling, right? otherwise, create a 
        // let positionA = window.scrollY and then, after the newClickScreenRemoval, window.scrollTo(0, positionA);
    });
  });
};
window.iconChoice = iconChoice;

// *** LABEL

function creatingLabelPanel(todo, options){ //création du paneau et 
  console.log(options);
  /* 
  options = {
    where (taskInfo or labelTag), 
    labelDiv (labelIt (taskInfo) or labelTag (checkOptions)), 
    screen (SupClickScreen (taskInfo) or clickScreen (checkOptions)), 
    myLabels (true (mySettings.myLabels && mySettings.myLabels.length > 0) or false),
  } */
  newLabelReset();

  // Création du panneau
  let labelNamesChoice;
  if(options.myLabels){
    let labelNames = mySettings.myLabels.map((label, idx) => {
      return `<option style="background-color:${colorsList[label.color].colorBG}; color:${colorsList[label.color].colorTX};" value="${idx}" ${todo.LName && todo.LName == label.name ? `selected` : ``}>${label.name}</option>`;
    }).join("");
    labelNamesChoice = `<h5 style="margin: 10px 0 5px; align-self: flex-start;">Choose one: <select id="myLabelNames">
    <option value="null">none</option>
    ${labelNames}
  </select></h5>`;
  } else{
    labelNamesChoice = ``;
  };
  let Lcolors = colorsList.map((icon, idx) => {
    return `<input id="labelColor${idx}" type="radio" name="labelColorChoices" class="displayNone" value="${idx}" /><label for="labelColor${idx}" class="showTypeIconsB labelColorChoix"><i class="fa-solid fa-folder-closed fa-rotate-270" style="color:${icon.colorBG};"></i></label>`;
  }).join("");
  //Panneau (labelPalet)
  let labelPalet = `<div id="labelPalet" class="labelPaletClass${options.icon ? " onLabel" : ""}">
  <h5 style="margin:0; text-decoration:underline;">Let's put a label on it!</h5>
  ${labelNamesChoice}
  <input id="createNewLabelToggle" type="checkbox" class="cossin taskToggleInput" />
    <div>
      <label for="createNewLabelToggle" class="taskToggleLabel" style="width: -webkit-fill-available; margin-top: 15px;">
        <h5 class="topList">or create one:</h5>
        <span class="typcn typcn-chevron-right-outline taskToggleChevron"></span>
      </label>
      <div class="taskToggleList"style="display: flex; flex-direction: column; align-items: center; width: -webkit-fill-available;">
        <h5 style="margin: 15px 0 0; align-self: flex-start;">Name: <input id="labelNameInput" type="text" style="width: 50px;margin:auto;" placeholder="Label"/></h5>
        <div>${Lcolors}</div>
        ${options.icon ? `<button id="createLabelBtn" style="margin: 10px auto; font-size: .8em; opacity: .5;">Create & apply new label</button>
        <button id="createLabelCancelBtn" class="ScreenBtn2">Cancel</button>` : ``}
      </div>
    </div>
  </div>`;

  //placement du panneau
  options.where.insertAdjacentHTML("beforeend", labelPalet);
  labelPalet = document.querySelector("#labelPalet");
  newClickScreenCreation(labelPalet);

  let createLabelBtn;
  let createLabelCancelBtn;
  if(options.icon){
    createLabelBtn = document.querySelector("#createLabelBtn");
    createLabelCancelBtn = document.querySelector("#createLabelCancelBtn");
    newlabelName = "";
    newlabelColor = "";
  };

  if(options.myLabels){
    document.querySelector("#myLabelNames").addEventListener("change", (e) => {
      if(e.target.value == "null"){
        newLabelReset();
        newlabelColor = "";
        newlabelName = "";
        options.labelDiv.style.backgroundColor = "var(--bg-color)";
        options.labelDiv.style.color = "var(--tx-color)";
        options.labelDiv.innerText = "Label";
        newClickScreenRemoval(labelPalet);
        if(options.icon){
          removeLabel(todo);
          localStorage.listTasks = JSON.stringify(listTasks);
          updateCBC();
          options.icon.style.color = "var(--tx-color)";
          options.labelDiv.classList.add("noLabel");
          howToSortIt(parent.parentElement.id);
          let checkOptionsDiv = document.querySelector(".checkOptionsDiv");
          newClickScreenRemoval(checkOptionsDiv);
        };
      } else{
        let label = mySettings.myLabels[e.target.value];
        newlabelColor = label.color;
        newlabelName = label.name;
        options.labelDiv.classList.remove("noLabel");
        options.labelDiv.style.backgroundColor = colorsList[label.color].colorBG;
        options.labelDiv.style.color = colorsList[label.color].colorTX;
        options.labelDiv.innerText = label.name;
        newClickScreenRemoval(labelPalet);
        if(options.icon){
          applyLabel(todo, label.color, label.name);
          localStorage.listTasks = JSON.stringify(listTasks);
          updateCBC();
          options.icon.style.color = colorsList[label.color].colorBG;
          howToSortIt(parent.parentElement.id);
          newLabelReset();
          newlabelColor = "";
          newlabelName = "";
          let checkOptionsDiv = document.querySelector(".checkOptionsDiv");
          newClickScreenRemoval(checkOptionsDiv);
        };
      };
    });
  };
  
  document.querySelectorAll("input[name='labelColorChoices']").forEach(radio => {
    radio.addEventListener("click", () => {
      //newlabelColor = radio.value; 
      newLabel.color = radio.value; //index of colorList
      console.log(newLabel);
      if(options.icon && newLabel.color !== "" && newLabel.name !== ""){
        createLabelBtn.style.opacity = "1";
      };
      options.labelDiv.classList.remove("noLabel");
      options.labelDiv.style.backgroundColor = colorsList[newLabel.color].colorBG;
      options.labelDiv.style.color = colorsList[newLabel.color].colorTX;
      options.icon ? options.icon.style.color = colorsList[newLabel.color].colorBG : null;
    });
  });
  document.querySelector("#labelNameInput").addEventListener("change", (e) => {
    options.labelDiv.classList.remove("noLabel");
    newLabel.name = options.labelDiv.innerText = e.currentTarget.value;
    if(options.icon && newLabel.color !== "" && newLabel.name !== ""){
      createLabelBtn.style.opacity = "1";
    };
  });
  if(options.icon){
    // create Label Btn
    createLabelBtn.addEventListener("click", () => {
      if(createLabelBtn.style.opacity == "1"){
        saveNewLabel();
        applyLabel(todo, newLabel.color, newLabel.name);
        localStorage.listTasks = JSON.stringify(listTasks);
        options.icon.style.color = colorsList[newLabel.color].colorBG;
        howToSortIt(parent.parentElement.id);
        newLabelReset();
        newlabelColor = "";
        newlabelName = "";
        newClickScreenRemoval(labelPalet);
        // labelPalet.remove();
        // newClickScreen.remove();
        // parent.classList.remove("selectedTask");
        // parent = ``;
          // no need for scrolling, right? otherwise, create a 
          // let positionA = window.scrollY and then, after the newClickScreenRemoval, window.scrollTo(0, positionA);
      };
    });
    // cancel btn
    createLabelCancelBtn.addEventListener("click", () => {
      if(todo.label){
        options.labelDiv.style.backgroundColor = colorsList[todo.LColor].colorBG;
        options.labelDiv.style.color = colorsList[todo.LColor].colorTX;
        options.icon.style.color = colorsList[todo.LColor].colorBG;
        options.labelDiv.innerText = todo.LName;
      } else{
        options.labelDiv.classList.add("noLabel");
      };
      newLabelReset();
      newlabelColor = "";
      newlabelName = "";
      newClickScreenRemoval(labelPalet);
      // labelPalet.remove();
      // newClickScreen.remove();
      // parent.classList.remove("selectedTask");
      // parent = ``;
        // no need for scrolling, right? otherwise, create a 
        // let positionA = window.scrollY and then, after the newClickScreenRemoval, window.scrollTo(0, positionA);
    });
  };
};

function saveNewLabel(){
  if(!mySettings.myLabels){
    mySettings.myLabels = [];
    mySettings.myLabels.push(newLabel);
  } else if(mySettings.myLabels && mySettings.myLabels.length > 0){
    let thisLabelIdx = mySettings.myLabels.findIndex(label => label.name == newLabel.name);
    if(thisLabelIdx == -1){
      mySettings.myLabels.push(newLabel);
    } else{
      mySettings.myLabels[thisLabelIdx] = newLabel;
    };
  };
  localStorage.mySettings = JSON.stringify(mySettings);
  myLabelsGeneralChoice();
  updateCBC();
};

function applyLabel(todo, newlabelColor, newlabelName){
  todo.label = true;
  todo.LName = newlabelName;
  todo.LColor = newlabelColor;
};
function removeLabel(todo){
  delete todo.label;
  delete todo.LName;
  delete todo.LColor;
};

// *** DATE
function getMyTodayDate(){
  let todayDate = new Date();
  let yesterDate = new Date();
  yesterDate.setDate(yesterDate.getDate() - 1);
  let currentHour = String(todayDate.getHours()).padStart(2, "0");
  let currentMinute = String(todayDate.getMinutes()).padStart(2, "0");
  let currentTime = `${currentHour}:${currentMinute}`;
  let myTodayDate = currentTime <= mySettings.myTomorrow ? yesterDate : todayDate;
  return myTodayDate;
};
function getTodayDateString(){
  return getStringFromDate(getMyTodayDate());
};

function getTomorrowDateSring(){
  let todayDate = new Date();
  let tomoDate = new Date();
  tomoDate.setDate(tomoDate.getDate() + 1);
  let currentHour = String(todayDate.getHours()).padStart(2, "0");
  let currentMinute = String(todayDate.getMinutes()).padStart(2, "0");
  let currentTime = `${currentHour}:${currentMinute}`;
  let date = currentTime <= mySettings.myTomorrow ? todayDate : tomoDate;
  // return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return getStringFromDate(date);
};

function timeLimit(limit){
  let nowDate = new Date();
  let yesterDate = new Date();
  yesterDate.setDate(yesterDate.getDate() - 1);
  let tomoDate = new Date();
  tomoDate.setDate(tomoDate.getDate() + 1);
  let afterDate = new Date();
  afterDate.setDate(afterDate.getDate() + 2);
  let currentHour = String(nowDate.getHours()).padStart(2, "0");
  let currentMinute = String(nowDate.getMinutes()).padStart(2, "0");
  let currentTime = `${currentHour}:${currentMinute}`;
  let limitDate;
  let modifiedTomorrow = mySettings.myTomorrow.replace(":", "-")
  if(limit == "hierOggi"){
    limitDate = currentTime <= mySettings.myTomorrow ? yesterDate : nowDate;
  } else if(limit == "oggiDemain"){
    limitDate = currentTime <= mySettings.myTomorrow ? nowDate : tomoDate;
  } else if(limit == "demainApres"){
    limitDate = currentTime <= mySettings.myTomorrow ? tomoDate : afterDate;
  };
  // let timeLimit = `${limitDate.getFullYear()}-${String(limitDate.getMonth()+1).padStart(2, "0")}-${String(limitDate.getDate()).padStart(2, "0")}-${modifiedTomorrow}`;
  let timeLimit = `${getStringFromDate(limitDate)}-${modifiedTomorrow}`;
  return timeLimit;
};


function getLastWeekDate(){
  let date = getMyTodayDate(); //todayDate
  date.setDate(date.getDate() - 7); //lastWeekDate
  return date;
};

function getLastWeekDateString(){
  let lastWeekDate = getLastWeekDate();
  return getStringFromDate(lastWeekDate);
};


// MARK: MONTHLY CALENDAR

function putShowsInMonth(monthlyFirst, monthlyLast){
  let filteredShows = listTasks.filter((todo) => todo.term == "showThing" || todo.term == "reminder");
  let shows = [];
  filteredShows.forEach(show => {
    if(show.line == "recurringDay"){
      show.recurryDates.forEach(recurryDate => {
        if(monthlyFirst <= recurryDate && recurryDate <= monthlyLast){
          let recurry = getWholeRecurry(show, recurryDate, show.id);
          shows.push(recurry);
        };
      });
    } else{
      shows.push(show);//Est-ce que ça prend vraiment juste les shows qui sont entre monthlyFirst et monthlyLast?! ou est-ce que ça les prend juste tous...?! O.o
    };
  });
  let filteredDonedShows = listDones.filter((done) => (monthlyFirst <= done.date && done.date <= monthlyLast));
  filteredDonedShows.forEach(done => {
    done.list.forEach(list => {
      if(list.term == "showThing"){
        //list.startDate = done.date;
        list.startTime = list.dalle ? list.dalle : list.startTime;
        list.past = true;
        shows.push(list);
      };
    });
  });
  // console.log(shows);
  let sortedShows = shows.sort((s1, s2) => (s1.startDate < s2.startDate) ? -1 : (s1.startDate > s2.startDate) ? 1 : (s1.startDate == s2.startDate) ? (s1.term < s2.term) ? -1 : (s1.term > s2.term) ? 1 : (s1.term == s2.term) ? (s1.startTime < s2.startTime) ? -1 : (s1.startTime > s2.startTime) ? 1 : 0 : 0 : 0);
  shows = sortedShows;
  let today = getTodayDateString();
  shows.forEach(show => {
    let eventDiv;
    if(show.term == "showThing"){
      eventDiv = `<div data-id="${show.id}" data-date="${show.startDate}" ${show.recurry ? `data-rec="${show.recId}"` : ``} data-showType="${show.showType}" ${!show.past ? `onclick="toTIdeCMaM(this)"` : ``} class="eventDiv ${show.past ? "pastEvent" : ""}" style="background-color:${show.STColorBG}; color:${show.STColorTX};">${show.task}</div>`;
    } else if(show.term == "reminder"){
      eventDiv = `<div data-id="${show.id}" data-date="${show.startDate}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${!show.past ? `onclick="toTIdeCMaM(this)"` : ``} class="eventDiv ${show.startDate < today ? "pastEvent" : ""}" style="color:${mySettings.myBaseColors[show.color].colorBG};border:none;">${show.task}</div>`;
    };
    //if it's done (past), the onclick="toTIdeCMaM(this) won't work because it's not in listTasks anymore... do we want to be able to modify done ones? If so, we'll need to have a function to get the done in the listDones... and modify it there...
    let kase = document.querySelector("[data-wholedate='" + show.startDate + "']");
    if(kase){
      kase.insertAdjacentHTML("beforeend", eventDiv);
      document.querySelector(`[data-id="${show.id}"]`).addEventListener("click", (e) => {
        document.querySelectorAll(".eventDiv").forEach(div => {
          if(div == e.currentTarget){
            if(e.currentTarget.classList.contains("selectedKase")){
              e.currentTarget.classList.remove("selectedKase");
            } else{
              e.currentTarget.classList.add("selectedKase");
            };
          } else{
            div.classList.remove("selectedKase");
          };
        });
      });
    }; 
  });
};

let tbodyMC = document.querySelector("#monthlyCalendarTBody");
function createBody(){
  let year = getMyTodayDate().getFullYear();
  let month = getMyTodayDate().getMonth();
  let trs = [];
  for(let i = 0; i < 6; i++){
    let tds = [];
    for(let j = 0; j < 7; j++){
      let td = `<td ${i == 0 && j == 0 ? `id="monthlyFirst"` : i == 5 && j == 6 ? `id="monthlyLast"` : ``} ${j == 0 ? `data-weekly="${i + 1}"` : ``}><div class="circle"></div><span class="typcn typcn-plus addEvent displayNone" onclick="toTIdeCMaN(this)"></span></td>`;
      tds.push(td);
    };
    let tdsF = tds.join("");
    let tr = `<tr>
        ${tdsF}
        <td class="toWeeklyArrow toWeeklyArrowRight"><button onclick="goToThisWeekly(${i + 1})"></button></td>
      </tr>`;
    trs.push(tr);
  };
  let trsF = trs.join("");
  tbodyMC.innerHTML = trsF;
  getMonthlyCalendar(year, month);
  document.querySelector("#monthBackward").addEventListener("click", () => {
    document.querySelectorAll(".circle").forEach(circle => {
      circle.parentElement.classList.remove("selectedKase");
      circle.parentElement.querySelector(".addEvent").classList.add("displayNone");
    });
    document.querySelectorAll(".eventDiv").forEach(div => {
      div.remove();
    });
    let todayCircle = document.querySelector(".heresToday");
    if(todayCircle){
      todayCircle.classList.remove("heresToday");
      document.querySelectorAll(".backToMonthlyTodayBtn").forEach(btn => {
        btn.classList.remove("displayNone");
      });
    };
    month = month > 0 ? month - 1 : 11;
    year = month == 11 ? year - 1 : year;
    getMonthlyCalendar(year, month);
  });
  
  document.querySelector("#monthForward").addEventListener("click", () => {
    document.querySelectorAll(".circle").forEach(circle => {
      circle.parentElement.classList.remove("selectedKase");
      circle.parentElement.querySelector(".addEvent").classList.add("displayNone");
    });
    document.querySelectorAll(".eventDiv").forEach(div => {
      div.remove();
    });
    let todayCircle = document.querySelector(".heresToday");
    if(todayCircle){
      todayCircle.classList.remove("heresToday");
      document.querySelectorAll(".backToMonthlyTodayBtn").forEach(btn => {
        btn.classList.remove("displayNone");
      });
    };
    month = month < 11 ? month + 1 : 0;
    year = month == 0 ? year + 1 : year;
    getMonthlyCalendar(year, month);
  });
};  

function backToMonthlyToday(){
  document.querySelectorAll(".circle").forEach(circle => {
    circle.parentElement.classList.remove("selectedKase");
    circle.parentElement.querySelector(".addEvent").classList.add("displayNone");
  });
  document.querySelectorAll(".eventDiv").forEach(div => {
    div.remove();
  });
  let year = getMyTodayDate().getFullYear();
  let month = getMyTodayDate().getMonth();
  getMonthlyCalendar(year, month);
};
window.backToMonthlyToday = backToMonthlyToday;

function goToThisWeekly(weeklyNum){
  let Dwholedate = tbodyMC.querySelector(`[data-weekly="${weeklyNum}"]`).dataset.wholedate;
  let Ddate = getDateFromString(Dwholedate);
  eraseWeek();
  putDatesInWeek(Ddate);
  document.getElementById("switchPageInputWeek").dispatchEvent(pageEvent);
};
window.goToThisWeekly = goToThisWeekly;

function getMonthlyCalendar(year, month){
  //let todayWholeDate = getTodayDateString();
  let first = new Date(year, month, 1);
  let monthName = first.toLocaleString('it-IT', { month: 'long' }).toLocaleUpperCase();
  monthNameSpace.innerText = monthName;
  yearNameSpace.innerText = year;
  
  let last = new Date(year, month + 1, 0).getDate();
  let firstDay = first.getDay();
  first.setDate(-(firstDay - 1));
  let numStart = first.getDate();
  let i = 0;
  let num = numStart;
  tbodyMC.querySelectorAll(".circle").forEach((td) => {
    //td.classList.remove("heresToday");
    if(i < firstDay){
      td.innerText = num;
      let day = String(num).padStart(2, "0");
      let thisMonth = month == 0 ? String(month + 12).padStart(2, "0") : String(month).padStart(2, "0");
      let thisYear = month == 0 ? year - 1 : year;
      td.parentElement.setAttribute("data-wholedate", `${thisYear}-${thisMonth}-${day}`);
      td.style.opacity = ".4";
      num++;
      i++;
    } else if(i == firstDay){
      num = 1;
      td.innerText = num;
      let day = String(num).padStart(2, "0");
      let thisMonth = String(month + 1).padStart(2, "0");
      td.parentElement.setAttribute("data-wholedate", `${year}-${thisMonth}-${day}`);
      td.style.opacity = "1";
      num++;
      i++;
    } else if((i > firstDay && i < (firstDay + last)) && (num > 1 && num <= last)){
      td.innerText = num;
      let day = String(num).padStart(2, "0");
      let thisMonth = String(month + 1).padStart(2, "0");
      td.parentElement.setAttribute("data-wholedate", `${year}-${thisMonth}-${day}`);
      td.style.opacity = "1";
      num++;
      i++;
    } else if(i == (firstDay + last)){
      num = 1;
      td.innerText = num;
      let day = String(num).padStart(2, "0");
      let thisMonth = month == 11 ? String(month - 10).padStart(2, "0") : String(month + 2).padStart(2, "0");
      let thisYear = month == 11 ? year + 1 : year;
      td.parentElement.setAttribute("data-wholedate", `${thisYear}-${thisMonth}-${day}`);
      td.style.opacity = ".4";
      num++;
      i++;
    }else if(i > (firstDay + last)){
      td.innerText = num;
      let day = String(num).padStart(2, "0");
      let thisMonth = month == 11 ? String(month - 10).padStart(2, "0") : String(month + 2).padStart(2, "0");
      let thisYear = month == 11 ? year + 1 : year;
      td.parentElement.setAttribute("data-wholedate", `${thisYear}-${thisMonth}-${day}`);
      td.style.opacity = ".4";
      num++;
      i++;
    };
    
    if(td.parentElement.dataset.wholedate == getTodayDateString()){
      td.classList.add("heresToday");
      document.querySelectorAll(".backToMonthlyTodayBtn").forEach(btn => {
        btn.classList.add("displayNone");
      });
    };
    td.addEventListener("click", () => {
      document.querySelectorAll(".circle").forEach(circle => {
        circle.parentElement.classList.remove("selectedKase");
        circle.parentElement.querySelector(".addEvent").classList.add("displayNone");
      });
      td.parentElement.classList.add("selectedKase");
      td.parentElement.querySelector(".addEvent").classList.remove("displayNone");
    });
  });
  // document.querySelectorAll(".addEvent").forEach(plus => {
  //   plus.addEventListener("click", () => {
      
  //   });
  // });
  let monthlyFirst = document.querySelector("#monthlyFirst").dataset.wholedate;
  let monthlyLast = document.querySelector("#monthlyLast").dataset.wholedate;
  putShowsInMonth(monthlyFirst, monthlyLast);
};

function updateMonth(){
  document.querySelectorAll(".circle").forEach(circle => {
    circle.parentElement.classList.remove("selectedKase");
    circle.parentElement.querySelector(".addEvent").classList.add("displayNone");
    // if(circle.parentElement.dataset.wholedate == getTodayDateString()){
    //   circle.classList.add("heresToday");
    //   document.querySelectorAll(".backToTodayBtn").forEach(btn => {
    //     btn.classList.add("displayNone");
    //   });
    // }; Les dates restent les mêmes!!! donc pas besoin de vérifier heresToday ni les backToTodayBtn!!!
  });
  document.querySelectorAll(".eventDiv").forEach(div => {
    div.remove();
  });
  let monthlyFirst = document.querySelector("#monthlyFirst").dataset.wholedate;
  let monthlyLast = document.querySelector("#monthlyLast").dataset.wholedate;

  putShowsInMonth(monthlyFirst, monthlyLast);
};

// MARK: WEEKLY CALENDAR

function putDatesInWeek(date){
  let arrayDate = [];
  for(let d = 0; d < 8; d++){
    let thisDate = {
      date: String(date.getDate()),
      full: getStringFromDate(date) //maybe also get one with myTomorrow dateTime so that we can make sure the events between 00:00 and myTomorrow are in the right week/col
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
  if(mySettings.myTomorrow !== "00:00"){
    let a = 1;
    let d = 1;
    document.querySelectorAll(".weeklyAfterDateSpan").forEach(span => {
      span.innerHTML = `${mySettings.myWeeksDayArray[d].letter} ${arrayDate[a].date}`;
      span.parentElement.setAttribute("data-date", arrayDate[a].full);
      a++;
      d = d < 6 ? d + 1 : d = 0;
    });
  };
  let todayAreaDiv = document.querySelector(".todayArea");
  if(todayAreaDiv){
    todayAreaDiv.remove();
    document.querySelector(".nowArea").remove();
  };
  let today = getTodayDateString();
  let dayIdx = meseDayICalc(today);
  const test = arrayDate.some(el => (el.full == today));
  if(test){   
    let current = new Date();
    let currentHour = current.getHours();
    let currentMinute = current.getMinutes();
    let currentTime = roundFifteenArea(currentHour, currentMinute);
    let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
    let todayDay = `${mySettings.myWeeksDayArray[idx].code}`;
    let todayArea;
    let nowArea;
    if(today == arrayDate[arrayDate.length - 1].full){
      todayArea = `<div class="todayArea" style="grid-row: row-00-00 / row-end; grid-column: col-${mySettings.myWeeksDayArray[mySettings.myWeeksDayArray.length - 1].code};"></div>`;
      nowArea = `<div class="nowArea" style="grid-row: row-${currentTime}; grid-column: col-${mySettings.myWeeksDayArray[mySettings.myWeeksDayArray.length - 1].code};"></div>`;
    } else{
      todayArea = `<div class="todayArea" style="grid-row: row-Day / row-end; grid-column: col-${todayDay};"></div>`;
      nowArea = `<div class="nowArea" style="grid-row: row-${currentTime}; grid-column: col-${todayDay};"></div>`;
    };    
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", todayArea);
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", nowArea);
    document.querySelectorAll(".backToWeeklyTodayBtn").forEach(btn => {
      btn.classList.add("displayNone");
    });
  } else{
    document.querySelectorAll(".backToWeeklyTodayBtn").forEach(btn => {
      btn.classList.remove("displayNone");
    });
  };
  updateSleepAreas();

  let Dday = arrayDate[0].full; 
  let Sday = arrayDate[arrayDate.length - 2].full;//maybe use the one with myTomorrow dateTime so that we can make sure the events between 00:00 and myTomorrow are in the right week/col
  let Ddate = getDateFromString(Dday);
  let Sdate = getDateFromString(Sday);
  let DYear = Ddate.getFullYear();
  let SYear = Sdate.getFullYear();
  let DMonthName = Ddate.toLocaleString('it-IT', { month: 'long' }).toLocaleUpperCase();
  let SMonthName = Sdate.toLocaleString('it-IT', { month: 'long' }).toLocaleUpperCase();
  document.querySelector("#weeklyYearSpan").innerHTML = `${DYear}${DYear !== SYear ? ` / ${SYear}` : ``}`;
  document.querySelector("#weeklyMonthSpan").innerHTML = `${DMonthName}${DMonthName !== SMonthName ? ` / ${SMonthName}` : ``}`;
  putShowsInWeek(Dday, Sday);
};

function roundFifteenTime(realTime){ //if realTime < myTomorrow && finalTime == myTomorrow then return "end"
  //console.log(realTime);
  let min = Number(realTime.substring(3));
  let hour = Number(realTime.substring(0, 2));
  if(min > 0 && min <= 7 ){
    min = 0;
  } else if(min >= 8 && min <= 22){
    min = 15;
  } else if(min >= 23 && min <= 37){
    min = 30;
  } else if(min >= 38 && min <= 52){
    min = 45;
  } else if(min >= 53 && min <= 59){
    min = 0;
    hour = hour <= 23 ? hour + 1 : 0;
  } else{
    min = min;
  };
  return `${String(hour).padStart(2, "0")}-${String(min).padStart(2, "0")}`;
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

function updateSleepAreas(){
  document.querySelectorAll(".sleepArea").forEach(we => {
    we.remove();
  });
  if(mySettings.mySleepZones == true){
    let myDay = Number(mySettings.myTomorrow.substring(0, 2));
    let sleepAreas = mySettings.myWeeksDayArray.map((clock) => {
      return `<div class="sleepArea" style="grid-area: row-${String(myDay).padStart(2, "0")}-00 / col-${clock.code} / row-${clock.clockIn.replace(":", "-")} / col-${clock.code}"></div>
      <div class="sleepArea" style="grid-area: row-${clock.clockOut.replace(":", "-")} / col-${clock.code} / row-end / col-${clock.code}"></div>`;
    }).join("");
    document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", sleepAreas);
  };
};

function backToWeeklyToday(){
  document.querySelectorAll(".backToWeeklyTodayBtn").forEach(btn => {
    btn.classList.add("displayNone");
  });
  eraseWeek();
  let date = new Date();
  let dayIdx = date.getDay();
  let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
  date.setDate(date.getDate() - idx);
  putDatesInWeek(date);
};
window.backToWeeklyToday = backToWeeklyToday;

function putShowsInWeek(Dday, Sday){
  // let shows = listTasks.filter((todo) => ((todo.term == "showThing" || todo.term == "reminder") && todo.line !== "noDay")); //on enlève "noDay" ou on aurait pu enlever todo.stock == true
  let shows = listTasks.filter((todo) => (todo.line !== "noDay" && ((todo.startTime && todo.stopTime && todo.startTime !== todo.stopTime) && todo.term !== "nevermind" || todo.term == "reminder" || todo.term == "showThing"))); //on enlève "noDay" ou on aurait pu enlever todo.stock == true
  shows.map(show => { //WATCH OUT: if between 00:00 and myTomorrow, it would be yesterday's date so maybe not that week!!
    if(show.line == "recurringDay"){ 
      show.recurryDates.map(recurryDate => {
        if(Dday <= recurryDate && recurryDate <= Sday){//takes only the ones that should show up this week
          let recurry = getWholeRecurry(show, recurryDate, show.id);
          createWeeklyshow(recurry);
        };
      })
    } else if(Dday <= show.startDate && show.startDate <= Sday){//takes only the ones that should show up this week
      createWeeklyshow(show);
    };
  });
  let filteredDonedShows = listDones.filter((done) => (Dday <= done.date && done.date <= Sday));
  filteredDonedShows.forEach(done => {
    done.list.forEach(doned => {
      if(doned.term == "showThing"){
        //doned.startDate = done.date;
        doned.past = true;
        //console.log(doned);
        createWeeklyshow(doned);
      };// if the show has been marked doned at an other date, that makes it weird... that's why we should separate the date and the doneDate. and, anyway, the pastEvent should be past, based on the date and not on whether they've been done or not. But for the task, you'll want the doneDate 
    });
  });
};

function timeMath(one, math, two){
  let date = new Date();
  let oneH = one.substring(0, 2);
  let oneM = one.substring(3);
  date.setHours(oneH);
  date.setMinutes(oneM);
  let twoH = Number(two.substring(0, 2));
  let twoM = Number(two.substring(3));
  if(math == "minus"){
    date.setHours(date.getHours() - twoH);
    date.setMinutes(date.getMinutes() - twoM);
  } else if(math == "plus"){    
    date.setHours(date.getHours() + twoH);
    date.setMinutes(date.getMinutes() + twoM);
  };
  return `${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}`;
};

function createWeeklyshow(show){
  //console.log(show);
  let dayIdx = meseDayICalc(show.startDate); //if between 00:00 and myTomorrow, it should be yesterday's date!
  let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
  let day = `${mySettings.myWeeksDayArray[idx].code}`;  
  let div;
  let add;
  if(show.tutto || !show.startTime || show.startTime == ""){
    //console.log(show.task);
    div = document.querySelector(`[data-tutto="${day}"]`);
    add = `<div data-id="${show.id}" data-date="${show.startDate}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${show.term == "showThing" ? `data-showType="${show.showType}"` : ``} onclick="toTIdeCWaM(this); event.stopPropagation();" class="weeklyEvent ${show.past ? "pastEvent" : ""}" style="${show.term == "showThing" ? `background-color:${show.STColorBG}; color:${show.STColorTX};` : show.term == "reminder" ? `color:${mySettings.myBaseColors[show.color].colorBG}; border:none; border-radius: 0;` : `color:${mySettings.myBaseColors[show.color].colorBG}; border-color:${mySettings.myBaseColors[show.color].colorBG};`}">${show.info ? `*` : ``}<span ${show.miniList ? `style="text-decoration:underline;"` : ``}>${show.task}</span> <i class="IconI ${show.icon}"></i>
  </div>`; //add underline if miniList
  //if it's done (past), the onclick="toTIdeCWaM(this) won't work because it's not in listTasks anymore... do we want to be able to modify done ones? If so, we'll need to have a function to get the done in the listDones... and modify it there...
  } else{
    let primaDiv = ``;
    let dopoDiv = ``;
    let duration = timeMath(roundFifteenTime(show.stopTime), "minus", roundFifteenTime(show.startTime));
    function getSizeClass(duration){
      switch(true){
        case (duration < "01-00"):
          return "sizeClass7";
        case (duration >= "01-00" && duration <= "02-00"):
          return "sizeClass10";
        case (duration > "02-00"):
          return "sizeClass12";
        default:
          console.log("oups!");
          break;
      };
    };
    let sizeClass = getSizeClass(duration);
    div = document.querySelector(".weeklyContainer");
    if(show.prima && show.prima !== "00:00"){
      primaDiv = `<div class="weeklyBuffer ${show.past ? "pastEvent" : ""}" style="grid-column:col-${day}; grid-row:row-${timeMath(roundFifteenTime(show.startTime), "minus", show.prima)}/row-${roundFifteenTime(show.startTime)};"></div>`;
    };
    if(show.dopo && show.dopo !== "00:00"){
      dopoDiv = `<div class="weeklyBuffer ${show.past ? "pastEvent" : ""}" style="grid-column:col-${day}; grid-row:row-${roundFifteenTime(show.stopTime)}/row-${timeMath(show.stopTime ? roundFifteenTime(show.stopTime) : "end", "plus", roundFifteenTime(show.dopo))};"></div>`;
    };
    add = `
    ${primaDiv}
    <div data-id="${show.id}" data-date="${show.startDate}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${show.term == "showThing" ? `data-showType="${show.showType}"` : ``} onclick="toTIdeCWaM(this); event.stopPropagation();" class="weeklyEvent ${sizeClass} ${show.past ? "pastEvent" : ""}" style="${show.term == "showThing" ? `background-color:${show.STColorBG}; color:${show.STColorTX};` : show.term == "reminder" ? `color:${mySettings.myBaseColors[show.color].colorBG}; border:none; border-radius: 0;` : `color:${mySettings.myBaseColors[show.color].colorBG}; border-color:${mySettings.myBaseColors[show.color].colorBG};`}  grid-column:col-${day}; grid-row:row-${roundFifteenTime(show.startTime)}${show.term == "reminder" ? `` : `/row-${roundFifteenTime(show.stopTime)}`};">
    ${show.info ? `*` : ``}<span ${show.miniList ? `style="text-decoration:underline;"` : ``}>${show.task}</span><br />
      <i class="IconI ${show.icon}"></i>
    </div>
    ${dopoDiv}
    `; //if it's done (past), the onclick="toTIdeCWaM(this) won't work because it's not in listTasks anymore... do we want to be able to modify done ones? If so, we'll need to have a function to get the done in the listDones... and modify it there...
  };
  
  div.insertAdjacentHTML("beforeend", add);
};

function getWeeklyFilter(){
  console.log("weeklyFilter");
  let view = 0;
  let myShows;
  if(mySettings.myShowTypes.length > 0){
    myShows = mySettings.myShowTypes.map((myShowType) => {
      return `<li class="showTypeLabelDiv" id="div${myShowType.name}">
        <input class="showInput" type="checkbox" name="showOptions" id="${myShowType.name}Show" value="${myShowType.name}" ${myShowType.views[view] == true ? "checked" : ""} />
        <label for="${myShowType.name}Show" class="showLi showTypeLabel" style="background-color:${myShowType.colorBG};color:${myShowType.colorTX};">${myShowType.name}<i class="typcn typcn-tick showTick"></i></label>
      </li>`; //colorsList[myShowType.color].colorTX
    }).join("");
  } else{
    myShows = `<h6>pssst... You've got no types of show... yet</h6>`;
  };
  
  document.body.insertAdjacentHTML("beforeend", `<div id="weeklyFilter" class="taskInfoClass">
    <span id="exitXweeklyFilter" class="exitX">x</span>
    <h2>Pick your landscape</h2>
    <h4 style="font-weight: 500;">What kinda stuff do you wanna see here?</h4>
    <hr style="margin-top: 0;"/>
    <ul id="weeklyFilterList">
      ${myShows}
      <li class="showTypeLabelDiv" id="divTasks">
        <input class="showInput" type="checkbox" name="showOptions" id="tasks" value="tasks" />
        <label for="tasks" class="showLi showTypeLabel" style="background-color:var(--bg-color);color:var(--tx-color);">all the timed tasks<i class="typcn typcn-tick showTick"></i></label>
      </li>
    </ul>
    <button id="weeklyFilterBtn" class="ScreenBtn1">Let's see...</button>
  </div>`);
  let weeklyFilter = document.querySelector("#weeklyFilter");
  weeklyFilter.querySelector("#exitXweeklyFilter").addEventListener("click", () => {
    weeklyFilter.remove();
  });
  weeklyFilter.querySelector("#weeklyFilterBtn").addEventListener("click", () => {
    weeklyFilter.querySelectorAll('input[name="showOptions"]').forEach(box => {
      //mySettings.myShowTypes.name
    });
    weeklyFilter.remove();
  });
};
window.getWeeklyFilter = getWeeklyFilter;

function getWeeklyCalendar(){
  let weeklyDate = new Date();
  let year = weeklyDate.getFullYear();
  let monthName = weeklyDate.toLocaleString('it-IT', { month: 'long' }).toLocaleUpperCase();
  let arrayItem = [];
  let rowYear = `<div class="weeklyItem weeklyTitle weeklyTitleWBtns">
    <button class="weeklyBtn" id="weekBackward">
      <i class="fa-solid fa-caret-left" style="font-size:30px;"></i>
    </button>
    <button class="weeklyBtn backToWeeklyTodayBtn displayNone" onclick="backToWeeklyToday()">
      <i class="fa-solid fa-calendar-day" style="font-size:16px;"></i>
    </button>
    <span id="weeklyYearSpan" style="flex-grow: 1;">${year}</span>
    <button class="weeklyBtn backToWeeklyTodayBtn displayNone" onclick="backToWeeklyToday()">
      <i class="fa-solid fa-calendar-day" style="font-size:16px;"></i>
    </button>
    <button class="weeklyBtn" id="weekForward">
      <i class="fa-solid fa-caret-right" style="font-size:30px;"></i>
    </button>
  </div>`;
  let rowMonth = `<div class="weeklyItem weeklyTitle weeklyMonthTitle"><span id="weeklyMonthSpan">${monthName}</span></div>`;
  arrayItem.push(rowYear, rowMonth);
  let myDay = Number(mySettings.myTomorrow.substring(0, 2));
  let numberH;
  let arrayOfRowNames = [];
  if(mySettings.mySleepZones == false){
    let arrayOfTimes = [];
    for(let h = 0; h < 24; h++){ //93
      arrayOfTimes.push(myDay);
      myDay == 23 ? myDay = 0 : myDay++;
    };
    let clockOuts = mySettings.myWeeksDayArray.sort((d1, d2) => (arrayOfTimes.indexOf(Number(d1.clockOut.substring(0, 2))) < arrayOfTimes.indexOf(Number(d2.clockOut.substring(0, 2)))) ? -1 : (arrayOfTimes.indexOf(Number(d1.clockOut.substring(0, 2))) > arrayOfTimes.indexOf(Number(d2.clockOut.substring(0, 2)))) ? 1 : 0);
    let clockIns = mySettings.myWeeksDayArray.sort((d1, d2) => (arrayOfTimes.indexOf(Number(d1.clockIn.substring(0, 2))) < arrayOfTimes.indexOf(Number(d2.clockIn.substring(0, 2)))) ? -1 : (arrayOfTimes.indexOf(Number(d1.clockIn.substring(0, 2))) > arrayOfTimes.indexOf(Number(d2.clockIn.substring(0, 2)))) ? 1 : 0);
    let firstClockInIdx = arrayOfTimes.indexOf(Number(clockIns[0].clockIn.substring(0, 2)));
    let lastClockOutIdx = arrayOfTimes.indexOf(Number(clockOuts[clockOuts.length-1].clockOut.substring(0, 2)));
    myDay = Number(clockIns[0].clockIn.substring(0, 2));
    numberH = lastClockOutIdx - firstClockInIdx; 
    // creation of arrayOfRowNames
    for(let i = firstClockInIdx; i < lastClockOutIdx; i++){
      let time = String(arrayOfTimes[i]).padStart(2, "0");
      let row00 = `row-${time}-00`; //${i == firstClockInIdx ? ` row-tutto-end` : ``}
      let row15 = `row-${time}-15`;
      let row30 = `row-${time}-30`;
      let row45 = `row-${time}-45`;
      arrayOfRowNames.push(row00, row15, row30, row45);
    };
    arrayOfRowNames.push("row-end");
    //console.log(arrayOfRowNames);
    
  } else{
    //myDay = Number(mySettings.myTomorrow.substring(0, 2));
    numberH = 24;
    // creation of arrayOfRowNames
    for(let h = 0; h < numberH; h++){ //93
      let time = String(myDay).padStart(2, "0");
      let rowH = `row-${time}-00`; //${h == 0 ? ` row-tutto-end` : ``}
      let rowH15 = `row-${time}-15`;
      let rowH30 = `row-${time}-30`;
      let rowH45 = `row-${time}-45`;
      arrayOfRowNames.push(rowH, rowH15, rowH30, rowH45);
      myDay == 23 ? myDay = 0 : myDay++;
    };
    arrayOfRowNames.push("row-end");
  };
  let numberR = numberH + 1;
  for(let c = 1; c < 9; c++){
    let arrayC = [];
    let rowDay = `<div ${c == 2 ? `id="Dday"` : c == 8 ? `id="Sday"` : ``} class="weeklyItem ${c == 1 ? `weeklyDaysRowFilter` : `weeklyDaysRow" style="grid-column:${c};`}"${c > 1 ? ` data-code="${mySettings.myWeeksDayArray[c - 2].code}">${mySettings.myWeeksDayArray[c - 2].letter}<br /><span class="weeklyDateSpan"></span>` : `><button onclick="getWeeklyFilter()" class="displayNone"><i class="fa-solid fa-filter"></i></button>`}</div>`; //shall we add the date as an id, as a data-date or as an area?
    let rowTutto = `<div class="weeklyItem weeklyTutto" ${c > 1 ? `onclick="toTIdeCWaN(this)"` : ``} ${c > 1 ? `data-tutto="${mySettings.myWeeksDayArray[c - 2].code}"` : ``} style="grid-column:${c}; grid-row:row-tutto; border-bottom: 1px solid rgba(47, 79, 79, .5);"></div>`;
    arrayC.push(rowDay);
    arrayC.push(rowTutto);
    let line = 0;
    let myDayHere = myDay;
    for(let r = 1; r < numberR; r++){
      let item = `<div class="weeklyItem" ${c > 1 ? `onclick="toTIdeCWaN(this)"` : ``} style="grid-column:${c}; grid-row:${arrayOfRowNames[line]} / ${arrayOfRowNames[line + 4]};${c == 1 ? " border-radius:2px 0 0 2px; border-right:1px solid rgba(47, 79, 79, .5);" : ""} ${myDayHere == 23 ? " border-bottom:2px solid rgba(47, 79, 79, .8);" : ""}">${c == 1 ? `${String(myDayHere).padStart(2, "0")}:00` : ``}${mySettings.myTomorrow !== "00:00" && myDayHere == 0 && c > 1 ? `<span class="weeklyAfterDateSpan"></span>` : ``}</div>`;
      arrayC.push(item);
      line += 4;
      myDayHere == 23 ? myDayHere = 0 : myDayHere++;
    };
    let arrayCs = arrayC.join("");
    arrayItem.push(arrayCs);
  };
  let nomiCols = mySettings.myWeeksDayArray.map((giorno, idx) => {
    if(idx == 0){
      return `[col-Hour] 45px [col-${giorno.code}] 1fr`;
    } else if(idx !== mySettings.myWeeksDayArray.length - 1){
      return `[col-${giorno.code}] 1fr`;
    } else{
      return `[col-${giorno.code}] 1fr [col-end]`;
    };
  }).join(" ");
  let nomiRows = arrayOfRowNames.map((row, idx) => {
    if(idx == 0){
      return `[row-Year] 1fr [row-Month] 1fr [row-Day] 1.5fr [row-tutto] 1fr [${row}] minmax(0, .25fr)`;
    } else if(idx !== arrayOfRowNames.length - 1){
      return `[${row}] minmax(0, .25fr)`;
    } else{
      return `[row-end]`;
    };
  }).join(" ");

  let container = document.querySelector(".weeklyContainer");
  container.style.gridTemplateRows = nomiRows;
  container.style.gridTemplateColumns = nomiCols;
  
  //arrayItem.push(todayArea);
  let arrayItems = arrayItem.join("");
  container.innerHTML = arrayItems;

  let date = new Date();
  let dayIdx = date.getDay();
  let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
  date.setDate(date.getDate() - idx);
  putDatesInWeek(date);
  
  document.querySelector("#weekBackward").addEventListener("click", () => {
    eraseWeek();
    let Dday = document.querySelector("#Dday").dataset.date;
    let Ddate = getDateFromString(Dday);
    Ddate.setDate(Ddate.getDate() - 7);
    putDatesInWeek(Ddate);
  });
  document.querySelector("#weekForward").addEventListener("click", () => {
    eraseWeek();
    let Sday = document.querySelector("#Sday").dataset.date;
    let Sdate = getDateFromString(Sday);
    Sdate.setDate(Sdate.getDate() + 1);
    putDatesInWeek(Sdate);
  });
};

function eraseWeek(){
  document.querySelectorAll(".weeklyEvent").forEach(we => {
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


// window.onload = () => {
//   setTimeout(function() {
//     document.getElementById("loadingScreen").classList.replace("waitingScreen", "displayNone");
//   }, 500);
// };
// window.onload = () => {
//   document.getElementById("loadingScreen").classList.replace("waitingScreen", "displayNone");
// };


function busyZoneCreation(show){
  //console.log(show);
  let dayIdx = meseDayICalc(show.startDate);
  let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
  let code = `${mySettings.myWeeksDayArray[idx].code}`; 
  let day = `${mySettings.myWeeksDayArray[idx].day}`;  
  let start = show.startTime ? timeMath(roundFifteenTime(show.startTime), "minus", show.prima) : "11-00";
  start = start <= "11-00" ? "11-00" : start; // we should have a mySettings.myWeeksDayArray[idx].peopleClockIn instead of 11:00
  let startMinute = Number(start.substring(3));
  let startHour = Number(start.substring(0, 2));
  let end = show.stopTime ? timeMath(roundFifteenTime(show.stopTime), "plus", show.dopo) : "02-00";
  end = end < mySettings.myTomorrow.replace(":", "-") ? "end" : end;
  let endMinute = end == "end" ? 0 : Number(end.substring(3));
  let endHour = end == "end" ? 24 : Number(end.substring(0, 2)); // 24 => pour l'instant, parce que meetAlix's days end at 24:00
  let meal = (show.showType !== "Calia" && show.prima >= "03:00") ? true : false;
  
  let busy = {
    type: "once", //"sempre" if appears at each week, like sleep and meal
    date: show.startDate,
    col: code,
    day: day,
    start: start,
    startMinute: startMinute,
    startHour: startHour,
    end: end,
    endMinute: endMinute,
    endHour: endHour,
    meal: meal
  }; // then all we have to do is make sure the date is in that particular showing week and we add the div to the weekly! It should go straight in the right column and rows
  myBusies.push(busy);
};



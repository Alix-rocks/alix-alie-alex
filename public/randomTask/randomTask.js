/** When you commit/push a big changes:
 * Run the code in the sandbox first to make the changes thanks to lines (in getTaskSettings AND in getDones), then upload the changes to firestore, then remove these lines (in getTaskSettings AND in getDones), THEN commit and push
**/

/* KEYBOARD SHORTCUTS
  Shift + Alt + A => Block Comment
  Ctrl + K ... Ctrl + 1 => Fold all the first levels
*/

import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, signOut, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { app, analytics, db, auth, provider } from "../myFirebase.js";
import trans from "../trans.js";
auth.languageCode = 'fr';

const cloudIt = document.querySelector("#cloudIt");
const earthIt = document.querySelector("#earthIt");

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
  signInWithRedirect(auth, provider);
};
let userConnected = false;
onAuthStateChanged(auth,(user) => {
  if(user){
    userConnected = true;
    console.log(user);
    logInScreen.classList.add("displayNone");
    getCloudBC();
    getTasksSettings();
    getDones();
    settingsPage();
    //getMines();
    // createBody();
    // getWeeklyCalendar();
  } else{
    userConnected = false;
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




// *** START
let searchSwitch = false;
let projectSwitch = false;
//let myList = [];
// let myDones2023 = [];
// let myDones202401 = [];
// let myDones202402 = [];
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
let mySections = [
  {
    title: "CURRENT PROJECTS",
    slogan: "Let's stick to those for now please...",
    nickname: "currentProject",
    color: "#600061"
  }, {
    title: "NEXT",
    slogan: "Soon, soon it'll be your turn...",
    nickname: "nextThing",
    color: "darkgreen"
  }, {
    title: "WHENEVER",
    slogan: "The never ending list...",
    color: "midnightblue",
    subsection: [
      {
        name: "The long term shit",
        nickname: "longTerm",
      }, {
        name: "The one time thingies",
        nickname: "oneTime",
      }
    ],
    addOn: `<button id="shuffleBtn">Shuffle it!</button>
    <h5 class="sousBtn">Tell me what to do!</h5>`
  }, {
    title: "ALWAYS",
    slogan: "Forever and ever...",
    nickname: "alwaysHere",
    color: "goldenrod"
  }, {
    title: "WAITING",
    slogan: "Wait for it...",
    nickname: "waitForIt",
    color: "rgb(100, 122, 122)"
  }, {
    title: "THINKING",
    slogan: "Thinking about it...",
    nickname: "thinkBoutIt",
    color: "rgb(100, 122, 122)"
  }, {
    title: "Random Ideas",
    slogan: "It's a <em>maybe-one-day-probably-never</em> kinda thing...",
    nickname: "crazyShit",
    color: "rgb(239, 125, 144)"
  }
];
//localStorage.mySettings = JSON.stringify(mySettings);
let cBC;
// let colorsText = [];
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
let icons = ["fa-solid fa-comments", "fa-solid fa-lightbulb", "fa-solid fa-dollar-sign", "fa-solid fa-spider", "fa-solid fa-gavel", "fa-solid fa-couch", "fa-solid fa-head-side-virus", "fa-solid fa-screwdriver-wrench", "fa-solid fa-universal-access", "fa-solid fa-droplet", "fa-solid fa-code", "fa-solid fa-poo", "fa-solid fa-globe", "fa-solid fa-briefcase", "fa-solid fa-brain", "fa-solid fa-champagne-glasses", "fa-solid fa-seedling", "fa-solid fa-utensils", "fa-solid fa-heart-pulse", "fa-solid fa-sun", "fa-solid fa-broom", "fa-solid fa-people-group", "fa-solid fa-bullhorn", "fa-solid fa-magnifying-glass", "fa-solid fa-heart", "fa-solid fa-cake-candles", "fa-regular fa-hourglass-half", "fa-solid fa-road", "fa-solid fa-envelopes-bulk", "fa-solid fa-person-chalkboard", "fa-regular fa-face-grin-stars", "fa-regular fa-face-grin-hearts", "fa-regular fa-face-grin-squint", "fa-regular fa-face-smile-wink", "fa-regular fa-face-meh-blank", "fa-regular fa-face-flushed", "fa-regular fa-face-grimace", "fa-regular fa-face-rolling-eyes", "fa-regular fa-face-grin-beam-sweat", "fa-regular fa-face-surprise", "fa-regular fa-face-frown-open", "fa-regular fa-face-frown", "fa-regular fa-face-sad-tear", "fa-regular fa-face-tired", "fa-regular fa-face-sad-cry", "fa-regular fa-face-dizzy", "fa-regular fa-face-angry", "fa-solid fa-ban noIcon"];

(() => {
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
  document.getElementById("iconsPalet").innerHTML = iconsAll;
})();


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
      cloudIt.className = `${wantedPage.dataset.cloudit}`;
      earthIt.className = `${wantedPage.dataset.cloudit}`;
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

// (() => {
//   document.querySelectorAll('input[name="switchPageRadios"]').forEach(radio => {
//     radio.addEventListener("change", () => {
//       document.querySelectorAll(".onePage").forEach(page => {
//         page.classList.add("displayNone");
//       });
//       radio.nextElementSibling.classList.remove("displayNone");
//       document.querySelectorAll('input[name="switchPageRadios"]').forEach(radio => {
//         radio.labels.forEach(label => {
//           label.classList.replace("whiteOnPurple", "purpleOnWhite");
//         });
//       });
//       radio.labels.forEach(label => {
//         label.classList.replace("purpleOnWhite", "whiteOnPurple");
//       });
//     });
//   });
// })();

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

let lastUpdateLocalStorage = "";
let lastUpdateFireStore = "";

// MARK: getTasksSettings
let hierOggiTime;
let oggiDemainTime;
async function getTasksSettings() {
  const getTasks = await getDoc(doc(db, "randomTask", auth.currentUser.email));
  //lastUpdate
  if(localStorage.getItem("lastUpdateLocalStorage")){
    lastUpdateLocalStorage = localStorage.lastUpdateLocalStorage;
  };
  if(getTasks.exists() && getTasks.data().lastUpdateFireStore){
    lastUpdateFireStore = getTasks.data().lastUpdateFireStore;
  };
  if((lastUpdateLocalStorage !== "" && lastUpdateFireStore !== "" && lastUpdateLocalStorage < lastUpdateFireStore) || lastUpdateLocalStorage == ""){
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

  // if(getTasks.exists() && getTasks.data().mySettings.myShowTypes){
  //   mySettings.myShowTypes = getTasks.data().mySettings.myShowTypes;
  //   localStorage.mySettings = JSON.stringify(mySettings);
  // };

  if(!mySettings.myBaseColors){
    mySettings.myBaseColors = baseColors;
    localStorage.mySettings = JSON.stringify(mySettings);
  };

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
  document.getElementById("colorPalet").innerHTML = colors;
  //Inserion de la date d'aujourd'hui
  document.getElementById("todaysDateSpan").innerHTML = getTodayDateString();
  document.getElementById("todaysDaySpan").innerHTML = getDayNameFromString(getTodayDateString());
  //firstPage favorite view
  document.getElementById(mySettings.myFavoriteView).checked = true;
  document.getElementById(mySettings.myFavoriteView).dispatchEvent(pageEvent);
  //light or dark mode
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
    if(todo.date){
      todo.startDate = todo.date;
      todo.stopDate = todo.date;
      delete todo.date;
    };
    if(todo.dalle){
      todo.startTime = todo.dalle;
      delete todo.dalle;
      //delete todo.dalleRow;
    };
    if(todo.alle){
      todo.stopTime = todo.alle;
      delete todo.alle;
      //delete todo.alleRow;
    };

//other modifications...
    // if(todo.line == "doneDay"){
    //   todo.deadline = todo.date;
    //   todo.line = "noDay";
    //   delete todo.date;
    // };
    // if(todo.line !== "recurringDay"){
      // todo.status = "todo";
      // myList.push(todo);
    // };

    //Change all the todo.recurry in todo.recurryDates
    // if(todo.line == "recurringDay"){
    //   //console.log(todo);
    //   todo.recurryDates = todo.recurrys.map(recurry => {
    //     return recurry.date;
    //   });
    //   delete todo.recurrys;
    //   delete todo.listDates;
    //   //console.log(todo.recurryDates.length);
    // };

    //Recalculate all the recurryDates
    // if(todo.line == "recurringDay"){
    //   let date = getDateFromString(todo.dal);
    //   sendRecurringBackToGetRecurryDates(todo, date);
    // };
    
    delete todo.storedId;
    delete todo.stored;
    delete todo.stockId;
    
    if(!todo.pPosition || (todo.pPosition && todo.pPosition == "out")){
      //change all the todo.color for the index value in baseColors
      // let idxColor = mySettings.myBaseColors.findIndex(color => color.colorBG == todo.color);
      // todo.color = String(idxColor);
      // if(todo.line == "recurringDay"){
      //   todo.recurrys.forEach(recurry => {
      //     recurry.color = String(idxColor);
      //   });
      // };
      // if(todo.miniList && todo.miniList.length > 0){
      //   todo.miniList.forEach(mini => {
      //     let idxMiniColor = mySettings.myBaseColors.findIndex(color => color.colorBG == mini.color);
      //     mini.color = idxMiniColor == -1 ? 0 : String(idxMiniColor);
      //   });
      // };
      // if(todo.urge){
      //   todo.term = "topPriority";
      // };

      

      todoCreation(todo);
    };
  });
  //localStorage.myList = JSON.stringify(myList);
  localStorage.listTasks = JSON.stringify(listTasks);
  //localStorage.myBusies = JSON.stringify(myBusies);
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


async function getDones(){
  const getDones = await getDocs(collection(db, "randomTask", auth.currentUser.email, "myListDones"));
  if(localStorage.getItem("listDones")){
    listDones = JSON.parse(localStorage.listDones);
  } else if(getDones){
    getDones.forEach((donedDate) => {
      // let theDate = donedDate.id;
      // donedDate.data().dones.forEach(done => {
      //   let idxColor = mySettings.myBaseColors.findIndex(color => color.colorBG == done.color);
      //   done.color = String(idxColor);
      //   done.doneDate = theDate;
      //   done.status = "done";
      //   if(theDate < "2024-01-01"){
      //     myDones2023.push(done);
      //   } else if(theDate >= "2024-01-01" && theDate <= "2024-01-31"){
      //     myDones202401.push(done);
      //   } else if(theDate >= "2024-02-01" && theDate <= "2024-02-29"){
      //     myDones202402.push(done);
      //   } else{
      //     myList.push(done);
      //   };
        
      // });
      let mydate = donedDate.id;
      let mylist = donedDate.data().dones;
      listDones.push({date: mydate, list: mylist});
    });//listDones.push({...donedDate.data().dones, date: mydate});
    // console.log(myList);
    // localStorage.myDones2023 = JSON.stringify(myDones2023);
    // localStorage.myDones202401 = JSON.stringify(myDones202401);
    // localStorage.myDones202402 = JSON.stringify(myDones202402);
    // localStorage.myList = JSON.stringify(myList);
    // let myListJSON = JSON.stringify(myList);
    // console.log(myListJSON.length * 8);
    localStorageDones("first");
  };
  let sortedListDones = listDones.sort((d1, d2) => (d1.date > d2.date) ? 1 : (d1.date < d2.date) ? -1 : 0);
  sortedListDones.forEach(doned => {
    if (doned.list.length !== 0) {
      let donedDate = doned.date;
      donedDateCreation(donedDate);
      doned.list.forEach(tidoned => {
        if(tidoned.color && tidoned.color.length > 2){
          let idxColor = mySettings.myBaseColors.findIndex(color => color.colorBG == tidoned.color);
          tidoned.color = String(idxColor);
        };
        
        donedCreation(donedDate, tidoned);
      });
    };
  });
  refreshDoneId();
  localStorageDones("first");
  createBody();
  getWeeklyCalendar();
};



function freeIn(){ 
  //mySettings
  if(localStorage.getItem("mySettings")){
    mySettings = JSON.parse(localStorage.mySettings);
  };
  if(!mySettings.myBaseColors){
    mySettings.myBaseColors = baseColors;
    localStorage.mySettings = JSON.stringify(mySettings);
  };
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
  document.getElementById("colorPalet").innerHTML = colors;
  //Inserion de la date d'aujourd'hui
  document.getElementById("todaysDateSpan").innerHTML = getTodayDateString();
  document.getElementById("todaysDaySpan").innerHTML = getDayNameFromString(getTodayDateString());
  //firstPage favorite view
  document.getElementById(mySettings.myFavoriteView).checked = true;
  document.getElementById(mySettings.myFavoriteView).dispatchEvent(pageEvent);
  //light or dark mode
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
  //labels
  if(mySettings.myLabels && mySettings.myLabels.length > 0){
    myLabelsGeneralChoice();
  };
  //listTasks
  if(localStorage.getItem("listTasks")){
    listTasks = JSON.parse(localStorage.listTasks);
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
      if(doned.list.length !== 0){
        let donedDate = doned.date;
        donedDateCreation(donedDate);
        doned.list.forEach(tidoned => {
          donedCreation(donedDate, tidoned);
        });
      };
    });
    refreshDoneId();
  };
  createBody();
  getWeeklyCalendar();
  logInScreen.classList.add("displayNone");
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
    if(todo.term == "showThing" && todo.line == "todoDay" && todo.showType !== "Cancelled"){
      busyZoneCreation(todo);
    } else if(todo.term == "showThing" && todo.line == "recurringDay"){
      todo.recurryDates.forEach(recurryDate => {
        let tempRecurry = {
          startDate: recurryDate,
          primaRow: todo.primaRow,
          dalleRow: todo.dalleRow,
          dopoRow: todo.dopoRow,
          alleRow: todo.alleRow,
          showType: todo.showType,
          showPrima: todo.showPrima //what the hell is that?!
        };
        busyZoneCreation(tempRecurry)
      });
    };
  });
  const docRefBusies = doc(db, "randomTask", auth.currentUser.email, "mySchedule", "myBusies");
  const docSnapBusies = await getDoc(docRefBusies);
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

  await batch.commit();
  localStorage.lastUpdateLocalStorage = nowStamp;
  resetCBC();
  resetModif();
};

cloudIt.addEventListener("click", saveToCloud);

// setInterval(() => {
//   if(cBC > 0){
//     saveToCloud();
//   };
// }, 60000); 

// document.addEventListener("visibilitychange", () => {
//   if (document.hidden) {

//   } else {
//     console.log("on synchronise!");
//     updateFromCloud();
//   };
// });

function updateFromCloud(){
  localStorage.clear();
  document.querySelectorAll("ul").forEach(ul => {
    ul.innerHTML = "";
  });
  listTasks = [];
  listDones = [];
  wheneverList = [];
  // myBusies = [];
  resetModif();
  resetCBC();
  getTasksSettings();
  getDones();
  createBody();
  getWeeklyCalendar();
  settingsPage();
  updateArrowsColor();
  //clearStorageBtn.textContent = "Updated!";
  earthIt.style.backgroundColor = "rgba(237, 20, 61, 0)";
  localStorage.lastUpdateLocalStorage = new Date().getTime();
};

async function cloudSaveSettings(){
  const docRef = doc(db, "randomTask", auth.currentUser.email);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()){
    await updateDoc(doc(db, "randomTask", auth.currentUser.email), {
      mySettings: mySettings
    });
  } else{
    await setDoc(doc(db, "randomTask", auth.currentUser.email), {
      mySettings: mySettings
    });
  };
};

function updateArrowsColor(){
  //update arrows color
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
    //let clearStorageBtn = document.querySelector("#clearStorageBtn");
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

    //clearStorageBtn.addEventListener("click", updateFromCloud);
    exitX.addEventListener("click", () => {
      //settingsScreen.classList.add("displayNone");
      document.getElementById(previousPage).checked = true;
      document.getElementById(previousPage).dispatchEvent(pageEvent);
    });
    cancelBtn.addEventListener("click", () => {
      // settingsScreen.classList.add("displayNone");
      // document.querySelector('input[name="switchPageRadios"]:checked').nextElementSibling.classList.remove("displayNone");
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
      // if(userConnected){
      //   cloudSaveSettings(); //or we just do a updateCBC(); and let the user save it with everything else
      // };
      // settingsScreen.classList.add("displayNone");
      // document.querySelector('input[name="switchPageRadios"]:checked').nextElementSibling.classList.remove("displayNone");
      updateCBC();
      document.getElementById(previousPage).checked = true;
      document.getElementById(previousPage).dispatchEvent(pageEvent);
    });
  };
// });

// *** SEARCH

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
      let resultTask = listTasks.filter(todo => todo.pPosition !== "in" && todo.task.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(searchTask.value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')));
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
      resultDate = listTasks.filter(todo => todo.pPosition !== "in" && todo.startDate == searchDate.value || todo.line == "recurringDay");
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
      let resultShow = listTasks.filter(todo => todo.pPosition !== "in" && todo.term == "showThing" && todo.showType == searchShow.value);
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
      let resultTerm = listTasks.filter(todo => todo.pPosition !== "in" && todo.term == searchTerm.value);
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
      let resultTag = listTasks.filter(todo => todo.pPosition !== "in" && todo.color == searchTag.value);
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
    if(todo.deadline && todo.deadline !== todo.startDate){ // && todo.status == "todo"
      let modifiedDalle = todo.finoAlle ? todo.finoAlle.replace(":", "-") : "5-00";
      todoDeadlineTime = `${todo.deadline}-${modifiedDalle}`;
    };
    if(todo.startDate){ // && todo.status == "todo"
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



  

// MARK: CREATION

function getTodoFromLi(li) {
  let todo;
  if(li.dataset.rec && li.dataset.rec !== "undefined"){
    let recIndex = listTasks.findIndex(td => td.id == li.dataset.rec);
    let recurring = listTasks[recIndex];
    todo = getWholeRecurry(recurring, li.dataset.date, li.dataset.rec);
  } else{
    let todoIndex = listTasks.findIndex(todo => todo.id == li.id);
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
  // let recurry = JSON.parse(JSON.stringify(todo));
  // clearRecurringData(recurry);
  // recurry.id = crypto.randomUUID();
  // recurry.line = "todoDay";
  // recurry.date = recurryDate;
  // recurry.recurry = true;
  // recurry.recId = todo.id;
    
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
  let togoList;
  let numberedDays;
  let todayDate = getDateTimeFromString(getTodayDateString(), mySettings.myTomorrow);
  if(projectSwitch){
    togoList = "projectUl"; // s'assurer de tous les créer: todo "in" et "out" et term=="wholeProject" aussi!
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
  if(togoList !== ""){ //what happens if one is stock/stored AND recurring/recurry?
    if(document.getElementById(togoList)){  
      if(todo.stock){
        document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-term="${todo.term}" ${todo.startTime ? `data-time="${todo.startTime}"` : ``}" class="todoLi${todo.term == "showThing" ? todo.label ? ` showLiLabel` : ` showLi` : todo.term == "sameHabit" ? ` sameHabit` : todo.term == "reminder" ? ` reminder` : ``}" style="${todo.term == "showThing" ? `background-color: ${todo.STColorBG}; color: ${todo.STColorTX};` : ``}">
        ${todo.label ? `<div class="labelOnglet labelLiOnglet" style="background-color:${colorsList[todo.LColor].colorBG}; color:${colorsList[todo.LColor].colorTX};">${todo.LName}</div>` : `<div class="noLabel"></div>`}
        <i class="typcn typcn-trash" onclick="trashStockEvent(this)"></i><i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i><div class="textDiv"><span class="text" onclick="${searchSwitch ? `toTIdeSSaM(this)` : storageSwitch ? `toTIdeASaM(this)` : `toTIdeTZaM(this)`}" style="${todo.miniList ? `text-decoration:underline; text-decoration-thickness:1px;` : ``}${todo.term == "showThing" ? "" : ` color:${mySettings.myBaseColors[todo.color].colorBG}; flex-shrink: 0;`}">${todo.term == "reminder" ? `<i class="typcn typcn-bell" style="font-size: 1em; padding: 0 5px 0 0;"></i>` : ``}${todo.info ? '*' : ''}${todo.task}</span>${todo.term !== "showThing" ? `<hr style="border-color:${mySettings.myBaseColors[todo.color].colorBG};" />` : ``}<span class="timeSpan">${todo.startTime ? todo.startTime : ''}</span></div><i class="fa-solid fa-recycle" onclick="${searchSwitch ? `toTIdeSSaS(this)` : calendarStock ? `toTIdeCCaNS(this)` : `toTIdeTZaS(this)`}"></i></li>`);
      } else if(todo.line == "recurringDay"){
        let time = todo.startTime ? todo.startTime : mySettings.myTomorrow;
        let nextDate = getDateTimeFromString(todo.recurryDates[0], time);
        numberedDays = Math.floor(Math.abs(nextDate.getTime() - todayDate.getTime())/(1000 * 3600 * 24));
        document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-term="${todo.term}" ${todo.startTime ? `data-time="${todo.startTime}"` : ``}" class="todoLi${todo.term == "showThing" ? todo.label ? ` showLiLabel` : ` showLi` : todo.term == "sameHabit" ? ` sameHabit` : todo.term == "reminder" ? ` reminder` : ``}" style="${todo.term == "showThing" ? `background-color: ${todo.STColorBG}; color: ${todo.STColorTX};` : ``}">
        ${todo.label ? `<div class="labelOnglet labelLiOnglet" style="background-color:${colorsList[todo.LColor].colorBG}; color:${colorsList[todo.LColor].colorTX};">${todo.LName}</div>` : `<div class="noLabel"></div>`}
        <i class="typcn typcn-trash" onclick="trashRecurringEvent(this)"></i>
        <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i>
        <div class="textDiv"><span class="text" onclick="${searchSwitch ? `toTIdeSSaM(this)` : `toTIdeTZaM(this)`}" style="${todo.miniList ? `text-decoration:underline; text-decoration-thickness:1px;` : ``}${todo.term == "showThing" ? "" : ` color:${mySettings.myBaseColors[todo.color].colorBG};`}">${todo.term == "reminder" ? `<i class="typcn typcn-bell" style="font-size: 1em; padding: 0 5px 0 0;"></i>` : ``}${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan">${todo.startTime ? todo.startTime : ''}</span></div>
        <div class="numberedCal ${mySettings.mySide == "dark" ? `numberedCalDark` : ``}" onclick="smallCalendarChoice(this)"><i class="typcn typcn-calendar-outline calendarSpan ${todo.term == "showThing" ? "" : todo.dealine ? `doneDay` : todo.line}"></i><span style="${todo.term == "showThing" ? `text-shadow: -0.75px -0.75px 0 ${todo.STColorBG}, 0 -0.75px 0 ${todo.STColorBG}, 0.75px -0.75px 0 ${todo.STColorBG}, 0.75px 0 0 ${todo.STColorBG}, 0.75px 0.75px 0 ${todo.STColorBG}, 0 0.75px 0 ${todo.STColorBG}, -0.75px 0.75px 0 ${todo.STColorBG}, -0.75px 0 0 ${todo.STColorBG}; color:${todo.STColorTX};` : ``}">${numberedDays}</span></div></li>`);
      } else if(todo.term == "reminder"){
        document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" ${todo.startDate ? `data-date="${todo.startDate}"` : ``} ${todo.startTime ? `data-time="${todo.startTime}"` : ``} ${todo.recurry ? `data-rec="${todo.recId}"` : ``} class="todoLi reminderClass">
          <i class="typcn typcn-bell" style="font-size: 1em;"></i>
          <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}" style="font-size: .8em;"></i>
          <div class="textDiv"><span onclick="${searchSwitch ? `toTIdeSSaM(this)` : `toTIdeTZaM(this)`}" class="text" style="${todo.miniList ? `text-decoration:underline; text-decoration-thickness:1px; ` : ``}color:${mySettings.myBaseColors[todo.color].colorBG}; font-size: 1em;">${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan" style="font-size: .8em;" onclick="timeItEvent(this)">${todo.startTime ? todo.startTime : ""}</span>
          <input type="time" class="displayNone"/></div>
        </li>`);
      } else { // if(projectSwitch && todo.term == "wholeProject"){}
        let pOngletsDiv = ``;
        let pColor = 0;
        // if (!projectSwitch && todo.pParents && todo.pParents.length > 0) {
        //   console.log(todo);
        //   let pOngletsDivLabels = todo.pParents.map(label => {
        //     let todoId = listTasks.findIndex(todo => todo.id == label);
        //     let todo = listTasks[todoId];
            
        //     return `<div class="projectLiOnglet" style="background-color:${colorsList[todo.pColor].colorBG};color:${colorsList[todo.pColor].colorTX};">${todo.pNick}</div>`;
        //   }).join("");
        //   pOngletsDiv = `<div class="ProjectLiOngletDiv">${pOngletsDivLabels}</div>`;
        //   let lastParent = todo.pParents[todo.pParents.length - 1]
        //   pColor = listTasks[listTasks.findIndex(todo => todo.id == lastParent)].pColor;
        //   console.log(pColor);
        // };
        if(todo.pPosition == "out"){
          console.log(todo);
        };
        document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" ${todo.startDate ? `data-date="${todo.startDate}"` : ``} ${todo.startTime ? `data-time="${todo.startTime}"` : ``} ${todo.recurry ? `data-rec="${todo.recId}"` : ``} ${todo.term == "alwaysHere" ? `data-always="here"` : ``} class="todoLi${todo.term == "showThing" ? todo.label ? ` showLiLabel` : ` showLi` : todo.term == "sameHabit" ? ` sameHabit` : ``}${todo.pPosition == "out" ? ` projectLi` : ``}${togoList == "listOups" && numberedDays < -5 ? ` selectedTask` : ``}" style="${todo.term == "showThing" ? `background-color: ${todo.STColorBG}; color: ${todo.STColorTX};` : ``}${todo.pPosition == "out" ? `outline-color: ${colorsList[pColor].colorBG5}; border-color:${colorsList[pColor].colorBG};` : ``}">
          ${todo.label ? `<div class="labelOnglet labelLiOnglet" style="background-color:${colorsList[todo.LColor].colorBG}; color:${colorsList[todo.LColor].colorTX};">${todo.LName}</div>` : `<div class="noLabel"></div>`}
          ${pOngletsDiv}
          <div class="checkOptions" style="color: ${todo.urge ? todo.urgeColor : ``}" onclick="checkOptions(this)">
            <i class="typcn typcn-media-stop-outline emptyCheck"></i>
            <span>${todo.urge ? todo.urgeNum : ``}</span>
          </div>
          <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i>
          <div class="textDiv"><span onclick="${searchSwitch ? `toTIdeSSaM(this)` : `toTIdeTZaM(this)`}" class="text" style="${todo.miniList ? `text-decoration:underline; text-decoration-thickness:1px;` : ``}${todo.term == "showThing" ? `` : ` color:${mySettings.myBaseColors[todo.color].colorBG};`}">${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan" onclick="timeItEvent(this)">${todo.startTime ? todo.startTime : ""}</span>
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
          <button onclick="toTIdeTZaM(this.parentElement)">Yeah, thanks</button></div>` : ``}
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



//let demainApresTime = timeLimit("demainApres");
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
        alert(todo.task + " doesn't have any dates anymore (but should)!");
        togoList = "listRecurring";
      } else{
        console.log(todo);
        alert(todo.task + ", C'est finnnniiiiiiii!!!");
        //if "ok" then erase:
        // let todoIndex = listTasks.findIndex(tod => tod.id == todo.id);
        // listTasks.splice(todoIndex, 1);
        // localStorage.listTasks = JSON.stringify(listTasks);
        togoList = "";
      };
    } else if(todo.recurryDates.length == 1 && todo.fineOpt == "fineMai"){
      let date = getDateFromString(todo.recurryDates[0]);
      sendRecurringBackToGetRecurryDates(todo, date);
    };
    togoList = "listRecurring";
    recurryCreation(todo);
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
      togoList = "listScheduled";
    };
  } else{ // no date or deadline is after today
    togoList = todo.term + "List";
  };
  return togoList;
};

function checkOptions(thisOne){
  clickScreen.classList.remove("displayNone");
  parent = thisOne.parentElement;
  parent.classList.add("selectedTask");
  let todo = getTodoFromParent();;
  parent.insertAdjacentHTML("beforeend", `<div class="checkOptionsDiv">
  ${todo.label ? `<i id="labelChoice" class="fa-solid fa-folder-closed fa-rotate-270" style="font-size: 1.2em;color:${colorsList[todo.LColor].colorBG};"></i>` : ``}
  ${todo.urge ? `<input id="newUrgeNumInput" type="number" value="${todo.urgeNum}"/>` : ``}
  <i class="typcn typcn-input-checked-outline checkOptionsCheck" onclick="PartialCheckEvent(this.parentElement)"></i>
  ${todo.term == "alwaysHere" ? `` : `<i class="typcn typcn-input-checked checkOptionsCheck" onclick="TotalCheckEvent(this.parentElement)"></i>`}
  </div>`);
  let checkOptionsDiv = parent.querySelector(".checkOptionsDiv");
  clickScreen.addEventListener("click", () => clickHandlerAddOn(checkOptionsDiv, "trash", clickScreen, ""));
  if(todo.label){
    let labelChoice = parent.querySelector("#labelChoice");
    labelChoice.addEventListener("click", () => {
      parent.scrollIntoView();
      let labelDiv = parent.querySelector(".labelLiOnglet");
      let options = {
        icon: labelChoice,
        where: checkOptionsDiv,
        labelDiv: labelDiv,
        screen: clickScreen, //should be an other screen...
        myLabels: mySettings.myLabels && mySettings.myLabels.length > 0 ? true : false
      };
      creatingLabelPanel(todo, options);
    }); //
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
      clickHandlerAddOn(checkOptionsDiv, "trash", clickScreen, "");
    });
  };
};
window.checkOptions = checkOptions;

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
        dateTime = `${todo.recurryDates[idx]}-${todo.startTime ? todo.startTime.replace(":", "-") : "5-00"}`;
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
      delete todo.startDate;
      delete todo.stopDate;
      delete todo.stock;
      todo.line = "noDay";
      listTasks.push(todo);
      localStorage.listTasks = JSON.stringify(listTasks);
      //maybe we could do like in reuseItEvent and open taskInfo instead... then add todo.recycled
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
  clickScreen.classList.remove("displayNone");
  clickScreen.addEventListener("click", () => clickHandlerAddOn(reDateDiv, "trash", clickScreen, "nowhere"));
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
    clickHandlerAddOn(reDateDiv, "trash", clickScreen, "nowhere");
  });
};

window.reDateEvent = reDateEvent;

// *** DONE/ERASE
let num = 0;

doneNextBtn.addEventListener("click", () => {
  let doneId = wheneverList[num].id;
  let doneLi = document.getElementById(doneId);
  let doned = getTodoFromLi(doneLi);
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
  let doned = getTodoFromParent();
  //parent.querySelector(".checkOptionsDiv").remove();
  let checkOptionsDiv = parent.querySelector(".checkOptionsDiv");
  clickHandlerAddOn(checkOptionsDiv, "trash", clickScreen, "");
  gotItHalfDone(doned);
  updateCBC();
};

window.PartialCheckEvent = PartialCheckEvent;

function TotalCheckEvent(emptyCheck){
  parent = emptyCheck.parentElement;
  let doned = getTodoFromParent();
  parent.remove();
  gotItDone(doned);
  //doneAction(parent); // need to wait until animation is over before moving on to the next (gotItDone and remove) (use metro app animation)
  updateCBC();
};

window.TotalCheckEvent = TotalCheckEvent;

function doneAction(li){
  li.insertAdjacentHTML("beforeend", `<div class="doneAction"><div class="doneActionTopOpct"></div><div class="doneActionBtmLine"></div></div>`);
  /* the div would have two layers, the under one would be a horizontal line like the trashline in time app and the top one would be gradient of transparent on the right and opaque (bg-color) on the left. The whole thing would move from left to right until the whole li seems to have disapeared */
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

function gotItDone(doned){ //doned is either the todo per se or a fake todo created for the recurry
  let donedItem;
  if(doned.recurry){
    getRecurryDateOut(doned); //removes the date from the recurryDates of its recurring
    donedItem = doned;
  } else{
    let donedIndex = listTasks.findIndex(todo => todo.id == doned.id);
    let donedSplice = listTasks.splice(donedIndex, 1);
    donedItem = donedSplice[0];
  };
  if(doned.urge){
    colorUrges("next");
  };    
  localStorage.listTasks = JSON.stringify(listTasks);

  let donedDate = getTodayDateString(); //return
  
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
  document.querySelectorAll("#listScheduled > h4.subList").forEach(h => {
    h.remove();
  });
  // document.querySelectorAll("#listScheduled > div.subListDiv").forEach(h => {
  //   h.remove();
  // });
  document.querySelectorAll("#listScheduled > li").forEach(li => {
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
    //     <input id="sortlistScheduled${finalMonthName}${year}" class="sortlistInput cossin" type="checkbox" />
    //     <div class="sortlistDiv">
    //       <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
    //       <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
    //       <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
    //       <button class="switchSortBtn iconOnlyBtn"><i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i></button>
    //     </div>
    //     <label for="sortlistScheduled${finalMonthName}${year}" class="sortlistLabel">
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
  document.querySelectorAll("#listRecurring > h4.subList").forEach(h => {
    h.remove();
  });
  let recuLis = Array.from(document.querySelectorAll("#listRecurring > li"));
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
let wheneverList = [];
let listPage = document.querySelector("#listPage");
let toDoPage = document.querySelector("#toDoPage");
shuffleBtn.addEventListener("click", () => {
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
});

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
      todo.dalleRow = roundFifteenTime(todo.startTime);
      li.setAttribute("data-time", input.value);
    };
    thisOne.classList.remove("displayNone");
    input.classList.add("displayNone");
    if(list == "listToday" || list == "listTomorrow"){
      sortIt("datetime", list);
    };
    if(li.dataset.rec && li.dataset.rec !== "undefined"){
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
let moving = false;
let parent;
let changeRecurryDates = false;


let clickScreen = document.querySelector("#clickScreen");

function smallCalendarChoice(thisOne){//thisOne = taskToDate est l'icon calendar
  moving = false;
  parent = thisOne.parentElement;
  let recurryIsIt = parent.dataset.rec && parent.dataset.rec !== "undefined" ? true : false;
  parent.classList.add("selectedTask");
  parent.scrollIntoView();
  let togoList = parent.parentElement.id;
  clickScreen.classList.remove("displayNone");
  let todo;
  let todoIndex;
  let recIndex;
  if(recurryIsIt){
    recIndex = listTasks.findIndex(td => td.id == parent.dataset.rec);
    let recurring = listTasks[recIndex];
    todo = getWholeRecurry(recurring, parent.dataset.date, parent.dataset.rec);
    // todo = JSON.parse(JSON.stringify(recurring));
    // clearRecurringData(todo);
    // todo.id = crypto.randomUUID();
    // todo.line = "todoDay";
    // todo.date = parent.dataset.date;
    // todo.recurry = true;
    // todo.recId = parent.dataset.rec;
  } else{
    todoIndex = listTasks.findIndex(td => td.id == parent.id);
    todo = listTasks[todoIndex];
  };
  let parents = Array.from(document.querySelectorAll("li")).filter((li) => li.id.includes(todo.id));
  if(parents.length == 0){
    parents.push(parent);
  };
  creatingCalendar(todo, thisOne, "onIcon");
  let calendarDiv = document.querySelector("#calendarDiv");
  clickScreen.addEventListener("click", () => clickHandlerAddOn(calendarDiv, "trash", clickScreen, togoList));
  document.querySelector("#saveTheDateBtn").addEventListener("click", () => {
    let previousList = parent.parentElement.id;
    if(recurryIsIt){
      getRecurryDateOut(todo); // donc la date du todo est enlevée des recurryDates de son recurringDay
      delete todo.recurry;
      delete todo.recId; //et todo redevient un todo normal!
      listTasks.push(todo);// et le todo est maintenant dans la listTask!
      //parent.remove();
    };
    calendarSave(todo); //
    if(todo.newShit){
      delete todo.newShit;
    };
    togoList = getTogoList(todo);
    if(previousList !== togoList){
      if(togoList == ""){
        moving = false;
      } else{
        moving = true;
      };
    };
    parents.forEach(parent => {
      parent.remove();
    });
    //parent.remove();
    todoCreation(todo);

    localStorage.listTasks = JSON.stringify(listTasks);
    sortItAllWell();
    updateCBC();
    clickHandlerAddOn(calendarDiv, "trash", clickScreen, togoList);
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
  // let date = todo.date ? todo.date : rec ? todo.dal : getTodayDateString();
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

/* <div class="DaySection" id="oneDaySection">
    <h5 class="taskInfoInput" style="margin-left: 0;">It's a one time thing</h5>
    <div class="inDaySection" style="width: -webkit-fill-available; max-width: 200px;">
      <input type="date" id="oneDayDateInput" class="centerDateInput changeRecurryDates" value="${date}" />
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
        <p><span>c'è un inizio?</span><input id="oneDayTimeDalleInput" type="time" class="dalle dalleTxt" value="${todo.dalle ? todo.dalle : ``}" /></p>
        <p><span>c'è una fine?</span><input id="oneDayTimeAlleInput" type="time" class="alle alleTxt" value="${todo.alle ? todo.alle : ``}" /></p>
      </div>
    </div>
  </div> 
  
  <div class="inDaySection" style="width: -webkit-fill-available; max-width: 200px;">
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
      <input type="date" id="oneDayStartDateInput" class="changeRecurryDates" value="${date}" />
      <div class="noneTuttoGiornoDiv calendarInsideMargin">
        <input id="oneDayTimeStartInput" type="time" class="dalle dalleTxt" value="${todo.dalle ? todo.dalle : ``}" />
      </div>

      <input type="date" id="oneDayStopDateInput" class="changeRecurryDates" value="${date}" />
      <div class="noneTuttoGiornoDiv calendarInsideMargin">
        <input id="oneDayTimeStopInput" type="time" class="alle alleTxt" value="${todo.alle ? todo.alle : ``}" />
      </div>
    </div>*/

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
        <input type="date" id="oneDayStartDateInput" class="changeRecurryDates" value="${startDate}" />
        <input id="oneDayStartTimeInput" type="time" class="dalle dalleTxt" value="${todo.startTime ? todo.startTime : ``}" />
      </div>
      <div class="noneTuttoGiornoDiv calendarInsideMargin">
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
  oneDayStartDate.addEventListener("change", () => {
    oneDayStopDate.value = oneDayStopDate.value < oneDayStartDate.value ? oneDayStartDate.value : oneDayStopDate.value;
  });

  if(!todo.recurry){
    meseCalculate(startDate);//need it here otherwise the text just isn't there, because, ci-bas, meseCalculate only happens when var is changed, but if it is mese from the beginning, it wouldn't happen (week is taken care of earlier when we check them all)
    let weekSection = document.querySelector("#weekSection");
    let monthSection = document.querySelector("#monthSection");
    let timeVariationInput = document.querySelector("#timeVariationInput");

    timeVariationInput.addEventListener("change", () => {
      startDate = document.querySelector("#dalInput").value;
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
      startDate = document.querySelector("#dalInput").value;
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
  delete todo.listDates;
  delete todo.recurryDates;
  delete todo.recPileUP;
  if(todo.recurrys){
    todo.recurrys.forEach(recurry => {
      if(recurry.out){
        if(document.getElementById(recurry.id)){
          document.getElementById(recurry.id).remove();
        };
      };
    });
    delete todo.recurrys;
  };
  //Don't delete todo.recurry nor todo.recId
};

function calendarSave(todo){ //
  todo.line = document.querySelector('input[name="whatDay"]:checked').value;
  // the 3 of them (noDay, todoDay and recurringDay) can have time and buffer
  let inDaySection = document.querySelector('input[name="whatDay"]:checked ~ div.DaySection > div.inDaySection');
  todo.tutto = inDaySection.querySelector('input[type="checkbox"].tuttoGiornoInput').checked ? true : false;
  // let primaBuffer = document.querySelector("#primaBuffer");
  // let dopoBuffer = document.querySelector("#dopoBuffer");
  let primaBuffer = document.querySelector("#durationSelectPrima");
  let dopoBuffer = document.querySelector("#durationSelectDopo");
  todo.prima = primaBuffer.value ? primaBuffer.value : "00:00";
  todo.dopo = dopoBuffer.value ? dopoBuffer.value : "00:00";
  if(todo.tutto){
    //delete todo.prima; //otherwise, if it's stock, we loose all the buffers!
    delete todo.primaRow;
    delete todo.startTime;
    delete todo.dalleRow;
    delete todo.stopTime;
    delete todo.alleRow;
    //delete todo.dopo; //otherwise, if it's stock, we loose all the buffers!
    delete todo.dopoRow;
  } else{
    let dalle = inDaySection.querySelector('input[type="time"].dalle');
    if(dalle && dalle.value !== ""){
      todo.startTime = dalle.value;
      todo.dalleRow = roundFifteenTime(todo.startTime); //returns time rounded to 15s with a - instead of a : (for the row-name in weekly)
      if(todo.prima && todo.prima !== "00:00"){
        let prima = roundFifteenTime(todo.prima); //we might not need that anymore since prima and dopo  only have 15min increments in the select...
        todo.primaRow = timeMath(todo.dalleRow, "minus", prima); //returns time rounded to 15s with a - instead of a : (for the row-name in weekly)
      };
    } else{
      delete todo.startTime;
      delete todo.dalleRow;
      todo.tutto = true;
    };
    let alle = inDaySection.querySelector('input[type="time"].alle');
    if(alle && alle.value !== ""){
      todo.stopTime = alle.value;
      todo.alleRow = todo.stopTime ? roundFifteenTime(todo.stopTime) : "end";
      if(todo.dopo && todo.dopo !== "00:00"){
        let dopo = roundFifteenTime(todo.dopo); //we might not need that anymore since prima and dopo  only have 15min increments in the select...
        todo.dopoRow = timeMath(todo.alleRow, "plus", dopo);
      };
    } else{
      delete todo.stopTime;
      delete todo.alleRow;
    };
  };
  
  todo.busy = document.querySelector("#busyInput").checked ? true : false;
  if(todo.busy){ //first, you need to put this AFTER the todo.date has been established, second, you should only do this if... (you know what, busy shouldn't be checked by default (unless it's a show))
    //busyZoneCreation(todo); (will be done when we save to cloud)
  };

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
      
      //sendRecurringToGetRecurryDates(todo, date);
      // recurryDateToTodoCreation(todo, recurryDate, "out"); ??
      // recurryCreation(todo);
      //recurryOuting(todo);
      //PAS BESOIN DE LE CRÉÉ CAR ÇA VA SE FAIRE APRÈS (smallCalendar AND taskInfo)
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
~todo.status => "todo" ou "done"
~todo.doneDate => date (string) où ça a été coché fait
todo.id
todo.task
todo.info
todo.color => number (index in mySettings.myBaseColors)
todo.icon
todo.term => {project: "wholeProject"}, {rappel: "reminder"}, {habit: "sameHabit"}, {task: "topPriority", "nextThing", "longTerm", "oneTime", "alwaysHere", "waitForIt", "thinkBoutIt", "crazyShit"}, {event: "showThing"}
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
todo.startDate (anciennement todo.date)
todo.stopDate
todo.line => "todoDay", "recurringDay", "noDay" ("doneDay" ne sert qu'à mettre le calendrier rouge)
todo.tutto => true/false si ça dure toute la journée ou si on considère 'dalle' et 'alle'
todo.deadline => date (string) du deadline (if no deadline, delete)
todo.dlTutto => true/false if deadline is all day or not (if no deadline, delete)
todo.finoAlle => heure (string) du deadline (if no deadline, delete)
todo.startTime (anciennement todo.dalle) => time à laquelle ça commence aussi anciennement todo.time (pour les event)
todo.dalleRow = "00-00" rounded to fifteen
todo.stopTime (anciennement todo.alle) => time à laquelle ça fini
todo.alleRow = "00-00" rounded to fifteen (if there's no alle, then "end")
todo.prima => durée du buffer avant l'event
todo.primaRow = heure à laquelle le buffer commence ("00-00" rounded to fifteen)
todo.dopo => durée du buffer après l'event
todo.dopoRow = heure à laquelle le buffer fini ("00-00" rounded to fifteen)
xxxtodo.stored => true/false (has a model in storage)
xxxtodo.stockId
todo.stock => true/false (is a model in storage)
xxxtodo.storedId = []
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
xxx todo.listDates = []
xxx todo.recurrys = [{}] array de tout les recurry (object) créés à partir de la listDates
todo.recId = id du todo qui est le recurring (l'original) (pour les recurry qui n'ont pas encore été pushed in listTasks seulement, pour qu'on puisse enlever sa date dans l'array recurryDate... non, let's keep the recId even after its been pushed in listTasks, in case one day we want to offer l'option "modify them all" or something like that) 
todo.recurry => true/false means it's one occurence of a recurring (calendar icon purple and cycle icon in taskInfo) (whether it's out in listTasks or not)
On sait si le <li> doit être dans les recurring ou dans les autres listes (donc présent dans listTasks) grâce à todo.line == "recurringDay" ou else
xxx todo.out => (isn't used) true (le <li> du recurry a été créé) / false ou inexistant (le <li> n'a pas encore été créé)
xxx todo.recurring => aucune idée à quoi ça sert...
todo.label => true/false
todo.LName => string
todo.LColor => index of colorsList
If it's a PROJECT
  todo.pNickname => nickname du project à mettre dans le label
  todo.pColor => index of colorsList
  todo.pParts => [id des todo et project inclus dans ce project (en ordre)]
If it's PART of a PROJECT (a project can be part of an other project)
  todo.pParents => [id des projets parents, en ordre du plus parent au moins parent] (oui, juste les id; on ira chercher la couleur du dernier; comme ça, si ça change, on le change juste une fois, pas pour chaque parts)
  todo.pPosition => "out" (shows in the todoZone with the colors of its closest parent) -- "in" (doesn't show in the todoZone but shows in the Project's TaskInfo) -- "done" (shows in the doneZone; doesn't show in the todoZone but shows in the Project's TaskInfo but as done (crossLined))
mySettings.myShowTypes.name
mySettings.myShowTypes.colorBG => background-color
mySettings.myShowTypes.colorTX => color (text)
mySettings.myShowTypes.color => index of colorsList (only for newly created showTypes, not my 4 old ones) */


// *** RECURRING

function getStringFromDate(date){
  let currentDate = String(date.getDate()).padStart(2, "0");
  let currentMonth = String(date.getMonth()+1).padStart(2, "0");
  let currentYear = date.getFullYear();
  let currentFullDate = `${currentYear}-${currentMonth}-${currentDate}`;
  return currentFullDate;
};

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
  } else if(todo.fineOpt == "fineMai" && todo.var == "anno"){
    start = 1;
    stop = 3;
    count = true;
  } else{
    start = date;
    stop = getDateFromString("2024-11-30");
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
  } else if(todo.fineOpt == "fineMai" && todo.var == "anno"){
    start = 1;
    stop = 3;
    count = true;
  } else{
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
  } else if(todo.fineOpt == "fineMai" && todo.var == "anno"){
    start = 1;
    stop = 3;
    count = true;
  } else{
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
***EnCours:
- weeklyFilter (l'icon filter est en displayNone en attendant que le reste du code soit fait)

***ÀFaire:

*If we use recurring just like google, and use todoDay as todo.dal as well as todo.dalle/startTime et todo.alle/stopTime, we could calculate the recurryDates with todo.startDate and a todo.duration to calculate the new todo.stopDate... (create new function dateTimeMath)
1. Tout repenser le système de date pour pouvoir avoir dalle (date & time) et alle  (date & time)
  Dans weekly, le début est un jour/une col, la fin est un autre jour, la même col (dateTime < nextDayTime)
  Si c'est sur deux jours, comment qu'on le met dans le weekly? Un we from dateTimeBeg to endOfDay, un autre we from startOfDay to dateTimeEnd
  todo.dateTimeStart = "2024-06-19-11-00"
  todo.dateTimeEnd = "2024-06-20-15-00"
  OU
  todo.startDate = "2024-06-19"
  todo.startTime = "11-00" (or "11:00")
  todo.stopDate = "2024-06-20"
  todo.stopTime = "15-00" (or "15:00")
  to check if it's today (without considering time), we could use .startsWith(date)
  Where do we use date:
    - in todo.recurryDates we have the date and in the todo, we have dalle, alle, prima et dopo
    * what if it's tutto?!
    todo.dateTimeStart = "2024-06-19" or "2024-06-19-XX-XX" (or 05-00 but that's risky, specially for those whose tomorrow aren't 3:00!)
    todo.dateTimeEnd = "2024-06-19-XX-XX"
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

...Si on met les recurry dans les search results, le toTIdeSSaM() est déjà arrangé pour recevoir les recurry!
*/

// MARK: ToGoToTI + RÉFLEXTION

//parent is global but we still have to give it a value (we might need to rethink parent being global when we want multiple clickscreens...)

//Parents are only necessairy if we're working on a todo that is in the swiping section (for example, you would have the one on wednesday and the one in scheduled) or if in search, we add the results of different searches together and a todo comes up more than once


function getTodoFromParent(){ //parent is global
  let todo;
  if(parent.dataset.rec && parent.dataset.rec !== "undefined"){
    let recIndex = listTasks.findIndex(td => td.id == parent.dataset.rec);
    let recurring = listTasks[recIndex];
    todo = getWholeRecurry(recurring, parent.dataset.date, parent.dataset.rec);
  } else{
    let parentId = parent.dataset.id ? parent.dataset.id : parent.id;
    let todoIndex = listTasks.findIndex(td => td.id == parentId);
    todo = listTasks[todoIndex];
  };
  return todo;
};

// to go to taskAddAllInfo

function toTIdeTZaN(){ // de TodoZone à New (addForm but without the addInput.value, so when you directly click the add button (if you write an addInput.value, it directly goes to todoCreation, then after that you can click on it to go to taskInfo, in which case, it's a toTIdeTZaM))
  let todo = {
    newShit: true,
    id: crypto.randomUUID(),
    color: "0",
    icon: "fa-solid fa-ban noIcon",
    term: "oneTime",
    line: "noDay"
  };
  //let newWidth = Number(window.innerWidth - 16);
  let infos = {
    todo: todo,
    where: "todoZone",
    div: document.body
  };
  taskAddAllInfo(infos);
};

function toTIdeTZaM(thisOne){ // de TodoZone à Modification et à Procrastinator (this.parentElement)
  let div= thisOne.parentElement;
  parent = div.parentElement;
  parent.classList.add("selectedTask");
  parent.scrollIntoView(); 
  let togoList = parent.parentElement.id;
  clickScreen.classList.remove("displayNone"); 
  let infos = {
    todo: getTodoFromParent(),
    where: "todoZone",
    div: div,
    togoList: togoList
  };
  taskAddAllInfo(infos);
};
window.toTIdeTZaM = toTIdeTZaM;

function toTIdeTZaS(thisOne){ // de TodoZone à Stock reusage
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
  clickScreen.classList.remove("displayNone"); 
  let infos = {
    todo: todo,
    where: "todoZone",
    div: div
  };
  taskAddAllInfo(infos);
};
window.toTIdeTZaS = toTIdeTZaS;

function toTIdeASaM(thisOne){ // de AllStorage à Modification
  moving = false;
  let div= thisOne.parentElement;
  parent = div.parentElement;
  parent.classList.add("selectedTask");
  parent.scrollIntoView(); 
  clickScreen.classList.remove("displayNone"); 
  let infos = {
    todo: getTodoFromParent(),
    where: "allStorage",
    div: div
  };
  taskAddAllInfo(infos);
};
window.toTIdeASaM = toTIdeASaM;

function toTIdeSSaM(thisOne){ // de SearchScreen à Modification
  moving = false; //must stay false in month/week/search
  let div= thisOne.parentElement;
  parent = div.parentElement;
  parent.classList.add("selectedTask");
  parent.scrollIntoView(); 
  let togoList = parent.parentElement.id;
  clickScreen.classList.remove("displayNone"); 
  let infos = {
    todo: getTodoFromParent(),
    where: "searchScreen",
    div: div,
    togoList: togoList,
  };
  taskAddAllInfo(infos);
};
window.toTIdeSSaM = toTIdeSSaM;

function toTIdeSSaS(thisOne){ // de SearchScreen à Stock reusage
  moving = false; //must stay false in month/week/search
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
  clickScreen.classList.remove("displayNone"); 
  let infos = {
    todo: todo,
    where: "searchScreen",
    div: div
  };
  taskAddAllInfo(infos);
};
window.toTIdeSSaS = toTIdeSSaS;

let calendarStock = false;
let newTodoStockFromCal = {};

function toTIdeCMaN(thisOne){ // de CalMonthPage à New
  moving = false; //must stay false in month/week/search
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
  let infos = {
    todo: todo,
    where: "calMonthPage",
    div: document.body
  };
  taskAddAllInfo(infos);
};
window.toTIdeCMaN = toTIdeCMaN;

function toTIdeCMaM(thisOne){ // de CalMonthPage à Modification
  moving = false; //must stay false in month/week/search
  parent = thisOne;
  let infos = {
    todo: getTodoFromParent(),
    where: "calMonthPage",
    div: document.body
  };
  taskAddAllInfo(infos);
};
window.toTIdeCMaM = toTIdeCMaM;

function toTIdeCWaN(thisOne){ // de CalWeekPage à New
  moving = false; //must stay false in month/week/search
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
  let rowNum = thisOne.style.gridRowStart;
  if(rowNum == 4){
    todo.tutto = true;
  } else{
    let hourMath = ((rowNum - 5) / 4) + 3;
    let hourNum = hourMath < 24 ? hourMath : hourMath - 24;
    let rowHour = `${String(hourNum).padStart(2, "0")}:00`;
    let hourEndMath = hourMath + 1;
    let hourEndNum = hourEndMath < 24 ? hourEndMath : hourEndMath - 24;
    let rowHourEnd = `${String(hourEndNum).padStart(2, "0")}:00`;
    todo.startTime = rowHour;
    todo.stopTime = rowHourEnd;
    todo.tutto = false;
  };
  newTodoStockFromCal = todo;
  let infos = {
    todo: todo,
    where: "calWeekPage",
    div: document.body
  };
  taskAddAllInfo(infos);
};
window.toTIdeCWaN = toTIdeCWaN;

function toTIdeCWaM(thisOne){ // de CalWeekPage à Modification
  moving = false; //must stay false in month/week/search
  parent = thisOne;  
  let infos = {
    todo: getTodoFromParent(),
    where: "", // we don't even use it! (except for the clickscreen handler... wait until we've dealed with that)
    div: document.body
  };
  taskAddAllInfo(infos);
};
window.toTIdeCWaM = toTIdeCWaM;

function toTIdeCCaNS(thisOne){ //de calendar (month || weekly) à Stock reusage à partir de New (calendarStock)
  moving = false; //must stay false in month/week/search
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
  //let newWidth = Number(window.innerWidth - 16);
  clickScreen.classList.remove("displayNone"); 
  let infos = {
    todo: todo,
    where: "",
    div: document.body
  };
  taskAddAllInfo(infos);
};
window.toTIdeCCaNS = toTIdeCCaNS;

// MARK: TASKINFO

const checkSwitch = [
  "typcn typcn-media-stop-outline", 
  "typcn typcn-input-checked-outline", 
  "typcn typcn-input-checked"
];

function taskAddAllInfo(infos){
  let positionA = window.scrollY;
  let parents;
  let todo = infos.todo;
  let where = infos.where;//where == "todoZone", "calWeekPage", "calMonthPage", "searchScreen", "allStorage"
  let div = infos.div;
  let togoList = infos.togoList;
 
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

  let Pcolors = colorsList.map((icon, idx) => {
    return `<input id="projectColor${idx}" type="radio" name="projectColorChoices" class="displayNone" value="${idx}" ${todo.PColorBG && todo.PColorBG == icon.colorBG ? "checked" : ""} /><label for="projectColor${idx}" class="showTypeIconsB projectColorChoix"><i class="fa-solid fa-folder-closed" style="color:${icon.colorBG};"></i></label>`;
  }).join("");
  let projectColorsChoice = `<div class="projectColorsDiv">${Pcolors}</div>`;
  let projectNamesChoice;
  if(mySettings.myProjects && mySettings.myProjects.length > 0){ //instead: listTasks.filter(todo => todo.term == "wholeProject") (how do we figure out the levels of each project?)
    console.log("more than 0 project");
    let projectNames = mySettings.myProjects.map((project, idx) => {
      return `<option style="background-color:${project.colorBG}; color:${project.colorTX};" value="${idx}" ${todo.Pnickname && todo.Pnickname == project.nickname ? `selected` : ``}>${project.nickname}</option>`;
    }).join("");
    projectNamesChoice = `<select id="myProjectNames">
    <option value="null">Choose one</option>
    ${projectNames}
  </select>`;
  } else{
    projectNamesChoice = `<h6 style="margin: 0;">pssst... First, you've got to create a project!</h6>`;
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

  let projectHow;
  if(todo.term == "wholeProject"){
    projectHow = `<input id="tellHowInput" type="checkbox" class="cossin taskToggleInput" />
    <div>
      <label for="tellHowInput" class="taskToggleLabel taskInfoSectionLabel" style="margin-top: 10px;">
        <h5 class="topList">Tell me how...<span class="tellYou" id="tellYouHow">${todo.pParts && todo.pParts.length > 0 ? `(step by step)` : ``}</span></h5>
        <span class="typcn typcn-chevron-right-outline taskToggleChevron"></span>
      </label>
      <div class="taskToggleList relDiv" style="margin-bottom: 25px;">
        <ul id="projectUl">
        </ul>
      </div>
    </div>`;
  } else{
    projectHow = ``;
  };
//taskInfoProject similar to projectLi

//  style="${newWidth !== "" ? `width:${newWidth}px; ` : ``}${(where == "todoZone" || where == "searchScreen" || where == "allStorage") ? (why == "new" || why == "stock") ? `top: 0; left: 0;` : `top: 25px; left: -37px;` : `top: 10px; left: 10px;`}${todo.term == "wholeProject" ? `border-color:${colorsList[pColor].colorBG}; outline-color: ${colorsList[pColor].colorBG5};` : ``}"
  let taskAllInfo = `<div id="taskInfo" class="taskInfoClass${todo.term == "wholeProject" ? ` taskInfoProject` : ``}">
    <div class="taskInfoWrapper">
      <div id="SupClickScreen" class="Screen displayNone"></div>
      <button id="doneIt" class="iconOnlyBtn cornerItLabel">
        <i class="typcn typcn-media-stop-outline"></i>
      </button>
      ${todo.recurry || todo.line == "recurringDay" ? `
      <div class="storeItLabel cornerItLabel" >
        <span class="typcn typcn-arrow-repeat"></span>
      </div>` : todo.recycled ? `<div class="storeItLabel cornerItLabel" >
      <span class="fa-solid fa-recycle" style="line-height: 2.1em; font-size: 1.1em;"></span>
    </div>` : `<input id="storeIt" type="checkbox" class="cossin cornerItInput" ${todo.stock ? `checked` : ``} />
    <label for="storeIt" class="storeItLabel cornerItLabel">
      <span class="typcn typcn-pin-outline cornerItUnChecked pinUnChecked"></span>
      <span class="typcn typcn-pin cornerItChecked pinChecked"></span>
    </label>`}
    <input id="copyIt" type="checkbox" class="cossin cornerItInput" />
    <label for="copyIt" class="copyItLabel cornerItLabel">
      <i class="fa-regular fa-copy cornerItUnChecked"></i>
      <i class="fa-solid fa-copy cornerItChecked"></i>
    </label>
    <input id="trashIt" type="checkbox" class="cossin cornerItInput" />
    <label for="trashIt" class="trashItLabel cornerItLabel${(todo.newShit || todo.recycled) ? ` hidden` : ``}">
      <i class="fa-regular fa-trash-can cornerItUnChecked"></i>
      <i class="fa-solid fa-trash-can cornerItChecked"></i>
    </label>
    <div class="taskInfoInput relDiv${calendarStock ? ` calendarStockVersion` : ``}">
      ${todo.pParents && todo.pParents.length > 0 ? `<div class="projectOnglet" style="background-color:${todo.PColorBG}; color:${todo.PColorTX};">${todo.Pnickname}</div>` : ``}
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
      ${projectHow}
      <input id="tellWhatInput" type="checkbox" class="cossin taskToggleInput" />
      <div>
        <label for="tellWhatInput" class="taskToggleLabel taskInfoSectionLabel" style="margin-top: 20px;">
          <h5 class="topList">Tell me what...<span class="tellYou">(<span id="tellYouTermProject">${todo.wholeProject || todo.partProject ? `Project - ` : ``}</span><span id="tellYouTerm">${t(todo.term)}</span><span id="tellYouShowType">${todo.term == "showThing" ? ` - ${todo.showType ? todo.showType : mySettings.myShowTypes[0].name}` : ``}</span><span id="tellYouUrge">${todo.urge ? ` - Priority: ${todo.urgeNum}` : ``}</span>)</span></h5>
          <span class="typcn typcn-chevron-right-outline taskToggleChevron"></span>
        </label>
        <div class="taskToggleList taskInfoInput relDiv">
          <!-- <h5 class="taskInfoSubTitle" style="margin:10px 0 0 0;">Project</h5>
          <input class="myRadio" type="checkbox" name="projectOptions" id="wholeProjectInput" value="wholeProject" ${todo.wholeProject ? `checked` : ``} />
          <label for="wholeProjectInput" class="termLabel"><span class="myRadio myRadioBox"></span><span>It's a whole big thing</span><br />
          <span class="smallText otherSmallText">with lots of little things in it</span></label>
          <div class="wholeProjectDiv">
            <h5 style="margin: 5px 0 0 0;">${todo.wholeProject ? `Wanna change the label?` : `Let's give it a label`}</h5>
            <div class="inDaySection" style="width: fit-content; margin-bottom: 10px; padding: 10px;">
              <p>Choose a color: ${projectColorsChoice}</p>
              <p>Choose a nickname:</p>
              <input id="projectNickInput" type="text" value="${todo.Pnickname ? todo.Pnickname : ""}"/>
            </div>
          </div>
          <input class="myRadio" type="checkbox" name="projectOptions" id="partProjectInput" value="partProject" ${todo.partProject ? `checked` : ``} />
          <label for="partProjectInput" class="termLabel"><span class="myRadio myRadioBox"></span><span>It's part of something bigger</span><br />
          <span class="smallText otherSmallText">than itself</span></label>
          <div class="partProjectDiv">
            <h5 style="margin: 5px 0 0 0;">What project is it a part of?</h5>
            <div class="inDaySection" style="width: fit-content; margin-bottom: 10px; padding: 10px;">
              ${projectNamesChoice}
            </div>
          </div>-->
          <div class="hidden" style="height: 0;">
            <h5 class="taskInfoSubTitle" style="margin: 0;">Project</h5>
            <input class="myRadio" type="radio" name="termOptions" id="wholeProject" value="wholeProject" ${todo.term == "wholeProject" ? `checked` : ``} />
            <label for="wholeProject" class="termLabel"><span class="myRadio"></span>It's a whole big thing<br />
            <span class="smallText otherSmallText">with lots of little things in it</span></label>
            <div class="wholeProjectDiv">
              <h5 style="margin: 5px 0 0 0;">${todo.wholeProject ? `Wanna change the label?` : `Let's make it a tab`}</h5>
              <div class="inDaySection" style="width: fit-content; margin-bottom: 10px; padding: 10px;">
                <p>Choose a color: ${projectColorsChoice}</p>
                <p>Choose a nickname:</p>
                <input id="projectNickInput" type="text" value="${todo.Pnickname ? todo.Pnickname : ""}"/>
              </div>
            </div>
            <input class="myRadio" type="checkbox" name="projectOptions" id="partProjectInput" value="partProject" ${todo.pParents && todo.pParents.length > 0 ? `checked` : ``} />
            <label for="partProjectInput" class="termLabel"><span class="myRadio myRadioBox"></span><span>It's part of something bigger</span><br />
            <span class="smallText otherSmallText">than itself</span></label>
            <div class="partProjectDiv">
              <h5 style="margin: 5px 0 0 0;">What project is it a part of?</h5>
              <div class="inDaySection" style="width: fit-content; margin-bottom: 10px; padding: 10px;">
                ${projectNamesChoice}
              </div>
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
  //<input class="myRadio" type="radio" name="projectOptions" id="notProjectInput" value="notProject" ${!todo.wholeProject && !todo.partProject ? `checked` : ``} />
  //<label for="notProjectInput" class="termLabel"><span class="myRadio"></span><span>None of the above</span><br />
  //  <span class="smallText otherSmallText">(it's just its own thing)</span></label>
  div.insertAdjacentHTML("beforeend", taskAllInfo); //different in month/week 
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
  let taskInfo = document.querySelector("#taskInfo");
  let doneIt = document.querySelector("#doneIt");
  let doneIcon = doneIt.querySelector("i");
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
  let SupClickScreen = document.querySelector("#SupClickScreen");
  let colorIt = document.querySelector("#colorIt");
  let colorPalet = document.querySelector("#colorPalet");

  // *** LABEL
  let labelIt = document.querySelector("#labelIt");
  newLabelReset();
  newlabelName = todo.label ? todo.LName : "";
  newlabelColor = todo.label ? todo.LColor : "";
  let options = {
    where: taskInfo,
    labelDiv: labelIt,
    screen: SupClickScreen,
    myLabels: mySettings.myLabels && mySettings.myLabels.length > 0 ? true : false
  };
  labelIt.addEventListener("click", () => {
    creatingLabelPanel(todo, options);
  });
  let iconIt = document.querySelector("#iconIt");
  let iconsPalet = document.querySelector("#iconsPalet");
  let taskInfoBtn = document.querySelector("#taskInfoBtn");
  let taskCancelBtn = document.querySelector("#taskCancelBtn");
  let busyInput = document.querySelector("#taskCancelBtn");
  if(todo.term == "wholeProject" && todo.pParts && todo.pParts.length > 0){
    projectSwitch = true;
    todo.pParts.forEach(partId => {
      let partIdx = listTasks.findIndex(to => to.id == partId);
      let part = listTasks[partIdx];
      todoCreation(part);
    });
    projectSwitch = false;
  };
  taskCancelBtn.addEventListener("click", () => {
    if(parent){
      parent.classList.remove("selectedTask");
    };
    taskInfo.remove();
    window.scrollTo(0, positionA);
    clickScreen.classList.add("displayNone"); //remove()
    // if(where == "todoZone" && why !== "stock" && why !== "new"){// should be for searchscreen too...
    //   moving = true; // section that it's scrolling to is the list the li is in... but maybe it should just scroll back to the parent!?
    //   clickHandlerAddOn(taskInfo, "trash", clickScreen, togoList);
    // } else{
    //   taskInfo.remove();
    //   //add scrollbackToTop!
    // };
  });
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
  trashIt.addEventListener("click", () => {
    if(trashIt.checked){
      taskInfoBtn.innerText = "Trash it!";
      copyIt.checked = false;
      doneIcon.className = checkSwitch[0];
    } else{
      taskInfoBtn.innerText = "Save";
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
  hideMiniInput.addEventListener("click", (e) => {
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
  let newProjectColorBG;
  let newProjectColorTX;
  let newProjectNickname;
  let myProject;
  document.querySelectorAll('input[name="projectColorChoices"]').forEach(radio => {
    radio.addEventListener("click", () => {
      newProjectColorBG = colorsList[radio.value].colorBG;
      newProjectColorTX = colorsList[radio.value].colorTX;
      if(!document.querySelector(".projectOnglet")){
        taskTitle.insertAdjacentHTML("beforebegin", `<div class="projectOnglet" style="background-color:${newProjectColorBG}; color:${newProjectColorTX};">${newProjectNickname ? newProjectNickname : "Project"}</div>`);
      } else{
        document.querySelector(".projectOnglet").style.backgroundColor = newProjectColorBG;
        document.querySelector(".projectOnglet").style.color = newProjectColorTX;
      };
    });
  });
  let projectNickInput = document.querySelector("#projectNickInput");
  projectNickInput.addEventListener("change", () => {
    //make sure that nickname doesn't already exist! There can be only one of each!!
    newProjectNickname = projectNickInput.value;
    if(!document.querySelector(".projectOnglet")){
      taskTitle.insertAdjacentHTML("beforebegin", `<div class="projectOnglet" style="background-color:${newProjectColorBG ? newProjectColorBG : "var(--bg-color)"}; color:${newProjectColorTX ? newProjectColorTX : "var(--tx-color)"};">${newProjectNickname !== "" ? newProjectNickname : "Project"}</div>`);
    } else{
      document.querySelector(".projectOnglet").textContent = newProjectNickname !== "" ? newProjectNickname : "Project";
    };
  });
  if(mySettings.myProjects && mySettings.myProjects.length > 0){
    let myProjectNames = document.querySelector("#myProjectNames");
    myProjectNames.addEventListener("change", () => {
      if(myProjectNames.value !== "null"){
        myProject = mySettings.myProjects[myProjectNames.value];
        if(!document.querySelector(".projectOnglet")){
          taskTitle.insertAdjacentHTML("beforebegin", `<div class="projectOnglet" style="background-color:${myProject.colorBG}; color:${myProject.colorTX};">${myProject.nickname}</div>`);
        } else{
          document.querySelector(".projectOnglet").style.backgroundColor = myProject.colorBG;
          document.querySelector(".projectOnglet").style.color = myProject.colorTX;
          document.querySelector(".projectOnglet").textContent = myProject.nickname;
        };
      };
    });
  };
//when term wholeProject is selected
  // => add tellMeHow section with pParts if already exist (if already exist, they will already have been created; maybe just hide the section if another term is selected?)
  // => show the choices for the pColor and pNickname
  //if pColor and pNickname exist => add the tab on top of taskInfo and the border(colorsList[pColor].colorBG)/outline(colorsList[pColor].colorBG5) -color 

  // document.querySelectorAll('input[name="projectOptions"]').forEach(project => {
  //   project.addEventListener("click", () => {
  //     if(project.value == "wholeProject"){
  //       if(!document.querySelector(".projectOnglet")){
  //         taskTitle.insertAdjacentHTML("beforebegin", `<div class="projectOnglet" style="background-color:${newProjectColorBG ? newProjectColorBG : "var(--bg-color)"}; color:${newProjectColorTX ? newProjectColorTX : "var(--tx-color)"};">${newProjectNickname ? newProjectNickname : "Project"}</div>`);
  //       } else{
  //         document.querySelector(".projectOnglet").style.backgroundColor = newProjectColorBG ? newProjectColorBG : "var(--bg-color)";
  //         document.querySelector(".projectOnglet").style.color = newProjectColorTX ? newProjectColorTX : "var(--tx-color)";
  //         document.querySelector(".projectOnglet").textContent = newProjectNickname ? newProjectNickname : "Project";
  //       };
  //     } else if(project.value == "partProject"){
  //       if(!document.querySelector(".projectOnglet")){
  //         taskTitle.insertAdjacentHTML("beforebegin", `<div class="projectOnglet" style="background-color:${myProject ? myProject.colorBG : "var(--bg-color)"}; color:${myProject ? myProject.colorTX : "var(--tx-color)"};">${myProject ? myProject.nickname : "Project"}</div>`);
  //       } else{
  //         document.querySelector(".projectOnglet").style.backgroundColor = myProject ? myProject.colorBG : "var(--bg-color)";
  //         document.querySelector(".projectOnglet").style.color = myProject ? myProject.colorTX : "var(--tx-color)";
  //         document.querySelector(".projectOnglet").textContent = myProject ? myProject.nickname : "Project";
  //       };
  //     };
  //   });
  // });
  
  
  // *** COLOR
  let newcolor = todo.color;
  colorIt.addEventListener("click", () => {
    taskInfo.insertAdjacentElement("beforeend", colorPalet);
    colorPalet.classList.remove("displayNone");
    SupClickScreen.classList.remove("displayNone");
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
        colorPalet.classList.add("displayNone");
        clickHandlerAddOn(colorPalet, "keep", SupClickScreen, "nowhere");
        document.querySelector("#todoZone").insertAdjacentElement("beforeend", colorPalet);
      });
    });
    SupClickScreen.addEventListener("click", () => clickHandlerAddOn(colorPalet, "keep", SupClickScreen, "nowhere"));
  });
  //ICON
  let newicon = todo.icon;
  iconIt.addEventListener("click", () => {
    taskInfo.insertAdjacentElement("beforeend", iconsPalet);
    iconsPalet.classList.replace("displayNone", "inTaskDiv");
    SupClickScreen.classList.remove("displayNone");
    document.querySelectorAll("input[name='iconRadio']").forEach(radio => {
      if(todo.icon == radio.value){
        radio.checked = true;
      } else{
        radio.checked = false;
      };
      radio.addEventListener("click", () => {
        newicon = radio.value;
        iconIt.className = `IconI ${newicon}`;
        iconsPalet.classList.replace("inTaskDiv", "displayNone");
        clickHandlerAddOn(iconsPalet, "keep", SupClickScreen, "nowhere");
        document.querySelector("#todoZone").insertAdjacentElement("beforeend", iconsPalet);
      });
    });
    SupClickScreen.addEventListener("click", () => clickHandlerAddOn(iconsPalet, "keep", SupClickScreen, "nowhere"));
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

  if(where == "todoZone" || where == "searchScreen"){
    clickScreen.addEventListener("click", () => clickHandlerAddOn(taskInfo, "trash", clickScreen, togoList));
  };
  

  // MARK: SAVE BUTTON
  taskInfoBtn.addEventListener("click", (e) => { //add a stop if it's recurry to let them know that if they save it, it'll change it and isolate it... or we just don't care and they'll just have to figure that out on their own?
    if(!trashIt.checked){
      if(newSTing){
        console.log("should stop");
        e.preventDefault();//This is not working
        e.currentTarget.insertAdjacentHTML("beforebegin", `<h5>Don't you want to save your brand new type of show?</h5>
        <h6>(If you don't, just click again!)</h6>`);
        showTypeCreationConfirm.style.color = "red";
        newSTing = false;
      };
      
      // if(document.querySelector('#wholeProjectInput').checked){
      //   todo.wholeProject = true
      //   todo.PColorBG = newProjectColorBG ? newProjectColorBG : todo.PColorBG ? todo.PColorBG : "";
      //   todo.PColorTX = newProjectColorTX ? newProjectColorTX : todo.PColorTX ? todo.PColorTX : "";
      //   todo.Pnickname = newProjectNickname ? newProjectNickname : todo.Pnickname ? todo.Pnickname : "";
      //   if(todo.PColorBG == "" || todo.PColorTX == "" || todo.Pnickname == ""){
      //     console.log("should stop");
      //     e.preventDefault();//This is not working
      //     e.currentTarget.insertAdjacentHTML("beforebegin", `<h5>Something's missing...</h5>`);
      //   } else{
      //     if(mySettings.myProjects && mySettings.myProjects.length > 0){
      //       let indexP = mySettings.myProjects.findIndex(project => project.nickname == todo.Pnickname);
      //       if(indexP && indexP >= 0){
      //         console.log("already existed");
      //         mySettings.myProjects[indexP].colorBG = todo.PColorBG;
      //         mySettings.myProjects[indexP].colorTX = todo.PColorTX;
      //       } else{
      //         console.log("didn't exist");
      //         let myNewProject = {
      //           nickname: todo.Pnickname,
      //           colorBG: todo.PColorBG,
      //           colorTX: todo.PColorTX
      //         };
      //         mySettings.myProjects.push(myNewProject);
      //       };
      //     } else{
      //       console.log("the whole thing didn't exist");
      //       let myNewProject = {
      //         nickname: todo.Pnickname,
      //         colorBG: todo.PColorBG,
      //         colorTX: todo.PColorTX
      //       };
      //       if(!mySettings.myProjects){
      //         mySettings.myProjects = [];
      //         mySettings.myProjects.push(myNewProject);
      //       } else{
      //         mySettings.myProjects.push(myNewProject);
      //       };
            
      //       console.log(mySettings);
      //     };
      //     localStorage.mySettings = JSON.stringify(mySettings);
      //   };
      // } else {
      //   delete todo.wholeProject;
      //   delete todo.PColorBG;
      //   delete todo.PColorTX;
      //   delete todo.Pnickname;
      // };
      
      // if(todo.project == "partProject"){
      //   todo.PColorBG = myProject.colorBG;
      //   todo.PColorTX = myProject.colorTX;
      //   todo.Pnickname = myProject.nickname;
      // }

      // todo.project  = document.querySelector('input[name="projectOptions"]:checked').value;
      // if(todo.project == "wholeProject"){
      //   todo.PColorBG = newProjectColorBG ? newProjectColorBG : todo.PColorBG ? todo.PColorBG : "";
      //   todo.PColorTX = newProjectColorTX ? newProjectColorTX : todo.PColorTX ? todo.PColorTX : "";
      //   todo.Pnickname = newProjectNickname ? newProjectNickname : todo.Pnickname ? todo.Pnickname : "";
      //   if(todo.PColorBG == "" || todo.PColorTX == "" || todo.Pnickname == ""){
      //     console.log("should stop");
      //     e.preventDefault();//This is not working
      //     e.currentTarget.insertAdjacentHTML("beforebegin", `<h5>Something's missing...</h5>`);
      //   } else{
      //     if(mySettings.myProjects && mySettings.myProjects.length > 0){
      //       let indexP = mySettings.myProjects.findIndex(project => project.nickname == todo.Pnickname);
      //       if(indexP && indexP >= 0){
      //         console.log("already existed");
      //         mySettings.myProjects[indexP].colorBG = todo.PColorBG;
      //         mySettings.myProjects[indexP].colorTX = todo.PColorTX;
      //       } else{
      //         console.log("didn't exist");
      //         let myNewProject = {
      //           nickname: todo.Pnickname,
      //           colorBG: todo.PColorBG,
      //           colorTX: todo.PColorTX
      //         };
      //         mySettings.myProjects.push(myNewProject);
      //       };
      //     } else{
      //       console.log("the whole thing didn't exist");
      //       let myNewProject = {
      //         nickname: todo.Pnickname,
      //         colorBG: todo.PColorBG,
      //         colorTX: todo.PColorTX
      //       };
      //       mySettings.myProjects.push(myNewProject);
      //       console.log(mySettings);
      //     };
      //     localStorage.mySettings = JSON.stringify(mySettings);
      //   };
      // } else if(todo.project == "partProject"){
      //   todo.PColorBG = myProject.colorBG;
      //   todo.PColorTX = myProject.colorTX;
      //   todo.Pnickname = myProject.nickname;
      // } else if(todo.project == "notProject"){
      //   delete todo.PColorBG;
      //   delete todo.PColorTX;
      //   delete todo.Pnickname;
      // };
  
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

      // if(where == "todoZone" || where == "searchScreen" || where == "allStorage"){
      //   parents = Array.from(document.querySelectorAll("li")).filter((li) => li.id.includes(todo.id));
      // }; //in the swipingDay Section if it's the date the todo is...)
      parents = Array.from(document.querySelectorAll("li")).filter((li) => li.id.includes(todo.id));
      console.log(parents);
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
      

      
      //parent is global (no need for parent since todoCreation)
      if(todo.recurry == true){
        //we could add an alert saying that if you save it, it's gonna become a whole thing on itself in the big list
        getRecurryDateOut(todo); // donc la date (originale (vu qu'on met calendarSave APRÈS)) du todo est enlevée des recurryDates de son recurringDay
        delete todo.recurry;
        delete todo.recId; //et todo redevient un todo normal!
        listTasks.push(todo); // et le todo est maintenant dans la listTask!
      };
      calendarSave(todo); // 

      //WOLA si todo était stored ou stock et là devient reccuringDay?!

      // if(why == "new" || why == "stock"){
      //   listTasks.push(todo);
      // };
      let todoIndex = listTasks.findIndex(td => td.id == todo.id);
      if(todoIndex == -1){
        listTasks.push(todo);
      };
      // we could also just check if the todo.id is in listTask, and if not, push it there... that way we might not need the why... (check if we use it somewhere else...)


      if(copyIt.checked){ //WOLA! Si c'est stock, il faut enlever les storedId! Si c'est reccuring...
        let newTodo = JSON.parse(JSON.stringify(todo));
        newTodo.id = crypto.randomUUID();
        listTasks.push(newTodo);
        todoCreation(newTodo);
      };

    
      storageSwitch = todo.stock ? true : false;
  
      togoList = getTogoList(todo);
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
       // the li.remove comes later but parents or parent need to have been established before (i.e. do create parents after by looking for li with the todo.id, otherwise you will have erased to new one too!)
      
      
    } else if(trashIt.checked){ //if it's new, there's nothing to do, the todo doesn't exist yet in the listTasks
      //ALSO TRASH THE Project IN MYProjectS!
      if(todo.project == "wholeProject"){
        let indexP = mySettings.myProjects.findIndex(project => project.nickname == todo.Pnickname);
        mySettings.myProjects.splice(indexP, 1);
        localStorage.mySettings = JSON.stringify(mySettings);
      }; //Are partProjects in the wholeProject or not?!
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
      parent.remove();};
    taskInfo.remove();
    clickScreen.classList.add("displayNone");
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
      window.scrollTo({ top: 0 });
    };
    
    
    

    // A REVOIR!!
    // if(where == "searchScreen" || where == "allStorage"){
    //   moving = false;
    //   taskInfo.remove();
    //   clickHandlerAddOn(taskInfo, "trash", clickScreen, togoList);
    //   howToSortIt(togoList); //only if there's a togoList!
    // };
    // if((why == "new" || why == "stock") && togoList !== ""){
    //   scrollToSection(togoList);
    //   taskInfo.remove();
    //   howToSortIt(togoList); //only if there's a togoList!
    // } else if((why == "new" || why == "stock") && togoList == ""){
    //   taskInfo.remove();
    // } else if(where == "todoZone" && togoList !== ""){
    //   moving = true;
    //   parents.forEach(parent => {
    //     parent.remove();
    //   });
    //   parent.remove(); // it wasn't complaining but that was still useless...
    //   clickHandlerAddOn(taskInfo, "trash", clickScreen, togoList);
    //   howToSortIt(togoList); //only if there's a togoList!
    // } else if(where == "todoZone" && togoList == ""){
    //   parents.forEach(parent => {
    //     parent.remove();
    //   });
    //   parent.remove(); // it wasn't complaining but that was still useless...
    //   clickHandlerAddOn(taskInfo, "trash", clickScreen, togoList);
    // } else{ //not in the list, so month/week
    //   moving = false;
    //   taskInfo.remove();
    //   sortItAllWell();
    // };
    updateArrowsColor();
    updateCBC();
    console.log(todo);
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


function scrollToSection(list){
  let listToGo = document.querySelector(`#${list}`);
  let section = listToGo.closest("section");
  if(section.querySelector(".listToggleInput")){
    section.querySelector(".listToggleInput").checked = true;
  } else if(section.querySelector(".swipingInput")){//not sure what that's doing...
    if(list == "listTomorrow"){
      section.querySelector(".swipingInput").checked = true;
    } else if(list == "listToday"){
      section.querySelector(".swipingInput").checked = false;
    };
  };
  section.scrollIntoView();
};

  // let positionA = window.scrollY;
  // let positionB = window.scrollY;
  // let positionDif = positionB - positionA;
  // if(positionDif > 25){
  //   window.scrollTo(0, positionA);
  // };
  

function clickHandlerAddOn(addOn, future, screen, listToGo){
  if(screen == clickScreen){
    parent.classList.remove("selectedTask");
  };
  if(moving && screen == clickScreen){
    scrollToSection(listToGo);
    moving = false;
  };
  if(future == "keep"){
    addOn.classList.add("displayNone");
    document.querySelector("#todoZone").insertAdjacentElement("beforeend", addOn);
  } else if(future == "trash"){
    addOn.remove();
  };
  screen.classList.add("displayNone");
  screen.removeEventListener("click", () => clickHandlerAddOn(addOn, future, screen, listToGo));
};

// function clickHandlerSmallAddOn(addOn, screen){
//   addOn.remove();
//   screen.classList.add("displayNone");
//   screen.removeEventListener("click", () => clickHandlerSmallAddOn(addOn, screen));
// };

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
  
  iconTag.insertAdjacentElement("afterend", iconsPalet);
  iconsPalet.classList.remove("displayNone");
  clickScreen.classList.remove("displayNone");
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
      if(li.dataset.rec && li.dataset.rec !== "undefined"){
        delete li.dataset.rec;
        let oldRecurry = listTasks[recIndex].recurrys.splice(todoIndex, 1);
        delete oldRecurry[0].recurry;
        delete oldRecurry[0].out;
        delete oldRecurry[0].recId;
        listTasks.push(oldRecurry[0]);
      };
      
      localStorage.listTasks = JSON.stringify(listTasks);
      updateCBC();
      clickHandlerAddOn(iconsPalet, "keep", clickScreen);
    });
  });
  clickScreen.addEventListener("click", () => clickHandlerAddOn(iconsPalet, "keep", clickScreen));
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
  options.screen.classList.remove("displayNone");
  labelPalet = document.querySelector("#labelPalet");

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
        if(options.icon){
          removeLabel(todo);
          localStorage.listTasks = JSON.stringify(listTasks);
          updateCBC();
          options.icon.style.color = "var(--tx-color)";
          parent.querySelector(".labelLiOnglet").remove();
          howToSortIt(parent.parentElement.id);
        };
        clickHandlerAddOn(labelPalet, "trash", options.screen, "nowhere");
      } else{
        let label = mySettings.myLabels[e.target.value];
        newlabelColor = label.color;
        newlabelName = label.name;
        options.labelDiv.style.backgroundColor = colorsList[label.color].colorBG;
        options.labelDiv.style.color = colorsList[label.color].colorTX;
        options.labelDiv.innerText = label.name;
        if(options.icon){
          applyLabel(todo, label.color, label.name);
          localStorage.listTasks = JSON.stringify(listTasks);
          updateCBC();
          options.icon.style.color = colorsList[label.color].colorBG;
          howToSortIt(parent.parentElement.id);
          newLabelReset();
          newlabelColor = "";
          newlabelName = "";
        };
        clickHandlerAddOn(labelPalet, "trash", options.screen, "nowhere");
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
      options.labelDiv.style.backgroundColor = colorsList[newLabel.color].colorBG;
      options.labelDiv.style.color = colorsList[newLabel.color].colorTX;
      options.icon ? options.icon.style.color = colorsList[newLabel.color].colorBG : null;
    });
  });
  document.querySelector("#labelNameInput").addEventListener("change", (e) => {
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
        clickHandlerAddOn(labelPalet, "trash", options.screen, "nowhere");
      };
    });
    // cancel btn
    createLabelCancelBtn.addEventListener("click", () => {
      options.labelDiv.style.backgroundColor = colorsList[todo.LColor].colorBG;
      options.labelDiv.style.color = colorsList[todo.LColor].colorTX;
      options.icon.style.color = colorsList[todo.LColor].colorBG;
      options.labelDiv.innerText = todo.LName;
      newLabelReset();
      newlabelColor = "";
      newlabelName = "";
      clickHandlerAddOn(labelPalet, "trash", options.screen, "nowhere");
    });
  };
  options.screen.addEventListener("click", () => clickHandlerAddOn(labelPalet, "trash", options.screen, "nowhere"));
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
function getTodayDateString(){
  let todayDate = new Date();
  let yesterDate = new Date();
  yesterDate.setDate(yesterDate.getDate() - 1);
  let currentHour = String(todayDate.getHours()).padStart(2, "0");
  let currentMinute = String(todayDate.getMinutes()).padStart(2, "0");
  let currentTime = `${currentHour}:${currentMinute}`;
  let date = currentTime <= mySettings.myTomorrow ? yesterDate : todayDate;
  // return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return getStringFromDate(date);
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
  let date = new Date();
  date.setDate(date.getDate() - 7);
  let lastWeekDay= String(date.getDate()).padStart(2, "0");
  let lastWeekMonth = String(date.getMonth()+1).padStart(2, "0");
  let lastWeekYear = date.getFullYear();
  let lastWeekDate = `${lastWeekYear}-${lastWeekMonth}-${lastWeekDay}`;
  return lastWeekDate;
};

// MARK: MONTHLY CALENDAR

let date = new Date();
let todayDate = date.getDate();
let year = date.getFullYear();
let month = date.getMonth(); //pour vrai, enlève le "+ 1"
let monthName = date.toLocaleString('it-IT', { month: 'long' }).toLocaleUpperCase();
let todayWholeDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(todayDate).padStart(2, "0")}`

function putShowsInMonth(monthlyFirst, monthlyLast){
  let filteredShows = listTasks.filter((todo) => todo.term == "showThing" || todo.term == "reminder");
  let shows = [];
  filteredShows.forEach(show => {
    if(show.line == "recurringDay"){
      show.recurryDates.forEach(recurryDate => {
        if(monthlyFirst <= recurryDate && recurryDate <= monthlyLast){
          let recurry = getWholeRecurry(show, recurryDate, show.id);
          // let recurry = JSON.parse(JSON.stringify(show));
          // clearRecurringData(recurry);
          // recurry.id = crypto.randomUUID();
          // recurry.date = recurryDate;
          // recurry.line = "todoDay";
          // recurry.recurry = true;
          // recurry.recId = show.id;
          shows.push(recurry);
        };
      });
    } else{
      shows.push(show);
    };
  });
  let filteredDonedShows = listDones.filter((done) => (monthlyFirst <= done.date && done.date <= monthlyLast));
  filteredDonedShows.forEach(done => {
    done.list.forEach(list => {
      if(list.term == "showThing"){
        list.startDate = done.date;
        list.startTime = list.dalle;
        list.past = true;
        shows.push(list);
      };
    });
  });
  
  let sortedShows = shows.sort((s1, s2) => (s1.startDate < s2.startDate) ? -1 : (s1.startDate > s2.startDate) ? 1 : (s1.startDate == s2.startDate) ? (s1.term < s2.term) ? -1 : (s1.term > s2.term) ? 1 : (s1.term == s2.term) ? (s1.startTime < s2.startTime) ? -1 : (s1.startTime > s2.startTime) ? 1 : 0 : 0 : 0);
  //On n'a probablement pas besoin de les classer par date (juste par dalle) parce que de toutes façons, pour chacun, on cherche la bonne case en fonction de sa date. On veut juste mettre le plus tôt avant le plus tard, donc juste classé par dalle, ça pourrait être assez... et term... pour mettre les reminder en haut... (à moins qu'on fasse kase.insertAdjacentHTML("afterbegin", eventDiv); pour les reminder...)
  shows = sortedShows;
  let today = getTodayDateString();
  shows.forEach(show => {
    let eventDiv;
    if(show.term == "showThing"){
      eventDiv = `<div data-id="${show.id}" data-date="${show.startDate}" ${show.recurry ? `data-rec="${show.recId}"` : ``} data-showType="${show.showType}" ${!show.past ? `onclick="toTIdeCMaM(this)"` : ``} class="eventDiv ${show.past ? "pastEvent" : ""}" style="background-color:${show.STColorBG}; color:${show.STColorTX};">${show.task}</div>`;
    } else if(show.term == "reminder"){
      eventDiv = `<div data-id="${show.id}" data-date="${show.startDate}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${!show.past ? `onclick="toTIdeCMaM(this)"` : ``} class="eventDiv ${show.startDate < today ? "pastEvent" : ""}" style="color:${mySettings.myBaseColors[show.color].colorBG};">${show.task}</div>`;
    };
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
  let trs = [];
  for(let i = 0; i < 6; i++){
    let tds = [];
    for(let j = 0; j < 7; j++){
      let td = `<td ${i == 0 && j == 0 ? `id="monthlyFirst"` : i == 5 && j == 6 ? `id="monthlyLast"` : ``}><div class="circle"></div><span class="typcn typcn-plus addEvent displayNone" onclick="toTIdeCMaN(this)"></span></td>`;
      tds.push(td);
    };
    let tdsF = tds.join("");
    let tr = `<tr>${tdsF}</tr>`;
    trs.push(tr);
  };
  let trsF = trs.join("");
  tbodyMC.innerHTML = trsF;
  getMonthlyCalendar();
  document.querySelector("#monthBackward").addEventListener("click", () => {
    document.querySelectorAll(".circle").forEach(circle => {
      circle.parentElement.classList.remove("selectedKase");
      circle.parentElement.querySelector(".addEvent").classList.add("displayNone");
    });
    document.querySelectorAll(".eventDiv").forEach(div => {
      div.remove();
    });
    month = month > 0 ? month - 1 : 11;
    year = month == 11 ? year - 1 : year;
    getMonthlyCalendar();
  });
  
  document.querySelector("#monthForward").addEventListener("click", () => {
    document.querySelectorAll(".circle").forEach(circle => {
      circle.parentElement.classList.remove("selectedKase");
      circle.parentElement.querySelector(".addEvent").classList.add("displayNone");
    });
    document.querySelectorAll(".eventDiv").forEach(div => {
      div.remove();
    });
    month = month < 11 ? month + 1 : 0;
    year = month == 0 ? year + 1 : year;
    getMonthlyCalendar();
  });
};  


function getMonthlyCalendar(){
  let first = new Date(year, month, 1);
  monthName = first.toLocaleString('it-IT', { month: 'long' }).toLocaleUpperCase();
  monthNameSpace.innerText = monthName;
  yearNameSpace.innerText = year;
  
  let last = new Date(year, month + 1, 0).getDate();
  let firstDay = first.getDay();
  first.setDate(-(firstDay - 1));
  let numStart = first.getDate();
  let i = 0;
  let num = numStart;
  tbodyMC.querySelectorAll(".circle").forEach((td) => {
    td.classList.remove("heresToday");
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
    
    if(td.parentElement.dataset.wholedate == todayWholeDate){
      td.classList.add("heresToday");
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
  document.querySelectorAll(".addEvent").forEach(plus => {
    plus.addEventListener("click", () => {
      
    });
  });
  let monthlyFirst = document.querySelector("#monthlyFirst").dataset.wholedate;
  let monthlyLast = document.querySelector("#monthlyLast").dataset.wholedate;
  putShowsInMonth(monthlyFirst, monthlyLast);
};

function updateMonth(){
  document.querySelectorAll(".circle").forEach(circle => {
    circle.parentElement.classList.remove("selectedKase");
    circle.parentElement.querySelector(".addEvent").classList.add("displayNone");
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
    document.querySelectorAll(".backToTodayBtn").forEach(btn => {
      btn.classList.add("displayNone");
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
  document.querySelectorAll(".backToTodayBtn").forEach(btn => {
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
  let shows = listTasks.filter((todo) => ((todo.term == "showThing" || todo.term == "reminder") && todo.line !== "noDay")); //on enlève "noDay" ou on aurait pu enlever todo.stock == true
  shows.map(show => { //WATCH OUT: if between 00:00 and myTomorrow, it would be yesterday's date so maybe not that week!!
    if(show.line == "recurringDay"){ 
      show.recurryDates.map(recurryDate => {
        if(Dday <= recurryDate && recurryDate <= Sday){//takes only the ones that should show up this week
          let recurry = getWholeRecurry(show, recurryDate, show.id);
          // let recurry = JSON.parse(JSON.stringify(show));
          // clearRecurringData(recurry);
          // recurry.id = crypto.randomUUID();
          // recurry.date = recurryDate;
          // recurry.line = "todoDay";
          // recurry.recurry = true;
          // recurry.recId = show.id;
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
        doned.startDate = done.date;
        doned.startTime = doned.dalle;
        doned.past = true;
        console.log(doned);
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
  let dayIdx = meseDayICalc(show.startDate); //if between 00:00 and myTomorrow, it should be yesterday's date!
  let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
  let day = `${mySettings.myWeeksDayArray[idx].code}`;  
  let div;
  let add;
  if(show.tutto || !show.startTime || show.startTime == ""){
    div = document.querySelector(`[data-tutto="${day}"]`);
    add = `<div data-id="${show.id}" data-date="${show.startDate}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${show.term == "showThing" ? `data-showType="${show.showType}"` : ``} onclick="toTIdeCWaM(this); event.stopPropagation();" class="weeklyEvent ${show.past ? "pastEvent" : ""}" style="${show.term == "showThing" ? `background-color:${show.STColorBG}; color:${show.STColorTX};` : `background-color: var(--bg-color); color:${show.color}; border:none; border-radius: 0;`}">${show.info ? `*` : ``}
    ${show.task} <i class="IconI ${show.icon}"></i>
  </div>`; //add underline if miniList
  } else{
    // now you can take show.dalleRow, show.alleRow, show.primaRow and show.dopoRow (just make sure there's a DATE, because "noDay" can also have them all)
    let primaDiv = ``;
    let dopoDiv = ``;
    div = document.querySelector(".weeklyContainer");
    if(show.prima && show.prima !== "00:00"){
      primaDiv = `<div class="weeklyBuffer ${show.past ? "pastEvent" : ""}" style="grid-column:col-${day}; grid-row:row-${show.primaRow}/row-${show.dalleRow};"></div>`;
    };
    if(show.dopo && show.dopo !== "00:00"){
      dopoDiv = `<div class="weeklyBuffer ${show.past ? "pastEvent" : ""}" style="grid-column:col-${day}; grid-row:row-${show.alleRow}/row-${show.dopoRow};"></div>`;
    };
    add = `
    ${primaDiv}
    <div data-id="${show.id}" data-date="${show.startDate}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${show.term == "showThing" ? `data-showType="${show.showType}"` : ``} onclick="toTIdeCWaM(this); event.stopPropagation();" class="weeklyEvent ${show.past ? "pastEvent" : ""}" style="${show.term == "showThing" ? `background-color:${show.STColorBG}; color:${show.STColorTX};` : `color:${show.color}; border:none;`}  grid-column:col-${day}; grid-row:row-${show.dalleRow}${show.term == "reminder" ? `` : `/row-${show.alleRow}`};">
    ${show.info ? `*` : ``}${show.task}<br />
      <i class="IconI ${show.icon}"></i>
    </div>
    ${dopoDiv}
    `;
    //YOU COULD USE THAT PART TO SHOW THOSE WHO HAVEN'T HAD THE ROW ONES...
    // let primaDiv = ``;
    // let dopoDiv = ``;
    // div = document.querySelector(".weeklyContainer");
    // let hourStart = roundFifteenTime(show.dalle);
    // let hourEnd = (show.alle) ? roundFifteenTime(show.alle) : "end";
    // if(show.prima && show.prima !== "00:00"){
    //   let prima = roundFifteenTime(show.prima);
    //   prima = timeMath(hourStart, "minus", prima);
    //   primaDiv = `<div class="weeklyBuffer ${show.past ? "pastEvent" : ""}" style="grid-column:col-${day}; grid-row:row-${prima}/row-${hourStart};"></div>`;
    // };
    // if(show.dopo && show.dopo !== "00:00"){
    //   let dopo = roundFifteenTime(show.dopo);
    //   dopo = timeMath(hourEnd, "plus", dopo);
    //   dopoDiv = `<div class="weeklyBuffer ${show.past ? "pastEvent" : ""}" style="grid-column:col-${day}; grid-row:row-${hourEnd}/row-${dopo};"></div>`;
    // };
    // add = `
    // ${primaDiv}
    // <div data-id="${show.id}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${show.term == "showThing" ? `data-showType="${show.showType}"` : ``} onclick="toTIdeCWaM(this)" class="weeklyEvent ${show.past ? "pastEvent" : ""}" style="${show.term == "showThing" ? `background-color:${show.STColorBG}; color:${show.STColorTX};` : `color:${show.color}; border:none;`}  grid-column:col-${day}; grid-row:row-${hourStart}${show.term == "reminder" ? `` : `/row-${hourEnd}`};">
    //   ${show.task}<br />
    //   <i class="IconI ${show.icon}"></i>
    // </div>
    // ${dopoDiv}
    // `;
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
  let arrayItem = [];
  let rowYear = `<div class="weeklyItem weeklyTitle weeklyTitleWBtns">
    <button class="weeklyBtn" id="weekBackward">
      <i class="fa-solid fa-caret-left" style="font-size:30px;"></i>
    </button>
    <button class="weeklyBtn backToTodayBtn displayNone" onclick="backToWeeklyToday()">
      <i class="fa-solid fa-calendar-day" style="font-size:16px;"></i>
    </button>
    <span id="weeklyYearSpan" style="flex-grow: 1;">${year}</span>
    <button class="weeklyBtn backToTodayBtn displayNone" onclick="backToWeeklyToday()">
      <i class="fa-solid fa-calendar-day" style="font-size:16px;"></i>
    </button>
    <button class="weeklyBtn" id="weekForward">
      <i class="fa-solid fa-caret-right" style="font-size:30px;"></i>
    </button>
  </div>`;
  let rowMonth = `<div class="weeklyItem weeklyTitle" style="grid-row:2; border-bottom-width: 2px;"><span id="weeklyMonthSpan">${monthName}</span></div>`;
  arrayItem.push(rowYear, rowMonth);
  let myDay = Number(mySettings.myTomorrow.substring(0, 2));
  let numberH;
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
  } else{
    //myDay = Number(mySettings.myTomorrow.substring(0, 2));
    numberH = 24;
  };
  let numberR = numberH + 1;
  for(let c = 1; c < 9; c++){
    let arrayC = [];
    // let rowDay = `<div ${c == 2 ? `id="Dday"` : c == 8 ? `id="Sday"` : ``} class="weeklyItem" style="grid-column:${c}; grid-row:3; font-size:14px; font-weight:600; line-height: calc(((92vh / 29) * 1.5) / 2); border-radius:2px 2px 0 0; border-bottom:1px solid rgba(47, 79, 79, .5);${c == 1 ? " border-radius:2px 0 0 2px; border-right:1px solid rgba(47, 79, 79, .5);" : ""}"${c > 1 ? ` data-code="${mySettings.myWeeksDayArray[c - 2].code}">${mySettings.myWeeksDayArray[c - 2].letter}<br /><span class="weeklyDateSpan"></span>` : `><i class="fa-solid fa-filter"></i>`}</div>`; //shall we add the date as an id, as a data-date or as an area?
    let rowDay = `<div ${c == 2 ? `id="Dday"` : c == 8 ? `id="Sday"` : ``} class="weeklyItem ${c == 1 ? `weeklyDaysRowFilter` : `weeklyDaysRow" style="grid-column:${c};`}"${c > 1 ? ` data-code="${mySettings.myWeeksDayArray[c - 2].code}">${mySettings.myWeeksDayArray[c - 2].letter}<br /><span class="weeklyDateSpan"></span>` : `><button onclick="getWeeklyFilter()" class="displayNone"><i class="fa-solid fa-filter"></i></button>`}</div>`; //shall we add the date as an id, as a data-date or as an area?
    let rowTutto = `<div class="weeklyItem weeklyTutto" ${c > 1 ? `onclick="toTIdeCWaN(this)"` : ``} ${c > 1 ? `data-tutto="${mySettings.myWeeksDayArray[c - 2].code}"` : ``} style="grid-column:${c}; grid-row:4; border-bottom: 1px solid rgba(47, 79, 79, .5);"></div>`;
    arrayC.push(rowDay);
    arrayC.push(rowTutto);
    let line = 5;
    let myDayHere = myDay;
    for(let r = 1; r < numberR; r++){
      let item = `<div class="weeklyItem" ${c > 1 ? `onclick="toTIdeCWaN(this)"` : ``} style="grid-column:${c}; grid-row:${line} / ${line + 4};${c == 1 ? " border-radius:2px 0 0 2px; border-right:1px solid rgba(47, 79, 79, .5);" : ""} ${myDayHere == 23 ? " border-bottom:2px solid rgba(47, 79, 79, .8);" : ""}">${c == 1 ? `${String(myDayHere).padStart(2, "0")}:00` : ``}${mySettings.myTomorrow !== "00:00" && myDayHere == 0 && c > 1 ? `<span class="weeklyAfterDateSpan"></span>` : ``}</div>`;
      arrayC.push(item);
      line += 4;
      myDayHere == 23 ? myDayHere = 0 : myDayHere++;
    };
    let arrayCs = arrayC.join("");
    arrayItem.push(arrayCs);
  };
  let nomiCol = mySettings.myWeeksDayArray.map((giorno) => {
    return `[col-${giorno.code}] 1fr`;
  });
  let firstCol = `[col-Hour] 45px`;
  let lastCol = `[col-end]`;
  nomiCol.unshift(firstCol);
  nomiCol.push(lastCol);
  let nomiCols = nomiCol.join(" ");
  let nomiRow = [];
    
  
  for(let h = 0; h < numberH; h++){ //93
    let rowH = `[row-${String(myDay).padStart(2, "0")}-00${h == 0 ? ` row-tutto-end` : ``}] minmax(0, .25fr)`;
    let rowH15 = `[row-${String(myDay).padStart(2, "0")}-15] minmax(0, .25fr)`;
    let rowH30 = `[row-${String(myDay).padStart(2, "0")}-30] minmax(0, .25fr)`;
    let rowH45 = `[row-${String(myDay).padStart(2, "0")}-45] minmax(0, .25fr)`;
    nomiRow.push(rowH, rowH15, rowH30, rowH45);
    myDay == 23 ? myDay = 0 : myDay++;
  };
  
  let firstRows = `[row-Year] 1fr [row-Month] 1fr [row-Day] 1.5fr [row-tutto] 1fr`;
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
  let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
  date.setDate(date.getDate() - idx);
  putDatesInWeek(date);
  
  document.querySelector("#weekBackward").addEventListener("click", () => {
    let todayAreaDiv = document.querySelector(".todayArea");
    if(todayAreaDiv){
      todayAreaDiv.remove();
      document.querySelector(".nowArea").remove();
      document.querySelectorAll(".backToTodayBtn").forEach(btn => {
        btn.classList.remove("displayNone");
      });
    };
    // let nowAreaDiv = document.querySelector(".nowArea");
    // if(nowAreaDiv){
    //   nowAreaDiv.remove();
    // };
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
      document.querySelector(".nowArea").remove();
      document.querySelectorAll(".backToTodayBtn").forEach(btn => {
        btn.classList.remove("displayNone");
      });
    };
    // let nowAreaDiv = document.querySelector(".nowArea");
    // if(nowAreaDiv){
    //   nowAreaDiv.remove();
    // };
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

// function addNewWeekly(thisOne){
//   let rowNum = thisOne.style.gridRowStart;
//   let hourMath = ((rowNum - 5) / 4) + 3;
//   let hourNum = hourMath < 24 ? hourMath : hourMath - 24;
//   let rowhour = `${String(hourNum).padStart(2, "0")}:00`;
//   let colNum = thisOne.style.gridColumnStart;
//   let code = mySettings.myWeeksDayArray[colNum - 2].code;
//   let colEl = document.querySelector(`[data-code="${code}"]`);
//   let colDate = colEl.dataset.date;
//   // we need a date
//   console.log(colNum);
//   console.log(code);
//   console.log(colDate);
// };

// window.addNewWeekly = addNewWeekly;

window.onload = () => {
  setTimeout(function() {
    document.getElementById("loadingScreen").classList.replace("waitingScreen", "displayNone");
  }, 500);
};
// window.onload = () => {
//   document.getElementById("loadingScreen").classList.replace("waitingScreen", "displayNone");
// };


/* function busyZoneCreation(show){ //first try
  //don't forget to add the sleepAreas and mealAreas too, in the scheduling weekly

  //we'll need the day (column) too (NO! because the column can change with the settings.. no? or maybe not...)

  console.log(show);
  let dayIdx = meseDayICalc(show.date);
  let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
  let day = `${mySettings.myWeeksDayArray[idx].code}`;  
  //if tutto... do we start after the sleepArea or the whole column with myTomorrow?
  let myClockIn = roundFifteenTime(mySettings.myWeeksDayArray[idx].clockIn); // returns 10-00
  let myClockOut = roundFifteenTime(mySettings.myWeeksDayArray[idx].clockOut); // returns 02-00
  let clockIn = myClockIn;
  let clockOut = myClockOut < mySettings.myTomorrow.replace(":", "-") ? "end" : myClockOut;
  // clockIn et clockOut vont toujours être plus grand que 00-00! Ça prend la date aussi! dans les show.dalle et show.alle et donc à considérer dans weekly too!
  let start;
  let end;
  if(show.tutto || !show.dalle || show.dalle == ""){
    if(mySettings.offAreas == true){
      start = clockIn;
      end = clockOut;
    } else{
      start = "00-00";
      end = "end";
    };
  } else{
    let prima = "";
    let hourStart = roundFifteenTime(show.dalle);
    let hourEnd = show.alle ? roundFifteenTime(show.alle) : mySettings.offAreas == true ? clockOut : "end";
    let dopo = "";
    if(show.prima && show.prima !== "00:00"){
      prima = roundFifteenTime(show.prima);
      prima = timeMath(hourStart, "minus", prima);
    };
    if(show.dopo && show.dopo !== "00:00"){
      dopo = roundFifteenTime(show.dopo);
      dopo = timeMath(hourEnd, "plus", dopo);
    };
    start = prima !== "" ? prima : hourStart;
    end = dopo !== "" ? dopo == "00-00" ? "end" : dopo : hourEnd == "00-00" ? "end" : hourEnd;
  };
  let busy = {
    type: "once", //"sempre" if appears at each week, like sleep and meal
    date: show.date,
    col: day,
    start: start,
    end: end
  }; // then all we have to do is make sure the date is in that particular showing week and we add the div to the weekly! It should go straight in the right column and rows
  myBusies.push(busy);

  //filter myBusies by col, then sort by start
  // for(i = 0; i < myBFS.lenght; i++){
    // let breakStart = myBFS[i].end;
    // let breakEnd = myBFS[i + 1].start;
    // timeMath(breakEnd, "minus", breakStart);
    // if(breakEnd - breakStart > buffer + event + buffer){
      // creation
    //}
  //}
}; */
//localStorage.myBusies = JSON.stringify(myBusies);

function busyZoneCreation(show){
  let dayIdx = meseDayICalc(show.startDate);
  let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
  let day = `${mySettings.myWeeksDayArray[idx].code}`;  
  let start = show.primaRow ? show.primaRow : show.dalleRow ? show.dalleRow : "11-00"; //There won't be a dalleRow if it's tutto!
  start = start <= "11-00" ? "11-00" : start; // we should have a mySettings.myWeeksDayArray[idx].peopleClockIn instead of 11:00
  let end = show.dopoRow ? show.dopoRow : show.alleRow ? show.alleRow : "02-00"; 
  end = end < mySettings.myTomorrow.replace(":", "-") ? "end" : end;
  let meal = (show.showType !== "Calia" && show.prima >= "03:00") ? true : false;
  

  let busy = {
    type: "once", //"sempre" if appears at each week, like sleep and meal
    date: show.startDate,
    col: day,
    start: start,
    end: end,
    meal: meal
  }; // then all we have to do is make sure the date is in that particular showing week and we add the div to the weekly! It should go straight in the right column and rows
  myBusies.push(busy);

};







// function onLongPress(element, list, callback) {
//   let timer;
//   let wholeList;
//   let siblings;
//   // element.addEventListener('touchstart', (e) => { 
//   //   timer = setTimeout(() => {
//   //     timer = null;
//   //     element.classList.add("dragging");
//   //     console.log(element);
//   //     wholeList = document.querySelector("#" + list);
//   //     siblings = [...wholeList.querySelectorAll("li:not(.dragging)")];
//   //     console.log(siblings);
//   //     callback(e, list);
//   //   }, 500);
//   // });
//   element.addEventListener('dragstart', (e) => { 
//       element.classList.add("dragging");
//       console.log(element);
//       wholeList = document.querySelector("#" + list);
//       siblings = [...wholeList.querySelectorAll("li:not(.dragging)")];
//       console.log(siblings);
//       //callback(e);
//   });
//   function cancel(e) {
//     clearTimeout(timer);
//     e.currentTarget.classList.remove("dragging");
//     setNewOrder(list);
//   };
//   function drapDropIt(e){
//     e.preventDefault();
//     // let wholeList = document.querySelector("#" + list);
//     //const draggingLi = document.querySelector(".dragging");
//     // let siblings = [...wholeList.querySelectorAll("li:not(.dragging)")];
//     console.log(siblings);
//     let nextSibling = siblings.find(sibling => {
//       if (e.clientX) {
//         //if mouse
//         return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
//       } else {
//         //if touch
//         return e.changedTouches[0].clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
//       };
//     });
//     //nextSibling.insertAdjacentElement("beforebegin", element);
//     wholeList.insertBefore(element, nextSibling);
//   };
//   element.addEventListener('touchmove', (e) => {
//     drapDropIt(e);
//   });
//   element.addEventListener('dragover', (e) => {
//     drapDropIt(e);
//   });
//   element.addEventListener('touchend', (e) => {
//     cancel(e);
//   });
//   element.addEventListener('dragend', (e) => {
//     cancel(e);
//   });
//   element.addEventListener('drop', (e) => {
//     cancel(e);
//   });
// };

// function setNewOrder(list){
//   let n = 1;
//   document.querySelectorAll("#" + list + " > li").forEach(li => {
//     li.setAttribute("data-order", n);
//     let todoIndex = listTasks.findIndex(el => el.id == li.id);
//     let todo = listTasks[todoIndex];
//     todo.order = n;
//     n++;
//   });
//   localStorage.listTasks = JSON.stringify(listTasks);
//   updateCBC();
// };
//When you commit/push this big changes:
  //Run the code in the sandbox first to change the colors to numbers (and urges to priority), then upload the changes, then remove these lines (in getTaskSettings AND in getDones), THEN commit and push
  //Also, change (in firestore) the names of the lists in mySorting (or create new ones and delete the old ones in firestore)

import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, signOut, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { app, analytics, db, auth, provider } from "../myFirebase.js";
import trans from "../trans.js";
auth.languageCode = 'fr';

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
  };
});

function logOut(){
  signOut(auth).then(() => {
    // Sign-out successful.
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
  myTomorrow: "03:00",
  myFavoriteView: "switchPageInputList",
  myFirstDayOfTheWeek: "domenica",
  myWeeksDayArray: [{
    day: 0,
    name0Maj: "domenica",
    name1Maj: "Domenica",
    nameNoAcc: "domenica",
    letter: "D",
    code: "D0",
    clockIn: "10:00",
    clockOut: "02:00"
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
let switchSortArray = ["fa-solid fa-arrow-right-arrow-left fa-rotate-90", "fa-solid fa-pen-ruler", "fa-solid fa-hashtag", "fa-regular fa-hourglass-half", "typcn typcn-tag sortingTag", "fa-solid fa-arrow-down-a-z", "fa-solid fa-icons"];
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
      document.querySelector("#cloudIt").className = `${wantedPage.dataset.cloudit}`;
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

async function getTasksSettings() {
  const getTasks = await getDoc(doc(db, "randomTask", auth.currentUser.email));
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
  myBusies = [];
  // mySettings.myWeeksDayArray.forEach(day => {
  //   let busyIn = {
  //     type: "sempre", //"sempre" if appears at each week, like sleep and meal
  //     col: day.code,
  //     start: "00-00",
  //     end: roundFifteenTime(day.clockIn)
  //   };
  //   myBusies.push(busyIn);
  //   if(!(day.clockOut > "00:00" && day.clockOut < mySettings.myTomorrow)){
  //     console.log(day.clockOut);
  //     let busyOut = {
  //       type: "sempre",
  //       col: day.code,
  //       start: roundFifteenTime(day.clockOut),
  //       end: "end"
  //     };
  //     myBusies.push(busyOut);
  //   };
  // });

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
  
  listTasks.forEach(todo => {
//Modify all the event to busy
    // if(todo.term == "showThing" && todo.line !== "recurringDay" && todo.line !== "noDay"){
    //   busyZoneCreation(todo);
    // } else if(todo.term == "showThing" && todo.line == "recurringDay"){
    //   todo.recurrys.forEach(recurry => busyZoneCreation(recurry));
    // };

    // if(todo.line == "doneDay"){
    //   todo.deadline = todo.date;
    //   todo.line = "noDay";
    //   delete todo.date;
    // };
    // if(todo.line !== "recurringDay"){
      // todo.status = "todo";
      // myList.push(todo);
    // };
    
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
//{collection} randomTask
  //{document} email
    //{collection} mySchedule
      //{document} myBusies: [{type:_(sempre/once), date:_, col:_, start:_, end:_}, {}] (busy)

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


// *** CLOUDSAVE

async function saveToCloud(){
  const batch = writeBatch(db);
  // myList = JSON.parse(localStorage.myList);
  // myDones2023 = JSON.parse(localStorage.myDones2023);
  listTasks = JSON.parse(localStorage.listTasks);
  mySettings = JSON.parse(localStorage.mySettings);
  const docRefTasks = doc(db, "randomTask", auth.currentUser.email);
  const docSnapTasks = await getDoc(docRefTasks);
  
  if (docSnapTasks.exists()){
    batch.update(doc(db, "randomTask", auth.currentUser.email), { // or batch.update or await updateDoc
      // myDones2023: myDones2023
      // myDones202401: myDones202401,
      // myDones202402: myDones202402
      // myList: myList
      listTasks: listTasks,
      mySettings: mySettings //on a tu besoin de le mettre là, si il se sauve à chaque fois qu'on save les setting?... showtype vs settings...
    });
  } else{
    batch.set(doc(db, "randomTask", auth.currentUser.email), { // or batch.set or await setDoc
      // myDones2023: myDones2023
      // myDones202401: myDones202401,
      // myDones202402: myDones202402
      // myList: myList
      listTasks: listTasks,
      mySettings: mySettings
    });
  }; 
  // myBusies = JSON.parse(localStorage.myBusies);
  // const docRefBusies = doc(db, "randomTask", auth.currentUser.email, "mySchedule", "myBusies");
  // const docSnapBusies = await getDoc(docRefBusies);
  // if (docSnapBusies.exists()){
  //   batch.update(doc(db, "randomTask", auth.currentUser.email, "mySchedule", "myBusies"), { // or batch.update or await updateDoc
  //     myBusies: myBusies
  //   });
  // } else{
  //   batch.set(doc(db, "randomTask", auth.currentUser.email, "mySchedule", "myBusies"), { // or batch.set or await setDoc
  //     myBusies: myBusies
  //   });
  // }; 

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
  myBusies = [];
  resetModif();
  resetCBC();
  getTasksSettings();
  getDones();
  createBody();
  getWeeklyCalendar();
  settingsPage();
  clearStorageBtn.textContent = "Updated!";
  updateArrowsColor();
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
    <button id="clearStorageBtn" style="margin-top: 15px;">Update</button>
    <hr />
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
    <h3>When are you clocking in and out?</h3>
    <div class="clockingDiv">
      ${clockingOptions}
    </div>
    <button id="settingsBtn" class="ScreenBtn1">yep <span class="typcn typcn-thumbs-up" style="padding: 0;font-size: 1em;"></span></button>
    <button id="cancelBtn" class="ScreenBtn2">Cancel</button>
    <button id="logOutBtn" onclick="logOut()" class="ScreenBtn1" style="margin-right: 0; margin-bottom: 0; border-radius: 15px; font-size: .8em;">I'm out! <i class="fa-solid fa-person-through-window" style="display: block; margin-top: 3px;"></i></button>`;

    let switchModeSlider = document.querySelector("#switchModeSlider");
    let timeInput = document.querySelector("#timeInput");
    let clearStorageBtn = document.querySelector("#clearStorageBtn");
    let exitX = document.querySelector("#exitX");
    let cancelBtn = document.querySelector("#cancelBtn");
    let settingsBtn = document.querySelector("#settingsBtn");
    
    if(mySettings.myTomorrow){
      timeInput.value = mySettings.myTomorrow;
    };
    let previousTomorrow = timeInput.value;
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

    clearStorageBtn.addEventListener("click", updateFromCloud);
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
      resultDate = listTasks.filter(todo => todo.pPosition !== "in" && todo.date == searchDate.value || todo.line == "recurringDay");
      let count = 0;
      if(resultDate.length == 0){
        searchSwitch = false;
      } else{
        resultDate.forEach(todo => {
          if(todo.line == "recurringDay"){
            let recurrys = todo.recurrys.filter(recurry => recurry.date == searchDate.value);
            if(recurrys.length == 0){
            } else{
              todoCreation(todo);
              console.log(todo);
              count++;
              recurrys.forEach(recurry => {
                todoCreation(recurry);
                console.log(recurry);
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
    if(todo.deadline && todo.deadline !== todo.date){ // && todo.status == "todo"
      let modifiedDalle = todo.finoAlle ? todo.finoAlle.replace(":", "-") : "5-00";
      todoDeadlineTime = `${todo.deadline}-${modifiedDalle}`;
    };
    if(todo.date){ // && todo.status == "todo"
      let modifiedDalle = todo.dalle ? todo.dalle.replace(":", "-") : "5-00";
      todoDateTime = `${todo.date}-${modifiedDalle}`;
    } else if(todo.line == "recurringDay"){
      todo.recurrys.forEach(recurry => {
        let modifiedDalle = recurry.dalle ? recurry.dalle.replace(":", "-") : "5-00";
        let todoTime = `${recurry.date}-${modifiedDalle}`;
        if((thatdayTime < todoTime) && (todoTime < thatnextdayTime) || (thatdayTime < todoDeadlineTime) && (todoDeadlineTime < thatnextdayTime)){
          todoCreation(recurry);
        };
      });
    };
    if((thatdayTime < todoDateTime) && (todoDateTime < thatnextdayTime) || (thatdayTime < todoDeadlineTime) && (todoDeadlineTime < thatnextdayTime)){
      todoCreation(todo);
    };
  });
  sortIt("datetime", "listToday");
};


// *** CREATION

function todoCreation(todo){
  let togoList;
  let numberedDays;
  let todayDate = getDateTimeFromString(getTodayDateString(), mySettings.myTomorrow);
  if(projectSwitch){
    togoList = "projectUl"; // s'assurer de tous les créer: todo "in" et "out" et term=="wholeProject" aussi!
  } else if(searchSwitch){
    togoList = "searchFound";
  } else if(thatDaySwitch){
    todayDate = getDateTimeFromString(thatdayDate, mySettings.myTomorrow);
    if(todo.term == "reminder"){
      togoList = "listTodayReminder";
    } else {
      togoList = "listToday";
    };
  } else{
    togoList = getTogoList(todo);
  };
  
  if((todo.deadline && todo.deadline !== "") || togoList == "listOups"){
    let doneDate;
    if(todo.deadline && todo.deadline !== ""){
      let time = todo.finoAlle ? todo.finoAlle : mySettings.myTomorrow;
      doneDate = getDateTimeFromString(todo.deadline, time);
    } else if(togoList == "listOups"){
      let time = todo.dalle ? todo.dalle : mySettings.myTomorrow;
      doneDate = getDateTimeFromString(todo.date, time);
    };
    numberedDays = Math.floor((doneDate - todayDate)/(1000 * 3600 * 24));
  };
  if(togoList !== ""){ //what happens if one is stock/stored AND recurring/recurry?
    if(todo.stock){
      document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-term="${todo.term}" ${todo.dalle ? `data-time="${todo.dalle}"` : ``}" class="${todo.term == "showThing" ? todo.label ? `showLiLabel` : `showLi` : todo.term == "sameHabit" ? `sameHabit` : todo.term == "reminder" ? `reminder` : ``}" style="${todo.term == "showThing" ? `background-color: ${todo.STColorBG}; color: ${todo.STColorTX};` : ``}">
      ${todo.label ? `<div class="labelOnglet labelLiOnglet" style="background-color:${colorsList[todo.LColor].colorBG}; color:${colorsList[todo.LColor].colorTX};">${todo.LName}</div>` : `<div class="noLabel"></div>`}
      <i class="typcn typcn-trash" onclick="trashStockEvent(this)"></i><i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i><div class="textDiv"><span class="text" onclick="taskAddAllInfo${searchSwitch ? `(this, 'searchScreen', 'mod')` : `(this, 'todoZone', 'mod')`}" style="${todo.miniList ? `text-decoration:underline; text-decoration-thickness:1px;` : ``}${todo.term == "showThing" ? "" : ` color:${mySettings.myBaseColors[todo.color].colorBG}; flex-shrink: 0;`}">${todo.term == "reminder" ? `<i class="typcn typcn-bell" style="font-size: 1em; padding: 0 5px 0 0;"></i>` : ``}${todo.info ? '*' : ''}${todo.task}</span>${todo.term !== "showThing" ? `<hr style="border-color:${mySettings.myBaseColors[todo.color].colorBG};" />` : ``}<span class="timeSpan">${todo.dalle ? todo.dalle : ''}</span></div><i class="fa-solid fa-recycle" onclick="taskAddAllInfo${searchSwitch ? `(this, 'searchScreen', 'stock')` : `(this, 'todoZone', 'stock')`}"></i></li>`);
    } else if(todo.line == "recurringDay"){ //when recurring doesnt have any recurry anymore, it blocks here too
      let time = todo.recurrys[0].dalle ? todo.recurrys[0].dalle : mySettings.myTomorrow;
      let nextDate = getDateTimeFromString(todo.recurrys[0].date, time);
      numberedDays = Math.floor(Math.abs(nextDate.getTime() - todayDate.getTime())/(1000 * 3600 * 24));
      document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-term="${todo.term}" ${todo.dalle ? `data-time="${todo.dalle}"` : ``}" class="${todo.term == "showThing" ? todo.label ? `showLiLabel` : `showLi` : todo.term == "sameHabit" ? `sameHabit` : todo.term == "reminder" ? `reminder` : ``}" style="${todo.term == "showThing" ? `background-color: ${todo.STColorBG}; color: ${todo.STColorTX};` : ``}">
      ${todo.label ? `<div class="labelOnglet labelLiOnglet" style="background-color:${colorsList[todo.LColor].colorBG}; color:${colorsList[todo.LColor].colorTX};">${todo.LName}</div>` : `<div class="noLabel"></div>`}
      <i class="typcn typcn-trash" onclick="trashRecurringEvent(this)"></i>
      <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i>
      <div class="textDiv"><span class="text" onclick="taskAddAllInfo${searchSwitch ? `(this, 'searchScreen', 'mod')` : `(this, 'todoZone', 'mod')`}" style="${todo.miniList ? `text-decoration:underline; text-decoration-thickness:1px;` : ``}${todo.term == "showThing" ? "" : ` color:${mySettings.myBaseColors[todo.color].colorBG};`}">${todo.term == "reminder" ? `<i class="typcn typcn-bell" style="font-size: 1em; padding: 0 5px 0 0;"></i>` : ``}${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan">${todo.dalle ? todo.dalle : ''}</span></div>
      <div class="numberedCal ${mySettings.mySide == "dark" ? `numberedCalDark` : ``}" onclick="smallCalendarChoice(this)"><i class="typcn typcn-calendar-outline calendarSpan ${todo.term == "showThing" ? "" : todo.dealine ? `doneDay` : todo.line}"></i><span style="${todo.term == "showThing" ? `text-shadow: -0.75px -0.75px 0 ${todo.STColorBG}, 0 -0.75px 0 ${todo.STColorBG}, 0.75px -0.75px 0 ${todo.STColorBG}, 0.75px 0 0 ${todo.STColorBG}, 0.75px 0.75px 0 ${todo.STColorBG}, 0 0.75px 0 ${todo.STColorBG}, -0.75px 0.75px 0 ${todo.STColorBG}, -0.75px 0 0 ${todo.STColorBG}; color:${todo.STColorTX};` : ``}">${numberedDays}</span></div></li>`);
    } else if(todo.term == "reminder"){
      document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" ${todo.date ? `data-date="${todo.date}"` : ``} ${todo.dalle ? `data-time="${todo.dalle}"` : ``} ${todo.recurry ? `data-rec="${todo.recId}"` : ``} class="reminderClass">
        <i class="typcn typcn-bell" style="font-size: 1em;"></i>
        <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}" style="font-size: .8em;"></i>
        <div class="textDiv"><span onclick="taskAddAllInfo${searchSwitch ? `(this, 'searchScreen', 'mod')` : `(this, 'todoZone', 'mod')`}" class="text" style="${todo.miniList ? `text-decoration:underline; text-decoration-thickness:1px; ` : ``}color:${mySettings.myBaseColors[todo.color].colorBG}; font-size: 1em;">${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan" style="font-size: .8em;" onclick="timeItEvent(this)">${todo.dalle ? todo.dalle : ""}</span>
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
      document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" ${todo.date ? `data-date="${todo.date}"` : ``} ${todo.dalle ? `data-time="${todo.dalle}"` : ``} ${todo.recurry ? `data-rec="${todo.recId}"` : ``} ${todo.term == "alwaysHere" ? `data-always="here"` : ``} class="${todo.term == "showThing" ? todo.label ? `showLiLabel` : `showLi` : todo.term == "sameHabit" ? `sameHabit` : ``}${todo.pPosition == "out" ? ` projectLi` : ``}${togoList == "listOups" && numberedDays < -5 ? ` selectedTask` : ``}" style="${todo.term == "showThing" ? `background-color: ${todo.STColorBG}; color: ${todo.STColorTX};` : ``}${todo.pPosition == "out" ? `outline-color: ${colorsList[pColor].colorBG5}; border-color:${colorsList[pColor].colorBG};` : ``}">
        ${todo.label ? `<div class="labelOnglet labelLiOnglet" style="background-color:${colorsList[todo.LColor].colorBG}; color:${colorsList[todo.LColor].colorTX};">${todo.LName}</div>` : `<div class="noLabel"></div>`}
        ${pOngletsDiv}
        <div class="urgeCheck" style="color: ${todo.urge ? todo.urgeColor : ``}" ${todo.urge || todo.label ? `onclick="checkOrUrge(this)"` : `onclick="checkEvent(this, 'norm')"`}>
          <i class="typcn typcn-media-stop-outline emptyCheck"></i>
          <span>${todo.urge ? todo.urgeNum : ``}</span>
        </div>
        <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i>
        <div class="textDiv"><span onclick="taskAddAllInfo${searchSwitch ? `(this, 'searchScreen', 'mod')` : `(this, 'todoZone', 'mod')`}" class="text" style="${todo.miniList ? `text-decoration:underline; text-decoration-thickness:1px;` : ``}${todo.term == "showThing" ? `` : ` color:${mySettings.myBaseColors[todo.color].colorBG};`}">${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan" onclick="timeItEvent(this)">${todo.dalle ? todo.dalle : ""}</span>
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
        <button onclick="taskAddAllInfo(this, 'todoZone', 'pro')">Yeah, thanks</button></div>` : ``}
        </div>
        <div class="numberedCal ${mySettings.mySide == "dark" ? `numberedCalDark` : ``}" onclick="smallCalendarChoice(this)">
          <i class="typcn typcn-calendar-outline calendarSpan ${todo.term == "showThing" ? `` : todo.recurry ? "recurry" : todo.deadline ? `doneDay` : todo.line}"></i>
          <span class="${(todo.deadline && todo.deadline !== "") || togoList == "listOups" ? `` : `displayNone`}" style="${todo.term == "showThing" ? `text-shadow: -0.75px -0.75px 0 ${todo.STColorBG}, 0 -0.75px 0 ${todo.STColorBG}, 0.75px -0.75px 0 ${todo.STColorBG}, 0.75px 0 0 ${todo.STColorBG}, 0.75px 0.75px 0 ${todo.STColorBG}, 0 0.75px 0 ${todo.STColorBG}, -0.75px 0.75px 0 ${todo.STColorBG}, -0.75px 0 0 ${todo.STColorBG}; color:${todo.STColorTX};` : ``}">${(todo.deadline && todo.deadline !== "") || togoList == "listOups" ? numberedDays : ``}</span>
        </div>
      </li>`);
    };
  };
};


let hierOggiTime = timeLimit("hierOggi");
let oggiDemainTime = timeLimit("oggiDemain");
let demainApresTime = timeLimit("demainApres");
function getTogoList(todo){ 
  //console.log(todo);
  let todoDateTime;
  let todoDeadlineTime;
  if(todo.deadline && todo.deadline !== todo.date){
    let modifiedDalle = todo.finoAlle ? todo.finoAlle.replace(":", "-") : "5-00";
    todoDeadlineTime = `${todo.deadline}-${modifiedDalle}`;
  };
  if(todo.date){
    let modifiedDalle = todo.dalle ? todo.dalle.replace(":", "-") : "5-00";
    todoDateTime = `${todo.date}-${modifiedDalle}`;
  };

  let togoList;
  if(todo.newShit){
    togoList = "listLimbo";
  } else if(todo.stock){
    togoList = "listStorage";
  } else if(todo.line == "recurringDay"){
    togoList = "listRecurring";
    //recurryCreation(todo);
    recurryOuting(todo);
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

function checkOrUrge(thisOne){
  clickScreen.classList.remove("displayNone");
  let li = thisOne.parentElement;
  // let checkId = li.id.startsWith("copy") ? li.id.substring(4) : li.id;
  let checkId = li.id;
  let todo;
  if(li.dataset.rec && li.dataset.rec !== "undefined"){
    let recId = li.dataset.rec;
    let recIndex = listTasks.findIndex(todo => todo.id == recId);
    let todoIndex = listTasks[recIndex].recurrys.findIndex(todo => todo.id == checkId);
    todo = listTasks[recIndex].recurrys[todoIndex];
  } else{
    let todoIndex = listTasks.findIndex(todo => todo.id == checkId);
    todo = listTasks[todoIndex];
  };
  console.log(todo);
  li.insertAdjacentHTML("beforeend", `<div class="checkOrUrgeDiv">
  ${todo.label ? `<i class="fa-solid fa-pen-ruler" style="font-size: 1.2em;color:${colorsList[todo.LColor].colorBG};"></i>` : ``}
  <i class="typcn typcn-input-checked-outline" style="font-size: 1.8em;color:var(--tx-color);" onclick="checkEvent(this, 'urge')"></i>
  ${todo.urge ? `<input id="newUrgeNumInput" type="number" value="${todo.urgeNum}"/>
  </div>` : ``}`);
  let checkOrUrgeDiv = document.querySelector(".checkOrUrgeDiv");
  clickScreen.addEventListener("click", () => clickHandlerSmallAddOn(checkOrUrgeDiv, clickScreen));
  let urgeCheckDiv = li.querySelector("div.urgeCheck");
  if(todo.urge){
    let newUrgeNumInput = document.querySelector("#newUrgeNumInput");
    newUrgeNumInput.addEventListener("change", () => {
      if(newUrgeNumInput.value == 0){
        delete todo.urge;
        delete todo.urgeNum;
        delete todo.urgeColor;
        urgeCheckDiv.style.color = mySettings.myBaseColors[0].colorBG;
        urgeCheckDiv.querySelector("span").textContent = "";
        urgeCheckDiv.setAttribute("onclick", "checkEvent(this, 'norm')");
      } else{
        todo.urgeNum = newUrgeNumInput.value;
        urgeCheckDiv.querySelector("span").textContent = newUrgeNumInput.value;
      };
      localStorage.listTasks = JSON.stringify(listTasks);
      checkOrUrgeDiv.remove();
      colorUrges("next");
      updateCBC();
      clickHandlerSmallAddOn(checkOrUrgeDiv, clickScreen);
    });
  };
};
window.checkOrUrge = checkOrUrge;

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
        li.querySelector("div.urgeCheck").style.color = urges[i].urgeColor;
        li.querySelector("div.urgeCheck > span").textContent = urges[i].urgeNum;
      };
    };
    sortIt("urge", "topPriorityList");
  };
};


function recurryOuting(todo){ //todo == le recurring (newtodo est le recurry/normal qui est pris de l'array d'objet todo.recurrys)
  
  //First let's make sure there are still dates in listDates, if it's fineMai; otherwise calculate more, but not from dal, from last date + 1
  // let hierOggiTime = timeLimit("hierOggi");
  // let demainApresTime = timeLimit("demainApres");
  let idx = 0;
  let recurry = todo.recurrys[idx];
  if(!recurry){
    console.log(todo);
    let todoIndex = listTasks.findIndex(todo => todo.id == todo.id);
    listTasks.splice(todoIndex, 1);
  } else{
    let dateTime = `${recurry.date}-${recurry.dalle ? recurry.dalle.replace(":", "-") : "5-00"}`; //when recurring doesnt have any recurry anymore, it blocked here first (that I fixed... but the other line still blocks)
    
    while (dateTime < oggiDemainTime){
      if((dateTime < hierOggiTime && todo.term !== "sameHabit")){
        todo.recurrys.splice(idx, 1);
        //WOLA il faudrait aussi todo.listDates.splice(0, 1);
      } else{
        if(!document.getElementById(recurry.id)){
          todoCreation(recurry);
          recurry.out = true; // out, mais encore dans les recurrys; pas dans listTasks...
          //WOLA what about todo.listDates.splice(0, 1);
          //WOLA attention, quand tu sort un recurry (parce que modifié), il faudrait-y pas que tu enlève la date aussi de listDates?
          idx++;
        } else{
          idx++;
        };
      };
      
      recurry = todo.recurrys[idx];//Vu qu'on splice pas, on utilise idx qui ++; donc on met out = true pour savoir que le li a déjà été créé pour pas en recréé un à chaque refresh
      if(!recurry){
        //console.log("oups!");
        console.log(todo);
        if(todo.fineOpt == "fineMai"){
          todo.dal = todo.listDates[todo.listDates.length - 1];
          let newDate = getDateFromString(todo.dal);
          if(todo.var == "giorno"){
            ogniOgni(todo, newDate);
          } else if(todo.var == "settimana"){
            ogniSettimana(todo, newDate);
          } else if(todo.var == "mese"){
            if(todo.meseOpt == "ogniXDate"){
              ogniOgni(todo, newDate);
            } else if(todo.meseOpt == "ogniXDay"){
              ogniMeseDay(todo, newDate);
            };
          } else if(todo.var == "anno"){
              ogniOgni(todo, newDate);
          };
          idx = 0;
          recurry = todo.recurrys[idx];
          dateTime = `${recurry.date}-${recurry.dalle ? recurry.dalle.replace(":", "-") : "5-00"}`;
        } else{
          //alert(`${todo.task} is over!`);
          break;
        };
      } else{
        dateTime = `${recurry.date}-${recurry.dalle ? recurry.dalle.replace(":", "-") : "5-00"}`;
      };
    };
  };
  localStorage.listTasks = JSON.stringify(listTasks);
};

// function recurryCreation(todo){ //todo == le recurring (newtodo est le recurry/normal qui est créé)
//   //First let's make sure there are still dates in listDates, if it's fineMai; otherwise calculate more, but not from dal, from last date + 1
//   let hierOggiTime = timeLimit("hierOggi");
//   let demainApresTime = timeLimit("demainApres");
//   let dateTime = `${todo.listDates[0]}-${todo.dalle ? todo.dalle.replace(":", "-") : "5-00"}`;
//   while ((hierOggiTime < dateTime) && (dateTime < demainApresTime)){
//     let date = todo.listDates[0];
//     //
//     let newTodo = JSON.parse(JSON.stringify(todo));
//     clearRecurringData(newTodo);
//     newTodo.id = crypto.randomUUID();
//     newTodo.date = date;
//     newTodo.line = "todoDay";
//     newTodo.recurry = true;
//     listTasks.push(newTodo);
//     if(todo.fineOpt == "fineMai" && todo.listDates.length == 1){
//       let newDate = date.setDate(date.getDate() + 1);//doesn't work! si c'est chaque année au 29 nov, là tu vas être au 30 nov... mais tu veux pas non plus, en avoir deux pour la même date (le dernier ici et le premier nouveau...) À moins qu'on ne fasse pas le dernier...
//       if(todo.var == "giorno" || todo.var == "anno"){
//         ogniOgni(todo, date);
//       } else if(todo.var == "settimana"){
//         ogniSettimana(todo, date);
//       } else if(todo.var == "mese"){
//         if(todo.meseOpt == "ogniXDate"){
//           ogniOgni(todo, date);
//         } else if(todo.meseOpt == "ogniXDay"){
//           ogniMeseDay(todo, date);
//         };
//       };
//     };
//     todo.listDates.splice(0, 1);
//     localStorage.listTasks = JSON.stringify(listTasks);
//     todoCreation(newTodo);
//     updateCBC();
//     dateTime = `${todo.listDates[0]}-${todo.dalle ? todo.dalle.replace(":", "-") : "5-00"}`;
//   };
// };

function donedCreation(donedDate, doned){
  document.getElementById(donedDate).insertAdjacentHTML("beforeend", `<li ${doned.term == "showThing" ? `class="showLi" style="background-color: ${doned.STColorBG}; color: ${doned.STColorTX};"` : ``}><i class="typcn typcn-tick"></i><span class="textDone" ${doned.term == "showThing" ? `` : `style="color:${mySettings.myBaseColors[doned.color].colorBG};"`}>${doned.task}</span><i class="typcn typcn-trash" onclick="trashDoneEvent(this)"></i><i class="fa-regular fa-calendar-xmark" onclick="reDateEvent(this)"></i><i class="typcn typcn-arrow-sync" onclick="recycleEvent(this)"></i></li>`);
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
    taskAddAllInfo("addForm", "todoZone", "new"); //taskAddAllInfo(null, "todoZone", "new");
    addForm.reset();
  };
});

function recycleEvent(recycle){ //from Done
  let recycleLi = recycle.parentElement;
  let recycleId = recycleLi.id.slice(5);
  let recycleDate = recycleLi.parentElement.id;
  for (const i in listDones) {
    if (listDones[i].date == recycleDate) {
      let doned = listDones[i].list[recycleId];
      let todo = JSON.parse(JSON.stringify(doned));
      todo.id = crypto.randomUUID();
      todo.line = "noDay";
      listTasks.push(todo);
      localStorage.listTasks = JSON.stringify(listTasks);
      //maybe we could do like in reuseItEvent and open taskInfo instead...
      todoCreation(todo);
      sortItAll();
      updateCBC();
      document.querySelector("#listInput").checked = true;
      document.querySelector("#wheneverLists").scrollIntoView();
    };
  };    
};
window.recycleEvent = recycleEvent;

function stockCreaction(todo){ 
  clearRecurringData(todo);
  let newTodo = JSON.parse(JSON.stringify(todo));
  newTodo.id = crypto.randomUUID();
  delete newTodo.date;
  newTodo.line = "noDay";
  newTodo.stock = true; //is in storage
  newTodo.storedId = [todo.id];
  
  listTasks.push(newTodo);
  todo.stored = true; //has a model in storage
  todo.stockId = newTodo.id;
  localStorage.listTasks = JSON.stringify(listTasks);
  todoCreation(newTodo);
  sortItAll();
  document.querySelector("#storageInput").checked = true;
  document.querySelector("#storageList").scrollIntoView();
};

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
    clickHandlerAddOn(reDateDiv, "trash", clickScreen, "nowhere");
  });
};

window.reDateEvent = reDateEvent;

// *** DONE/ERASE
let num = 0;

doneNextBtn.addEventListener("click", () => {
  let doneId = wheneverList[num].id;
  let doneLi = document.getElementById(doneId);
  if(doneLi.dataset.rec && doneLi.dataset.rec !== "undefined"){
    let rec = doneLi.dataset.rec;
    gotItDone(doneId, rec);
  } else{
    gotItDone(doneId, "");
  };
  doneLi.remove();
  updateCBC();
  //gotItDone(doneId);
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

function checkEvent(emptyCheck, where){
  let li;
  if(where == "norm"){
    li = emptyCheck.parentElement;
  } else if(where == "urge"){
    li = emptyCheck.parentElement.parentElement;
  };
  let donedId = li.id;
  if(li.dataset.rec && li.dataset.rec !== "undefined"){
    let rec = li.dataset.rec;
    gotItDone(donedId, rec);
    li.remove();
  } else if(li.dataset.always){
    gotItDone(donedId, "here");
    // no   li.remove();
  } else{
    gotItDone(donedId, "");
    li.remove();
  };
  updateCBC();
};
window.checkEvent = checkEvent;


function gotItDone(nb, rec){ //nb = todo.id, rec = recurring Id (or "" if directly in listTasks)
  let doned;
  if(rec !== "" && rec !== "here"){ //it's a recurry! and rec is its recurring id
    let recurringIndex = listTasks.findIndex(todo => todo.id == rec);
    let donedTaskIndex = listTasks[recurringIndex].recurrys.findIndex(todo => todo.id == nb);
    let donedTaskSplice = listTasks[recurringIndex].recurrys.splice(donedTaskIndex, 1);
    doned = donedTaskSplice[0];
    if(doned.urge){
      colorUrges("next");
    };    
    localStorage.listTasks = JSON.stringify(listTasks);
  } else if(rec == "here"){ //it's an alwaysHere
    let donedTaskIndex = listTasks.findIndex(todo => todo.id == nb);
    doned = listTasks[donedTaskIndex];
  } else{
    let donedTaskIndex = listTasks.findIndex(todo => todo.id == nb);
    if(listTasks[donedTaskIndex].stored == true){
      // console.log(listTasks[donedTaskIndex]);
      let donedTaskId = listTasks[donedTaskIndex].id;
      let stockId = listTasks[donedTaskIndex].stockId;
      let stockIndex = listTasks.findIndex(todo => todo.id == stockId);
      // console.log(listTasks[stockIndex]);
      listTasks[stockIndex].storedId = listTasks[stockIndex].storedId.filter(id => id !== donedTaskId);
    };

    let donedTaskSplice = listTasks.splice(donedTaskIndex, 1);
    doned = donedTaskSplice[0];
    if(doned.urge){
      colorUrges("next");
    };    
    localStorage.listTasks = JSON.stringify(listTasks);
  };
  
  let donedDate = getTodayDateString(); //return
  let donedItem = JSON.parse(JSON.stringify(doned)); //we copy the doned
  donedItem.id = crypto.randomUUID();
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
  let trashId = trashLi.id; 
  trashStock(trashId); 
  updateCBC();
};
window.trashStockEvent = trashStockEvent;

function trashStock(trashId){
  let trashIndex = listTasks.findIndex(todo => todo.id == trashId);
  let trash = listTasks[trashIndex];
  if(trash.storedId.length > 0){
    trash.storedId.forEach(todoId => {
      let todoIndex = listTasks.findIndex(todo => todo.id == todoId);
      delete listTasks[todoIndex].stored;
      delete listTasks[todoIndex].stockId;
    });
  };
  listTasks.splice(trashIndex, 1);
  localStorage.listTasks = JSON.stringify(listTasks);
  document.getElementById(trashId).remove();
};

function trashRecurringEvent(thisOne){
  let trashLi = thisOne.parentElement;
  let trashId = trashLi.id;
  let trashIndex = listTasks.findIndex(todo => todo.id == trashId);
  listTasks[trashIndex].recurrys.forEach(recurry => {
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

// *** SORT
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
          first = li[i].querySelector("div.urgeCheck > span").textContent;
          first = first > 0 ? first : Infinity;
          second = li[i + 1].querySelector("div.urgeCheck > span").textContent;
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
        first = li[i].querySelector("div.urgeCheck > span").textContent;
        first = first > 0 ? first : Infinity;
        second = li[i + 1].querySelector("div.urgeCheck > span").textContent;
        second = second > 0 ? second : Infinity;
      } else if(type == "datetime"){
        first = `${li[i].dataset.date ? li[i].dataset.date : ""}-${li[i].dataset.time ? li[i].dataset.time.replace(":", "-") : ""}`;
          second = `${li[i + 1].dataset.date ? li[i + 1].dataset.date : ""}-${li[i + 1].dataset.time ? li[i + 1].dataset.time.replace(":", "-") : ""}`;
      } else if(type == "deadline"){
        first = li[i].querySelector("div.numberedCal > span").textContent ? Number(li[i].querySelector("div.numberedCal > span").textContent) : Infinity;
        console.log(first);
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
      if(sort == "fa-solid fa-pen-ruler"){
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
        type = todo.date; //for schedule...
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
  for(let i = 0; i < mySettings.mySorting.length; i++){
    sortItWell(i);
  };
};

// *** SHUFFLE
let wheneverList = [];
let listPage = document.querySelector("#listPage");
let toDoPage = document.querySelector("#toDoPage");
shuffleBtn.addEventListener("click", () => {
  let todayDate = getTodayDateString(); //that might not work getTodayTime()
  // wheneverList = listTasks.filter(task => ((!task.date || task.date == "" || task.date <= todayDate) && (task.line !== "recurringDay" && !task.stock)) || (task.date > todayDate && task.line == "doneDay")); 
  wheneverList = listTasks.filter(task => (task.term == "oneTime" || task.term == "longTerm" || task.term == "alwaysHere") && !task.stock && task.line !== "recurringDay"); 
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
  if(todo.dalle){
    input.value = todo.dalle;
  };
  input.classList.remove("displayNone");
  input.addEventListener("change", () => {
    if(!input.value){
      thisOne.innerHTML = `<i class="fa-regular fa-clock"></i>`;
      delete todo.dalle;
      delete todo.dalleRow;
      li.setAttribute("data-time", "");
    } else if(input.value){
      thisOne.textContent = input.value;
      todo.dalle = input.value;
      todo.dalleRow = roundFifteenTime(todo.dalle);
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
        recurry.dalle = todo.dalle;
        if(recurry.out){
          document.getElementById(recurry.id).setAttribute("data-time", todo.dalle);
        };
      });
    };
    
    localStorage.listTasks = JSON.stringify(listTasks);
    updateCBC();
  });
};
window.timeItEvent = timeItEvent;

// *** SAVE THE DATE
let moving = false;
let parent;


let clickScreen = document.querySelector("#clickScreen");
let newWidth;
function smallCalendarChoice(thisOne){
  //thisOne = taskToDate est l'icon calendar
  moving = false;
  parent = thisOne.parentElement;
  let togoList = parent.parentElement.id;
  parent.classList.add("selectedTask");
  parent.scrollIntoView();
  clickScreen.classList.remove("displayNone");
  let div = parent.querySelector(".textDiv");
  let width = getComputedStyle(div).width;
  let num = width.slice(0, -2);
  newWidth = Number(num) + 44;
  let todo;
  let recIndex;
  let todoIndex;
  // let parentId = parent.id.startsWith("copy") ? parent.id.substring(4) : parent.id;
  let parentId = parent.id;
  if(parent.dataset.rec && parent.dataset.rec !== "undefined"){
    let rec = parent.dataset.rec;
    recIndex = listTasks.findIndex(todo => todo.id == rec);
    todoIndex = listTasks[recIndex].recurrys.findIndex(todo => todo.id == parentId);
    todo = listTasks[recIndex].recurrys[todoIndex];
  } else{
    todoIndex = listTasks.findIndex(todo => todo.id == parentId);
    todo = listTasks[todoIndex];
  };
  let parents = Array.from(document.querySelectorAll("li")).filter((li) => li.id.includes(todo.id));
  creatingCalendar(todo, thisOne, "onIcon");
  let calendarDiv = document.querySelector("#calendarDiv");
  clickScreen.addEventListener("click", () => clickHandlerAddOn(calendarDiv, "trash", clickScreen, togoList));
  document.querySelector("#saveTheDateBtn").addEventListener("click", () => {
    let previousList = parent.parentElement.id;
    calendarSave(todo);
    if(parent.dataset.rec && parent.dataset.rec !== "undefined"){
      let oldRecurry = listTasks[recIndex].recurrys.splice(todoIndex, 1);
      delete oldRecurry[0].recurry;
      delete oldRecurry[0].out;
      delete oldRecurry[0].recId;
      listTasks.push(oldRecurry[0]);
    };
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
    sortItAll();
    updateCBC();
    clickHandlerAddOn(calendarDiv, "trash", clickScreen, togoList);
  });

};

window.smallCalendarChoice = smallCalendarChoice;

function creatingCalendar(todo, home, classs){
  let rec = todo.line == "recurringDay" ? true : false;
  let shw = (todo.term == "showThing" || todo.term == "reminder") && !todo.stock ? true : false;
  let date = todo.date ? todo.date : rec ? todo.dal : getTodayDateString();
  
  let daysWeek = mySettings.myWeeksDayArray.map((day, idx) => {
    return `<input type="checkbox" name="daysWeekChoice" class="cossin" id="${day.nameNoAcc}" value="${idx}" ${(rec && todo.var == "settimana" && todo.daysWeek && todo.daysWeek.includes(day.nameNoAcc)) ? `checked` : meseDayICalc(date) == idx ? `checked` : ``} />
    <label for="${day.nameNoAcc}" class="dayCircle">${day.letter}</label>`;
  }).join("");

  let todoDayDiv = `<div id="todoDaySection" ${todo.stock ? `class="displayNone"` : ``}>
  <input class="myRadio" type="radio" id="todoDayInput" name="whatDay" value="todoDay" ${todo.line == "todoDay" || (shw && todo.line !== "recurringDay") ? `checked` : ``} />
  <label for="todoDayInput" id="todoDayInputLabel" class="whatDayLabel calendarMargin"><p><span class="myRadio"></span><span class="normalText todoDay">${shw ? `Happening Day` : `To-do Day`}</span><br /><span class="smallText">${shw ? `(the day this is all gonna go down)` : `(the day you want to do it)`}</span></p></label>
  <div class="DaySection" id="oneDaySection">
    <h5 class="taskInfoInput" style="margin-left: 0;">It's a one time thing</h5>
    <div class="inDaySection" style="width: -webkit-fill-available; max-width: 200px;">
      <input type="date" id="oneDayDateInput" class="centerDateInput" value="${date}" />
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
</div>`;

  let recurringDayDiv = `<div id="recurringDaySection" ${todo.recurry || todo.stock ? `class="displayNone"` : ``}>
    <input class="myRadio" type="radio" id="recurringDayInput" name="whatDay" value="recurringDay" ${rec ? `checked` : ``} />
    <label for="recurringDayInput" class="whatDayLabel calendarMargin"><p><span class="myRadio"></span><span class="normalText recurringDay">Recurring Day</span><br /><span class="smallText">(let it come back on its own)</span></label></p></label>
    <div class="DaySection" id="recurryDaySection">
      <h5 class="taskInfoInput" style="margin-left: 0;">It's a recurring thing</h5>
      <div class="inDaySection" style="width: -webkit-fill-available; max-width: 280px;">
        <p class="calendarInsideMargin">Dal<input id="dalInput" type="date" style="margin: 0 10px;" value="${date}" /></p>
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
          <p><span>c'è un inizio?</span><input id="recuTimeDalleInput" type="time" class="dalle dalleTxt" value="${todo.dalle ? todo.dalle : ``}" /></p>
          <p><span>c'è una fine?</span><input id="recuTimeAlleInput" type="time" class="alle alleTxt" value="${todo.alle ? todo.alle : ``}" /></p>
        </div>
        <p class="calendarInsideMargin">Si ripete ogni<input id="ogniInput" type="number" style="width: 50px; margin: 0 10px;" value="${todo.ogni ? todo.ogni : ``}" />
        <select id="timeVariationInput">
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
          <input class="myRadio" type="radio" name="meseOptions" id="ogniXDate" ${rec && todo.var == "mese" && todo.meseOpt == "ogniXDate" ? `checked` : ``} value="ogniXDate" />
          <label for="ogniXDate" style="display: block;"><span class="myRadio"></span><span id="ogniXDateText"></span></label>
          <input class="myRadio" type="radio" name="meseOptions" id="ogniXDay" ${rec && todo.var == "mese" && todo.meseOpt == "ogniXDay" ? `checked` : ``} value="ogniXDay" />
          <label for="ogniXDay"><span class="myRadio"></span><span id="ogniXDayText"></span></label>
        </div>
        <div class="calendarInsideMargin">
          <p>Termina</p>
          <input class="myRadio" type="radio" name="fineOptions" id="fineMaiInput" value="fineMai" ${!rec ? `checked` : todo.fineOpt == "fineMai" ? `checked` : ``} />
          <label for="fineMaiInput" style="display: block;"><span class="myRadio"></span>Mai</label>
          <input class="myRadio" type="radio" name="fineOptions" id="fineGiornoInput" value="fineGiorno" ${rec && todo.fineOpt == "fineGiorno" ? `checked` : ``} />
          <label for="fineGiornoInput" style="display: block;"><span class="myRadio"></span>Il giorno<input id="fineDate" type="date" style="margin: 0 10px;" value="${rec && todo.fineOpt == "fineGiorno" ? todo.fine : ``}" /></label>
          <input class="myRadio" type="radio" name="fineOptions" id="fineDopoInput" value="fineDopo" ${rec && todo.fineOpt == "fineDopo" ? `checked` : ``} />
          <label for="fineDopoInput" style="display: block;"><span class="myRadio"></span>Dopo<input id="fineCount" type="number" style="width: 50px; margin: 0 10px;" value="${rec && todo.fineOpt == "fineDopo" ? todo.fineCount : ``}" />occorrenza</label>
        </div>
      </div>
    </div>
  </div>`;

  let noDayDiv = `<div id="noDaySection" ${shw ? `class="displayNone"` : ``}>
    <input class="myRadio" type="radio" id="noDayInput" name="whatDay" value="noDay" ${todo.line == "noDay" || todo.line == "" || !todo.line || todo.stock ? `checked` : ``} />
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
          <p><span>ci sarrà un inizio?</span><input id="noDayTimeDalleInput" type="time" class="dalle dalleTxt" value="${todo.dalle ? todo.dalle : ``}" /></p>
          <p><span>ci sarrà una fine?</span><input id="noDayTimeAlleInput" type="time" class="alle alleTxt" value="${todo.alle ? todo.alle : ``}" /></p>
        </div>
      </div>
    </div>
  </div>`;

  let bufferDiv = `<div id="bufferSection" class="calendarMargin" style="margin-top:20px;">
    <h5 class="taskInfoInput" style="margin-left: 0;">How long will that really take?</h5>
    <div class="inDaySection" style="width: -webkit-fill-available; max-width: 200px;">
      <p style="margin-top: 10px;"><span>Before: </span><input id="primaBuffer" type="time" step="900" value="${todo.prima ? todo.prima : `00:00`}" /></p>
      <p><span>After: </span><input id="dopoBuffer" type="time" step="900" value="${todo.dopo ? todo.dopo : `00:00`}" /></p>
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

  let smallCalendar = `<div id="calendarDiv" class="${classs}" style="width:${newWidth}px;">
    ${classs == "onIcon" ? `<h5 class="taskInfoInput">Tell me when...</h5>` : ``}
    <div>
      ${todoDayDiv}
      ${recurringDayDiv}
      ${noDayDiv}
      ${bufferDiv}
      ${busyDiv}
      ${deadlineDiv}
    </div>
    ${classs == "onIcon" ? `<button id="saveTheDateBtn" class="calendarMargin">STD<br /><span class="smallText">(Save The Date)</span></button>` : ``}
  </div>`;
  if(classs == "onIcon"){
    home.insertAdjacentHTML("afterend", smallCalendar);
  } else{
    home.insertAdjacentHTML("beforeend", smallCalendar);
  };
  

  if(!todo.recurry){
    meseCalculate(date);//need it here otherwise the text just isn't there, because, ci-bas, meseCalculate only happens when var is changed, but if it is mese from the beginning, it wouldn't happen (week is taken care of earlier when we check them all)
    let weekSection = document.querySelector("#weekSection");
    let monthSection = document.querySelector("#monthSection");
    let timeVariationInput = document.querySelector("#timeVariationInput");

    timeVariationInput.addEventListener("change", () => {
      date = document.querySelector("#dalInput").value;
      if(timeVariationInput.value == "settimana"){
        weekCalculate(date);
        weekSection.classList.remove("displayNone");
        monthSection.classList.add("displayNone");
      } else if(timeVariationInput.value == "mese"){
        meseCalculate(date);
        weekSection.classList.add("displayNone");
        monthSection.classList.remove("displayNone");
      } else{
        weekSection.classList.add("displayNone");
        monthSection.classList.add("displayNone");
      };
    });
    document.querySelector("#dalInput").addEventListener("change", () => {
      date = document.querySelector("#dalInput").value;
      weekCalculate(date);
      meseCalculate(date);
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
  })
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
};

function calendarSave(todo){ // no need to work on the parent! because todoCreation!!
  clearRecurringData(todo);
  todo.line = document.querySelector('input[name="whatDay"]:checked').value;
  // the 3 of them (noDay, todoDay and recurringDay) can have time and buffer
  let inDaySection = document.querySelector('input[name="whatDay"]:checked ~ div.DaySection > div.inDaySection');
  todo.tutto = inDaySection.querySelector('input[type="checkbox"].tuttoGiornoInput').checked ? true : false;
  let primaBuffer = document.querySelector("#primaBuffer");
  let dopoBuffer = document.querySelector("#dopoBuffer");
  todo.prima = primaBuffer.value ? primaBuffer.value : "00:00";
  todo.dopo = dopoBuffer.value ? dopoBuffer.value : "00:00";
  if(todo.tutto){
    //delete todo.prima; //otherwise, if it's stock, we loose all the buffers!
    delete todo.primaRow;
    delete todo.dalle;
    delete todo.dalleRow;
    delete todo.alle;
    delete todo.alleRow;
    //delete todo.dopo; //otherwise, if it's stock, we loose all the buffers!
    delete todo.dopoRow;
  } else{
    let dalle = inDaySection.querySelector('input[type="time"].dalle');
    if(dalle && dalle.value !== ""){
      todo.dalle = dalle.value;
      todo.dalleRow = roundFifteenTime(todo.dalle); //returns time rounded to 15s with a - instead of a : (for the row-name in weekly)
      if(todo.prima && todo.prima !== "00:00"){
        let prima = roundFifteenTime(todo.prima);
        todo.primaRow = timeMath(todo.dalleRow, "minus", prima); //returns time rounded to 15s with a - instead of a : (for the row-name in weekly)
      };
    } else{
      delete todo.dalle;
      delete todo.dalleRow;
      todo.tutto = true;
    };
    let alle = inDaySection.querySelector('input[type="time"].alle');
    if(alle && alle.value !== ""){
      todo.alle = alle.value;
      todo.alleRow = todo.alle ? roundFifteenTime(todo.alle) : "end";
      if(todo.dopo && todo.dopo !== "00:00"){
        let dopo = roundFifteenTime(todo.dopo);
        todo.dopoRow = timeMath(todo.alleRow, "plus", dopo);
      };
    } else{
      delete todo.alle;
      delete todo.alleRow;
    };
  };
  

  todo.busy = document.querySelector("#busyInput").checked ? true : false;
  if(todo.busy){ //first, you need to put this AFTER the todo.date has been established, second, you should only do this if... (you know what, busy shouldn't be checked by default (unless it's a show))
    //busyZoneCreation(todo);
  };

  if(todo.line == "noDay"){
    delete todo.date; //there could still be a dalle, alle and tutto
 //if it was a recurry, it's gonna be arranged after calendarSave (delete of the recurry)
  } else if(todo.line == "recurringDay"){
    delete todo.date;
    todo.dal = inDaySection.querySelector("#dalInput").value;
    todo.ogni = inDaySection.querySelector("#ogniInput").value;
    todo.var = inDaySection.querySelector("#timeVariationInput").value; 
    todo.fineOpt = inDaySection.querySelector('input[name="fineOptions"]:checked').value;
    if(todo.fineOpt == "fineGiorno"){
      todo.fine = inDaySection.querySelector("#fineDate").value;
    } else if(todo.fineOpt == "fineDopo"){
      todo.fineCount = inDaySection.querySelector("#fineCount").value;
    };
    let date = getDateFromString(todo.dal);
    if(todo.var == "giorno"){
      ogniOgni(todo, date);
    } else if(todo.var == "settimana"){
      let daysWeek = [];
      inDaySection.querySelectorAll('input[name="daysWeekChoice"]').forEach(choice => {
        if(choice.checked == true){
          daysWeek.push(choice.value);
        };
      });
      todo.daysWeek = daysWeek;
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
    // recurryCreation(todo);
    recurryOuting(todo);
  } else if(todo.line == "todoDay"){
    todo.date = inDaySection.querySelector('input[type="date"].centerDateInput').value;
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
};



//todo.newShit => si présent et true, veut dire qu'il vient d'être créé (est deleted après)
//todo.status => "todo" ou "done"
//todo.doneDate => date (string) où ça a été coché fait
//todo.id
//todo.task
//todo.info
//todo.color => number (index in mySettings.myBaseColors)
//todo.icon
//todo.term => {project: "wholeProject"}, {task: "oneTime", "longTerm", "nextThing", "waitForIt", "alwaysHere", "crazyShit"}, {event: "showThing"}, {habit: "sameHabit"}, {rappel: "reminder"}
//todo.urge
//todo.urgeNum
//todo.urgeColor
//todo.miniList
  //todo.miniList[].name
  //todo.miniList[].type
  //todo.miniList[].color number (index in mySettings.myBaseColors) 
  //todo.miniList[].checked
//todo.miniHide //the checked must be hidden if true
//todo.showType => nom du showType (pas sûre que ça soit nécessaire/c'est utile pour la recherche!)
//todo.STColorBG => couleur du background du showType
//todo.STColorTX => couleur du texte du showType
//todo.STColor => index of mySettings.myShowTypes but That doesn't work! we would want the index of colorsList (to rethink)
//todo.date
//todo.line => "todoDay", "recurringDay", "noDay" ("doneDay" ne sert qu'à mettre le calendrier rouge)
//todo.tutto => true/false si ça dure toute la journée ou si on considère 'dalle' et 'alle'
//todo.deadline => date (string) du deadline (if no deadline, delete)
//todo.dlTutto => true/false if deadline is all day or not (if no deadline, delete)
//todo.finoAlle => heure (string) du deadline (if no deadline, delete)
//todo.dalle => time à laquelle ça commence aussi anciennement todo.time (pour les event)
//todo.dalleRow = "00-00" rounded to fifteen
//todo.alle => time à laquelle ça fini
//todo.alleRow = "00-00" rounded to fifteen (if there's no alle, then "end")
//todo.prima => durée du buffer avant l'event
//todo.primaRow = heure à laquelle le buffer commence ("00-00" rounded to fifteen)
//todo.dopo => durée du buffer après l'event
//todo.dopoRow = heure à laquelle le buffer fini ("00-00" rounded to fifteen)
//todo.stored => true/false (has a model in storage)
//todo.stockId
//todo.stock => true/false (is a model in storage)
//todo.storedId = []
//todo.dal => date que ça commence
//todo.ogni => numéro de répétition
//todo.var => timeVariation, type de variation : "giorno", "settimana", "mese" or "anno"
//todo.daysWeek => [] : "domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi" or "sabato"
//todo.meseOpt => option mois : "ogniXDate" or "ogniXDay"
//todo.meseDate => jour du mois où ça revient (xx)
//todo.meseDayN => numéro du day (1e, 2e, 3e, ou 4e)
//todo.meseDayI => index du day (0 = domenica, 1 = lunedi, 2 = martedi, etc)
//todo.fineOpt => option quand ça fini: "fineMai", "fineGiorno" or "fineDopo"
//todo.fine => jour que ça fini (date)
//todo.fineCount => nombre d'occurences après lesquelles ça fini
//todo.listDates = []
//todo.recurrys = [{}] array de tout les recurry (object) créés à partir de la listDates
//todo.recId = (pour les recurry seulement) id du todo qui est le recurring (l'original)
//todo.recurry => true/false means it's one occurence of a recurring (calendar icon purple) (anciennement "recurry" in todo.line)
//todo.out => true (le <li> du recurry a été créé) / false ou inexistant (le <li> n'a pas encore été créé)
//todo.recurring => aucune idée à quoi ça sert...
//todo.label
//todo.LName
//todo.LColorTX
//todo.LColorBG //these two should be todo.lColor = index of colorsList
//If it's a PROJECT
  //todo.pNickname => nickname du project à mettre dans le label
  //todo.pColor => index of colorsList
  //todo.pParts => [id des todo et project inclus dans ce project (en ordre)]
//If it's PART of a PROJECT (a project can be part of an other project)
  //todo.pParents => [id des projets parents, en ordre du plus parent au moins parent] (oui, juste les id; on ira chercher la couleur du dernier; comme ça, si ça change, on le change juste une fois, pas pour chaque parts)
  //todo.pPosition => "out" (shows in the todoZone with the colors of its closest parent) -- "in" (doesn't show in the todoZone but shows in the Project's TaskInfo) -- "done" (shows in the doneZone; doesn't show in the todoZone but shows in the Project's TaskInfo but as done (crossLined))
//mySettings.myShowTypes.name
//mySettings.myShowTypes.colorBG => background-color
//mySettings.myShowTypes.colorTX => color (text)
//mySettings.myShowTypes.color => index of colorsList (only for newly created showTypes, not my 4 old ones)


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
  } else if(todo.fineOpt == "fineDopo" || todo.fineOpt == "fineMai"){
    start = 1;
    stop = todo.fineCount ? Number(todo.fineCount) : 50;
    count = true;
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
  listDates = pruning(todo, listDates);
  todo.listDates = listDates;
  allRecurrysCreation(todo);
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
  } else if(todo.fineOpt == "fineDopo" || todo.fineOpt == "fineMai"){
    start = 1;
    stop = todo.fineCount ? Number(todo.fineCount) : 50;
    count = true;
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
  listDates = pruning(todo, listDates);
  todo.listDates = listDates;
  allRecurrysCreation(todo);
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
  } else if(todo.fineOpt == "fineDopo" || todo.fineOpt == "fineMai"){
    start = 1;
    stop = todo.fineCount ? Number(todo.fineCount) : 50;
    count = true;
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
  listDates = pruning(todo, listDates);
  todo.listDates = listDates;
  allRecurrysCreation(todo);
};



function pruning(todo, listDates){
  let hierOggiTime = timeLimit("hierOggi");
  let time = todo.dalle ? todo.dalle.replace(":", "-") : "5-00";
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

function allRecurrysCreation(todo){
  todo.recurrys = todo.listDates.map(date => {
    let newTodo = JSON.parse(JSON.stringify(todo));
    clearRecurringData(newTodo);
    newTodo.id = crypto.randomUUID();
    newTodo.date = date;
    newTodo.line = "todoDay";
    newTodo.recurry = true;
    newTodo.recId = todo.id;
    return newTodo;
  });
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

function taskAddAllInfo(thisOne, where, why){ //where == "todoZone", "calWeekPage", "calMonthPage", "searchScreen"
  //why == "new", "mod", "pro", "stock"
  moving = false; //must stay false in month/week/search
  let div;
  let todo;
  let parents;
  let togoList;
  let recIndex;
  let todoIndex;
  // NOPE!! chaque day in month et chaque item in weekly va avoir son onclick et on va aller en chercher la date et l'heure et mettre ça dans le nouveau todo!
  if(why == "new" && where == "calWeekPage"){ //in month/weekly creation of a new one
    let colNum = thisOne.style.gridColumnStart;
    let code = mySettings.myWeeksDayArray[colNum - 2].code;
    let colEl = document.querySelector(`[data-code="${code}"]`);
    let colDate = colEl.dataset.date;
    todo = {
      newShit: true,
      id: crypto.randomUUID(),
      color: "0",
      icon: "fa-solid fa-ban noIcon",
      term: "showThing",
      line: "todoDay",
      date: colDate
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
      todo.dalle = rowHour;
      todo.alle = rowHourEnd;
      todo.tutto = false;
    };
    listTasks.push(todo);
    newWidth = Number(window.innerWidth - 20);
    div = document.getElementById(where);
  } else if(why == "new" && where == "calMonthPage"){
    let kaseDate = thisOne.parentElement.dataset.wholedate;
    todo = {
      newShit: true,
      id: crypto.randomUUID(),
      color: "0",
      icon: "fa-solid fa-ban noIcon",
      term: "showThing",
      line: "todoDay",
      tutto: true,
      date: kaseDate
    };
    listTasks.push(todo);
    newWidth = Number(window.innerWidth - 20);
    div = document.getElementById(where);
  } else if(thisOne == "addForm"){
    todo = {
      newShit: true,
      id: crypto.randomUUID(),
      color: "0",
      icon: "fa-solid fa-ban noIcon",
      term: "oneTime",
      line: "noDay"
    };
    listTasks.push(todo);
    newWidth = Number(window.innerWidth - 16);
    div = document.getElementById(where);
  } else if(why == "stock"){
    let reuseLi = thisOne.parentElement;
    let reuseId = reuseLi.id;
    let reuseIndex = listTasks.findIndex(todo => todo.id == reuseId);
    let reuse = listTasks[reuseIndex];
    todo = JSON.parse(JSON.stringify(reuse));
    todo.id = crypto.randomUUID();
    todo.stored = true;
    todo.stockId = reuse.id;
    todo.line = "todoDay";
    todo.date = getTodayDateString();
    delete todo.stock;
    delete todo.storedId;
    listTasks.push(todo);
    reuse.storedId.push(todo.id);
    newWidth = Number(window.innerWidth - 16);
    div = document.getElementById(where);
    console.log(todo);
    div.scrollIntoView(); 
  } else{
    let parentId;
    if(where == "todoZone" || where == "searchScreen"){ //not in month/week
      if(why == "pro"){
        div = thisOne.parentElement.parentElement; 
        thisOne.parentElement.remove();
      } else{
        div = thisOne.parentElement;
      }; 
      parent = div.parentElement; 
      parentId = parent.id;
      togoList = parent.parentElement.id; 
      parent.classList.add("selectedTask");
      parent.scrollIntoView(); 
      let width = getComputedStyle(div).width; 
      let num = width.slice(0, -2); 
      newWidth = Number(num) + 44; 
      clickScreen.classList.remove("displayNone"); 
    } else{ //in month/week
      newWidth = Number(window.innerWidth - 20);
      div = document.getElementById(where);
      parent = thisOne;
      parentId = parent.dataset.id;
    };
    
    if(parent.dataset.rec && parent.dataset.rec !== "undefined"){
      let rec = parent.dataset.rec;
      recIndex = listTasks.findIndex(todo => todo.id == rec);
      todoIndex = listTasks[recIndex].recurrys.findIndex(todo => todo.id == parentId);
      todo = listTasks[recIndex].recurrys[todoIndex];
    } else{
      todoIndex = listTasks.findIndex(todo => todo.id == parentId);
      todo = listTasks[todoIndex];
    };
  };
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
      </li>`; //with a checkbox/input and label/name that will get crossed if mini.checked == true
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
  let taskAllInfo = `<div id="taskInfo" class="taskInfoClass${todo.term == "wholeProject" ? ` taskInfoProject` : ``}" style="width:${newWidth}px; ${(where == "todoZone" || where == "searchScreen") ? (thisOne == "addForm" || why == "stock") ? `top: 0; left: 0;` : `top: 25px; left: -37px;` : `top: 10px; left: 10px;`}${todo.term == "wholeProject" ? `border-color:${colorsList[pColor].colorBG}; outline-color: ${colorsList[pColor].colorBG5};` : ``}">
    <div class="taskInfoWrapper">
      <div id="SupClickScreen" class="Screen displayNone"></div>
      <input id="doneIt" type="checkbox" class="cossin cornerItInput" />
      <label for="doneIt" class="doneItLabel cornerItLabel">
        <i class="typcn typcn-input-checked-outline cornerItUnChecked"></i>
        <i class="typcn typcn-input-checked cornerItChecked"></i>
      </label>
      ${todo.recurry || todo.line == "recurringDay" ? `
      <div class="storeItLabel cornerItLabel" >
        <span class="typcn typcn-arrow-repeat"></span>
      </div>` : todo.stored ? `<div class="storeItLabel cornerItLabel" >
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
      <label for="trashIt" class="trashItLabel cornerItLabel">
        <i class="fa-regular fa-trash-can cornerItUnChecked"></i>
        <i class="fa-solid fa-trash-can cornerItChecked"></i>
      </label>
      <div class="taskInfoInput relDiv">
        ${todo.pParents && todo.pParents.length > 0 ? `<div class="projectOnglet" style="background-color:${todo.PColorBG}; color:${todo.PColorTX};">${todo.Pnickname}</div>` : ``}
        <span id="iconIt" class="IconI ${todo.icon}"></span>
        <div id="labelIt" class="labelOnglet labelTaskOnglet" style="left:-10px; top:2px; background-color:${todo.LColor ? colorsList[todo.LColor].colorBG : "initial"}; color:${todo.LColor ? colorsList[todo.LColor].colorTX : "inherit"};">${todo.LName ? todo.LName : "Label"}</div>
        <div class="underLining" id="taskTitle-underLining"></div>
        <input type="text" id="taskTitle" class="taskInfoInput" style="color:${todo.term == "showThing" ? mySettings.myBaseColors[0].colorBG : mySettings.myBaseColors[todo.color].colorBG};" value="${todo.task ? todo.task : ""}">
        <span id="colorIt" class="typcn typcn-tag tagSpan ${todo.term == "showThing" ? `hidden` : ``}" style="color:${mySettings.myBaseColors[todo.color].colorBG};"></span>
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

          <h5 class="taskInfoSubTitle" style="margin: 0;">Reminder</h5>
          <input class="myRadio" type="radio" name="termOptions" id="reminder" value="reminder" ${todo.term == "reminder" ? `checked` : ``} />
          <label for="reminder" class="termLabel"><span class="myRadio"></span><span style="font-size:14px;">It's such a special day...</span></label>
          
          <h5 class="taskInfoSubTitle" style="margin:10px 0 0 0;">Habit</h5>
          <input class="myRadio" type="radio" name="termOptions" id="sameHabit" value="sameHabit" ${todo.term == "sameHabit" ? `checked` : ``} />
          <label for="sameHabit" class="termLabel"><span class="myRadio"></span><span style="opacity:.6;font-size:14px;">It's always the same thing...</span></label>
          
          <h5 class="taskInfoSubTitle" style="margin:10px 0 0 0;">Task</h5>
          
          <input class="myRadio" type="radio" name="termOptions" id="topPriority" value="topPriority" ${todo.term == "topPriority" ? `checked` : ``} />
          <label for="topPriority" class="termLabel"><span class="myRadio"></span><span style="color:red;">That's our top priority!</span></label>
          <div class="urgeDiv">
            <h5 style="margin: 5px 0 0 0;">How urgent is it?</h5>
            <div class="inDaySection" style="width: fit-content; margin-bottom: 10px;">
              <p><label for="urgeInput" style="display:inline-block;"><span style="color:red;">Pri</span><span style="color:#ff8400;">ori</span><span style="color:#ffd000;">ty:</span>  </label><input id="urgeInput" type="number" value="${todo.term == "topPriority" && todo.urge ? todo.urgeNum : "0"}" /></p>
            </div>
          </div>

          <input class="myRadio" type="radio" name="termOptions" id="oneTime" value="oneTime" ${todo.term == "oneTime" ? `checked` : ``} />
          <label for="oneTime" class="termLabel"><span class="myRadio"></span><span style="color:midnightblue;">It's a whenever kinda one time thing</span></label>
          
          <input class="myRadio" type="radio" name="termOptions" id="longTerm" value="longTerm" ${todo.term == "longTerm" ? `checked` : ``} />
          <label for="longTerm" class="termLabel"><span class="myRadio"></span><span style="color:midnightblue;">It's a whenever kinda long term shit</span></label>
          
          <input class="myRadio" type="radio" name="termOptions" id="nextThing" value="nextThing" ${todo.term == "nextThing" ? `checked` : ``} />
          <label for="nextThing" class="termLabel"><span class="myRadio"></span><span style="color:darkgreen;">It's what I'm gonna do next</span></label>
          
          <input class="myRadio" type="radio" name="termOptions" id="waitForIt" value="waitForIt" ${todo.term == "waitForIt" ? `checked` : ``} />
          <label for="waitForIt" class="termLabel"><span class="myRadio"></span><span style="color:rgb(100, 122, 122);">It's what I've been waiting for</span></label>
          
          <input class="myRadio" type="radio" name="termOptions" id="crazyShit" value="crazyShit" ${todo.term == "crazyShit" ? `checked` : ``} />
          <label for="crazyShit" class="termLabel"><span class="myRadio"></span><span style="color:rgb(239, 125, 144);">It's just a <em>maybe-one-day-probably-never</em> kinda crazy idea</span></label>

          <input class="myRadio" type="radio" name="termOptions" id="alwaysHere" value="alwaysHere" ${todo.term == "alwaysHere" ? `checked` : ``} />
          <label for="alwaysHere" class="termLabel"><span class="myRadio"></span><span style="color:goldenrod;">Forever, forever ever?!</span></label>
          
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
            <h5 class="topList">Tell me when...<span class="tellYou">(<span id="tellYouWhen">${t(todo.line)}</span><span id="tellYouDay">${todo.date ? ` ${todo.date}` : ``}</span>)</span></h5>
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
        document.querySelector("#tellYouDay").innerText = ` ${document.querySelector("#oneDayDateInput").value}`;
      } else{
        document.querySelector("#tellYouDay").innerText = ``;
      };
    });
  });
  calendarDiv.querySelector("#oneDayDateInput").addEventListener("change", (e) => {
    document.querySelector("#tellYouDay").innerText = ` ${e.target.value}`;
  });
  let taskInfo = document.querySelector("#taskInfo");
  let doneIt = document.querySelector("#doneIt");
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
  let labelIt = document.querySelector("#labelIt");
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
    if(where == "todoZone" && why !== "stock" && why !== "addForm"){
      moving = true;
      clickHandlerAddOn(taskInfo, "trash", clickScreen, togoList);
    } else{
      taskInfo.remove();
    };
  });
  doneIt.addEventListener("click", () => {
    if(doneIt.checked){
      taskInfoBtn.innerText = "Save & declare it done!";
      trashIt.checked = false;
      copyIt.checked = false;
    } else{
      taskInfoBtn.innerText = "Save";
    };
  });
  trashIt.addEventListener("click", () => {
    if(trashIt.checked){
      taskInfoBtn.innerText = "Trash it!";
      copyIt.checked = false;
      doneIt.checked = false;
    } else{
      taskInfoBtn.innerText = "Save";
    };
  });
  copyIt.addEventListener("click", () => {
    if(copyIt.checked){
      taskInfoBtn.innerText = "Save & Copy";
      trashIt.checked = false;
      doneIt.checked = false;
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

  //LABEL
  let newlabelName = todo.label ? todo.LName : "";
  let newlabelColor = todo.label ? todo.LColor : "";
  labelIt.addEventListener("click", () => {
    let labelNamesChoice;
    if(mySettings.myLabels && mySettings.myLabels.length > 0){
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
      return `<input id="labelColor${idx}" type="radio" name="labelColorChoices" class="displayNone" value="${idx}" /><label for="labelColor${idx}" class="showTypeIconsB labelColorChoix"><i class="fa-solid fa-pen-ruler" style="color:${icon.colorBG};"></i></label>`;
    }).join("");
    let labelPalet = `<div id="labelPalet" class="labelPaletClass">
    <h5 style="margin:0; text-decoration:underline;">Let's put a label on it!</h5>
    ${labelNamesChoice}
    <h5 style="margin: 15px 0 0; align-self: flex-start;">Create one: <input id="labelNameInput" type="text" style="width: 50px;margin:auto;" placeholder="Label"/></h5>
    <div>${Lcolors}</div>
    </div>`;
    taskInfo.insertAdjacentHTML("beforeend", labelPalet);
    SupClickScreen.classList.remove("displayNone");
    labelPalet = document.querySelector("#labelPalet");
    if(mySettings.myLabels && mySettings.myLabels.length > 0){
      document.querySelector("#myLabelNames").addEventListener("change", (e) => {
        console.log(e.target.value);
        if(e.target.value == "null"){
          newlabelColor = "";
          newlabelName = "";
          labelIt.style.backgroundColor = "var(--bg-color)";
          labelIt.style.color = "var(--tx-color)";
          labelIt.innerText = "Label";
        } else{
          let label = mySettings.myLabels[e.target.value];
          newlabelColor = label.color;
          labelIt.style.backgroundColor = colorsList[label.color].colorBG;
          labelIt.style.color = colorsList[label.color].colorTX;
          newlabelName = labelIt.innerText = label.name;
          clickHandlerAddOn(labelPalet, "trash", SupClickScreen, "nowhere");
        };
      });
    };
    document.querySelectorAll("input[name='labelColorChoices']").forEach(radio => {
      radio.addEventListener("click", () => {
        newlabelColor = radio.value; //index of colorList
        labelIt.style.backgroundColor = colorsList[newlabelColor].colorBG;
        labelIt.style.color = colorsList[newlabelColor].colorTX;
      });
    });
    document.querySelector("#labelNameInput").addEventListener("change", (e) => {
      newlabelName = labelIt.innerText = e.currentTarget.value;
    });
    SupClickScreen.addEventListener("click", () => clickHandlerAddOn(labelPalet, "trash", SupClickScreen, "nowhere"));
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
  if(!todo.recurry && todo.line !== "recurringDay" && !todo.stored){
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
        };
      } else{
        colorIt.classList.remove("hidden");
        taskTitle.style.color = newcolor ? mySettings.myBaseColors[newcolor].colorBG : mySettings.myBaseColors[todo.color].colorBG;
        busyInput.checked = todo.busy ? true : todo.busy == false ? false : false;
        if(storeIt && storeIt.checked && !todo.stored){ // if it's a recurry, that used to make it bug because there was no storeIt to check if it's checked or not, so I added storeIt
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
  

  //SAVE BUTTON
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
  
      if(newlabelName !== "" && newlabelColor !== ""){
        todo.label = true;
        todo.LName = newlabelName;
        todo.LColor = newlabelColor;
 
        let newLabel = {
          name: newlabelName,
          color: newlabelColor
        };
        if(!mySettings.myLabels){
          mySettings.myLabels = [];
          mySettings.myLabels.push(newLabel);
        } else if(mySettings.myLabels && mySettings.myLabels.length > 0){
          let thisLabelIdx = mySettings.myLabels.findIndex(label => label.name == newlabelName);
          if(thisLabelIdx == -1){
            mySettings.myLabels.push(newLabel);
          } else{
            mySettings.myLabels[thisLabelIdx] = newLabel;
          };
        };
        localStorage.mySettings = JSON.stringify(mySettings);
      } else{
        delete todo.label;
        delete todo.LName;
        delete todo.LColor;
      };
      

      todo.task = taskTitle.value.startsWith("*") ? taskTitle.value.substring(1) : taskTitle.value;

      if(taskDetails.value !== ""){
        todo.info = taskDetails.value;
      } else{
        delete todo.info;
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

      if(miniListDiv.querySelector(".miniLi")){
        todo.miniList = Array.from(miniListDiv.querySelectorAll(".miniLi")).map((li) => {
          return {
            name: li.querySelector(".listNameInput").value,
            type: li.classList.contains("miniTitle") ? "title" : "item",
            color: mySettings.myBaseColors.findIndex(color => color.colorBG == li.querySelector(".listNameInput").style.color),
            checked: li.querySelector(".listCheckInput").checked ? true : false
          };
        });
        console.log(todo.miniList);
        todo.miniHide = hideMiniInput.checked ? true : false;
      } else{
        delete todo.miniList;
        delete todo.miniHide;
      };

      if(where == "todoZone" || where == "searchScreen"){
        parents = Array.from(document.querySelectorAll("li")).filter((li) => li.id.includes(todo.id));
      };

      if(!todo.recurry && todo.line !== "recurringDay"){
        if(!todo.stock && !todo.stored && storeIt.checked){
          if(why == "new" || todo.newShit){ //inclus addform
            //todo.line = "noDay"; le calendarSave est juste après
            todo.stock = true; //is in storage
            todo.storedId = []; //pour ses futurs copies stored
          } else{
            stockCreaction(todo); //todo.stored = true; (has a model in storage) (included in stockCreation)
          };
        };
        if(todo.stock && !storeIt.checked){
          trashStock(todo.id); //erasing the stock and transforming all the stored in not stored (normal todo)
        };
      };
  
      if(todo.newShit){
        delete todo.newShit;
      };
      

      calendarSave(todo); // s'il était un recurringDay, les recurrys ont tous été recréés à son image... FUCK (pas ceux qui étaient déjà out!)! ... à moins que... il en cré de nouveaux!! car dans todoCreation, tu passe par togoList et ça fait recurryOuting... et les nouveaux recurry seront pas encore "out", fac ils vont être créés... alors il faudrait juste se débarasser des anciens! ça pourrait être dans clearRecurringData...
      //parent is global (no need for parent since todoCreation)
      if(why !== "new" && why !== "stock" && parent.dataset.rec && parent.dataset.rec !== "undefined"){
        let oldRecurry = listTasks[recIndex].recurrys.splice(todoIndex, 1);
        todo = oldRecurry[0];
        delete todo.recurry;
        delete todo.out;
        delete todo.recId;
        listTasks.push(todo);
      }; //donc le todo est sorti de son recurring et pushed dans listTasks

      //WOLA si todo était stored ou stock et là devient reccuringDay?!

      if(copyIt.checked){
        let newTodo = JSON.parse(JSON.stringify(todo));
        newTodo.id = crypto.randomUUID();
        listTasks.push(newTodo);
        todoCreation(newTodo);
      };

      togoList = getTogoList(todo);
      if(doneIt.checked){
        if(todo.term == "alwaysHere"){
          gotItDone(todo.id, "here");
          todoCreation(todo);
        } else{
          gotItDone(todo.id, "");
        };
      } else{
        todoCreation(todo); 
        // sortItAll();
      };
      
      
    } else if(trashIt.checked){
      //ALSO TRASH THE Project IN MYProjectS!
      if(todo.project == "wholeProject"){
        let indexP = mySettings.myProjects.findIndex(project => project.nickname == todo.Pnickname);
        mySettings.myProjects.splice(indexP, 1);
        localStorage.mySettings = JSON.stringify(mySettings);
      } //Are partProjects in the wholeProject or not?!
      if(todo.recurry && todo.recId){
        listTasks[recIndex].recurrys.splice(todoIndex, 1);
      } else if(todo.stored){
        let stockIdx = listTasks.findIndex(toDo => toDo.id == todo.stockId);
        let stock = listTasks[stockIdx];
        console.log(stock);
        let todoIdx = stock.storedId.indexOf(todo.id);
        stock.storedId.splice(todoIdx, 1);
        console.log(stock);
      } else{
        listTasks.splice(todoIndex, 1);
      };
      if(where == "todoZone" || where == "searchScreen"){
        parents = Array.from(document.querySelectorAll("li")).filter((li) => li.id.includes(todo.id));
      };
    };
    
    localStorage.listTasks = JSON.stringify(listTasks);
    updateWeek();
    updateMonth();
    
    if(where == "searchScreen"){
      moving = false;
      taskInfo.remove();
      clickHandlerAddOn(taskInfo, "trash", clickScreen, togoList);
      if(mySettings.mySorting){
        let listIdx = mySettings.mySorting.findIndex(sort => sort.list == togoList);
        if(listIdx !== -1){
          sortItWell(listIdx);
        } else{
          sortItAll(); //or sortIt(togoList)
        };
      } else{
        sortItAll();
      };
    };
    //console.log(togoList);
    if((thisOne == "addForm" || why == "stock") && togoList !== ""){
      scrollToSection(togoList);
      taskInfo.remove();
      if(mySettings.mySorting){
        let listIdx = mySettings.mySorting.findIndex(sort => sort.list == togoList);
        if(listIdx !== -1){
          sortItWell(listIdx);
        } else{
          sortItAll();
        };
      } else{
        sortItAll(); //faire un sortIt(togoList) pour réduire le travail
      };
    } else if((thisOne == "addForm" || why == "stock") && togoList == ""){
      taskInfo.remove();
    } else if(where == "todoZone" && togoList !== ""){
      moving = true;
      parents.forEach(parent => {
        parent.remove();
      });
      parent.remove(); // it wasn't complaining but that was still useless...
      clickHandlerAddOn(taskInfo, "trash", clickScreen, togoList);
      if(mySettings.mySorting){
        let listIdx = mySettings.mySorting.findIndex(sort => sort.list == togoList);
        if(listIdx !== -1){
          sortItWell(listIdx);
        } else{
          sortItAll();
        };
      } else{
        sortItAll();
      };
    } else if(where == "todoZone" && togoList == ""){
      parents.forEach(parent => {
        parent.remove();
      });
      parent.remove(); // it wasn't complaining but that was still useless...
      clickHandlerAddOn(taskInfo, "trash", clickScreen, togoList);
    } else{ //not in the list, so month/week
      moving = false;
      taskInfo.remove();
      if(mySettings.mySorting){
        let listIdx = mySettings.mySorting.findIndex(sort => sort.list == togoList);
        if(listIdx !== -1){
          sortItWell(listIdx);
        } else{
          sortItAll();
        };
      } else{
        sortItAll();
      };
    };
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

function clickHandlerSmallAddOn(addOn, screen){
  addOn.remove();
  screen.classList.add("displayNone");
  screen.removeEventListener("click", () => clickHandlerSmallAddOn(addOn, screen));
};

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
      if(todo.line == "recurringDay"){
        todo.recurrys.forEach(recurry => {
          recurry.icon = todo.icon;
          if(recurry.out){
            document.getElementById(recurry.id).querySelector(".IconI").className = `IconI ${icon}`;
          };
        });
      };
      localStorage.listTasks = JSON.stringify(listTasks);
      updateCBC();
      clickHandlerAddOn(iconsPalet, "keep", clickScreen);
    });
  });
  clickScreen.addEventListener("click", () => clickHandlerAddOn(iconsPalet, "keep", clickScreen));
};
window.iconChoice = iconChoice;

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

// *** MONTHLY CALENDAR

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
      show.recurrys.forEach(recurry => {
        if(monthlyFirst <= recurry.date && recurry.date <= monthlyLast){
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
        list.date = done.date;
        list.past = true;
        shows.push(list);
      };
    });
  });
  
  let sortedShows = shows.sort((s1, s2) => (s1.date < s2.date) ? -1 : (s1.date > s2.date) ? 1 : (s1.date == s2.date) ? (s1.term < s2.term) ? -1 : (s1.term > s2.term) ? 1 : (s1.term == s2.term) ? (s1.dalle < s2.dalle) ? -1 : (s1.dalle > s2.dalle) ? 1 : 0 : 0 : 0);
  shows = sortedShows;
  let today = getTodayDateString();
  shows.forEach(show => {
    let eventDiv;
    if(show.term == "showThing"){
      eventDiv = `<div data-id="${show.id}" ${show.recurry ? `data-rec="${show.recId}"` : ``} data-showType="${show.showType}" ${!show.past ? `onclick="taskAddAllInfo(this, 'calMonthPage', 'mod')"` : ``} class="eventDiv ${show.past ? "pastEvent" : ""}" style="background-color:${show.STColorBG}; color:${show.STColorTX};">${show.task}</div>`;
    } else if(show.term == "reminder"){
      eventDiv = `<div data-id="${show.id}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${!show.past ? `onclick="taskAddAllInfo(this, 'calMonthPage', 'mod')"` : ``} class="eventDiv ${show.date < today ? "pastEvent" : ""}" style="color:${mySettings.myBaseColors[show.color].colorBG};">${show.task}</div>`;
    };
    let kase = document.querySelector("[data-wholedate='" + show.date + "']");
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
      let td = `<td ${i == 0 && j == 0 ? `id="monthlyFirst"` : i == 5 && j == 6 ? `id="monthlyLast"` : ``}><div class="circle"></div><span class="typcn typcn-plus addEvent displayNone" onclick="taskAddAllInfo(this, 'calMonthPage', 'new')"></span></td>`;
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

// *** WEEKLY CALENDAR

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
  let myDay = Number(mySettings.myTomorrow.substring(0, 2));
  let sleepAreas = mySettings.myWeeksDayArray.map((clock) => {
    return `<div class="sleepArea" style="grid-area: row-${String(myDay).padStart(2, "0")}-00 / col-${clock.code} / row-${clock.clockIn.replace(":", "-")} / col-${clock.code}"></div>
    <div class="sleepArea" style="grid-area: row-${clock.clockOut.replace(":", "-")} / col-${clock.code} / row-end / col-${clock.code}"></div>`;
  }).join("");
  document.querySelector(".weeklyContainer").insertAdjacentHTML("beforeend", sleepAreas);
};

function putShowsInWeek(Dday, Sday){
  let shows = listTasks.filter((todo) => ((todo.term == "showThing" || todo.term == "reminder") && todo.line !== "noDay")); //on enlève "noDay" ou on aurait pu enlever todo.stock == true
  shows.map(show => { //WATCH OUT: if between 00:00 and myTomorrow, it would be yesterday's date so maybe not that week!!
    if(show.line == "recurringDay"){ 
      show.recurrys.map(recurry => {
      if(Dday <= recurry.date && recurry.date <= Sday){//takes only the ones that should show up this week
        createWeeklyshow(recurry);
      };
      })
    } else if(Dday <= show.date && show.date <= Sday){//takes only the ones that should show up this week
      createWeeklyshow(show);
    };
  });
  let filteredDonedShows = listDones.filter((done) => (Dday <= done.date && done.date <= Sday));
  filteredDonedShows.forEach(done => {
    done.list.forEach(doned => {
      if(doned.term == "showThing"){
        doned.date = done.date;
        doned.past = true;
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
  let dayIdx = meseDayICalc(show.date); //if between 00:00 and myTomorrow, it should be yesterday's date!
  let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
  let day = `${mySettings.myWeeksDayArray[idx].code}`;  
  let div;
  let add;
  if(show.tutto || !show.dalle || show.dalle == ""){
    div = document.querySelector(`[data-tutto="${day}"]`);
    add = `<div data-id="${show.id}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${show.term == "showThing" ? `data-showType="${show.showType}"` : ``} onclick="taskAddAllInfo(this, 'calWeekPage', 'mod'); event.stopPropagation();" class="weeklyEvent ${show.past ? "pastEvent" : ""}" style="${show.term == "showThing" ? `background-color:${show.STColorBG}; color:${show.STColorTX};` : `background-color: var(--bg-color); color:${show.color}; border:none;`}">${show.info ? `*` : ``}
    ${show.task} <i class="IconI ${show.icon}"></i>
  </div>`;
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
    <div data-id="${show.id}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${show.term == "showThing" ? `data-showType="${show.showType}"` : ``} onclick="taskAddAllInfo(this, 'calWeekPage', 'mod'); event.stopPropagation();" class="weeklyEvent ${show.past ? "pastEvent" : ""}" style="${show.term == "showThing" ? `background-color:${show.STColorBG}; color:${show.STColorTX};` : `color:${show.color}; border:none;`}  grid-column:col-${day}; grid-row:row-${show.dalleRow}${show.term == "reminder" ? `` : `/row-${show.alleRow}`};">
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
    // <div data-id="${show.id}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${show.term == "showThing" ? `data-showType="${show.showType}"` : ``} onclick="taskAddAllInfo(this, 'calWeekPage', 'mod')" class="weeklyEvent ${show.past ? "pastEvent" : ""}" style="${show.term == "showThing" ? `background-color:${show.STColorBG}; color:${show.STColorTX};` : `color:${show.color}; border:none;`}  grid-column:col-${day}; grid-row:row-${hourStart}${show.term == "reminder" ? `` : `/row-${hourEnd}`};">
    //   ${show.task}<br />
    //   <i class="IconI ${show.icon}"></i>
    // </div>
    // ${dopoDiv}
    // `;
  };
  
  div.insertAdjacentHTML("beforeend", add);
};

function getWeeklyCalendar(){
  let arrayItem = [];
  let rowYear = `<div class="weeklyItem weeklyTitle" style="grid-row:1; border-bottom-width: 1px;"><button class="weeklyBtn" id="weekBackward" style="float: left;"><span class="typcn typcn-media-play-reverse"></span></button><span id="weeklyYearSpan">${year}</span><button class="weeklyBtn" id="weekForward" style="float: right;"><span class="typcn typcn-media-play"></span></button></div>`;
  let rowMonth = `<div class="weeklyItem weeklyTitle" style="grid-row:2; border-bottom-width: 2px;"><span id="weeklyMonthSpan">${monthName}</span></div>`;
  arrayItem.push(rowYear, rowMonth);
  let myDay = Number(mySettings.myTomorrow.substring(0, 2));
  for(let c = 1; c < 9; c++){
    let arrayC = [];
    let rowDay = `<div ${c == 2 ? `id="Dday"` : c == 8 ? `id="Sday"` : ``} class="weeklyItem" style="grid-column:${c}; grid-row:3; font-size:14px; font-weight:600; line-height: calc(((92vh / 29) * 1.5) / 2); border-radius:2px 2px 0 0; border-bottom:1px solid rgba(47, 79, 79, .5);${c == 1 ? " border-radius:2px 0 0 2px; border-right:1px solid rgba(47, 79, 79, .5);" : ""}"${c > 1 ? ` data-code="${mySettings.myWeeksDayArray[c - 2].code}">${mySettings.myWeeksDayArray[c - 2].letter}<br /><span class="weeklyDateSpan"></span>` : `>`}</div>`; //shall we add the date as an id, as a data-date or as an area?
    let rowTutto = `<div class="weeklyItem weeklyTutto" ${c > 1 ? `onclick="taskAddAllInfo(this, 'calWeekPage', 'new')"` : ``} ${c > 1 ? `data-tutto="${mySettings.myWeeksDayArray[c - 2].code}"` : ``} style="grid-column:${c}; grid-row:4; border-bottom: 1px solid rgba(47, 79, 79, .5);"></div>`;
    arrayC.push(rowDay);
    arrayC.push(rowTutto);
    let line = 5;
    for(let r = 1; r < 25; r++){
      let item = `<div class="weeklyItem" ${c > 1 ? `onclick="taskAddAllInfo(this, 'calWeekPage', 'new')"` : ``} style="grid-column:${c}; grid-row:${line} / ${line + 4};${c == 1 ? " border-radius:2px 0 0 2px; border-right:1px solid rgba(47, 79, 79, .5);" : ""} ${myDay == 23 ? " border-bottom:2px solid rgba(47, 79, 79, .8);" : ""}">${c == 1 ? `${String(myDay).padStart(2, "0")}:00` : ``}${mySettings.myTomorrow !== "00:00" && myDay == 0 && c > 1 ? `<span class="weeklyAfterDateSpan"></span>` : ``}</div>`;
      arrayC.push(item);
      line += 4;
      myDay == 23 ? myDay = 0 : myDay++;
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
  for(let h = 0; h < 24; h++){ //93
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
    };
    let nowAreaDiv = document.querySelector(".nowArea");
    if(nowAreaDiv){
      nowAreaDiv.remove();
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


function busyZoneCreation(show){
  //don't forget to add the sleepAreas and mealAreas too, in the scheduling weekly

  //we'll need the day (column) too (NO! because the column can change with the settings.. no? or maybe not...)

  console.log(show);
  let dayIdx = meseDayICalc(show.date);
  let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
  let day = `${mySettings.myWeeksDayArray[idx].code}`;  
  //if tutto... do we start after the sleepArea or the whole column with myTomorrow?
  let start;
  let end;
  if(show.tutto || !show.dalle || show.dalle == ""){
    if(mySettings.offAreas == true){
      start = roundFifteenTime(mySettings.myWeeksDayArray[idx].clockIn);
      end = roundFifteenTime(mySettings.myWeeksDayArray[idx].clockOut);
    } else{
      start = "00-00";
      end = "end";
    };
  } else{
    let prima = "";
    let hourStart = roundFifteenTime(show.dalle);
    let hourEnd = show.alle ? roundFifteenTime(show.alle) : mySettings.offAreas == true ? roundFifteenTime(mySettings.myWeeksDayArray[idx].clockOut) : "end";
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
};
//localStorage.myBusies = JSON.stringify(myBusies);








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
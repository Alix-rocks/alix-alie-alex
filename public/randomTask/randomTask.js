import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { app, analytics, db, auth, provider } from "../myFirebase.js";
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




// *** START
let searchSwitch = false;
let listTasks = [];
let listDones = [];
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
  myShowTypes: []
};
//localStorage.mySettings = JSON.stringify(mySettings);
let cBC;
let icons = ["fa-solid fa-comments", "fa-solid fa-lightbulb", "fa-solid fa-dollar-sign", "fa-solid fa-spider", "fa-solid fa-gavel", "fa-solid fa-couch", "fa-solid fa-head-side-virus", "fa-solid fa-screwdriver-wrench", "fa-solid fa-universal-access", "fa-solid fa-droplet", "fa-solid fa-code", "fa-solid fa-poo", "fa-solid fa-globe", "fa-solid fa-briefcase", "fa-solid fa-brain", "fa-solid fa-champagne-glasses", "fa-solid fa-seedling", "fa-solid fa-utensils", "fa-solid fa-heart-pulse", "fa-solid fa-sun", "fa-solid fa-broom", "fa-solid fa-people-group", "fa-solid fa-bullhorn", "fa-solid fa-magnifying-glass", "fa-solid fa-heart", "fa-solid fa-cake-candles", "fa-regular fa-hourglass-half", "fa-solid fa-road", "fa-regular fa-face-grin-stars", "fa-regular fa-face-grin-hearts", "fa-regular fa-face-grin-squint", "fa-regular fa-face-smile-wink", "fa-regular fa-face-meh-blank", "fa-regular fa-face-flushed", "fa-regular fa-face-grimace", "fa-regular fa-face-rolling-eyes", "fa-regular fa-face-grin-beam-sweat", "fa-regular fa-face-surprise", "fa-regular fa-face-frown-open", "fa-regular fa-face-frown", "fa-regular fa-face-sad-tear", "fa-regular fa-face-tired", "fa-regular fa-face-sad-cry", "fa-regular fa-face-dizzy", "fa-regular fa-face-angry", "fa-solid fa-ban noIcon"];

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
  let todayDate = getTodayDate();
  let tomorrowDate = getTomorrowDate();
  document.getElementById("todaysDateSpan").innerHTML = `(${todayDate})`;
  document.getElementById("tomorrowsDateSpan").innerHTML = `(${tomorrowDate})`;
  document.getElementById(mySettings.myFavoriteView).checked = true;
  document.getElementById(mySettings.myFavoriteView).dispatchEvent(pageEvent);
  if(mySettings.mySide == "light"){
    document.getElementById("switchModeBall").className = "ballLight";
    document.getElementById("switchModeBallUnder").className = "ballLight";
    document.querySelector(':root').style.setProperty('--bg-color', '#F2F3F4');
    document.querySelector(':root').style.setProperty('--tx-color', 'darkslategrey');
  } else if(mySettings.mySide == "dark"){
    document.getElementById("switchModeBall").className = "";
    document.getElementById("switchModeBallUnder").className = "";
    document.querySelector(':root').style.setProperty('--bg-color', 'rgb(7, 10, 10)');
    document.querySelector(':root').style.setProperty('--tx-color', 'rgba(242, 243, 244, .8)');
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
  listTasks.forEach(todo => {
    todoCreation(todo);
  });
  updateArrowsColor();
  sortItAll();
};

async function getDones(){
  const getDones = await getDocs(collection(db, "randomTask", auth.currentUser.email, "myListDones"));
  if(localStorage.getItem("listDones")){
    listDones = JSON.parse(localStorage.listDones);
  } else if(getDones){
    getDones.forEach((donedDate) => {
      let mydate = donedDate.id;
      let mylist = donedDate.data().dones;
      listDones.push({date: mydate, list: mylist});
    });//listDones.push({...donedDate.data().dones, date: mydate});
    localStorageDones("first");
  };
  let sortedListDones = listDones.sort((d1, d2) => (d1.date > d2.date) ? 1 : (d1.date < d2.date) ? -1 : 0);
  sortedListDones.forEach(doned => {
    if (doned.list.length !== 0) {
      let donedDate = doned.date;
      donedDateCreation(donedDate);
      doned.list.forEach(tidoned => {
        donedCreation(donedDate, tidoned);
      });
    };
  });
  refreshDoneId();
  createBody();
  getWeeklyCalendar();
};

//THAT WOULD WORK! BUT I'M NOT SURE THAT WOULD BE CHEAPER... THE LISTTASKS IS ONLY ONE DOCUMENT, BUT IT'S BIGGER SO MAYBE MORE BANDWIDTH, BUT THE MYLISTTASKS ARE A LOT OF DOCUMENTS AND YOU'RE CHARGE BY DOCUMENT!
// let myListTasks = [];
// async function getMines(){
//   const getMines = await getDocs(collection(db, "randomTask", auth.currentUser.email, "myListTasks"));
  
//     getMines.forEach((idRef) => {
//       let myId = idRef.id;
//       myListTasks.push({...idRef.data(), id: myId});
//     });
 
//   console.log(myListTasks);
// };


function freeIn(){ 
  //mySettings
  if(localStorage.getItem("mySettings")){
    mySettings = JSON.parse(localStorage.mySettings);
  };
  //listTasks
  if(localStorage.getItem("listTasks")){
    listTasks = JSON.parse(localStorage.listTasks);
    listTasks.forEach(todo => {
      todoCreation(todo);
    });
    createBody();
    getWeeklyCalendar();
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
  updateArrowsColor();
  settingsPage();
  logInScreen.classList.add("displayNone");
};


// Tests
// listDones = [
//   { date: "2023-10-17",
//     list: [{task: "manger", color: "red"}, {task: "toilet", color: "forestgreen"}]}, 
//   { date: "2023-10-18",
//     list: [{task: "ménage", color: "forestgreen"}, {task: "Time", color: "dodgerblue"}]}, 
//   { date: "2023-10-16",
//     list: [{task: "ménage", color: "forestgreen"}, {task: "Time", color: "dodgerblue"}]}, 
//   { date: "2023-10-08",
//     list: [{task: "ménage", color: "forestgreen"}, {task: "Time", color: "dodgerblue"}]}, 
//   { date: "2023-10-15",
//     list: [{task: "ménage", color: "forestgreen"}, {task: "Time", color: "dodgerblue"}]}
// ];



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

function addTaskModif(id){
  let taskModif = getTaskModif();
  if(!taskModif.includes(id)){
    taskModif = [...taskModif, id];
    localStorage.taskModif = JSON.stringify(taskModif);
  };
};

function getTaskModif(){
  let taskModif = [];
  if(localStorage.getItem("taskModif")){
    taskModif = JSON.parse(localStorage.taskModif);
  } else{
    taskModif = [];
  };
  return taskModif;
};

function resetTaskModif(){
  localStorage.taskModif = JSON.stringify([]);
};


// *** CLOUDSAVE

async function saveToCloud(){
  const batch = writeBatch(db);
  listTasks = JSON.parse(localStorage.listTasks);
  mySettings = JSON.parse(localStorage.mySettings);
  const docRefTasks = doc(db, "randomTask", auth.currentUser.email);
  const docSnapTasks = await getDoc(docRefTasks);
  // let taskModif = getTaskModif();
  // taskModif.map(modifId => {
  //   let todoIdx = listTasks.indexOf((td) => td.id == modifId);
  //   if(docSnapTasks[todoIdx]){
  //     batch.update(doc(db, "randomTask", auth.currentUser.email), {
  //       listTasks[todoIdx]: listTasks[todoIdx] //it's just not possible to update one element of an array in firestore!!
  //     });
  //   } else{
  //     batch.set(doc(db, "randomTask", auth.currentUser.email, "myListDones", modifDate), {
  //       dones: doned.list
  //     });
  //   };
  // });   
  if (docSnapTasks.exists()){
    batch.update(doc(db, "randomTask", auth.currentUser.email), { // or batch.update or await updateDoc
      listTasks: listTasks,
      mySettings: mySettings //on a tu besoin de le mettre là, si il se sauve à chaque fois qu'on save les setting?... showtype vs settings...
    });
  } else{
    batch.set(doc(db, "randomTask", auth.currentUser.email), { // or batch.set or await setDoc
      listTasks: listTasks,
      mySettings: mySettings
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
      if(section.querySelectorAll("li").length > 0){
        section.querySelector("span.listToggleChevron").classList.add("fullSection");
      } else{
        section.querySelector("span.listToggleChevron").classList.remove("fullSection");
      };
      if(section.id == "limboSection"){
        if(section.querySelectorAll("li").length == 1){
          section.classList.remove("displayNone");
          section.querySelector("label").classList.remove("listToggleLabel");
          section.querySelector("#listLimboChevron").classList.add("displayNone");
          section.querySelector("#listLimbo").classList.remove("listToggleList");
        } else if(section.querySelectorAll("li").length > 1){
          section.classList.remove("displayNone");
          section.querySelector("label").classList.add("listToggleLabel");
          section.querySelector("#listLimboChevron").classList.remove("displayNone");
          section.querySelector("#listLimbo").classList.add("listToggleList");
        } else if(section.querySelectorAll("li").length == 0){
          section.classList.add("displayNone");
          section.querySelector("label").classList.remove("listToggleLabel");
          section.querySelector("#listLimboChevron").classList.add("displayNone");
          section.querySelector("#listLimbo").classList.remove("listToggleList");
        };
      }
      
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
    <button id="settingsBtn" class="ScreenBtn1">yep <span class="typcn typcn-thumbs-up" style="padding: 0;"></span></button>
    <button id="cancelBtn" class="ScreenBtn2">Cancel</button>`;

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
      document.querySelector(':root').style.setProperty('--bg-color', '#F2F3F4');
      document.querySelector(':root').style.setProperty('--tx-color', 'darkslategrey');
    } else if(mySettings.mySide == "dark"){
      document.getElementById("switchModeBall").className = "";
      document.getElementById("switchModeBallUnder").className = "";
      document.querySelector(':root').style.setProperty('--bg-color', 'rgb(7, 10, 10)');
      document.querySelector(':root').style.setProperty('--tx-color', 'rgba(242, 243, 244, .8)');
    };

    switchModeSlider.addEventListener("click", () => {
      document.getElementById("switchModeBall").classList.toggle("ballLight");
      document.getElementById("switchModeBallUnder").classList.toggle("ballLight");
      if(document.getElementById("switchModeBall").classList.contains("ballLight")){
        document.querySelector(':root').style.setProperty('--bg-color', '#F2F3F4');
        document.querySelector(':root').style.setProperty('--tx-color', 'darkslategrey');
        document.querySelectorAll(".numberedCal").forEach(cal => {
          cal.classList.remove("numberedCalDark");
        });
      } else{
        document.querySelector(':root').style.setProperty('--bg-color', 'rgb(7, 10, 10)');
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
        let todayDate = getTodayDate();
        let tomorrowDate = getTomorrowDate();
        document.getElementById("todaysDateSpan").innerHTML = `(${todayDate})`;
        document.getElementById("tomorrowsDateSpan").innerHTML = `(${tomorrowDate})`;
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
      
      
      if(clockChangeListener){
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
    return `<option value="${show.name}" style="background-color:${show.colorBG}; color:${show.colorTX};">${show.name}</option>`
  }).join("");
  let all = `<option value="">any</option>${optionShow}`;
  document.querySelector("#searchShow").insertAdjacentHTML("afterbegin", all);
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
      resultDate = listTasks.filter(todo => todo.date == searchDate.value || todo.line == "recurringDay");
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

  document.querySelector("#searchClear").addEventListener("click", () => {
    document.querySelector("#searchFound").innerHTML = ``;
    nope = false;
    searchSwitch = false;
  });
};

searchPage();



// *** CREATION

function todoCreation(todo){
  let togoList;
  if(searchSwitch){
    togoList = "searchFound";
  } else{
    togoList = getTogoList(todo);
  };
  let numberedDays;
  let todayDate = getDateTimeFromString(getTodayDate(), mySettings.myTomorrow);
  //if(todo.deadline !== "" ....)
  if(todo.line == "doneDay" || togoList == "listOups"){
    let time = todo.dalle ? todo.dalle : mySettings.myTomorrow;
    let doneDate = getDateTimeFromString(todo.date, time);
    numberedDays = Math.floor((doneDate - todayDate)/(1000 * 3600 * 24));
  };
  if(togoList !== ""){ //what happens if one is stock/stored AND recurring/recurry?
    if(todo.stock){
      document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-term="${todo.term}" data-time="${todo.dalle ? todo.dalle : ""}" class="${todo.term == "showThing" ? `showLi` : ``} ${todo.term == "sameHabit" ? `sameHabit` : ``}" style="${todo.term == "showThing" ? `background-color: ${todo.STColorBG}; color: ${todo.STColorTX};` : ``}"><i class="typcn typcn-trash" onclick="trashStockEvent(this)"></i><i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i><div class="textDiv"><span class="text" onclick="taskAddAllInfo${searchSwitch ? `(this, 'searchScreen', 'mod')` : `(this, 'list', 'mod')`}" ${todo.term == "showThing" ? "" : `style="color:${todo.color}; flex-shrink: 0;"`}>${todo.term == "reminder" ? `<i class="typcn typcn-bell" style="font-size: 1em; padding: 0 5px 0 0;"></i>` : ``}${todo.info ? '*' : ''}${todo.task}</span>${todo.term !== "showThing" ? `<hr style="border-color:${todo.color};" />` : ``}<span class="timeSpan">${todo.dalle ? todo.dalle : ''}</span></div><i class="fa-solid fa-recycle" onclick="reuseItEvent(this)"></i></li>`);
    } else if(todo.line == "recurringDay"){
      let time = todo.recurrys[0].dalle ? todo.recurrys[0].dalle : mySettings.myTomorrow;
      let nextDate = getDateTimeFromString(todo.recurrys[0].date, time);
      numberedDays = Math.floor(Math.abs(nextDate.getTime() - todayDate.getTime())/(1000 * 3600 * 24));
      document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-term="${todo.term}" data-time="${todo.dalle ? todo.dalle : ""}" class="${todo.term == "showThing" ? `showLi` : ``} ${todo.term == "sameHabit" ? `sameHabit` : ``}" style="${todo.term == "showThing" ? `background-color: ${todo.STColorBG}; color: ${todo.STColorTX};` : ``}"><i class="typcn typcn-trash" onclick="trashRecurringEvent(this)"></i><i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i><div class="textDiv"><span class="text" onclick="taskAddAllInfo${searchSwitch ? `(this, 'searchScreen', 'mod')` : `(this, 'list', 'mod')`}" ${todo.term == "showThing" ? "" : `style="color:${todo.color};"`}>${todo.term == "reminder" ? `<i class="typcn typcn-bell" style="font-size: 1em; padding: 0 5px 0 0;"></i>` : ``}${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan">${todo.dalle ? todo.dalle : ''}</span></div>
      <div class="numberedCal ${mySettings.mySide == "dark" ? `numberedCalDark` : ``}" onclick="smallCalendarChoice(this)"><i class="typcn typcn-calendar-outline calendarSpan ${todo.term == "showThing" ? "" : todo.line}"></i><span style="${todo.term == "showThing" ? `text-shadow: -0.75px -0.75px 0 ${todo.STColorBG}, 0 -0.75px 0 ${todo.STColorBG}, 0.75px -0.75px 0 ${todo.STColorBG}, 0.75px 0 0 ${todo.STColorBG}, 0.75px 0.75px 0 ${todo.STColorBG}, 0 0.75px 0 ${todo.STColorBG}, -0.75px 0.75px 0 ${todo.STColorBG}, -0.75px 0 0 ${todo.STColorBG};` : ``}">${numberedDays}</span></div></li>`);
    } else if(todo.term == "reminder"){
      document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-date="${todo.date}" data-time="${todo.dalle ? todo.dalle : ""}" data-order="${todo.order ? todo.order : ""}" class="reminderClass">
        <i class="typcn typcn-bell" style="font-size: 1em;"></i>
        <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}" style="font-size: .8em;"></i>
        <div class="textDiv"><span onclick="taskAddAllInfo${searchSwitch ? `(this, 'searchScreen', 'mod')` : `(this, 'list', 'mod')`}" class="text" style="color:${todo.color}; font-size: 1em;">${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan" style="font-size: .8em;" onclick="timeItEvent(this)">${todo.dalle ? todo.dalle : ""}</span>
        <input type="time" class="displayNone"/></div>
      </li>`);
    } else {
      document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-date="${todo.date}" data-time="${todo.dalle ? todo.dalle : ""}" data-order="${todo.order ? todo.order : ""}" ${todo.recurry ? `data-rec="${todo.recId}"` : ``} class="${todo.term == "showThing" ? `showLi` : ``} ${todo.term == "sameHabit" ? `sameHabit` : ``}" ${todo.term == "showThing" ? `style="background-color: ${todo.STColorBG}; color: ${todo.STColorTX};"` : ``}>
        <i class="typcn typcn-media-stop-outline emptyCheck" onclick="checkEvent(this)"></i>
        <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i>
        <div class="textDiv"><span onclick="taskAddAllInfo${searchSwitch ? `(this, 'searchScreen', 'mod')` : `(this, 'list', 'mod')`}" class="text" ${todo.term == "showThing" ? `` : `style="color:${todo.color};"`}>${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan" onclick="timeItEvent(this)">${todo.dalle ? todo.dalle : ""}</span>
        <input type="time" class="displayNone"/></div>
        <div class="numberedCal ${mySettings.mySide == "dark" ? `numberedCalDark` : ``}" onclick="smallCalendarChoice(this)"><i class="typcn typcn-calendar-outline calendarSpan ${todo.term == "showThing" ? `` : todo.recurry ? "recurry" : todo.line}"></i><span class="${todo.line == "doneDay" || togoList == "listOups" ? `` : `displayNone`}" style="${todo.term == "showThing" ? `text-shadow: -0.75px -0.75px 0 ${todo.STColorBG}, 0 -0.75px 0 ${todo.STColorBG}, 0.75px -0.75px 0 ${todo.STColorBG}, 0.75px 0 0 ${todo.STColorBG}, 0.75px 0.75px 0 ${todo.STColorBG}, 0 0.75px 0 ${todo.STColorBG}, -0.75px 0.75px 0 ${todo.STColorBG}, -0.75px 0 0 ${todo.STColorBG};` : ``}">${todo.line == "doneDay" || togoList == "listOups" ? numberedDays : ``}</span></div>
      </li>`);
      // document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-date="${todo.date}" data-time="${todo.dalle ? todo.dalle : ""}" data-order="${todo.order ? todo.order : ""}" ${todo.term == "showThing" ? `class="showLi" style="background-color: ${todo.STColorBG}; color: ${todo.STColorTX};"` : ``} ${todo.projet ? `class="projetLi" style="outline-color: ${todo.PColorBG};"` : ``}>
      //   <i class="typcn typcn-media-stop-outline emptyCheck" onclick="checkEvent(this)"></i>
      //   <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i>
      //   ${todo.projet ? `<div class="projetOnglet" style="background-color:${todo.PColorBG}; color:${todo.PColorTX};">${todo.projetName}</div>` : ``}
      //   <div class="textDiv"><span onclick="taskAddAllInfo${searchSwitch ? `(this, 'searchScreen', 'mod')` : `(this, 'list', 'mod')`}" class="text" ${todo.term == "showThing" ? `` : `style="color:${todo.color};"`}>${todo.info ? '*' : ''}${todo.task}</span><span class="timeSpan" onclick="timeItEvent(this)">${todo.dalle ? todo.dalle : ""}</span>
      //   <input type="time" class="displayNone"/></div>
      //   
      //   <i class="typcn typcn-calendar-outline calendarSpan ${todo.term == "showThing" ? `` : todo.recurry ? "recurry" : todo.line}" onclick="smallCalendarChoice(this)"></i>
      // </li>`);
    };
  };
};

function getTogoList(todo){ //todo.date doesn't work anymore! we need date + dalle!
  let modifiedDalle = todo.dalle ? todo.dalle.replace(":", "-") : "5-00";
  let todoTime = `${todo.date}-${modifiedDalle}`;
  let hierOggiTime = timeLimit("hierOggi");
  let oggiDemainTime = timeLimit("oggiDemain");
  let demainApresTime = timeLimit("demainApres");
  let togoList;
  if(todo.newShit){
    togoList = "listLimbo";
  } else if(todo.stock){
    togoList = "listStorage";
  } else if(todo.line == "recurringDay"){
    togoList = "listRecurring";
    //recurryCreation(todo);
    recurryOuting(todo);
  } else if(todo.line == "noDay" || todo.copy){ // ( || copy ) //whenever //va inclure les deadline aussi puisqu'ils vont soient être noDay ou todoDay (ou recurringDay??)
    if(todo.term == "oneTime"){
      togoList = "listOne";
    } else if(todo.term == "crazyShit"){
      togoList = "listIdea";
    } else{
      togoList = "list";
    };
  } else if((hierOggiTime < todoTime) && (todoTime < oggiDemainTime) && !todo.copy){ //it's a todoDay or a doneDay
    if(todo.term == "reminder"){
      togoList = "listTodayReminder";
    } else {
      togoList = "listToday";
    };
  } else if((oggiDemainTime < todoTime) && (todoTime < demainApresTime) && !todo.copy){
    if(todo.term == "reminder"){
      togoList = "listTomorrowReminder";
    } else{
      togoList = "listTomorrow"; //whether it's todoDay or doneDay
      if((todo.term == "oneTime" || todo.term == "longTerm" || todo.term == "crazyShit" || todo.term == "sameHabit") && !todo.recurry){
        // there could already be one, but it's gonna be removed soon anyway
          copyDoneTomorrow(todo);
      };
    };
    //we already know it's not a recurringDay, we just need to make sure: (term == oneTime || longTerm || crazyShit {Anything that usually shows in the lists... what about sameHabit? do they usually show in the lists...}) && !recurry ... then we make a copy of it! copy but don't push in listTasks and just add "copy" at the beginning of the id and add newTodo.copy = true
  } else if(todo.term == "showThing" || todo.term == "reminder"){ //date is either before today or after tomorrow
    togoList = "";
  } else if(todoTime < hierOggiTime){
    togoList = "listOups";
  } else if(todoTime > demainApresTime){ //we might need to revisit that part once we separate DoneDay
    if(todo.line == "doneDay"){
      if(todo.term == "oneTime"){
        togoList = "listOne";
      } else if(todo.term == "crazyShit"){
        togoList = "listIdea";
      } else{
        togoList = "list";
      };
    } else{
      togoList = "listScheduled";
    };
  };
  return togoList;
};

function copyDoneTomorrow(todo){
  let newTodo = JSON.parse(JSON.stringify(todo));
  newTodo.id = `copy${todo.id}`;
  newTodo.copy = true;
  todoCreation(newTodo);
};

function recurryOuting(todo){ //todo == le recurring (newtodo est le recurry/normal qui est pris de l'array d'objet todo.recurrys)
  
  //First let's make sure there are still dates in listDates, if it's fineMai; otherwise calculate more, but not from dal, from last date + 1
  let hierOggiTime = timeLimit("hierOggi");
  let demainApresTime = timeLimit("demainApres");
  let idx = 0;
  let recurry = todo.recurrys[idx];
  let dateTime = `${recurry.date}-${recurry.dalle ? recurry.dalle.replace(":", "-") : "5-00"}`;
  while (dateTime < demainApresTime){
    if(dateTime < hierOggiTime){
      todo.recurrys.splice(idx, 1);
      //WOLA il faudrait aussi todo.listDates.splice(0, 1);
    } else{
      if(!document.getElementById(recurry.id)){
        todoCreation(recurry);
        recurry.out = true;
        //WOLA what about todo.listDates.splice(0, 1);
        //WOLA attention, quand tu sort un recurry (parce que modifié), il faudrait-y pas que tu enlève la date aussi de listDates?
        idx++;
      } else{
        idx++;
      };
    };
    
    
    // if(todo.fineOpt == "fineMai" && todo.listDates.length == 1){
    //   let newDate = date.setDate(date.getDate() + 1);//doesn't work! si c'est chaque année au 29 nov, là tu vas être au 30 nov... mais tu veux pas non plus, en avoir deux pour la même date (le dernier ici et le premier nouveau...) À moins qu'on ne fasse pas le dernier...
    //   if(todo.var == "giorno" || todo.var == "anno"){
    //     ogniOgni(todo, date);
    //   } else if(todo.var == "settimana"){
    //     ogniSettimana(todo, date);
    //   } else if(todo.var == "mese"){
    //     if(todo.meseOpt == "ogniXDate"){
    //       ogniOgni(todo, date);
    //     } else if(todo.meseOpt == "ogniXDay"){
    //       ogniMeseDay(todo, date);
    //     };
    //   };
    // };
    
    recurry = todo.recurrys[idx];//Vu qu'on splice pas, on utilise idx qui ++; donc on met out = true pour savoir que le li a déjà été créé pour pas en recréé un à chaque refresh
    dateTime = `${recurry.date}-${recurry.dalle ? recurry.dalle.replace(":", "-") : "5-00"}`;
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
  document.getElementById(donedDate).insertAdjacentHTML("beforeend", `<li ${doned.term == "showThing" ? `class="showLi" style="background-color: ${doned.STColorBG}; color: ${doned.STColorTX};"` : ``}><i class="typcn typcn-tick"></i><span class="textDone" ${doned.term == "showThing" ? `` : `style="color:${doned.color};"`}>${doned.task}</span><i class="typcn typcn-trash" onclick="trashDoneEvent(this)"></i><i class="fa-regular fa-calendar-xmark" onclick="reDateEvent(this)"></i><i class="typcn typcn-arrow-sync" onclick="recycleEvent(this)"></i></li>`);
};

function donedDateCreation(donedDate){
  let today = getTodayDate();
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



// *** ADD
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let newTask = addInput.value;
  if(!newTask == ""){
    let todo = {
      newShit: true,
      id: crypto.randomUUID(),
      task: newTask,
      color: "darkslategrey",
      icon: "fa-solid fa-ban noIcon",
      term: "oneTime",
      line: "noDay"
    };
    listTasks.push(todo);
    localStorage.listTasks = JSON.stringify(listTasks);
    todoCreation(todo);
    updateCBC();
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
      let todo = {
        id: crypto.randomUUID(),
        task: doned.task,
        icon: doned.icon,
        color: doned.color,
        info: doned.info,
        term: doned.term,
        line: "noDay"
      };
      if(todo.term == "showThing"){
        todo.showType = doned.showType;
        todo.STColorBG = doned.STColorBG;
        todo.STColorTX = doned.STColorTX;
      };
      listTasks.push(todo);
      localStorage.listTasks = JSON.stringify(listTasks);
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
  let newTodo = JSON.parse(JSON.stringify(todo));
  newTodo.id = crypto.randomUUID();
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

function reuseItEvent(thisOne){ //from Stock
  let reuseLi = thisOne.parentElement;
  let reuseId = reuseLi.id;
  let reuseIndex = listTasks.findIndex(todo => todo.id == reuseId);
  let reuse = listTasks[reuseIndex];
  let newTodo = JSON.parse(JSON.stringify(reuse));
  newTodo.id = crypto.randomUUID();
  newTodo.stored = true;
  newTodo.stockId = reuse.id;
  delete newTodo.stock;
  delete newTodo.storedId;

  listTasks.push(newTodo);
  reuse.storedId.push(newTodo.id);
  localStorage.listTasks = JSON.stringify(listTasks);
  todoCreation(newTodo);
  sortItAll();
  document.querySelector("#listInput").checked = true;
  document.querySelector("#wheneverLists").scrollIntoView();
  updateCBC();
};
window.reuseItEvent = reuseItEvent;

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
  //gotItDone(doneId);
  wheneverList.splice(num, 1);
  if(wheneverList.length == 0){
    taskToDo.innerText = "aller t'reposer!";
  } else{
    num = num < wheneverList.length ? num : 0;
    taskToDo.innerText = wheneverList[num].task;
    taskToDo.style.color = wheneverList[num].color;
    if(wheneverList[num].info){
      moreInfoWhole.classList.remove("displayNone");
      moreInfoDiv.innerText = wheneverList[num].info;
    } else{
      moreInfoWhole.classList.add("displayNone");
    };
  };
});

function checkEvent(emptyCheck){
  let li = emptyCheck.parentElement;
  let donedId = li.id;
  if(li.dataset.rec && li.dataset.rec !== "undefined"){
    let rec = li.dataset.rec;
    gotItDone(donedId, rec);
  } else{
    gotItDone(donedId, "");
  };
  li.remove();
};
window.checkEvent = checkEvent;


function gotItDone(nb, rec){ //nb = todo.id, rec = recurring Id (or "" if directly in listTasks)
  let doned;
  if(rec !== ""){ //it's a recurry! and rec is its recurring id
    let recurringIndex = listTasks.findIndex(todo => todo.id == rec);
    let donedTaskIndex = listTasks[recurringIndex].recurrys.findIndex(todo => todo.id == nb);
    let donedTaskSplice = listTasks[recurringIndex].recurrys.splice(donedTaskIndex, 1);
    doned = donedTaskSplice[0];
  } else{
    let donedTaskIndex = listTasks.findIndex(todo => todo.id == nb);
    if(listTasks[donedTaskIndex].stored == true){
      let donedTaskId = listTasks[donedTaskIndex].id;
      let stockId = listTasks[donedTaskIndex].stockId;
      let stockIndex = listTasks.findIndex(todo => todo.id == stockId);
      listTasks[stockIndex].storedId = listTasks[stockIndex].storedId.filter(id => id !== donedTaskId);
    };
    let donedTaskSplice = listTasks.splice(donedTaskIndex, 1);
    doned = donedTaskSplice[0];
  };
  
  localStorage.listTasks = JSON.stringify(listTasks);
  let donedDate = getTodayDate(); //return
  //let's just copy the whole thing! (with date and dalle and alle, etc, so that we can put them in the weekly! and so they can be tracked, etc) OR we keep them all in the listTask and just add a todo.status: todo/done and the doneDate: ""
  // let donedItem = { 
  //   task: doned.task,
  //   icon: doned.icon,
  //   color: doned.color,
  //   info: doned.info,
  //   term: doned.term
  // };
  // if(donedItem.term == "showThing"){
  //   donedItem.showType = doned.showType;
  //   donedItem.STColorBG = doned.STColorBG;
  //   donedItem.STColorTX = doned.STColorTX;
  // };
  let donedItem = JSON.parse(JSON.stringify(doned));
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
      li = list.getElementsByTagName("li"); 
      // Loop traversing through all the list items 
      for (i = 0; i < (li.length - 1); i++) { 
        stop = false; 
        if(type == "text"){
          first = li[i].querySelector(".text").textContent;
          first = first.startsWith("*") ? first.substring(1) : first;
          second = li[i + 1].querySelector(".text").textContent;
          second = second.startsWith("*") ? second.substring(1) : second;
        } else if(type == "color"){
          first = li[i].querySelector(".text").style.color;
          second = li[i + 1].querySelector(".text").style.color;
        } else if(type == "date"){
          first = li[i].dataset.date;
          second = li[i + 1].dataset.date;
        } else if(type == "term"){
          first = li[i].dataset.term;
          second = li[i + 1].dataset.term;
        } else if(type == "order"){
          first = li[i].dataset.order;
          second = li[i + 1].dataset.order;
        } else if(type == "time"){
          first = `${li[i].dataset.date}-${li[i].dataset.time.replace(":", "-")}`;
          second = `${li[i + 1].dataset.date}-${li[i + 1].dataset.time.replace(":", "-")}`;
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
  document.querySelectorAll("#listScheduled > li").forEach(li => {
    let date = li.dataset.date;
    year = date.substring(0, 4);
    month = date.substring(5, 7);
    let first = new Date(year, month - 1, 1);
    let monthName = first.toLocaleString('it-IT', {month: 'long'});
    let finalMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    if(previousMonth < month){
      li.insertAdjacentHTML("beforebegin", `<h4 class="subList">${finalMonthName} ${year}</h4>`);
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
    li = list.getElementsByTagName("li"); 
    // Loop traversing through all the list items 
    for (i = 0; i < (li.length - 1); i++) { 
      stop = false; 
      if(type == "text"){
        first = li[i].querySelector(".text").textContent;
        second = li[i + 1].querySelector(".text").textContent;
      } else if(type == "color"){
        first = li[i].querySelector(".text").style.color;
        second = li[i + 1].querySelector(".text").style.color;
      } else if(type == "date"){
        first = li[i].dataset.date;
        second = li[i + 1].dataset.date;
      } else if(type == "order"){
        first = li[i].dataset.order;
        second = li[i + 1].dataset.order;
      } else if(type == "time"){
        first = `${li[i].dataset.date}-${li[i].dataset.time.replace(":", "-")}`;
        second = `${li[i + 1].dataset.date}-${li[i + 1].dataset.time.replace(":", "-")}`;
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



// *** SHUFFLE
let wheneverList = [];
let listPage = document.querySelector("#listPage");
let toDoPage = document.querySelector("#toDoPage");
shuffleBtn.addEventListener("click", () => {
  let todayDate = getTodayDate(); //that might not work getTodayTime()
  wheneverList = listTasks.filter(task => ((!task.date || task.date == "" || task.date <= todayDate) && (task.line !== "recurringDay" && !task.stock)) || (task.date > todayDate && task.line == "doneDay")); 
  //WOLA il faudrait ajouter les recurry...
  for (let i = wheneverList.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [wheneverList[i], wheneverList[j]] = [wheneverList[j], wheneverList[i]]; 
  };
  listPage.classList.toggle("displayNone");
  toDoPage.classList.toggle("displayNone");
  num = 0;
  taskToDo.innerText = wheneverList[num].task;
  taskToDo.style.color = wheneverList[num].color;
  if(wheneverList[num].info){
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
    taskToDo.style.color = wheneverList[num].color;
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
    todo.dalle = input.value;
    li.setAttribute("data-time", input.value);
    if(!input.value){
      thisOne.innerHTML = `<i class="fa-regular fa-clock"></i>`;
    } else if(input.value){
      thisOne.textContent = input.value;
    };
    thisOne.classList.remove("displayNone");
    input.classList.add("displayNone");
    if(list == "listToday" || list == "listTomorrow"){
      sortIt("time", list);
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
let lineDay = ["todoDay", "doneDay", "recurringDay", "noDay"];



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
  if(parent.dataset.rec && parent.dataset.rec !== "undefined"){
    let rec = parent.dataset.rec;
    recIndex = listTasks.findIndex(todo => todo.id == rec);
    todoIndex = listTasks[recIndex].recurrys.findIndex(todo => todo.id == parent.id);
    todo = listTasks[recIndex].recurrys[todoIndex];
  } else{
    todoIndex = listTasks.findIndex(todo => todo.id == parent.id);
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
  let date = todo.date ? todo.date : rec ? todo.dal : getTodayDate();
  
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

  let doneDayDiv = `<div id="doneDaySection" ${shw || todo.stock ? `class="displayNone"` : ``}><input class="myRadio" type="radio" id="doneDayInput" name="whatDay" value="doneDay" ${todo.line == "doneDay" ? `checked` : ``} />
  <label for="doneDayInput" class="whatDayLabel calendarMargin"><p><span class="myRadio"></span><span class="normalText doneDay">Done Day</span><br /><span class="smallText">(the day by which it has to have been done)</span></label></p></label>
  <div class="DaySection" id="lastDaySection">
    <h5 class="taskInfoInput" style="margin-left: 0;">It's a hell of a deadline</h5>
    <div class="inDaySection" style="width: -webkit-fill-available; max-width: 280px;">
      <input type="date" id="lastDayDateInput" class="centerDateInput" value="${date}" />
      <input id="lastTuttoGiornoInput" type="checkbox" class="tuttoGiornoInput cossin" ${todo.tutto ? `checked` : todo.tutto == false ? `` : `checked`} />
      <div class="calendarInsideMargin tuttoGiornoDiv">
        <p style="margin: 0;">A qualunque ora??!</p>
        <label for="lastTuttoGiornoInput" class="slideZone">
          <div class="slider">
            <span class="si">Sì</span>
            <span class="no">No</span>
          </div>
        </label>
      </div>
      <div class="noneTuttoGiornoDiv calendarInsideMargin">
        <p><span>a che ora precisamente?</span><input id="lastDayTimeAlleInput" type="time" class="alle finaleTxt" value="${todo.alle ? todo.alle : ``}" /></p>
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

  let noDayDiv = `<div id="noDaySection" ${shw ? `class="displayNone"` : ``}><input class="myRadio" type="radio" id="noDayInput" name="whatDay" value="noDay" ${todo.line == "noDay" || todo.line == "" || !todo.line || todo.stock ? `checked` : ``} />
  <label for="noDayInput" id="noDayInputLabel" class="whatDayLabel calendarMargin"><p><span class="myRadio"></span><span class="normalText">No Day</span><br /><span class="smallText">${todo.stock ? `(let's put it away until we need it)` : `(just go with the flow)`}</span></label></p></label></div>`;

  let smallCalendar = `<div id="calendarDiv" class="${classs}" style="width:${newWidth}px;">
    ${classs == "onIcon" ? `<h5 class="taskInfoInput">Tell me when...</h5>` : ``}
    <div>
      ${todoDayDiv}
      ${doneDayDiv}
      ${recurringDayDiv}
      ${noDayDiv}
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
  if(todo.line == "noDay"){
    delete todo.date;
    delete todo.dalle;
    delete todo.alle;
    delete todo.tutto;
 //if it was a recurry, it's gonna be arranged after calendarSave (delete of the recurry)
  } else{ //means it's either todoDay, doneDay or recurringDay
    let inDaySection = document.querySelector('input[name="whatDay"]:checked ~ div.DaySection > div.inDaySection');
    todo.tutto = inDaySection.querySelector('input[type="checkbox"].tuttoGiornoInput').checked ? true : false;
    if(!todo.tutto){
      let dalle = inDaySection.querySelector('input[type="time"].dalle');
      if(dalle && dalle.value){
        todo.dalle = dalle.value;
      } else{
        delete todo.dalle;
        todo.tutto = true;
      };
      let alle = inDaySection.querySelector('input[type="time"].alle');
      if(alle && alle.value){
        todo.alle = alle.value;
      } else{
        delete todo.alle;
      };
    };
    if(todo.line == "recurringDay"){
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
    } else{ //means it's either todoDay or doneDay
      todo.date = inDaySection.querySelector('input[type="date"].centerDateInput').value;
      // if(todo.line == "doneDay"){
      //   delete todo.recurry; //si tu delete recurry, il faut le sortir de todo.recurrys et le push dans listTasks!
      // }; S'il était recurry, il va se faire deleter son recurry après calendarsave anyway
    };
  };
};



//todo.newShit => si présent et true, veut dire qu'il vient d'être créé (est deleted après)
//todo.id
//todo.task
//todo.info
//todo.color
//todo.icon
//todo.term => "oneTime", "longTerm", "showThing" (event)
//todo.showType => nom du showType (pas sûre que ça soit nécessaire)
//todo.STColorBG => couleur du background du showType
//todo.STColorTX => couleur du texte du showType
//todo.date
//todo.line => "todoDay", "doneDay", "recurringDay", "noDay"
//todo.tutto => true/false si ça dure toute la journée ou si on considère 'dalle' et 'alle'
//todo.dalle => time à laquelle ça commence aussi anciennement todo.time (pour les event)
//todo.alle => time à laquelle ça fini
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
//todo.meseDayN => numéro du day (1, 2, 3, ou 4)
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

// *** DETAILS
let showTypeChoices = [{
  colorBG: "white", //white
  colorTX: "darkslategrey"
}, {
  colorBG: "darkslategrey", //black
  colorTX: "white"
}, {
  colorBG: "#7F7F7F", //grey
  colorTX: "white"
}, {
  colorBG: "goldenrod", //yellow
  colorTX: "darkslategrey"
}, {
  colorBG: "#D5792B", //orange
  colorTX: "darkslategrey"
}, {
  colorBG: "crimson", //red
  colorTX: "white"
}, {
  colorBG: "#C54776", //pink
  colorTX: "white"
}, {
  colorBG: "darkmagenta", //magenta
  colorTX: "white"
}, {
  colorBG: "#895DBC", //mauve
  colorTX: "white"
}, {
  colorBG: "#2E7BCD", //bleue
  colorTX: "white"
}, {
  colorBG: "#06a9a9", //bleu-vert
  colorTX: "darkslategrey"
}, {
  colorBG: "#3B9869", //green
  colorTX: "white"
}];

function taskAddAllInfo(thisOne, where, why){ //where == "list", "calWeekPage", "calMonthPage", "searchScreen"
  //why == "new", "mod"
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
      color: "darkslategrey",
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
      color: "darkslategrey",
      icon: "fa-solid fa-ban noIcon",
      term: "showThing",
      line: "todoDay",
      tutto: true,
      date: kaseDate
    };
    listTasks.push(todo);
    newWidth = Number(window.innerWidth - 20);
    div = document.getElementById(where);
  } else{
    let parentId;
    if(where == "list" || where == "searchScreen"){ //not in month/week
      div = thisOne.parentElement; 
      parent = div.parentElement; 
      // parentId = parent.id;
      // if(parentId.startsWith("copy")){
      //   parentId = parentId.substring(4);
      // };
      parentId = parent.id.startsWith("copy") ? parent.id.substring(4) : parent.id;
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
  

  let myShows;
  if(mySettings.myShowTypes.length > 0){
    myShows = mySettings.myShowTypes.map((myShowType, idx) => {
      return `<div class="showTypeLabelDiv" id="div${myShowType.name}">
        <input class="showInput" type="radio" name="showOptions" id="${myShowType.name}Show" value="${myShowType.name}" ${(todo.term == "showThing" && todo.showType == myShowType.name) ? `checked` : (!todo.showType || todo.showType == "") && idx == 0 ? `checked` :  ``} />
        <label for="${myShowType.name}Show" class="showLi showTypeLabel" style="background-color:${myShowType.colorBG};color:${myShowType.colorTX};">${myShowType.name}<i class="typcn typcn-tick showTick"></i></label>
        <i class="typcn typcn-trash" onclick="trashShowTypeEvent(this)"></i>
      </div>`;
    }).join("");
  } else{
    myShows = `<h6>pssst... You've got no types of show... yet</h6>`;
  };
  let taskAllInfo = `<div id="taskInfo" style="width:${newWidth}px; ${where == "list" || where == "searchScreen" ? `top: 25px; left: -37px;` : `top: 10px; left: 10px;`}">
    <div class="taskInfoWrapper">
      <div id="SupClickScreen" class="Screen displayNone"></div>
      <input id="doneIt" type="checkbox" class="cossin cornerItInput" />
      <label for="doneIt" class="doneItLabel cornerItLabel">
        <i class="typcn typcn-input-checked-outline cornerItUnChecked"></i>
        <i class="typcn typcn-input-checked cornerItChecked"></i>
      </label>
      ${todo.recurry || todo.line == "recurringDay" ? `
      <div class="storeItLabel cornerItLabel">
        <span class="typcn typcn-arrow-repeat"></span>
      </div>` : `<input id="storeIt" type="checkbox" class="cossin cornerItInput" ${todo.stored || todo.stock ? `checked` : ``} />
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
      <h5 class="taskInfoInput">Tell me more...</h5>
      <div class="taskInfoInput relDiv">
        <span id="iconIt" class="IconI ${todo.icon}"></span>
        <input type="text" id="taskTitle" class="taskInfoInput" style="color:${todo.term == "showThing" ? `darkslategrey` : todo.color};" value="${todo.task ? todo.task : ""}">
        <span id="colorIt" class="typcn typcn-tag tagSpan ${todo.term == "showThing" ? `hidden` : ``}" style="color:${todo.color};"></span>
      </div>
      <div id="trashedArea">
        <textarea id="taskDetails" class="taskInfoInput">${todo.info ? todo.info : ""}</textarea>
        <h5 class="taskInfoInput">Tell me what...</h5>
        <div class="taskInfoInput relDiv">
        <h5 class="taskInfoSubTitle" style="margin: 0;">Reminder</h5>
          <input class="myRadio" type="radio" name="termOptions" id="reminder" value="reminder" ${todo.term == "reminder" ? `checked` : ``} />
          <label for="reminder" class="termLabel"><span class="myRadio"></span><span>It's such a special day...</span></label>
          <h5 class="taskInfoSubTitle" style="margin:10px 0 0 0;">Habit</h5>
          <input class="myRadio" type="radio" name="termOptions" id="sameHabit" value="sameHabit" ${todo.term == "sameHabit" ? `checked` : ``} />
          <label for="sameHabit" class="termLabel"><span class="myRadio"></span><span>It's always the same thing...</span></label>
          <h5 class="taskInfoSubTitle" style="margin:10px 0 0 0;">Task</h5>
          <input class="myRadio" type="radio" name="termOptions" id="oneTime" value="oneTime" ${todo.term == "oneTime" ? `checked` : ``} />
          <label for="oneTime" class="termLabel"><span class="myRadio"></span><span>It's a one time thing</span></label>
          <input class="myRadio" type="radio" name="termOptions" id="longTerm" value="longTerm" ${todo.term == "longTerm" ? `checked` : ``} />
          <label for="longTerm" class="termLabel"><span class="myRadio"></span><span>It's a long term shit</span></label>
          <input class="myRadio" type="radio" name="termOptions" id="crazyShit" value="crazyShit" ${todo.term == "crazyShit" ? `checked` : ``} />
          <label for="crazyShit" class="termLabel"><span class="myRadio"></span><span>It's just a <em>maybe-one-day-probably-never</em> kinda crazy idea</span></label>
          <h5 class="taskInfoSubTitle" style="margin:10px 0 0 0;">Event</h5>
          <input class="myRadio" type="radio" name="termOptions" id="showThing" value="showThing" ${todo.term == "showThing" ? `checked` : ``} />
          <label for="showThing" class="termLabel"><span class="myRadio"></span><span>It's a whole show!</span></label>
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
            <h5 class="taskInfoInput" style="margin-left: 0;">How long will that really take?</h5>
            <div class="inDaySection" style="width: -webkit-fill-available; max-width: 200px;">
              <p style="margin-top: 10px;"><span>Before: </span><input id="primaBuffer" type="time" step="900" value="${todo.prima ? todo.prima : `00:00`}" /></p>
              <p><span>After: </span><input id="dopoBuffer" type="time" step="900" value="${todo.dopo ? todo.dopo : `00:00`}" /></p>
            </div>
          </div>
        </div>
        <h5 class="taskInfoInput" style="margin-top: 20px;">Tell me when...</h5>
        <div id="calendarHome"></div>
      </div>
      <button id="taskInfoBtn">Save</button>
      <button class="ScreenBtn2" id="taskCancelBtn">Cancel</button>
    </div>
  </div>`;
  div.insertAdjacentHTML("beforeend", taskAllInfo); //different in month/week 
  let calendarHome = document.querySelector("#calendarHome");
  creatingCalendar(todo, calendarHome, "inHome");
  let taskInfo = document.querySelector("#taskInfo");
  let doneIt = document.querySelector("#doneIt");
  let copyIt = document.querySelector("#copyIt");
  let trashIt = document.querySelector("#trashIt");
  let storeIt = document.querySelector("#storeIt");
  let taskTitle = document.querySelector("#taskTitle");
  let taskDetails = document.querySelector("#taskDetails");
  let SupClickScreen = document.querySelector("#SupClickScreen");
  let colorIt = document.querySelector("#colorIt");
  let colorPalet = document.querySelector("#colorPalet");
  let iconIt = document.querySelector("#iconIt");
  let iconsPalet = document.querySelector("#iconsPalet");
  let taskInfoBtn = document.querySelector("#taskInfoBtn");
  let taskCancelBtn = document.querySelector("#taskCancelBtn");
  taskCancelBtn.addEventListener("click", () => {
    if(where == "list"){
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
  // *** COLOR
  //const colorList = ["orange", "red", "darkmagenta", "dodgerblue", "forestgreen", "darkslategrey"];
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
        taskTitle.style.color = newcolor;
        colorIt.style.color = newcolor;
        colorPalet.classList.add("displayNone");
        clickHandlerAddOn(colorPalet, "keep", SupClickScreen, "nowhere");
        list.insertAdjacentElement("afterend", colorPalet);
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
        list.insertAdjacentElement("afterend", iconsPalet);
      });
    });
    SupClickScreen.addEventListener("click", () => clickHandlerAddOn(iconsPalet, "keep", SupClickScreen, "nowhere"));
  });
  
  //SHOW TYPE
  let showTypeIcons = false;
  let newSTColor = false;
  let newSTColorBG;
  let newSTColorTX;
  let newSTing = false;
  let myShowDiv = document.querySelector("#myShowDiv");
  let showTypeCreationInput = document.querySelector("#showTypeCreationInput");
  let showTypeCreationConfirm = document.querySelector("#showTypeCreationConfirm");

  //Hiding lineOptions
  let todoDaySection = document.querySelector("#todoDaySection");
  let doneDaySection = document.querySelector("#doneDaySection");
  let recurringDaySection = document.querySelector("#recurringDaySection");
  let noDaySection = document.querySelector("#noDaySection");
  if(!todo.recurry && todo.line !== "recurringDay"){
    storeIt.addEventListener("click", () => {
      let radio = document.querySelector('input[name="termOptions"]:checked').value;
      if(storeIt.checked && !todo.stored){
        setN();
        if(radio == "showThing"){
          colorIt.classList.add("hidden");
          taskTitle.style.color = "darkslategrey";
        } else{
          colorIt.classList.remove("hidden");
          taskTitle.style.color = newcolor ? newcolor : todo.color;
        };
      } else if(radio == "showThing" || radio == "reminder"){
        setTR();
        if(radio == "showThing"){
          colorIt.classList.add("hidden");
          taskTitle.style.color = "darkslategrey";
        } else if(radio == "reminder"){
          colorIt.classList.remove("hidden");
          taskTitle.style.color = newcolor ? newcolor : todo.color;
        };
      } else{
        colorIt.classList.remove("hidden");
        taskTitle.style.color = newcolor ? newcolor : todo.color;
        setTRN();
      };
    });
  };
  
  document.querySelectorAll('input[name="termOptions"]').forEach(radio => {
    radio.addEventListener("click", () => {
      if(radio.checked && storeIt.checked && !todo.stored){
        colorIt.classList.remove("hidden");
        taskTitle.style.color = newcolor ? newcolor : todo.color;
        setN();
      } else if(radio.checked && (radio.value == "showThing" || radio.value == "reminder") ){
        setTR();
        if(radio.value == "showThing"){
          colorIt.classList.add("hidden");
          taskTitle.style.color = "darkslategrey";
        } else if(radio.value == "reminder"){
          colorIt.classList.remove("hidden");
          taskTitle.style.color = newcolor ? newcolor : todo.color;
        };
      } else{
        colorIt.classList.remove("hidden");
        taskTitle.style.color = newcolor ? newcolor : todo.color;
        setTRN();
      };
    });
  });
  function setTR(){
    todoDaySection.classList.remove("displayNone");
    doneDaySection.classList.add("displayNone");
    recurringDaySection.classList.remove("displayNone");
    noDaySection.classList.add("displayNone");
    document.querySelector(`input[name="whatDay"]#${todo.line !== "recurringDay" ? "todoDay" : todo.line}Input`).checked = true;
    document.querySelector("#todoDayInputLabel").innerHTML = `<p><span class="myRadio"></span><span class="normalText todoDay">Happening Day</span><br /><span class="smallText">(the day this is all gonna go down)</span></p>`;
    document.querySelector("#noDayInputLabel span.smallText").innerText = `(just go with the flow)`;
    taskInfoBtn.innerText = "Save";
  };
  function setN(){
    todoDaySection.classList.add("displayNone");
    doneDaySection.classList.add("displayNone");
    recurringDaySection.classList.add("displayNone");
    noDaySection.classList.remove("displayNone"); 
    document.querySelector("#noDayInput").checked = true;
    document.querySelector("#noDayInputLabel span.smallText").innerText = `(let's put it away until we need it)`;
    taskInfoBtn.innerText = "Save & put it away";
  };
  function setTRN(){
    todoDaySection.classList.remove("displayNone");
    doneDaySection.classList.remove("displayNone");
    recurringDaySection.classList.remove("displayNone");
    noDaySection.classList.remove("displayNone"); 
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
      let STicons = showTypeChoices.map((icon, idx) => {
        return `<div class="showTypeIconsB" data-index="${idx}"><div class="showTypeIconsC" style="background-color:${icon.colorBG};"><i class="typcn typcn-tick-outline" style="color:${icon.colorTX};"></i></div></div>`;
      }).join("");
      document.querySelector(".showTypeCreationInside").insertAdjacentHTML("beforeend", `<div class="showTypeIconsDiv">${STicons}</div>`);
      document.querySelectorAll(".showTypeIconsB").forEach(btn => {
        btn.addEventListener("click", (e) => {
          newSTColorBG = showTypeChoices[e.currentTarget.dataset.index].colorBG ;
          newSTColorTX = showTypeChoices[e.currentTarget.dataset.index].colorTX;
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
    showTypeCreationConfirm.style.color = "darkslategrey";
    if(newSTColor && showTypeCreationInput.value){
      let showType = {
        name: showTypeCreationInput.value,
        colorBG: newSTColorBG,
        colorTX: newSTColorTX
      };
      mySettings.myShowTypes.push(showType);
      if(mySettings.myShowTypes.length == 1){
        myShowDiv.innerHTML = ``;
      };
      myShowDiv.insertAdjacentHTML("beforeend", `<div class="showTypeLabelDiv" id="div${showType.name}">
        <input class="showInput" type="radio" name="showOptions" id="${showType.name}Show" value="${showType.name}" ${mySettings.myShowTypes.length == 1 ? `checked` : ``} />
        <label for="${showType.name}Show" class="showLi showTypeLabel" style="background-color:${showType.colorBG};color:${showType.colorTX};">${showType.name}<i class="typcn typcn-tick showTick"></i></label>
        <i class="typcn typcn-trash" onclick="trashShowTypeEvent(this)"></i>
      </div>`);
      
      localStorage.mySettings = JSON.stringify(mySettings);
      document.querySelectorAll(".underh5").forEach(h => {
        h.remove();
      });
      showTypeCreationInput.value = "";
      showTypeCreationInput.style.backgroundColor = "white";
      showTypeCreationInput.style.color = "darkslategrey";
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
  if(where == "list"){
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
      todo.task = taskTitle.value.startsWith("*") ? taskTitle.value.substring(1) : taskTitle.value;
      if(taskDetails.value !== ""){
        todo.info = taskDetails.value;
      } else{
        delete todo.info;
      };
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
            chosen = true;
          };
        });
        if(!chosen){
          console.log("should stop");
          e.preventDefault();//This is not working
          e.currentTarget.insertAdjacentHTML("beforebegin", `<h5>You need to decide what kinda show that is</h5>`);
        };
        let primaBuffer = document.querySelector("#primaBuffer");
        let dopoBuffer = document.querySelector("#dopoBuffer");
        todo.prima = primaBuffer.value ? primaBuffer.value : "00:00";
        todo.dopo = dopoBuffer.value ? dopoBuffer.value : "00:00";
      } else{
        delete todo.showType;
        delete todo.STColorBG;
        delete todo.STColorTX;
      };

      if(todo.newShit){//considérer juste un bouton "add" et directement avoir la fenêtre taskAddAllInfo (ça permet moins le capture tool effet, mais la création est plus rapide... Au pire, ça pourrait être un setting!)
        delete todo.newShit;
      };

      if(!todo.recurry && todo.line !== "recurringDay"){
        if(!todo.stock && !todo.stored && storeIt.checked){
          stockCreaction(todo); //todo.stored = true; (has a model in storage) (included in stockCreation)
        };
        if(todo.stock && !storeIt.checked){
          trashStock(todo.id);
        };
        if(todo.stored && !storeIt.checked){
          trashStock(todo.stockId);
        };
      };
  
      

      calendarSave(todo); // s'il était un recurringDay, les recurrys ont tous été recréés à son image... FUCK (pas ceux qui étaient déjà out!)! ... à moins que... il en cré de nouveaux!! car dans todoCreation, tu passe par togoList et ça fait recurryOuting... et les nouveaux recurry seront pas encore "out", fac ils vont être créés... alors il faudrait juste se débarasser des anciens! ça pourrait être dans clearRecurringData...
      //parent is global (no need for parent since todoCreation)
      if(why !== "new" && parent.dataset.rec && parent.dataset.rec !== "undefined"){
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

      if(where == "list"){
        parents = Array.from(document.querySelectorAll("li")).filter((li) => li.id.includes(todo.id));
      };

      if(doneIt.checked){
        gotItDone(todo.id, "");
      } else{
        todoCreation(todo); 
        sortItAll();
      };
      
      
    } else if(trashIt.checked){
      if(todo.recurry && todo.recId){
        listTasks[recIndex].recurrys.splice(todoIndex, 1);
      } else{
        listTasks.splice(todoIndex, 1);
      };
    };
    localStorage.listTasks = JSON.stringify(listTasks);
    updateWeek();
    updateMonth();
    
    //for searchFound moving = false!
    //
    if(where == "list" && togoList !== ""){
      moving = true;
      parents.forEach(parent => {
        parent.remove();
      });
      //parent.remove(); // it wasn't complaining but that was still useless...
      clickHandlerAddOn(taskInfo, "trash", clickScreen, togoList);
    } else if(where == "list" && togoList == ""){
      parents.forEach(parent => {
        parent.remove();
      });
      //parent.remove(); // it wasn't complaining but that was still useless...
      clickHandlerAddOn(taskInfo, "trash", clickScreen, togoList);
    } else{ //not in the list, so month/week
      moving = false;
      taskInfo.remove();
    };
    updateCBC();
  });
};
window.taskAddAllInfo = taskAddAllInfo;

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
  } else if(section.querySelector(".swipingInput")){
    if(list == "listTomorrow"){
      section.querySelector(".swipingInput").checked = true;
    } else if(list == "listToday"){
      section.querySelector(".swipingInput").checked = false;
    };
  };
  section.scrollIntoView();
};

function clickHandlerAddOn(addOn, future, screen, listToGo){
  parent.classList.remove("selectedTask");
  if(moving && screen == clickScreen){
    scrollToSection(listToGo);
    moving = false;
  };
  if(future == "keep"){
    addOn.classList.add("displayNone");
    document.querySelector("#list").insertAdjacentElement("afterend", addOn);
  } else if(future == "trash"){
    addOn.remove();
  };
  screen.classList.add("displayNone");
  screen.removeEventListener("click", () => clickHandlerAddOn(addOn, future, screen, listToGo));
};

// *** ICON
let iconTag;
function iconChoice(thisOne){
  iconTag = thisOne;
  parent = iconTag.parentElement;
  parent.classList.add("selectedTask");
  let li = iconTag.parentElement; //li and parent are the same!!!
  let todo;
  let recIndex;
  let todoIndex;
  if(li.dataset.rec && li.dataset.rec !== "undefined"){ // have a function to do that, that will return the todo. because with project, you'll have the same math to do
    let rec = li.dataset.rec;
    recIndex = listTasks.findIndex(todo => todo.id == rec);
    todoIndex = listTasks[recIndex].recurrys.findIndex(todo => todo.id == li.id);
    todo = listTasks[recIndex].recurrys[todoIndex];
  } else{
    todoIndex = listTasks.findIndex(todo => todo.id == li.id);
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
function getTodayDate(){
  let date = new Date();
  let currentHour = String(date.getHours()).padStart(2, "0");
  let currentMinute = String(date.getMinutes()).padStart(2, "0");
  let currentTime = `${currentHour}:${currentMinute}`;
  let currentDay = currentTime <= mySettings.myTomorrow ? (date.getDate() - 1) : date.getDate();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;
};

function getTomorrowDate(){
  let date = new Date();
  date.setDate(date.getDate() + 1);
  let currentHour = String(date.getHours()).padStart(2, "0");
  let currentMinute = String(date.getMinutes()).padStart(2, "0");
  let currentTime = `${currentHour}:${currentMinute}`;
  let currentDay = currentTime <= mySettings.myTomorrow ? (date.getDate() - 1) : date.getDate();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;
};

function timeLimit(limit){
  let nowDate = new Date();
  let currentHour = String(nowDate.getHours()).padStart(2, "0");
  let currentMinute = String(nowDate.getMinutes()).padStart(2, "0");
  let currentTime = `${currentHour}:${currentMinute}`;
  let currentDay = currentTime <= mySettings.myTomorrow ? (nowDate.getDate() - 1) : nowDate.getDate();
  let currentMonth = String(nowDate.getMonth()+1).padStart(2, "0");
  let currentYear = nowDate.getFullYear();
  nowDate.setDate(nowDate.getDate() + 1);
  let tomoDay = currentTime <= mySettings.myTomorrow ? (nowDate.getDate() - 1) : nowDate.getDate();
  nowDate.setDate(nowDate.getDate() + 1);
  let afterDay = currentTime <= mySettings.myTomorrow ? (nowDate.getDate() - 1) : nowDate.getDate();
  let limitDay;
  let modifiedTomorrow = mySettings.myTomorrow.replace(":", "-")
  if(limit == "hierOggi"){
    limitDay = String(currentDay).padStart(2, "0");
  } else if(limit == "oggiDemain"){
    limitDay = String(tomoDay).padStart(2, "0");
  } else if(limit == "demainApres"){
    limitDay = String(afterDay).padStart(2, "0");
  };
  let timeLimit = `${currentYear}-${currentMonth}-${limitDay}-${modifiedTomorrow}`;
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
  let filteredShows = listTasks.filter((todo) => todo.term == "showThing");
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
  
  let sortedShows = shows.sort((s1, s2) => (s1.date < s2.date) ? -1 : (s1.date > s2.date) ? 1 : (s1.date == s2.date) ? (s1.dalle < s2.dalle) ? -1 : (s1.dalle > s2.dalle) ? 1 : 0 : 0);
  shows = sortedShows;
  shows.forEach(show => {
    let eventDiv = `<div data-id="${show.id}" ${show.recurry ? `data-rec="${show.recId}"` : ``} data-showType="${show.showType}" ${!show.past ? `onclick="taskAddAllInfo(this, 'calMonthPage', 'mod')"` : ``} class="eventDiv ${show.past ? "pastEvent" : ""}" style="background-color:${show.STColorBG}; color:${show.STColorTX};">${show.task}</div>`;
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
  let today = getTodayDate();
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
  let Sday = arrayDate[arrayDate.length - 2].full;
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

function roundFifteenTime(realTime){
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
  let shows = listTasks.filter((todo) => (todo.term == "showThing" || todo.term == "reminder"));
  shows.map(show => {
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
  let dayIdx = meseDayICalc(show.date);
  let idx = mySettings.myWeeksDayArray.findIndex((giorno) => giorno.day == dayIdx);
  let day = `${mySettings.myWeeksDayArray[idx].code}`;  
  let div;
  let add;
  if(show.tutto || !show.dalle || show.dalle == ""){
    div = document.querySelector(`[data-tutto="${day}"]`);
    add = `<div data-id="${show.id}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${show.term == "showThing" ? `data-showType="${show.showType}"` : ``} onclick="taskAddAllInfo(this, 'calWeekPage', 'mod')" class="weeklyEvent ${show.past ? "pastEvent" : ""}" style="${show.term == "showThing" ? `background-color:${show.STColorBG}; color:${show.STColorTX};` : `color:${show.color}; border:none;`}">
    ${show.task} <i class="IconI ${show.icon}"></i>
  </div>`;
  } else{
    let primaDiv = ``;
    let dopoDiv = ``;
    div = document.querySelector(".weeklyContainer");
    let hourStart = roundFifteenTime(show.dalle);
    let hourEnd = (show.alle && show.alle !== "00:00") ? roundFifteenTime(show.alle) : "end";
    if(show.prima && show.prima !== "00:00"){
      let prima = roundFifteenTime(show.prima);
      prima = timeMath(hourStart, "minus", prima);
      primaDiv = `<div class="weeklyBuffer ${show.past ? "pastEvent" : ""}" style="grid-column:col-${day}; grid-row:row-${prima}/row-${hourStart};"></div>`;
    };
    if(show.dopo && show.dopo !== "00:00"){
      let dopo = roundFifteenTime(show.dopo);
      dopo = timeMath(hourEnd, "plus", dopo);
      dopoDiv = `<div class="weeklyBuffer ${show.past ? "pastEvent" : ""}" style="grid-column:col-${day}; grid-row:row-${hourEnd}/row-${dopo};"></div>`;
    };
    add = `
    ${primaDiv}
    <div data-id="${show.id}" ${show.recurry ? `data-rec="${show.recId}"` : ``} ${show.term == "showThing" ? `data-showType="${show.showType}"` : ``} onclick="taskAddAllInfo(this, 'calWeekPage', 'mod')" class="weeklyEvent ${show.past ? "pastEvent" : ""}" style="${show.term == "showThing" ? `background-color:${show.STColorBG}; color:${show.STColorTX};` : `color:${show.color}; border:none;`}  grid-column:col-${day}; grid-row:row-${hourStart}${show.term == "reminder" ? `` : `/row-${hourEnd}`};">
      ${show.task}<br />
      <i class="IconI ${show.icon}"></i>
    </div>
    ${dopoDiv}
    `;
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
  }, 1000);
};



function onLongPress(element, list, callback) {
  let timer;
  let wholeList;
  let siblings;
  // element.addEventListener('touchstart', (e) => { 
  //   timer = setTimeout(() => {
  //     timer = null;
  //     element.classList.add("dragging");
  //     console.log(element);
  //     wholeList = document.querySelector("#" + list);
  //     siblings = [...wholeList.querySelectorAll("li:not(.dragging)")];
  //     console.log(siblings);
  //     callback(e, list);
  //   }, 500);
  // });
  element.addEventListener('dragstart', (e) => { 
      element.classList.add("dragging");
      console.log(element);
      wholeList = document.querySelector("#" + list);
      siblings = [...wholeList.querySelectorAll("li:not(.dragging)")];
      console.log(siblings);
      //callback(e);
  });
  function cancel(e) {
    clearTimeout(timer);
    e.currentTarget.classList.remove("dragging");
    setNewOrder(list);
  };
  function drapDropIt(e){
    e.preventDefault();
    // let wholeList = document.querySelector("#" + list);
    //const draggingLi = document.querySelector(".dragging");
    // let siblings = [...wholeList.querySelectorAll("li:not(.dragging)")];
    console.log(siblings);
    let nextSibling = siblings.find(sibling => {
      if (e.clientX) {
        //if mouse
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
      } else {
        //if touch
        return e.changedTouches[0].clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
      };
    });
    //nextSibling.insertAdjacentElement("beforebegin", element);
    wholeList.insertBefore(element, nextSibling);
  };
  element.addEventListener('touchmove', (e) => {
    drapDropIt(e);
  });
  element.addEventListener('dragover', (e) => {
    drapDropIt(e);
  });
  element.addEventListener('touchend', (e) => {
    cancel(e);
  });
  element.addEventListener('dragend', (e) => {
    cancel(e);
  });
  element.addEventListener('drop', (e) => {
    cancel(e);
  });
};

function setNewOrder(list){
  let n = 1;
  document.querySelectorAll("#" + list + " > li").forEach(li => {
    li.setAttribute("data-order", n);
    let todoIndex = listTasks.findIndex(el => el.id == li.id);
    let todo = listTasks[todoIndex];
    todo.order = n;
    n++;
  });
  localStorage.listTasks = JSON.stringify(listTasks);
  updateCBC();
};
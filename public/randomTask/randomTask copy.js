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
  } else{
    userConnected = false;
    logInScreen.classList.remove("displayNone");
    logInBtn.addEventListener("click", logIn);
    tryBtn.addEventListener("click", freeIn);
    cloudIt.classList.add("displayNone");
  };
});




// *** START
let listTasks = [];
let listDones = [];
let myListTasks = [];
let myListDones = [];
let myTomorrow = ``;
let cBC;
let icons = ["fa-solid fa-comments", "fa-solid fa-lightbulb", "fa-solid fa-dollar-sign", "fa-solid fa-spider", "fa-solid fa-gavel", "fa-solid fa-couch", "fa-solid fa-head-side-virus", "fa-solid fa-screwdriver-wrench", "fa-solid fa-universal-access", "fa-solid fa-droplet", "fa-solid fa-code", "fa-solid fa-poo", "fa-solid fa-globe", "fa-solid fa-briefcase", "fa-solid fa-brain", "fa-solid fa-champagne-glasses", "fa-solid fa-seedling", "fa-solid fa-utensils", "fa-solid fa-heart-pulse", "fa-solid fa-sun", "fa-solid fa-broom", "fa-solid fa-people-group", "fa-solid fa-bullhorn", "fa-regular fa-face-grin-stars", "fa-regular fa-face-grin-hearts", "fa-regular fa-face-grin-squint", "fa-regular fa-face-smile-wink", "fa-regular fa-face-meh-blank", "fa-regular fa-face-flushed", "fa-regular fa-face-grimace", "fa-regular fa-face-rolling-eyes", "fa-regular fa-face-grin-beam-sweat", "fa-regular fa-face-surprise", "fa-regular fa-face-frown-open", "fa-regular fa-face-frown", "fa-regular fa-face-sad-tear", "fa-regular fa-face-tired", "fa-regular fa-face-sad-cry", "fa-regular fa-face-dizzy", "fa-regular fa-face-angry", "fa-solid fa-ban noIcon"];

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
  if(localStorage.getItem("myTomorrow")){
    myTomorrow = localStorage.myTomorrow;
  } else {
    myTomorrow = getTasks.data().myTomorrow;
  };
  (() => {
    let todayDate = getTodayDate();
    let tomorrowDate = getTomorrowDate();
    document.getElementById("todaysDateSpan").innerHTML = `(${todayDate})`;
    document.getElementById("tomorrowsDateSpan").innerHTML = `(${tomorrowDate})`;
  })();
  if(localStorage.getItem("listTasks")){
    listTasks = JSON.parse(localStorage.listTasks);
  } else if(getTasks.exists()){
    // getTasks.data().listTasks.map((todo) => {
    //   console.log(todo);
    //   let idIt = todo.id;
    //   let taskIt = todo.task;
    //   let colorIt = todo.color;
    //   let infoIt = todo.info;
    //   let dateIt = todo.date;
    //   let lineIt = todo.line;
    //   myListTasks.push({id: idIt, task: taskIt, color: colorIt, info: infoIt, date: dateIt, line: lineIt});
    // });
    // listTasks = myListTasks;
    listTasks = getTasks.data().listTasks;
    localStorage.listTasks = JSON.stringify(listTasks);
  };
  listTasks.forEach(todo => {
    todoCreation(todo);
  });
  updateArrowsColor();
  sortItAll();
  // sortIt("color", "listOne");
  // sortIt("date", "listScheduled");
  // sortIt("text", "listStorage");
  // sortIt("time", "listToday");
  // sortIt("time", "listTomorrow");
  // sortIt("order", "listToday");
  // sortIt("order", "listTomorrow");
  // document.querySelectorAll("#listToday > li").forEach(element => {
  //   element.setAttribute("draggable", true);
  //   // onLongPress(element, "listToday", drapDropIt);
  //   onLongPress(element, "listToday");
  // });
  // document.querySelectorAll("#listTomorrow > li").forEach(element => {
  //   onLongPress(element, "listTomorrow");
  // });
  // sortColor("listOne");
  // sortDate("listScheduled");
  // sortText("listStorage");
};

async function getDones(){
  const getDones = await getDocs(collection(db, "randomTask", auth.currentUser.email, "myListDones"));
  if(localStorage.getItem("listDones")){
    listDones = JSON.parse(localStorage.listDones);
  } else if(getDones){
    getDones.forEach((donedDate) => {
      let mydate = donedDate.id;
      let donedDateDones = donedDate.data().dones;
      let mylist = [];
      donedDateDones.map((done) => {
        let taskIt = done.task;
        let colorIt = done.color;
        let infoIt = done.info;
        let iconIt = done.icon;
        let termIt = done.term;
        let showTypeIt = done.showType;
        mylist.push({task: taskIt, color: colorIt, info: infoIt, icon: iconIt, term: termIt, showType: showTypeIt});
      });
      myListDones.push({date: mydate, list: mylist});
    });
    listDones = myListDones;
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
};



function freeIn(){ 
  if(localStorage.getItem("myTomorrow")){
    myTomorrow = localStorage.myTomorrow;
  };
  
  if(localStorage.getItem("listTasks")){
    listTasks = JSON.parse(localStorage.listTasks);
    listTasks.forEach(todo => {
      todoCreation(todo);
    });
  };
  
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


// *** CLOUDSAVE

async function saveToCloud(){
  const batch = writeBatch(db);
  listTasks = JSON.parse(localStorage.listTasks);
  const docRefTasks = doc(db, "randomTask", auth.currentUser.email);
  const docSnapTasks = await getDoc(docRefTasks);
  if (docSnapTasks.exists()){
    batch.update(doc(db, "randomTask", auth.currentUser.email), { // or batch.update or await updateDoc
      listTasks: listTasks
    });
  } else{
    batch.set(doc(db, "randomTask", auth.currentUser.email), { // or batch.set or await setDoc
      listTasks: listTasks
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
  myListTasks = [];
  myListDones = [];
  resetModif();
  resetCBC();
  getTasksSettings();
  getDones();
  clearStorageBtn.textContent = "Updated!";
  updateArrowsColor();
};

async function cloudSaveTomorrow(){
  const docRef = doc(db, "randomTask", auth.currentUser.email);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()){
    await updateDoc(doc(db, "randomTask", auth.currentUser.email), {
      myTomorrow: myTomorrow
    });
  } else{
    await setDoc(doc(db, "randomTask", auth.currentUser.email), {
      myTomorrow: myTomorrow
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
settings.addEventListener("click", () => {
  settingsScreen.classList.remove("displayNone");
  //UPDATE
  clearStorageBtn.addEventListener("click", updateFromCloud);
  exitX.addEventListener("click", () => {
    settingsScreen.classList.add("displayNone");
  });
  if(myTomorrow){
    timeInput.value = myTomorrow;
  };
  settingsBtn.addEventListener("click", () => {
    myTomorrow = `${timeInput.value}`;
    localStorage.myTomorrow = myTomorrow;
    if(userConnected){
      cloudSaveTomorrow();
    };
    settingsScreen.classList.add("displayNone");
  });
  cancelBtn.addEventListener("click", () => {
    settingsScreen.classList.add("displayNone");
  });
});

// *** CREATION

function todoCreation(todo){
  let togoList = getTogoList(todo);
  //console.log(togoList);
  if(todo.stock){
    document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}"><i class="typcn typcn-trash trashCan" onclick="trashStockEvent(this)"></i><i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i><div class="textDiv"><span class="text" onclick="taskAddAllInfo(this)" style="color:${todo.color};">${todo.info ? '*' : ''}${todo.task}</span></div><span class="timeSpan">${todo.dalle ? todo.dalle : ''}</span><i class="fa-solid fa-recycle" onclick="reuseItEvent(this)"></i></li>`);
  } else if(todo.line == "recurringDay"){
    document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}"><i class="typcn typcn-trash trashCan" onclick="trashRecurringEvent(this)"></i><i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i><div class="textDiv"><span class="text" onclick="taskAddAllInfo(this)" style="color:${todo.color};">${todo.info ? '*' : ''}${todo.task}</span></div><span class="timeSpan">${todo.dalle ? todo.dalle : ''}</span><i class="typcn typcn-calendar-outline calendarSpan ${todo.line}" onclick="smallCalendarChoice(this)"></i></li>`);
  } else if(todo.term == "showThing" && togoList){
    document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-date="${todo.date}" data-time="${todo.dalle ? todo.dalle : ""}" data-order="${todo.order ? todo.order : ""}" class="showLi" style="background-color: ${todo.STColorBG}; color: ${todo.STColorTX};">
      <i class="typcn typcn-media-stop-outline emptyCheck" onclick="checkEvent(this)"></i>
      <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i>
      <div class="textDiv"><span class="text" onclick="taskAddAllInfo(this)">${todo.info ? '*' : ''}${todo.task}</span></div>
      <span class="timeSpan" onclick="timeItEvent(this)">${todo.dalle ? todo.dalle : `<i class="fa-regular fa-clock"></i>`}</span>
      <input type="time" class="displayNone"/>
      <i class="typcn typcn-calendar-outline calendarSpan" onclick="smallCalendarChoice(this)"></i>
    </li>`);
  } else{
    document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-date="${todo.date}" data-time="${todo.dalle ? todo.dalle : ""}" data-order="${todo.order ? todo.order : ""}">
      <i class="typcn typcn-media-stop-outline emptyCheck" onclick="checkEvent(this)"></i>
      <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i>
      <div class="textDiv"><span onclick="taskAddAllInfo(this)" class="text" style="color:${todo.color};">${todo.info ? '*' : ''}${todo.task}</span></div>
      <span class="timeSpan" onclick="timeItEvent(this)">${todo.dalle ? todo.dalle : ""}</span>
      <input type="time" class="displayNone"/>
      <i class="typcn typcn-calendar-outline calendarSpan ${todo.line}" onclick="smallCalendarChoice(this)"></i>
    </li>`);
  };
};

function getTogoList(todo){
  let todayDate = getTodayDate();
  let tomorrowDate = getTomorrowDate();
  let togoList;
  if(todo.newShit){
    togoList = "listLimbo";
  } else if(todo.stock){
    togoList = "listStorage";
  } else if(todo.date == "" || !todo.date || todo.date > todayDate){
    if(todo.line == "todoDay" || todo.line == "recurry"){
      if(todo.date == tomorrowDate){
        togoList = "listTomorrow";
      } else if(todo.term == "showThing"){
        togoList = "";
      } else{
        togoList = "listScheduled";
      };
    } else if(todo.term == "showThing"){
      togoList = "";
    } else if(todo.line == "recurringDay"){
      togoList = "listRecurring";
      recurryCreation(todo);
    } else if(todo.line == "doneDay" && todo.date == tomorrowDate){
      togoList = "listTomorrow";
    } else if (todo.term == "oneTime") {
      togoList = "listOne";
    } else {
      togoList = "list";
    };
  } else if(todo.date == todayDate){
    togoList = "listToday";
  } else if(todo.date < todayDate){
    if(todo.term == "showThing"){
      togoList = "";
    } else{
      togoList = "listOups";
    };
  };
  return togoList;
};

function recurryCreation(todo){ //todo == le recurring (newtodo est le recurry/normal qui est créé)
  //First let's make sure there are still dates in listDates, if it's fineMai; otherwise calculate more, but not from dal, from last date + 1
  
  let tomorrowDate = getTomorrowDate();
  let date = todo.listDates[0];
  while (date <= tomorrowDate){
    let newtodo = {
      id: crypto.randomUUID(),
      date: date,
      line: "recurry",
      task: todo.task,
      icon: todo.icon,
      color: todo.color,
      info: todo.info,
      term: todo.term
    };
    listTasks.push(newtodo);
    if(todo.fineOpt == "fineMai" && todo.listDates.length == 1){
      let newDate = date.setDate(date.getDate() + 1);//doesn't work! si c'est chaque année au 29 nov, là tu vas être au 30 nov... mais tu veux pas non plus, en avoir deux pour la même date (le dernier ici et le premier nouveau...) À moins qu'on ne fasse pas le dernier...
      if(todo.var == "giorno" || todo.var == "anno"){
        ogniOgni(todo, date);
      } else if(todo.var == "settimana"){
        ogniSettimana(todo, date);
      } else if(todo.var == "mese"){
        if(todo.meseOpt == "ogniXDate"){
          ogniOgni(todo, date);
        } else if(todo.meseOpt == "ogniXDay"){
          ogniMeseDay(todo, date);
        };
      };
    };
    todo.listDates.splice(0, 1);
    localStorage.listTasks = JSON.stringify(listTasks);
    todoCreation(newtodo);
    updateCBC();
    date = todo.listDates[0];
  };
};

function donedCreation(donedDate, doned){
  if(doned.term == "showThing"){//now we'll need to add STcolorBG and STcolorTx or something like that so that we don't need css! it won't be a class anymore!
    document.getElementById(donedDate).insertAdjacentHTML("beforeend", `<li class="showLi ${doned.showType}"><i class="typcn typcn-tick"></i><span class="textDone">${doned.task}</span><i class="typcn typcn-trash trashCan" onclick="trashDoneEvent(this)"></i><i class="typcn typcn-arrow-sync recycle" onclick="recycleEvent(this)"></i></li>`);
  } else {
    document.getElementById(donedDate).insertAdjacentHTML("beforeend", `<li><i class="typcn typcn-tick"></i><span class="textDone" style="color:${doned.color};">${doned.task}</span><i class="typcn typcn-trash trashCan" onclick="trashDoneEvent(this)"></i><i class="typcn typcn-arrow-sync recycle" onclick="recycleEvent(this)"></i></li>`);
  };
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
      icon: "fa-solid fa-ban noIcon"
    };
    listTasks.push(todo);
    localStorage.listTasks = JSON.stringify(listTasks);
    updateCBC();
    todoCreation(todo);
    document.querySelector("#sectionLimbo").classList.remove("displayNone");
    // document.querySelector("#listInput").checked = true;
    // document.querySelector("#wheneverLists").scrollIntoView();
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
        info: doned.info
      };//et si c'est un showThing?!
      listTasks.push(todo);
      localStorage.listTasks = JSON.stringify(listTasks);
      updateCBC();
      todoCreation(todo);
      document.querySelector("#listInput").checked = true;
      document.querySelector("#wheneverLists").scrollIntoView();
    };
  };    
};
window.recycleEvent = recycleEvent;

function stockCreaction(todo){ 
  let newtodo = {
    id: crypto.randomUUID(),
    task: todo.task,
    icon: todo.icon,
    color: todo.color,
    info: todo.info,
    term: todo.term,
    stock: true, //is in storage
    storedId: [todo.id]
  };
  listTasks.push(newtodo);
  todo.stored = true; //has a model in storage
  todo.stockId = newtodo.id;
  localStorage.listTasks = JSON.stringify(listTasks);
  todoCreation(newtodo);
  document.querySelector("#storageInput").checked = true;
  document.querySelector("#storageList").scrollIntoView();
};

function reuseItEvent(thisOne){ //from Stock
  let reuseLi = thisOne.parentElement;
  let reuseId = reuseLi.id;
  let reuseIndex = listTasks.findIndex(todo => todo.id == reuseId);
  let reuse = listTasks[reuseIndex];
  let todo = {
    id: crypto.randomUUID(),
    task: reuse.task,
    icon: reuse.icon,
    color: reuse.color,
    info: reuse.info,
    term: reuse.term,
    stored: true,
    stockId: reuse.id
  };
  listTasks.push(todo);
  reuse.storedId.push(todo.id);
  localStorage.listTasks = JSON.stringify(listTasks);
  todoCreation(todo);
  document.querySelector("#listInput").checked = true;
  document.querySelector("#wheneverLists").scrollIntoView();
  updateCBC();
};
window.reuseItEvent = reuseItEvent;

// *** DONE/ERASE
let num = 0;

doneNextBtn.addEventListener("click", () => {
  let doneId = wheneverList[num].id;
  let doneLi = document.getElementById(doneId);
  doneLi.remove();
  gotItDone(doneId);
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
  li.remove();
  gotItDone(donedId);
};
window.checkEvent = checkEvent;

function gotItDone(nb){
  let donedTaskIndex = listTasks.findIndex(todo => todo.id == nb);
  if(listTasks[donedTaskIndex].stored == true){
    let donedTaskId = listTasks[donedTaskIndex].id;
    let stockId = listTasks[donedTaskIndex].stockId;
    let stockIndex = listTasks.findIndex(todo => todo.id == stockId);
    listTasks[stockIndex].storedId = listTasks[stockIndex].storedId.filter(id => id !== donedTaskId);
  };
  let donedTaskSplice = listTasks.splice(donedTaskIndex, 1);
  let donedTask = donedTaskSplice[0].task;
  let donedIcon = donedTaskSplice[0].icon;
  let donedColor = donedTaskSplice[0].color;
  let donedInfo = donedTaskSplice[0].info;
  let donedTerm = donedTaskSplice[0].term;
  let donedShowType = "";
  if(donedTaskSplice[0].term == "showThing"){
    donedShowType = donedTaskSplice[0].showType;
  };
  localStorage.listTasks = JSON.stringify(listTasks);
  let donedDate = getTodayDate(); //return
  let donedItem = {
    task: donedTask,
    icon: donedIcon,
    color: donedColor,
    info: donedInfo,
    term: donedTerm,
    showType: donedShowType //now we'll need to add STcolorBG and STcolorTx or something like that so that we don't need css! it won't be a class anymore! AND 'dalle' et 'alle' et 'tutto'
  };
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
      listTasks[todoIndex].stored = false;
      listTasks[todoIndex].stockId = "";
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
  let lastWeek = getLastWeekDate();
  let recent = listDones.filter((td) => td.date >= lastWeek);
  localStorage.listDones = JSON.stringify(recent);
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
          first = li[i].dataset.time;
          second = li[i + 1].dataset.time;
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
        first = li[i].dataset.time;
        second = li[i + 1].dataset.time;
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
shuffleBtn.addEventListener("click", () => {
  let todayDate = getTodayDate();
  wheneverList = listTasks.filter(task => ((!task.date || task.date == "" || task.date <= todayDate) && (task.line !== "recurringDay" && !task.stock)) || (task.date > todayDate && task.line == "doneDay")); 
  for (let i = wheneverList.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [wheneverList[i], wheneverList[j]] = [wheneverList[j], wheneverList[i]]; 
  };
  listSection.classList.toggle("displayNone");
  toDoSection.classList.toggle("displayNone");
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
  listSection.classList.toggle("displayNone");
  toDoSection.classList.toggle("displayNone");
});

// *** TIME
function timeItEvent(thisOne){
  thisOne.classList.add("displayNone");
  let li = thisOne.parentElement;
  let list = li.parentElement.id;
  let input = li.querySelector("input[type='time']");
  let todoIndex = listTasks.findIndex(todo => todo.id == li.id);
  let todo = listTasks[todoIndex];
  if(todo.dalle){
    input.value = todo.dalle;
  };
  input.classList.remove("displayNone");
  input.addEventListener("input", () => {
    todo.dalle = input.value;
    li.setAttribute("data-time", input.value);
    localStorage.listTasks = JSON.stringify(listTasks);
    updateCBC();
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
  });
};
window.timeItEvent = timeItEvent;

// *** SAVE THE DATE
// doesn't need to be a form since we generate a new one everytime
let moving = false;
let parent;
let taskToDate;
let taskToDateIndex;
let lineDay = ["todoDay", "doneDay", "recurringDay", "noDay", "recurry"];
let daysWeekChoices = [{
  name: "domenica",
  letter: "D"
}, {
  name: "lunedi",
  letter: "L"
}, {
  name: "martedi",
  letter: "M"
}, {
  name: "mercoledi",
  letter: "M"
}, {
  name: "giovedi",
  letter: "G"
}, {
  name: "venerdi",
  letter: "V"
}, {
  name: "sabato",
  letter: "S"
}];
const giorniNomi = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
// function calendarChoice(thisOne){
//   taskToDate = thisOne; // taskToDate est l'icon calendar
//   parent = taskToDate.parentElement;
//   parent.classList.add("selectedTask");
//   let taskToDateId = parent.id;
//   taskToDateIndex = listTasks.findIndex(todo => todo.id == taskToDateId);
//   let todo = listTasks[taskToDateIndex];
//   let date = todo.date ? todo.date : todo.line == "noDay" ? "" : getTodayDate();
//   calendarInput.value = date; //calendarInput est le dateInput qui doit contenir la date (si y'en a déjà une)
//   //calendarTimeInput.value = todo.time ? todo.time : "";
//   weekSection.classList.add("displayNone");
//   monthSection.classList.add("displayNone");
//   if(todo.line){
//     let line = todo.line == "recurry" ? "todoDay" : todo.line;
//     document.getElementById(line + "Input").checked = true;
//   } else{
//     Array.from( document.querySelectorAll('input[name="whatDay"]'), input => input.checked = false );
//   };
//   if(todo.line == "recurringDay"){
//     fillUpRecurring(todo);
//   };
//   taskToDate.insertAdjacentElement("afterend", calendarDiv); //calendarDiv est le div qui apparait
//   calendarDiv.classList.remove("displayNone");
//   clickScreen.classList.remove("displayNone");
//   parent.scrollIntoView();
//   document.querySelector("#clickScreen").addEventListener("click", () => clickHandlerAddOn(calendarDiv, clickScreen));
//   noDayInput.addEventListener("click", (evt) => {
//     if(evt.currentTarget.checked == true){
//       calendarInput.value = "";
//     };
//   });
//   recurringDayInput.addEventListener("click", (evt) => {
//     if(evt.currentTarget.checked == true){
//       fillUpRecurring(todo);
//     };
//   });
//   timeVariationInput.addEventListener("change", () => {
//     date = document.getElementById("dalInput").value;
//     if(timeVariationInput.value == "settimana"){
//       weekCalculate(date);
//       weekSection.classList.remove("displayNone");
//       monthSection.classList.add("displayNone");
//     } else if(timeVariationInput.value == "mese"){
//       meseCalculate(date);
//       weekSection.classList.add("displayNone");
//       monthSection.classList.remove("displayNone");
//     } else{
//       weekSection.classList.add("displayNone");
//       monthSection.classList.add("displayNone");
//     };
//   });
//   document.getElementById("fineDate").addEventListener("input", () => {
//     document.getElementById("fineGiorno").checked = true;
//   });
//   document.getElementById("fineCount").addEventListener("input", () => {
//     document.getElementById("fineDopo").checked = true;
//   });
//   document.querySelectorAll(".dalle").forEach(dalle => {
//     dalle.addEventListener("change", () => {
//       if(dalle.value){
//         dalle.parentElement.querySelector("span").textContent = "inizia alle:";
//       } else{
//         dalle.parentElement.querySelector("span").textContent = "c'è un inizio?";
//       };
//     });
//   });
//   document.querySelectorAll(".alle").forEach(alle => {
//     alle.addEventListener("change", () => {
//       if(alle.value){
//         alle.parentElement.querySelector("span").textContent = "finisce alle:";
//       } else{
//         alle.parentElement.querySelector("span").textContent = "c'è una fine?";
//       };
//     });
//   });

//   // oneDayTimeDalleInput.addEventListener("change", (e) => {
//   //   if(e.currentTarget.value){
//   //     e.currentTarget.parentElement.querySelector("span").textContent = "inizia alle:";
//   //   } else{
//   //     e.currentTarget.parentElement.querySelector("span").textContent = "c'è un inizio?";
//   //   };
//   // });
//   // oneDayTimeAlleInput.addEventListener("change", (e) => {
//   //   if(e.currentTarget.value){
//   //     e.currentTarget.parentElement.querySelector("span").textContent = "finisce alle:";
//   //   } else{
//   //     e.currentTarget.parentElement.querySelector("span").textContent = "c'è una fine?";
//   //   };
//   // });
// };



// window.calendarChoice = calendarChoice;
let clickScreen = document.querySelector("#clickScreen");
function smallCalendarChoice(thisOne){
  //thisOne = taskToDate est l'icon calendar
  moving = false;
  parent = thisOne.parentElement;
  parent.classList.add("selectedTask");
  parent.scrollIntoView();
  clickScreen.classList.remove("displayNone");
  taskToDateIndex = listTasks.findIndex(todo => todo.id == parent.id);
  let todo = listTasks[taskToDateIndex];
  let rec = todo.line == "recurringDay" ? true : false;
  let shw = todo.term == "showThing" ? true : false;
  let date = todo.date ? todo.date : todo.line == "noDay" ? "" : rec ? todo.dal : getTodayDate();
  let daysWeek = daysWeekChoices.map((day, idx) => {
    return `<input type="checkbox" name="daysWeekChoice" class="cossin" id="${day.name}" value="${idx}" ${(rec && todo.var == "settimana" && todo.daysWeek && todo.daysWeek.includes(day.name)) ? `checked` : meseDayICalc(date) == idx ? `checked` : ``} />
    <label for="${day.name}" class="dayCircle">${day.letter}</label>`;
  }).join("");
  let doneDayDiv = shw ? `` : `<input class="myRadio" type="radio" id="doneDayInput" name="whatDay" value="doneDay" ${todo.line == "doneDay" ? `checked` : ``} />
  <label for="doneDayInput" class="whatDayLabel calendarMargin"><p><span class="myRadio"></span><span class="normalText doneDay">Done Day</span><br /><span class="smallText">(the day by which it has to have been done)</span></label></p></label>
  <div class="DaySection" id="lastDaySection">
    <h5 class="taskInfoInput" style="margin-left: 0;">It's a hell of a deadline</h5>
    <input type="date" id="lastDayDateInput" style="margin: 20px 20px 10px" value="${date}" />
    <input id="lastTuttoGiornoInput" type="checkbox" class="tuttoGiornoInput cossin" ${todo.tutto ? `checked` : ``} />
    <div class="taskInfoInput tuttoGiornoDiv">
      <h5 style="margin: 0;">A qualunque ora??!</h5>
      <label for="lastTuttoGiornoInput" class="slideZone">
        <div class="slider">
          <span class="si">Sì</span>
          <span class="no">No</span>
        </div>
      </label>
    </div>
    <div class="noneTuttoGiornoDiv taskInfoInput">
      <p><span>a che ora precisamente?</span><input id="lastDayTimeAlleInput" type="time" class="finale" value="${todo.alle ? todo.alle : ``}" /></p>
    </div>
  </div>`;
  let noDayDiv = shw ? `` : `<input class="myRadio" type="radio" id="noDayInput" name="whatDay" value="noDay" ${todo.line == "noDay" ? `checked` : ``} />
  <label for="noDayInput" class="whatDayLabel calendarMargin"><p><span class="myRadio"></span><span class="normalText">No Day</span><br /><span class="smallText">(just go with the flow)</span></label></p></label>`;
  let smallCalendar = `<div id="calendarDiv">
    <h5 class="taskInfoInput">Tell me when...</h5>
    <div class="smallToggleList">
      <div style="margin: 5px 20px 10px">
        <input class="myRadio" type="radio" id="todoDayInput" name="whatDay" value="todoDay" ${todo.line == "todoDay" || todo.line == "recurry" ? `checked` : ``} />
        <label for="todoDayInput" class="whatDayLabel calendarMargin"><p><span class="myRadio"></span><span class="normalText todoDay">${shw ? `Happening Day` : `To-do Day`}</span><br /><span class="smallText">${shw ? `(the day this is all gonna go down)` : `(the day you want to do it)`}</span></p></label>
        <div class="DaySection" id="oneDaySection">
          <h5 class="taskInfoInput" style="margin-left: 0;">It's a one time thing</h5>
          <input type="date" id="oneDayDateInput" style="margin: 20px 20px 10px" value="${date}" />
          <input id="oneTuttoGiornoInput" type="checkbox" class="tuttoGiornoInput cossin" ${todo.tutto ? `checked` : ``} />
          <div class="taskInfoInput tuttoGiornoDiv">
            <h5 style="margin: 0;">Tutto il giorno?!</h5>
            <label for="oneTuttoGiornoInput" class="slideZone">
              <div class="slider">
                <span class="si">Sì</span>
                <span class="no">No</span>
              </div>
            </label>
          </div>
          <div class="noneTuttoGiornoDiv taskInfoInput">
            <p><span>c'è un inizio?</span><input id="oneDayTimeDalleInput" type="time" class="dalle" value="${todo.dalle ? todo.dalle : ``}" /></p>
            <p><span>c'è una fine?</span><input id="oneDayTimeAlleInput" type="time" class="alle" value="${todo.alle ? todo.alle : ``}" /></p>
          </div>
        </div>
        ${doneDayDiv}
        <input class="myRadio" type="radio" id="recurringDayInput" name="whatDay" value="recurringDay" ${rec ? `checked` : ``} />
        <label for="recurringDayInput" class="whatDayLabel calendarMargin"><p><span class="myRadio"></span><span class="normalText recurringDay">Recurring Day</span><br /><span class="smallText">(let it come back on its own)</span></label></p></label>
        <div class="DaySection" id="recurringDaySection">
          <h5 class="taskInfoInput" style="margin-left: 0;">It's a recurring thing</h5>
          <p class="calendarMargin">Dal<input id="dalInput" type="date" style="margin: 0 10px;" value="${date}" /></p>
          <input id="recuTuttoGiornoInput" type="checkbox" class="tuttoGiornoInput cossin" ${todo.tutto ? `checked` : ``} />
          <div class="taskInfoInput tuttoGiornoDiv">
            <h5 style="margin: 0;">Tutto il giorno?!</h5>
            <label for="recuTuttoGiornoInput" class="slideZone">
              <div class="slider">
                <span class="si">Sì</span>
                <span class="no">No</span>
              </div>
            </label>
          </div>
          <div class="noneTuttoGiornoDiv taskInfoInput">
            <p><span>c'è un inizio?</span><input id="recuTimeDalleInput" type="time" class="dalle" value="${todo.dalle ? todo.dalle : ``}" /></p>
            <p><span>c'è una fine?</span><input id="recuTimeAlleInput" type="time" class="alle" value="${todo.alle ? todo.alle : ``}" /></p>
          </div>
          <p class="calendarMargin">Si ripete ogni<input id="ogniInput" type="number" style="width: 50px; margin: 0 10px;" value="${todo.ogni ? todo.ogni : ``}" />
          <select id="timeVariationInput">
            <option value="giorno" ${rec && todo.var == "giorno" ? `selected` : ``}>giorno</option>
            <option value="settimana" ${rec && todo.var == "settimana" ? `selected` : ``}>settimana</option>
            <option value="mese" ${rec && todo.var == "mese" ? `selected` : ``}>mese</option>
            <option value="anno" ${rec && todo.var == "anno" ? `selected` : ``}>anno</option>
          </select></p>
          <div id="weekSection" class="calendarMargin ${rec && todo.var == "settimana" ? `` : `displayNone`}" style="width: -webkit-fill-available;">
            <p>Da ripetere il</p>
            <div class="dayCircleWeek">
              ${daysWeek}
            </div>
          </div>
          <div id="monthSection" class="calendarMargin ${rec && todo.var == "mese" ? `` : `displayNone`}">
            <p>Da ripetere</p>
            <input class="myRadio" type="radio" name="meseOptions" id="ogniXDate" ${rec && todo.var == "mese" && todo.meseOpt == "ogniXDate" ? `checked` : ``} />
            <label for="ogniXDate" style="display: block;"><span class="myRadio"></span><span id="ogniXDateText"></span></label>
            <input class="myRadio" type="radio" name="meseOptions" id="ogniXDay" ${rec && todo.var == "mese" && todo.meseOpt == "ogniXDay" ? `checked` : ``} />
            <label for="ogniXDay"><span class="myRadio"></span><span id="ogniXDayText"></span></label>
          </div>
          <div class="calendarMargin">
            <p>Termina</p>
            <input class="myRadio" type="radio" name="fineOptions" id="fineMai" ${!rec ? `checked` : todo.fineOpt == "fineMai" ? `checked` : ``} />
            <label for="fineMai" style="display: block;"><span class="myRadio"></span>Mai</label>
            <input class="myRadio" type="radio" name="fineOptions" id="fineGiorno" ${rec && todo.fineOpt == "fineGiorno" ? `checked` : ``} />
            <label for="fineGiorno" style="display: block;"><span class="myRadio"></span>Il giorno<input id="fineDate" type="date" style="margin: 0 10px;" value="${rec && todo.fineOpt == "fineGiorno" ? todo.fine : ``}" /></label>
            <input class="myRadio" type="radio" name="fineOptions" id="fineDopo" ${rec && todo.fineOpt == "fineDopo" ? `checked` : ``} />
            <label for="fineDopo" style="display: block;"><span class="myRadio"></span>Dopo<input id="fineCount" type="number" style="width: 50px; margin: 0 10px;" value="${rec && todo.fineOpt == "fineDopo" ? todo.fineCount : ``}" />occorrenza</label>
          </div>
        </div>
        ${noDayDiv}
      </div>
    </div>
    <button id="saveTheDateBtn" class="calendarMargin" type="submit">Save The Date</button>
  </div>`;
  thisOne.insertAdjacentHTML("afterend", smallCalendar);
  meseCalculate(date);
  let calendarDiv = document.querySelector("#calendarDiv");
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
  document.querySelector("#fineDate").addEventListener("input", () => {
    document.querySelector("#fineGiorno").checked = true;
  });
  document.querySelector("#fineCount").addEventListener("input", () => {
    document.querySelector("#fineDopo").checked = true;
  });
  document.querySelectorAll(".dalle").forEach(dalle => {
    dalle.addEventListener("change", () => {
      if(dalle.value){
        dalle.parentElement.querySelector("span").textContent = "inizia alle:";
      } else{
        dalle.parentElement.querySelector("span").textContent = "c'è un inizio?";
      };
    });
  });
  document.querySelectorAll(".alle").forEach(alle => {
    alle.addEventListener("change", () => {
      if(alle.value){
        alle.parentElement.querySelector("span").textContent = "finisce alle:";
      } else{
        alle.parentElement.querySelector("span").textContent = "c'è una fine?";
      };
    });
  });
  if(todo.line == "doneDay"){
    document.querySelector(".finale").addEventListener("change", (e) => {
      if(e.target.value){
        e.target.parentElement.querySelector("span").textContent = "ecco l'ora della verità:";
      } else{
        e.target.parentElement.querySelector("span").textContent = "a che ora precisamente?";
      };
    });
  };
  parent.scrollIntoView();
  clickScreen.addEventListener("click", () => clickHandlerAddOn(calendarDiv, clickScreen));
  

};

window.smallCalendarChoice = smallCalendarChoice;

window.calendarChoice = calendarChoice;

calendarDiv.addEventListener("submit", (e) => {
  e.preventDefault();
  let previousList = parent.parentElement.id;
  let todo = listTasks[taskToDateIndex];
  let previousLine = todo.line ? todo.line : "never";
  todo.date = calendarInput.value; //oneDayDateInput or lastDayDateInput
  parent.setAttribute("data-date", calendarInput.value);
  todo.time = calendarTimeInput.value; //dalle
  parent.setAttribute("data-time", calendarTimeInput.value);
  parent.querySelector(".timeSpan").innerText = calendarTimeInput.value;
  parent.querySelector("input[type='time']").value = calendarTimeInput.value;
  if(noDayInput.checked == true){
    todo.line = noDayInput.value;
    todo.date = todo.dal = todo.ogni = todo.var = todo.daysWeek = todo.meseOpt = todo.meseDate = todo.meseDayN = todo.meseDayI = todo.fineOpt = todo.fine = todo.fineCount = todo.listDates = todo.recurring = "";
    parent.setAttribute("data-date", "");
   
    // add = todo.time = ""
    // parent.setAttribute("data-time", "");
    // parent.querySelector(".timeSpan").innerText = "";
    // parent.querySelector("input[type='time']").value = "";
  };
  if(calendarInput.value || dalInput.value){
    if(previousLine == "recurry"){
      todo.line = "recurry";
      taskToDate.classList.add("recurry");
    } else{
      document.getElementsByName("whatDay").forEach(radio => {
        if(radio.checked == true){
          todo.line = radio.value;
          taskToDate.classList.remove(...lineDay);
          taskToDate.classList.add(radio.value);
        };
      });
    };
  } else{
    todo.line = "";
    // document.getElementsByName("whatDay").forEach(radio => {
    //   radio.checked = false;
    // });
    taskToDate.classList.remove(...lineDay);
    //list.appendChild(parent);
  };
  
  if(todo.line == "recurringDay"){
    todo.date = todo.dal = todo.ogni = todo.var = todo.daysWeek = todo.meseOpt = todo.meseDate = todo.meseDayN = todo.meseDayI = todo.fineOpt = todo.fine = todo.fineCount = todo.listDates = todo.recurring = "";
    parent.setAttribute("data-date", "");
    todo.dal = dalInput.value;
    todo.ogni = ogniInput.value;
    todo.var = timeVariationInput.value;
    let date = getDateFromString(todo.dal);
    document.getElementsByName("fineOptions").forEach(radio => {
      if(radio.checked == true){
        todo.fineOpt = radio.id;
      };
    });
    if(todo.fineOpt == "fineGiorno"){
      todo.fine = document.getElementById("fineDate").value;
    } else if(todo.fineOpt == "fineDopo"){
      todo.fineCount = document.getElementById("fineCount").value;
    };
    if(todo.var == "giorno"){
      ogniOgni(todo, date);
    } else if(todo.var == "settimana"){
      let daysWeek = [];
      document.getElementsByName("daysWeekChoice").forEach(choice => {
        if(document.getElementById(choice.id).checked == true){
          daysWeek.push(choice.value);
        };
      });
      todo.daysWeek = daysWeek;
      ogniSettimana(todo, date);
    } else if(todo.var == "mese"){
      document.getElementsByName("meseOptions").forEach(radio => {
        if(radio.checked == true){
          todo.meseOpt = radio.id;
        };
      });
      if(todo.meseOpt == "ogniXDate"){
        todo.meseDate = meseDateCalc(dalInput.value);
        ogniOgni(todo, date);
      } else if(todo.meseOpt == "ogniXDay"){
        todo.meseDayN = meseDayNCalc(dalInput.value);
        todo.meseDayI = meseDayICalc(dalInput.value);
        ogniMeseDay(todo, date);
      };
    } else if(todo.var == "anno"){
        ogniOgni(todo, date);
    };
    recurryCreation(todo);
  };
  let togoList = getTogoList(todo); //recurryCreation(todo) will happen there
  if(previousList !== togoList) {
    if(previousLine == "recurringDay"){
      parent.querySelector(".trashCan").outerHTML = '<i class="typcn typcn-media-stop-outline emptyCheck" onclick="checkEvent(this)"></i>';
      parent.setAttribute("data-date", todo.date);
    } else if(previousLine !== "recurringDay" && todo.line == "recurringDay"){
      parent.querySelector(".emptyCheck").outerHTML = '<i class="typcn typcn-trash trashCan" onclick="trashRecurringEvent(this)"></i>';
      parent.setAttribute("data-date", "");
    };
    if(newShit && (todo.date || todo.line)){
      //newShit = false;
      document.querySelector("#sectionLimbo").classList.add("displayNone");
    };
    if(togoList == ""){
      parent.remove();
    } else{
      document.getElementById(togoList).appendChild(parent);
      moving = true;
    };
    
  };

  localStorage.listTasks = JSON.stringify(listTasks);
  sortItAll();
  updateCBC();
  clickHandlerAddOn(calendarDiv, clickScreen);
  calendarDiv.reset();
});

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
//todo.line => "todoDay", "doneDay", "recurringDay", "noDay", "recurry"
//todo.tutto => true/false si ça dure toute la journée ou si on considère 'dalle' et 'alle'
//todo.dalle => time à laquelle ça commence aussi anciennement todo.time (pour les event)
//todo.alle => time à laquelle ça fini
//todo.stored => true/false
//todo.stockId
//todo.stock => true/false
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
//todo.recurring => aucune idée à quoi ça sert...


// *** RECURRING
// todo.dal = todo.ogni = todo.var = todo.daysWeek = todo.meseOpt = todo.meseDate = todo.meseDayN = todo.meseDayI = todo.fineOpt = todo.fine = todo.fineCount = todo.listDates = todo.recurring = "";

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
  todo.listDates = listDates;
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
  todo.listDates = listDates;
};

function ogniMeseDay(todo, date){ //For ogni X month on Y° day until fine o dopo Y occorrenza o 50 se mai
  console.log("ogniMeseDay " + todo);
  console.log("todo.meseDayN " + todo.meseDayN);//c'est le combientième du mois
  console.log("todo.meseDayI " + todo.meseDayI);//l'index dans le array des jours de la semaine 
  //todo.meseDayN
  //todo.meseDayI
  //à chaque jour, on a le nombre de week; si le jour est 1, le nw retombe à 0; on check l'index (0 à 6) et quand on arrive à meseDayI, on ajoute nw++; quand nw++ égale meseDayN, on ajoute la date à la list
};

function fillUpRecurring(todo){
  let date = todo.dal ? todo.dal : calendarInput.value ? calendarInput.value : getTodayDate(); //date
  document.getElementById("dalInput").value = date;
  document.getElementById("ogniInput").value = todo.ogni ? todo.ogni : ""; //number
  document.getElementById("timeVariationInput").value = todo.var ? todo.var : ""; //giorno, settimana, mese or anno
  if(todo.var == "settimana"){
    weekCalculate(date);
    weekSection.classList.remove("displayNone");
    monthSection.classList.add("displayNone");
  } else if(todo.var == "mese"){
    meseCalculate(date);
    weekSection.classList.add("displayNone");
    monthSection.classList.remove("displayNone");
  };
  document.getElementsByName("daysWeekChoice").forEach(choice => {
    document.getElementById(choice.id).checked = (todo.var == "settimana" && todo.daysWeek && todo.daysWeek.includes(choice.value)) ? true : false;
  });
  document.getElementsByName("meseOptions").forEach(radio => {
    radio.checked = (todo.var == "mese" && todo.meseOpt == radio.id) ? true : false;
  });
  document.getElementById("fineDate").value = document.getElementById("fineCount").value = "";
  if(todo.fineOpt){
    document.getElementById(todo.fineOpt).checked = true;
    if(todo.fineOpt == "fineGiorno"){
      document.getElementById("fineDate").value = todo.fine;
    } else if(todo.fineOpt == "fineDopo"){
      document.getElementById("fineCount").value = todo.fineCount; //Google Calendar n'update pas le nombre d'occurence au fur du temps; garde le nombre qu'on a mis au début
    };
  } else{
    document.getElementById("fineMai").checked = true;
  };
};
function weekCalculate(date){
  let dayI = meseDayICalc(date);
  let n = 0;
  document.getElementsByName("daysWeekChoice").forEach(choice => {
    if(dayI == n){
      choice.checked = true;
      n++;
    } else{
      n++;
    };
  });
};

function meseCalculate(date){
  let dalG = meseDateCalc(date);
  let dayIdx = meseDayICalc(date);
  let dayC = meseDayNCalc(date);
  document.querySelector("#ogniXDateText").innerText = `ogni mese, il giorno ${dalG}`;
  document.querySelector("#ogniXDayText").innerText = `ogni mese, il ${dayC}° ${giorniNomi[dayIdx]}`;
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
let myShowTypes = [{
  name: "Myself",
  colorBG: "#06a9a9",
  colorTX: "darkslategrey"
}, {
  name: "Orderly",
  colorBG: "goldenrod",
  colorTX: "darkslategrey"
}, {
  name: "Session",
  colorBG: "darkmagenta",
  colorTX: "white"
}, {
  name: "Calia",
  colorBG: "seagreen",
  colorTX: "white"
}];
//let taskToInfo; //don't need!
let taskToInfoIndex; //don't need!
//let newcolor; //could be inside
//let newicon; //could be inside




function taskAddAllInfo(thisOne){
  moving = false;
  let div = thisOne.parentElement;
  parent = div.parentElement;
  parent.classList.add("selectedTask");
  parent.scrollIntoView();
  clickScreen.classList.remove("displayNone");
  let width = getComputedStyle(div).width;
  let num = width.slice(0, -2);
  let newWidth = Number(num) + 37;
  taskToInfoIndex = listTasks.findIndex(todo => todo.id == parent.id);
  let todo = listTasks[taskToInfoIndex];
  let myShows = myShowTypes.map(myShowType => {
    return `<div class="showTypeLabelDiv" id="div${myShowType.name}">
      <input class="showInput" type="radio" name="showOptions" id="${myShowType.name}Show" value="${myShowType.name}" ${(todo.term == "showThing" && todo.showType == myShowType.name) ? `checked` : ""} />
      <label for="${myShowType.name}Show" class="showLi showTypeLabel" style="background-color:${myShowType.colorBG};color:${myShowType.colorTX};">${myShowType.name}<i class="typcn typcn-tick showTick"></i></label>
      <i class="typcn typcn-trash" onclick="trashShowTypeEvent(this)"></i>
    </div>`;
  }).join("");
  let taskAllInfo = `<div id="taskInfo" style="width:${newWidth}px;">
    <div class="taskInfoWrapper">
      <div id="SupClickScreen" class="Screen displayNone"></div>
      <input id="storeIt" type="checkbox" class="cossin" ${todo.stored || todo.stock ? `checked` : ``} />
      <label for="storeIt" class="storeItLabel">
        <span class="typcn typcn-pin-outline pinUnChecked"></span>
        <span class="typcn typcn-pin pinChecked"></span>
      </label>
      <h5 class="taskInfoInput">Tell me more...</h5>
      <div class="taskInfoInput relDiv">
        <span id="iconIt" class="IconI ${todo.icon}"></span>
        <input type="text" id="taskTitle" class="taskInfoInput" style="color:${todo.color};" value="${todo.task}">
        <span id="colorIt" class="typcn typcn-tag tagSpan" style="color:${todo.color};"></span>
      </div>
      <textarea id="taskDetails" class="taskInfoInput">${todo.info ? todo.info : ""}</textarea>
      <h5 class="taskInfoInput">Tell me what...</h5>
      <div class="taskInfoInput relDiv">
        <i id="dateIt" class="typcn typcn-calendar-outline dateSpan"></i>
        <h5 style="margin: 0;">Task</h5>
        <input class="myRadio" type="radio" name="termOptions" id="oneTime" value="oneTime" ${todo.term == "oneTime" ? `checked` : ``} />
        <label for="oneTime" class="termLabel"><span class="myRadio"></span><span>It's a one time thing</span></label>
        <input class="myRadio" type="radio" name="termOptions" id="longTerm" value="longTerm" ${todo.term == "longTerm" ? `checked` : ``} />
        <label for="longTerm" class="termLabel"><span class="myRadio"></span><span>It's a long term shit</span></label>
        <h5 style="margin: 0;">Event</h5>
        <input class="myRadio" type="radio" name="termOptions" id="showThing" value="showThing" ${todo.term == "showThing" ? `checked` : ``} />
        <label for="showThing" class="termLabel"><span class="myRadio"></span><span>It's a whole show!</span></label>
        <div id="myShowDiv" class="showDiv">
          ${myShows}
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
      <h5 class="taskInfoInput">Tell me when...</h5>
      <button id="taskInfoBtn">Save</button>
    </div>
  </div>`;
  div.insertAdjacentHTML("beforeend", taskAllInfo);
  let taskInfo = document.querySelector("#taskInfo");
  let taskTitle = document.querySelector("#taskTitle");
  let SupClickScreen = document.querySelector("#SupClickScreen");
  let colorIt = document.querySelector("#colorIt");
  let colorPalet = document.querySelector("#colorPalet");
  let iconIt = document.querySelector("#iconIt");
  let iconsPalet = document.querySelector("#iconsPalet");

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
        clickHandlerAddOn(colorPalet, SupClickScreen);
        list.insertAdjacentElement("afterend", colorPalet);
      });
    });
    SupClickScreen.addEventListener("click", () => clickHandlerAddOn(colorPalet, SupClickScreen));
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
        clickHandlerAddOn(iconsPalet, SupClickScreen);
        list.insertAdjacentElement("afterend", iconsPalet);
      });
    });
    SupClickScreen.addEventListener("click", () => clickHandlerAddOn(iconsPalet, SupClickScreen));
  });
  
  //SHOW TYPE
  let showTypeIcons = false;
  let newSTColor = false;
  let newSTColorBG;
  let newSTColorTX;
  let showTypeCreationInput = document.querySelector("#showTypeCreationInput");
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
        });
      });
      showTypeIcons = true;
    };
  });
  document.querySelector("#showTypeCreationConfirm").addEventListener("click", (e) => {
    if(newSTColor && showTypeCreationInput.value){
      let showType = {
        name: showTypeCreationInput.value,
        colorBG: newSTColorBG,
        colorTX: newSTColorTX
      };
      addShowTypeDiv.insertAdjacentHTML("beforebegin", `<div class="showTypeLabelDiv" id="div${showType.name}">
        <input class="showInput" type="radio" name="showOptions" id="${showType.name}Show" value="${showType.name}" />
        <label for="${showType.name}Show" class="showLi showTypeLabel" style="background-color:${showType.colorBG};color:${showType.colorTX};">${showType.name}<i class="typcn typcn-tick showTick"></i></label>
        <i class="typcn typcn-trash" onclick="trashShowTypeEvent(this)"></i>
      </div>`);
      myShowTypes.push(showType);
      //localStorage.myShowTypes = JSON.stringify(myShowTypes);
      document.querySelectorAll(".underh5").forEach(h => {
        h.remove();
      });
      showTypeCreationInput.value = "";
      showTypeCreationInput.style.backgroundColor = "white";
      showTypeCreationInput.style.color = "darkslategrey";
      newSTColor = false;
    } else if(newSTColor && !showTypeCreationInput.value){
      e.preventDefault();
      addShowTypeDiv.insertAdjacentHTML("afterend", `<h5 class="underh5">Ci serve anche un nome!</h5>`);
    } else if(!newSTColor && showTypeCreationInput.value){
      e.preventDefault();
      addShowTypeDiv.insertAdjacentHTML("afterend", `<h5 class="underh5">Ci serve anche un color!</h5>`);
    };
  });
  clickScreen.addEventListener("click", () => clickHandlerAddOn(taskInfo, clickScreen));

  //SAVE BUTTON
  document.querySelector("#taskInfoBtn").addEventListener("click", () => {
    let previousList = parent.parentElement.id;
    todo.task = taskTitle.value.startsWith("*") ? taskTitle.value.substring(1) : taskTitle.value;
    todo.info = taskDetails.value;
    todo.color = newcolor;
    todo.icon = newicon;
    let checked = document.querySelector('input[name="termOptions"]:checked');
    todo.term = checked ? checked.value : "";
    if(todo.term == "showThing"){
      todo.showType = document.querySelector('input[name="showOptions"]:checked').value;//might not be usefull...

      let nameST = document.querySelector('input[name="showOptions"]:checked').value;
      let indexST = myShowTypes.findIndex(show => show.name == nameST);
      todo.STColorBG = myShowTypes[indexST].colorBG;
      todo.STColorTX = myShowTypes[indexST].colorTX;
    };
    
    if(!todo.stock && !todo.stored && storeIt.checked){
      stockCreaction(todo); //todo.stored = true; (has a model in storage) (included in stockCreation)
    };
    if(todo.stock && !storeIt.checked){
      trashStock(todo.id);
    };
    if(todo.stored && !storeIt.checked){
      trashStock(todo.stockId);
    };

    if(todo.newShit){
      delete todo.newShit;
      if(document.querySelectorAll("#listLimbo > li").length <= 1){
        document.querySelector("#sectionLimbo").classList.add("displayNone");
      };
    };
    let togoList = getTogoList(todo);
    if(previousList !== togoList){
      moving = true;
    };
    parent.remove();
    todoCreation(todo);

    localStorage.listTasks = JSON.stringify(listTasks);
    sortItAll();
    updateCBC();
    clickHandlerAddOn(taskInfo, clickScreen);
    //Before you save, make sure there's a todo.term and a todo.line!
    //You have to force them to tell you WHEN too before Saving! That way, if it's oneTime or longTerm, it can have a date or noDay, and if it's an event, we have a date, hence a togoList. ... or maybe not... what if you really want it grey, no icon, and no day...
  });
};
window.taskAddAllInfo = taskAddAllInfo;

function trashShowTypeEvent(thisOne){
  let div = thisOne.parentElement;
  let name = div.id.slice(3);
  let index = myShowTypes.findIndex(show => show.name == name);
  myShowTypes.splice(index, 1);
  div.remove();
  console.log(myShowTypes);
};
window.trashShowTypeEvent = trashShowTypeEvent;

// function taskAddInfo(thisOne){
//   taskToInfo = thisOne.parentElement; //taskToInfo est le span.text qui a été cliqué
//   let width = getComputedStyle(taskToInfo).width;
//   let num = width.slice(0, -2);
//   let newWidth = Number(num) + 37;
//   taskInfo.style.width = newWidth + "px";
//   taskToInfo.insertAdjacentElement("beforeend", taskInfo); //taskInfo est le div qui apparait
//   taskInfo.classList.remove("displayNone");
//   clickScreen.classList.remove("displayNone");
//   //let taskTitleInfo = taskToInfo.textContent; //taskTitleInfo est le text contenu dans taskToInfo (span.text)
//   //taskTitle.value = taskTitleInfo; //taskTitle est le input qui doit contenir le titre, dans le div
//   parent = taskToInfo.parentElement;
//   parent.classList.add("selectedTask");
//   let taskToInfoId = parent.id;
//   taskToInfoIndex = listTasks.findIndex(todo => todo.id == taskToInfoId);
//   let todo = listTasks[taskToInfoIndex];
//   storeIt.checked = todo.stored || todo.stock ? true : false;
//   taskTitle.value = todo.task;
//   taskTitle.style.color = todo.color;
//   colorIt.style.color = newcolor = todo.color;
//   newicon = todo.icon;
//   iconIt.className = `IconI ${todo.icon}`;
//   let myShows = myShowTypes.map(myShowType => {
//     return `<input class="showInput" type="radio" name="showOptions" id="${myShowType.name}Show" value="${myShowType.name}" />
//     <label for="${myShowType.name}Show" class="showLi showTypeLabel" style="background-color:${myShowType.colorBG};color:${myShowType.colorTX};">${myShowType.name}<i class="typcn typcn-tick showTick"></i></label>`;
//   }).join("");
//   myShows += `<div id="addShowTypeDiv">
//   <input type="radio" name="showCreation" id="addShowType" class="cossin">
//   <input type="radio" name="showCreation" id="saveShowType" class="cossin">
//   <label for="addShowType" class="showTypeAdding"><i class="typcn typcn-plus"></i></label>
//   <div class="showTypeCreation">
//     <div class="showTypeCreationInside">
//       <input id="showTypeCreationInput" type="text" placeholder="new type of show" />
//       <i id="showTypeChoiceIcon" class="typcn typcn-media-record"></i>
//     </div>
//     <label for="saveShowType" style="display: inline-block;"><i id="showTypeCreationConfirm" class="typcn typcn-tick" style="font-size: 2em;line-height: .5em;"></i></label>
//   </div>
// </div>`;
//   document.querySelector("#myShowDiv").innerHTML = myShows;
  
//   let showTypeIcons = false;
//   let newColor = false;
//   let newColorBG;
//   let newColorTX;
//   document.querySelector("#showTypeChoiceIcon").addEventListener("click", () => {
//     if(showTypeIcons){
//       document.querySelector(".showTypeIconsDiv").remove();
//       showTypeIcons = false;
//     } else{
//       let STicons = showTypeChoices.map((icon, idx) => {
//         return `<div class="showTypeIconsB" data-index="${idx}"><div class="showTypeIconsC" style="background-color:${icon.colorBG};"><i class="typcn typcn-tick-outline" style="color:${icon.colorTX};"></i></div></div>`;
//       }).join("");
//       document.querySelector(".showTypeCreationInside").insertAdjacentHTML("beforeend", `<div class="showTypeIconsDiv">${STicons}</div>`);
//       document.querySelectorAll(".showTypeIconsB").forEach(btn => {
//         btn.addEventListener("click", (e) => {
//           newColorBG = showTypeChoices[e.currentTarget.dataset.index].colorBG ;
//           newColorTX = showTypeChoices[e.currentTarget.dataset.index].colorTX;
//           showTypeCreationInput.style.backgroundColor = newColorBG;
//           showTypeCreationInput.style.color = newColorTX;
//           newColor = true;
//           document.querySelector(".showTypeIconsDiv").remove();
//           showTypeIcons = false;
//         });
//       });
//       showTypeIcons = true;
//     };
//   });
//   showTypeCreationConfirm.addEventListener("click", (e) => {
//     //
//     if(newColor && showTypeCreationInput.value){
//       let showType = {
//         name: showTypeCreationInput.value,
//         colorBG: newColorBG,
//         colorTX: newColorTX
//       };
//       myShowTypes.push(showType);
//       console.log(myShowTypes);
//       document.querySelectorAll(".underh5").forEach(h => {
//         h.remove();
//       });
//     } else if(newColor && !showTypeCreationInput.value){
//       e.preventDefault();
//       //showTypeCreationConfirm.checked = false;
//       addShowTypeDiv.insertAdjacentHTML("afterend", `<h5 class="underh5">Ci serve anche un nome!</h5>`);
//     } else if(!newColor && showTypeCreationInput.value){
//       e.preventDefault();
//       //showTypeCreationConfirm.checked = false;
//       addShowTypeDiv.insertAdjacentHTML("afterend", `<h5 class="underh5">Ci serve anche un color!</h5>`);
//     };
//   });
//   if(todo.term){
//     document.getElementById(todo.term).checked = true; 
//     if(todo.term == "showThing"){
//       document.getElementById(todo.showType).checked = true;
//     } else{
//       Array.from( document.querySelectorAll('input[name="showOptions"]'), input => input.checked = false );
//     };
//   } else{
//     Array.from( document.querySelectorAll('input[name="termOptions"]'), input => input.checked = false );
//     Array.from( document.querySelectorAll('input[name="showOptions"]'), input => input.checked = false );
//   };
//   taskDetails.value = todo.info ? todo.info : ""; //taskDetails est le testarea qui doit contenir les détails (si y'en a déjà), dans le div
  
//   // *** COLOR
// //const colorList = ["orange", "red", "darkmagenta", "dodgerblue", "forestgreen", "darkslategrey"];
//   document.getElementById("colorIt").addEventListener("click", () => {
//     //colorIt.insertAdjacentElement("afterend", colorPalet);
//     taskInfo.insertAdjacentElement("beforeend", colorPalet);
//     colorPalet.classList.remove("displayNone");
//     SupClickScreen.classList.remove("displayNone");
//     document.querySelectorAll("input[name='colorRadio']").forEach(radio => {
//       if(todo.color == radio.value){
//         radio.checked = true;
//       } else{
//         radio.checked = false;
//       };
//       radio.addEventListener("click", () => {
//         newcolor = radio.value;
//         taskTitle.style.color = newcolor;
//         colorIt.style.color = newcolor;
//         colorPalet.classList.add("displayNone");
//         clickHandlerAddOn(colorPalet, SupClickScreen);
//         list.insertAdjacentElement("afterend", colorPalet);
//       });
//     });
//     document.querySelector("#SupClickScreen").addEventListener("click", () => clickHandlerAddOn(colorPalet, SupClickScreen));
//   });
//   //ICON
//   document.getElementById("iconIt").addEventListener("click", () => {
//     //iconIt.insertAdjacentElement("afterend", iconsPalet);
//     taskInfo.insertAdjacentElement("beforeend", iconsPalet);
//     //iconsPalet.classList.remove("displayNone");
//     iconsPalet.classList.replace("displayNone", "inTaskDiv");
//     SupClickScreen.classList.remove("displayNone");
//     document.querySelectorAll("input[name='iconRadio']").forEach(radio => {
//       if(todo.icon == radio.value){
//         radio.checked = true;
//       } else{
//         radio.checked = false;
//       };
//       radio.addEventListener("click", () => {
//         newicon = radio.value;
//         iconIt.className = `IconI ${newicon}`;
//         // iconsPalet.classList.add("displayNone");
//         iconsPalet.classList.replace("inTaskDiv", "displayNone");
//         clickHandlerAddOn(iconsPalet, SupClickScreen);
//         list.insertAdjacentElement("afterend", iconsPalet);
//       });
//     });
//     document.querySelector("#SupClickScreen").addEventListener("click", () => clickHandlerAddOn(iconsPalet, SupClickScreen));
//   });
//   parent.scrollIntoView();
//   document.querySelector("#clickScreen").addEventListener("click", () => clickHandlerAddOn(taskInfo, clickScreen));
// };
// window.taskAddInfo = taskAddInfo;
window.listTasks = listTasks;









function scrollToSection(){
  let section = parent.closest("section");
  if(section.querySelector(".listToggleInput")){
    section.querySelector(".listToggleInput").checked = true;
  };
  section.scrollIntoView();
};

function clickHandlerAddOn(addOn, screen){
  parent.classList.remove("selectedTask");
  if(moving && screen == clickScreen){
    scrollToSection();
    moving = false;
  };
  addOn.classList.add("displayNone");
  list.insertAdjacentElement("afterend", addOn);
  screen.classList.add("displayNone");
  screen.removeEventListener("click", () => clickHandlerAddOn(addOn, screen));
};

// *** ICON
let iconTag;
function iconChoice(thisOne){
  iconTag = thisOne;
  parent = iconTag.parentElement;
  parent.classList.add("selectedTask");
  let li = iconTag.parentElement;
  let taskId = li.id;
  let taskIndex = listTasks.findIndex(todo => todo.id == taskId);
  iconTag.insertAdjacentElement("afterend", iconsPalet);
  iconsPalet.classList.remove("displayNone");
  clickScreen.classList.remove("displayNone");
  document.querySelectorAll("input[name='iconRadio']").forEach(radio => {
    if(listTasks[taskIndex].icon == radio.value){
      radio.checked = true;
    } else{
      radio.checked = false;
    };
    radio.addEventListener("click", () => {
      let icon = radio.value;
      let liIcon = li.querySelector(".IconI");
      liIcon.className = `IconI ${icon}`;
      listTasks[taskIndex].icon = icon;
      localStorage.listTasks = JSON.stringify(listTasks);
      updateCBC();
      clickHandlerAddOn(iconsPalet, clickScreen);
    });
  });
  clickScreen.addEventListener("click", () => clickHandlerAddOn(iconsPalet, clickScreen));
};
window.iconChoice = iconChoice;

// *** DATE
function getTodayDate(){
  let date = new Date();
  let currentHour = String(date.getHours()).padStart(2, "0");
  let currentMinute = String(date.getMinutes()).padStart(2, "0");
  let currentTime = `${currentHour}:${currentMinute}`;
  let currentDay = String(date.getDate()).padStart(2, "0");
  currentDay = currentTime <= myTomorrow ? String(currentDay - 1).padStart(2, "0") : currentDay;
  let currentMonth = String(date.getMonth()+1).padStart(2, "0");
  let currentYear = date.getFullYear();
  let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
  return currentDate;
};

function getTomorrowDate(){
  let date = new Date();
  let currentHour = String(date.getHours()).padStart(2, "0");
  let currentMinute = String(date.getMinutes()).padStart(2, "0");
  let currentTime = `${currentHour}:${currentMinute}`;
  let currentDay = String(date.getDate() + 1).padStart(2, "0");
  currentDay = currentTime <= myTomorrow ? String(currentDay - 1).padStart(2, "0") : currentDay;
  let currentMonth = String(date.getMonth()+1).padStart(2, "0");
  let currentYear = date.getFullYear();
  let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
  return currentDate;
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
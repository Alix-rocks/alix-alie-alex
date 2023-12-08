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

(() => {
  let todayDate = getTodayDate();
  let tomorrowDate = getTomorrowDate();
  document.getElementById("todaysDateSpan").innerHTML = `(${todayDate})`;
  document.getElementById("tomorrowsDateSpan").innerHTML = `(${tomorrowDate})`;
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
    myTomorrow = getTasks.data().myTomorrow; //not sure if that'll work since it's a string in firestore and backticks here...
  };
  
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
    document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}"><i class="typcn typcn-trash trashCan" onclick="trashStockEvent(this)"></i><i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i><div class="textDiv"><span class="text" onclick="taskAddInfo(this)" style="color:${todo.color};">${todo.info ? '*' : ''}${todo.task}</span></div><span class="timeSpan">${todo.time ? todo.time : ''}</span><i class="fa-solid fa-recycle" onclick="reuseItEvent(this)"></i></li>`);
  } else if(todo.line == "recurringDay"){
    document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}"><i class="typcn typcn-trash trashCan" onclick="trashRecurringEvent(this)"></i><i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i><div class="textDiv"><span class="text" onclick="taskAddInfo(this)" style="color:${todo.color};">${todo.info ? '*' : ''}${todo.task}</span></div><span class="timeSpan">${todo.time ? todo.time : ''}</span><i class="typcn typcn-calendar-outline calendarSpan ${todo.line}" onclick="calendarChoice(this)"></i></li>`);
  } else if(todo.term == "showThing" && togoList){
    document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-date="${todo.date}" data-time="${todo.time ? todo.time : ""}" data-order="${todo.order ? todo.order : ""}" class="showLi ${todo.showType}">
      <i class="typcn typcn-media-stop-outline emptyCheck" onclick="checkEvent(this)"></i>
      <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i>
      <div class="textDiv"><span class="text" onclick="taskAddInfo(this)">${todo.info ? '*' : ''}${todo.task}</span></div>
      <span class="timeSpan" onclick="timeItEvent(this)">${todo.time ? todo.time : `<i class="fa-regular fa-clock"></i>`}</span>
      <input type="time" class="displayNone"/>
      <i class="typcn typcn-calendar-outline calendarSpan ${todo.line}" onclick="calendarChoice(this)"></i>
    </li>`);
  } else{
    document.getElementById(togoList).insertAdjacentHTML("beforeend", `<li id="${todo.id}" data-date="${todo.date}" data-time="${todo.time ? todo.time : ""}" data-order="${todo.order ? todo.order : ""}">
      <i class="typcn typcn-media-stop-outline emptyCheck" onclick="checkEvent(this)"></i>
      <i onclick="iconChoice(this)" class="IconI ${todo.icon ? todo.icon : 'fa-solid fa-ban noIcon'}"></i>
      <div class="textDiv"><span class="text" onclick="taskAddInfo(this)" style="color:${todo.color};">${todo.info ? '*' : ''}${todo.task}</span></div>
      <span class="timeSpan" onclick="timeItEvent(this)">${todo.time ? todo.time : ""}</span>
      <input type="time" class="displayNone"/>
      <i class="typcn typcn-calendar-outline calendarSpan ${todo.line}" onclick="calendarChoice(this)"></i>
    </li>`);
  };
};

function getTogoList(todo){
  let todayDate = getTodayDate();
  let tomorrowDate = getTomorrowDate();
  let togoList;
  if(newShit){
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
  if(doned.term == "showThing"){
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
let newShit = false;
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let newTask = addInput.value;
  let color = "darkslategrey";
  if(!newTask == ""){
    let todo = {
      id: crypto.randomUUID(),
      task: newTask,
      color: color,
      icon: "fa-solid fa-ban noIcon"
    };
    listTasks.push(todo);
    localStorage.listTasks = JSON.stringify(listTasks);
    updateCBC();
    newShit = true;
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
  console.log(donedTaskSplice[0]);
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
    showType: donedShowType
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
  console.log(listName);
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
  if(todo.time){
    input.value = todo.time;
  };
  input.classList.remove("displayNone");
  input.addEventListener("input", () => {
    todo.time = input.value;
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
// >>>>>>> MAKE IT A FORM! (so that you can do form.reset())
let moving = false;
let parent;
let taskToDate;
let taskToDateIndex;
let lineDay = ["todoDay", "doneDay", "recurringDay", "noDay", "recurry"];
function calendarChoice(thisOne){
  taskToDate = thisOne; // taskToDate est l'icon calendar
  parent = taskToDate.parentElement;
  parent.classList.add("selectedTask");
  let taskToDateId = parent.id;
  taskToDateIndex = listTasks.findIndex(todo => todo.id == taskToDateId);
  let todo = listTasks[taskToDateIndex];
  let date = todo.date ? todo.date : todo.line == "noDay" ? "" : getTodayDate();
  calendarInput.value = date; //calendarInput est le dateInput qui doit contenir la date (si y'en a déjà une)
  calendarTimeInput.value = todo.time ? todo.time : "";
  weekSection.classList.add("displayNone");
  monthSection.classList.add("displayNone");
  if(todo.line){
    let line = todo.line == "recurry" ? "todoDay" : todo.line;
    document.getElementById(line + "Input").checked = true;
  } else{
    Array.from( document.querySelectorAll('input[name="whatDay"]'), input => input.checked = false );
  };
  if(todo.line == "recurringDay"){
    fillUpRecurring(todo);
  };
  taskToDate.insertAdjacentElement("afterend", calendarDiv); //calendarDiv est le div qui apparait
  calendarDiv.classList.remove("displayNone");
  clickScreen.classList.remove("displayNone");
  parent.scrollIntoView();
  document.querySelector("#clickScreen").addEventListener("click", () => clickHandlerAddOn(calendarDiv, clickScreen));
  noDayInput.addEventListener("click", (evt) => {
    if(evt.currentTarget.checked == true){
      calendarInput.value = "";
    };
  });
  recurringDayInput.addEventListener("click", (evt) => {
    if(evt.currentTarget.checked == true){
      fillUpRecurring(todo);
    };
  });
  timeVariationInput.addEventListener("change", () => {
    date = document.getElementById("dalInput").value;
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
  document.getElementById("fineDate").addEventListener("input", () => {
    document.getElementById("fineGiorno").checked = true;
  });
  document.getElementById("fineCount").addEventListener("input", () => {
    document.getElementById("fineDopo").checked = true;
  });
};
window.calendarChoice = calendarChoice;

calendarDiv.addEventListener("submit", (e) => {
  e.preventDefault();
  let previousList = parent.parentElement.id;
  let todo = listTasks[taskToDateIndex];
  let previousLine = todo.line ? todo.line : "never";
  todo.date = calendarInput.value;
  parent.setAttribute("data-date", calendarInput.value);
  todo.time = calendarTimeInput.value;
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
      newShit = false;
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


//todo.id
//todo.task
//todo.info
//todo.color
//todo.icon
//todo.term => "oneTime", "longTerm"
//todo.date
//todo.line => "todoDay", "doneDay", "recurringDay", "noDay", "recurry"
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
    if(date.getDay() == 6){
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
  console.log(listDates);
  todo.listDates = listDates;
};

function ogniMeseDay(todo, date){ //For ogni X month on Y° day until fine o dopo Y occorrenza o 50 se mai
  console.log("ogniMeseDay " + todo);
  console.log("todo.meseDayN " + todo.meseDayN);//c'est le combientième du mois
  console.log("todo.meseDayI " + todo.meseDayI);//l'index dans le array des jours de la semaine 
  //todo.meseDayN
  //todo.meseDayI
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
const giorniNomi = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
function meseCalculate(date){
  let dalG = meseDateCalc(date);
  let dayIdx = meseDayICalc(date);
  let dayC = meseDayNCalc(date);
  ogniXDateText.innerText = `ogni mese, il giorno ${dalG}`;
  ogniXDayText.innerText = `ogni mese, il ${dayC}° ${giorniNomi[dayIdx]}`;
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
let taskToInfo;
let taskToInfoIndex;
let newcolor;
let newicon;
function taskAddInfo(thisOne){
  taskToInfo = thisOne.parentElement; //taskToInfo est le span.text qui a été cliqué
  let width = getComputedStyle(taskToInfo).width;
  let num = width.slice(0, -2);
  let newWidth = Number(num) + 37;
  taskInfo.style.width = newWidth + "px";
  taskToInfo.insertAdjacentElement("beforeend", taskInfo); //taskInfo est le div qui apparait
  taskInfo.classList.remove("displayNone");
  clickScreen.classList.remove("displayNone");
  //let taskTitleInfo = taskToInfo.textContent; //taskTitleInfo est le text contenu dans taskToInfo (span.text)
  //taskTitle.value = taskTitleInfo; //taskTitle est le input qui doit contenir le titre, dans le div
  parent = taskToInfo.parentElement;
  parent.classList.add("selectedTask");
  let taskToInfoId = parent.id;
  taskToInfoIndex = listTasks.findIndex(todo => todo.id == taskToInfoId);
  let todo = listTasks[taskToInfoIndex];
  storeIt.checked = todo.stored || todo.stock ? true : false;
  taskTitle.value = todo.task;
  taskTitle.style.color = todo.color;
  colorIt.style.color = newcolor = todo.color;
  newicon = todo.icon;
  iconIt.className = `IconI ${todo.icon}`;
  if(todo.term){
    document.getElementById(todo.term).checked = true; 
    if(todo.term == "showThing"){
      document.getElementById(todo.showType).checked = true;
    } else{
      Array.from( document.querySelectorAll('input[name="showOptions"]'), input => input.checked = false );
    };
  } else{
    Array.from( document.querySelectorAll('input[name="termOptions"]'), input => input.checked = false );
    Array.from( document.querySelectorAll('input[name="showOptions"]'), input => input.checked = false );
  };
  taskDetails.value = todo.info ? todo.info : ""; //taskDetails est le testarea qui doit contenir les détails (si y'en a déjà), dans le div
  
  // *** COLOR
//const colorList = ["orange", "red", "darkmagenta", "dodgerblue", "forestgreen", "darkslategrey"];
  document.getElementById("colorIt").addEventListener("click", () => {
    //colorIt.insertAdjacentElement("afterend", colorPalet);
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
    document.querySelector("#SupClickScreen").addEventListener("click", () => clickHandlerAddOn(colorPalet, SupClickScreen));
  });
  //ICON
  document.getElementById("iconIt").addEventListener("click", () => {
    //iconIt.insertAdjacentElement("afterend", iconsPalet);
    taskInfo.insertAdjacentElement("beforeend", iconsPalet);
    //iconsPalet.classList.remove("displayNone");
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
        // iconsPalet.classList.add("displayNone");
        iconsPalet.classList.replace("inTaskDiv", "displayNone");
        clickHandlerAddOn(iconsPalet, SupClickScreen);
        list.insertAdjacentElement("afterend", iconsPalet);
      });
    });
    document.querySelector("#SupClickScreen").addEventListener("click", () => clickHandlerAddOn(iconsPalet, SupClickScreen));
  });
  parent.scrollIntoView();
  document.querySelector("#clickScreen").addEventListener("click", () => clickHandlerAddOn(taskInfo, clickScreen));
};
window.taskAddInfo = taskAddInfo;
window.listTasks = listTasks;

taskInfoBtn.addEventListener("click", () => {
  let todo = listTasks[taskToInfoIndex];
  let previousList = parent.parentElement.id;
  let previousTerm = todo.term ? todo.term : "always";
  todo.task = taskTitle.value.startsWith("*") ? taskTitle.value.substring(1) : taskTitle.value;
  todo.info = taskDetails.value;
  todo.color = newcolor;
  taskToInfo.querySelector(".text").style.color = newcolor;
  todo.icon = newicon;
  parent.querySelector(".IconI").className = `IconI ${newicon}`;
  let checked = document.querySelector('input[name="termOptions"]:checked');
  todo.term = checked ? checked.value : "";
  if(todo.term == "showThing"){
    todo.showType = document.querySelector('input[name="showOptions"]:checked').value;
  };
  taskToInfo.querySelector(".text").textContent = `${todo.info ? '*' : ''}${todo.task}`;
  if(!todo.stock && !todo.stored && storeIt.checked){
    stockCreaction(todo); //todo.stored = true; (has a model in storage) (included in stockCreation)
  };
  if(todo.stock && !storeIt.checked){
    trashStock(todo.id);
  };
  if(todo.stored && !storeIt.checked){
    trashStock(todo.stockId);
  };
  if(previousTerm !== todo.term){
    if(newShit && (todo.stored || (todo.term == "showThing" && todo.date) || todo.term == "oneTime" || todo.term == "longTerm")){
      newShit = false;
      document.querySelector("#sectionLimbo").classList.add("displayNone");
    };
    let togoList = getTogoList(todo);
    if(togoList == ""){
      parent.remove();
    } else if(todo.term == "showThing"){
      parent.className = `showLi ${todo.showType}`;
      parent.querySelector(".text").style.color = "";
    };
    if(previousList !== togoList){
      document.getElementById(togoList).appendChild(parent);
      moving = true;
    };
  };
  localStorage.listTasks = JSON.stringify(listTasks);
  sortItAll();
  updateCBC();
  clickHandlerAddOn(taskInfo, clickScreen);
  console.log(todo);
});


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
  document.querySelector("#clickScreen").addEventListener("click", () => clickHandlerAddOn(iconsPalet, clickScreen));
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
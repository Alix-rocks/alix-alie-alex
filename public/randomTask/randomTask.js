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
        mylist.push({task: taskIt, color: colorIt, info: infoIt});
      });
      myListDones.push({date: mydate, list: mylist});
    });
    listDones = myListDones;
    localStorageDones("first");
    console.log(listDones);
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
//Et si: on laisse les deleted dans la listDones (pas de splice), pourqu'ils puissent simplement se faire updater ici avec un array vide; et on fait juste ajouter un if que si lenght==0, on fait pas "donedDateCreation".
  // let deleted = getDeleted();
  // let empty = [{color: "", task: ""}];
  // deleted.map(deletedDate => {
  //   if(docSnapDones){
  //     if(docSnapDones[deletedDate]){
  //       batch.update(doc(db, "randomTask", auth.currentUser.email, "myListDones", deletedDate), {
  //         //dones: empty
  //         dones: deleteField()
  //         //["dones"]: deleteField()
  //         //dones: FieldValue.delete()
  //       });
  //       // batch.delete(doc(db, "randomTask", auth.currentUser.email, "myListDones", deletedDate)); //Not working!
  //     };
  //   };
  // });
   
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
  if(document.querySelectorAll("#listScheduled > li").length > 0){
    listScheduledChevron.classList.replace("typcn-chevron-right-outline", "typcn-chevron-right");
    listScheduledChevron.classList.add("todoDay");
  } else{
    listScheduledChevron.classList.replace("typcn-chevron-right", "typcn-chevron-right-outline");
    listScheduledChevron.classList.remove("todoDay");
  };
  if(document.querySelectorAll("#listRecurring > li").length > 0){
    listRecurringChevron.classList.replace("typcn-chevron-right-outline", "typcn-chevron-right");
    listRecurringChevron.classList.add("recurringDay");
  } else{
    listRecurringChevron.classList.replace("typcn-chevron-right", "typcn-chevron-right-outline");
    listRecurringChevron.classList.remove("recurringDay");
  };
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
    console.log(timeInput.value);
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
  let li = document.createElement("li");
  li.innerHTML = `<span class="typcn typcn-media-stop-outline emptyCheck" onclick="checkEvent(this)"></span><span class="text" onclick="taskAddInfo(this)">${todo.task}</span><span class="typcn typcn-calendar-outline calendarSpan ${todo.line}" onclick="calendarChoice(this)"></span><span class="typcn typcn-tag colorSpan" onclick="colorChoice(this)"></span>`;
  li.setAttribute("id", todo.id);
  li.querySelector(".text").style.color = todo.color;
  let togoList = getTogoList(todo);
  document.getElementById(togoList).appendChild(li);
};

function getTogoList(todo){
  let todayDate = getTodayDate();
  let togoList;
  if(todo.date == "" || !todo.date || todo.date > todayDate){
    if(todo.line == "todoDay"){
      togoList = "listScheduled";
    } else if(todo.line == "recurringDay"){
      togoList = "listRecurring";
    } else {
      togoList = "list";
    };
  } else if(todo.date == todayDate){
    togoList = "listToday";
  } else if(todo.date < todayDate){
    togoList = "listOups";
  };
  return togoList;
};

function donedCreation(donedDate, doned){
  let donedLi = document.createElement("li");
  donedLi.innerHTML = `<span class="typcn typcn-tick"></span><span class="text">${doned.task}</span><span class="typcn typcn-trash trashCan" onclick="trashCanEvent(this)"></span><span class="typcn typcn-arrow-sync recycle" onclick="recycleEvent(this)"></span>`;
  donedLi.querySelector(".text").style.color = doned.color;
  document.getElementById(donedDate).appendChild(donedLi);
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

function recycleEvent(recycle){
  let recycleLi = recycle.parentElement;
  let recycleId = recycleLi.id.slice(5);
  let recycleDate = recycleLi.parentElement.id;
  for (const i in listDones) {
    if (listDones[i].date == recycleDate) {
      let doned = listDones[i].list[recycleId];
      let todo = {
        id: crypto.randomUUID(),
        task: doned.task,
        color: doned.color,
        info: doned.info
      };
      listTasks.push(todo);
      localStorage.listTasks = JSON.stringify(listTasks);
      updateCBC();
      todoCreation(todo);
    };
  };    
};
window.recycleEvent = recycleEvent;

// *** ADD
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let newTask = addInput.value;
  let color = "darkslategrey";
  if(!newTask == ""){
    let todo = {
      id: crypto.randomUUID(),
      task: newTask,
      color: color
    };
    listTasks.push(todo);
    localStorage.listTasks = JSON.stringify(listTasks);
    updateCBC();
    todoCreation(todo);
    addForm.reset();
    console.log(listTasks);
  };
});


// *** DONE/ERASE
let num = 0;

doneNextBtn.addEventListener("click", () => {
  let doneId = wheneverList[num].id;
  let doneLi = document.getElementById(doneId);
  console.log(doneId);
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
  console.log("checkEvent");
  console.log(listTasks);
  let li = emptyCheck.parentElement;
  let donedId = li.id;
  li.remove();
  gotItDone(donedId);
};
window.checkEvent = checkEvent;

function gotItDone(nb){
  console.log("gotItDone");
  console.log(nb);
  let donedTaskIndex = listTasks.findIndex(todo => todo.id == nb);
  let donedTaskSplice = listTasks.splice(donedTaskIndex, 1);
  console.log(donedTaskSplice);
  let donedTask = donedTaskSplice[0].task;
  console.log(donedTask);
  let donedColor = donedTaskSplice[0].color;
  console.log(donedColor);
  let donedInfo = donedTaskSplice[0].info;
  console.log(donedInfo);
  localStorage.listTasks = JSON.stringify(listTasks);
  let donedDate = getTodayDate(); //return
  let donedItem = {
    task: donedTask,
    color: donedColor,
    info: donedInfo
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

function trashCanEvent(trashCan){
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

window.trashCanEvent = trashCanEvent;

function localStorageDones(time){
  if(time == "next"){
    updateCBC();
  };
  let lastWeek = getLastWeekDate();
  console.log(lastWeek);
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

// *** SHUFFLE
let wheneverList = [];
shuffleBtn.addEventListener("click", () => {
  let todayDate = getTodayDate();
  wheneverList = listTasks.filter(task => task.date > todayDate || !task.date || task.date == "");
  console.log(wheneverList);
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
  console.log(wheneverList.length + " " + num);
  if(wheneverList.length == 0){
    taskToDo.innerText = "aller t'reposer!";
  } else{
    num = num < (wheneverList.length - 1) ? num + 1 : 0;
    console.log(wheneverList.length + " " + num);
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

// *** SAVE THE DATE
// >>>>>>> MAKE IT A FORM! (so that you can do form.reset())
let parent;
let taskToDate;
let taskToDateIndex;
let lineDay = ["todoDay", "doneDay", "recurringDay"];
function calendarChoice(thisOne){
  taskToDate = thisOne; // taskToDate est l'icon calendar
  parent = taskToDate.parentElement;
  parent.classList.add("selectedTask");
  let taskToDateId = parent.id;
  taskToDateIndex = listTasks.findIndex(todo => todo.id == taskToDateId);
  let todo = listTasks[taskToDateIndex];
  let date = todo.date ? todo.date : getTodayDate();
  calendarInput.value = date; //calendarInput est le dateInput qui doit contenir la date (si y'en a déjà une)
  weekSection.classList.add("displayNone");
  monthSection.classList.add("displayNone");
  if(todo.line == "doneDay"){
    doneDayInput.checked = true;
  } else if(todo.line == "todoDay"){
    todoDayInput.checked = true;
  } else if(todo.line == "recurringDay"){
    fillUpRecurring(todo);
    recurringDayInput.checked = true;
  } else{
    todoDayInput.checked = true;
    // document.getElementsByName("whatDay").forEach(radio => {
    //   radio.checked = false;
    // });
  };
  taskToDate.insertAdjacentElement("afterend", calendarDiv); //calendarDiv est le div qui apparait
  calendarDiv.classList.remove("displayNone");
  clickScreen.classList.remove("displayNone");
  parent.scrollIntoView();
  document.querySelector("#clickScreen").addEventListener("click", () => clickHandlerAddOn(calendarDiv));
  recurringDayInput.addEventListener("click", (evt) => {
    if(evt.currentTarget.checked == true){
      fillUpRecurring(todo);
    };
  });
  timeVariationInput.addEventListener("change", () => {
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
  let todo = listTasks[taskToDateIndex];
  let previousDate = todo.date;
  let previousLine = todo.line;
  todo.date = calendarInput.value;
  if(noDayInput.checked == true){
    todo.line = noDayInput.value;
    todo.date = todo.dal = todo.ogni = todo.var = todo.daysWeek = todo.meseOpt = todo.meseDate = todo.meseDayN = todo.meseDayI = todo.fineOpt = todo.fineDate = todo.fineCount = "";
  };
  if(calendarInput.value || dalInput.value){
    document.getElementsByName("whatDay").forEach(radio => {
      if(radio.checked == true){
        todo.line = radio.value;
        taskToDate.classList.remove(...lineDay);
        taskToDate.classList.add(radio.value);
      };
    });
  } else{
    todo.line = "";
    // document.getElementsByName("whatDay").forEach(radio => {
    //   radio.checked = false;
    // });
    taskToDate.classList.remove(...lineDay);
    //list.appendChild(parent);
  };
  
  if(todo.line == "recurringDay"){
    todo.dal = todo.ogni = todo.var = todo.daysWeek = todo.meseOpt = todo.meseDate = todo.meseDayN = todo.meseDayI = todo.fineOpt = todo.fineDate = todo.fineCount = "";
    //add all the info to todo
    todo.dal = dalInput.value;
    todo.ogni = ogniInput.value;
    todo.var = timeVariationInput.value;
    if(todo.var == "settimana"){
      let daysWeek = [];
      document.getElementsByName("daysWeekChoice").forEach(choice => {
        if(document.getElementById(choice.id).checked == true){
          daysWeek.push(choice.value);
        };
      });
      todo.daysWeek = daysWeek;
    } else if(todo.var == "mese"){
      document.getElementsByName("meseOptions").forEach(radio => {
        if(radio.checked == true){
          todo.meseOpt = radio.id;
        };
      });
      if(todo.meseOpt == "ogniXDate"){
        todo.meseDate = meseDateCalc(dalInput.value);
      } else if(todo.meseOpt == "ogniXDay"){
        todo.meseDayN = meseDayNCalc(dalInput.value);
        todo.meseDayI = meseDayICalc(dalInput.value);
      };
    };
    document.getElementsByName("fineOptions").forEach(radio => {
      if(radio.checked == true){
        todo.fineOpt = radio.id;
      };
    });
    if(todo.fineOpt == "fineGiorno"){
      todo.fineDate = document.getElementById("fineDate").value;
    } else if(todo.fineOpt == "fineDopo"){
      todo.fineCount = document.getElementById("fineCount").value;
    };
    //todo.date = calculateRecurringDate(todo);
  };
  if(previousDate !== todo.date || previousLine !== todo.line) {
    let togoList = getTogoList(todo);
    document.getElementById(togoList).appendChild(parent);
  };
  localStorage.listTasks = JSON.stringify(listTasks);
  updateCBC();
  clickHandlerAddOn(calendarDiv);
  calendarDiv.reset();
});


// *** RECURRING
// todo.dal = todo.ogni = todo.var = todo.daysWeek = todo.meseOpt = todo.meseDate = todo.meseDayN = todo.meseDayI = todo.fineOpt = todo.fineDate = todo.fineCount = "";
//todo.dal => date que ça commence
//todo.ogni => numéro de répétition
//todo.var => timeVariation, type de variation : "giorno", "settimana", "mese" or "anno"
//todo.daysWeek => [] : "domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi" or "sabato"
//todo.meseOpt => option mois : "ogniXDate" or "ogniXDay"
//todo.meseDate => jour du mois où ça revient (xx)
//todo.meseDayN => numéro du day (1, 2, 3, ou 4)
//todo.meseDayI => index du day (0 = domenica, 1 = lunedi, 2 = martedi, etc)
//todo.fineOpt => option quand ça fini: "fineMai", "fineGiorno" or "fineDopo"
//todo.fineDate => jour que ça fini (date)
//todo.fineCount => nombre d'occurences après lesquelles ça fini

function calculateRecurringDate(todo){
  //we're not figuring out which list todo should go to (they're all going in recurring list except those that are after the fineDate and those that are for Today (make sure the togolist function checks these), but only the date we should give it: either the dalDate if it hasn't started yet (we can calculate once there if it's really starting on the dalDate) or the fineDate if it's over; otherwise it's the next date (should we recycle it and not recalculate every time?)
  //On pourrait créer un array pour todo.date avec les X prochaines dates (ou que ça soit un autre, genre todo.dates et qu'on fasse juste checker si c'est recurring ou pas pour savoir lequel qu'on utilise. On utilise le premier à chaque fois puis l'enlève de l'Array quand la date est passée et qu'on est rendu à la prochaine; sinon garde la date, même si elle passée pour qu'il reste dans le Oups. Quand la tache est Done, on enlève cette date-là de l'array pour qu'il réapparaisse pas dans oups)
  let today = getTodayDate();
  if(todo.dal <= today >= todo.fineDate){}
};

function fillUpRecurring(todo){
  console.log(todo.dal);
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
      document.getElementById("fineDate").value = todo.fineDate;
    } else if(todo.fineOpt == "fineDopo"){
      document.getElementById("fineCount").value = todo.fineCount;
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
function taskAddInfo(thisOne){
  taskToInfo = thisOne; //taskToInfo est le span.text qui a été cliqué
  let width = getComputedStyle(taskToInfo).width;
  taskInfo.style.width = width;
  taskToInfo.insertAdjacentElement("afterend", taskInfo); //taskInfo est le div qui apparait
  taskInfo.classList.remove("displayNone");
  clickScreen.classList.remove("displayNone");
  let taskTitleInfo = taskToInfo.textContent; //taskTitleInfo est le text contenu dans taskToInfo (span.text)
  taskTitle.value = taskTitleInfo; //taskTitle est le input qui doit contenir le titre, dans le div
  parent = taskToInfo.parentElement;
  parent.classList.add("selectedTask");
  let taskToInfoId = parent.id;
  taskToInfoIndex = listTasks.findIndex(todo => todo.id == taskToInfoId);
  let todo = listTasks[taskToInfoIndex];
  taskTitle.style.color = todo.color;
  if(todo.info){
    taskDetails.value = todo.info; //taskDetails est le testarea qui doit contenir les détails (si y'en a déjà), dans le div
  } else{
    taskDetails.value = "";
  };
  parent.scrollIntoView();
  document.querySelector("#clickScreen").addEventListener("click", () => clickHandlerAddOn(taskInfo));
};
window.taskAddInfo = taskAddInfo;
window.listTasks = listTasks;

taskInfoBtn.addEventListener("click", () => {
  let todo = listTasks[taskToInfoIndex];
  todo.task = taskTitle.value;
  todo.info = taskDetails.value;
  console.log(listTasks);
  taskToInfo.textContent = taskTitle.value;
  localStorage.listTasks = JSON.stringify(listTasks);
  updateCBC();
  clickHandlerAddOn(taskInfo);
});
// *** COLOR
//const colorList = ["orange", "red", "darkmagenta", "dodgerblue", "forestgreen", "darkslategrey"];
let colorTag;
function colorChoice(thisOne){
  colorTag = thisOne;
  parent = colorTag.parentElement;
  parent.classList.add("selectedTask");
  colorTag.insertAdjacentElement("afterend", colorPalet);
  colorPalet.classList.remove("displayNone");
  clickScreen.classList.remove("displayNone");
  document.querySelectorAll("input[name='colorRadio']").forEach(radio => {
    radio.addEventListener("click", () => {
      let color = radio.value;
      let li = colorTag.parentElement;
      let liTask = li.querySelector(".text").textContent;
      li.querySelector(".text").style.color = color;
      console.log(liTask);
      let taskId = li.id;
      let taskIndex = listTasks.findIndex(todo => todo.id == taskId);
      listTasks[taskIndex].color = color;
      console.log(listTasks);
      localStorage.listTasks = JSON.stringify(listTasks);
      updateCBC();
      clickHandlerAddOn(colorPalet);
    });
  });
  document.querySelector("#clickScreen").addEventListener("click", () => clickHandlerAddOn(colorPalet));
};
window.colorChoice = colorChoice;

function clickHandlerAddOn(addOn){
  parent.classList.remove("selectedTask");
  addOn.classList.add("displayNone");
  list.insertAdjacentElement("afterend", addOn);
  clickScreen.classList.add("displayNone");
  document.querySelector("#clickScreen").removeEventListener("click", () => clickHandlerAddOn(addOn));
};

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

function getLastWeekDate(){
  let date = new Date();
  date.setDate(date.getDate() - 7);
  let lastWeekDay= String(date.getDate()).padStart(2, "0");
  let lastWeekMonth = String(date.getMonth()+1).padStart(2, "0");
  let lastWeekYear = date.getFullYear();
  let lastWeekDate = `${lastWeekYear}-${lastWeekMonth}-${lastWeekDay}`;
  return lastWeekDate;
};
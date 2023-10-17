import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { app, analytics, db, auth, provider } from "../myFirebase.js";
console.log("salut!");
//Check, si jamais t'utilise ça pour d'autre app, isole-le, comme myFirebase
auth.languageCode = 'fr';

getRedirectResult(auth)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    console.log("alloooo");
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    // const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
  // console.log(auth);
  function logIn(){
      signInWithRedirect(auth, provider);
      document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
      document.getElementById("scheduleTime").innerHTML = ``;
  }
  window.logIn = logIn;

  onAuthStateChanged(auth,(user) => {
    if(user){
      console.log(user);
      //document.getElementById("displayName").innerText = " " + user.displayName + ",";
      document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
      document.getElementById("scheduleTime").innerHTML = ``;
      getPlans();
    } else{
      document.getElementById("displayName").innerText = "";
      document.getElementById("scheduleTimeWhole").classList.add("popupBackDG");
      document.getElementById("scheduleTime").innerHTML = `<h4><span class="h3like">First thing's first...</span><br/><span class="h1like" style="font-size: calc(19.53px + 0.19vw); font-weight: 900;">Who do you think you are?!</span></h4>
      <div class="stepBox">
        <button class="timeFormButton" onclick="window.logIn()">Log in</button>
      </div>`;
    };
  });

let steps;
let myScheduleList = [];

async function getPlans() {
  //console.log(auth.currentUser.email);
  const getPlans = await getDocs(collection(db, "plan", auth.currentUser.email, "myPlans"));
  // const getPlans = await getDocs(query(collection(db, "plan", auth.currentUser.email), where("owner", "==", auth.currentUser.email)));
  myScheduleList = [];
  getPlans.forEach(doc => {
    const namePlan = doc.id;
    const ordrePlan = doc.data().ordre;
    myScheduleList.push({id:namePlan, ordre:ordrePlan});
  });
  if(localStorage.getItem("steps")) {
    steps = JSON.parse(localStorage.getItem("steps"));
    displaySteps();
    if(myScheduleList.length >= 1){
      displayPlans();
    }
  } else if(myScheduleList.length >= 1){
    displayPlans();
    getDefaultSchedule();
  } else{
    steps = {
          ordre:"",
          destination:"",
          steps:[
            // { name: t("Cooking"), value: 30, checked: true, id: crypto.randomUUID() },
            { name: "Cooking", value: 30, checked: true, id: crypto.randomUUID() },
            { name: "Eating", value: 60, checked: true, id: crypto.randomUUID() },
            { name: "Toilet", value: 15, checked: true, id: crypto.randomUUID() },
            { name: "Shower", value: 15, checked: true, id: crypto.randomUUID() },
            { name: "Prepping", value: 30, checked: true, id: crypto.randomUUID() },
            { name: "Travelling", value: 0, checked: true, id: crypto.randomUUID() }],
          arriveeTime:"",
          notes:""};
    displaySteps();
  };
};
getPlans();

async function getDefaultSchedule(){
  // const defaultSchedule = await getDocs(query(collection(db, "plan"), where("owner", "==", auth.currentUser.email), where("ordre", "==", 0)));
  // defaultSchedule.forEach((doc) => {
  //   steps = doc.data();
  // })
  const defaultSchedule = await getDocs(query(collection(db, "plan", auth.currentUser.email, "myPlans"), where("ordre", "==", 0)));
  defaultSchedule.forEach((doc) => {
    steps = doc.data();
  })
  displaySteps();
}
// getDefaultSchedule();
//window.getDefaultSchedule = getDefaultSchedule;

function displayPlans() {
  myScheduleList = myScheduleList.toSorted((a, b) => {
    // if(a.ordre < b.ordre){
    //     return -1
    // } else if(a.ordre > b.ordre){
    //     return 1
    // } else if(a.ordre === b.ordre){
    //     return 0
    // }
    return a.ordre < b.ordre ? -1 : a.ordre > b.ordre ? 1 : 0
  });
  document.getElementById("togglePlansWhole").classList.remove("displayNone");
  let listLi = myScheduleList.map((schedule) => {
      return `
        <li class="listPlan"  id="${schedule.id}">
            <p>
              <span class="typcn icon typcn-star planStar" title="Default!"></span>
              <span class="typcn icon typcn-th-small planDD" title="Drag & Drop"></span>
              <span class="trashLinePlan">
                <span class="underTrashLine scheduleName" title="Show that one">${schedule.id}</span>
              </span>
              <span class="typcn icon typcn-trash planTB" title="Trash it!"></span>
            </p>
        </li>`
  }).join("");
  document.getElementById("mySchedules").innerHTML = `
    <ul class="listPlans">${listLi}</ul>
    <button title="Fix that mess!" id="manageModeBtn" class="timeFormButtonSmall" style="height: 30px; width: 90px;">Manage</button>
    <button title="Get out of manage mode!" id="manageCancelBtn" class="timeFormButtonSmall displayNone" style="float:left; width: 90px;">
    Cancel
    <span class="typcn icon typcn-cancel" style="opacity: .8; font-size: 1.2em; line-height: 1em;"></span>
    </button>
    <button title="That's the way I like it!" id="managedPlansBtn" class="timeFormButtonSmall displayNone" style="float:right; width: 100px;">
    Save this&hairsp;!
    <span class="typcn icon typcn-cloud-storage-outline" style="opacity: .8; font-size: 1.2em; line-height: 1em;"></span>
    </button>`;
    let plans = document.querySelectorAll(".listPlans > .listPlan");
    plans[0].classList.add("starDefault");
    document.querySelectorAll(".planTB").forEach(trashCanPlan => {
      trashCanPlan.addEventListener("click", trashPlan);
    });
    manageModeBtn.addEventListener("click", manageMode);
    manageCancelBtn.addEventListener("click", manageCancel);
    managedPlansBtn.addEventListener("click", managedPlans);
    document.querySelectorAll(".scheduleName").forEach(scheduleName => {
      let id = scheduleName.parentElement.parentElement.parentElement.id;
      scheduleName.addEventListener("click", () => {
        getSchedule(id);
        document.querySelector("#togglePlans").checked = false;
      });
    });
}

async function getSchedule(id){
  console.log(id);
  const schedule = await getDoc(doc(db, "plan", auth.currentUser.email, "myPlans", id));
  steps = schedule.data();
  displaySteps();
};
window.getSchedule = getSchedule;



function getMaxPlans() {
  let max = -1;
  myScheduleList.forEach(plan => {
    max = max > plan.ordre ? max : plan.ordre
  });
  return max;
}

async function saveIt() {
  updateSteps();
  let destination = document.getElementById("nameToSave").value;
  const docRef = doc(db, "plan", auth.currentUser.email, "myPlans", destination);
  const docSnap = await getDoc(docRef);
  // We need to look into only the owner's plans!
  if (docSnap.exists()) {
  // if(await getDoc(doc(db, "plan", destination)).exists()){
    document.getElementById("togglePlansWhole").classList.add("displayNone");
    document.getElementById("timeForm").classList.add("displayNone");
    document.getElementById("scheduleTimeWhole").classList.add("popupBackDG");
    document.getElementById("scheduleTime").innerHTML = `
      <h3>That one has a doppelganger, what should we do?!</h3>
      <h4><em>No, we can't keep them both, otherwise that'll create chaos!</em></h4>
      <div class="saveOption">
        <p>Keep the old one, forget the new one.</p>
        <button title="Cancel" id="saveOptCancelBtn" class="timeFormButtonSmall">Cancel</button>
      </div>
      <div class="saveOption">
        <p>Keep both but let’s rebaptized the new one...</p>
        <button title="Save as" id="saveOptSaveAsBtn" class="timeFormButtonSmall">Save as</button>
      </div>
      <div class="saveOption">
        <p>Out with the old, in with the new!</p>
        <button title="Replace" id="saveOptReplaceBtn" class="timeFormButtonSmall">Replace</button>
      </div>`;
      saveOptCancelBtn.addEventListener("click", saveOptCancel);
      saveOptSaveAsBtn.addEventListener("click", saveOptSaveAs);
      saveOptReplaceBtn.addEventListener("click", saveOptReplace);
  } else{
   await setDoc(doc(db, "plan", auth.currentUser.email, "myPlans", destination), {
    ...steps,
    ordre: (getMaxPlans() + 1)
    });
    getPlans();
    document.getElementById("savePlanDiv").innerHTML = `<h3 class="savePlanH3">You saved it!</h3>
    <p style="text-align:center;">Now, go see it in your schedules!</p>`;
    document.getElementById("screen").classList.replace("displayNone", "clickScreen");
    document.getElementById("screen").addEventListener("click", clickHandlerSaved);
    //document.querySelector("#timePage").addEventListener("click", clickHandlerSaved);
  };
};
//window.saveIt = saveIt;


async function trashSchedules(){
  console.log(trashedSchedules);
  for (const trashedSchedule of trashedSchedules) {
    await deleteDoc(doc(db, "plan", auth.currentUser.email, "myPlans", trashedSchedule.id));
  };
};
//window.trashSchedules = trashSchedules;

async function orderSchedules(){
  for (const list of myScheduleList){
    await updateDoc(doc(db, "plan", auth.currentUser.email, "myPlans", list.id), {
      ordre: list.ordre
    });
  };
};
//window.orderSchedules = orderSchedules;



//**once it's connected to google accounts
//**connect to an account and save the whole thing with a name for later [one collection "plan" for everyone, but owner value = email or user.id]
//**once it's an app
//**add a button to do a printscreen and make it your new background
//**add a button to create notification for each steps

function saveSteps() {
  localStorage.setItem("steps", JSON.stringify(steps));
  // localStorage.setItem("destination", document.getElementById("destination").value);
  // localStorage.setItem("arriveeTime", document.getElementById("arriveeTime").value);
  // localStorage.setItem("notes", document.getElementById("notes").value);
};

function clearStorage() {
  if (confirm("Are you sure?!\nBecause you'll loose all your changes!")) {
    localStorage.clear();
    location.reload();
  }
}


function manageMode(){
  //trash can doesn't trashSchedule right away! add trashline, then after confirmation trashSchedule (and reorder) all at once
  document.getElementById("manageModeBtn").classList.add('displayNone');
  document.getElementById("manageCancelBtn").classList.remove('displayNone');
  document.getElementById("managedPlansBtn").classList.remove('displayNone');
  let listPlans = document.querySelector(".listPlans");
  listPlans.classList.add("managePlans");
  let plans = document.querySelectorAll(".listPlans > .listPlan");
  plans.forEach(plan => {
    plan.setAttribute('draggable', true)
    plan.addEventListener("dragstart", () => {
      // Adding dragging class to item
      plan.classList.add("dragging");
      plan.classList.remove("starDefault");
    });
    plan.addEventListener("dragend", () => {
      // Adding dragging class to item
      plan.classList.remove("dragging");
    });
  });
    let icons = document.querySelectorAll(".listPlans > .listPlan .planDD");
    icons.forEach(icon =>{
    // Adding dragging class to item
    icon.addEventListener("touchstart", (evt) => {
      evt.currentTarget.parentElement.parentElement.classList.add("dragging");
      evt.currentTarget.parentElement.parentElement.classList.remove("starDefault");
    });
    // Removing dragging class from item on dragend event
    icon.addEventListener("touchend", (evt) => {
      evt.currentTarget.parentElement.parentElement.classList.remove("dragging");
    });
  });
  listPlans.addEventListener("dragover", listPlansDD);
  listPlans.addEventListener("drop", listPlansOD);
  listPlans.addEventListener("touchmove", listPlansDD);
  listPlans.addEventListener("touchend", listPlansOD);
};
window.manageMode = manageMode;
const listPlansDD = (e) => {
  let listPlans = document.querySelector(".listPlans");
  e.preventDefault();
  const draggingPlan = document.querySelector(".dragging");
  // Getting all items except currently dragging and making array of them
  let siblings = [...listPlans.querySelectorAll(".listPlan:not(.dragging)")];
  // Finding the sibling after which the dragging item should be placed
  let nextSibling = siblings.find(sibling => {
    if (e.clientX) {
      //if mouse
      return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    } else {
      //if touch
      return e.changedTouches[0].clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    };
  });
  // Inserting the dragging item before the found sibling
  listPlans.insertBefore(draggingPlan, nextSibling);
};
function listPlansOD(){
  let plans = document.querySelectorAll(".listPlans > .listPlan");
  plans.forEach(plan => {
    plan.classList.remove("starDefault");
  });
  plans[0].classList.add("starDefault");
};
function trashPlan(event){
  event.currentTarget.parentElement.parentElement.classList.toggle("trashedPlan");
};
function manageCancel(){
  displayPlans();
};
let trashedSchedules = [];
function managedPlans(){
  if (confirm("Are you sure?!\n'Cause you don't come back from that!")) {
    for (let i = myScheduleList.length - 1; i >= 0; i--) {
      let planTrash = document.getElementById(`${myScheduleList[i].id}`);
      if (planTrash.classList.contains("trashedPlan")) { 
        trashedSchedules.push(myScheduleList[i]);
        myScheduleList.splice(i, 1);
        planTrash.remove();
      };
    };
    trashSchedules();
    
    let plans = Array.from(document.querySelectorAll(".listPlans > .listPlan"));
    for (let a = 0; a < plans.length; a++) {
      let name = plans[a].id;
      let plan = myScheduleList.find((x) => x.id == name)
      plan.ordre = a;
    };
    orderSchedules();
    displayPlans();
  };
};


function displaySteps() {
  let timeForm = document.getElementById("timeForm");
  let stepAll = `
    <div class="stepBox"  style="flex-wrap: wrap;">
    <label class="timeSettingLabel" style="margin-bottom: 7px;">Destination:</label>
    <input id="destination" class="timeDestination" type="text" value="${steps.destination}" onchange="updateSteps()"/>
    </div>`;
  let stepArray = steps.steps.map((step, idx) => {
    return `
    <li class="iteme" draggable="true" data-index="${idx}" style="${step.style}" id="${step.id}">
        <div class="changeIcon">
        <span class="typcn icon typcn-th-small itemeDD" style="opacity: .8;"></span>
        <input id="${step.id}trashCan" class="cossin trashCanCheck" type="checkbox"/>
        <label for="${step.id}trashCan" class="typcn icon typcn-trash trashLabel displayNone" style="opacity: .8; font-size: 1.5em; line-height: 1em; margin: 0 -5px 0 -2px;" ></label>
        </div>
        <div class="trashLine">
        <div>
            <input id="${step.id}Check" class="cossin timeSettingInput" name="${step.id}" type="checkbox" ${step.checked ? "checked" : ""} onchange="updateSteps(event)"/>
            <label for="${step.id}Check" class="timeSettingLabel">
            <span class="timeSettingCheck"></span>
            </label>
            <input id="${step.id}Name" type="text" class="timeDestination timeDestination2" style="width:80px;" value="${step.name}" onchange="updateSteps(event)"/>
        </div>
        <div>
            <input id="${step.id}Time" class="timeDestination timeDestination2" type="number" step="5" value="${step.value}" onchange="updateSteps(event)"/>
            <span class="timeSettingLabel">min</span>
        </div>
        </div>
    </li>`
  });
  stepAll += `<ul id="sortable-List" class="sortable-List" style="padding:0;">${stepArray.join("")}</ul>`;
  stepAll += `<div class="stepBox">
      <button id="addStepBtn" class="timeFormButton" style="float:left; height: 30px; width: 30px; padding: 0;">
      +
      </button>
      <button title="Enter trash mode!" id="trashModeBtn" class="timeFormButton" style="float:right; height: 30px; width: 30px; padding: 0;">
      <span class="typcn icon typcn-trash" style="opacity: .8; font-size: 1.2em; line-height: 1em;"></span>
      </button>
      <button title="Get out of trash mode!" id="trashCancelBtn" class="timeFormButtonSmall displayNone" style="width: 90px;">
      Cancel
      <span class="typcn icon typcn-cancel" style="opacity: .8; font-size: 1.2em; line-height: 1em;"></span>
      </button>
      <button title="Get rid of all the checked ones!" id="trashItBtn" class="timeFormButtonSmall displayNone" style="float:right; width: 90px;">
      Trash it&hairsp;!
      <span class="typcn icon typcn-trash" style="opacity: .8; font-size: 1.2em; line-height: 1em;"></span>
      </button>
    </div>`;
  stepAll += `<div class="stepBox">
      <div>
      <label for="arriveeTime" class="timeSettingLabel">
          Arrival time
      </label>
      </div>
      <div id="arriveeTimeDiv">
      <input id="arriveeTime" type="time" value="${steps.arriveeTime}" onchange="updateSteps()"/>
      </div>
    </div>`;
  stepAll += `<div class="stepBox"  style="flex-wrap: wrap;">
      <label class="timeSettingLabel" style="margin:0 0 7px;">
      Notes:
      </label>
      <textarea id="notes" class="timeDestination" onchange="updateSteps()">${steps.notes}</textarea>
    </div>`;
  stepAll += `<div class="stepBox">
      <button id="calculateTimeBtn" title="Calculate your schedule!" class="timeFormButton" style="float:right;">
      Calculate&hairsp;!
      </button>
      <button id="savePlanBtn" title="Save it in the clouds!" class="timeFormButton" style="float:left;">
      <span class="typcn icon typcn-cloud-storage-outline" style="font-size: 1.4em; line-height: 1em;"></span>
      </button>
    </div>
    <div id="savePlanDiv" class="stepBox" style="flex-wrap: wrap;"></div>`;
  stepAll += `<div class="stepBox">
      <button id="clearStorageBtn" title="Get the original data back!" class="timeFormButton" style="font-size: .8em; font-family: 'Nunito'; margin: 15px auto; border-width: 0.5px 0.5px 2px 1px;">
      Go back to original
      </button>
    </div>`;
  timeForm.innerHTML = stepAll;
  savePlanBtn.addEventListener("click", savePlan);
  trashModeBtn.addEventListener("click", trashMode);
  trashCancelBtn.addEventListener("click", trashCancel);
  trashItBtn.addEventListener("click", trashIt);
  document.querySelectorAll(".trashCanCheck").forEach(trashCan =>{
    trashCan.addEventListener("click", trashOrNot);
  });
  clearStorageBtn.addEventListener("click", clearStorage);
  addStepBtn.addEventListener("click", addStep);
  calculateTimeBtn.addEventListener("click", calculateTime);
  let sortableList = document.querySelector(".sortable-List");
  let itemes = document.querySelectorAll(".sortable-List > .iteme");
  let icons = document.querySelectorAll(".sortable-List > .iteme > .changeIcon");
  itemes.forEach(iteme => {
    iteme.addEventListener("dragstart", (evt) => {
      // Adding dragging class to item
      evt.currentTarget.classList.add("dragging");
    });
    // Removing dragging class from item on dragend event
    iteme.addEventListener("dragend", (evt) => {
      evt.currentTarget.classList.remove("dragging");
    });
  });
  icons.forEach(icon => {
    // Adding dragging class to item
    icon.addEventListener("touchstart", (evt) => {
      evt.currentTarget.parentElement.classList.add("dragging");
    });
    // Removing dragging class from item on dragend event
    icon.addEventListener("touchend", (evt) => {
      evt.currentTarget.parentElement.classList.remove("dragging");
    });
  });
  sortableList.addEventListener("dragover", initSortableList);
  sortableList.addEventListener("drop", ondrop);
  sortableList.addEventListener("touchmove", initSortableList);
  sortableList.addEventListener("touchend", ondrop);
};

const initSortableList = (e) => {
  let sortableList = document.querySelector(".sortable-List");
  e.preventDefault();
  const draggingItem = document.querySelector(".dragging");
  // Getting all items except currently dragging and making array of them
  let siblings = [...sortableList.querySelectorAll(".iteme:not(.dragging)")];
  // Finding the sibling after which the dragging item should be placed
  let nextSibling = siblings.find(sibling => {
    if (e.clientX) {
      //if mouse
      return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    } else {
      //if touch
      return e.changedTouches[0].clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    }
  });
  // Inserting the dragging item before the found sibling
  sortableList.insertBefore(draggingItem, nextSibling);
}

function ondrop() {
  let itemes = Array.from(document.querySelectorAll(".sortable-List > .iteme"));
  steps.steps = itemes.map((iteme) => steps.steps[iteme.dataset.index]);
  updateItemesIndex();
  updateSteps();
}

function savePlan() {
  document.getElementById("savePlanDiv").innerHTML = `<p style="font-size:calc(13.53px + 0.19vw); margin: 1em 0 0.2em;">How should we name that one?</p>
    <input id="nameToSave" class="timeDestination" type="text" value="${document.getElementById("destination").value}"/>
    <div class="stepBox" style="width: 100%;">
        <button title="Nevermind!" id="saveCancelBtn" class="timeFormButtonSmall" style="height: 30px; width: 90px;">
        Cancel
        <span class="typcn icon typcn-cancel" style="font-size: 1.2em; line-height: 1em;"></span>
        </button>
        <button title="Save it!" id="saveItBtn" class="timeFormButtonSmall" style="height: 30px; width: 90px;">
        Save it&hairsp;!
        <span class="typcn icon typcn-cloud-storage-outline" style="font-size: 1.4em; line-height: 1em;"></span>
        </button>
    </div>`;
  saveItBtn.addEventListener("click", saveIt);
  saveCancelBtn.addEventListener("click", saveCancel);
}
function saveCancel() {
  document.getElementById("savePlanDiv").innerHTML = ``;
}
function saveOptCancel(){
  saveCancel();
  document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
  document.getElementById("scheduleTime").innerHTML = ``;
  document.getElementById("togglePlansWhole").classList.remove("displayNone");
  document.getElementById("timeForm").classList.remove("displayNone");
};
function saveOptSaveAs(){
  document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
  document.getElementById("scheduleTime").innerHTML = ``;
  document.getElementById("togglePlansWhole").classList.remove("displayNone");
  document.getElementById("timeForm").classList.remove("displayNone");
};

async function saveOptReplace(){
  let destination = document.getElementById("nameToSave").value;
  await updateDoc(doc(db, "plan", auth.currentUser.email, "myPlans", destination), {
    ...steps
  });
  document.getElementById("togglePlansWhole").classList.remove("displayNone");
  document.getElementById("timeForm").classList.remove("displayNone");
  document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
  document.getElementById("scheduleTime").innerHTML = ``;
  getPlans();
  document.getElementById("savePlanDiv").innerHTML = `<h3 class="savePlanH3">You replaced it!</h3>
  <p style="text-align:center;">Now, go see it in your schedules!</p>`;
  console.log("saveOptReplace");
  document.getElementById("screen").classList.replace("displayNone", "clickScreen");
  document.getElementById("screen").addEventListener("click", clickHandlerSaved);
  //document.querySelector("#timePage").addEventListener("click", clickHandlerSaved);
};
//window.saveOptReplace = saveOptReplace;

function clickHandlerSaved(){
  document.getElementById("savePlanDiv").innerHTML = ``;
  document.getElementById("screen").classList.replace("clickScreen", "displayNone");
  document.getElementById("screen").removeEventListener("click", clickHandlerSaved);
  // document.querySelector("#timePage").removeEventListener("click", clickHandlerSaved);
};

function trashMode() {
  let trashables = document.querySelectorAll(".trashLabel");
  trashables.forEach((trashable) => {
    trashable.classList.remove('displayNone');
  });
  let moveables = document.querySelectorAll(".itemeDD");
  moveables.forEach((moveable) => {
    moveable.classList.add("displayNone");
  });
  document.getElementById("trashModeBtn").classList.add('displayNone');
  document.getElementById("trashCancelBtn").classList.remove('displayNone');
  document.getElementById("trashItBtn").classList.remove('displayNone');
}
function trashOrNot(event) {
  let trashCan = event.currentTarget;
  let trashDiv = trashCan.parentElement;
  let trashStep = trashDiv.parentElement;
  trashStep.classList.toggle("trashed");
}
function trashCancel() {
  let trashables = document.querySelectorAll(".trashLabel");
  trashables.forEach((trashable) => {
    trashable.classList.add('displayNone');
  });
  let moveables = document.querySelectorAll(".itemeDD");
  moveables.forEach((moveable) => {
    moveable.classList.remove("displayNone");
  });
  document.getElementById("trashModeBtn").classList.remove('displayNone');
  document.getElementById("trashCancelBtn").classList.add('displayNone');
  document.getElementById("trashItBtn").classList.add('displayNone');
  let trashTrasheds = document.querySelectorAll(".trashed");
  trashTrasheds.forEach((trashTrashed) => {
    trashTrashed.classList.remove("trashed");
  });
}

function trashIt() {
  updateSteps();
  if (confirm("Are you sure?!")) {
    for (let i = steps.steps.length - 1; i >= 0; i--) {
      let stepDiv = document.getElementById(`${steps.steps[i].id}`);
      if (stepDiv.classList.contains("trashed")) {
        steps.steps.splice(stepDiv.dataset.index, 1);
        stepDiv.remove();
      };
    }
    trashCancel();
    updateSteps();
    updateItemesIndex();
  } else {
    trashCancel();
  };
}

function addStep() {
  updateSteps();
  let stepName = prompt("Name your step");
  if (stepName) { steps.steps.push({ name: stepName, value: 30, checked: true, id: crypto.randomUUID() }) };
  displaySteps();
  saveSteps();
};

function updateSteps() {
  //steps.order = ??!?!
  steps.destination = document.getElementById("destination").value;
  steps.steps.forEach(step => {
    let value = Number.parseInt(document.getElementById(`${step.id}Time`).value);
    step.value = value;
    let checked = document.getElementById(`${step.id}Check`).checked;
    step.checked = checked;
    let name = document.getElementById(`${step.id}Name`).value;
    step.name = name;
  });
  steps.arriveeTime = document.getElementById("arriveeTime").value;
  steps.notes = document.getElementById("notes").value;
  saveSteps();
};
window.updateSteps = updateSteps;
// initializing();
// displaySteps();

function updateItemesIndex() {
  let itemes = Array.from(document.querySelectorAll(".sortable-List > .iteme"));
  for (let i = 0; i < itemes.length; i++) {
    itemes[i].dataset.index = i;
  };
}

function calculateTime(e) {
  updateSteps();
  let arriveeTime = document.getElementById('arriveeTime').valueAsDate;
  if (!arriveeTime) {
    document.getElementById("arriveeTimeDiv").classList.add("outlined");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() =>
        alert("When are you supposed to be there?"));
    })
  } else {
    document.getElementById("arriveeTimeDiv").classList.remove("outlined");
  };
  // console.log(arriveeTime.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }));
  let stepArray = steps.steps.filter((step) => {
    return step.checked;
  }).map((step, idx) => {
    if (step.name == "Travelling" || step.name == "Traveling") {
      return `<p>Départ: ${sumTimeSub(steps.steps, idx, arriveeTime)}</p>`;
    }
    else {
      return `<p>${step.name}: ${sumTimeSub(steps.steps, idx, arriveeTime)}</p>`;
    }
  });
  // console.log(stepArray);
  // <button id="capture-screenshot"
  // onclick="takeScreenshot();"><span class="material-symbols-outlined screenshotIcon">
  // screenshot_region
  // </span></button>
  let result = `
    <h2 id="finalDestination" style="text-align: center; margin: 0 0 .7em;">${document.getElementById("destination").value}</h2>
    <div style="padding: 0 10px; border: 2px solid;">
        <h3 style="margin: 5px 0; text-decoration: underline;">Schedule</h3>
        ${stepArray.join("")}
        <p>Arrivée: ${arriveeTime.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}</p>
        ${ifNotes()}
    </div>`;
  document.getElementById("scheduleTime").innerHTML = result;
  document.getElementById("scheduleTimeWhole").style.display = "flex";
  document.getElementById("timeForm").style.display = "none";
  document.getElementById("togglePlansWhole").classList.add("displayNone");
  document.getElementById("switchSliderWhole").style.display = "none";
  e.stopPropagation();
  document.getElementById("screen").classList.replace("displayNone", "clickScreen");
  document.getElementById("screen").addEventListener("click", clickHandler);
};
function ifNotes() {
  if (document.getElementById("notes").value) {
    return `<p style="margin-bottom: 5px;">Notes:</p>
    <div class="notesBorder">
        <p>${document.getElementById("notes").value.replace(/\n/g, '<br/>')}</p>
    </div>`;
  } else {
    return ``;
  };
}
function clickHandler() {
  document.getElementById("scheduleTimeWhole").style.display = "none";
  document.getElementById("timeForm").style.display = "block";
  document.getElementById("togglePlansWhole").classList.remove("displayNone");
  document.getElementById("switchSliderWhole").style.display = "block";
  document.getElementById("screen").classList.replace("clickScreen", "displayNone");
  document.getElementById("screen").removeEventListener("click", clickHandler);
};
function sumTimeSub(steps, stepIndex, arriveeTime) {
  let totalMin = 0;
  steps.filter((step) => {
    return step.checked;
  }).forEach((step, idx) => {
    if (idx >= stepIndex) {
      totalMin += step.value;
      // console.log(idx + " " + stepIndex + " " + totalMin + " " + step.value);
    }
  });
  let startTime = new Date();
  startTime.setTime(arriveeTime.getTime() - totalMin * 60 * 1000);
  return startTime.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
};

window.onload = () => {
  setTimeout(function() {
    document.getElementById("screen").classList.replace("blackScreen", "displayNone");
}, 1000);
  
};

const captureScreenshot = async () => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const screenshot = document.createElement("screenshot");

  try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia();
      screenshot.srcObject = captureStream;
      context.drawImage(screenshot, 0, 0, window.width, window.height);
      const frame = canvas.toDataURL("image/png");
      captureStream.getTracks().forEach(track => track.stop());
      window.location.href = frame;
  } catch (err) {
      console.error("Error: " + err);
  }
};
function takeScreenshot() {
  console.log("lala");
	var screenshot = document.documentElement
		.cloneNode(true);
	screenshot.style.pointerEvents = 'none';
	screenshot.style.overflow = 'hidden';
	screenshot.style.webkitUserSelect = 'none';
	screenshot.style.mozUserSelect = 'none';
	screenshot.style.msUserSelect = 'none';
	screenshot.style.oUserSelect = 'none';
	screenshot.style.userSelect = 'none';
	screenshot.dataset.scrollX = window.scrollX;
	screenshot.dataset.scrollY = window.scrollY;
	var blob = new Blob([screenshot.outerHTML], {
		type: 'text/html'
	});
	return blob;
}

function generate() {
	window.URL = window.URL || window.webkitURL;
	window.open(window.URL
		.createObjectURL(takeScreenshot()));
}
import { collection, getDocs, getDoc, query, where, deleteDoc, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { signInWithRedirect, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { auth, provider, db } from "./module.js";

// console.log(auth);
function logIn() {
  signInWithRedirect(auth, provider);
  document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
  document.getElementById("scheduleTime").innerHTML = ``;
}
window.logIn = logIn;
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(user);
    document.getElementById("displayName").innerText = " " + user.displayName + ",";
    document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
    document.getElementById("scheduleTime").innerHTML = ``;
    getPlans();
  } else {
    document.getElementById("displayName").innerText = "";
    document.getElementById("scheduleTimeWhole").classList.add("popupBackDG");
    document.getElementById("scheduleTime").innerHTML = `<h4><span class="h3like">First thing's first...</span><br/><span class="h1like" style="font-size: calc(19.53px + 0.19vw); font-weight: 900;">Who do you think you are?!</span></h4>
      <div class="stepBox">
        <button class="timeFormButton" onclick="window.logIn()">Log in</button>
      </div>`;
  }
});
// const querySnapshot = await getDocs(query(collection(db, "person"), where("lastName", "==", "gentile")));
// querySnapshot.forEach((doc) => {
//   console.log(doc.data());
// });
// TimePage
function getMaxPlans() {
  let max = -1;
  myScheduleList.forEach(plan => {
    max = max > plan.ordre ? max : plan.ordre;
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
        <button title="Cancel" id="saveOptCancel" class="timeFormButtonSmall" onclick="saveOptCancel()">Cancel</button>
      </div>
      <div class="saveOption">
        <p>Keep both but let’s rebaptized the new one...</p>
        <button title="Save as" id="saveOptSaveAs" class="timeFormButtonSmall" onclick="saveOptSaveAs()">Save as</button>
      </div>
      <div class="saveOption">
        <p>Out with the old, in with the new!</p>
        <button title="Replace" id="saveOptReplace" class="timeFormButtonSmall" onclick="window.saveOptReplace()">Replace</button>
      </div>`;
  } else {

    await setDoc(doc(db, "plan", auth.currentUser.email, "myPlans", destination), {
      ...steps,
      ordre: (getMaxPlans() + 1)
    });
    getPlans();
    document.getElementById("savePlan").innerHTML = `
  <h3 class="savePlanH3">You saved it!</h3>
  <p style="text-align:center;">Now, go see it in your schedules!</p>`;
    document.querySelector("#timePage").addEventListener("click", clickHandlerSaved);
  }
}
window.saveIt = saveIt;
function clickHandlerSaved() {
  document.getElementById("savePlan").innerHTML = ``;
  document.querySelector("#timePage").removeEventListener("click", clickHandlerSaved);
}

async function saveOptReplace() {
  let destination = document.getElementById("nameToSave").value;
  await updateDoc(doc(db, "plan", auth.currentUser.email, "myPlans", destination), {
    ...steps
  });
  document.getElementById("togglePlansWhole").classList.remove("displayNone");
  document.getElementById("timeForm").classList.remove("displayNone");
  document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
  document.getElementById("scheduleTime").innerHTML = ``;
  getPlans();
  document.getElementById("savePlan").innerHTML = `
  <h3 class="savePlanH3">You replaced it!</h3>
  <p style="text-align:center;">Now, go see it in your schedules!</p>`;
  document.querySelector("#timePage").addEventListener("click", clickHandlerSaved);
}
window.saveOptReplace = saveOptReplace;

async function getPlans() {
  const getPlans = await getDocs(collection(db, "plan", auth.currentUser.email, "myPlans"));
  // const getPlans = await getDocs(query(collection(db, "plan", auth.currentUser.email), where("owner", "==", auth.currentUser.email)));
  myScheduleList = [];
  getPlans.forEach(doc => {
    const namePlan = doc.id;
    const ordrePlan = doc.data().ordre;
    myScheduleList.push({ id: namePlan, ordre: ordrePlan });
  });
  if (localStorage.getItem("steps")) {
    steps = JSON.parse(localStorage.getItem("steps"));
    displaySteps();
    if (myScheduleList.length >= 1) {
      displayPlans();
    }
  } else if (myScheduleList.length >= 1) {
    displayPlans();
    getDefaultSchedule();
  } else {
    steps = {
      ordre: "",
      destination: "",
      steps: [
        { name: t("Cooking"), value: 30, checked: true, id: crypto.randomUUID() },
        { name: "Eating", value: 60, checked: true, id: crypto.randomUUID() },
        { name: "Toilet", value: 15, checked: true, id: crypto.randomUUID() },
        { name: "Shower", value: 15, checked: true, id: crypto.randomUUID() },
        { name: "Prepping", value: 30, checked: true, id: crypto.randomUUID() },
        { name: "Travelling", value: 0, checked: true, id: crypto.randomUUID() }
      ],
      arriveeTime: "",
      notes: ""
    };
    displaySteps();
  }

}
// getPlans();
async function getSchedule(id) {
  // const schedules = await getDocs(query(collection(db, "plan", auth.currentUser.email, id)));
  // schedules.forEach((schedule) => {
  //   steps = schedule.data();
  //   displaySteps();
  // })
  const schedule = await getDoc(doc(db, "plan", auth.currentUser.email, "myPlans", id));
  steps = schedule.data();
  displaySteps();
}
window.getSchedule = getSchedule;

async function getDefaultSchedule() {
  // const defaultSchedule = await getDocs(query(collection(db, "plan"), where("owner", "==", auth.currentUser.email), where("ordre", "==", 0)));
  // defaultSchedule.forEach((doc) => {
  //   steps = doc.data();
  // })
  const defaultSchedule = await getDocs(query(collection(db, "plan", auth.currentUser.email, "myPlans"), where("ordre", "==", 0)));
  defaultSchedule.forEach((doc) => {
    steps = doc.data();
  });
  displaySteps();
}
// getDefaultSchedule();
window.getDefaultSchedule = getDefaultSchedule;

async function trashSchedules() {
  console.log(trashedSchedules);
  for (const trashedSchedule of trashedSchedules) {
    await deleteDoc(doc(db, "plan", auth.currentUser.email, "myPlans", trashedSchedule.id));
  };
}
window.trashSchedules = trashSchedules;

async function orderSchedules() {
  for (const list of myScheduleList) {
    await updateDoc(doc(db, "plan", auth.currentUser.email, "myPlans", list.id), {
      ordre: list.ordre
    });
  }
}
window.orderSchedules = orderSchedules;

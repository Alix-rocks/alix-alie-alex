import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, signOut, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
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

const logInScreen = document.querySelector("#logInScreen");

function logIn(){
  signInWithRedirect(auth, provider);
};
let userConnected = false;
onAuthStateChanged(auth,(user) => {
  if(user){
    userConnected = true;
    console.log(user);
    getMyPrograms();
    logInScreen.classList.add("displayNone");
  } else{
    userConnected = false;
    logInScreen.classList.remove("displayNone");
    logInBtn.addEventListener("click", logIn);
    tryBtn.addEventListener("click", freeIn);
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

const colorsList = [
  "rgba(138, 43, 226, 1)",
  "green",
  "rgba(255, 0, 0, 1)"
];

let progNum = 1;
let allPrograms = [[{
      name: "Nom de la séquence"
    },{
      word: "Position",
      color: 0,
      time: 0
    },{
      word: "Hold",
      color: 1,
      time: 0
    },{
      word: "Pause",
      color: 2,
      time: 0
    },{
      word: "Hold",
      color: 1,
      time: 0
    },{
      word: "Pause",
      color: 2,
      time: 0
    },{
      word: "Hold",
      color: 1,
      time: 0
    }],[{
      name: "Strengthening"
    },{
      word: "Position",
      color: 0,
      time: 5
    },{
      word: "Hold",
      color: 1,
      time: 60
    },{
      word: "Pause",
      color: 2,
      time: 15
    },{
      word: "Hold",
      color: 1,
      time: 60
    },{
      word: "Pause",
      color: 2,
      time: 15
    },{
      word: "Hold",
      color: 1,
      time: 60
    }],[{
      name: "Stretching"
    },{
      word: "Position",
      color: 0,
      time: 5
    },{
      word: "Stretch",
      color: 1,
      time: 25
    },{
      word: "Pause",
      color: 2,
      time: 8
    },{
      word: "Stretch",
      color: 1,
      time: 25
    },{
      word: "Pause",
      color: 2,
      time: 8
    },{
      word: "Stretch",
      color: 1,
      time: 25
    }],[{
      name: "Demo"
    },{
      word: "Position",
      color: 0,
      time: 3
    },{
      word: "Test",
      color: 1,
      time: 6
    },{
      word: "Pause",
      color: 2,
      time: 3
    },{
      word: "Test",
      color: 1,
      time: 6
    },{
      word: "Pause",
      color: 2,
      time: 3
    },{
      word: "Test",
      color: 1,
      time: 6
    }
  ]
];
localStorage.allPrograms = JSON.stringify(allPrograms);

async function getMyPrograms() {
  const getMyPrograms = await getDoc(doc(db, "chrono", auth.currentUser.email));
  if(localStorage.getItem("allPrograms")){
    allPrograms = JSON.parse(localStorage.allPrograms);
  } else if(getMyPrograms.exists() && getMyPrograms.data().allPrograms){
    allPrograms = getMyPrograms.data().allPrograms;
  } else{
    allPrograms = allPrograms;
  };
  localStorage.setItem("allPrograms", JSON.stringify(allPrograms));
  //localStorage.allPrograms = JSON.stringify(allPrograms);
  showProgram();
};

function freeIn(){ 
  if(localStorage.getItem("allPrograms")){
    allPrograms = JSON.parse(localStorage.allPrograms);
  } else{
    localStorage.setItem("allPrograms", JSON.stringify(allPrograms));
  };
  showProgram();
  logInScreen.classList.add("displayNone");
};

// *** CLOUDSAVE

async function saveToCloud(){
  const docRef = doc(db, "chrono", auth.currentUser.email);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(doc(db, "chrono", auth.currentUser.email), {
      ...allPrograms
    });
  } else{
   await setDoc(doc(db, "chrono", auth.currentUser.email), {
      ...allPrograms
    });
  };
};


// The browser will limit the number of concurrent audio contexts
// So be sure to re-use them whenever you can
const myAudioContext = new AudioContext();

/**
 * Helper function to emit a beep sound in the browser using the Web Audio API.
 * 
 * @param {number} duration - The duration of the beep sound in milliseconds.
 * @param {number} frequency - The frequency of the beep sound.
 * @param {number} volume - The volume of the beep sound.
 * 
 * @returns {Promise} - A promise that resolves when the beep sound is finished.
 */

const timeShow = document.querySelector("#timeShow");
const timeShowZone = document.querySelector("#timeShowZone");
function turnGreen(duration){
  timeShowZone.style.backgroundColor = "";
  timeShow.animate([{width: "0"},{width: "250px"}], duration);
};
function turnBlueViolet(duration){
  timeShowZone.style.backgroundColor = "rgba(138, 43, 226, 1)";
  timeShowZone.animate([{backgroundColor: "rgba(138, 43, 226, 1)"},{backgroundColor: "rgba(138, 43, 226, 0)"}], duration);
};
function turnRed(duration){
  timeShowZone.style.backgroundColor = "rgba(255, 0, 0, 1)";
  timeShowZone.animate([{backgroundColor: "rgba(255, 0, 0, 1)"},{backgroundColor: "rgba(255, 0, 0, 0)"}], duration);
};
//const delaysDefault = [5, 20, 8, 20, 8, 20];
const delaysDefault = [3, 8, 3, 8, 3, 8];



function showProgram(){
  document.querySelector("#seqName").innerHTML = `${allPrograms[progNum][0].name}<button onclick="modifyProgram(${progNum})" style="border:none;"><i class="fa-solid fa-pen" style="margin-left: 16px;font-size: .75em;"></i></button`;
  document.querySelector(".allTimeDiv").innerHTML = allPrograms[progNum].map((step, idx) => {
    if(idx !== 0){
      return `<div style="color:${colorsList[step.color]};">
        <h3>${step.word}</h3>
        <p>${step.time}</p>
      </div>`;
    };
  }).join("");
};

function modifyProgram(progIdx){
  showModifiableProgram(progIdx);
};
window.modifyProgram = modifyProgram;

function showModifiableProgram(progIdx){
  
  let addingStep = allPrograms[progIdx].map((step, idx) => {
    if(idx !== 0){
      // let timeOptions = [];
      //   for (let i = 0; i < 61; i++) {
      //     timeOptions.push(`<option value="${i}"${i == step.time ? " selected" : ""}>${i}</option>`);
      //   };
      //   timeOptions = timeOptions.join("");
      let colorOptions = colorsList.map((col, idx) => {
        return `<option value="${idx}" style="color:${col};"${step.color == idx ? " selected" : ""}>&#xf53f;</option>`;
      }).join("");
      return `<div class="stepDivClass" style="color:${colorsList[step.color]};">
      <input type="text" class="stepNameInput" value="${step.word}"></input>
      
      <input type="time" class="delaySelect" value="${step.time}" />
      <select class="colorSelect">
        ${colorOptions}
      </select>
    </div>`;
    }
  }).join("");
//<select class="delaySelect">${timeOptions}</select>
  document.querySelector("#seqName").innerHTML = `<input id="seqNameInput" type="text" placeholder="Nom de la séquence"${progIdx !== 0 ? ` value="${allPrograms[progIdx][0].name}"` : ``}></input>
  ${progIdx !== 0 ? `<button onclick="replaceProgram(${progIdx})" style="border:none;"><i class="fa-regular fa-floppy-disk" style="margin-left: 16px;"></i></button>` : ``}`;
  document.querySelector(".allTimeDiv").innerHTML = addingStep;
};

function replaceProgram(progIdx){ //The program already exists but we're changing it, so basically, we replace the old one with this new one, so we need to make sure we're using the same index
  let newProgram = [];
  let name = {
    name: document.querySelector("#seqNameInput").value
  };
  newProgram.push(name);
  document.querySelectorAll(".allTimeDiv > div").forEach(step => {
    let newStep = {
      word: step.querySelector(".stepNameInput").value,
      time: step.querySelector(".delaySelect").value,
      color: step.querySelector(".colorSelect").value
    };
    newProgram.push(newStep);
  });
  allPrograms[progIdx] = newProgram;
  progNum = progIdx;
  showProgram();
  localStorage.allPrograms = JSON.stringify(allPrograms);
  console.log(allPrograms);
};

window.replaceProgram = replaceProgram;


document.querySelector("#moveUpBtn").addEventListener("click", () => {
  progNum = progNum == allPrograms.length - 1 ? 1 : progNum + 1;
  backToStart();
  showProgram();
});
document.querySelector("#moveDnBtn").addEventListener("click", () => {
  progNum = progNum == 1 ? allPrograms.length - 1 : progNum - 1;
  backToStart();
  showProgram();
});

const addOneBtn = document.querySelector("#addOneBtn");
addOneBtn.addEventListener("click", createNew);

function createNew() { // le + se transforme en checkmark et quand on click sur celui-là, ça enregistre
  addOneBtn.innerHTML = `<i class="fa-regular fa-floppy-disk" style="text-shadow: none;"></i>`;
  // progNum = allPrograms.length;
  backToStart(); //or just: document.querySelector("#chronoMe").blur(); NOT JUST BLUR, WE NEED TO DEACTIVATE IT! because Start just won't work because it's not about the number in the selects anymore, it's about the number in the array! So before the btn start can be activated, we have to had the number added to the array.
  
  showModifiableProgram(0);
  
  addOneBtn.removeEventListener("click", createNew);
  addOneBtn.addEventListener("click", saveNreset);
};

function saveNreset() {
  console.log("yay");
  let newProgram = [];
  let name = {
    name: document.querySelector("#seqNameInput").value
  };
  newProgram.push(name);
  document.querySelectorAll(".allTimeDiv > div").forEach(step => {
    let newStep = {
      word: step.querySelector(".stepNameInput").value,
      time: step.querySelector(".delaySelect").value,
      color: step.querySelector(".colorSelect").value
    };
    newProgram.push(newStep);
  });
  allPrograms.push(newProgram);
  localStorage.allPrograms = JSON.stringify(allPrograms);
  progNum = allPrograms.length - 1;
  console.log(allPrograms);
  showProgram();
  
  addOneBtn.innerHTML = `<i class="fa-solid fa-plus"></i>`;
  addOneBtn.removeEventListener("click", saveNreset);
  addOneBtn.addEventListener("click", createNew);
};


function beep(duration, frequency, volume){
    return new Promise((resolve, reject) => {
        // Set default duration if not provided
        duration = duration || 200;
        frequency = frequency || 440;
        volume = volume || 5;

        try{
            let oscillatorNode = myAudioContext.createOscillator();
            let gainNode = myAudioContext.createGain();
            oscillatorNode.connect(gainNode);

            // Set the oscillator frequency in hertz
            oscillatorNode.frequency.value = frequency;

            // Set the type of oscillator
            oscillatorNode.type= "square";
            gainNode.connect(myAudioContext.destination);

            // Set the gain to the volume
            gainNode.gain.value = volume * 0.01;

            // Start audio with the desired duration
            oscillatorNode.start(myAudioContext.currentTime);
            
            oscillatorNode.stop(myAudioContext.currentTime + duration * 0.001);

            // Resolve the promise when the sound is finished
            oscillatorNode.onended = () => {
                resolve();
            };
        }catch(error){
            reject(error);
        };
    });
};

function activateDiv(divIdx){
  let allDivs = Array.from(document.querySelectorAll(".allTimeDiv > div"));
  allDivs.forEach((div, idx) => {
    if(divIdx == idx){
      div.classList.add("activated");
      if(divIdx > 0){
        allDivs[divIdx - 1].classList.remove("activated");
        allDivs[divIdx - 1].classList.add("done");
      };
      document.querySelector("#order").style.color = allPrograms[progNum][divIdx + 1].color;
      document.querySelector("#order").innerText = allPrograms[progNum][divIdx + 1].word;
    } else if(divIdx == allDivs.length){
      allDivs[divIdx - 1].classList.remove("activated");
      allDivs[divIdx - 1].classList.add("done");
      document.querySelector("#order").style.color = allPrograms[progNum][1].color;
      document.querySelector("#order").innerText = "C'est fini !!!";
    };
  });
};

function backToStart(){
  document.querySelector("#chronoMe").blur();
  document.querySelectorAll(".allTimeDiv > div").forEach(div => {
    div.classList.remove("activated", "done");
  });
};

function turnIntoMS(time){
  return Number(time.split(':')[0]) * 3600000 + Number(time.split(':')[1]) * 60000;
};

document.querySelector("#chronoMe").addEventListener("click", () => {
  //console.log(allPrograms[progNum]);
  let delay0 = turnIntoMS(allPrograms[progNum][1].time); 
  let delay1 = turnIntoMS(allPrograms[progNum][2].time);
  let delay2 = turnIntoMS(allPrograms[progNum][3].time);
  let delay3 = turnIntoMS(allPrograms[progNum][4].time);
  let delay4 = turnIntoMS(allPrograms[progNum][5].time);
  let delay5 = turnIntoMS(allPrograms[progNum][6].time);
  // let delay1 = allPrograms[progNum][2].time * 1000;
  // let delay2 = allPrograms[progNum][3].time * 1000;
  // let delay3 = allPrograms[progNum][4].time * 1000;
  // let delay4 = allPrograms[progNum][5].time * 1000;
  // let delay5 = allPrograms[progNum][6].time * 1000;
  // beep(200, 440, 100);
  Promise.resolve()
.then(() => {turnBlueViolet(delay0); beep(); activateDiv(0);})
.then(() => delay(delay0))
.then(() => {turnGreen(delay1); beep(200, 870); activateDiv(1);})
.then(() => delay(delay1))
.then(() => {turnRed(delay2); beep(); activateDiv(2);})
.then(() => delay(delay2))
.then(() => {turnGreen(delay3); beep(200, 870); activateDiv(3);})
.then(() => delay(delay3))
.then(() => {turnRed(delay4); beep(); activateDiv(4);})
.then(() => delay(delay4))
.then(() => {turnGreen(delay5); beep(200, 870); activateDiv(5);})
.then(() => delay(delay5))
.then(() => {turnBlueViolet(); beep(600); activateDiv(6); backToStart();});
});

// Simple beep
// beep(
//   // Set the duration to 0.2 second (200 milliseconds)
//   200,
//   // Set the frequency of the note to A4 (440 Hz)
//   440,
//   // Set the volume of the beep to 100%
//   100
// );

function delay(duration) {
  return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, duration);
  });
};

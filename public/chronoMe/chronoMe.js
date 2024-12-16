import { app, analytics, db, auth, provider, getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp, getAuth, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "../../myFirebase.js";
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
      time: "00:00:00"
    },{
      word: "Hold",
      color: 1,
      time: "00:00:00"
    },{
      word: "Pause",
      color: 2,
      time: "00:00:00"
    },{
      word: "Hold",
      color: 1,
      time: "00:00:00"
    },{
      word: "Pause",
      color: 2,
      time: "00:00:00"
    },{
      word: "Hold",
      color: 1,
      time: "00:00:00"
    }],[{
      name: "Screen"
    },{
      word: "Position",
      color: 0,
      time: "00:00:05"
    },{
      word: "Screen",
      color: 1,
      time: "00:20:00"
    },{
      word: "Pause",
      color: 2,
      time: "00:00:20"
    },{
      word: "Screen",
      color: 1,
      time: "00:20:00"
    },{
      word: "Pause",
      color: 2,
      time: "00:00:20"
    },{
      word: "Screen",
      color: 1,
      time: "00:20:00"
    }],[{
      name: "Strengthening"
    },{
      word: "Position",
      color: 0,
      time: "00:00:05"
    },{
      word: "Hold",
      color: 1,
      time: "00:01:00"
    },{
      word: "Pause",
      color: 2,
      time: "00:00:15"
    },{
      word: "Hold",
      color: 1,
      time: "00:01:00"
    },{
      word: "Pause",
      color: 2,
      time: "00:00:15"
    },{
      word: "Hold",
      color: 1,
      time: "00:01:00"
    }],[{
      name: "Stretching"
    },{
      word: "Position",
      color: 0,
      time: "00:00:05"
    },{
      word: "Stretch",
      color: 1,
      time: "00:00:25"
    },{
      word: "Pause",
      color: 2,
      time: "00:00:08"
    },{
      word: "Stretch",
      color: 1,
      time: "00:00:25"
    },{
      word: "Pause",
      color: 2,
      time: "00:00:08"
    },{
      word: "Stretch",
      color: 1,
      time: "00:00:25"
    }],[{
      name: "Double Stretching"
    },{
      word: "Position",
      color: 0,
      time: "00:00:05"
    },{
      word: "Stretch 1",
      color: 1,
      time: "00:00:30"
    },{
      word: "Stretch 2",
      color: 2,
      time: "00:00:30"
    },{
      word: "Stretch 1",
      color: 1,
      time: "00:00:30"
    },{
      word: "Stretch 2",
      color: 2,
      time: "00:00:30"
    },{
      word: "Stretch 1",
      color: 1,
      time: "00:00:30"
    }],[{
      name: "Demo"
    },{
      word: "Position",
      color: 0,
      time: "00:00:03"
    },{
      word: "Test",
      color: 1,
      time: "00:00:06"
    },{
      word: "Pause",
      color: 2,
      time: "00:00:03"
    },{
      word: "Test",
      color: 1,
      time: "00:00:06"
    },{
      word: "Pause",
      color: 2,
      time: "00:00:03"
    },{
      word: "Test",
      color: 1,
      time: "00:00:06"
    }
  ]
];
let allPrograms2 = [
  {
    name: "Demo",
    sequence: [{
        word: "Position",
        color: 0,
        noteD: 200,
        noteF: 440,
        noteV: 8,
        delai: "00:00:03",
        numDiv: 0
      },{
        word: "Test",
        color: 1,
        noteD: 200,
        noteF: 870,
        noteV: 8,
        delai: "00:00:04",
        numDiv: 1
      },{
        word: "Pause",
        color: 2,
        noteD: 200,
        noteF: 440,
        noteV: 8,
        delai: "00:00:03",
        numDiv: 2
      },{
        word: "Test",
        color: 1,
        noteD: 200,
        noteF: 870,
        noteV: 8,
        delai: "00:00:04",
        numDiv: 3
      },{
        word: "Pause",
        color: 2,
        noteD: 200,
        noteF: 440,
        noteV: 8,
        delai: "00:00:03",
        numDiv: 4
      },{
        word: "Test",
        color: 1,
        noteD: 200,
        noteF: 870,
        noteV: 8,
        delai: "00:00:04",
        numDiv: 5
      }
    ]
  }
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
const allTimeDiv = document.querySelector(".allTimeDiv");



function showProgram(){
  allTimeDiv.classList.remove("modifyingDiv");
  document.querySelector("#seqName").innerHTML = `${allPrograms[progNum][0].name}<button onclick="modifyProgram(${progNum})" style="border:none;"><i class="fa-solid fa-pen" style="margin-left: 16px;font-size: 1em;color: var(--tx-color);translate: 0 -3px;"></i></button`;
  allTimeDiv.innerHTML = allPrograms[progNum].map((step, idx) => {
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
      
      <input type="time" step="1" class="delaySelect" value="${step.time}" />
      <select class="colorSelect">
        ${colorOptions}
      </select>
    </div>`;
    }
  }).join("");
//<select class="delaySelect">${timeOptions}</select>
  document.querySelector("#seqName").innerHTML = `<input id="seqNameInput" type="text" placeholder="Nom de la séquence"${progIdx !== 0 ? ` value="${allPrograms[progIdx][0].name}"` : ``}></input>
  ${progIdx !== 0 ? `<button onclick="replaceProgram(${progIdx})" style="border:none;"><i class="fa-regular fa-floppy-disk" style="margin-left: 16px;"></i></button>` : ``}`;
  allTimeDiv.innerHTML = addingStep;
  allTimeDiv.classList.add("modifyingDiv");
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
  saveToCloud();
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
  saveToCloud();
  addOneBtn.innerHTML = `<i class="fa-solid fa-plus"></i>`;
  addOneBtn.removeEventListener("click", saveNreset);
  addOneBtn.addEventListener("click", createNew);
};


function beep(duration, frequency, volume){
    return new Promise((resolve, reject) => {
        // Set default duration if not provided
        duration = duration || 200;
        frequency = frequency || 440;
        volume = volume || 8;

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
      let time = allPrograms[progNum][divIdx + 1].time;
      let lastingTtimeH = time.split(':')[0];
      lastingTtimeH = lastingTtimeH.startsWith("0") ? lastingTtimeH == "00" ? null : lastingTtimeH.slice(1) : lastingTtimeH;
      let lastingTtimeM = time.split(':')[1];
      lastingTtimeM = lastingTtimeM.startsWith("0") ? lastingTtimeH ? lastingTtimeM == "00" ? "00" : lastingTtimeM : lastingTtimeM == "00" ? null : lastingTtimeM.slice(1) : lastingTtimeM;
      let lastingTtimeS = time.split(':')[2];
      lastingTtimeS = lastingTtimeS.startsWith("0") ? lastingTtimeM ? lastingTtimeS == "00" ? null : lastingTtimeS : lastingTtimeS.slice(1) : lastingTtimeS;
      document.querySelector("#order").style.color =colorsList[allPrograms[progNum][divIdx + 1].color];
      document.querySelector("#order").innerHTML = `${allPrograms[progNum][divIdx + 1].word} <span class="lastingTime">(${lastingTtimeH ? lastingTtimeH + "h" : ""}${lastingTtimeM ? lastingTtimeH ? " " + lastingTtimeM + "m" : lastingTtimeM + "m" : ""}${lastingTtimeS ? lastingTtimeM ? " " + lastingTtimeS + "s" : lastingTtimeS + "s" : ""})</span>`;
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
  return Number(time.split(':')[0]) * 3600000 + Number(time.split(':')[1]) * 60000 + Number(time.split(":")[2]) * 1000;
};

const actions = [
  async () => {turnBlueViolet(turnIntoMS(allPrograms[progNum][1].time)); beep(); activateDiv(0); await delay(turnIntoMS(allPrograms[progNum][1].time))},
  async () => {turnGreen(turnIntoMS(allPrograms[progNum][2].time)); beep(200, 870); activateDiv(1); await delay(turnIntoMS(allPrograms[progNum][2].time))}, 
  async () => {turnRed(turnIntoMS(allPrograms[progNum][3].time)); beep(); activateDiv(2); await delay(turnIntoMS(allPrograms[progNum][3].time))}, 
  async () => {turnGreen(turnIntoMS(allPrograms[progNum][4].time)); beep(200, 870); activateDiv(3); await delay(turnIntoMS(allPrograms[progNum][4].time))}, 
  async () => {turnRed(turnIntoMS(allPrograms[progNum][5].time)); beep(); activateDiv(4); await delay(turnIntoMS(allPrograms[progNum][5].time))}, 
  async () => {turnGreen(turnIntoMS(allPrograms[progNum][6].time)); beep(200, 870); activateDiv(5); await delay(turnIntoMS(allPrograms[progNum][6].time))}, 
  async () => {turnBlueViolet(); beep(600); activateDiv(6);  await delay(0)}
];


async function executionEtape(etape){
  const {color, noteD, noteF, noteV, delai, numDiv} = etape;
  if (color == 0){
    turnBlueViolet(turnIntoMS(delai));
  } else if(color == 1){
    turnGreen(turnIntoMS(delai));
  } else if(color == 2){
    turnRed(turnIntoMS(delai));
  };
  beep(noteD, noteF, noteV);
  activateDiv(numDiv);
  await delay(turnIntoMS(delai));
};

document.querySelector("#chronoMe").addEventListener("click", () => {
  progNum = 0;
  //console.log(allPrograms[progNum]);
  // let result = Promise.resolve();
  // actions.forEach(function (promiseLike) {
  //   result = result.then(promiseLike);
  // });
  // backToStart();
  // return result;
  let result = Promise.resolve();
  console.log(allPrograms2[progNum].sequence);
  allPrograms2[progNum].sequence.forEach(function (parametre) {
    result = result.then(executionEtape(parametre));
  });
  turnBlueViolet(); 
  beep(600); 
  activateDiv(allPrograms2[progNum].sequence.length);
  backToStart();
  return result;
  // actions.map(async (a) => {
  //   let x = await a();
  // });
  // let delay0 = turnIntoMS(allPrograms[progNum][1].time); 
  // let delay1 = turnIntoMS(allPrograms[progNum][2].time);
  // let delay2 = turnIntoMS(allPrograms[progNum][3].time);
  // let delay3 = turnIntoMS(allPrograms[progNum][4].time);
  // let delay4 = turnIntoMS(allPrograms[progNum][5].time);
  // let delay5 = turnIntoMS(allPrograms[progNum][6].time);
//   Promise.resolve()
// .then(() => {turnBlueViolet(delay0); beep(); activateDiv(0);})
// .then(() => delay(delay0))
// .then(() => {turnGreen(delay1); beep(200, 870); activateDiv(1);})
// .then(() => delay(delay1))
// .then(() => {turnRed(delay2); beep(); activateDiv(2);})
// .then(() => delay(delay2))
// .then(() => {turnGreen(delay3); beep(200, 870); activateDiv(3);})
// .then(() => delay(delay3))
// .then(() => {turnRed(delay4); beep(); activateDiv(4);})
// .then(() => delay(delay4))
// .then(() => {turnGreen(delay5); beep(200, 870); activateDiv(5);})
// .then(() => delay(delay5))
// .then(() => {turnBlueViolet(); beep(600); activateDiv(6); backToStart();});
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
  console.log(duration);
  return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, duration);
  });
};

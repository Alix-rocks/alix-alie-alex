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
let allPrograms = [{
  name: "Nom de la séquence",
  sequence: [{
    word: "Position",
    color: 0,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:00",
    numDiv: 0
  },{
    word: "Hold",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:00",
    numDiv: 1
  },{
    word: "Pause",
    color: 2,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:00",
    numDiv: 2
  },{
    word: "Hold",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:00",
    numDiv: 3
  },{
    word: "Pause",
    color: 2,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:00",
    numDiv: 4
  },{
    word: "Hold",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:00",
    numDiv: 5
  }]
},{
  name: "Screen",
  sequence: [{
    word: "Position",
    color: 0,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:05",
    numDiv: 0
  },{
    word: "Screen",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:20:00",
    numDiv: 1
  },{
    word: "Pause",
    color: 2,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:20",
    numDiv: 2
  },{
    word: "Screen",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:20:00",
    numDiv: 3
  },{
    word: "Pause",
    color: 2,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:20",
    numDiv: 4
  },{
    word: "Screen",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:20:00",
    numDiv: 5
  }]
},{
  name: "Strengthening",
  sequence: [{
    word: "Position",
    color: 0,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:05",
    numDiv: 0
  },{
    word: "Hold",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:01:00",
    numDiv: 1
  },{
    word: "Pause",
    color: 2,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:15",
    numDiv: 2
  },{
    word: "Hold",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:01:00",
    numDiv: 3
  },{
    word: "Pause",
    color: 2,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:15",
    numDiv: 4
  },{
    word: "Hold",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:01:00",
    numDiv: 5
  }]
},{
  name: "Stretching",
  sequence: [{
    word: "Position",
    color: 0,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:05",
    numDiv: 0
  },{
    word: "Stretch",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:25",
    numDiv: 1
  },{
    word: "Pause",
    color: 2,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:08",
    numDiv: 2
  },{
    word: "Stretch",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:25",
    numDiv: 3
  },{
    word: "Pause",
    color: 2,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:08",
    numDiv: 4
  },{
    word: "Stretch",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:25",
    numDiv: 5
  }]
},{
  name: "Double Stretching",
  sequence: [{
    word: "Position",
    color: 0,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:05",
    numDiv: 0
  },{
    word: "Stretch 1",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:30",
    numDiv: 1
  },{
    word: "Stretch 2",
    color: 2,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:30",
    numDiv: 2
  },{
    word: "Stretch 1",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:30",
    numDiv: 3
  },{
    word: "Stretch 2",
    color: 2,
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:30",
    numDiv: 4
  },{
    word: "Stretch 1",
    color: 1,
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:30",
    numDiv: 5
  }]
},{
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
  }]
}];
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
  document.querySelector("#seqName").innerHTML = `${allPrograms[progNum].name}<button onclick="modifyProgram(${progNum})" style="border:none;"><i class="fa-solid fa-pen" style="margin-left: 16px;font-size: 1em;color: var(--tx-color);translate: 0 -3px;"></i></button`;
  allTimeDiv.innerHTML = allPrograms[progNum].sequence.map((step, idx) => {
    return `<div style="color:${colorsList[step.color]};">
      <h3>${step.word}</h3>
      <p>${step.delai}</p>
    </div>`;
  }).join("");
};

function modifyProgram(progIdx){
  showModifiableProgram(progIdx);
};
window.modifyProgram = modifyProgram;

function showModifiableProgram(progIdx){
  
  let addingStep = allPrograms[progIdx].sequence.map((step, idx) => {
    let colorOptions = colorsList.map((col, idx) => {
      return `<option value="${idx}" style="color:${col};"${step.color == idx ? " selected" : ""}>&#xf53f;</option>`;
    }).join("");
    return `<div class="stepDivClass" style="color:${colorsList[step.color]};">
    <input type="text" class="stepNameInput" value="${step.word}"></input>
    
    <input type="time" step="1" class="delaySelect" value="${step.delai}" />
    <select class="colorSelect">
      ${colorOptions}
    </select>
  </div>`;
  }).join("");
//<select class="delaySelect">${timeOptions}</select>
  document.querySelector("#seqName").innerHTML = `<input id="seqNameInput" type="text" placeholder="Nom de la séquence"${progIdx !== 0 ? ` value="${allPrograms[progIdx].name}"` : ``}></input>
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
      delai: step.querySelector(".delaySelect").value,
      color: step.querySelector(".colorSelect").value
    };//Gotta add the beep!!!
    newProgram.push(newStep);
  });
  allPrograms[progIdx].sequence = newProgram;
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
      delai: step.querySelector(".delaySelect").value,
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
  console.log(divIdx);
  let allDivs = Array.from(document.querySelectorAll(".allTimeDiv > div"));
  allDivs.forEach((div, idx) => {
    if(divIdx == idx){
      div.classList.add("activated");
      if(divIdx > 0){
        allDivs[divIdx - 1].classList.remove("activated");
        allDivs[divIdx - 1].classList.add("done");
      };
      let delai = allPrograms[progNum].sequence[divIdx].delai;
      let lastingTtimeH = delai.split(':')[0];
      lastingTtimeH = lastingTtimeH.startsWith("0") ? lastingTtimeH == "00" ? null : lastingTtimeH.slice(1) : lastingTtimeH;
      let lastingTtimeM = delai.split(':')[1];
      lastingTtimeM = lastingTtimeM.startsWith("0") ? lastingTtimeH ? lastingTtimeM == "00" ? "00" : lastingTtimeM : lastingTtimeM == "00" ? null : lastingTtimeM.slice(1) : lastingTtimeM;
      let lastingTtimeS = delai.split(':')[2];
      lastingTtimeS = lastingTtimeS.startsWith("0") ? lastingTtimeM ? lastingTtimeS == "00" ? null : lastingTtimeS : lastingTtimeS.slice(1) : lastingTtimeS;
      document.querySelector("#order").style.color =colorsList[allPrograms[progNum].sequence[divIdx].color];
      document.querySelector("#order").innerHTML = `${allPrograms[progNum].sequence[divIdx].word} <span class="lastingTime">(${lastingTtimeH ? lastingTtimeH + "h" : ""}${lastingTtimeM ? lastingTtimeH ? " " + lastingTtimeM + "m" : lastingTtimeM + "m" : ""}${lastingTtimeS ? lastingTtimeM ? " " + lastingTtimeS + "s" : lastingTtimeS + "s" : ""})</span>`;
    } else if(divIdx == allDivs.length){
      allDivs[divIdx - 1].classList.remove("activated");
      allDivs[divIdx - 1].classList.add("done");
      document.querySelector("#order").style.color = colorsList[allPrograms[progNum].sequence[0].color];
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

function turnIntoMS(delai){
  return Number(delai.split(':')[0]) * 3600000 + Number(delai.split(':')[1]) * 60000 + Number(delai.split(":")[2]) * 1000;
};


document.querySelector("#chronoMe").addEventListener("click", () => {
  let result = Promise.resolve();
  allPrograms[progNum].sequence.forEach(function (parametre) {
    result = result.then(async () => {
      const {color, noteD, noteF, noteV, delai, numDiv} = parametre;
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
    });
  });
  result = result.then(() => {
    turnBlueViolet(); 
    beep(600); 
    activateDiv(allPrograms[progNum].sequence.length);
    backToStart();
  });;
  
  return result;

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

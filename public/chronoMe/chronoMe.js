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

const colorsList = [{
  id: "purple",
  name: "Purple",
  colorCode: "rgba(138, 43, 226, 1)",
  colorCodeZero: "rgba(138, 43, 226, 0)"
},{
  id: "green",
  name: "Green",
  colorCode: "rgba(0, 128, 0, 1)",
  colorCodeZero: "rgba(0, 128, 0, 0)"
},{
  id: "red",
  name: "Red",
  colorCode: "rgba(255, 0, 0, 1)",
  colorCodeZero: "rgba(255, 0, 0, 0)"
}];

const beepList = [{
  id: "sl",
  name: "Short & Low",
  noteD: 200,
  noteF: 440,
  noteV: 8,
},{
  id: "sh",
  name: "Short & High",
  noteD: 200,
  noteF: 870,
  noteV: 8,
},{
  id: "ll",
  name: "Long & Low",
  noteD: 600,
  noteF: 440,
  noteV: 8,
},{
  id: "lh",
  name: "Long & High",
  noteD: 600,
  noteF: 870,
  noteV: 8,
}];

const animationList = [{
  id: "fill",
  name: "Filling up"
},{
  id: "blur",
  name: "Blurring out"
}];

let showedProgramId = "";
let allPrograms = [{
  id: "0",
  name: "Nom de la séquence",
  sequence: [{
    word: "Position",
    animation: "blur", // fill or blur
    color: "purple",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:00",
    numDiv: 0
  },{
    word: "Hold",
    animation: "fill",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:00",
    numDiv: 1
  },{
    word: "Pause",
    animation: "blur",
    color: "red",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:00",
    numDiv: 2
  },{
    word: "Hold",
    animation: "fill",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:00",
    numDiv: 3
  },{
    word: "Pause",
    animation: "blur",
    color: "red",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:00",
    numDiv: 4
  },{
    word: "Hold",
    animation: "fill",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:00",
    numDiv: 5
  }]
},{
  id: "1",
  name: "Screen",
  sequence: [{
    word: "Position",
    color: "purple",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:05",
    numDiv: 0
  },{
    word: "Screen",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:20:00",
    numDiv: 1
  },{
    word: "Pause",
    color: "red",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:20",
    numDiv: 2
  },{
    word: "Screen",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:20:00",
    numDiv: 3
  },{
    word: "Pause",
    color: "red",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:20",
    numDiv: 4
  },{
    word: "Screen",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:20:00",
    numDiv: 5
  }]
},{
  id: "2",
  name: "Strengthening",
  sequence: [{
    word: "Position",
    color: "purple",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:05",
    numDiv: 0
  },{
    word: "Hold",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:01:00",
    numDiv: 1
  },{
    word: "Pause",
    color: "red",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:15",
    numDiv: 2
  },{
    word: "Hold",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:01:00",
    numDiv: 3
  },{
    word: "Pause",
    color: "red",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:15",
    numDiv: 4
  },{
    word: "Hold",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:01:00",
    numDiv: 5
  }]
},{
  id: "3",
  name: "Stretching",
  sequence: [{
    word: "Position",
    color: "purple",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:05",
    numDiv: 0
  },{
    word: "Stretch",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:25",
    numDiv: 1
  },{
    word: "Pause",
    color: "red",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:08",
    numDiv: 2
  },{
    word: "Stretch",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:25",
    numDiv: 3
  },{
    word: "Pause",
    color: "red",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:08",
    numDiv: 4
  },{
    word: "Stretch",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:25",
    numDiv: 5
  }]
},{
  id: "4",
  name: "Double Stretching",
  sequence: [{
    word: "Position",
    color: "purple",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:05",
    numDiv: 0
  },{
    word: "Stretch 1",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:30",
    numDiv: 1
  },{
    word: "Stretch 2",
    color: "red",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:30",
    numDiv: 2
  },{
    word: "Stretch 1",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:30",
    numDiv: 3
  },{
    word: "Stretch 2",
    color: "red",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:30",
    numDiv: 4
  },{
    word: "Stretch 1",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:30",
    numDiv: 5
  }]
},{
  id: "5",
  name: "Demo",
  sequence: [{
    word: "Position",
    animation: "blur",
    color: "purple",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:03",
    numDiv: 0
  },{
    word: "Test",
    animation: "fill",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:04",
    numDiv: 1
  },{
    word: "Pause",
    animation: "blur",
    color: "red",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:03",
    numDiv: 2
  },{
    word: "Test",
    animation: "fill",
    color: "green",
    beep: "sh",
    noteD: 200,
    noteF: 870,
    noteV: 8,
    delai: "00:00:04",
    numDiv: 3
  },{
    word: "Pause",
    animation: "blur",
    color: "red",
    beep: "sl",
    noteD: 200,
    noteF: 440,
    noteV: 8,
    delai: "00:00:03",
    numDiv: 4
  },{
    word: "Test",
    animation: "fill",
    color: "green",
    beep: "sh",
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
  if(getMyPrograms.exists() && getMyPrograms.data().allPrograms){
    allPrograms = getMyPrograms.data().allPrograms;
  } else if(localStorage.getItem("allPrograms")){
    allPrograms = JSON.parse(localStorage.allPrograms);
  } else{
    allPrograms = allPrograms;
  };
  localStorage.setItem("allPrograms", JSON.stringify(allPrograms));
  //localStorage.allPrograms = JSON.stringify(allPrograms);
  showProgramFromIdx(1);
};

function freeIn(){ 
  if(localStorage.getItem("allPrograms")){
    allPrograms = JSON.parse(localStorage.allPrograms);
  } else{
    localStorage.setItem("allPrograms", JSON.stringify(allPrograms));
  };
  showProgramFromIdx(1);
  logInScreen.classList.add("displayNone");
};

function getProgramIdxFromId(programId){
  return allPrograms.findIndex(pg => pg.id == programId);
};

// *** CLOUDSAVE

async function saveToCloud(){
  const docRef = doc(db, "chrono", auth.currentUser.email);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(doc(db, "chrono", auth.currentUser.email), {
      allPrograms: allPrograms
    });
  } else{
   await setDoc(doc(db, "chrono", auth.currentUser.email), {
    allPrograms: allPrograms
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

function fillAnimation(duration, colorIdx){
  let colorFull = colorsList[colorIdx].colorCode;
  timeShowZone.style.backgroundColor = "rgba(0, 0, 0, 0)";
  console.log(colorFull);
  timeShow.style.backgroundColor = colorFull;
  timeShow.animate([{width: "0"},{width: "250px"}], duration);
};

function blurAnimation(duration, colorIdx){
  let colorFull = colorsList[colorIdx].colorCode;
  let colorZero = colorsList[colorIdx].colorCodeZero;
  timeShowZone.style.backgroundColor = colorFull;
  timeShowZone.animate([{backgroundColor: colorFull},{backgroundColor: colorZero}], duration);
};


const allTimeDiv = document.querySelector(".allTimeDiv");



function showProgramFromIdx(programIdx){
  allTimeDiv.classList.remove("modifyingDiv");
  document.querySelector(".choiceDiv").classList.remove("displayNone");
  document.querySelector("#seqName").innerHTML = `${allPrograms[programIdx].name}<button onclick="modifyProgram(${programIdx})" style="border:none;"><i class="fa-solid fa-pen" style="margin-left: 16px;font-size: 1em;color: var(--tx-color);translate: 0 -3px;"></i></button`;
  allTimeDiv.innerHTML = allPrograms[programIdx].sequence.map((step) => {
    let stepColorIdx = colorsList.findIndex(col => col.id == step.color);
    return `<div style="color:${colorsList[stepColorIdx].colorCode};">
      <h3>${step.word}</h3>
      <p>${step.delai}</p>
    </div>`;
  }).join("");
  showedProgramId = allPrograms[programIdx].id;
};

function modifyProgram(progIdx){
  showModifiableProgram(progIdx);
};
window.modifyProgram = modifyProgram;

function showModifiableProgram(progIdx){
  let titles = `<div>
    <div>Color</div>
    <div>Name</div>
    <div>Starting beep</div>
    <div>Duration</div>
    <div>Animation</div>
  </div>`;
  let addingStep = allPrograms[progIdx].sequence.map((step) => {
    let colorOptions = colorsList.map((color) => {
      return `<option value="${color.id}" style="color:${color.colorCode};"${step.color == color.id ? " selected" : ""}>${color.name}</option>`; //&#xf53f;
    }).join("");
    let beepOptions = beepList.map((sound) => {
      return `<option value="${sound.id}" ${step.beep == sound.id ? " selected" : ""}>${sound.name}</option>`;
    }).join("");
    let animationOptions = animationList.map((move) => {
      return `<option value="${move.id}" ${step.animation == move.id ? " selected" : ""}>${move.name}</option>`;
    }).join("");
    let stepColorIdx = colorsList.findIndex(col => col.id == step.color);
    return `<div class="stepDivClass" style="color:${colorsList[stepColorIdx].colorCode};">
      <select class="colorSelect">
        ${colorOptions}
      </select>
      <input type="text" class="stepNameInput" value="${step.word}"></input>
      <select class="beepSelect">
        ${beepOptions}
      </select>
      <input type="time" step="1" class="delaySelect" value="${step.delai}" />
      <select class="animationSelect">
        ${animationOptions}
      </select>
    
    </div>`;
  }).join("");
//<select class="delaySelect">${timeOptions}</select>
  document.querySelector("#seqName").innerHTML = `<input id="seqNameInput" type="text" placeholder="Nom de la séquence"${progIdx !== 0 ? ` value="${allPrograms[progIdx].name}"` : ``}></input>
  ${progIdx == 0 ? `<button onclick="saveNreset()" style="border:none;"><i class="fa-regular fa-floppy-disk" style="margin-left: 16px;"></i></button>` : `<button onclick="replaceProgram(${progIdx})" style="border:none;"><i class="fa-regular fa-floppy-disk" style="margin-left: 16px;"></i></button>`}`;
  allTimeDiv.innerHTML = titles + addingStep;
  allTimeDiv.classList.add("modifyingDiv");
  document.querySelector(".choiceDiv").classList.add("displayNone");
  showedProgramId = allPrograms[progIdx].id;
  // addEvenListener so that the whole div.stepDivClass change color when a new color is selected
  document.querySelectorAll(".colorSelect").forEach(cS => {
    cS.addEventListener("change", () => {
      cS.parentElement.style.color = colorsList[colorsList.findIndex(cl => cl.id == cS.value)].colorCode;
    });
  });
};

function getNewProgram(){
  let newProgram = {
    id: crypto.randomUUID(),
    name: document.querySelector("#seqNameInput").value,
    sequence: []
  };
  let num = 0;
  document.querySelectorAll(".allTimeDiv > div.stepDivClass").forEach(step => {
    let stepBeepId = step.querySelector(".beepSelect").value;
    let stepBeepIdx = beepList.findIndex(bee => bee.id == stepBeepId);
    let newStep = {
      word: step.querySelector(".stepNameInput").value,
      delai: step.querySelector(".delaySelect").value,
      color: step.querySelector(".colorSelect").value,
      animation: step.querySelector(".animationSelect").value,
      beep: stepBeepId,
      noteD: beepList[stepBeepIdx].noteD,
      noteF: beepList[stepBeepIdx].noteF,
      noteV: beepList[stepBeepIdx].noteV,
      numDiv: num
    };
    newProgram.sequence.push(newStep);
    num++;
  });
  return newProgram;
};

function replaceProgram(progIdx){ //The program already exists but we're changing it, so basically, we replace the old one with this new one, so we need to make sure we're using the same index
  let newProgram = getNewProgram();
  allPrograms[progIdx] = newProgram;
  showProgramFromIdx(progIdx);
  localStorage.allPrograms = JSON.stringify(allPrograms);
  saveToCloud();
  console.log(allPrograms);
};

window.replaceProgram = replaceProgram;


document.querySelector("#moveUpBtn").addEventListener("click", () => {
  let programIdx = getProgramIdxFromId(showedProgramId);
  programIdx = programIdx == allPrograms.length - 1 ? 1 : programIdx + 1;
  backToStart();
  showProgramFromIdx(programIdx);
});
document.querySelector("#moveDnBtn").addEventListener("click", () => {
  let programIdx = getProgramIdxFromId(showedProgramId);
  programIdx = programIdx == 1 ? allPrograms.length - 1 : programIdx - 1;
  backToStart();
  showProgramFromIdx(programIdx);
});

const addOneBtn = document.querySelector("#addOneBtn");
addOneBtn.addEventListener("click", createNew);

function createNew() { // le + se transforme en checkmark et quand on click sur celui-là, ça enregistre
  // progNum = allPrograms.length;
  backToStart(); //or just: document.querySelector("#chronoMe").blur(); NOT JUST BLUR, WE NEED TO DEACTIVATE IT! because Start just won't work because it's not about the number in the selects anymore, it's about the number in the array! So before the btn start can be activated, we have to had the number added to the array.
  
  showModifiableProgram(0);
};

function saveNreset() {
  console.log("yay");
  let newProgram = getNewProgram();
  allPrograms.push(newProgram);
  localStorage.allPrograms = JSON.stringify(allPrograms);
  let programIdx = allPrograms.length - 1;
  console.log(allPrograms);
  showProgramFromIdx(programIdx);
  saveToCloud();
};
window.saveNreset = saveNreset;


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
  let programIdx = getProgramIdxFromId(showedProgramId);
  let allDivs = Array.from(document.querySelectorAll(".allTimeDiv > div"));
  let firstColorIdx = colorsList.findIndex(cl => cl.id == allPrograms[programIdx].sequence[0].color);
  allDivs.forEach((div, idx) => {
    if(divIdx == idx){
      div.classList.add("activated");
      if(divIdx > 0){
        allDivs[divIdx - 1].classList.remove("activated");
        allDivs[divIdx - 1].classList.add("done");
      };
      let step = allPrograms[programIdx].sequence[divIdx];
      let delai = step.delai;
      let colorIdx = colorsList.findIndex(cl => cl.id == step.color);
      let lastingTtimeH = delai.split(':')[0];
      lastingTtimeH = lastingTtimeH.startsWith("0") ? lastingTtimeH == "00" ? null : lastingTtimeH.slice(1) : lastingTtimeH;
      let lastingTtimeM = delai.split(':')[1];
      lastingTtimeM = lastingTtimeM.startsWith("0") ? lastingTtimeH ? lastingTtimeM == "00" ? "00" : lastingTtimeM : lastingTtimeM == "00" ? null : lastingTtimeM.slice(1) : lastingTtimeM;
      let lastingTtimeS = delai.split(':')[2];
      lastingTtimeS = lastingTtimeS.startsWith("0") ? lastingTtimeM ? lastingTtimeS == "00" ? null : lastingTtimeS : lastingTtimeS.slice(1) : lastingTtimeS;
      document.querySelector("#order").style.color =colorsList[colorIdx].colorCode;
      document.querySelector("#order").innerHTML = `${step.word} <span class="lastingTime">(${lastingTtimeH ? lastingTtimeH + " h" : ""}${lastingTtimeM ? lastingTtimeH ? " " + lastingTtimeM + " m" : lastingTtimeM + " m" : ""}${lastingTtimeS ? lastingTtimeM ? " " + lastingTtimeS + " s" : lastingTtimeS + " s" : ""})</span>`;
    } else if(divIdx == allDivs.length){
      console.log(firstColorIdx);
      allDivs[divIdx - 1].classList.remove("activated");
      allDivs[divIdx - 1].classList.add("done");
      document.querySelector("#order").style.color = colorsList[firstColorIdx].colorCode;
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
  let programIdx = getProgramIdxFromId(showedProgramId);
  let firstColorIdx = colorsList.findIndex(cl => cl.id == allPrograms[programIdx].sequence[0].color);
  allPrograms[programIdx].sequence.forEach(function (parametre) {
    result = result.then(async () => {
      const {animation, color, noteD, noteF, noteV, delai, numDiv} = parametre;
      let colorIdx = colorsList.findIndex(cl => cl.id == color);
      if (animation == "blur"){
        blurAnimation(turnIntoMS(delai), colorIdx);
      } else if(animation == "fill"){
        fillAnimation(turnIntoMS(delai), colorIdx);
      };
      beep(noteD, noteF, noteV);
      activateDiv(numDiv);
      await delay(turnIntoMS(delai));
    });
  });
  result = result.then(() => {
    blurAnimation(0, firstColorIdx);
    beep(600); 
    activateDiv(allPrograms[programIdx].sequence.length);
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

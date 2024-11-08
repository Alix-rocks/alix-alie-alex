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

let progNum = 0;
let allPrograms = [[{
      name: "Strengthening"
    },{
      word: "Position",
      color: "rgba(138, 43, 226, 1)",
      time: 5
    },{
      word: "Hold",
      color: "green",
      time: 60
    },{
      word: "Pause",
      color: "rgba(255, 0, 0, 1)",
      time: 15
    },{
      word: "Hold",
      color: "green",
      time: 60
    },{
      word: "Pause",
      color: "rgba(255, 0, 0, 1)",
      time: 15
    },{
      word: "Hold",
      color: "green",
      time: 60
    }],[{
      name: "Stretching"
    },{
      word: "Position",
      color: "rgba(138, 43, 226, 1)",
      time: 5
    },{
      word: "Stretch",
      color: "green",
      time: 25
    },{
      word: "Pause",
      color: "rgba(255, 0, 0, 1)",
      time: 8
    },{
      word: "Stretch",
      color: "green",
      time: 25
    },{
      word: "Pause",
      color: "rgba(255, 0, 0, 1)",
      time: 8
    },{
      word: "Stretch",
      color: "green",
      time: 25
    }],[{
      name: "Demo"
    },{
      word: "Position",
      color: "rgba(138, 43, 226, 1)",
      time: 3
    },{
      word: "Test",
      color: "green",
      time: 6
    },{
      word: "Pause",
      color: "rgba(255, 0, 0, 1)",
      time: 3
    },{
      word: "Test",
      color: "green",
      time: 6
    },{
      word: "Pause",
      color: "rgba(255, 0, 0, 1)",
      time: 3
    },{
      word: "Test",
      color: "green",
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
  document.querySelector("#seqName").innerText = allPrograms[progNum][0].name;
  document.querySelector(".allTimeDiv").innerHTML = allPrograms[progNum].map((step, idx) => {
    if(idx !== 0){
      return `<div style="color:${step.color};">
        <h3>${step.word}</h3>
        <p>${step.time}</p>
      </div>`;
    };
  }).join("");
};

// function showProgram(prog){
//   allPrograms[prog].map((select, idx) => {
//     let options = [];
//     for(let i = 0; i < 61; i++){
//       options.push(`<option value="${i}" ${i == select ? "selected" : ""}>${i}</option>`);
//     };
//     options = options.join("");
//     document.querySelector(`.delay${idx}Select`).innerHTML = options;
//   });
//   document.querySelectorAll('.allTimeDiv input[type="text"]').forEach(input => {
//     //input.style.width = input.parentElement.style.width - 6 + "px";
//     console.log(window.getComputedStyle(input.parentElement).getPropertyValue("width"));
//     console.log(window.getComputedStyle(input.parentElement).getPropertyValue("width") - 6 + "px");
//   });
// };




document.querySelector("#moveUpBtn").addEventListener("click", () => {
  progNum = progNum == allPrograms.length - 1 ? 0 : progNum + 1;
  backToStart();
  showProgram();
});
document.querySelector("#moveDnBtn").addEventListener("click", () => {
  progNum = progNum == 0 ? allPrograms.length - 1 : progNum - 1;
  backToStart();
  showProgram();
});

const addOneBtn = document.querySelector("#addOneBtn");
addOneBtn.addEventListener("click", createNew);

function createNew() { // le + se transforme en checkmark et quand on click sur celui-là, ça enregistre
  addOneBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
  progNum = allPrograms.length;
  backToStart(); //or just: document.querySelector("#chronoMe").blur(); NOT JUST BLUR, WE NEED TO DEACTIVATE IT! because Start just won't work because it's not about the number in the selects anymore, it's about the number in the array! So before the btn start can be activated, we have to had the number added to the array.
  let options = [];
  for (let i = 0; i < 61; i++) {
    options.push(`<option value="${i}">${i}</option>`);
  };
  options = options.join("");
  document.querySelector("#seqName").innerHTML = `<input class="seqNameInput" type="text" placeholder="Nom de la séquence"></input>`;
  document.querySelector(".allTimeDiv").innerHTML = `<div class="positionClass">
      <input type="text" class="stepNameInput" id="delay0Select" value="Position"></input>
      <select class="delaySelect delay0Select">${options}</select>
    </div>
    <div class="stretchClass">
      <input type="text" class="stepNameInput" id="delay1Select" value="Stretch"></input>
      <select class="delaySelect delay1Select">${options}</select>
    </div>
    <div class="pauseClass">
      <input type="text" class="stepNameInput" id="delay2Select" value="Pause"></input>
      <select class="delaySelect delay2Select">${options}</select>
    </div>
    <div class="stretchClass">
      <input type="text" class="stepNameInput" id="delay3Select" value="Stretch"></input>
      <select class="delaySelect delay3Select">${options}</select>
    </div>
    <div class="pauseClass">
      <input type="text" class="stepNameInput" id="delay4Select" value="Pause"></input>
      <select class="delaySelect delay4Select">${options}</select>
    </div>
    <div class="stretchClass">
      <input type="text" class="stepNameInput" id="delay5Select" value="Stretch"></input>
      <select class="delaySelect delay5Select">${options}</select>
    </div>`;
  addOneBtn.removeEventListener("click", createNew);
  addOneBtn.addEventListener("click", saveNreset);
  //when the checkmark is clicked (to save), we go through each and note the text, (color) and time into one prog
  //Then push that prog into allPrograms.
  //Then showProgram (progNum should be the right one)

};

function saveNreset() {
  console.log("yay");
  document.querySelector("#seqNameInput").value;
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

document.querySelector("#chronoMe").addEventListener("click", () => {
  //console.log(allPrograms[progNum]);
  let delay0 = allPrograms[progNum][1].time * 1000;
  let delay1 = allPrograms[progNum][2].time * 1000;
  let delay2 = allPrograms[progNum][3].time * 1000;
  let delay3 = allPrograms[progNum][4].time * 1000;
  let delay4 = allPrograms[progNum][5].time * 1000;
  let delay5 = allPrograms[progNum][6].time * 1000;
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

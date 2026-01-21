// Import the functions you need from the SDKs you need
import { app, analytics, db, auth, provider, getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp, getAuth, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "../../myFirebase.js";
//import { choosingLine } from "./metro/metro.js"; ERROR "Uncaught SyntaxError: The requested module './metro/metro.js' does not provide an export named 'choosingLine' (at module.js:3:10)"

// import transCode from "./transCode.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
  // const firebaseConfig = {
  //   apiKey: "AIzaSyBHSLxXWZUAOH8bKsRSGMnSzOh6QnyPTWQ",
  //   authDomain: "alix-alie-alex.firebaseapp.com",
  //   projectId: "alix-alie-alex",
  //   storageBucket: "alix-alie-alex.appspot.com",
  //   messagingSenderId: "519484588635",
  //   appId: "1:519484588635:web:ec162ad407f9b45f60357e",
  //   measurementId: "G-NFDD6B1G9R"
  // };

// Initialize Firebase
  // const app = initializeApp(firebaseConfig);
  // const analytics = getAnalytics(app);
  // const db = getFirestore(app);
  // const auth = getAuth(app);
  // const provider = new GoogleAuthProvider();
// provider.addScope('https://www.googleapis.com/auth/contacts.readonly');


// const querySnapshot = await getDocs(query(collection(db, "person"), where("lastName", "==", "gentile")));
// querySnapshot.forEach((doc) => {
//   console.log(doc.data());
// });



// TimePage







// To get today'shit 
async function getTodaysShit() {
  const myTSArray = [];
  const querySnapshotTS = await getDocs(query(collection(db, "shit")));
  querySnapshotTS.forEach(doc => {
    const check = doc.data().quote;
    // console.log("check = " + check);
    myTSArray.push(check);
  });
  return myTSArray;
};



// To get themed shit to feel 
async function getGearData(theme) {
  const myArray = [];
  const querySnapshot = await getDocs(query(collection(db, "shit"), where("theme", "array-contains", theme)));
  querySnapshot.forEach(doc => {
    const check = doc.data().quote;
    // console.log("check = " + check);
    myArray.push(check);
  });
  return myArray;
};

const shitTypeButton = document.getElementsByClassName('shitTypeButton');
// console.log("shitTypeButton : " + shitTypeButton);
for (let i = 0; i < shitTypeButton.length; i++) {
  let theme = shitTypeButton[i].id;
  // console.log(" theme = " + theme);
  shitTypeButton[i].addEventListener('click', (e) => {
    getGearData(theme)
      .then(gearData => {
        let numAS = getRndInteger(0, gearData.length);
        document.getElementById("ySp").innerHTML = gearData[numAS];
        // console.log("gearData = " + gearData);
      })
  })
};

// To get shit recipe 
async function getShitRecipe(theme) {
  const myRecipe = [];
  const querySnapshotR = await getDocs(query(collection(db, "shit"), where("theme", "array-contains-any", theme)));
  querySnapshotR.forEach(doc => {
    const checkR = doc.data().quote;
    // console.log("checkR = " + checkR);
    myRecipe.push(checkR);
  });
  return myRecipe;
};

document.getElementById('recipe').addEventListener('click', (e) => {
  const shitRChoice = document.getElementsByClassName('shitRChoice');
  let theme = []
  for (let i = 0; i < shitRChoice.length; i++) {
    if (shitRChoice[i].checked) {
      theme.push(shitRChoice[i].value);
    }
  }
  console.log("theme = " + theme);
  getShitRecipe(theme)
    .then(thisRecipe => {
      let numAS = getRndInteger(0, thisRecipe.length);
      document.getElementById("yourShit").classList.add("yourShitHover");
      document.getElementById("ySp").innerHTML = thisRecipe[numAS];
      document.getElementById("coverMyShit").style.display = "block";
      if (document.getElementById("switchModeBall").classList.contains("ballDark")) {
        document.getElementById("coverMyShit").style.background = "#000";
      } else {
        document.getElementById("coverMyShit").style.background = "#F2F3F4";
      };
      document.getElementById("enough").style.display = "flex";
      document.getElementById("heresYSR").classList.add("fixYourShit");
      document.getElementById("explainShit").style.display = "block";
      console.log("thisRecipe = " + thisRecipe);
      // then again
      let max = thisRecipe.length;
      let min = 0;
      let arrR = [];
      for (i = 0; i < max; i++) {
        x = Math.floor(Math.random() * max) + min;
        if (arrR.includes(x) == true) {
          i = i - 1;
        } else {
          if (x > max == false) {
            arrR.push(x);
          }
        }
      } console.log("arrR = " + arrR);
      let R = 0;
      console.log("max = " + max);
      const controller = new AbortController();
      document.getElementById('yourShit').addEventListener('click', (e) => {
        let numRS = arrR[R++];
        console.log("numRS = " + numRS);
        if (numRS === undefined) {
          document.getElementById("ySp").innerHTML = "That's it!<br>\nYou ate it all!<br>\nHope you had enough!";
          document.getElementById("explainShit").style.display = "none";
          document.getElementById("yourShit").classList.remove("yourShitHover");
          //remove EventListener! (ça ça marche pas encore)
          // document.getElementById('yourShit').removeEventListener('click', e);
          controller.abort()
        } else {
          document.getElementById("ySp").innerHTML = thisRecipe[numRS];
        }
      }, { signal: controller.signal })
    })
});

document.getElementById('enough').addEventListener('click', (e) => {
  document.getElementById("coverMyShit").style.display = "none";
  document.getElementById("enough").style.display = "none";
  document.getElementById("heresYSR").classList.remove("fixYourShit");
  document.getElementById("ySp").innerHTML = "Wanna try again?";
  document.getElementById("yourShit").classList.remove("yourShitHover");
});

// To add your own shit
const addYOSForm = document.querySelector('#addYOS')
addYOSForm.addEventListener('submit', (e) => {
  e.preventDefault()
  let finalList = []
  var markedCheckbox = document.getElementsByName('theme');
  for (var checkbox of markedCheckbox) {
    if (checkbox.checked) {
      finalList.push(checkbox.value);
    }
  }
  console.log("finalList = " + finalList + " addYOSForm.quote.value = " + addYOSForm.quote.value);
  if (addYOSForm.quote.value === "" || finalList.length === 0) {
    document.querySelector("#badShit").innerHTML = "You forgot something...";
    document.querySelector("#wisely").innerHTML = "Choose wisely...";
  } else {
    let quoteHTML = addYOSForm.quote.value.replace(/\n/g, '<br>');
    console.log("finalList = " + finalList + " addYOSForm.quote.value = " + addYOSForm.quote.value + "quoteHTML = " + quoteHTML);
    addDoc(collection(db, "shit"), {
      quote: quoteHTML,
      theme: finalList,
      type: "text"
    })
      .then(() => {
        addYOSForm.reset()
        document.querySelector("#wisely").innerHTML = "Choose wisely...";
        document.querySelector("#badShit").innerHTML = "Thank you for your shit!";
      })
  }
});


// window.onload = MyNewRand;
// window.onload = (event) => {
// };  
let arrTS = MyNewRand();
// console.log("arrTS =" + arrTS);    
let TS = 0;
document.getElementById("SotD").addEventListener('click', (e) => {
  getTodaysShit()
    .then(todaysShit => {
      let numBC = getRndInteger(0, BgColor.length);
      let numTC = getRndInteger(0, TextColor.length);
      let numTF = getRndInteger(0, TextFont.length);
      document.getElementById("SotDp").style.fontFamily = TextFont[numTF];
      let numTS = arrTS[TS++];
      console.log("TS= " + TS + "  numTS= " + numTS);
      if (TS < 11) {
        document.getElementById("SotDp").innerHTML = todaysShit[numTS];
      } else if (TS >= 15) {
        document.getElementById("SotDp").innerHTML = "For real,<br>\nit's over now.<br>\nGO get a life!";
        document.getElementById("SotDp").style.fontFamily = "'Fuzzy Bubbles', cursive";
      } else if (TS >= 11) {
        document.getElementById("SotDp").innerHTML = "Now, you've seen enough,<br>\ngo do stuff and come back later.";
        document.getElementById("SotDp").style.fontFamily = "'Chakra Petch', sans-serif";
      }
    })
})
function MyNewRand() {
  let max = 10;
  let min = 0;
  let arrTS = [];
  for (let i = 0; i < max; i++) {
    let x = Math.floor(Math.random() * max) + min;
    if (arrTS.includes(x) == true) {
      i = i - 1;
    } else {
      if (x > max == false) {
        arrTS.push(x);
      }
    }
  }
  return arrTS;
}


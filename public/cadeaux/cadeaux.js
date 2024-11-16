import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { app, analytics, db, auth, provider } from "../myFirebase.js";

document.querySelectorAll(".optionsInput").forEach(input => {
  input.addEventListener("click", () => {
    input.parentElement.parentElement.querySelector(".optionsDiv").classList.toggle("displayNone");
  });
});

document.querySelectorAll("textarea").forEach(textarea => {
  textarea.addEventListener("change", () => {
    textarea.style.height = textarea.scrollHeight + "px";    
  });
});

// const theGifts = [

// ]

// async function getTheGifts() {
//   // const getBusies = await getDoc(doc(db, "randomTask", myEmail));
//   const getTheGifts = await getDoc(doc(db, "cadeaux"));
  
//   if(getTheGifts.exists() && getTheGifts.data()){
//     myBusies = getTheGifts.data();
//   };
  
//   getWeeklyCalendar();
// };

// getMyBusies();
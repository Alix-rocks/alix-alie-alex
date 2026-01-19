import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, onChildAdded, ref, get, set, push, update, onValue, onChildChanged, onChildRemoved, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js"; //realtime database


// const firebaseConfig = {
//   apiKey: "AIzaSyBHSLxXWZUAOH8bKsRSGMnSzOh6QnyPTWQ",
//   authDomain: "alix-alie-alex.firebaseapp.com",
//   projectId: "alix-alie-alex",
//   storageBucket: "alix-alie-alex.appspot.com",
//   messagingSenderId: "519484588635",
//   appId: "1:519484588635:web:ec162ad407f9b45f60357e",
//   measurementId: "G-NFDD6B1G9R"
// };

const firebaseConfig = {
  apiKey: "AIzaSyBHSLxXWZUAOH8bKsRSGMnSzOh6QnyPTWQ",
  authDomain: "alix.rocks",
  projectId: "alix-alie-alex",
  storageBucket: "alix-alie-alex.appspot.com",
  messagingSenderId: "519484588635",
  appId: "1:519484588635:web:ec162ad407f9b45f60357e",
  measurementId: "G-NFDD6B1G9R"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const rtdb = getDatabase(app); //realtime database
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, analytics, db, auth, provider, getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp, getAuth, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, onAuthStateChanged,
  rtdb, getDatabase, onChildAdded, ref, get, set, push, update, onValue, onChildChanged, onChildRemoved, remove //realtime database
 };
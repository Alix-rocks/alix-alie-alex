import { app, analytics, db, auth, provider, getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp, getAuth, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "/myFirebase.js";

const love = document.querySelector("#coteForm");
if (love) {
  fetch("../partials/love.html")
    .then(res => res.text())
    .then(html => love.innerHTML = html);
};

const coteForm = document.querySelector('#coteForm');
let cote = 0;
window.coteCheck = function(el){
  let c = el.value;
  cote = c;
  let coteAll = Array.from(document.querySelectorAll(".coteHeart"));
  for(let i = 0; i < c; i++){
    coteAll[i].classList.remove("typcn-heart-outline");
    coteAll[i].classList.add("typcn-heart-full-outline");
  }
  for(let i = coteAll.length - 1; i > c - 1; i--){
    coteAll[i].classList.remove("typcn-heart-full-outline");
    coteAll[i].classList.add("typcn-heart-outline");
  }
  console.log(cote);
};
function coteFormReset(){
  coteForm.reset();
  let coteAll = document.querySelectorAll(".coteHeart");
  coteAll.forEach(cote =>{
    cote.classList.remove("typcn-heart-full-outline");
    cote.classList.add("typcn-heart-outline");
  });
  document.querySelector("#coteThanks").innerHTML = ``;
  console.log("reset!");
};




coteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let timeNow = Timestamp.fromDate(new Date());
  console.log(timeNow);
  let coteText = document.querySelector('input[name=menuText]:checked').value;
  if(cote > 0){
    let comment = coteForm.comment.value.replace(/\n/g, '<br>');
    addDoc(collection(db, "love"), {
      text: coteText,
      love: cote,
      comment: comment,
      time: timeNow
    })
      .then(() => {
        coteForm.reset();
        coteFormReset();
        document.querySelector("#coteThanks").innerHTML = "Good dog!";
      })
  }
});
window.coteFormReset = coteFormReset;

import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { app, analytics, db, auth, provider } from "../myFirebase.js";

const cloudIt = document.querySelector("#cloudIt");
cloudIt.addEventListener("click", saveToCloud);

const earthIt = document.querySelector("#earthIt");
earthIt.addEventListener("click", updateFromCloud);

let lastUpdateLocalStorageCadeaux = "";
let lastUpdateFireStoreCadeaux = "";

let cBC;
getCloudBC();

function getCloudBC(){
  if(localStorage.getItem("cBC")){
    cBC = localStorage.cBC;
    let cBCD = cBC >= 10 ? 1 : "." + cBC;
    cloudIt.style.backgroundColor = "rgba(237, 20, 61, " + cBCD + ")";
  } else {
    cBC = 0;
    localStorage.setItem("cBC", cBC);
  };
};
function updateCBC(){
  cBC++;
  localStorage.cBC = cBC;
  let cBCD = cBC >= 10 ? 1 : "." + cBC;
  cloudIt.style.backgroundColor = "rgba(237, 20, 61, " + cBCD + ")";
};
function resetCBC(){
  cBC = 0;
  cloudIt.style.backgroundColor = "rgba(237, 20, 61, " + cBC + ")";
  localStorage.cBC = cBC;
};

let checkedBought = [];

let theGifts = [];

async function getTheGifts() {
  const getTheGifts = await getDocs(collection(db, "cadeaux2024"));

  if(localStorage.getItem("lastUpdateLocalStorageCadeaux")){
    lastUpdateLocalStorageCadeaux = localStorage.lastUpdateLocalStorageCadeaux;
  };
  if(localStorage.getItem("checkedBought")){
    checkedBought = JSON.parse(localStorage.checkedBought);
  };
  if(getTheGifts){
    getTheGifts.forEach(doc => {
      if(doc.id == "all"){
        lastUpdateFireStoreCadeaux = doc.data().lastUpdateFireStore;
        checkedBought = doc.data().checked;
      };
    });
    localStorage.checkedBought = checkedBought.length > 0 ? JSON.stringify(checkedBought) : JSON.stringify([]);
  };
  if((lastUpdateLocalStorageCadeaux !== "" && lastUpdateFireStoreCadeaux !== "" && lastUpdateLocalStorageCadeaux < lastUpdateFireStoreCadeaux) || lastUpdateLocalStorageCadeaux == ""){
    earthIt.style.backgroundColor = "rgb(237, 20, 61)";
  };
  
  if(localStorage.getItem("theGifts")){
    theGifts = JSON.parse(localStorage.theGifts);
  } else if(getTheGifts){
    let tempGifts = [];
    getTheGifts.forEach(doc => {
      if(doc.id !== "all"){
        let person = {
          initial: doc.id,
          color: doc.data().color,
          nom: doc.data().nom,
          suggestions: doc.data().suggestions
        };
        tempGifts.push(person);
      };
    });
    theGifts = tempGifts;
    localStorage.theGifts = JSON.stringify(theGifts);
  } else{
    localStorage.theGifts = JSON.stringify([]);
  };
  
  console.log(theGifts);
  createSections();
};


getTheGifts();

async function saveToCloud(){
  const batch = writeBatch(db);

  let nowStamp = new Date().getTime();
  theGifts = JSON.parse(localStorage.theGifts);
  checkedBought = JSON.parse(localStorage.checkedBought);
  const docRefGifts = collection(db, "cadeaux2024");
  const docSnapGifts = await getDocs(docRefGifts);
  if(docSnapGifts["all"]){
    batch.update(doc(db, "cadeaux2024", "all"), {
      lastUpdateFireStore: nowStamp,
      checked: checkedBought
    });
  } else{
    batch.set(doc(db, "cadeaux2024", "all"), {
      lastUpdateFireStore: nowStamp,
      checked: checkedBought
    });
  };
  let modif = getModif();
  modif.map(modifiedInitial => {
    let section = theGifts.find((person) => person.initial == modifiedInitial);
    batch.updateDoc(doc(db, "cadeaux2024", modifiedInitial), {
      suggestions: section.suggestions
    });
    // if(docSnapGifts[modifiedInitial]){
    //   batch.updateDoc(doc(db, "cadeaux2024", modifiedInitial), {
    //     suggestions: section.suggestions
    //   });
    // } else{
    //   batch.set(doc(db, "cadeaux2024", modifiedInitial), {
    //     suggestions: section.suggestions
    //   });
    // };
  });  

  await batch.commit();
  localStorage.lastUpdateLocalStorageCadeaux = nowStamp;
  resetCBC();
  resetModif();
};

function updateFromCloud(){
  localStorage.clear();
  document.querySelector("#wholeThing").innerHTML = "";
  resetCBC();
  resetModif();
  getTheGifts();
  earthIt.style.backgroundColor = "rgba(237, 20, 61, 0)";
  localStorage.lastUpdateLocalStorageCadeaux = new Date().getTime();
};

function addModif(initial){
  let modif = getModif();
  if(!modif.includes(initial)){
    modif = [...modif, initial];
    //localStorage.setItem("modif", JSON.stringify(modif));
    localStorage.modif = JSON.stringify(modif);
  };
};

function getModif(){
  let modif = [];
  if(localStorage.getItem("modif")){
    modif = JSON.parse(localStorage.modif);
  } else{
    modif = [];
  };
  return modif;
};

function resetModif(){
  localStorage.modif = JSON.stringify([]);
};

// let nowStamp = new Date().getTime();
// let d = new Date(nowStamp);
// document.querySelector("#dmaj").innerHTML = `Dernière modification&nbsp;: ${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} à ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

function createSections(){
  let wholeCode = theGifts.map((person) => {
    let listeIdees =  person.suggestions.map((idee) => {
      return `<li class="ideeLi" id="${idee.id}">
        <label class="myCheckboxLabel">
          <input type="checkbox" onclick="checkCheckedBought(this)" class="checkBought displayNone" ${idee.id && checkedBought.length > 0 && checkedBought.includes(idee.id) ? "checked" : ""}>
          <i class="typcn typcn-media-stop-outline unchecked"></i>
          <i class="typcn typcn-input-checked checked"></i>
        </label>
        <details class="detailsLi">
          <summary>
            <span>${idee.cadeau ? idee.cadeau : "N'importe quoi"}</span>
          </summary>
          <div class="insideDiv">
            <h3>Détails&nbsp;:</h3>
            <div class="ideeDetailsDiv">${idee.details && idee.details !== "" ? idee.details : "bof..."}</div>
            <h3>Lien&nbsp;:</h3>
            <p class="ideeLienP"><i class="fa-solid fa-globe"></i><a href="${idee.lienComplet}">${idee.lienFinal ? idee.lienFinal : "nul part"}</a></p>
          </div>
        </details>
        
        <div class="optionsDiv displayNone">
          <i onclick="switchMiniType(this)" class="typcn typcn-arrow-repeat"></i>
          <i onclick="trashMini(this)" class="typcn typcn-trash"></i>
          <i onclick="moveMiniDown(this)" class="typcn typcn-arrow-down-outline"></i>
          <i onclick="moveMiniUp(this)" class="typcn typcn-arrow-up-outline"></i>
        </div>
        <label class="optionsLabel">
          <input type="checkbox" onclick="displayOptionsDiv(this)" class="optionsInput displayNone" />
          <i class="fa-solid fa-ellipsis-vertical optionsI" style="width:23px;text-align:center;"></i>
        </label>
      </li>`;
    }).join("");
    let fadeColor = person.color.replace(".5", ".2");
    return `<details id="${person.initial}" class="prenomNom">
      <summary style="background-color:${person.color};">${person.nom}</summary>
      <div class="listDiv" style="background-color:${fadeColor};">
        <h2>Ma liste de cadeaux&nbsp;:</h2>
        <ul data-initial="${person.initial}">
          ${listeIdees}
          <li class="addBtnLi">
            <button class="iconBtn" onclick="addBtn(this)"><i class="typcn typcn-plus"></i></button>
          </li>
        </ul>
      </div>
    </details>`;
  }).join("");
  document.querySelector("#wholeThing").innerHTML = wholeCode;
};

function checkCheckedBought(input) {
   let li = input.parentElement.parentElement;
   let details= li.querySelector("details");
   if (input.checked) {
     details.classList.add("bought");
     if (li.id && (checkedBought.length == 0 || (checkedBought.length > 0 && !checkedBought.includes(li.id)))) {
       checkedBought.push(li.id);
       localStorage.checkedBought = JSON.stringify(checkedBought);
       updateCBC();
     };
   } else {
     details.classList.remove("bought");
      if (li.id && checkedBought.length > 0 && checkedBought.includes(li.id)) {
         let idx = checkedBought.indexOf(li.id);
         if (idx > -1) {
           checkedBought.splice(idx, 1);
           localStorage.checkedBought = JSON.stringify(checkedBought);
           updateCBC();
         };
      };
  };
};
window.checkCheckedBought = checkCheckedBought;

function detailsOpenClose(details){
  if(details.open == false){
        details.parentElement.classList.add("open");
      } else{
        details.parentElement.classList.remove("open");
      }; 
};
window.detailsOpenClose = detailsOpenClose;

function displayOptionsDiv(input){
  let div = input.parentElement.parentElement.querySelector(".optionsDiv");
  if(input.checked){
    div.classList.remove("displayNone");
  } else{
    div.classList.add("displayNone");
  };
};
window.displayOptionsDiv = displayOptionsDiv;


function addBtn(thisOne){
  let addLi = thisOne.parentElement;
  let newAddingLi = `<li class="addingLi">
    <details class="detailsLi" open>
      <summary>
        <input class="addingName" type="text" placeholder="Idée cadeau" />
      </summary>
      <div class="insideDiv">
        <h3>Détails&nbsp;:</h3>
        <textarea class="addingDetails"></textarea>
        <h3>Lien&nbsp;:</h3>
        <p class="addingLienP"><i class="fa-solid fa-globe"></i><input class="addingLink" type="text"></p>
      </div>
    </details>
    <button class="iconBtn" onclick="saveNewIdee(this)"><i class="fa-regular fa-floppy-disk"></i></button>
  </li>`;
  addLi.insertAdjacentHTML("beforebegin", newAddingLi);

  
  document.querySelectorAll("textarea").forEach(textarea => {
    textarea.addEventListener("input", () => {
      textarea.style.height = textarea.scrollHeight + "px";    
    });
  });
};

window.addBtn = addBtn;

function saveNewIdee(thisOne){
  let addingLi = thisOne.parentElement;
  let addingUl = addingLi.parentElement;
  let initial = addingUl.dataset.initial;
  let index = theGifts.findIndex(id => id.initial == initial);

  //id
  let ideeId = crypto.randomUUID();

  //Nom du cadeau
  let ideeNom = addingLi.querySelector(".addingName").value;

  //Détails
  let ideeDetails = addingLi.querySelector(".addingDetails").value;

  // Lien
  let whole = String(addingLi.querySelector(".addingLink").value); //va aller dans le href
  console.log(whole);
  let step1;
  if(whole.startsWith("https://")){
    step1 = whole.substring(8);
  }else if(whole.startsWith("http://")){
    step1 = whole.substring(7);
  } else{
    step1 = whole;
  };
  let step2;
  if(step1.startsWith("www.")){
    step2 = step1.substring(4);
  } else{
    step2 = step1;
  };
  let idx = step2.indexOf("/");
  let final = step2.substring(0, idx + 1) + "..."; //va aller dans le <a>
  console.log(final);

  let newIdee = {
    id: ideeId,
    cadeau: ideeNom,
    details: ideeDetails,
    lienComplet: whole,
    lienFinal: final
  };
  //add to modif!
  theGifts[index].suggestions.push(newIdee);//???
  addModif(initial);
  localStorage.theGifts = JSON.stringify(theGifts);
  updateCBC();

  //creation d'un nouveau ideeLi
  let newLi = `<li class="ideeLi" id="${ideeId}">
    <label class="myCheckboxLabel">
      <input type="checkbox" onclick="checkCheckedBought(this)" class="checkBought displayNone">
      <i class="typcn typcn-media-stop-outline unchecked"></i>
      <i class="typcn typcn-input-checked checked"></i>
    </label>
    <details class="detailsLi">
      <summary>
        <span>${ideeNom !== "" ? ideeNom : "N'importe quoi"}</span>
      </summary>
      <div class="insideDiv">
        ${ideeDetails !== "" ? `<h3>Détails&nbsp;:</h3>
        <div class="ideeDetailsDiv">${ideeDetails.replace(/\n/g, '<br/>')}</div>` : ``}
        ${whole !== "" ? `<h3>Lien&nbsp;:</h3>
        <p class="ideeLienP"><i class="fa-solid fa-globe"></i><a href="${whole}">${final}</a></p>` : ``}
      </div>
    </details>
    
    <div class="optionsDiv displayNone">
      <i onclick="modify(this)" class="typcn typcn-arrow-repeat"></i>
      <i onclick="trash(this)" class="typcn typcn-trash"></i>
      <i onclick="moveDown(this)" class="typcn typcn-arrow-down-outline"></i>
      <i onclick="moveUp(this)" class="typcn typcn-arrow-up-outline"></i>
    </div>
    <label class="optionsLabel">
      <input type="checkbox" onclick="displayOptionsDiv(this)" class="optionsInput displayNone" />
      <i class="fa-solid fa-ellipsis-vertical optionsI" style="width:23px;text-align:center;"></i>
    </label>
  </li>`;

  addingLi.insertAdjacentHTML("beforebegin", newLi);

  addingLi.remove();
};

window.saveNewIdee = saveNewIdee;

function modify(thisOne) {
  let li = thisOne.parentElement.parentElement;
  let ul = li.parentElement;
  let initial = ul.dataset.initial;
  let index = theGifts.findIndex(id => id.initial == initial);
  let id = li.id;
  let idx = theGifts[index].suggestions.findIndex(ide => ide.id == li.id);
  let itm = theGifts[index].suggestions[idx];
};


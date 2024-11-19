import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { app, analytics, db, auth, provider } from "../myFirebase.js";

const cloudIt = document.querySelector("#cloudIt");
cloudIt.addEventListener("click", saveToCloud);

const earthIt = document.querySelector("#earthIt");
earthIt.addEventListener("click", updateFromCloud);

let lastUpdateLocalStorage = "";
let lastUpdateFireStore = "";

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

  if(localStorage.getItem("lastUpdateLocalStorage")){
    lastUpdateLocalStorage = localStorage.lastUpdateLocalStorage;
  };
  if(localStorage.getItem("checkedBought")){
    checkedBought = JSON.parse(localStorage.checkedBought);
  };
  if(getTheGifts){
    getTheGifts.forEach(doc => {
      if(doc.id == "all"){
        lastUpdateFireStore = doc.lastUpdateFireStore;
        checkedBought = doc.checked;
      };
    });
    localStorage.checkedBought = JSON.stringify(checkedBought);
  };
  if((lastUpdateLocalStorage !== "" && lastUpdateFireStore !== "" && lastUpdateLocalStorage < lastUpdateFireStore) || lastUpdateLocalStorage == ""){
    earthIt.style.backgroundColor = "rgb(237, 20, 61)";
  };
  
  if(localStorage.getItem("theGifts")){
    theGifts = JSON.parse(localStorage.theGifts);
  } else if(getTheGifts){
    getTheGifts.forEach(doc => {
      if(doc.id !== "all"){
        let person = {
          initial: doc.id,
          nom: doc.data().nom,
          suggestions: doc.data().suggestions
        };
        theGifts.push(person);
      };
    });
    localStorage.theGifts = JSON.stringify(theGifts);
  } else{
    localStorage.theGifts = JSON.stringify([]);
  };
  
  console.log(theGifts);
  createSections();
};

//localStorage.theGifts = JSON.stringify(theGifts);

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
    if(docSnapGifts[modifiedInitial]){
      batch.update(doc(db, "cadeaux2024", modifiedInitial), {
        suggestions: section.suggestions
      });
    } else{
      batch.set(doc(db, "cadeaux2024", modifiedInitial), {
        suggestions: section.suggestions
      });
    };
  });  

  await batch.commit();
  localStorage.lastUpdateLocalStorage = nowStamp;
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
  localStorage.lastUpdateLocalStorage = new Date().getTime();
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
    let listeIdees = person.suggestions.map((idee) => {
      return `<li class="ideeLi" id="${idee.id}">
        <label class="myCheckboxLabel">
          <input type="checkbox" class="checkBought displayNone" ${idee.id && checkedBought.length > 0 && checkedBought.includes(idee.id) ? "checked" : ""}>
          <i class="typcn typcn-media-stop-outline unchecked"></i>
          <i class="typcn typcn-input-checked checked"></i>
        </label>
        <details class="detailsLi">
          <summary>
            <span>${idee.idee ? idee.idee : "N'importe quoi"}</span>
          </summary>
          <div class="insideDiv">
            <h3>Détails&nbsp;:</h3>
            <div class="ideeDetailsDiv">${idee.details && idee.details !== "" ? idee.details : "bof..."}</div>
            <h3>Lien&nbsp;:</h3>
            <p class="ideeLienP"><i class="fa-solid fa-globe"></i><a href="${idee.wholeLink}">${idee.finalLink ? idee.finalLink + "..." : "nul part"}</a></p>
          </div>
        </details>
        
        <div class="optionsDiv displayNone">
          <i onclick="switchMiniType(this)" class="typcn typcn-arrow-repeat"></i>
          <i onclick="switchMiniColor(this)" class="fa-solid fa-palette" style="font-size:18px;"></i>
          <i onclick="trashMini(this)" class="typcn typcn-trash"></i>
          <i onclick="moveMiniDown(this)" class="typcn typcn-arrow-down-outline"></i>
          <i onclick="moveMiniUp(this)" class="typcn typcn-arrow-up-outline"></i>
        </div>
        <label class="optionsLabel">
          <input type="checkbox" class="optionsInput displayNone" />
          <i class="fa-solid fa-ellipsis-vertical optionsI" style="width:23px;text-align:center;"></i>
        </label>
      </li>`;
    }).join("");
    return `<details id="${person.initial}" class="prenomNom">
      <summary>${person.nom}</summary>
      <div class="listDiv">
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

document.querySelectorAll("details.detailsLi").forEach(details => {
  details.addEventListener("toggle", () => {
    details.parentElement.classList.toggle("open");
  });
});

function addBtn(thisOne){
  let addLi = thisOne.parentElement;
  let newAddingLi = `<li class="addingLi open">
    <details class="detailsLi" open>
      <summary>
        <input class="addingName" type="text" placeholder="Idée cadeau" />
      </summary>
      <div class="insideDiv">
        <h3>Détails&nbsp;:</h3>
        <textarea class="addingDetails" name="" id=""></textarea>
        <h3>Lien&nbsp;:</h3>
        <p class="addingLienP"><i class="fa-solid fa-globe"></i><input class="addingLink" type="text"></p>
      </div>
    </details>
    <button class="iconBtn" onclick="saveNewIdee(this)"><i class="fa-regular fa-floppy-disk"></i></button>
  </li>`;
  addLi.insertAdjacentHTML("beforebegin", newAddingLi);

  let details = document.querySelector(".addingLi > .detailsLi");
    details.addEventListener("toggle", () => {
      if(details.hasAttribute("open")){
        details.parentElement.classList.add("open");
      } else{
        details.parentElement.classList.remove("open");
      }; 
    });

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
  let final = step2.substring(0, idx + 1); //va aller dans le <a>
  console.log(final);

  let newIdee = {
    id: ideeId,
    idee: ideeNom,
    details: ideeDetails,
    wholeLink: whole,
    finalLink: final
  };
  //add to modif!
  theGifts[index].suggestions.push(newIdee);//???
  localStorage.theGifts = JSON.stringify(theGifts);

  //creation d'un nouveau ideeLi
  let newLi = `<li class="ideeLi" id="${ideeId}">
    <label class="myCheckboxLabel">
      <input type="checkbox" class="checkBought displayNone">
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
        <p class="ideeLienP"><i class="fa-solid fa-globe"></i><a href="${whole}">${final + "..."}</a></p>` : ``}
      </div>
    </details>
    
    <div class="optionsDiv displayNone">
      <i onclick="switchMiniType(this)" class="typcn typcn-arrow-repeat"></i>
      <i onclick="switchMiniColor(this)" class="fa-solid fa-palette" style="font-size:18px;"></i>
      <i onclick="trashMini(this)" class="typcn typcn-trash"></i>
      <i onclick="moveMiniDown(this)" class="typcn typcn-arrow-down-outline"></i>
      <i onclick="moveMiniUp(this)" class="typcn typcn-arrow-up-outline"></i>
    </div>
    <label class="optionsLabel">
      <input type="checkbox" class="optionsInput displayNone" />
      <i class="fa-solid fa-ellipsis-vertical optionsI" style="width:23px;text-align:center;"></i>
    </label>
  </li>`;

  addingLi.insertAdjacentHTML("beforebegin", newLi);

  addingLi.remove();
  
  //for all or just for that one?? They should all be onclick and not eventListeners if you add them
  document.querySelectorAll(".checkBought").forEach(input => {
    input.addEventListener("click", () => {
      let li = input.parentElement.parentElement;
      li.querySelector("details").classList.toggle("bought");
      if(input.checked){
        if(li.id && (checkedBought.length == 0 || (checkedBought.length > 0 && !checkedBought.includes(li.id)))){
          checkedBought.push(li.id);
          localStorage.checkedBought = JSON.stringify(checkedBought);
        };
      } else if(li.id && checkedBought.length > 0 && checkedBought.includes(li.id)){
        let idx = checkedBought.indexOf(li.id);
        if(idx > -1){
          checkedBought.splice(idx, 1);
          localStorage.checkedBought = JSON.stringify(checkedBought);
        };
      };
    });
  });

  document.querySelectorAll("details.detailsLi").forEach(details => {
    details.addEventListener("toggle", () => {
      details.parentElement.classList.toggle("open");
    });
  });

  document.querySelectorAll(".optionsInput").forEach(input => {
    input.addEventListener("click", () => {
      input.parentElement.parentElement.querySelector(".optionsDiv").classList.toggle("displayNone");
    });
  });
};

window.saveNewIdee = saveNewIdee;




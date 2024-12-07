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
    if(cBC == 0){
      cloudIt.parentElement.querySelector(".underCloudBtnSpan").style.visibility = "hidden";
    } else{
      cloudIt.parentElement.querySelector(".underCloudBtnSpan").style.visibility = "visible";
    };
  } else {
    cBC = 0;
    localStorage.setItem("cBC", cBC);
    cloudIt.parentElement.querySelector(".underCloudBtnSpan").style.visibility = "hidden";
  };
};
function updateCBC(){
  cBC++;
  localStorage.cBC = cBC;
  let cBCD = cBC >= 10 ? 1 : "." + cBC;
  cloudIt.style.backgroundColor = "rgba(237, 20, 61, " + cBCD + ")";
  cloudIt.parentElement.querySelector(".underCloudBtnSpan").style.visibility = "visible";
};
function resetCBC(){
  cBC = 0;
  cloudIt.style.backgroundColor = "rgba(237, 20, 61, " + cBC + ")";
  localStorage.cBC = cBC;
  cloudIt.parentElement.querySelector(".underCloudBtnSpan").style.visibility = "hidden";
};

let checkedBought = [];

let theGifts = [];

async function getTheRest() {
  const getTheRest = await getDoc(doc(db, "cadeaux2024", "all"));
  
  if(localStorage.getItem("lastUpdateLocalStorageCadeaux")){
    lastUpdateLocalStorageCadeaux = localStorage.lastUpdateLocalStorageCadeaux;
  };
  lastUpdateFireStoreCadeaux = getTheRest.data().lastUpdateFireStore;
  console.log(lastUpdateFireStoreCadeaux);
  if((lastUpdateLocalStorageCadeaux !== "" && lastUpdateFireStoreCadeaux !== "" && lastUpdateLocalStorageCadeaux < lastUpdateFireStoreCadeaux) || lastUpdateLocalStorageCadeaux == ""){
    earthIt.style.backgroundColor = "rgb(237, 20, 61)";
    earthIt.parentElement.querySelector(".underCloudBtnSpan").style.visibility = "visible";
  } else{
    earthIt.parentElement.querySelector(".underCloudBtnSpan").style.visibility = "hidden";
  };

  if(localStorage.getItem("checkedBought")){
    checkedBought = JSON.parse(localStorage.checkedBought);
  } else{
    checkedBought = getTheRest.data().checked;
  };
  localStorage.checkedBought = checkedBought.length > 0 ? JSON.stringify(checkedBought) : JSON.stringify([]);
  console.log(checkedBought);
};

async function getTheGifts() {
  const getTheGifts = await getDocs(collection(db, "cadeaux2024"));
  
  if(localStorage.getItem("theGifts")){
    theGifts = JSON.parse(localStorage.theGifts);
  } else{
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
  };
  
  console.log(theGifts);
  createSections();
};

getTheRest();
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
  };

  let modif = getModif();
  modif.map(modifiedInitial => {
    let section = theGifts.find((person) => person.initial == modifiedInitial);
    batch.update(doc(db, "cadeaux2024", modifiedInitial), {
      color: section.color,
      nom: section.nom,
      suggestions: section.suggestions
    });
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
  getTheRest();
  getTheGifts();
  earthIt.style.backgroundColor = "rgba(237, 20, 61, 0)";
  earthIt.parentElement.querySelector(".underCloudBtnSpan").style.visibility = "hidden";
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
        <details class="detailsLi${idee.id && checkedBought.length > 0 && checkedBought.includes(idee.id) ? " bought" : ""}">
          <summary>
            <span>${idee.cadeau ? idee.cadeau : "N'importe quoi"}</span>
          </summary>
          <div class="insideDiv">
            <h3>Détails&nbsp;:</h3>
            <div class="ideeDetailsDiv">${idee.details && idee.details !== "" ? idee.details : "aucune idée..."}</div>
            <h3>Lien&nbsp;:</h3>
            <p class="ideeLienP"><i class="fa-solid fa-globe"></i>${idee.lienComplet !== "" && idee.lienFinal !== "" ? `<a href="${idee.lienComplet}">${idee.lienFinal}</a>` : `<span>nulle part...</span>`}</p>
          </div>
        </details>
        
        <div class="optionsDiv displayNone">
          <button onclick="modify(this)" class="iconBtn"><i class="typcn typcn-edit"></i></button>
          <button onclick="trash(this)" class="iconBtn"><i class="typcn typcn-trash"></i></button>
          <button onclick="moveDown(this)" class="iconBtn"><i class="typcn typcn-arrow-down-outline"></i></button>
          <button onclick="moveUp(this)" class="iconBtn"><i class="typcn typcn-arrow-up-outline"></i></button>
        </div>
        <label class="optionsLabel">
          <input type="checkbox" onclick="displayOptionsDiv(this)" class="optionsInput displayNone" />
          <i class="fa-solid fa-ellipsis-vertical optionsI" style="width:23px;text-align:center;"></i>
        </label>
      </li>`;
    }).join("");
    let fadeColor = person.color.replace(".5", ".2");
    return `<details name="ideeCadeau" id="${person.initial}" class="namesDetails">
      <summary class="namesSummary" style="background-color:${person.color};">${person.nom}</summary>
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
         let ideeIdx = checkedBought.indexOf(li.id);
         if (ideeIdx > -1) {
           checkedBought.splice(ideeIdx, 1);
           localStorage.checkedBought = JSON.stringify(checkedBought);
           updateCBC();
         };
      };
  };
};
window.checkCheckedBought = checkCheckedBought;

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
          <button class="iconBtn" onclick="cancelNewIdee(this)"><i class="fa-solid fa-xmark"></i></button>
          <button class="iconBtn saveBtn" onclick="saveNewIdee(this)"><i class="fa-regular fa-floppy-disk"></i></button>
      </summary>
      <div class="insideDiv">
        <h3>Détails&nbsp;:</h3>
        <textarea id="addingDetails" class="addingDetails"></textarea>
        <h3>Lien&nbsp;:</h3>
        <p class="addingLienP"><i class="fa-solid fa-globe"></i><input class="addingLink" type="text"></p>
      </div>
    </details>
    
  </li>`;
  addLi.insertAdjacentHTML("beforebegin", newAddingLi);

  let textarea = addLi.parentElement.querySelector("#addingDetails");
  textarea.addEventListener("input", () => {
    textarea.style.height = textarea.scrollHeight + "px";    
  });
};
window.addBtn = addBtn;

function cancelNewIdee(thisOne){
  let addingLi = thisOne.parentElement.parentElement.parentElement;
  addingLi.remove();
};
window.cancelNewIdee = cancelNewIdee;

function saveNewIdee(thisOne){
  let addingLi = thisOne.parentElement.parentElement.parentElement;
  let addingUl = addingLi.parentElement;
  let initial = addingUl.dataset.initial;
  console.log(initial);
  let personIndex = theGifts.findIndex(id => id.initial == initial);

  //id
  let ideeId = crypto.randomUUID();

  //Nom du cadeau
  let ideeNom = addingLi.querySelector(".addingName").value;

  //Détails
  let ideeDetails = addingLi.querySelector(".addingDetails").value;

  // Lien
  let lienValue = addingLi.querySelector(".addingLink").value;
  let whole = "";
  let final = "";
  console.log(lienValue);
  if(lienValue !== ""){
    whole = String(lienValue); //va aller dans le href
    console.log(whole.length);
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
    final = idx !== -1 ? step2.substring(0, idx + 1) + "..." : step2; //va aller dans le <a>
    console.log(final);
  };

  let newIdee = {
    id: ideeId,
    cadeau: ideeNom,
    details: ideeDetails,
    lienComplet: whole,
    lienFinal: final
  };
  //add to theGifts and modif
  theGifts[personIndex].suggestions.push(newIdee);
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
      <button onclick="modify(this)" class="iconBtn"><i class="typcn typcn-edit"></i></button>
      <button onclick="trash(this)" class="iconBtn"><i class="typcn typcn-trash"></i></button>
      <button onclick="moveDown(this)" class="iconBtn"><i class="typcn typcn-arrow-down-outline"></i></button>
      <button onclick="moveUp(this)" class="iconBtn"><i class="typcn typcn-arrow-up-outline"></i></button>
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
  let personIndex = theGifts.findIndex(id => id.initial == initial);
  let ideeIdx = theGifts[personIndex].suggestions.findIndex(idee => idee.id == li.id);
  let itm = theGifts[personIndex].suggestions[ideeIdx];

  li.classList.add("addingLi");
  li.innerHTML = `<details class="detailsLi" open>
    <summary>
      <input class="addingName" type="text" placeholder="Idée cadeau" value="${itm.cadeau ? itm.cadeau : ""}" />
      <button id="cancelModifyIdee" class="iconBtn"><i class="fa-solid fa-xmark"></i></button>
      <button id="saveModifyIdee" class="iconBtn saveBtn"><i class="fa-regular fa-floppy-disk"></i></button>
    </summary>
    <div class="insideDiv">
      <h3>Détails&nbsp;:</h3>
      <textarea class="addingDetails">${itm.details !== "" ? itm.details.replace(/\n/g, '<br/>') : ""}</textarea>
      <h3>Lien&nbsp;:</h3>
      <p class="addingLienP"><i class="fa-solid fa-globe"></i><input class="addingLink" type="text" value="${itm.lienComplet ? itm.lienComplet : ""}"></p>
    </div>
  </details>`;

  let textarea = li.querySelector("textarea");
  textarea.addEventListener("input", () => {
    textarea.style.height = textarea.scrollHeight + "px";    
  });

  //Cancel the modification
  li.querySelector("#cancelModifyIdee").addEventListener("click", () => {
    //Recréation du li initial
    li.classList.remove("addingLi");
    li.innerHTML = `<label class="myCheckboxLabel">
        <input type="checkbox" onclick="checkCheckedBought(this)" class="checkBought displayNone">
        <i class="typcn typcn-media-stop-outline unchecked"></i>
        <i class="typcn typcn-input-checked checked"></i>
      </label>
      <details class="detailsLi">
        <summary>
          <span>${itm.cadeau !== "" ? itm.cadeau : "N'importe quoi"}</span>
        </summary>
        <div class="insideDiv">
          ${itm.details !== "" ? `<h3>Détails&nbsp;:</h3>
          <div class="ideeDetailsDiv">${itm.details.replace(/\n/g, '<br/>')}</div>` : ``}
          ${itm.lienComplet !== "" ? `<h3>Lien&nbsp;:</h3>
          <p class="ideeLienP"><i class="fa-solid fa-globe"></i><a href="${itm.lienComplet}">${itm.lienFinal}</a></p>` : ``}
        </div>
      </details>
      
      <div class="optionsDiv displayNone">
        <button onclick="modify(this)" class="iconBtn"><i class="typcn typcn-edit"></i></button>
        <button onclick="trash(this)" class="iconBtn"><i class="typcn typcn-trash"></i></button>
        <button onclick="moveDown(this)" class="iconBtn"><i class="typcn typcn-arrow-down-outline"></i></button>
        <button onclick="moveUp(this)" class="iconBtn"><i class="typcn typcn-arrow-up-outline"></i></button>
      </div>
      <label class="optionsLabel">
        <input type="checkbox" onclick="displayOptionsDiv(this)" class="optionsInput displayNone" />
        <i class="fa-solid fa-ellipsis-vertical optionsI" style="width:23px;text-align:center;"></i>
      </label>`;
  });

  //Save the modification
  li.querySelector("#saveModifyIdee").addEventListener("click", () => {
    //Nom du cadeau
    let ideeNom = li.querySelector(".addingName").value;

    //Détails
    let ideeDetails = li.querySelector(".addingDetails").value;

    // Lien
    let lienValue = li.querySelector(".addingLink").value;
    let whole = "";
    let final = "";
    console.log(lienValue);
    if(lienValue !== ""){
      whole = String(lienValue); //va aller dans le href
      console.log(whole.length);
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
      final = idx !== -1 ? step2.substring(0, idx + 1) + "..." : step2; //va aller dans le <a>
      console.log(final);
    };

    //Recréation du nouveau li
    li.classList.remove("addingLi");
    li.innerHTML = `<label class="myCheckboxLabel">
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
        <button onclick="modify(this)" class="iconBtn"><i class="typcn typcn-edit"></i></button>
        <button onclick="trash(this)" class="iconBtn"><i class="typcn typcn-trash"></i></button>
        <button onclick="moveDown(this)" class="iconBtn"><i class="typcn typcn-arrow-down-outline"></i></button>
        <button onclick="moveUp(this)" class="iconBtn"><i class="typcn typcn-arrow-up-outline"></i></button>
      </div>
      <label class="optionsLabel">
        <input type="checkbox" onclick="displayOptionsDiv(this)" class="optionsInput displayNone" />
        <i class="fa-solid fa-ellipsis-vertical optionsI" style="width:23px;text-align:center;"></i>
      </label>`;

    //modify and save theGifts and add to modify
    theGifts[personIndex].suggestions[ideeIdx] = {
      id: li.id,
      cadeau: ideeNom,
      details: ideeDetails,
      lienComplet: whole,
      lienFinal: final
    };
    console.log(theGifts[personIndex].suggestions);
    addModif(initial);
    localStorage.theGifts = JSON.stringify(theGifts);
    updateCBC();
  });
};
window.modify = modify;

function trash(thisOne){
  let li = thisOne.parentElement.parentElement;
  let ul = li.parentElement;
  let initial = ul.dataset.initial;
  let personIndex = theGifts.findIndex(id => id.initial == initial);
  let ideeIdx = theGifts[personIndex].suggestions.findIndex(idee => idee.id == li.id);
  theGifts[personIndex].suggestions.splice(ideeIdx, 1);
  li.remove();

  addModif(initial);
  localStorage.theGifts = JSON.stringify(theGifts);
  updateCBC();
};
window.trash = trash;

function moveDown(thisOne){
  let li = thisOne.parentElement.parentElement;
  let ul = li.parentElement;
  let initial = ul.dataset.initial;
  let personIndex = theGifts.findIndex(id => id.initial == initial);
  let ideeIdx = theGifts[personIndex].suggestions.findIndex(idee => idee.id == li.id);

  const array = theGifts[personIndex].suggestions;
  if(array.length > 1){
    const indexFrom = ideeIdx; // Index of element to move
    const indexTo = ideeIdx == array.length - 1 ? 0 : ideeIdx + 1; // New index for the element

    [array[indexFrom], array[indexTo]] = [array[indexTo], array[indexFrom]]; 
    console.log(array);

    let liNext = li.nextElementSibling;
    if(liNext && liNext.className !== "addBtnLi"){
      liNext.insertAdjacentElement("afterend", li);
    } else{
      let firstOne = ul.firstElementChild;
      firstOne.insertAdjacentElement("beforebegin", li);
    };

    addModif(initial);
    localStorage.theGifts = JSON.stringify(theGifts);
    updateCBC();
  };
};
window.moveDown = moveDown;

function moveUp(thisOne){
  let li = thisOne.parentElement.parentElement;
  let ul = li.parentElement;
  let initial = ul.dataset.initial;
  let personIndex = theGifts.findIndex(id => id.initial == initial);
  let ideeIdx = theGifts[personIndex].suggestions.findIndex(idee => idee.id == li.id);

  const array = theGifts[personIndex].suggestions;
  if(array.length > 1){
    const indexFrom = ideeIdx; // Index of element to move
    const indexTo = ideeIdx == 0 ? array.length - 1 : ideeIdx - 1; // New index for the element

    [array[indexFrom], array[indexTo]] = [array[indexTo], array[indexFrom]]; 
    console.log(array);

    let liPrev = li.previousElementSibling;
    if(liPrev){
      liPrev.insertAdjacentElement("beforebegin", li);
    } else{
      let addOne = ul.querySelector(".addBtnLi");
      addOne.insertAdjacentElement("beforebegin", li);
    };

    addModif(initial);
    localStorage.theGifts = JSON.stringify(theGifts);
    updateCBC();
  };  
};
window.moveUp = moveUp;

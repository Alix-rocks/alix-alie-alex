import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { app, analytics, db, auth, provider } from "../myFirebase.js";

const cloudIt = document.querySelector("#cloudIt");
let listeMemes = [];
let listeTags = [];
let newListeTexts = [];
if(localStorage.getItem("newListeTexts")){
  newListeTexts = JSON.parse(localStorage.newListeTexts);
};
localStorage.newListeTexts = JSON.stringify(newListeTexts);
let newListeImages = [];
if(localStorage.getItem("newListeImages")){
  newListeImages = JSON.parse(localStorage.newListeImages);
};
localStorage.newListeImages = JSON.stringify(newListeImages);
let toUL;
if (localStorage.getItem("toUL")) {
  toUL = localStorage.toUL;
  let toULD = toUL >= 10 ? 1 : "." + toUL;
  cloudIt.style.backgroundColor = "rgba(237, 20, 61, " + toULD + ")";
} else {
  toUL = 0;  
  localStorage.setItem("toUL", toUL);
};


async function getListes() {  
  const getMeme = await getDoc(doc(db, "shit", "meme"));  
  if(getMeme.exists()){    
    let listeTexts = getMeme.data().listeTexts;    
    let listeImages = getMeme.data().listeImages;    
    listeTags = getMeme.data().listeTags;    
    listeMemes = [...listeTexts, ...listeImages];    
    showON();    
    createForm("new")  
    
  };
  
};
getListes();

async function saveListes(){  
  let listeTexts = [];  
  let listeImages = [];  
  listeMemes.map(meme => {    
    if(meme.type == "text"){      
      listeTexts.push(meme);    
    } else if(meme.type == "image"){      
      listeImages.push(meme);    
    };  
  });  //What if we modify listeMemes?!  newListeTexts = JSON.parse(localStorage.newListeTexts);  console.log(newListeTexts);  //newListeImages = JSON.parse(localStorage.newListeImages);  //listeTexts.concat(newListeTexts);  let listeTextsWhole = [...listeTexts, ...newListeTexts];  console.log(listeTextsWhole);  listeImages.concat(newListeImages);  const docRef = doc(db, "shit", "meme");  const docSnap = await getDoc(docRef);  if (docSnap.exists()){    await updateDoc(doc(db, "shit", "meme"), {      listeTexts: listeTextsWhole,      listeImages: listeImages,      listeTags: listeTags    });        resettoUL();  };
};
cloudIt.addEventListener("click", saveListes);
function updatetoUL(){  
  toUL++;  
  localStorage.toUL = toUL;  
  let toULD = toUL >= 10 ? 1 : "." + toUL;  
  cloudIt.style.backgroundColor = "rgba(237, 20, 61, " + toULD + ")";
};
function resettoUL(){  
  toUL = 0;  
  cloudIt.style.backgroundColor = "rgba(237, 20, 61, 0)";  
  localStorage.toUL = toUL;
};
let shitID = "";
function showON(){  
  console.log(listeMemes);  
  let randyMemes = RandArray(listeMemes);  
  let shitShow = document.querySelector("#shitShow");    
  shitShow.innerHTML = "Let's see what we've got for you today..."  
  let idR = 0;  
  console.log(idR);  
  const pervBtn = document.querySelector("#pervBtn");  
  pervBtn.classList.add("hidden");  
  pervBtn.addEventListener("click", () => {    
    nextBtn.classList.remove("hidden");    
    idR--;    
    if(idR == 0){      
      pervBtn.classList.add("hidden");    
    };        
    console.log(idR);    
    shitShow.innerHTML = listeMemes[randyMemes[idR]].meme;    
    shitID = listeMemes[randyMemes[idR]].id;  
    
  });  
  const nextBtn = document.querySelector("#nextBtn");  
  nextBtn.addEventListener("click", () => {    
    pervBtn.classList.remove("hidden");    
    idR++;    
    if(idR == randyMemes.length - 1){      
      nextBtn.classList.add("hidden");    
    };        
    console.log(idR);    
    shitShow.innerHTML = listeMemes[randyMemes[idR]].meme;    
    shitID = listeMemes[randyMemes[idR]].id;  
    
  });  
  const modBtn = document.querySelector("#modBtn");  
  modBtn.addEventListener("click", () => {    
    createForm("mod");  
  });
};//non, you have to create a new form otherwise submit will just create a new one instead of modify it.
function createForm(why) {  
  let shit = {};  
  if(why == "new"){    
    shit = {      
      id: crypto.randomUUID(),      
      type: "text",      
      meme: "",      
      tags: [] //index of tag in listeTags (non, won't work if we modify them) 
      //font: ""    
      };  
  } else{    
    let shitIdx = listeMemes.findIndex(meme => meme.id == shitID);    
    shit = listeMemes[shitIdx];  
  };  
  let tagsList = listeTags.map((tag, idx) => {    
    return `<input id="tag${idx}" class="cossin" name="tags" type="checkbox" value="${idx}" ${shit.tags.includes(idx) ? `checked` : ``}/>      
    <label for="tag${idx}" class="tagLabel">${tag}</label>`  
  }).join("");  
  let form = `<h2 style="text-align:center;">${why == "new" ? `Add your own shit to the pile` : `So that wasn't good enough?!`}</h2>    
  <form id="shitForm">      
  <div>        
  <label>Meme:</label>        
  <textarea id="quote" autocomplete="off">${shit.meme}</textarea>      
  </div>      
  <div>        
  <label>Tags:</label>        
  <div class="tagsListWhole">          
  <input id="tagsListInput" class="cossin" name="addTheme" type="checkbox"/>          
  <label for="tagsListInput" class="tagsListLabel">Tags<span class="typcn typcn-chevron-right dropchevron"></span></label>          
  <div id="tagsListDrop">            
  ${tagsList}          
  </div>        
  </div>      
  </div>      
  ${why == "mod" ? `<button id="saveBtn" type="submit">Come on, save it!</button>      
  <button id="trashBtn" type="reset">Trash that!</button>` :       
  `<button id="submitBtn" type="submit">Come on, add it!</button>      
  <button id="resetBtn" type="reset">Nevermind</button>`}    
  </form>`;  
  document.querySelector("#shitForm").innerHTML = form;    
  function getShitTags() {    
    let shitTags = [];    
    document.getElementsByName("tags").forEach(tag => {      
      if(tag.checked){        
        shitTags.push(tag.value);      
      };    
    });    
    return shitTags;  
  };  
  if(why == "new"){    
    document.querySelector("#submitBtn").addEventListener("click", (e) => {      
      e.preventDefault();      
      shit.tags = getShitTags();      
      shit.meme = document.querySelector("#quote").value.replace(/\n/g, '<br>');      
      newListeTexts.push(shit);      
      localStorage.newListeTexts = JSON.stringify(newListeTexts);      
      updatetoUL();    
    });    
    document.querySelector("#resetBtn").addEventListener("click", () => {
      });  
  } else{    
    document.querySelector("#saveBtn").addEventListener("click", (e) => {      
      e.preventDefault();      
      listeMemes[shitIdx].tags = getShitTags();      
      listeMemes[shitIdx].meme = document.querySelector("#quote").value.replace(/\n/g, '<br>');            
      //localStorage.newListeTexts = JSON.stringify(newListeTexts);      
      updatetoUL();    
    });    
    document.querySelector("#trashBtn").addEventListener("click", () => {        
      
    });  
  };
};

// To add your own shitconst addYOSForm = document.querySelector('#addYOS')addYOSForm.addEventListener('submit', (e) => {  e.preventDefault();  //let finalList = []  //var markedCheckbox = document.getElementsByName('theme');  //for (var checkbox of markedCheckbox) {    //if (checkbox.checked) {      //finalList.push(checkbox.value);    //}  //}
  //if (addYOSForm.quote.value === "" || finalList.length === 0) {    //document.querySelector("#badShit").innerHTML = "You forgot something...";    //document.querySelector("#wisely").innerHTML = "Choose wisely...";  //} else {    let quoteHTML = addYOSForm.quote.value.replace(/\n/g, '<br>');        let newQuote = {      id: crypto.randomUUID(),      type: "text",      meme: quoteHTML      //tags: []      //font: ""    };    newListeTexts.push(newQuote);    localStorage.newListeTexts = JSON.stringify(newListeTexts);    console.log(newListeTexts);    updatetoUL();    addYOSForm.reset();});
function RandArray(array) {  
  let max = array.length;  
  let min = 0;  
  let randArray = [];  
  for (let i = 0; i < max; i++) {    
    let x = Math.floor(Math.random() * max) + min;    
    if (randArray.includes(x) == true) {      
      i = i - 1;    
    } else {      
      if (x > max == false) {        
        randArray.push(x);      
      };    
    };  
  };  
  return randArray;
};

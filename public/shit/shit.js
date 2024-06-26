import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { app, analytics, db, auth, provider } from "../myFirebase.js";

const cloudIt = document.querySelector("#cloudIt");
let listeMemes = [];
let listeTags = [
  {
    num: "00",
    tag: "LOL",
    type: "mood"
  }, {
    num: "01",
    tag: "Relationships",
    type: "theme"
  }, {
    num: "02",
    tag: "Old age",
    type: "theme"
  }, {
    num: "03",
    tag: "Anti-social",
    type: "theme"
  }, {
    num: "04",
    tag: "Coffee",
    type: "theme"
  }, {
    num: "05",
    tag: "Deep",
    type: "mood"
  }, {
    num: "06",
    tag: "Psycho",
    type: "mood"
  }, {
    num: "07",
    tag: "Self-loving",
    type: "theme"
  }];
//let newListeTexts = [];
//if(localStorage.getItem("newListeTexts")){
  //newListeTexts = JSON.parse(localStorage.newListeTexts);
//};
//localStorage.newListeTexts = JSON.stringify(newListeTexts);
//let newListeImages = [];
//if(localStorage.getItem("newListeImages")){
  //newListeImages = JSON.parse(localStorage.newListeImages);
//};
//localStorage.newListeImages = JSON.stringify(newListeImages);
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
  //if(localStorage.getItem("listeMemes")){
    //listeMemes = JSON.parse(localStorage.listeMemes);
  //} else 
  if(getMeme.exists()){    
    let listeTexts = getMeme.data().listeTexts;    
    let listeImages = getMeme.data().listeImages;    
    listeMemes = [...listeTexts, ...listeImages];
  };
  localStorage.listeMemes = JSON.stringify(listeMemes);
  
  //if (localStorage.getItem("listeTags")) {
    //listeTags = JSON.parse(localStorage.listeTags);
  //} else if (getMeme.exists()) {
    //listeTags = getMeme.data().listeTags;
  //};
  localStorage.listeTags = JSON.stringify(listeTags);
    
  showON();    
  createForm("new");
  
};
getListes();

async function saveListes(){  
  let listeTexts = [];  
  let listeImages = [];  
  listeMemes.map(meme => {    
    if(meme.type == "T"){      
      listeTexts.push(meme);    
    } else if(meme.type == "I"){      
      listeImages.push(meme);    
    };  
  });  //What if we modify listeMemes?!  newListeTexts = JSON.parse(localStorage.newListeTexts);  console.log(newListeTexts);  //newListeImages = JSON.parse(localStorage.newListeImages);  //listeTexts.concat(newListeTexts);  let listeTextsWhole = [...listeTexts, ...newListeTexts];  console.log(listeTextsWhole);  listeImages.concat(newListeImages);  
  const docRef = doc(db, "shit", "meme");  
  const docSnap = await getDoc(docRef);  
  if (docSnap.exists()){    
    await updateDoc(doc(db, "shit", "meme"), {      
      listeTexts: listeTexts,      
      listeImages: listeImages,      
      listeTags: listeTags    
    });        
    resettoUL();
  };
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
  const shitShow = document.querySelector("#shitShow");    
  let idR = -1;
  const pervBtn = document.querySelector("#pervBtn");
  const nextBtn = document.querySelector("#nextBtn");
  const modBtn = document.querySelector("#modBtn");
  function state(){
    if(idR == 0){
      pervBtn.classList.add("hidden");
      nextBtn.classList.remove("hidden");
      modBtn.classList.remove("hidden");
    } else if (idR > 0 && idR < randyMemes.length - 1) {
      pervBtn.classList.remove("hidden");
      nextBtn.classList.remove("hidden");
      modBtn.classList.remove("hidden");
    } else if (idR == randyMemes.length - 1) {
      pervBtn.classList.remove("hidden");
      nextBtn.classList.add("hidden");
      modBtn.classList.remove("hidden");
    } else if(idR == randyMemes.length){
      idR = -1;
      pervBtn.classList.add("hidden");
      nextBtn.classList.add("hidden");
      modBtn.classList.add("hidden");
    };
    shitShow.innerHTML = idR == -1 ? "It's over!" : listeMemes[randyMemes[idR]].meme.replace(/\n/g, '<br>');
    shitID = listeMemes[randyMemes[idR]].id;
  };
    
  pervBtn.addEventListener("click", () => {    
    idR--;
    state();
  });  
    
  nextBtn.addEventListener("click", () => {    
    idR++;
    state();
  });  
    
  modBtn.addEventListener("click", () => {    
    createForm("mod");  
  });
};//non, you have to create a new form otherwise submit will just create a new one instead of modify it.
function createForm(why) {  
  let shit = {};  
  let shitIdx;
  if(why == "new"){    
    shit = {      
      id: crypto.randomUUID(),      
      type: "T", // "T" = text. "I" = image      
      meme: "",      
      tags: [] //tag.num of tag in listeTags (non, won't work if we modify them) 
      //font: "" //font.num of listeFonts    
      };  
  } else{    
    shitIdx = listeMemes.findIndex(meme => meme.id == shitID);    
    shit = listeMemes[shitIdx];  
  };
  let tagsList = listeTags.map((tag, idx) => {
    return `<li><input id="tag${idx}" class="cossin" name="tags" type="checkbox" value="${tag.num}" ${shit.tags.includes(tag.num) ? `checked` : ``}/>      
    <label for="tag${idx}" class="tagLabel">${tag.tag}</label></li>`  
  }).join("");  
  let form = `<h2 style="text-align:center;">${why == "new" ? `Add your own shit to the pile` : `So that wasn't good enough for ya?!`}</h2>    
  <form id="shitForm">      
    <div>        
      <label>Meme:</label>        
      <textarea id="quote" autocomplete="off">${shit.meme}</textarea>      
    </div>      
    <div>        
      <label>Tags:</label>        
      <div class="tagsListWhole">          
        <!-- <input id="tagsListInput" class="cossin" name="addTheme" type="checkbox"/>          
        <label for="tagsListInput" class="tagsListLabel">Tags<i class="typcn typcn-chevron-right dropchevron"></i></label> -->        
        <ul class="tagsListDrop">            
          ${tagsList}
          <li><input id="plusTagInput" type="text"><button id="plusTagBtn" class="btnIcon"><i class="typcn typcn-plus"></i></button></li>
        </ul>        
      </div>      
    </div>      
    ${why == "mod" ? `<button id="saveBtn" type="submit">Come on, save it!</button>      
    <button id="trashBtn" type="reset">Trash that!</button>` :       
    `<button id="submitBtn" type="submit">Come on, add it!</button>      
    <button id="resetBtn" type="reset">Nevermind</button>`}    
  </form>`;  
  let shitForm = document.querySelector("#shitForm");
  shitForm.innerHTML = form;  
  const plusTagBtn = document.querySelector("#plusTagBtn");
  const plusTagInput = document.querySelector("#plusTagInput");
  plusTagBtn.addEventListener("click", () => {
    let maxNum = listeTags.sort((a,b)=>b.num-a.num)[0].num; 
    let newTag = {
      num: maxNum,
      tag: plusTagInput.value
    };
    listeTags.push(newTag);
    localStorage.listeTags = JSON.stringify(listeTags);
    updatetoUL();
  });
  function getShitTags() {    
    let shitTags = [];    
    document.getElementsByName("tags").forEach(tag => {      
      if(tag.checked){
        shitTags.push(tag.value);      
      };    
    });    
    return shitTags;  
  };  
     
  shitForm.addEventListener("submit", (e) => {   
    e.preventDefault();
    if(why == "new"){
      listeMemes.push(shit);
      shitIdx = listeMemes.findIndex(meme => meme.id == shit.id);
    };    
    listeMemes[shitIdx].tags = getShitTags();      
    listeMemes[shitIdx].meme = document.querySelector("#quote").value; 
    localStorage.listeMemes = JSON.stringify(listeMemes);      
    updatetoUL(); 
    shitForm.reset();   
  });    

  shitForm.addEventListener("reset", () => {        
    if(why == "mod"){
      listeMemes.splice(shitIdx, 1);
      localStorage.listeMemes = JSON.stringify(listeMemes);      
      updatetoUL();
      shitForm.reset();
    };
  });  
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

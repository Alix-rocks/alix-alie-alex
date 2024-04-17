import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, deleteField, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { app, analytics, db, auth, provider } from "../myFirebase.js";

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

async function getListes() {
  const getMeme = await getDoc(doc(db, "shit", "meme"));
  if(getMeme.exists()){
    let listeTexts = getMeme.data().listeTexts;
    let listeImages = getMeme.data().listeImages;
    listeTags = getMeme.data().listeTags;
    listeMemes = listeTexts.concat(listeImages);
    showON();
    //function to start the whole thing
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
  });
  // newListeTexts = JSON.parse(localStorage.newListeTexts);
  // newListeImages = JSON.parse(localStorage.newListeImages);
  listeTexts.concat(newListeTexts);
  listeImages.concat(newListeImages);
  const docRef = doc(db, "shit", "meme");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()){
    await updateDoc(doc(db, "shit", "meme"), {
      listeTexts: listeTexts,
      listeImages: listeImages,
      listeTags: listeTags
    });
    resetCBC();
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
  cloudIt.style.backgroundColor = "rgba(237, 20, 61, 0)";
  localStorage.cBC = cBC;
};

function showON(){
  console.log(listeMemes);
  listeTags.map((tag, idx) => {
    return `<input id="tag${idx}" class="cossin ddThemeChoice" name="theme" type="checkbox" value="${tag}"/>
    <label for="tag${idx}" class="ddThemeListLabel">${tag}</label>`
  })
};
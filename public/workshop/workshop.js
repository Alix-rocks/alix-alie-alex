import { rtdb, getDatabase, ref, set, onValue } from "../../myFirebase.js";

onValue(ref(rtdb, "workshop/control"), (snapshot) => {
  if (!snapshot.val()) return;
  handleCommand(snapshot.val().action, snapshot.val().data);
});

let screenHeight;
let screenWidth;
(() => {
  screenHeight = window.innerHeight - 16;
  screenWidth = window.innerWidth - 16;
  document.querySelector(':root').style.setProperty('--vw', `${screenWidth}px`);
  document.querySelector(':root').style.setProperty('--vh', `${screenHeight}px`);
})();

function handleCommand(action, data){
  switch(action){
    case "slideNext":
      slideNext();
      break;
    case "slidePrev":
      slidePrev();
      break;
    case "stepNext":
      stepNext();
      break;
    case "stepPrev":
      stepPrev();
    case "rain":
      wordRain(data);
      break;
    default:
      console.log(action, data);
      break;
  };
};

const emojiRegex = /\p{Emoji}/gu; // 'g' for global, 'u' for Unicode mode
let sectionShowed;
let kasesIds = [];

function displaySection(sectionToShow){
  document.querySelectorAll("section").forEach(section => {
    if(section == sectionToShow){
      section.classList.remove("displayNone");
    } else{
      section.classList.add("displayNone");
    };
  });
  sectionShowed = sectionToShow;
  if(sectionToShow.classList.contains("wordCloud")){
    wordCloudCreation();
  };
};

function slideNext(){
  kasesIds = [];
  let sectionShowedNum = sectionShowed.id.slice(5);
  let sectionToShowId = "slide" + (Number(sectionShowedNum) + 1);
  let sectionToShow = document.querySelector("#" + sectionToShowId);
  displaySection(sectionToShow);
};
window.slideNext = slideNext;

function slidePrev(){
  kasesIds = [];
  let sectionShowedNum = sectionShowed.id.slice(5);
  let sectionToShowId = "slide" + (Number(sectionShowedNum) - 1);
  let sectionToShow = document.querySelector("#" + sectionToShowId);
  displaySection(sectionToShow);
};
window.slidePrev = slidePrev;





function wordCloudCreation(){

  kasesIds = [];

  let words = Array.from(sectionShowed.querySelectorAll("span")).map(element => element.innerText);
  console.log(words);
  set(ref(rtdb, "workshop/feedback"), {
    need: "wordDropdownCreation",
    info: words,
    timestamp: Date.now()
  });
  //wordDropdownCreation(words);
  
  let colNum = screenWidth > 900 ? 4 : 3;
  let linNum = screenHeight > 900 ? 4 : 3;

  let kaseWidth = (screenWidth) / colNum;

  // let h2Height = Number(getComputedStyle(sectionShowed.querySelector("h2")).height.match(/\d+/g)[0]);
  // let h2MarginTop = Number(getComputedStyle(sectionShowed.querySelector("h2")).marginTop.match(/\d+/g)[0]);
  // let h2MarginBottom = Number(getComputedStyle(sectionShowed.querySelector("h2")).marginBottom.match(/\d+/g)[0]);
  // let h2HeightTotal = h2Height + h2MarginTop + h2MarginBottom;
  // console.log(h2HeightTotal);
  let topHeight = Number(getComputedStyle(sectionShowed.querySelector(".topText")).height.match(/\d+/g)[0]);
  let bottomHeight = Number(getComputedStyle(sectionShowed.querySelector(".bottomText")).height.match(/\d+/g)[0]);
  
  console.log(bottomHeight);
  
  let kaseHeight = (screenHeight - (topHeight + bottomHeight)) / linNum;
  console.log(kaseHeight);
  

  let kaseNum = 0;
  let lins = [];
  for(let lin = 0; lin < linNum; lin++){
    let cols = [];
    for(let col = 0; col < colNum; col++){
      let kaseId = "cBC" + (kaseNum + 1);
      let kase = `<div class="cloudBoardCase" id="${kaseId}" style="width:${kaseWidth}px; height:${kaseHeight}px;"></div>`;
      cols.push(kase);
      kasesIds.push(kaseId);
      kaseNum++;
    };
    let thisLineCols = cols.join("");
    let line = `<div class="cloudBoardLine">${thisLineCols}</div>`;
    lins.push(line);
  };
  let allTheLines = lins.join("");
  sectionShowed.querySelector("#cloudBoardTotal").innerHTML = allTheLines;
  console.log(kasesIds);
};

function wordRain(word){
  //random index
  let kaseIndex = Math.floor(Math.random() * kasesIds.length);
  let kaseId = kasesIds[kaseIndex];
  console.log(kaseId);

  //random position within the Kase (5 different classes)
  let positions = ["top", "top left", "top right", "bottom", "bottom left", "bottom right", "left", "right", "center"];
  let positionIndex = Math.floor(Math.random() * positions.length);
  let position = positions[positionIndex];

  //random angle (3 or 5 different angles)
  let tilts = ["tilt15", "tilt-15", "notilt", "tilt15", "tilt-15", "notilt"];
  let tiltIndex = Math.floor(Math.random() * tilts.length);
  let tilt = tilts[tiltIndex];

  //random color
  let colors = ["softBlue", "teal", "purple", "softBlue", "teal", "purple"];
  let colorIndex = Math.floor(Math.random() * colors.length);
  let color = colors[colorIndex];

  //random font
  
  sectionShowed.querySelector("#" + kaseId).innerHTML = `<span class="wordSpan ${word.match(emojiRegex) ? "emojiSpan" : ""} ${position} ${tilt}" style="background-color:var(--accent-30-${color})">${word}</span>`;
  kasesIds.splice(kaseIndex, 1);

};
  




let sectionToShow = document.querySelector("#slide1");
displaySection(sectionToShow);
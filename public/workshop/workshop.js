import { rtdb, getDatabase, ref, set, onValue } from "../../myFirebase.js";

set(ref(rtdb, "workshop/control"), null);
set(ref(rtdb, "workshop/feedback"), null);

onValue(ref(rtdb, "workshop/control"), (snapshot) => {
  if (!snapshot.val()) return;
  handleCommand(snapshot.val().action, snapshot.val().data);
  set(ref(rtdb, "workshop/control"), null);
});

let landscapeMode;
let screenHeight;
let screenWidth;
const emojiRegex = /\p{Emoji}/gu; // 'g' for global, 'u' for Unicode mode
let sectionShowed = null;
let allSteps = null;
let stepCurrentIndex = 0;
let stepCurrent = null;
let kasesIds = [];
const positions = ["top", "top left", "top right", "bottom", "bottom left", "bottom right", "left", "right", "center", "center", "center", "center"];
let shuffledPositions = [];
const tilts = ["tilt15", "tilt-15", "notilt", "tilt75", "tilt-75"];
let shuffledTilts = [];
const colors = ["softBlue", "teal", "purple"];
let shuffledColors = [];

(() => {
  screenHeight = window.innerHeight - 16;
  screenWidth = window.innerWidth - 16;
  if(screenWidth > screenHeight){ //if true => landscape mode (16:9)
    landscapeMode = true;
    screenWidth = screenHeight * 16 / 9;
  } else if(screenHeight > screenWidth){ // portrait mode (20:9)
    landscapeMode = false;
    screenHeight = screenWidth * 20 / 9;
  }
  document.querySelector(':root').style.setProperty('--vw', `${screenWidth}px`);
  document.querySelector(':root').style.setProperty('--vh', `${screenHeight}px`);

  let allSlides = getAllSlides();
  sendAllSlides(allSlides);
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
      break
    case "rain":
      wordRain(data);
      break;
    case "refresh":
      refreshControl();
      break;
    default:
      console.log(action, data);
      break;
  };
};

function getAllSlides(){
  let allSlides = [];
  document.querySelectorAll("section").forEach(section => {
    let slide = {
      num: section.dataset.slide,
      titre: section.dataset.titre,
      type: section.dataset.type
    };
    allSlides.push(slide);
  });
  return allSlides;
};
function sendAllSlides(allSlides){
  set(ref(rtdb, "workshop/feedback"), {
    need: "all",
    info: allSlides,
    timestamp: Date.now()
  });
};

function displaySection(sectionToShow){
  allSteps = null;
  let stepButtonStates = getStepButtonState();
  sendStepButtonState(stepButtonStates);
  stepCurrentIndex = 0;
  stepCurrent = null;
  kasesIds = [];
  shuffledPositions = [];
  shuffledTilts = [];
  shuffledColors = [];
  document.querySelectorAll("section").forEach(section => {
    if(section == sectionToShow){
      section.classList.remove("displayNone");
    } else{
      section.classList.add("displayNone");
    };
  });
  sectionShowed = sectionToShow;
  console.log(sectionShowed);
  if(sectionShowed.classList.contains("wordCloud")){
    wordCloudCreation();
  };
  if(sectionShowed.classList.contains("imaging")){
    fixImaging();
  };
  if(sectionShowed.classList.contains("stepped")){
    stepsCreation();
  };
  let currentSlideInfo = getCurrentSlideInfo();
  sendCurrentSlideInfo(currentSlideInfo);
};

function getCurrentSlideInfo(){
  let currentSlideInfo = {
    num: sectionShowed.dataset.slide,
    titre: sectionShowed.dataset.titre,
    type: sectionShowed.dataset.type
  };
  return currentSlideInfo;
};

function sendCurrentSlideInfo(currentSlideInfo){
  set(ref(rtdb, "workshop/feedback"), {
    need: "cs",
    info: currentSlideInfo,
    timestamp: Date.now()
  });
};


function slideNext(){
  let sectionShowedNum = Number(sectionShowed.dataset.slide);
  let sectionToShow = document.querySelector(`section[data-slide="${sectionShowedNum + 1}"]`);
  if(sectionToShow){
    displaySection(sectionToShow);
  };
};
window.slideNext = slideNext;

function slidePrev(){
  let sectionShowedNum = Number(sectionShowed.dataset.slide);
  let sectionToShow = document.querySelector(`section[data-slide="${sectionShowedNum - 1}"]`);
  if(sectionToShow){
    displaySection(sectionToShow);
  };
};
window.slidePrev = slidePrev;

function fixImaging(){
  let image = sectionShowed.querySelector("img");
  image.classList.add(landscapeMode ? "landscapeMode" : "portraitMode");
};

function stepsCreation(){
  allSteps = sectionShowed.querySelectorAll('[data-step]');
  stepCurrentIndex = 0;
  stepCurrent = allSteps[stepCurrentIndex];
  let stepButtonStates = getStepButtonState();
  sendStepButtonState(stepButtonStates);
};

function stepNext(){
  if(stepCurrentIndex <= allSteps.length - 2){
    stepCurrentIndex = stepCurrentIndex + 1;
    stepCurrent = allSteps[stepCurrentIndex];
    stepCurrent.classList.remove("invisible");
  };
  let stepButtonStates = getStepButtonState();
  sendStepButtonState(stepButtonStates);
};

function stepPrev(){
  if(stepCurrentIndex !== 0){
    stepCurrent.classList.add("invisible");
    stepCurrentIndex = stepCurrentIndex - 1;
    stepCurrent = allSteps[stepCurrentIndex];
  };
  let stepButtonStates = getStepButtonState();
  sendStepButtonState(stepButtonStates);
};

function getStepButtonState(){
  let nextState = allSteps == null ? false : stepCurrentIndex <= allSteps.length - 2 ? true : false;
  let prevState = allSteps == null ? false : stepCurrentIndex !== 0 ? true : false;
  let stepButtonStates = {
    next: nextState,
    prev: prevState
  };
  return stepButtonStates;
};
function sendStepButtonState(stepButtonStates){
  set(ref(rtdb, "workshop/feedback"), {
    need: "sbf",
    info: stepButtonStates,
    timestamp: Date.now()
  });
};

function wordCloudCreation(){

  kasesIds = [];
  shuffledPositions = [];
  shuffledTilts = [];
  shuffledColors = [];

  let words = getWords();
  
  set(ref(rtdb, "workshop/feedback"), {
    need: "wddc",
    info: words,
    timestamp: Date.now()
  });
  
  let colNum = screenWidth > 900 ? 4 : 3;
  let linNum = screenHeight > 900 ? 4 : 3;

  let kaseWidth = (screenWidth) / colNum;

  let topHeight = Number(getComputedStyle(sectionShowed.querySelector(".topText")).height.match(/\d+/g)[0]);
  let bottomHeight = Number(getComputedStyle(sectionShowed.querySelector(".bottomText")).height.match(/\d+/g)[0]);
  
  let kaseHeight = (screenHeight - (topHeight + bottomHeight)) / linNum;

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

  //Creating the randomized arrays
  kasesIds = shuffleArray(kasesIds);
  shuffledPositions = multiShuffle(positions);
  shuffledTilts = multiShuffle(tilts);
  shuffledColors = multiShuffle(colors);
};

function getWords(){
  return Array.from(sectionShowed.querySelectorAll("span")).map(element => element.innerText);
};

//To randomize
function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function multiShuffle(arr) {
  let times = Math.ceil(kasesIds.length / arr.length);
  const result = [];
  for (let i = 0; i < times; i++) {
    const shuffled = shuffleArray(arr);
    result.push(...shuffled);
  }
  return result;
}

let xIndex = -1;
function wordRain(word){ 
  xIndex++; 
  let emoji = word.match(emojiRegex) ? true : false;
  let thisKase = sectionShowed.querySelector("#" + kasesIds[xIndex]);
  thisKase.innerHTML = `<span class="wordSpan ${emoji ? "emojiSpan" : ""} ${shuffledPositions[xIndex]} ${shuffledTilts[xIndex]}" style="background-color:var(--accent-30-${shuffledColors[xIndex]})">${word}</span>`;

  let thisSpan = thisKase.querySelector("span");
  if(!emoji){
    letsFitIt(thisSpan);
  };
  
};

async function letsFitIt(element) {
  let nowHeight = element.scrollHeight;
  let nowLineHeight = parseFloat(getComputedStyle(element).lineHeight);
  let nowNumberOfLines = Math.floor(nowHeight / nowLineHeight);
  console.log('nowNumberOfLines: ' + nowNumberOfLines);
  let nowFontSize = parseFloat(getComputedStyle(element).fontSize);
  console.log("nowFontSize first: " + nowFontSize)
  element.style.overflowWrap = "break-word";

  while (true) {
    nowFontSize++;
    element.style.fontSize = nowFontSize + "px";

    // 🔥 allow DOM to update
    await new Promise(resolve => requestAnimationFrame(resolve));

    let newHeight = element.scrollHeight;
    let newLineHeight = parseFloat(getComputedStyle(element).lineHeight);
    let newNumberOfLines = Math.floor(newHeight / newLineHeight);

    if (newNumberOfLines > nowNumberOfLines) {
      // We exceeded the limit — stop
      break;
    }
  }
 console.log("nowFontSize out: " + nowFontSize)

  // Go back to the last valid size
  element.style.fontSize = (nowFontSize - 1) + "px";
};

function refreshControl(){
  let words = [];
  if(sectionShowed.classList.contains("wordCloud")){
    words = getWords(); //array
  };

  let stepButtonStates = getStepButtonState(); //object

  let allSlides = getAllSlides(); //array of objects

  let currentSlide = getCurrentSlideInfo(); //object

  let refreshAll = {
    words: words,
    steps: stepButtonStates,
    slides: allSlides,
    current: currentSlide
  };

  set(ref(rtdb, "workshop/feedback"), {
    need: "refresh",
    info: refreshAll,
    timestamp: Date.now()
  });
  
};



let sectionToShow = document.querySelector('section[data-slide="1"]');
displaySection(sectionToShow);





// In workshop:
// let words = [];
// if(sectionShowed.classList.contains("wordCloud")){
//   words = Array.from(sectionShowed.querySelectorAll("span")).map(element => element.innerText); //array
// };
// let steps = getStepButtonState(); //objet
// let refreshAll = {
//   words: words,
//   steps: steps
// };

// set(ref(rtdb, "workshop/feedback"), {
//   need: "refresh",
//   info: refreshAll,
//   timestamp: Date.now()
// });

// In workshopControl:
// onValue(ref(rtdb, "workshop/control"), (snapshot) => {
//   if (!snapshot.val()) return;
//   handleCommand(snapshot.val().action, snapshot.val().data);
//   set(ref(rtdb, "workshop/control"), null);
// });
// function handleCommand(action, data){ 
//   switch(action){
//     case "refresh": 
//       stepButtonFixing(info.steps);
//       if(info.words.length !== 0){ //why is that line not working??
//         wordDropdownCreation(info.words);
//       };
//       break;
//     default:
//       console.log(action, data);
//       break;
//   };
// };
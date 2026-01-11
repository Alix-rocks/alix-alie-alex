import { rtdb, getDatabase, ref, set, onValue } from "../../myFirebase.js";

let landscapeMode;
let screenHeight;
let screenWidth;
const emojiRegex = /\p{Emoji}/gu; // 'g' for global, 'u' for Unicode mode
let sectionShowed = null;
let allSteps = null;
let stepCurrentIndex = 0;
let stepCurrent = null;
let kasesIds = [];
let xIndex = -1;
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
  };
    document.documentElement.style.setProperty('--vh', `${screenHeight}px`);
    document.documentElement.style.setProperty('--vw', `${screenWidth}px`);
})();

function updateViewportVars() {
  screenHeight = window.innerHeight - 16;
  screenWidth = window.innerWidth - 16;
  if(screenWidth > screenHeight){ //if true => landscape mode (16:9)
    landscapeMode = true;
    screenWidth = screenHeight * 16 / 9;
  } else if(screenHeight > screenWidth){ // portrait mode (20:9)
    landscapeMode = false;
    screenHeight = screenWidth * 20 / 9;
  };
  document.documentElement.style.setProperty('--vh', `${screenHeight}px`);
  document.documentElement.style.setProperty('--vw', `${screenWidth}px`);
}

// window.addEventListener('resize', updateViewportVars);
// window.addEventListener('orientationchange', updateViewportVars);

function handleCommand(action, data){
  switch(action){
    case "thisSlide":
      thisSlide(data);
      break;
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
    case "unveilIt":
      unveilIt(data);
      break;
    case "addWisdom":
      addWisdom(data);
      break;
    case "fs":
      fullscreen();
      break;
    case "efs":
      exitFullscreen();
      break;
    case "refresh":
      refreshControl();
      break;
    default:
      console.log(action, data);
      break;
  };
};

function thisSlide(slideNum){
  let sectionToShow = document.querySelector(`section[data-slide="${slideNum}"]`);
  displaySection(sectionToShow);
};

function orderSlides() {
  let slideNum = 0;
  document.querySelectorAll('section[data-slide]').forEach(section => {
    section.dataset.slide = slideNum;
    slideNum++;
  });
};
function getAllSlides(){
  orderSlides();
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

function displaySection(sectionToShow){ //sending two things at once!!
  allSteps = null;
  stepCurrentIndex = 0;
  stepCurrent = null;
  kasesIds = [];
  xIndex = -1;
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

  if(sectionShowed.classList.contains("imaging")){
    fixImaging();
  };

  //words
  let words = [];
  if(sectionShowed.classList.contains("wordCloud")){
    wordCloudCreation();
    words = getWords();
  };

  //toUnveil
  let phrases = [];
  if(sectionShowed.classList.contains("toBeUnveilled")){
    phrases = getPhrases();
  };

  if(sectionShowed.classList.contains("stepped")){
    stepsCreation();
  };
  //stepsButton (whether sectionShowed is stepped or not)
  let stepButtonStates = getStepButtonState();


  //currentSlide
  let currentSlideInfo = getCurrentSlideInfo();
  

  let wholeDisplay = {
    words: words,
    phrases: phrases,
    steps: stepButtonStates,
    current: currentSlideInfo
  };
  set(ref(rtdb, "workshop/feedback"), {
    need: "display",
    info: wholeDisplay,
    timestamp: Date.now()
  });
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
  console.log("sent");
  
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
  let unorderedAllSteps = sectionShowed.querySelectorAll('[data-step]');
  //put them in order!
  allSteps = Array.from(unorderedAllSteps).sort((a, b) => {
    return Number(a.dataset.step) - Number(b.dataset.step);
  });
  stepCurrentIndex = 0;
  stepCurrent = allSteps[stepCurrentIndex];
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
  const screenWidthLimit = 900;
  const numberColumnMax = 4;
  const numberColumnMin = 3;
  const numberLineMax = 4;
  const numberLineMin = 3;
  const wordCloudMargin = 150;

  kasesIds = [];
  xIndex = -1;
  shuffledPositions = [];
  shuffledTilts = [];
  shuffledColors = [];

  let newWidth = landscapeMode ? screenWidth - wordCloudMargin : screenWidth;
  let colNum = screenWidth > screenWidthLimit ? numberColumnMax : numberColumnMin;
  let linNum = screenHeight > screenWidthLimit ? numberLineMax : numberLineMin;

  document.documentElement.style.setProperty('--wCBT', `${newWidth}px`);
  let kaseWidth = (newWidth) / colNum;
  

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

  //Creating the randomized arrays
  kasesIds = shuffleArray(kasesIds);
  shuffledPositions = multiShuffle(positions);
  shuffledTilts = multiShuffle(tilts);
  shuffledColors = multiShuffle(colors);
};

function getWords(){
  // return Array.from(sectionShowed.querySelectorAll("span.toRain")).map(element => element.innerText);
  let words = [];
  sectionShowed.querySelectorAll("span.toStorm").forEach(storm => {
    let rain = [];
    storm.querySelectorAll("span").forEach(drop => {
      rain.push(drop.innerText);
    })
    words.push(rain);
  });
  return words;
};

function getPhrases(){
  let phrases = [];
  sectionShowed.querySelectorAll('input[name="unveilable"]').forEach(sentence => {
    let phrase = sectionShowed.querySelector(`label[for="${sentence.id}"] > span.phraseToUnveil`).innerText;
    let code = sentence.value;
    let toUnveil = {
      phrase: phrase,
      code: code
    };
    phrases.push(toUnveil);
  });
  console.log(phrases);
  
  return phrases;
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


function wordRain(word){ 
  console.log(word);
  xIndex++; 
  let emoji = word.match(emojiRegex) ? true : false;
  let thisKase = sectionShowed.querySelector("#" + kasesIds[xIndex]);
  thisKase.innerHTML = `<span class="wordSpan ${emoji ? "emojiSpan" : ""} ${shuffledPositions[xIndex]} ${shuffledTilts[xIndex]}" style="background-color:var(--accent-30-${shuffledColors[xIndex]})">${word}</span>`;

  // let thisSpan = thisKase.querySelector("span");
  // if(!emoji){
  //   letsFitIt(thisSpan);
  // };
  
};
//toUnveil?? class="typcn typcn-media-stop-outline {font-size: 2.05em; line-height: .9em;} => class="typcn typcn-input-checked {font-size: 1.8em;}
function unveilIt(toUnveil){
  sectionShowed.querySelector(`input[name="unveilable"][value="${toUnveil}"]`).checked = true;
};

function addWisdom(phrase) {
  sectionShowed.querySelector("ul").insertAdjacentHTML('beforeend', `<li>
    <p class="toUnveil">
      <span class="emojiOfWisdom">🤩</span>
      <span class="unveilled">${phrase}</span>
    </p>
  </li>`
  );
};

async function letsFitIt(element) {
  const prevOverflowWrap = element.style.overflowWrap;
  const prevWordBreak = element.style.wordBreak;
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
  element.style.overflowWrap = prevOverflowWrap;
  element.style.wordBreak = prevWordBreak;
};

function refreshControl(){
  let words = [];
  if(sectionShowed.classList.contains("wordCloud")){
    words = getWords(); //array of array
  };

  //toUnveil
  let phrases = [];
  if(sectionShowed.classList.contains("toBeUnveilled")){
    phrases = getPhrases();
  };

  let stepButtonStates = getStepButtonState(); //object

  let allSlides = getAllSlides(); //array of objects

  let currentSlide = getCurrentSlideInfo(); //object

  let refreshAll = {
    words: words,
    phrases: phrases,
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

document.querySelector("#fullScreenCB").addEventListener("change", ev => {
  if(ev.target.checked){
    fullscreen()
  } else{
    exitFullscreen()
  };
});

function fullscreen(){
  console.log("fullscreen");
  const elem = document.documentElement; // The entire page         
  // Activate fullscreen
  if (elem.requestFullscreen) {
      elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, and Opera
      elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE/Edge
      elem.msRequestFullscreen();
  };
  updateViewportVars();
};

function exitFullscreen(){
  if (document.fullscreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
      document.msExitFullscreen();
    };
  };
  updateViewportVars();
};

orderSlides();
let sectionToShow = document.querySelector('section[data-slide="0"]');
displaySection(sectionToShow);





document.body.style.visibility = "visible";

const pageLoadedAt = Date.now();

onValue(ref(rtdb, "workshop/control"), (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  if (data.timestamp < pageLoadedAt && data.action !== "refresh") {
    // old command → start fresh
    set(ref(rtdb, "workshop/control"), null);
    set(ref(rtdb, "workshop/feedback"), null);
    return;
  }; //else do "refresh" or wait for the next command

  handleCommand(data.action, data.data);

  set(ref(rtdb, "workshop/control"), null);
});


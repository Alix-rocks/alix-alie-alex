import { rtdb, getDatabase, ref, set, onValue } from "../../myFirebase.js";

onValue(ref(rtdb, "workshop/control"), (snapshot) => {
  if (!snapshot.val()) return;
  handleCommand(snapshot.val().action, snapshot.val().data);
  set(ref(rtdb, "workshop/control"), null);
});

let landscapeMode;
let screenHeight;
let screenWidth;
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

function displaySection(sectionToShow){
  document.querySelectorAll("section").forEach(section => {
    if(section == sectionToShow){
      section.classList.remove("displayNone");
    } else{
      section.classList.add("displayNone");
    };
  });
  if(sectionToShow.classList.contains("wordCloud")){
    wordCloudCreation();
  };
  if(sectionToShow.classList.contains("imaging")){
    fixImaging();
  };
  if(sectionToShow.classList.contains("stepped")){
    stepsCreation();
  };
  sectionShowed = sectionToShow;
};

function slideNext(){
  allSteps = null;
  stepCurrentIndex = 0;
  stepCurrent = null;
  kasesIds = [];
  shuffledPositions = [];
  shuffledTilts = [];
  shuffledColors = [];
  // let sectionShowedNum = sectionShowed.id.slice(5);
  let sectionShowedNum = Number(sectionShowed.dataset.slide);
  //let sectionToShowNum = sectionShowedNum + 1;
  let sectionToShow = document.querySelector(`section[data-slide="${sectionShowedNum + 1}"]`);
  displaySection(sectionToShow);
};
window.slideNext = slideNext;

function slidePrev(){
  allSteps = null;
  stepCurrentIndex = 0;
  stepCurrent = null;
  kasesIds = [];
  shuffledPositions = [];
  shuffledTilts = [];
  shuffledColors = [];
  let sectionShowedNum = Number(sectionShowed.dataset.slide);
  let sectionToShow = document.querySelector(`section[data-slide="${sectionShowedNum - 1}"]`);
  displaySection(sectionToShow);
};
window.slidePrev = slidePrev;

function fixImaging(){
  let image = sectionShowed.querySelector("img");
  console.log(image);
  
  image.classList.add(landscapeMode ? "landscapeMode" : "portraitMode");
};

function stepsCreation(){
  allSteps = sectionShowed.querySelectorAll('[data-step]');
  console.log(allSteps);
  stepCurrentIndex = 0;
  stepCurrent = allSteps[stepCurrentIndex];
  console.log(stepCurrent);
  
};

function stepNext(){
  let stepCurrentIndex = stepCurrentIndex + 1;
  stepCurrent = sectionShowed.querySelector(`section[data-step="${stepCurrentIndex}"]`);
  stepCurrent.classList.remove("invisible");
};

function stepPrev(){
  stepCurrent.classList.add("invisible");
  stepCurrentIndex = stepCurrentIndex - 1;
  stepCurrent = sectionShowed.querySelector(`section[data-step="${stepCurrentIndex}"]`);
};

function wordCloudCreation(){

  kasesIds = [];
  shuffledPositions = [];
  shuffledTilts = [];
  shuffledColors = [];

  let words = Array.from(sectionShowed.querySelectorAll("span")).map(element => element.innerText);
  console.log(words);
  set(ref(rtdb, "workshop/feedback"), {
    need: "wddc",
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

  //Creating the randomized arrays
  kasesIds = shuffleArray(kasesIds);
  shuffledPositions = multiShuffle(positions);
  shuffledTilts = multiShuffle(tilts);
  shuffledColors = multiShuffle(colors);
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





let sectionToShow = document.querySelector('section[data-slide="1"]');
displaySection(sectionToShow);
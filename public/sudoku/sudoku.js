//POINTS:
// 5 pts each times multiplier (according to difficulty level or elapsed time (the shorter the higher)))
//more points if more than one in a short lapse of time
//points off for mistakes (more points off the more mistakes you make)
//points off or less points if little ones
//less points if there was only one possibility, more if there were more
//subtract 1 point for every second? (since we don't have a reference time)
//points off for each hint
let sudokuQuestionA = [
  [0, 7, 0, 4, 8, 9, 2, 0, 0],
  [2, 6, 8, 3, 0, 0, 5, 4, 9],
  [9, 4, 0, 2, 0, 0, 7, 8, 1],
  [0, 0, 6, 9, 2, 5, 4, 7, 8],
  [4, 2, 9, 7, 0, 8, 3, 1, 5],
  [7, 8, 5, 1, 4, 3, 9, 0, 0],
  [6, 9, 2, 0, 0, 1, 0, 3, 4],
  [1, 3, 7, 0, 0, 4, 6, 5, 2],
  [0, 0, 4, 6, 3, 2, 0, 9, 0]
];
let sudokuSolutionA = [
  [5, 7, 1, 4, 8, 9, 2, 6, 3],
  [2, 6, 8, 3, 1, 7, 5, 4, 9],
  [9, 4, 3, 2, 5, 6, 7, 8, 1],
  [3, 1, 6, 9, 2, 5, 4, 7, 8],
  [4, 2, 9, 7, 6, 8, 3, 1, 5],
  [7, 8, 5, 1, 4, 3, 9, 2, 6],
  [6, 9, 2, 5, 7, 1, 8, 3, 4],
  [1, 3, 7, 8, 9, 4, 6, 5, 2],
  [8, 5, 4, 6, 3, 2, 1, 9, 7]
];
let sudokuQuestionB = [
  [8, 0, 0, 0, 5, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 6, 0, 0],
  [0, 4, 5, 0, 6, 8, 1, 0, 0],
  [3, 2, 0, 0, 0, 0, 5, 0, 0],
  [1, 0, 8, 3, 0, 5, 9, 0, 2],
  [0, 0, 9, 0, 0, 0, 0, 1, 3],
  [0, 0, 1, 6, 9, 0, 4, 8, 0],
  [0, 0, 4, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 9]
];
let sudokuSolutionB = [
  [8, 3, 6, 1, 5, 7, 2, 9, 4],
  [7, 1, 2, 4, 3, 9, 6, 5, 8],
  [9, 4, 5, 2, 6, 8, 1, 3, 7],
  [3, 2, 7, 9, 8, 1, 5, 4, 6],
  [1, 6, 8, 3, 4, 5, 9, 7, 2],
  [4, 5, 9, 7, 2, 6, 8, 1, 3],
  [2, 7, 1, 6, 9, 3, 4, 8, 5],
  [5, 9, 4, 8, 7, 2, 3, 6, 1],
  [6, 8, 3, 5, 1, 4, 7, 2, 9]
];
//sudokuId: sudokuQuestion.index (?) (ou j de sudoki[i][j]),
        //level : niveau (ou i de sudoki[i]), NE DOUBLE PAS LES DONNÉES 
        //time: timer,
        //errors: errorsCount,
        //indices: indiceCount
//S'ils sont créés au fur et à mesure, on va... l
//Une liste générale pour tout le monde de tous les sudoku pour que tlm ait les mêmes numéros.
//Puis chacun a sa liste de scores qui sont référencés aux sudoku 
//Ajoute (?) pour montrer un popup avec les keyboard shortcut
//sudokuSolver: look in i row for each empty 
//Back button or way to come back from the stars board 
//Back button or way to come back from the celebration popup at the end
//Fix font-size on ChromeCell...
//Make it responsive
//add animation on the level circles
//localStorage : time & errors & indices (& niveau difficulté)
//Tableau des scores 3 typcn-star (just doesn't look good yet)
//Celebration popup: find the best score for that level and show it underneath. compare to current ones and they're better, add a star between the thumbs up (remove displayNone)
//Trouver quel numéro de sudoku c'était la dernière fois et faire plus un (Button Start)
//Add noBorderMode points in countKasePoints function
//ModeSelection: select circle then case OR case than circle
const sudoki = [
  [{code : "SQL1N1",
    question : [
      [0, 7, 0, 4, 8, 9, 2, 0, 0],
      [2, 6, 8, 3, 0, 0, 5, 4, 9],
      [9, 4, 0, 2, 0, 0, 7, 8, 1],
      [0, 0, 6, 9, 2, 5, 4, 7, 8],
      [4, 2, 9, 7, 0, 8, 3, 1, 5],
      [7, 8, 5, 1, 4, 3, 9, 0, 0],
      [6, 9, 2, 0, 0, 1, 0, 3, 4],
      [1, 3, 7, 0, 0, 4, 6, 5, 2],
      [0, 0, 4, 6, 3, 2, 0, 9, 0]
    ],
    solution : [
      [5, 7, 1, 4, 8, 9, 2, 6, 3],
      [2, 6, 8, 3, 1, 7, 5, 4, 9],
      [9, 4, 3, 2, 5, 6, 7, 8, 1],
      [3, 1, 6, 9, 2, 5, 4, 7, 8],
      [4, 2, 9, 7, 6, 8, 3, 1, 5],
      [7, 8, 5, 1, 4, 3, 9, 2, 6],
      [6, 9, 2, 5, 7, 1, 8, 3, 4],
      [1, 3, 7, 8, 9, 4, 6, 5, 2],
      [8, 5, 4, 6, 3, 2, 1, 9, 7]
    ]},
  { code : "SQL1N2",
    question : sudokuQuestionA,
    solution : sudokuSolutionA}
  ],
  [{code : "SQL2N1", //5 coups
    question : [
      [0, 0, 9, 0, 3, 0, 8, 6, 0],
      [0, 1, 2, 0, 0, 8, 7, 0, 5],
      [0, 0, 8, 0, 4, 2, 1, 0, 3],
      [5, 9, 4, 0, 7, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 4, 8, 0, 9, 5, 7],
      [8, 0, 5, 2, 1, 0, 4, 0, 0],
      [9, 0, 7, 8, 0, 0, 6, 2, 0],
      [0, 3, 1, 0, 6, 0, 5, 0, 0]
    ],
    solution : [
      [4, 7, 9, 1, 3, 5, 8, 6, 2],
      [3, 1, 2, 6, 9, 8, 7, 4, 5],
      [6, 5, 8, 7, 4, 2, 1, 9, 3],
      [5, 9, 4, 3, 7, 1, 2, 8, 6],
      [7, 8, 6, 5, 2, 9, 3, 1, 4],
      [1, 2, 3, 4, 8, 6, 9, 5, 7],
      [8, 6, 5, 2, 1, 7, 4, 3, 9],
      [9, 4, 7, 8, 5, 3, 6, 2, 1],
      [2, 3, 1, 9, 6, 4, 5, 7, 8]
    ]},
  { code : "SQL2N2",
    question : sudokuQuestionA,
    solution : sudokuSolutionA}
  ],
  [{code : "SQL3N1", //15 coups
    question : [
      [0, 0, 0, 9, 0, 0, 5, 0, 0],
      [0, 7, 0, 0, 4, 8, 0, 0, 6],
      [1, 0, 0, 0, 0, 3, 0, 0, 0],
      [3, 0, 0, 0, 0, 0, 7, 2, 4],
      [8, 2, 0, 6, 0, 7, 0, 3, 5],
      [5, 9, 7, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 7, 0, 0, 0, 0, 8],
      [7, 0, 0, 1, 9, 0, 0, 6, 0],
      [0, 0, 5, 0, 0, 4, 0, 0, 0]
    ],
    solution : [
      [4, 3, 8, 9, 6, 1, 5, 7, 2],
      [2, 7, 9, 5, 4, 8, 3, 1, 6],
      [1, 5, 6, 2, 7, 3, 8, 4, 9],
      [3, 6, 1, 8, 5, 9, 7, 2, 4],
      [8, 2, 4, 6, 1, 7, 9, 3, 5],
      [5, 9, 7, 4, 3, 2, 6, 8, 1],
      [9, 4, 3, 7, 2, 6, 1, 5, 8],
      [7, 8, 2, 1, 9, 5, 4, 6, 3],
      [6, 1, 5, 3, 8, 4, 2, 9, 7]
    ]},
  { code : "SQL3N2",
    question : sudokuQuestionA,
    solution : sudokuSolutionA}
  ],
  [{code : "SQL4N1", //plus de 20000 coups...
    question : [
      [5, 0, 0, 0, 0, 1, 0, 0, 9],
      [0, 0, 0, 3, 7, 0, 0, 4, 0],
      [0, 0, 0, 5, 0, 0, 3, 0, 6],
      [0, 2, 7, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 4, 0, 0, 0, 7],
      [0, 0, 0, 0, 0, 0, 9, 5, 0],
      [4, 0, 6, 0, 0, 9, 0, 0, 0],
      [0, 9, 0, 0, 6, 3, 0, 0, 0],
      [3, 0, 0, 1, 0, 0, 0, 0, 2]
    ],
    solution : sudokuSolutionB},
  { code : "SQL4N2",
    question : sudokuQuestionB,
    solution : sudokuSolutionB}
  ],
  [{code : "SQL5N3", //plus que 200 coups
  question : [
    [9, 0, 0, 0, 0, 0, 3, 1, 0],
    [2, 0, 0, 4, 3, 5, 6, 9, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 2],
    [1, 0, 0, 3, 0, 0, 0, 5, 0],
    [0, 0, 9, 0, 0, 0, 2, 0, 0],
    [0, 2, 0, 0, 0, 7, 0, 0, 4],
    [3, 0, 0, 0, 0, 4, 0, 0, 0],
    [0, 1, 4, 2, 9, 3, 0, 0, 6],
    [0, 9, 5, 0, 0, 0, 0, 0, 3]
  ],
  solution : [
    [9, 4, 8, 7, 2, 6, 3, 1, 5],
    [2, 7, 1, 4, 3, 5, 6, 9, 8],
    [5, 3, 6, 1, 8, 9, 7, 4, 2],
    [1, 6, 7, 3, 4, 2, 8, 5, 9],
    [4, 5, 9, 6, 1, 8, 2, 3, 7],
    [8, 2, 3, 9, 5, 7, 1, 6, 4],
    [3, 8, 2, 5, 6, 4, 9, 7, 1],
    [7, 1, 4, 2, 9, 3, 5, 8, 6],
    [6, 9, 5, 8, 7, 1, 4, 2, 3]
  ]},
    {code : "SQL5N2",
    question : [
      [8, 0, 0, 0, 5, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 6, 0, 0],
      [0, 4, 5, 0, 6, 8, 1, 0, 0],
      [3, 2, 0, 0, 0, 0, 5, 0, 0],
      [1, 0, 8, 3, 0, 5, 9, 0, 2],
      [0, 0, 9, 0, 0, 0, 0, 1, 3],
      [0, 0, 1, 6, 9, 0, 4, 8, 0],
      [0, 0, 4, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 9]
    ],
    solution : [
      [8, 3, 6, 1, 5, 7, 2, 9, 4],
      [7, 1, 2, 4, 3, 9, 6, 5, 8],
      [9, 4, 5, 2, 6, 8, 1, 3, 7],
      [3, 2, 7, 9, 8, 1, 5, 4, 6],
      [1, 6, 8, 3, 4, 5, 9, 7, 2],
      [4, 5, 9, 7, 2, 6, 8, 1, 3],
      [2, 7, 1, 6, 9, 3, 4, 8, 5],
      [5, 9, 4, 8, 7, 2, 3, 6, 1],
      [6, 8, 3, 5, 1, 4, 7, 2, 9]
    ]},
  { code : "SQL5N1",
  question : [
    [6, 0, 0, 0, 1, 0, 8, 0, 9],
    [0, 0, 0, 8, 0, 0, 1, 0, 6],
    [0, 0, 0, 2, 0, 9, 0, 0, 3],
    [0, 0, 3, 0, 0, 7, 0, 9, 8],
    [0, 0, 7, 0, 0, 0, 4, 0, 0],
    [8, 1, 0, 6, 0, 0, 3, 0, 0],
    [7, 0, 0, 4, 0, 1, 0, 0, 0],
    [4, 0, 1, 0, 0, 2, 0, 0, 0],
    [3, 0, 9, 0, 8, 0, 0, 0, 4]
  ],
  solution : [
    [6, 7, 2, 5, 1, 3, 8, 4, 9],
    [9, 3, 5, 8, 7, 4, 1, 2, 6],
    [1, 4, 8, 2, 6, 9, 7, 5, 3],
    [2, 6, 3, 1, 4, 7, 5, 9, 8],
    [5, 9, 7, 3, 2, 8, 4, 6, 1],
    [8, 1, 4, 6, 9, 5, 3, 7, 2],
    [7, 2, 6, 4, 3, 1, 9, 8, 5],
    [4, 8, 1, 9, 5, 2, 6, 3, 7],
    [3, 5, 9, 7, 8, 6, 2, 1, 4]
  ]}
  ]];

const levelArray = ["dodgerblue", "forestgreen", "orange", "red", "rebeccapurple"];
let niveau = 1,
    n = 0,
    levelColor = "dodgerblue",
    chiffre = 0,
    errorsCount = 0,
    indiceCount = 0,
    tryMode = false,
    littleTableIn = false,
    kaseMode = false,
    noBorderMode = false,
    slideTimer = false,
    slideError = false,
    slideSetting = true,
    selectedKase = "",
    hr = min = sec = "0" + 0,
    secPts = 0,
    startTimer,
    firstStart = true,
    kasePoints = 0,
    errorPoints = 0,
    indicePoints = 0,
    timePoints = 0,
    totalPoints = 0,
    sudokuQuestion,
    sudokuSoFar,
    sudokuSolution,
    animate;

function copySudoku(sudokuArray) {
  return [
    [...sudokuArray[0]],
    [...sudokuArray[1]],
    [...sudokuArray[2]],
    [...sudokuArray[3]],
    [...sudokuArray[4]],
    [...sudokuArray[5]],
    [...sudokuArray[6]],
    [...sudokuArray[7]],
    [...sudokuArray[8]],
  ];
};

function startIt(){
  let levels = [];
  for (let i = 0; i < levelArray.length; i++) {
    let level = `<input id="level${i + 1}" type="radio" name="level" value="${i + 1}" ${i == 0 ? "checked" : ""} /><label id="levelLabel${i + 1}" for="level${i + 1}" class="levelCircle ${levelArray[i]}"></label>`;
    levels.push(level);
  };
  let levelsF = levels.join("");
  pause.classList.remove("displayNone");
  let timer = (hr = hr > 0 ? hr + ":" : "") + min + ":" + sec;
  pause.innerHTML = `<div id="startDiv">
      <div id="startDivIn">
        <button id="startOld" class="displayNone">
          <span class="typcn typcn-media-play-reverse"></span>
          <span class="typcn typcn-document-text"></span>
        </button>
        <button id="startAgain" class="displayNone">
          <span class="typcn typcn-media-play-reverse"></span>
          <span class="typcn typcn-document"></span>
        </button>
      </div>
      <button id="startNew" class="displayNone" style="opacity: .4;">
        <span class="typcn typcn-document-add"></span>
        <span class="typcn typcn-media-play"></span>
      </button>
      <button id="startFirst">
        <span class="typcn typcn-power"></span>
      </button>
    </div>
    <div class="slideZone" id="sliderTimer">
      <div class="slider">
        <span class="typcn typcn-stopwatch"></span>
      </div>
    </div>
    <div class="slideZone" id="sliderError">
      <div class="slider">
        <span class="typcn typcn-times"></span>
      </div>
    </div>
    <div style="display:flex; flex-flow: row nowrap; width: fit-content; align-items: center; margin: auto;">
      <span id="firstCircles" class="typcn typcn-media-record-outline newInd" style="font-size:30px; color: darkslategrey; margin-left: -7px;"></span>
      <div class="slideZone" id="sliderSetting">
        <div class="slider" style="font-size: 20px; line-height: 24px; font-weight: 900; color: rebeccapurple;">
          1
        </div>
      </div>
      <span id="firstCases" class="typcn typcn-th-small-outline" style="padding-left: 7px;" color: darkslategrey;></span>
    </div>
  <div id="levelDiv">${levelsF}</div>
  <div id="starButDiv">
    <button id="starBut"><span class="typcn typcn-star"></span></button>
  </div>`;
  animation("levelLabel", "levelChecked", 6, 2, 200);    
  sliderTimer.addEventListener("click", (evt) => {
    let slider = evt.currentTarget;
    if (slider.classList.contains("slided")) {
        slider.classList.remove("slided");
        slideTimer = false;
      } else {
        slider.classList.add("slided");
        slideTimer = true;
      };
  });
  sliderError.addEventListener("click", (evt) => {
    let slider = evt.currentTarget;
    if (slider.classList.contains("slided")) {
        slider.classList.remove("slided");
        slideError = false;
      } else {
        slider.classList.add("slided");
        slideError = true;
      };
  });
  sliderSetting.addEventListener("click", (evt) => {
    let slider = evt.currentTarget;
    slider.classList.toggle("slidedS");
    firstCircles.classList.toggle("newInd");
    firstCases.classList.toggle("newInd");
    slideSetting = slideSetting ? false : true;
    kaseMode = slideSetting ? false : true;
    if(!firstStart){
      if (slider.classList.contains("slidedS")) {
        document.querySelectorAll(".highlight").forEach(inside => {
          inside.classList.replace("highlightRond", "highlightSquare");
        });
        document.querySelectorAll(".circle").forEach(circle => {
          circle.classList.remove("selected");
        });
        if(kaseModeLabel){
          kaseModeLabel.classList.add("displayNone");
        };
      } else {
        document.querySelectorAll(".highlight").forEach(inside => {
          inside.classList.replace("highlightSquare", "highlightRond");
        });
        if (document.querySelector(".highlighted")){
          chiffre = document.querySelector(".highlighted").innerText;
          document.getElementById("opt" + chiffre).classList.add("selected");
        };
        if(kaseModeLabel){
          kaseModeLabel.classList.remove("displayNone");
        };
      };
    };
  });
  startOld.addEventListener("click", () => {
    pause.classList.add("displayNone");
    sudoku.classList.remove("displayNone");
    sliderCheck();
    startTimerFx();
  });
  startAgain.addEventListener("click", () => {
    pause.classList.add("displayNone");
    sudoku.classList.remove("displayNone");
    tableFillation();
  });
  startNew.addEventListener("click", () => {
    levelDiv.classList.remove("displayNone");
    startFirst.classList.remove("displayNone");
    startNew.classList.add("displayNone");
    animation("levelLabel", "levelChecked", 6, 2, 200);
  });
  startFirst.addEventListener("click", () => { 
    pause.classList.add("displayNone");
    sudoku.classList.remove("displayNone");
    //Find what was the last n they did for that level then do: n++;
    let l = niveau - 1;
    sudokuQuestion = sudoki[l][n].question;
    sudokuSolution = sudoki[l][n].solution;
    if(firstStart){
      tableCreation();
      firstStart = false;
    } else{
      tableFillation();
    }
  });
  document.querySelectorAll("input[name=level]").forEach((radio) => {
    radio.addEventListener("click", (evt) => {
      niveau = evt.currentTarget.value;
      levelColor = levelArray[niveau - 1];
    });
  });
  starBut.addEventListener("click", starsShow);
  //starBut.addEventListener("click", animation);
};
startIt();


function animation(type, classe, num, delai, speed) {
  clearInterval(animate);
  let k = 0;
  let o = 0;
  animate = setInterval(()=>{
    k++;
    if(k > delai){
      if(type == "levelLabel"){
        document.getElementById("level" + niveau).checked = false;
      };
      o++;
      if (o < num) {
        //document.getElementById(type + o).checked = true;
        document.getElementById(type + o).classList.add(classe);
      };
      if (o > 1) {
        //document.getElementById(type + (o - 1)).checked = false;
        document.getElementById(type + (o - 1)).classList.remove(classe);
      };
      if (o == num) {
        clearInterval(animate);
        if(type == "levelLabel"){
          document.getElementById("level" + niveau).checked = true;
        };
      };
    };
  }, speed); //1000ms = 1s
  o = k = 0;
};

function starsShow(){
  let levelStars = [];
  for(let l = 0; l < 5; l++){
    levelStar = `<div class="levelStar ${l < 4 ? "levelStarHr" : ""}">
      <div class="levelCircle ${levelArray[l]}"></div>
        <table>
          <tr>
            <td><span class="typcn typcn-stopwatch"></span></td>
            <td>00:00</td>
          </tr>
          <tr>
            <td><span class="typcn typcn-times"></span></td>
            <td>0</td>
          </tr>
          <tr>
            <td><span class="typcn typcn-heart"></span></td>
            <td>0</td>
          </tr>
          <tr>
            <td style="padding-right: 12px;"><span class="typcn typcn-media-pause" style="display: inline-block; transform: rotate(90deg); translate: 11px;"></span><span class="typcn typcn-chevron-right"></span></td>
            <td style="font-weight: 700;">0</td>
          </tr>
        </table>
      </div>`
    levelStars.push(levelStar);
  };
  let levelStarsF = levelStars.join("");
  pause.classList.add("displayNone");
  starsScreen.classList.remove("displayNone");
  starsScreen.innerHTML = `<div class="popup">
      <div class="threeStars">
        <span class="typcn typcn-star"></span>
        <span class="typcn typcn-star"></span>
        <span class="typcn typcn-star"></span>
      </div>
      ${levelStarsF}
    </div>`;
  document.querySelector("#starsScreen:not(.levelStar)").addEventListener("click", () => {
    starsScreen.classList.add("displayNone");
    pause.classList.remove("displayNone");
  });
};


//JSON.stringify(sudokuSoFar) == JSON.stringify(sudokuQuestion)

function back(){
  pauseTimerFx();
  sudoku.classList.add("displayNone");
  startOld.classList.remove("displayNone");
  startNew.classList.remove("displayNone");
  startAgain.classList.remove("displayNone");
  startFirst.classList.add("displayNone");
  levelDiv.classList.add("displayNone");
  pause.classList.remove("displayNone");
};

function startTimerFx() {
  let multiple = 6 - niveau;
  startTimer = setInterval(()=>{
    secPts++;
    if(secPts == 10){
      timePoints += multiple;
      secPts = 0;
    };
    sec++;
    sec = sec < 10 ? "0" + sec : sec;
    if(sec == 60){
      min++;
      min = min < 10 ? "0" + min : min;
      sec = "0" + 0;
    };
    if(min == 60){
      hr++;
      hr = hr < 10 ? "0" + hr : hr;
      min = "0" + 0;
    };
    if(hr > 0){
      timerNum.innerHTML = hr + ":" + min + ":" + sec;
    } else{
      timerNum.innerHTML = min + ":" + sec;
    };
    timePointsShow.innerText = timePoints;
    totalPointsShow.innerText = countTotalPoints();
  }, 1000); //1000ms = 1s
}
function pauseTimerFx() {
  clearInterval(startTimer);
}
function resetTimerFx() {
  clearInterval(startTimer);
  hr = min = sec = "0" + 0;
  secPts = 0;
  timePoints = 0;
  timerNum.innerHTML = min + ":" + sec;
  timePointsShow.innerText = timePoints;
}

function erase() {
  chiffre = 0;
  document.querySelectorAll(".circle").forEach(circle => {
    circle.classList.remove("selected");
  });
  document.querySelectorAll(".case").forEach(kase => {
    kase.classList.remove("newInd", "error", "filled");
    kase.querySelector(".highlight").classList.remove("highlighted", "superHighlighted");
  });
};

function tableFillation(){
  sudokuSoFar = copySudoku(sudokuQuestion);
  //sudokuSolution = JSON.parse(JSON.stringify(sudokuSolution));
  erase();
  errorsCount = 0;
  errorsCountNum.innerHTML = errorsCount;
  tryMode = false;
  littleTableIn = false;
  repBut.checked = true;
  document.querySelectorAll(".circle").forEach(cercle => {
    cercle.classList.remove("filledCircle", "littler");
  });
  //kaseMode = false;
  //kaseModeCheck.checked = false;
  indiceCount = 0;
  document.querySelectorAll(".typcn-heart").forEach((heart) => {
    heart.classList.remove("used");
  });
  resetTimerFx();
  document.querySelectorAll(".case").forEach((kase) => {
    let i = kase.dataset.row;
    let j = kase.dataset.col;
    let num = sudokuQuestion[i][j];
    num == 0 ? num = "" : num;
    let inside = kase.querySelector(".highlight");
    inside.style.fontWeight = "700";
    inside.innerHTML = "";
    inside.innerHTML = num;
  });
  levelSign.classList.remove(...levelArray);
  levelSign.classList.add(levelColor);
  for (let n = 1; n < 10; n++) {
    checkFilled("start", n);
  };
  sliderCheck();
  startTimerFx();
};

function sliderCheck(){
  if(slideTimer){
    timerDiv.classList.remove("displayNone");
  } else{
    timerDiv.classList.add("displayNone");
  };
  if(slideError){
    errorsDiv.classList.remove("displayNone");
  } else{
    errorsDiv.classList.add("displayNone");
  };
};

function tableCreation() {
  sudokuSoFar = copySudoku(sudokuQuestion);
  errorsCount = 0;
  indiceCount = 0;
  kasePoints = 0;
  errorPoints = 0;
  indicePoints = 0;
  //timePoints = 0;
  totalPoints = 0;
  tryMode = false;
  littleTableIn = false;
  let allCells = [];
  let lines = [];
  let circles = [];
  for (let i = 0; i < 9; i++) {
    let circle = `<div class="circle filling" id="opt${i + 1}">${i + 1}</div>`;
    circles.push(circle);
    let cols = [];
    let cells = [];
    for (let j = 0; j < 9; j++) {
      let num = sudokuQuestion[i][j];
      num == 0 ? num = "" : num;
      let bloc = 0;
      if(i < 3){
        if(j < 3){
          bloc = 1;
        } else if(j > 5){
          bloc = 3;
        } else{
          bloc = 2;
        };
      } else if(i > 5){
        if(j < 3){
          bloc = 7;
        } else if(j > 5){
          bloc = 9;
        } else{
          bloc = 8;
        };
      } else{
        if(j < 3){
          bloc = 4;
        } else if(j > 5){
          bloc = 6;
        } else{
          bloc = 5;
        };
      };
      let col = `<td class="case" id="r${i}c${j}" data-row="${i}" data-col="${j}" data-bloc="${bloc}" tabindex="${(i * 9) + j + 1}"><div class="highlight ${slideSetting ? "highlightRond" : "highlightSquare"}">${num}</div></td>`;
      cols.push(col);
      cells.push("r" + i + "c" + j)
    };
    let colsF = cols.join("");
    let line = `<tr class="line" id="r${i}">${colsF}</tr>`;
    lines.push(line);
    allCells.push(cells);
  };
  let circlesF = circles.join("");
  let tbody = `<tbody class="bloc">`;
  lines.splice(3, 0, tbody);
  lines.splice(7, 0, tbody);
  let linesF = lines.join("");
  pause.classList.add("displayNone");
  sudoku.classList.remove("displayNone");
  sudoku.innerHTML = `<h1>SUDOKU</h1>
    <button id="backBut">
      <span class="typcn typcn-media-play-reverse"></span>
      <span class="typcn typcn-media-pause"></span>
    </button>
    <div id="levelSign" class="levelCircle levelCircleNum ${levelColor}">${(n + 1) + "  "}</div>
    <input type="checkbox" id="noBorderCheck" />
    <label for="noBorderCheck" id="noBorderLabel"></label>
    <div id="timerDiv" class="info displayNone">
      <span class="typcn typcn-stopwatch"></span>
      <span id="timerNum">00:00</span>
    </div>
    <div id="errorsDiv" class="info displayNone">
      <span class="typcn typcn-times"></span>
      <span id="errorsCountNum">${errorsCount}</span>
    </div>
    <table id="table">
      <colgroup><col><col><col>
      <colgroup><col><col><col>
      <colgroup><col><col><col>
      <tbody class="bloc">
      ${linesF}
    </table>
    <div style="width:100%; max-width: 375px; position: relative;">
      <div id="circles">${circlesF}</div>
      <div style="position: absolute; top: 1px; right: 0;">
        <div class="slideZoneV" id="sliderFill">
          <div class="sliderV">
          </div>
        </div>
      </div>
    </div>
    <div id="modeDiv">
      <input type="radio" name="mode" id="repBut" checked/>
      <label for="repBut" class="modeBut">
        <span class="typcn typcn-pen"></span>
      </label>
      <input type="radio" name="mode" id="tryBut"/>
      <label for="tryBut" class="modeBut">
        <span class="typcn typcn-pencil"></span>
      </label>
      <input type="checkbox" id="kaseModeCheck"/>
      <label for="kaseModeCheck" id="kaseModeLabel" class="${slideSetting ? "" : "displayNone"}">
        <span class="typcn typcn-th-small-outline"></span>
        <span class="typcn typcn-chevron-right-outline"></span>
        <span class="typcn typcn-media-record-outline"></span>
      </label>
    </div>
    <div id="indDiv">
      <span class="typcn typcn-heart"></span>
      <span class="typcn typcn-heart"></span>
      <span class="typcn typcn-heart"></span>
    </div>
    <div>kasePoints: <span id="kasePointsShow">${kasePoints}</span></div>
    <div>errorPoints: <span id="errorPointsShow">${errorPoints}</span></div>
    <div>indicePoints: <span id="indicePointsShow">${indicePoints}</span></div>
    <div>timePoints: <span id="timePointsShow">${timePoints}</span></div>
    <div>totalPoints: <span id="totalPointsShow">${totalPoints}</span></div>
    `;
  sliderCheck();
  sliderFill.addEventListener("click", (evt) => {
    let slider = evt.currentTarget;
    if (slider.classList.contains("slidedV")) {
      slider.classList.remove("slidedV");
      document.querySelectorAll(".circle").forEach(circle => {
        circle.classList.replace("notFilling", "filling");
      });
    } else {
      slider.classList.add("slidedV");
      document.querySelectorAll(".circle").forEach(circle => {
        circle.classList.replace("filling", "notFilling");
      });
    };
  });
  backBut.addEventListener("click", back);
  repBut.addEventListener("click", () => {
    tryMode = false;
    document.querySelectorAll(".circle").forEach(cercle => {
    cercle.classList.remove("littler");
    });
  });
  tryBut.addEventListener("click", littleOnes);
  kaseModeCheck.addEventListener("click", () => {
    kaseMode = kaseMode ? false : true;
  });
  document.querySelectorAll(".typcn-heart").forEach((heart) => {
    heart.addEventListener("click", (evt) => {
      indice(evt, sudokuSolution);
    });
  });
  noBorderCheck.addEventListener("click", () => {
    table.classList.toggle("noBorder");
    noBorderMode = noBorderMode ? false : true;
  });
  document.querySelectorAll(".circle").forEach(circle => {
    circle.addEventListener("click", (evt) => {
      //add make it so it can't be selected as text
      let cercle = evt.currentTarget;
      if(slideSetting){
        if (cercle.classList.contains("selected")) {
          erase();
        } else {
          erase();
          cercle.classList.add("selected");
          chiffre = cercle.id[3];
          document.querySelectorAll(".highlight").forEach(inside => { 
            if (!inside.innerHTML.includes("table") && inside.textContent.includes(chiffre)) {
              inside.classList.add("highlighted");
            };
          });
        };
      } else if(!slideSetting && document.querySelector(".superHighlighted")){
        chiffre = cercle.id[3];
        let inside = document.querySelector(".superHighlighted");
        let kase = inside.parentElement;
        let b = kase.dataset.bloc;
        let i = kase.dataset.row;
        let j = kase.dataset.col;
        if(!tryMode){
          if (sudokuSolution[i][j] == chiffre) {
            kasePoints += countKasePoints(i, j, b);
            kasePointsShow.innerText = kasePoints;
            inside.innerText = chiffre;
            inside.style.fontWeight = "400";
            inside.classList.remove("superHighlighted");
            kase.classList.remove("error");
            document.querySelectorAll(".highlight").forEach(inside => {
              if(!inside.innerHTML.includes("table") && inside.textContent.includes(chiffre)){
                inside.classList.add("highlighted");
              } else{
                inside.classList.remove("highlighted");
              };
            });
            sudokuSoFar[i].splice(j, 1, chiffre);
            checkFilled("one", chiffre);
            removeOthers(chiffre, i, j, b);
          } else {
            kase.classList.add("error");
            errorsCount++;
            errorsCountNum.innerHTML = errorsCount;
            errorPoints += errorsCount * 5;
            errorPointsShow.innerText = errorPoints;
          };
        } else if(tryMode){
          if (inside.innerHTML.includes("table")) {
            let little = inside.querySelector("#lt" + chiffre);
            little.classList.toggle("showIt");
          };
        };
      };
    });
  });
  //document.querySelector("div.total:not(div#sudoku)").addEventListener("click", erase);
  document.querySelectorAll(".case").forEach(kase => {
    kase.addEventListener("click", kaseEvent);
  });
  document.addEventListener("keydown", (evt) => {
    let key = evt.key;
    
    if(Number.parseInt(key)){
      let opt = document.querySelector("#opt" + key);
      if(opt.classList.contains("selected")){
        erase();
      } else {
        erase();
        opt.classList.add("selected");
        chiffre = key;
        document.querySelectorAll(".highlight").forEach(inside => { 
          if (!inside.innerHTML.includes("table") && inside.textContent.includes(chiffre)) {
            inside.classList.add("highlighted");
          };
        });
      };
    } else{
      switch(evt.code){
        case "Enter":
          console.log("enter");
          break;
        case "Space":
          console.log("space");
          break;
        case "ArrowLeft":
          console.log("left arrow");
          break;
        case "ArrowUp":
          console.log("up arrow");
          break;
        case "ArrowRight":
          console.log("right arrow");
          break;
        case "ArrowDown":
          console.log("down arrow");
          break;
        default:
          console.log(evt.code);
          break;
      }
    }
  });
  r0c0.focus();
  document.addEventListener("keydown", (evt) => {

  });
  for (let n = 1; n < 10; n++) {
    checkFilled("start", n);
  };
  if(slideSetting){
    animation("opt", "circlesUp", 10, 2, 75);
  };
  resetTimerFx();
  startTimerFx();
};

function kaseEvent(evt){
    let kase = evt.currentTarget;
    let b = kase.dataset.bloc;
    let i = kase.id[1];
    let j = kase.id[3];
    let inside = kase.querySelector(".highlight");
    
  if(slideSetting){
    if (!inside.innerHTML.includes("table") && !inside.innerText == "") {
      if (kaseMode) {
        erase();
        chiffre = inside.innerText;
        document.getElementById("opt" + chiffre).classList.add("selected");
        document.querySelectorAll(".highlight").forEach(inside => {
          if (!inside.innerHTML.includes("table") && inside.textContent.includes(chiffre)) {
            inside.classList.add("highlighted");
          };
        });
      } else if(chiffre <= 0){
        animation("opt", "circlesUp", 10, 1, 75);
      };
    };
    if (!tryMode) {
      if (inside.innerText == "" || inside.innerHTML.includes("table")) {
        if(chiffre <= 0){
          animation("opt", "circlesUp", 10, 1, 75);
        } else if(chiffre > 0){
          if (sudokuSolution[i][j] == chiffre) {
            kasePoints += countKasePoints(i, j, b);
            kasePointsShow.innerText = kasePoints;
            inside.innerText = chiffre;
            inside.style.fontWeight = "400";
            inside.classList.add("highlighted");
            sudokuSoFar[i].splice(j, 1, chiffre);
            checkFilled("one", chiffre);
            removeOthers(chiffre, i, j, b);
          } else {
            if (kase.classList.contains("error")) {
              kase.classList.remove("error")
            } else {
              kase.classList.add("error");
              errorsCount++;
              errorsCountNum.innerHTML = errorsCount;
              errorPoints += errorsCount * 5;
              errorPointsShow.innerText = errorPoints;
            };
          };
        };
      };
    } else if (tryMode) {
      if (inside.innerHTML.includes("table") && chiffre > 0) {
        let little = inside.querySelector("#lt" + chiffre);
        little.classList.toggle("showIt");
      };
    };
  } else if(!slideSetting){
    erase();
    if (!inside.innerHTML.includes("table") && !inside.innerText == "") {
      let number = inside.innerText;
      document.querySelectorAll(".highlight").forEach(inside => {
        if (!inside.innerHTML.includes("table") && inside.textContent.includes(number)) {
          inside.classList.add("highlighted");
        };
      });
    };
    if (inside.innerText == "" || inside.innerHTML.includes("table")){
      inside.classList.add("superHighlighted");
      document.querySelectorAll('.case[data-row="' + i + '"] > .highlight').forEach((insideI) => {
        insideI.classList.add("highlighted");
      });
      document.querySelectorAll('.case[data-col="' + j + '"] > .highlight').forEach((insideI) => {
        insideI.classList.add("highlighted");
      });
    };
  };
};

console.log("(" + (40 * 0.4 + 255 * 0.6) + ", " + (70 * 0.4 + 255 * 0.6) + ", " + (70 * 0.4 + 255 * 0.6) + ")");//not darkslategrey
console.log("(" + (40 * 0.6 + 255 * 0.4) + ", " + (70 * 0.6 + 255 * 0.4) + ", " + (70 * 0.6 + 255 * 0.4) + ")");//not darkslategrey
console.log("(" + (47 * 0.5 + 255 * 0.5) + ", " + (79 * 0.5 + 255 * 0.5) + ", " + (79 * 0.5 + 255 * 0.5) + ")");//darkslategrey .5 on white
console.log("(" + (47 * 0.5) + ", " + (79 * 0.5) + ", " + (79 * 0.5) + ")");

function checkFilled(why, chiffre) {
  let soFar = sudokuSoFar.flat();
  if(why == "start"){
    let count = soFar.filter((num) => num == chiffre).length;
    if (count == 9) {
      document.getElementById("opt" + chiffre).classList.add("filledCircle");
    } else {
      document.getElementById("opt" + chiffre).style.backgroundPositionY = "0%";
      let perc = count.toString() + count.toString();
      document.getElementById("opt" + chiffre).style.backgroundPositionY = perc + "%";
    };
  } else{
    let countTot = soFar.filter((num) => num == 0).length;
    if (countTot == 0) {
      pauseTimerFx();
      erase();
      console.log("kasePoints:" + kasePoints + " errorPoints:" + errorPoints + " indicePoints:" + indicePoints + " timePoints:" + timePoints);
  //find the best score for that level and show it underneath. compare to current ones and they're better, add a star between the thumbs up (remove displayNone)
      let timer = (hr = hr > 0 ? hr + ":" : "") + min + ":" + sec;
      //let score = {
        //sudokuId: sudokuQuestion.id,
        //niveau : niveau,
        //kasePoints : kasePoints,
        //time: timer,
        //timePoints : timePoints,
        //errors: errorsCount,
        //errorPoints : errorPoints,
        //indices: indiceCount,
        //indicePoints : indicePoints,
        //totalPoints : totalPoints
      //};
      //localStorage.setItem();
        //localStorage : time & errors & indices (& niveau difficulté)
        //Tableau des scores 
      sudoku.innerHTML = `<div class="popup">
          <h2><span class="typcn typcn-thumbs-up" ></span><span class="typcn typcn-star displayNone"></span><span class="typcn typcn-thumbs-up" style="display: inline-block; transform: scaleX(-1);"></span></h2>
          <div style="margin: 0 auto;" class="levelCircle ${levelColor}"></div>
          <div class="soNumero" style="background-color:${levelColor};">${(n + 1)}</div>
          <table>
            <tr>
              <td><span class="typcn typcn-stopwatch"></span></td>
              <td>${timer}</td>
            </tr>
            <tr>
              <td><span class="typcn typcn-times"></span></td>
              <td>${errorsCount}</td>
            </tr>
            <tr>
              <td><span class="typcn typcn-heart"></span></td>
              <td>${indiceCount}</td>
            </tr>
            <tr>
              <td style="padding-right: 12px;"><span class="typcn typcn-media-pause" style="display: inline-block; transform: rotate(90deg); translate: 11px;"></span><span class="typcn typcn-chevron-right"></span></td>
              <td style="font-weight: 700;">${countTotalPoints()}</td>
            </tr>
          </table>
          <div class="threeStars" style="width: 160px; height: 65px; margin: 20px auto 0; border-top: 2px solid lightslategrey;">
            <span class="typcn typcn-star"></span>
            <span class="typcn typcn-star"></span>
            <span class="typcn typcn-star"></span>
          </div>
          <div style="margin: 0 auto;" class="levelCircle ${levelColor}"></div>
          <div class="soNumero" style="background-color:${levelColor};">5768</div>
          <table>
            <tr>
              <td><span class="typcn typcn-stopwatch"></span></td>
              <td>${timer}</td>
            </tr>
            <tr>
              <td><span class="typcn typcn-times"></span></td>
              <td>${errorsCount}</td>
            </tr>
            <tr>
              <td><span class="typcn typcn-heart"></span></td>
              <td>${indiceCount}</td>
            </tr>
            <tr>
              <td style="padding-right: 12px;"><span class="typcn typcn-media-pause" style="display: inline-block; transform: rotate(90deg); translate: 11px;"></span><span class="typcn typcn-chevron-right"></span></td>
              <td style="font-weight: 700;">${countTotalPoints()}</td>
            </tr>
          </table>
        </div>`;
    } else{
      let count = soFar.filter((num) => num == chiffre).length;
      if (count == 9) {
        let perc = count.toString() + count.toString();
        document.getElementById("opt" + chiffre).style.backgroundPositionY = perc + "%";
        document.getElementById("opt" + chiffre).classList.add("filledCircle");
        document.querySelectorAll(".case").forEach((kase) => {
          if(!kase.innerHTML.includes("table") && kase.textContent.includes(chiffre)){
              kase.classList.add("filled");
          };
        });
      } else {
        let perc = count.toString() + count.toString();
        document.getElementById("opt" + chiffre).style.backgroundPositionY = perc + "%";
      };
    };
  };
};

function littleOnes() {
  tryMode = true;
  document.querySelectorAll(".circle").forEach(cercle => {
    cercle.classList.add("littler");
  });
  document.querySelectorAll(".highlight").forEach(inside => {
    inside.parentElement.classList.remove("error");
  });
  if(!littleTableIn){
    let littlesTr = [];
    for (let i = 1; i < 4; i++) {
      let littlesTd = [];
      for (let j = (1 + (i - 1) * 3); j < (4 + (i - 1) * 3); j++) {
        let littleTd = `<td class="littleTd" id="lt${j}">${j}</td>`;
        littlesTd.push(littleTd);
      };
      let littlesTdF = littlesTd.join("");
      let littleTr = `<tr>${littlesTdF}</tr>`;
      littlesTr.push(littleTr);
    };
    let littlesTrF = littlesTr.join("");
    let littleTable = `<table class="littleTable">${littlesTrF}</table>`;
    document.querySelectorAll(".case").forEach((kase) => {
      let inside = kase.querySelector(".highlight");
      if (inside.innerText == "") {
        inside.innerHTML = littleTable;
      };
    });
    littleTableIn = true;
  };
};

function removeOthers(chiffre, i, j, b) {
  document.querySelectorAll('.case[data-row="' + i + '"]').forEach((kaseI) => {
    if (kaseI.innerHTML.includes("table")) {
      kaseI.querySelector("#lt" + chiffre).classList.remove("showIt");
    };
  });
  document.querySelectorAll('.case[data-col="' + j + '"]').forEach((kaseJ) => {
    if (kaseJ.innerHTML.includes("table")) {
      kaseJ.querySelector("#lt" + chiffre).classList.remove("showIt");
    };
  });
  document.querySelectorAll('.case[data-bloc="' + b + '"]').forEach((kaseB) => {
    if (kaseB.innerHTML.includes("table")) {
      kaseB.querySelector("#lt" + chiffre).classList.remove("showIt");
    };
  });
};

function indice(evt, sudokuSolution) {
  if(!evt.currentTarget.classList.contains("used")){
    evt.currentTarget.classList.add("used");
    indiceCount++;
    let multiple = 6 - niveau;
    indicePoints += indiceCount * 5 * multiple;
    indicePointsShow.innerText = indicePoints;
    let vides = [];
    document.querySelectorAll(".highlight").forEach((inside) => {
      if (inside.innerText == "" || inside.innerHTML.includes("table")) {
        let id = inside.parentElement.id;
        vides.push(id);
      };
    });
    let randomIndex = Math.floor(Math.random() * vides.length);
    let kase = vides[randomIndex];
    let kaseCase = document.getElementById(kase);
    let i = kaseCase.dataset.row;
    let j = kaseCase.dataset.col;
    let b = kaseCase.dataset.bloc;
    let num = sudokuSolution[i][j];
    kaseCase.classList.add("newInd");
    kaseCase.querySelector(".highlight").innerHTML = num;
    sudokuSoFar[i].splice(j, 1, num);
    checkFilled("one", num);
    removeOthers(num, i, j, b);
  };
};

function countKasePoints(i, j, b){
  let valuesTot = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let valuesI = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  document.querySelectorAll('.case[data-row="' + i + '"]').forEach((kaseI) => {
    let chiffre = kaseI.textContent;
    valuesTot = valuesTot.filter(num => num !== chiffre);
    valuesI = valuesI.filter(num => num !== chiffre);
  });
  if (valuesI.length == 1) {
    return 5 * niveau;
  };
  let valuesJ = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  document.querySelectorAll('.case[data-col="' + j + '"]').forEach((kaseJ) => {
    let chiffre = kaseJ.textContent;
    valuesTot = valuesTot.filter(num => num !== chiffre);
    valuesJ = valuesJ.filter(num => num !== chiffre);
  });
  if (valuesJ.length == 1) {
    return 5 * niveau;
  };
  let valuesB = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  document.querySelectorAll('.case[data-bloc="' + b + '"]').forEach((kaseB) => {
    let chiffre = kaseB.textContent;
    valuesTot = valuesTot.filter(num => num !== chiffre);
    valuesB = valuesB.filter(num => num !== chiffre);
  });
  if (valuesB.length == 1) {
    return 5 * niveau;
  };
  let multiple = 0;
  if(littleTableIn){
    multiple = niveau * 3;
  } else if(!littleTableIn){
    multiple = niveau * 4;
  };
  //add noBorderMode points
  if (valuesTot.length == 0) {
    return 0;
  } else if(valuesTot.length == 1){
    return 5 * multiple;
  } else if (valuesTot.length == 2) {
    return 10 * multiple;
  } else if (valuesTot.length == 3) {
    return 15 * multiple;
  } else if (valuesTot.length >= 4) {
    return 25 * multiple;
  };
};

function countTotalPoints(){
  return kasePoints - errorPoints - indicePoints - timePoints;
};
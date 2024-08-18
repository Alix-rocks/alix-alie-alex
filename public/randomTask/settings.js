// SETTINGS

// *** VARIABLE
export let mySettings = {
  mySide: "light",
  myTomorrow: "03:00",
  myFavoriteView: "switchPageInputList",
  myFirstDayOfTheWeek: "domenica",
  myWeeksDayArray: [{
    day: 0,
    name0Maj: "domenica",
    name1Maj: "Domenica",
    nameNoAcc: "domenica",
    letter: "D",
    code: "D0",
    clockIn: "10:00",
    clockOut: "02:00"
  }, {
    day: 1,
    name0Maj: "lunedì",
    name1Maj: "Lunedì",
    nameNoAcc: "lunedi",
    letter: "L",
    code: "L1",
    clockIn: "10:00",
    clockOut: "02:00"
  }, {
    day: 2,
    name0Maj: "martedì",
    name1Maj: "Martedì",
    nameNoAcc: "martedi",
    letter: "M",
    code: "M2",
    clockIn: "10:00",
    clockOut: "02:00"
  }, {
    day: 3,
    name0Maj: "mercoledì",
    name1Maj: "Mercoledì",
    nameNoAcc: "mercoledi",
    letter: "M",
    code: "M3",
    clockIn: "10:00",
    clockOut: "02:00"
  }, {
    day: 4,
    name0Maj: "giovedì",
    name1Maj: "Giovedì",
    nameNoAcc: "giovedi",
    letter: "G",
    code: "G4",
    clockIn: "10:00",
    clockOut: "02:00"
  }, {
    day: 5,
    name0Maj: "venerdì",
    name1Maj: "Venerdì",
    nameNoAcc: "venerdi",
    letter: "V",
    code: "V5",
    clockIn: "10:00",
    clockOut: "02:00"
  }, {
    day: 6,
    name0Maj: "sabato",
    name1Maj: "Sabato",
    nameNoAcc: "sabato",
    letter: "S",
    code: "S6",
    clockIn: "10:00",
    clockOut: "02:00"
  }],
  myShowTypes: [],
  //myLabels: [],
  //myProjects: [], ???
  //myBaseColors: [],
  mySorting: []
};


// *** FUNCTION
//How to know if you need to update it? (otherwise, it would still show "updated"; if not, shows "update"). Update because the version you have is older than the version on the cloud (because last time you saved on the cloud it was from an other localStorage/device... but it can't be because myList and list are different, because that doesn't tell you which one is the newer one... timestamps?)
//Is there a real way to check if it all really worked out before changing it to "updated!"?
// settings.addEventListener("click", () => {
  // document.querySelectorAll(".onePage").forEach(page => {
  //   page.classList.add("displayNone");
  // });
  // settingsScreen.classList.remove("displayNone");
  export function settingsPage(){//UPDATE
    let firstDayOptions = mySettings.myWeeksDayArray.map(day => {
      return `<option value="${day.code}">${day.name1Maj}</option>`;
    }).join("");
    let clockingOptions = mySettings.myWeeksDayArray.map(day => {
      return `<div id="${day.code}Clocks" class="dayClocksDiv">
      <p>${day.name1Maj}</p>
      <p>Clock in: <input id="${day.code}clockIn" class="clocks clockIn" type="time" value="${day.clockIn}" /></p>
      <p>Clock out: <input id="${day.code}clockOut" class="clocks clockOut" type="time" value="${day.clockOut}" /></p>
    </div>`;
    }).join("");
    document.querySelector("#settingsDiv").innerHTML = `<span id="exitX">x</span>
    <button id="clearStorageBtn" style="margin-top: 15px;">Update</button>
    <hr />
    <h2>Settings</h2>
    <h3>What side are you on?</h3>
    <div id="switchModeSlider">
      <div id="switchModeDark" class="typcn typcn-weather-night"></div>
      <div id="switchModeLight" class="typcn typcn-weather-sunny"></div>
      <div id="switchModeBall" class="ballLight"></div>
      <div id="switchModeBallUnder" class="ballLight"></div>
    </div>
    <h3>What's the first thing you wanna see when you get here?</h3>
    <input id="choicePageInputList" value="switchPageInputList" name="choicePageRadios" type="radio" class="displayNone" ${mySettings.myFavoriteView == "switchPageInputList" ? `checked` : ``} />
    <label for="choicePageInputList" class="bottomBtn purpleOnWhite">
      <i class="fa-solid fa-list-check"></i>
    </label>
    <input id="choicePageInputMonth" value="switchPageInputMonth" name="choicePageRadios" type="radio" class="displayNone" ${mySettings.myFavoriteView == "switchPageInputMonth" ? `checked` : ``} />
    <label for="choicePageInputMonth" class="bottomBtn purpleOnWhite">
      <i class="fa-solid fa-calendar-days"></i>
    </label>
    <input id="choicePageInputWeek" value="switchPageInputWeek" name="choicePageRadios" type="radio" class="displayNone" ${mySettings.myFavoriteView == "switchPageInputWeek" ? `checked` : ``} />
    <label for="choicePageInputWeek" class="bottomBtn purpleOnWhite">
      <i class="fa-solid fa-calendar-week"></i>
    </label>
    <input id="choicePageInputConvo" value="switchPageInputConvo" name="choicePageRadios" type="radio" class="displayNone" ${mySettings.myFavoriteView == "switchPageInputConvo" ? `checked` : ``} />
    <label for="choicePageInputConvo" class="bottomBtn purpleOnWhite">
      <i class="fa-solid fa-comments"></i>
    </label>
    <h3>What time does your day really end?</h3>
    <input id="timeInput" type="time">
    <h3>What day does your week actually start?</h3>
    <select id="firstDayOfWeekInput">
      ${firstDayOptions}
    </select>
    <h3>When are you clocking in and out?</h3>
    <div class="clockingDiv">
      ${clockingOptions}
    </div>
    <button id="settingsBtn" class="ScreenBtn1">yep <span class="typcn typcn-thumbs-up" style="padding: 0;font-size: 1em;"></span></button>
    <button id="cancelBtn" class="ScreenBtn2">Cancel</button>`;

    let switchModeSlider = document.querySelector("#switchModeSlider");
    let timeInput = document.querySelector("#timeInput");
    let clearStorageBtn = document.querySelector("#clearStorageBtn");
    let exitX = document.querySelector("#exitX");
    let cancelBtn = document.querySelector("#cancelBtn");
    let settingsBtn = document.querySelector("#settingsBtn");
    
    if(mySettings.myTomorrow){
      timeInput.value = mySettings.myTomorrow;
    };
    let previousTomorrow = timeInput.value;
    if(mySettings.myFavoriteView){
      document.getElementById(mySettings.myFavoriteView).checked = true;
      document.getElementById(mySettings.myFavoriteView).dispatchEvent(pageEvent);
    };
    let previousFirstDay = document.querySelector("#firstDayOfWeekInput").value;

    if(mySettings.mySide == "light"){
      document.getElementById("switchModeBall").className = "ballLight";
      document.getElementById("switchModeBallUnder").className = "ballLight";
      document.querySelector(':root').style.setProperty('--bg-color', 'rgb(242, 243, 244)');
      document.querySelector(':root').style.setProperty('--bg-color-7', 'rgba(242, 243, 244, .7)');
      document.querySelector(':root').style.setProperty('--tx-color', 'darkslategrey');
    } else if(mySettings.mySide == "dark"){
      document.getElementById("switchModeBall").className = "";
      document.getElementById("switchModeBallUnder").className = "";
      document.querySelector(':root').style.setProperty('--bg-color', 'rgb(7, 10, 10)');
      document.querySelector(':root').style.setProperty('--bg-color-7', 'rgba(7, 10, 10, .7)');
      document.querySelector(':root').style.setProperty('--tx-color', 'rgba(242, 243, 244, .8)');
    };

    switchModeSlider.addEventListener("click", () => {
      document.getElementById("switchModeBall").classList.toggle("ballLight");
      document.getElementById("switchModeBallUnder").classList.toggle("ballLight");
      if(document.getElementById("switchModeBall").classList.contains("ballLight")){
        document.querySelector(':root').style.setProperty('--bg-color', 'rgb(242, 243, 244)');
        document.querySelector(':root').style.setProperty('--bg-color-7', 'rgba(242, 243, 244, .7)');
        document.querySelector(':root').style.setProperty('--tx-color', 'darkslategrey');
        document.querySelectorAll(".numberedCal").forEach(cal => {
          cal.classList.remove("numberedCalDark");
        });
      } else{
        document.querySelector(':root').style.setProperty('--bg-color', 'rgb(7, 10, 10)');
        document.querySelector(':root').style.setProperty('--bg-color-7', 'rgba(7, 10, 10, .7)');
        document.querySelector(':root').style.setProperty('--tx-color', 'rgba(242, 243, 244, .8)');
        document.querySelectorAll(".numberedCal").forEach(cal => {
          cal.classList.add("numberedCalDark");
        });
      };
    });

    clearStorageBtn.addEventListener("click", updateFromCloud);
    exitX.addEventListener("click", () => {
      //settingsScreen.classList.add("displayNone");
      document.getElementById(previousPage).checked = true;
      document.getElementById(previousPage).dispatchEvent(pageEvent);
    });
    cancelBtn.addEventListener("click", () => {
      // settingsScreen.classList.add("displayNone");
      // document.querySelector('input[name="switchPageRadios"]:checked').nextElementSibling.classList.remove("displayNone");
      document.getElementById(previousPage).checked = true;
      document.getElementById(previousPage).dispatchEvent(pageEvent);
    });
    let clockChangeListener = false;
    document.querySelectorAll(".clocks").forEach(clock => {
      clock.addEventListener("change", () =>{
        clockChangeListener = true;
      });
    });

    settingsBtn.addEventListener("click", () => {
      mySettings.myTomorrow = `${timeInput.value}`;
      if(previousTomorrow !== mySettings.myTomorrow){
        document.getElementById("todaysDateSpan").innerHTML = getTodayDateString();
        document.getElementById("todaysDaySpan").innerHTML = getDayNameFromString(getTodayDateString());
        listTasks.forEach(todo => {
          todoCreation(todo);
        });
        updateArrowsColor();
        sortItAll();
        getWeeklyCalendar();
      };

      mySettings.myFavoriteView = document.querySelector('input[name="choicePageRadios"]:checked').value;
      
      if(document.getElementById("switchModeBall").classList.contains("ballLight")){
        mySettings.mySide = "light";
      } else {
        mySettings.mySide = "dark";
      };
      
      
      if(clockChangeListener){ //if there are clocks: mySettings.offAreas = true
        // document.querySelectorAll(".dayClocksDiv").forEach(div => {
        //   let thisCode = div.id.substring(0, 2);
        //   let codeIdx = mySettings.myWeeksDayArray.indexOf(day => day.code == thisCode);
        //   //let clockInTime = div.querySelector(".clockIn").value;
        //   mySettings.myWeeksDayArray[codeIdx].clockIn = div.querySelector(".clockIn").value;
        //   mySettings.myWeeksDayArray[codeIdx].clockOut = div.querySelector(".clockOut").value;
        // });
        //createBody(); I don't think we need to redo the monthly...
        //getWeeklyCalendar(); we don't need to redo the whole weekly either, just the sleepy area
        updateSleepAreas();
      };

      let firstDay = document.querySelector("#firstDayOfWeekInput").value;
      if(previousFirstDay !== firstDay){
        let run = true;
        while(run){
          if(mySettings.myWeeksDayArray[0].code == firstDay){
            run = false;
          } else{
            let removed = mySettings.myWeeksDayArray.shift();
            mySettings.myWeeksDayArray.push(removed);
            run = true;
          };
        };
        createBody(); //did not work at all! because that one is not created from the array
        getWeeklyCalendar();
      };
      localStorage.mySettings = JSON.stringify(mySettings);
      // if(userConnected){
      //   cloudSaveSettings(); //or we just do a updateCBC(); and let the user save it with everything else
      // };
      // settingsScreen.classList.add("displayNone");
      // document.querySelector('input[name="switchPageRadios"]:checked').nextElementSibling.classList.remove("displayNone");
      updateCBC();
      document.getElementById(previousPage).checked = true;
      document.getElementById(previousPage).dispatchEvent(pageEvent);
    });
  };
// });
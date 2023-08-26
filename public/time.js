let steps;
let myScheduleList = [];

//**once it's connected to google accounts
//**connect to an account and save the whole thing with a name for later [one collection "plan" for everyone, but owner value = email or user.id]
//**once it's an app
//**add a button to do a printscreen and make it your new background
//**add a button to create notification for each steps

function saveSteps() {
  localStorage.setItem("steps", JSON.stringify(steps));
  // localStorage.setItem("destination", document.getElementById("destination").value);
  // localStorage.setItem("arriveeTime", document.getElementById("arriveeTime").value);
  // localStorage.setItem("notes", document.getElementById("notes").value);
};

function clearStorage() {
  if (confirm("Are you sure?!\nBecause you'll loose all your changes!")) {
    localStorage.clear();
    location.reload();
  }
}

function displayPlans() {
  myScheduleList = myScheduleList.toSorted((a, b) => {
    // if(a.ordre < b.ordre){
    //     return -1
    // } else if(a.ordre > b.ordre){
    //     return 1
    // } else if(a.ordre === b.ordre){
    //     return 0
    // }
    return a.ordre < b.ordre ? -1 : a.ordre > b.ordre ? 1 : 0
  });
  document.getElementById("togglePlansWhole").classList.remove("displayNone");
  let listLi = myScheduleList.map((schedule) => {
      return `
        <li class="listPlan"  id="${schedule.id}">
            <p><span class="typcn icon typcn-star planStar" title="Default!"></span><span class="typcn icon typcn-th-small planDD" title="Drag & Drop"></span><span class="trashLinePlan"><span class="underTrashLine" onclick="getSchedule('${schedule.id}')" title="Show that one">${schedule.id}</span></span><span class="typcn icon typcn-trash planTB" onclick="trashPlan(event)" title="Trash it!"></span></p>
        </li>`
  }).join("");
  document.getElementById("mySchedules").innerHTML = `
    <ul class="listPlans">${listLi}</ul>
    <button title="Fix that mess!" id="manageMode" class="timeFormButtonSmall" style="height: 30px; width: 90px;" onclick="manageMode()">Manage</button>
    <button title="Get out of manage mode!" id="manageCancel" class="timeFormButtonSmall displayNone" style="float:left; width: 90px;" onclick="manageCancel()">
    Cancel
    <span class="typcn icon typcn-cancel" style="opacity: .8; font-size: 1.2em; line-height: 1em;"></span>
    </button>
    <button title="That's the way I like it!" id="managedPlans" class="timeFormButtonSmall displayNone" style="float:right; width: 100px;" onclick="managedPlans()">
    Save this&hairsp;!
    <span class="typcn icon typcn-cloud-storage-outline" style="opacity: .8; font-size: 1.2em; line-height: 1em;"></span>
    </button>`;
    let plans = document.querySelectorAll(".listPlans > .listPlan");
    plans[0].classList.add("starDefault");
}
function manageMode(){
  //trash can doesn't trashSchedule right away! add trashline, then after confirmation trashSchedule (and reorder) all at once
  document.getElementById("manageMode").classList.add('displayNone');
  document.getElementById("manageCancel").classList.remove('displayNone');
  document.getElementById("managedPlans").classList.remove('displayNone');
  let listPlans = document.querySelector(".listPlans");
  listPlans.classList.add("managePlans");
  let plans = document.querySelectorAll(".listPlans > .listPlan");
  plans.forEach(plan => {
    plan.setAttribute('draggable', true)
    plan.addEventListener("dragstart", () => {
      // Adding dragging class to item
      plan.classList.add("dragging");
      plan.classList.remove("starDefault");
    });
    plan.addEventListener("dragend", () => {
      // Adding dragging class to item
      plan.classList.remove("dragging");
    });
  })
    let icons = document.querySelectorAll(".listPlans > .listPlan .planDD");
    icons.forEach(icon =>{
    // Adding dragging class to item
    icon.addEventListener("touchstart", (evt) => {
      evt.currentTarget.parentElement.parentElement.classList.add("dragging");
      evt.currentTarget.parentElement.parentElement.classList.remove("starDefault");
    });
    // Removing dragging class from item on dragend event
    icon.addEventListener("touchend", (evt) => {
      evt.currentTarget.parentElement.parentElement.classList.remove("dragging");
    });
  });
  listPlans.addEventListener("dragover", listPlansDD);
  listPlans.addEventListener("drop", listPlansOD);
  listPlans.addEventListener("touchmove", listPlansDD);
  listPlans.addEventListener("touchend", listPlansOD);
}
const listPlansDD = (e) => {
  let listPlans = document.querySelector(".listPlans");
  e.preventDefault();
  const draggingPlan = document.querySelector(".dragging");
  // Getting all items except currently dragging and making array of them
  let siblings = [...listPlans.querySelectorAll(".listPlan:not(.dragging)")];
  // Finding the sibling after which the dragging item should be placed
  let nextSibling = siblings.find(sibling => {
    if (e.clientX) {
      //if mouse
      return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    } else {
      //if touch
      return e.changedTouches[0].clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    }
  });
  // Inserting the dragging item before the found sibling
  listPlans.insertBefore(draggingPlan, nextSibling);
}
function listPlansOD(){
  let plans = document.querySelectorAll(".listPlans > .listPlan");
  plans[0].classList.add("starDefault");
  for(i = 1; i < plans.length; i++){
    plans[i].classList.remove("starDefault");
  };
}
function trashPlan(event){
  event.currentTarget.parentElement.parentElement.classList.toggle("trashedPlan");
}
function manageCancel(){
  displayPlans();
}
let trashedSchedules = [];
function managedPlans(){
  if (confirm("Are you sure?!\n'Cause you don't come back from that!")) {
    for (let i = myScheduleList.length - 1; i >= 0; i--) {
      let planTrash = document.getElementById(`${myScheduleList[i].id}`);
      if (planTrash.classList.contains("trashedPlan")) { 
        trashedSchedules.push(myScheduleList[i]);
        myScheduleList.splice(i, 1);
        planTrash.remove();
      };
    };
    trashSchedules();
    
    let plans = Array.from(document.querySelectorAll(".listPlans > .listPlan"));
    for (let a = 0; a < plans.length; a++) {
      let name = plans[a].id;
      let plan = myScheduleList.find((x) => x.id == name)
      plan.ordre = a;
    };
    orderSchedules();
    displayPlans();
  }
} 


function displaySteps() {
  let timeForm = document.getElementById("timeForm");
  let stepAll = `
    <div class="stepBox"  style="flex-wrap: wrap;">
    <label class="timeSettingLabel" style="margin-bottom: 7px;">Destination:</label>
    <input id="destination" class="timeDestination" type="text" value="${steps.destination}" onchange="updateSteps()"/>
    </div>`;
  let stepArray = steps.steps.map((step, idx) => {
    return `
    <li class="iteme" draggable="true" data-index="${idx}" style="${step.style}" id="${step.id}">
        <div class="changeIcon">
        <span class="typcn icon typcn-th-small itemeDD" style="opacity: .8;"></span>
        <input id="${step.id}trashCan" class="cossin" type="checkbox" onchange="trashOrNot(event)"/>
        <label for="${step.id}trashCan" class="typcn icon typcn-trash trashLabel displayNone" style="opacity: .8; font-size: 1.5em; line-height: 1em; margin: 0 -5px 0 -2px;" ></label>
        </div>
        <div class="trashLine">
        <div>
            <input id="${step.id}Check" class="cossin timeSettingInput" name="${step.id}" type="checkbox" ${step.checked ? "checked" : ""} onchange="updateSteps(event)"/>
            <label for="${step.id}Check" class="timeSettingLabel">
            <span class="timeSettingCheck"></span>
            </label>
            <input id="${step.id}Name" type="text" class="timeDestination timeDestination2" style="width:80px;" value="${step.name}" onchange="updateSteps(event)"/>
        </div>
        <div>
            <input id="${step.id}Time" class="timeDestination timeDestination2" type="number" step="5" value="${step.value}" onchange="updateSteps(event)"/>
            <span class="timeSettingLabel">min</span>
        </div>
        </div>
    </li>`
  })
  stepAll += `<ul id="sortable-List" class="sortable-List" style="padding:0;">${stepArray.join("")}</ul>`;
  stepAll += `<div class="stepBox">
    <button class="timeFormButton" style="float:left; height: 30px; width: 30px; padding: 0;" onclick="addStep()">
    +
    </button>
    <button title="Enter trash mode!" id="trashMode" class="timeFormButton" style="float:right; height: 30px; width: 30px; padding: 0;" onclick="trashMode()">
    <span class="typcn icon typcn-trash" style="opacity: .8; font-size: 1.2em; line-height: 1em;"></span>
    </button>
    <button title="Get out of trash mode!" id="trashCancel" class="timeFormButtonSmall displayNone" style="width: 90px;" onclick="trashCancel()">
    Cancel
    <span class="typcn icon typcn-cancel" style="opacity: .8; font-size: 1.2em; line-height: 1em;"></span>
    </button>
    <button title="Get rid of all the checked ones!" id="trashIt" class="timeFormButtonSmall displayNone" style="float:right; width: 90px;" onclick="trashIt()">
    Trash it&hairsp;!
    <span class="typcn icon typcn-trash" style="opacity: .8; font-size: 1.2em; line-height: 1em;"></span>
    </button>
</div>`;
  stepAll += `<div class="stepBox">
    <div>
    <label for="arriveeTime" class="timeSettingLabel">
        Arrival time
    </label>
    </div>
    <div id="arriveeTimeDiv">
    <input id="arriveeTime" type="time" value="${steps.arriveeTime}" onchange="updateSteps()"/>
    </div>
</div>`;
  stepAll += `<div class="stepBox"  style="flex-wrap: wrap;">
    <label class="timeSettingLabel" style="margin:0 0 7px;">
    Notes:
    </label>
    <textarea id="notes" class="timeDestination" onchange="updateSteps()">${steps.notes}</textarea>
</div>`
  stepAll += `<div class="stepBox">
    <button title="Calculate your schedule!" class="timeFormButton" style="float:right;" onclick="calculateTime(event)">
    Calculate&hairsp;!
    </button>
    <button id="saveItAll" title="Save it in the clouds!" class="timeFormButton" style="float:left;" onclick="savePlan(event)">
    <span class="typcn icon typcn-cloud-storage-outline" style="font-size: 1.4em; line-height: 1em;"></span>
    </button>
</div>
<div id="savePlan" class="stepBox" style="flex-wrap: wrap;"></div>`;
  stepAll += `<div class="stepBox">
    <button title="Get the original data back!" class="timeFormButton" style="font-size: .8em; font-family: 'Nunito'; margin: 15px auto; border-width: 0.5px 0.5px 2px 1px;" onclick="clearStorage()">
    Go back to original
    </button>
</div>`;
  timeForm.innerHTML = stepAll;
  let sortableList = document.querySelector(".sortable-List");
  let itemes = document.querySelectorAll(".sortable-List > .iteme");
  let icons = document.querySelectorAll(".sortable-List > .iteme > .changeIcon");
  itemes.forEach(iteme => {
    iteme.addEventListener("dragstart", (evt) => {
      // Adding dragging class to item
      evt.currentTarget.classList.add("dragging");
    });
    // Removing dragging class from item on dragend event
    iteme.addEventListener("dragend", (evt) => {
      evt.currentTarget.classList.remove("dragging");
    });
  });
  icons.forEach(icon => {
    // Adding dragging class to item
    icon.addEventListener("touchstart", (evt) => {
      evt.currentTarget.parentElement.classList.add("dragging");
    });
    // Removing dragging class from item on dragend event
    icon.addEventListener("touchend", (evt) => {
      evt.currentTarget.parentElement.classList.remove("dragging");
    });
  });
  sortableList.addEventListener("dragover", initSortableList);
  sortableList.addEventListener("drop", ondrop);
  sortableList.addEventListener("touchmove", initSortableList);
  sortableList.addEventListener("touchend", ondrop);
};

const initSortableList = (e) => {
  let sortableList = document.querySelector(".sortable-List");
  e.preventDefault();
  const draggingItem = document.querySelector(".dragging");
  // Getting all items except currently dragging and making array of them
  let siblings = [...sortableList.querySelectorAll(".iteme:not(.dragging)")];
  // Finding the sibling after which the dragging item should be placed
  let nextSibling = siblings.find(sibling => {
    if (e.clientX) {
      //if mouse
      return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    } else {
      //if touch
      return e.changedTouches[0].clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    }
  });
  // Inserting the dragging item before the found sibling
  sortableList.insertBefore(draggingItem, nextSibling);
}

function ondrop() {
  let itemes = Array.from(document.querySelectorAll(".sortable-List > .iteme"));
  steps.steps = itemes.map((iteme) => steps.steps[iteme.dataset.index]);
  updateItemesIndex();
  updateSteps();
}

function savePlan(event) {
  document.getElementById("savePlan").innerHTML = `<p style="font-size:calc(13.53px + 0.19vw); margin: 1em 0 0.2em;">How should we name that one?</p>
<input id="nameToSave" class="timeDestination" type="text" value="${document.getElementById("destination").value}"/>
<div class="stepBox" style="width: 100%;">
    <button title="Nevermind!" id="saveCancel" class="timeFormButtonSmall" style="height: 30px; width: 90px;" onclick="saveCancel()">
    Cancel
    <span class="typcn icon typcn-cancel" style="font-size: 1.2em; line-height: 1em;"></span>
    </button>
    <button title="Save it!" id="saveIt" class="timeFormButtonSmall" style="height: 30px; width: 90px;" onclick="window.saveIt()">
    Save it&hairsp;!
    <span class="typcn icon typcn-cloud-storage-outline" style="font-size: 1.4em; line-height: 1em;"></span>
    </button>
</div>`
}
function saveCancel() {
  document.getElementById("savePlan").innerHTML = ``;
}

function saveOptCancel(){
  saveCancel();
  document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
  document.getElementById("scheduleTime").innerHTML = ``;
  document.getElementById("togglePlansWhole").classList.remove("displayNone");
  document.getElementById("timeForm").classList.remove("displayNone");
};
function saveOptSaveAs(){
  document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
  document.getElementById("scheduleTime").innerHTML = ``;
  document.getElementById("togglePlansWhole").classList.remove("displayNone");
  document.getElementById("timeForm").classList.remove("displayNone");
}

function trashMode() {
  let trashables = document.querySelectorAll(".trashLabel");
  trashables.forEach((trashable) => {
    trashable.classList.remove('displayNone');
  });
  let moveables = document.querySelectorAll(".itemeDD");
  moveables.forEach((moveable) => {
    moveable.classList.add("displayNone");
  });
  document.getElementById("trashMode").classList.add('displayNone');
  document.getElementById("trashCancel").classList.remove('displayNone');
  document.getElementById("trashIt").classList.remove('displayNone');
}
function trashOrNot(event) {
  let trashCan = event.currentTarget;
  let trashDiv = trashCan.parentElement;
  let trashStep = trashDiv.parentElement;
  trashStep.classList.toggle("trashed");
}
function trashCancel() {
  let trashables = document.querySelectorAll(".trashLabel");
  trashables.forEach((trashable) => {
    trashable.classList.add('displayNone');
  });
  let moveables = document.querySelectorAll(".itemeDD");
  moveables.forEach((moveable) => {
    moveable.classList.remove("displayNone");
  });
  document.getElementById("trashMode").classList.remove('displayNone');
  document.getElementById("trashCancel").classList.add('displayNone');
  document.getElementById("trashIt").classList.add('displayNone');
  let trashTrasheds = document.querySelectorAll(".trashed");
  trashTrasheds.forEach((trashTrashed) => {
    trashTrashed.classList.remove("trashed");
  });
}

function trashIt() {
  updateSteps();
  if (confirm("Are you sure?!")) {
    for (let i = steps.steps.length - 1; i >= 0; i--) {
      let stepDiv = document.getElementById(`${steps.steps[i].id}`);
      if (stepDiv.classList.contains("trashed")) {
        steps.steps.splice(stepDiv.dataset.index, 1);
        stepDiv.remove();
      };
    }
    trashCancel();
    updateSteps();
    updateItemesIndex();
  } else {
    trashCancel();
  };
}

function addStep() {
  updateSteps();
  let stepName = prompt("Name your step");
  if (stepName) { steps.steps.push({ name: stepName, value: 30, checked: true, id: crypto.randomUUID() }) };
  displaySteps();
  saveSteps();
};

function updateSteps() {
  //steps.order = ??!?!
  steps.destination = document.getElementById("destination").value;
  steps.steps.forEach(step => {
    let value = Number.parseInt(document.getElementById(`${step.id}Time`).value);
    step.value = value;
    let checked = document.getElementById(`${step.id}Check`).checked;
    step.checked = checked;
    let name = document.getElementById(`${step.id}Name`).value;
    step.name = name;
  });
  steps.arriveeTime = document.getElementById("arriveeTime").value;
  steps.notes = document.getElementById("notes").value;
  saveSteps();
};
window.updateSteps = updateSteps;
// initializing();
// displaySteps();

function updateItemesIndex() {
  let itemes = Array.from(document.querySelectorAll(".sortable-List > .iteme"));
  for (let i = 0; i < itemes.length; i++) {
    itemes[i].dataset.index = i;
  };
}

function calculateTime(e) {
  updateSteps();
  let arriveeTime = document.getElementById('arriveeTime').valueAsDate;
  if (!arriveeTime) {
    document.getElementById("arriveeTimeDiv").classList.add("outlined");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() =>
        alert("When are you supposed to be there?"));
    })
  } else {
    document.getElementById("arriveeTimeDiv").classList.remove("outlined");
  };
  // console.log(arriveeTime.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }));
  let stepArray = steps.steps.filter((step) => {
    return step.checked;
  }).map((step, idx) => {
    if (step.name == "Travelling" || step.name == "Traveling") {
      return `<p>Départ: ${sumTimeSub(steps.steps, idx, arriveeTime)}</p>`;
    }
    else {
      return `<p>${step.name}: ${sumTimeSub(steps.steps, idx, arriveeTime)}</p>`;
    }
  });
  // console.log(stepArray);
  // <button id="capture-screenshot"
  // onclick="takeScreenshot();"><span class="material-symbols-outlined screenshotIcon">
  // screenshot_region
  // </span></button>
  let result = `
    <h2 id="finalDestination" style="text-align: center; margin: 0 0 .7em;">${document.getElementById("destination").value}</h2>
    <div style="padding: 0 10px; border: 2px solid;">
        <h3 style="margin: 5px 0; text-decoration: underline;">Schedule</h3>
        ${stepArray.join("")}
        <p>Arrivée: ${arriveeTime.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}</p>
        ${ifNotes()}
    </div>`;
  document.getElementById("scheduleTime").innerHTML = result;
  document.getElementById("scheduleTimeWhole").style.display = "flex";
  document.getElementById("timeForm").style.display = "none";
  document.getElementById("togglePlansWhole").classList.add("displayNone");
  document.getElementById("switchSliderWhole").style.display = "none";
  e.stopPropagation();
  document.querySelector("#timePage").addEventListener("click", clickHandler)
};
function ifNotes() {
  if (document.getElementById("notes").value) {
    return `<p style="margin-bottom: 5px;">Notes:</p>
    <div class="notesBorder">
        <p>${document.getElementById("notes").value.replace(/\n/g, '<br/>')}</p>
    </div>`;
  } else {
    return ``;
  };
}
function clickHandler() {
  document.getElementById("scheduleTimeWhole").style.display = "none";
  document.getElementById("timeForm").style.display = "block";
  document.getElementById("switchSliderWhole").style.display = "block";
  document.querySelector("#timePage").removeEventListener("click", clickHandler)
};
function sumTimeSub(steps, stepIndex, arriveeTime) {
  let totalMin = 0;
  steps.filter((step) => {
    return step.checked;
  }).forEach((step, idx) => {
    if (idx >= stepIndex) {
      totalMin += step.value;
      // console.log(idx + " " + stepIndex + " " + totalMin + " " + step.value);
    }
  });
  let startTime = new Date();
  startTime.setTime(arriveeTime.getTime() - totalMin * 60 * 1000);
  return startTime.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
};

const captureScreenshot = async () => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const screenshot = document.createElement("screenshot");

  try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia();
      screenshot.srcObject = captureStream;
      context.drawImage(screenshot, 0, 0, window.width, window.height);
      const frame = canvas.toDataURL("image/png");
      captureStream.getTracks().forEach(track => track.stop());
      window.location.href = frame;
  } catch (err) {
      console.error("Error: " + err);
  }
};
function takeScreenshot() {
  console.log("lala");
	var screenshot = document.documentElement
		.cloneNode(true);
	screenshot.style.pointerEvents = 'none';
	screenshot.style.overflow = 'hidden';
	screenshot.style.webkitUserSelect = 'none';
	screenshot.style.mozUserSelect = 'none';
	screenshot.style.msUserSelect = 'none';
	screenshot.style.oUserSelect = 'none';
	screenshot.style.userSelect = 'none';
	screenshot.dataset.scrollX = window.scrollX;
	screenshot.dataset.scrollY = window.scrollY;
	var blob = new Blob([screenshot.outerHTML], {
		type: 'text/html'
	});
	return blob;
}

function generate() {
	window.URL = window.URL || window.webkitURL;
	window.open(window.URL
		.createObjectURL(takeScreenshot()));
}
let steps;
let myScheduleList = [];

//**Change travellingTime in another arriveeTime (but with minutes input (no checkbox, if it's 0, let's not show it at all in the result) comme ça, ça fait plus de sense avec les résultats, et quand tu ajoutes un nouveau step (index:step.length), ça va arriver avant le travelling... Oh! à moins qu'on ait des escales...)
//**Make the drag&drop possible on touchscreens too
//**once it's connected to google accounts
//**connect to an account and save the whole thing with a name for later
//**once it's an app
//**add a button to do a printscreen and make it your new background
//**add a button to create notification for each steps
function initializing() {
  if (localStorage.getItem("steps")) {
    steps = JSON.parse(localStorage.getItem("steps"));
  } else {
    steps = [
      { index: 0, name: "Cooking", value: 30, checked: true, id: crypto.randomUUID() },
      { index: 1, name: "Eating", value: 60, checked: true, id: crypto.randomUUID() },
      { index: 2, name: "Toilet", value: 15, checked: true, id: crypto.randomUUID() },
      { index: 3, name: "Shower", value: 15, checked: true, id: crypto.randomUUID() },
      { index: 4, name: "Prepping", value: 30, checked: true, id: crypto.randomUUID() },
      { index: 5, name: "Travelling", value: 0, checked: true, id: crypto.randomUUID() }];
  }
};

function getInfo(info) {
  if (localStorage.getItem(info)) {
    return `${localStorage.getItem(info)}`;
  } else {
    return ``;
  };
}

function saveSteps() {
  localStorage.setItem("steps", JSON.stringify(steps));
  localStorage.setItem("destination", document.getElementById("destination").value);
  localStorage.setItem("arriveeTime", document.getElementById("arriveeTime").value);
  localStorage.setItem("notes", document.getElementById("notes").value);
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
  document.getElementById("mySchedules").innerHTML = myScheduleList.map((schedule) => {
    return `
        <div>
            <p><span class="typcn icon typcn-th-small planDD"></span>${schedule.id}<span class="typcn icon typcn-trash planTB"></span></p>
        </div>`
  }).join("");
}



function displaySteps() {
  let timeForm = document.getElementById("timeForm");
  let stepAll = `
    <div class="stepBox"  style="flex-wrap: wrap;">
    <label class="timeSettingLabel" style="margin-bottom: 7px;">Destination:</label>
    <input id="destination" class="timeDestination" type="text" value="${getInfo("destination")}" onchange="saveSteps()"/>
    </div>`;
  let stepArray = steps.map((step) => {
    return `
    <li class="iteme" draggable="true" data-index="${step.index}" style="${step.style}" id="${step.id}">
        <div class="changeIcon">
        <span class="typcn icon typcn-th-small" style="opacity: .8;"></span>
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
    <button title="Get out of trash mode!" id="trashCancel" class="timeFormButton displayNone" style="height: 30px; width: 90px; padding: 0; font-family:'Nunito', sans-serif; font-size:1em;" onclick="trashCancel()">
    Cancel
    <span class="typcn icon typcn-cancel" style="opacity: .8; font-size: 1.2em; line-height: 1em;"></span>
    </button>
    <button title="Get rid of all the checked ones!" id="trashIt" class="timeFormButton displayNone" style="float:right; height: 30px; width: 90px; padding: 0; font-family:'Nunito', sans-serif; font-size:1em;" onclick="trashIt()">
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
    <input id="arriveeTime" type="time" value="${getInfo("arriveeTime")}" onchange="saveSteps()"/>
    </div>
</div>`;
  stepAll += `<div class="stepBox"  style="flex-wrap: wrap;">
    <label class="timeSettingLabel" style="margin:0 0 7px;">
    Notes:
    </label>
    <textarea id="notes" class="timeDestination" onchange="saveSteps()">${getInfo("notes")}</textarea>
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
      iteme.classList.add("dragging");
    });
    // Removing dragging class from item on dragend event
    iteme.addEventListener("dragend", () => {
      iteme.classList.remove("dragging");
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
  let itemes = document.querySelectorAll(".sortable-List > .iteme");
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
// function ondrop(){
//   let itemes = Array.from(document.querySelectorAll(".sortable-List > .iteme"));
//   let itemesIndexArr = itemes.map((iteme, dataset) => {
//     return {index: iteme.dataset.index
//     };
//   })
//   console.log(itemesIndexArr);
//   let result = itemesIndexArr.map(a => a.index);
//   console.log(result);
//   steps = result.map((a, i) => steps[a]);
//   console.log(steps);
//   updateSteps();
//   for (let i = 0; i < itemes.length; i++) {
//     itemes[i].dataset.index = steps[i].index;
//   };
// }

function ondrop() {
  let itemes = Array.from(document.querySelectorAll(".sortable-List > .iteme"));
  steps = itemes.map((iteme) => steps[iteme.dataset.index]);
  updateItemesIndex();
  updateSteps();
}

function savePlan(event) {
  document.getElementById("savePlan").innerHTML = `<p style="font-size:calc(13.53px + 0.19vw); margin: 1em 0 0.2em;">How should we name that one?</p>
<input id="nameToSave" class="timeDestination" type="text" value="${document.getElementById("destination").value}"/>
<div class="stepBox" style="width: 100%;">
    <button title="Nevermind!" id="saveCancel" class="timeFormButton" style="height: 30px; width: 90px; padding: 0; font-family:'Nunito', sans-serif; font-size:1em;" onclick="saveCancel()">
    Cancel
    <span class="typcn icon typcn-cancel" style="font-size: 1.2em; line-height: 1em;"></span>
    </button>
    <button title="Save it!" id="saveIt" class="timeFormButton" style="float:right; height: 30px; width: 90px; padding: 0; font-family:'Nunito', sans-serif; font-size:1em;" onclick="window.saveIt()">
    Save it&hairsp;!
    <span class="typcn icon typcn-cloud-storage-outline" style="font-size: 1.4em; line-height: 1em;"></span>
    </button>
</div>`
}
function saveCancel() {
  document.getElementById("savePlan").innerHTML = ``;
}

function trashMode() {
  let trashables = document.querySelectorAll(".trashLabel");
  trashables.forEach((trashable) => {
    trashable.classList.remove('displayNone');
  });
  let moveables = document.querySelectorAll(".typcn-th-small");
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
  let moveables = document.querySelectorAll(".typcn-th-small");
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
    for (let i = steps.length - 1; i >= 0; i--) {
      let stepDiv = document.getElementById(`${steps[i].id}`);
      if (stepDiv.classList.contains("trashed")) {
        steps.splice(stepDiv.dataset.index, 1);
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

//**Drag&Drop doesn't work with the added step
// function addStep(){
//   updateSteps();
//   let stepName = prompt("Name your step");
//   if(stepName){steps.push({index:steps.length, name:stepName, value:30, checked:true, id:crypto.randomUUID()})};
//   let newStep = document.createElement('li');
//   newStep.classList.add("iteme");
//   newStep.setAttribute("draggable", "true");
//   newStep.setAttribute("id", steps[steps.length-1].id);
//   newStep.innerHTML = `
//     <div>
//       <span class="typcn icon typcn-th-small" style="opacity: .8;"></span>
//       <input id="${steps[steps.length - 1].id}trashCan" class="cossin" type="checkbox" onchange="trashOrNot(event)"/>
//       <label for="${steps[steps.length - 1].id}trashCan" class="typcn icon typcn-trash trashLabel displayNone" style="opacity: .8; font-size: 1.5em; line-height: 1em; margin: 0 -5px 0 -2px;" ></label>
//     </div>
//     <div class="trashLine">
//       <div>
//         <input id="${steps[steps.length - 1].id}Check" class="cossin timeSettingInput" name="${steps[steps.length - 1].id}" type="checkbox" ${steps[steps.length - 1].checked?"checked":""} onchange="updateSteps(event)"/>
//         <label for="${steps[steps.length - 1].id}Check" class="timeSettingLabel">
//           <span class="timeSettingCheck"></span>
//         </label>
//         <input id="${steps[steps.length - 1].id}Name" type="text" class="timeDestination timeDestination2" style="width:80px;" value="${steps[steps.length - 1].name}" onchange="updateSteps(event)"/>
//       </div>
//       <div>
//         <input id="${steps[steps.length - 1].id}Time" class="timeDestination timeDestination2" type="number" step="5" value="${steps[steps.length - 1].value}" onchange="updateSteps(event)"/>
//         <span class="timeSettingLabel">min</span>
//       </div>
//     </div>`;
//   let lastStep = document.getElementById("sortable-List").lastElementChild;
//   lastStep.after(newStep);
//   updateSteps();
//   saveSteps();
//   document.getElementById('footer').classList.remove('footerFixed');
// };

function addStep() {
  updateSteps();
  let stepName = prompt("Name your step");
  if (stepName) { steps.push({ index: steps.length, name: stepName, value: 30, checked: true, id: crypto.randomUUID() }) };
  displaySteps();
  saveSteps();
  document.getElementById('footer').classList.remove('footerFixed');
};

function updateSteps() {
  steps.forEach(step => {
    let index = steps.indexOf(step);
    step.index = index;
    let value = Number.parseInt(document.getElementById(`${step.id}Time`).value);
    step.value = value;
    let checked = document.getElementById(`${step.id}Check`).checked;
    step.checked = checked;
    let name = document.getElementById(`${step.id}Name`).value;
    step.name = name;
  });
  saveSteps();
};
initializing();
displaySteps();

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
  console.log(arriveeTime.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }));
  let stepArray = steps.filter((step) => {
    return step.checked;
  }).map((step) => {
    if (step.name == "Travelling") {
      return `<p>Départ: ${sumTimeSub(steps, step.index, arriveeTime)}</p>`;
    }
    else {
      return `<p>${step.name}: ${sumTimeSub(steps, step.index, arriveeTime)}</p>`;
    }
  });
  let result = `<h2 id="finalDestination" style="text-align: center; margin: 0 0 .7em;">${document.getElementById("destination").value}</h2>
<div style="padding: 0 10px; border: 2px solid;">
    <h3 style="margin: 5px 0; text-decoration: underline;">Schedule</h3>
    ${stepArray.join("")}
    <p>Arrivée: ${arriveeTime.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}</p>
    ${ifNotes()}
</div>`;
  document.getElementById("scheduleTime").innerHTML = result;
  document.getElementById("scheduleTime").style.display = "block";
  document.getElementById("timeForm").style.display = "none";
  document.getElementById("togglePlansWhole").style.display = "none";
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
  document.getElementById("scheduleTime").style.display = "none";
  document.getElementById("timeForm").style.display = "block";
  document.getElementById("togglePlansWhole").style.display = "block";
  document.getElementById("switchSliderWhole").style.display = "block";
  document.querySelector("#timePage").removeEventListener("click", clickHandler)
};
function sumTimeSub(steps, stepIndex, arriveeTime) {
  let totalMin = 0;
  steps.forEach((step) => {
    if (step.checked && step.index >= stepIndex) {
      totalMin += step.value;
    }
  });
  let startTime = new Date();
  startTime.setTime(arriveeTime.getTime() - totalMin * 60 * 1000);
  return startTime.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
};
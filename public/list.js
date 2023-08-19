// collection "list"
// document "Épicerie"
// collection "section"
// document "Fruits & légumes"
// collection "Item"
// document "Avocat"








function listItemTicked(element){
  element.parentElement.querySelector("label").classList.toggle("listCircleTicked");
  element.parentElement.querySelector("label > span").classList.toggle("invisible");
  element.parentElement.querySelector(".listItemName").classList.toggle("listItemNameTicked");
  let wholeList = element.parentElement.parentElement.parentElement;
  let notiNum = 0
  wholeList.querySelectorAll(".listCheck").forEach(check => {
    check.checked ? notiNum : notiNum += 1;
  });
  console.log(notiNum);
  let notiSpan = wholeList.querySelector(".notiSpan");
  notiNum > 0 ? notiSpan.classList.remove("displayNone") : notiSpan.classList.add("displayNone");
  notiNum > 9 ? notiSpan.innerText = "!" : notiSpan.innerText = notiNum;
}

function notiChecked(){
  document.querySelectorAll(".wholeList").forEach(list => {
    let notiNum = 0;
    list.querySelectorAll(".listCheck").forEach(check => {
      check.checked ? notiNum : notiNum += 1;
    });
    let notiSpan = list.querySelector(".notiSpan");
    notiNum > 0 ? notiSpan.classList.remove("displayNone") : notiSpan.classList.add("displayNone");
    notiNum > 9 ? notiSpan.innerText = "!" : notiSpan.innerText = notiNum;
  });  
}

notiChecked();

const wavyList = (e) => {
  let listDragableAll = document.querySelector(".listDragableAll");
  e.preventDefault();
  let draggingItem = document.querySelector(".dragging");
  // Getting all items except currently dragging and making array of them
  let siblings = [...listDragableAll.querySelectorAll(".listDragable:not(.dragging)")];
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
  listDragableAll.insertBefore(draggingItem, nextSibling);
  draggingItem.addEventListener("touchend", (evt) => {
    clearTimeout(timer);
    evt.currentTarget.classList.remove("dragging");
  });
}
function draggabled(){
  let listDragableAll = document.querySelector(".listDragableAll");
  listDragableAll.addEventListener("dragover", wavyList);
  listDragableAll.addEventListener("touchmove", wavyList);
  let listDragables = document.querySelectorAll(".listDragableAll > .listDragable");
  listDragables.forEach(listDragable => {
    listDragable.addEventListener("dragstart", (evt) => {
      evt.currentTarget.classList.add("dragging");
    });
    listDragable.addEventListener("dragend", (evt) => {
      evt.currentTarget.classList.remove("dragging");
    });
  })
  let timer;
let clickTime;
let startX;
let startY;
let unclickTime;
let stopX;
let stopY;
let listDragableNames = document.querySelectorAll(".listDragableAll > .listDragable > .listDragableName");
listDragableNames.forEach(listDragableName => {
  listDragableName.addEventListener("touchstart", (evt) => {
    // evt.currentTarget.classList.add("dragging");
    clickTime = new Date().getTime();
    startX = evt.changedTouches[0].clientX;
    startY = evt.changedTouches[0].clientY;
    // console.log("clickTime " + clickTime);
    listDragableName.setAttribute('readonly', true);
    listDragableName.setAttribute('draggable', false);
    timer = setTimeout(() => {
      listDragableName.setAttribute('draggable', true);
      listDragableName.parentElement.classList.add("dragging");
    }, 600);
  });
  listDragableName.addEventListener('touchend', (evt) => {
    unclickTime = new Date().getTime(); 
    stopX = evt.changedTouches[0].clientX;
    stopY = evt.changedTouches[0].clientY;
    let duree = unclickTime - clickTime;
    let distX = stopX - startX;
    let distY = stopY - startY;
    console.log("X " + distX + " - Y " + distY);
    // console.log("unclickTime " + unclickTime);
    if(duree < 300 && Math.abs(distX) < 150 && Math.abs(distY) < 150){
      console.log("yep " + duree);
      listDragableName.removeAttribute('readonly');
      listDragableName.setAttribute('draggable', true);
    } else if(duree < 400 && Math.abs(distX) >= 150 && Math.abs(distY) < 50){
      console.log("swipe!");
      listDragableName.parentElement.classList.add("erasing");
    }
    if(timer){
      clearTimeout(timer);
      listDragableName.removeAttribute('readonly');
      evt.currentTarget.parentElement.classList.remove("dragging");
    }
  });
})
}
draggabled();

  //   let lastTap = 0;
  //   let timeout;
  //   return function detectDoubleTap(event) {
  //     const curTime = new Date().getTime();
  //     const tapLen = curTime - lastTap;
  //     if (tapLen < 500 && tapLen > 0) {
  //       console.log('Double tapped!');
  //       event.preventDefault();
  //     } else {
  //       timeout = setTimeout(() => {
  //         clearTimeout(timeout);
  //       }, 500);
  //     }
  //     lastTap = curTime;
  //   };
  // }, { passive: false 
  
  // listDragableName.addEventListener("touchend", (evt) => {
  //   clearTimeout(timer);
  //   evt.currentTarget.parentElement.classList.remove("dragging");
  // });

// function detectDoubleTapClosure() {
//   let lastTap = 0;
//   let timeout;
//   return function detectDoubleTap(event) {
//     const curTime = new Date().getTime();
//     const tapLen = curTime - lastTap;
//     if (tapLen < 500 && tapLen > 0) {
//       console.log('Double tapped!');
//       event.preventDefault();
//     } else {
//       timeout = setTimeout(() => {
//         clearTimeout(timeout);
//       }, 500);
//     }
//     lastTap = curTime;
//   };
// }

// /* Regex test to determine if user is on mobile */
// if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
//     document.body.addEventListener('touchend', detectDoubleTapClosure(), { passive: false });
// }
document.querySelectorAll(".listToggler").forEach(toggle => {
  toggle.addEventListener("click", wholeDD);
})
function wholeDD(){
  if(document.querySelectorAll(".listToggler:checked").length == 0){
    console.log("yay");
    document.getElementById("allWholeList").classList.add("listDragableAll");
    document.querySelectorAll(".wholeList").forEach(list => {
      list.classList.add("listDragable");
      list.setAttribute('draggable', true);
    });
    document.querySelectorAll(".oneList").forEach(list => {
      list.classList.remove("listDragableAll");
    });
    document.querySelectorAll(".listItem").forEach(list => {
      list.classList.remove("listDragable");
    });
    draggabled();
  } else{
    console.log("nope");
    document.getElementById("allWholeList").classList.remove("listDragableAll");
    document.querySelectorAll(".wholeList").forEach(list => {
      list.classList.remove("listDragable");
      list.setAttribute('draggable', false);
    });
    document.querySelectorAll(".oneList").forEach(list => {
      list.classList.add("listDragableAll");
    });
    document.querySelectorAll(".listItem").forEach(list => {
      list.classList.add("listDragable");
    });
    draggabled();
  }
}
wholeDD();
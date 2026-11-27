import { rtdb, getDatabase, ref, get, set, update, onValue } from "/myFirebase.js";

// function handleCommand(action, data){
//   switch(action){
//     case "thisSlide":
//       thisSlide(data);
//       break;
//     case "slideNext":
//       slideNext();
//       break;
//     default:
//       console.log(action, data);
//       break;
//   };
// };

const userID = getUserID();

function getUserID(){
  let userID;
  if(localStorage.getItem("alixRocksUserID")){
    userID = localStorage.alixRocksUserID;
  } else {
    userID = crypto.randomUUID();
    localStorage.setItem("alixRocksUserID", userID);
  };
  return userID
};

function resetPage(){
  document.body.style.visibility = "hidden";
  document.body.innerHTML = `<div class="waiting"><p>Attendons<br>la prochaine question...</p></div>`;
  document.body.style.visibility = "visible";
};

function getQuestion(question){
  document.body.style.visibility = "hidden";
  document.body.innerHTML = "";
  document.body.innerHTML = question;
  getAnswer();
  document.body.style.visibility = "visible";
};

function getAnswer(){
  const answeringForm = document.querySelector(".answeringForm");
  if(!answeringForm) return
  const questionID = answeringForm.dataset.uuid;
  answeringForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const answer = answeringForm.elements.answerInput.value;
    if(answer){
      //now we send these info to workshop so that it'll insert it in the diapo, and, ideally, we also add them in the showing section of 
      let infoToSend = {
        userID: userID,
        questionID: questionID,
        answer: answer
      };
      get(ref(rtdb, `workshop/participation/answer/${questionID}/${userID}`))
      .then(snap => {
        if (snap.exists()) {
          updateAnswer(infoToSend);
        } else {
          sendAnswer(infoToSend);
        };
      });
      
    };
    answeringForm.reset();
    answeringForm.querySelector('button[type="submit"]').innerText = "Change";
  });
  answeringForm.querySelector('button.buttonEfface').addEventListener("click", () => {
    let infoToSend = {
        userID: userID,
        questionID: questionID
      };
    removeAnswer(infoToSend);
  });
};

function sendAnswer({userID, questionID, answer}){
  set(ref(rtdb, `workshop/participation/answer/${questionID}/${userID}`), {
    userID: userID,
    questionID: questionID,
    answer: answer,
    timestamp: Date.now()
  });
};
function updateAnswer({userID, questionID, answer}){
  update(ref(rtdb, `workshop/participation/answer/${questionID}/${userID}`), {
    userID: userID,
    questionID: questionID,
    answer: answer,
    timestamp: Date.now()
  });
};
function removeAnswer({userID, questionID}){
  remove(ref(rtdb, `workshop/participation/answer/${questionID}/${userID}`));
};


//document.body.style.visibility = "visible";

const pageLoadedAt = Date.now();
let questionSentAt = Date.now();

onValue(ref(rtdb, "workshop/participation/question"), (snapshot) => { // ce qui arrive de moi (la question)
  const data = snapshot.val();
  if (!data) return;

  // if (data.timestamp < pageLoadedAt && data.action !== "refresh") {
  //   // old command → start fresh
  //   set(ref(rtdb, "workshop/control"), null);
  //   set(ref(rtdb, "workshop/participation"), null); //???
  //   return;
  // }; //else do "refresh" or wait for the next command

  // handleCommand(data.action, data.data);
  getQuestion(data.data);

  // set(ref(rtdb, "workshop/control"), null);
});

onValue(ref(rtdb, "workshop/participation/"), (snapshot) => { // ce qui arrive de moi (la question)
  const data = snapshot.val();
  if (data == null){
    resetPage();
  };
});





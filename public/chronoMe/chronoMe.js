// The browser will limit the number of concurrent audio contexts
// So be sure to re-use them whenever you can
const myAudioContext = new AudioContext();

/**
 * Helper function to emit a beep sound in the browser using the Web Audio API.
 * 
 * @param {number} duration - The duration of the beep sound in milliseconds.
 * @param {number} frequency - The frequency of the beep sound.
 * @param {number} volume - The volume of the beep sound.
 * 
 * @returns {Promise} - A promise that resolves when the beep sound is finished.
 */

const timeShow = document.querySelector("#timeShow");
const timeShowZone = document.querySelector("#timeShowZone");
function turnGreen(duration){
  timeShowZone.style.backgroundColor = "";
  timeShow.animate([{width: "0"},{width: "200px"}], duration);
};
function turnBlueViolet(duration){
  timeShowZone.style.backgroundColor = "rgba(138, 43, 226, 1)";
  timeShowZone.animate([{backgroundColor: "rgba(138, 43, 226, 1)"},{backgroundColor: "rgba(138, 43, 226, 0)"}], duration);
};
function turnRed(duration){
  timeShowZone.style.backgroundColor = "rgba(255, 0, 0, 1)";
  timeShowZone.animate([{backgroundColor: "rgba(255, 0, 0, 1)"},{backgroundColor: "rgba(255, 0, 0, 0)"}], duration);
};
const delaysDefault = [5, 20, 5, 20, 5, 20];
//const delaysDefault = [3, 8, 3, 8, 3, 8];

delaysDefault.map((select, idx) => {
  let options = [];
  for(let i = 0; i < 61; i++){
    options.push(`<option value="${i}" ${i == select ? "selected" : ""}>${i}</option>`)
  };
  options.join("");
  document.querySelector(`#delay${idx}Select`).innerHTML = options;
});


function beep(duration, frequency, volume){
    return new Promise((resolve, reject) => {
        // Set default duration if not provided
        duration = duration || 200;
        frequency = frequency || 440;
        volume = volume || 5;

        try{
            let oscillatorNode = myAudioContext.createOscillator();
            let gainNode = myAudioContext.createGain();
            oscillatorNode.connect(gainNode);

            // Set the oscillator frequency in hertz
            oscillatorNode.frequency.value = frequency;

            // Set the type of oscillator
            oscillatorNode.type= "square";
            gainNode.connect(myAudioContext.destination);

            // Set the gain to the volume
            gainNode.gain.value = volume * 0.01;

            // Start audio with the desired duration
            oscillatorNode.start(myAudioContext.currentTime);
            
            oscillatorNode.stop(myAudioContext.currentTime + duration * 0.001);

            // Resolve the promise when the sound is finished
            oscillatorNode.onended = () => {
                resolve();
            };
        }catch(error){
            reject(error);
        };
    });
};

document.querySelector("#chronoMe").addEventListener("click", () => {
  let delay0 = document.querySelector("#delay0Select").value * 1000;
  let delay1 = document.querySelector("#delay1Select").value * 1000;
  let delay2 = document.querySelector("#delay2Select").value * 1000;
  let delay3 = document.querySelector("#delay3Select").value * 1000;
  let delay4 = document.querySelector("#delay4Select").value * 1000;
  let delay5 = document.querySelector("#delay5Select").value * 1000;
  // beep(200, 440, 100);
  Promise.resolve()
.then(() => {turnBlueViolet(delay0); beep();})
.then(() => delay(delay0))
.then(() => {turnGreen(delay1); beep(200, 870);})
.then(() => delay(delay1))
.then(() => {turnRed(delay2); beep();})
.then(() => delay(delay2))
.then(() => {turnGreen(delay3); beep(200, 870);})
.then(() => delay(delay3))
.then(() => {turnRed(delay4); beep();})
.then(() => delay(delay4))
.then(() => {turnGreen(delay5); beep(200, 870);})
.then(() => delay(delay5))
.then(() => {turnBlueViolet(); beep();});
});

// Simple beep
// beep(
//   // Set the duration to 0.2 second (200 milliseconds)
//   200,
//   // Set the frequency of the note to A4 (440 Hz)
//   440,
//   // Set the volume of the beep to 100%
//   100
// );

function delay(duration) {
  return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
        // turnGreen();
      }, duration);
  });
};

// Emit a set of beeps
// to simulate a Ready, Set, Go! 
// It goes like: 
// (low pitch) Beep 
// (1 second silence) 
// (low pitch) Beep
// (1 second silence)
// (low pitch) Beep
// (1 second silence)
// (higher pitch) Beep!!!


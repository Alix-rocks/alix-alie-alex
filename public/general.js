

window.addEventListener("scroll", () => {
  if(document.getElementById("backTopButton")){
    if(window.scrollY > window.innerHeight){
      document.getElementById("backTopButton").classList.add("yesCasaFoot");
    } else{
      document.getElementById("backTopButton").classList.remove("yesCasaFoot");
    };
};
});

function backTop(){
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function switchMode(){
  document.getElementById("switchModeBall").classList.toggle("ballDark");
  document.getElementById("switchModeBallUnder").classList.toggle("ballDark");
  if(document.getElementById("switchModeBall").classList.contains("ballDark")){
    if(document.getElementById('nopeH1')){
      document.getElementById('nopeH1').innerText = "Nope, there's nothing here...";
    };
    document.querySelector(':root').style.setProperty('--bg-color', 'black');
    document.querySelector(".wrapper").style.visibility = "visible";
    document.querySelector("#color-picker").value = "7";
    document.documentElement.style.setProperty('--thumbColor', 'purple');
    setColors(128, 0, 128, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1);
  } else{
    if(document.getElementById('nopeH1')){
      document.getElementById('nopeH1').innerText = "Nope, still nothing...";
    }
    document.querySelector(':root').style.setProperty('--bg-color', '#F2F3F4');
    setColors(0, 0, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1);
    document.querySelector(".wrapper").style.visibility = "hidden";
  };
}


function setColors(A, B, C, a, b, c, d, e, f, g, h, i, j){
  let root = document.documentElement;
  root.style.setProperty('--tx-color', 'rgba(' + A + ', ' + B + ', ' + C + ', ' + formatColor(a) + ')');
  let array = [a, b, c, d, e, f, g, h, i, j];
  let num = 9;
  for(i = 0; i < array.length; i++){
      root.style.setProperty('--color-' + num, 'rgba(' + A + ', ' + B + ', ' + C + ', .' + array[i] + ')');
    num--;
  };
}

function formatColor(a){
  // if(a == 10) return "1"
  // else return "." + a
  return a == 10 ? "1" : "." + a
}

function colorSlider() {
  let colorPicker = document.querySelector("#color-picker");
  let Cvalue = parseInt(colorPicker.value);
  let root = document.documentElement;
  switch (Cvalue) {
    case 0:
      root.style.setProperty('--thumbColor', 'red');
      setColors(255, 0, 0, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1);
      break;
    case 1:
      root.style.setProperty('--thumbColor', 'orange');
      setColors(255, 165, 0, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1);
      break;
    case 2:
      root.style.setProperty('--thumbColor', 'yellow');
      setColors(255, 255, 0, 6, 6, 5, 5, 4, 3, 2, 1, 1, 1);
      break;
    case 3:
      root.style.setProperty('--thumbColor', 'green');
      setColors(0, 128, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1);
      break;
    case 4:
      root.style.setProperty('--thumbColor', 'teal');
      setColors(0, 128, 128, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1);
      break;
    case 5: 
      root.style.setProperty('--thumbColor', 'cyan');
      setColors(0, 255, 255, 7, 6, 5, 5, 4, 3, 2, 1, 1, 1);
      break;
    case 6:
      root.style.setProperty('--thumbColor', 'blue');
      setColors(0, 0, 255, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1);
      break;    
    case 7:
      root.style.setProperty('--thumbColor', 'purple');
      setColors(128, 0, 128, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1);
      break;
    case 8:
      root.style.setProperty('--thumbColor', 'violet');
      setColors(238, 130, 238, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1);
      break;
    case 9:
      root.style.setProperty('--thumbColor', 'pink');
      setColors(255, 192, 203, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1);
      break;
    case 10:
      root.style.setProperty('--thumbColor', '#F2F3F4');
      setColors(242, 243, 244, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1);
      break;
  }
}

//Un jour on peut mettre tout ça dans un fichier jason au lieu que tout soit dans le javascript
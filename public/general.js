window.addEventListener("scroll", (evt) => {
  if(window.scrollY > window.innerHeight){
    document.getElementById("backTopButton").classList.add("yesCasaFoot");
  } else{
    document.getElementById("backTopButton").classList.remove("yesCasaFoot");
  }
});

function backTop(){
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
function switchMode(){
  document.getElementById("switchModeBall").classList.toggle("ballDark");
  if(document.getElementById("switchModeBall").classList.contains("ballDark")){
    document.getElementById('nopeH1').innerText = "Nope, there's nothing here...";
    document.querySelector(':root').style.setProperty('--bg-color', 'black');
    document.querySelector(':root').style.setProperty('--tx-color', 'purple');
  } else{
    document.getElementById('nopeH1').innerText = "Nope, still nothing...";
    document.querySelector(':root').style.setProperty('--bg-color', '#F2F3F4');
    document.querySelector(':root').style.setProperty('--tx-color', 'black');
  };
}
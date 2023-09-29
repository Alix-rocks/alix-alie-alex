import trans from "./trans.js";
function translate(){
  const listElement = document.querySelectorAll("[data-trans]");
  console.log(listElement);
}
window.addEventListener("load", translate);

export default {};
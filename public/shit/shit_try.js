function wisely(){
  var markedCheckbox = document.getElementsByName('theme');
  let list = document.querySelector("#wisely");
  list.innerText = "";
  for (var checkbox of markedCheckbox){
    if(checkbox.checked){
    console.log(checkbox.value + " et ");
      if(list.innerText == ""){
        list.innerText = (checkbox.value);
      } else{
        list.innerText = list.innerText + ", " + (checkbox.value);
      }
  }
}}

const legende = {
  "c1": "Cuisine",
  "c2": "Officina",
  "c3": "Calia",
  "c4": "Cabanon",
  "c5": "Dave's",
  "c6": "Parents'",
  "c1s1": "Dessus des armoires",
  "c2s1": "Bibliothèque noire 1",
  "c2s2": "Bibliothèque noire 2",
  "c2s3": "Bibliothèque brune",
  "c2s4": "Garde-robe",
  "c3s1": "Garde-robe",
  "c3s2": "Sous la table",
  "c6s1": "Garde-robe de la chambre au sous-sol",
  "": "",
  "": "",
  "": "",
  "": "",
  "": "",
  "": "",
  "": ""

};

function t(key){
  return legende[key]; // regarde si legende[key] existe, si oui retourne .or, si non retourne key
};

// MARK: Exemple de liste
let allOfIt = [
  {
    n1: "c1", //"c1" = cuisine; "c2" = chambre; "c3" = calia; "c4" = shed; "c5" = dave; "c6" = parents;
    n2: "c1s1", // section
    n3: "b1", // bag/box
    id: "", //random
    item: "culotte", //description
    iURL: ""
  },
  {
    n1: "c1", //"c1" = cuisine; "c2" = chambre; "c3" = calia; "c4" = shed; "c5" = dave; "c6" = parents;
    n2: "c2s1", // section
    n3: "b2", // bag/box
    id: "", //random
    item: "bas", //description
    iURL: ""
  },
  {
    n1: "c2", //"c1" = cuisine; "c2" = chambre; "c3" = calia; "c4" = shed; "c5" = dave; "c6" = parents;
    n2: "c2s3", // section
    n3: "b3", // bag/box
    id: "", //random
    item: "chapeau rouge", //description
    iURL: ""
  },
  {
    n1: "c2", //"c1" = cuisine; "c2" = chambre; "c3" = calia; "c4" = shed; "c5" = dave; "c6" = parents;
    n2: "c2s4", // section
    n3: "b4", // bag/box
    id: "", //random
    item: "chapeau noir", //description
    iURL: ""
  },
  {
    n1: "c3", //"c1" = cuisine; "c2" = chambre; "c3" = calia; "c4" = shed; "c5" = dave; "c6" = parents;
    n2: "c3s1", // section
    n3: "b5", // bag/box
    id: "", //random
    item: "bas blanc", //description
    iURL: ""
  },
  {
    n1: "c4", //"c1" = cuisine; "c2" = chambre; "c3" = calia; "c4" = shed; "c5" = dave; "c6" = parents;
    n2: "c3s2", // section
    n3: "b6", // bag/box
    id: "", //random
    item: "culotte noire", //description
    iURL: ""
  }
];


/* If all items have all the level names in, 
1. the level names should be short and there should be a glossary
2. there's an array fx that gives you all the different values appearing in the array (but only once each) so we could have all the "details" name that way for each level
3. we wouldn't need to change the position of the item in the big array whenever we change item position in the rooms
4. if we change a box in an other room, then we need to go to all of its item and change the room name
5. if we change a box to an other level (in room instead of section of room, for example), then we need to change the room and 'section' level of all its item  */
/*INSTEAD
each item is an object in the array and has only the id of its box or section or room (parentId)
each box and section (is an object in the array) and has only the id to its section or room (parentId)
each room (is an object in the array) and has no parentId or parentId == null
 */ 

// MARK: Liste par espace
function createList(){
  //let n1sInstead = allOfIt.filter(item => item.parentId == null);
  //let n2sInstead = allOfIt.filter(item => n1sInstead.includes(item.parentId));

  let n1s = [...new Set(allOfIt.map(item => {
    return item.n1;
  }))];
  console.log(n1s);
  // let n2s = [...new Set(allOfIt.map(item => {
  //   return item.n2;
  // }))];
  // console.log(n2s);
  // let n3s = [...new Set(allOfIt.map(item => {
  //   return item.n3;
  // }))];
  // console.log(n3s);

  let details1 = n1s.map(n1 => {
  //let details1Instead = n1sInstead.map(n1 => {
    //let n2s = allOfIt.filter(item => item.parentId == n1.id);
    //return 
  //})
    let n2s = [...new Set(allOfIt.map(item => {
      if(item.n1 == n1){
        return item.n2;
      };
    }))];
    return `<details class="level1">
      <span onclick="modIt(this)" class="modSpan">X</span>
      <summary>${t(n1)}</summary>
      ${
        n2s.map(n2 =>{
          let n3s = [...new Set(allOfIt.map(item => {
            if(item.n1 == n1 && item.n2 == n2){
              return item.n3;
            };
          }))];
          return `<details class="level2">
            <span onclick="modIt(this)" class="modSpan">X</span>
            <summary>${t(n2)}</summary>
              ${
                n3s.map(n3 =>{
                  return `<details class="level3">
                    <span onclick="modIt(this)" class="modSpan">X</span>
                    <summary>${t(n3)}</summary>
                    <p>Allô!</p>
                  </details>`;
                }).join("")
              }
          </details>`;
        }).join("")
      }
    </details>`
  }).join("");
  //document.body.innerHTML = details1;
  document.querySelector("#setup").innerHTML = details1;
};

createList();

// MARK: Recherche
const searchStuff = document.querySelector("#searchStuff");
const results = document.querySelector("#results");
searchStuff.addEventListener("submit", (e) => {
  e.preventDefault();
  let searchInput = searchStuff.querySelector('input[type="text"]');
  console.log(searchInput.value);
    if(searchInput.value !== ""){
      console.log(searchInput.value);
      let result = allOfIt.filter(stuff => stuff.item.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(searchInput.value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')));
      if(result.length == 0){
        results.innerHTML = `<p>not yet</p>`;
      } else{
        results.innerHTML = `<ul>
          ${
            result.map(stuff => {
              return `<li>${stuff.item}${stuff.iURL !== "" ? `<img url="${stuff.iURL}"></img>` : ``}</li>`; //add the where details (n1, n2, n3)
            }).join("")
          }
        </ul>`;
      };
    };
});

// MARK: Ajout

const n1Select = document.querySelector("#n1Select");
const n2Select = document.querySelector("#n2Select");
const n3Select = document.querySelector("#n3Select");
function addingForm(){
  let n1s = [...new Set(allOfIt.map(item => {
    return item.n1;
  }))];
  n1Select.insertAdjacentHTML("beforeend", n1s.map(n1 => {
    return `<option value="${n1}">${t(n1)}</option>`;
  }).join(""));
  n1Select.addEventListener("change", () => {
    n2Select.innerHTML = `<option value="null"></option>`;
    n3Select.innerHTML = `<option value="null"></option>`;
    let n2s = [...new Set(allOfIt.map(item => {
      if(item.n1 == n1Select.value){
        return item.n2;
      };
    }))];
    if(n2s.length > 0){
      n2Select.insertAdjacentHTML("beforeend", n2s.map(n2 => {
        return `<option value="${n2}">${t(n2)}</option>`;
      }).join(""));
      n2Select.addEventListener("change", () => {
        n3Select.innerHTML = `<option value="null"></option>`;
        let n3s = [...new Set(allOfIt.map(item => {
          if(item.n2 == n2Select.value){
            return item.n3;
          };
        }))];
        if(n3s.length > 0){
          n3Select.insertAdjacentHTML("beforeend", n3s.map(n3 => {
            return `<option value="${n3}">${t(n3)}</option>`;
          }).join(""));
        } else{
          n3Select.innerHTML = `<option value="null"></option>`;
        };
      });
    } else{
      n2Select.innerHTML = `<option value="null"></option>`;
    };
  });
};

addingForm();



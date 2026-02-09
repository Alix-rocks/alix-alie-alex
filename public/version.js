let version = "v1";

// export const versionNb = "v1";




// MARK: getDones
async function getDones(){
  const getDones = await getDocs(collection(db, "randomTask", auth.currentUser.email, "myListDones"));
  let lastWeekDateString = getLastWeekDateString();
  if(getDones){
    getDones.forEach((donedDate) => { // only get the ones for which the date is bigger than lastWeekDateString
      listDones.push({date: donedDate.id, list: donedDate.data().dones});
    });
  };
};

let sortedListDones = listDones.sort((d1, d2) => (d1.date > d2.date) ? 1 : (d1.date < d2.date) ? -1 : 0);
  sortedListDones.forEach(doned => {
    if (doned.list.length !== 0 && doned.date > lastWeekDateString) {
      let donedDate = doned.date;
      donedDateCreation(donedDate);
      doned.list.forEach(tidoned => {        
        donedCreation(donedDate, tidoned);
      });
    };
  });
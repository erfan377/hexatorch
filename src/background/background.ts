// // TODO: background script
import { initializeApp } from "firebase/app";
import { doc, getFirestore, getDoc, collection, setDoc, query, where, getDocs } from "firebase/firestore";


const getObjectFromLocalStorage = async function (key) {
  return new Promise<any[]>((resolve, reject) => {
    try {
      chrome.storage.local.get(key, function (value) {
        resolve(value[key]);
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

async function fetchLocal(listype) {
  var emptylist = [];
  if (listype == "approvedlist") {
    var localApprovedlist = await getObjectFromLocalStorage("approvedlist");
    if (localApprovedlist != undefined) {
      return localApprovedlist;
    }
    else {
      //approvedlist is empty
      return emptylist;
    }
  }
  else if (listype == "blockedlist") {
    var localblockedlist = await getObjectFromLocalStorage("blockedlist");
    if (localblockedlist != undefined) {
      return localblockedlist;
    }
    else {
      //blockedlist is empty
      return emptylist;
    }

  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.command.type === 'addToSafeList') {
    addURL(msg.command.value, "approvedlist").then((result) => {
      sendResponse(result)
    });
    return true
  } else if (msg.command.type === 'addToBlockedList') {
    addURL(msg.command.value, "blockedlist").then((result) => {
      sendResponse(result)
    });
    return true
  } else if (msg.command.type === "checkAddress") {
    run(msg.command.value).then((result) => {
      sendResponse(result)
    });
    return true
  } else if (msg.command.type === "removeAddress") {
    removeURL(msg.command.value).then((result) => {
      sendResponse(result)
    })
    return true
  }
});

async function removeURL(url) {
  var localApprovedlist = await fetchLocal("approvedlist");
  var localBlockedlist = await fetchLocal("blockedlist");
  if (localApprovedlist.includes(url)) {
    localApprovedlist = localApprovedlist.filter(item => item !== url)
    chrome.storage.local.set({ "approvedlist": localApprovedlist });
    return 'removedSafe'
  } if (localBlockedlist.includes(url)) {
    localBlockedlist = localBlockedlist.filter(item => item !== url)
    chrome.storage.local.set({ "blockedlist": localBlockedlist });
    return 'removedBlocked'

  }
}

//TODO: make this intro a if statement for response
async function addURL(newURL, listtype) {
  var localApprovedlist = await fetchLocal("approvedlist");
  var localBlockedlist = await fetchLocal("blockedlist");
  if (listtype == "approvedlist") {
    if (localApprovedlist.includes(newURL)) {
      //URL already exists in approvedlist
      return 'existsSafe';
    }
    else {
      localApprovedlist.push(newURL);
      console.log("successfully added " + newURL + " to the approvedlist");
      chrome.storage.local.set({ "approvedlist": localApprovedlist });
      return 'addedSafe';
    }
  }
  else if (listtype == "blockedlist") {
    if (localBlockedlist.includes(newURL)) {
      //URL already exists in blockedlist
      return 'existsBlocked';
    }
    else {
      localBlockedlist.push(newURL);
      console.log("successfully added " + newURL + " to the blockedList");
      chrome.storage.local.set({ "blockedlist": localBlockedlist });
      return 'addedBlocked';
    }
  }
}

async function checkURL(currelhost) {
  var localApprovedlist = await fetchLocal("approvedlist");
  var localBlockedlist = await fetchLocal("blockedlist");

  var results = {
    "inUserApprovedlist": false,
    "inUserBlockedlist": false,
    "inServerApprovedlist": false,
    "inServerBlockedlist": false
  };

  if (localApprovedlist.includes(currelhost)) {
    results["inUserApprovedlist"] = true;
  }

  if (localBlockedlist.includes(currelhost)) {
    results["inUserBlockedlist"] = true;
  }
  if (serverLookup("malicious_links", currelhost)) {
    results["inServerBlockedlist"] = true;
  }

  if (serverLookup("approved_links", currelhost)) {
    results["inServerApprovedlist"] = true;
  }
  return results;
}

async function run(currentHost: string) {
  let results = await checkURL(currentHost);
  if (results["inUserApprovedlist"] || results["inServerBlockedlist"]) {
    //it's in the approved list
    return 'safe';
  }
  else if (results["inUserBlockedlist"] || results["inServerBlockedlist"]) {
    //it's in the blocked list
    return 'blocked';
  } else {
    //didn't find it
    return 'notFound';
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyBCB4wc68n3VKUsrPWezCTkH2nGfBxQSEo",
  authDomain: "lighthouse-758b0.firebaseapp.com",
  projectId: "lighthouse-758b0",
  storageBucket: "lighthouse-758b0.appspot.com",
  messagingSenderId: "306456488253",
  appId: "1:306456488253:web:df9e0025487e924aecbd54",
  measurementId: "G-PF5BB7ZBN5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

//function query() {
// const approvedRef = collection(db, collection_name);
// const nameQuery = query(approvedRef, where("URL", "==", url));
// const querySnapshot = getDocs(nameQuery);
//}

function serverLookup(collection_name, url) {
  // // Initialize Firebase
  // const approvedRef = collection(db, collection_name);
  // const nameQuery = query(approvedRef, where("URL", "==", url));
  // const querySnapshot = getDocs(nameQuery);

  // querySnapshot.forEach((doc) => {
  //   return true;
  // });
  return false;
}


// function deleteURL(newURL, listtype) {
//   var localApprovedlist = [];
//   var localBlockedlist = [];
//   fetchLocal("approvedlist").then(function (v) { localApprovedlist = v });
//   fetchLocal("blockedlist").then(function (v) { localApprovedlist = v });

//   if (listtype == "approvedlist") {
//     if (localApprovedlist.includes(newURL)) {
//       var idx = localApprovedlist.indexOf(newURL);
//       if (idx != -1) localApprovedlist.splice(idx, 1);
//       chrome.storage.local.set({ "approvedlist": localApprovedlist });
//     }
//     else {
//       console.log("URLs does not exist in approvedlist");
//     }
//   }
//   else if (listtype == "blockedlist") {
//     if (localBlockedlist.includes(newURL)) {
//       var idx = localBlockedlist.indexOf(newURL);
//       if (idx != -1) localBlockedlist.splice(idx, 1);
//       chrome.storage.local.set({ "blockedlist": localBlockedlist });
//     }
//     else {
//       console.log("URLs does not exist in blockedlist");
//     }
//   }
// }

// function updateURL(oldURL, newURL, listtype) {
//   var localApprovedlist = [];
//   var localBlockedlist = [];
//   fetchLocal("approvedlist").then(function (v) { localApprovedlist = v });
//   fetchLocal("blockedlist").then(function (v) { localApprovedlist = v });
//   if (listtype == "approvedlist") {
//     if (localApprovedlist.includes(oldURL)) {
//       var idx = localApprovedlist.indexOf(oldURL);
//       if (idx != -1) localApprovedlist[idx] = newURL;
//       chrome.storage.local.set({ "approvedlist": localApprovedlist });
//     }
//     else {
//       console.log("URL does not exist in approvedlist");
//     }
//   }
//   else if (listtype == "blockedlist") {
//     if (localBlockedlist.includes(newURL)) {
//       var idx = localBlockedlist.indexOf(newURL);
//       if (idx != -1) localBlockedlist[idx] = newURL;
//       chrome.storage.local.set({ "blockedlist": localBlockedlist });
//     }
//     else {
//       console.log("URL does not exist in blockedlist");
//     }
//   }
// }
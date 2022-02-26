// // TODO: background script
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import isURL from 'validator/lib/isURL';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('fetchServer', { when: Date.now(), periodInMinutes: 30 })
})

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
  var localApprovedlist = await getObjectFromLocalStorage(listype);
  if (localApprovedlist != undefined) {
    return localApprovedlist;
  }
  else {
    return emptylist;
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
      // console.log("successfully added " + newURL + " to the approvedlist");
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
      // console.log("successfully added " + newURL + " to the blockedList");
      chrome.storage.local.set({ "blockedlist": localBlockedlist });
      return 'addedBlocked';
    }
  }
}

async function checkURL(currelhost) {
  var localApprovedlist = await fetchLocal("approvedlist");
  var localBlockedlist = await fetchLocal("blockedlist");
  var serverApprovedList = await fetchLocal("serverApprovedList");
  var serverBlockedList = await fetchLocal("serverBlockedList");

  var results = {
    "inUserApprovedlist": false,
    "inUserBlockedlist": false,
    "inServerApprovedlist": false,
    "inServerBlockedlist": false
  };

  if (localApprovedlist.includes(currelhost)) {
    results["inUserApprovedlist"] = true;
  } else if (localBlockedlist.includes(currelhost)) {
    results["inUserBlockedlist"] = true;
  } else if (serverApprovedList.includes(currelhost)) {
    results["inServerApprovedlist"] = true;
  } else if (serverBlockedList.includes(currelhost)) {
    results["inServerBlockedlist"] = true;
  }
  return results;
}

async function run(currentHost: string) {
  let results = await checkURL(currentHost);
  if (results["inUserApprovedlist"]) {
    //it's in the approved list
    return 'safeLocal';
  } else if (results["inServerApprovedlist"]) {
    return 'safeServer';
  } else if (results["inUserBlockedlist"]) {
    //it's in the blocked list
    return 'blockedLocal';
  } else if (results["inServerBlockedlist"]) {
    return 'blockedServer';
  } else {
    //didn't find it
    return 'notFound';
  }
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_apiKey,
  authDomain: process.env.FIREBASE_authDomain,
  projectId: process.env.FIREBASE_projectId,
  storageBucket: process.env.FIREBASE_storageBucket,
  messagingSenderId: process.env.FIREBASE_messagingSenderId,
  appId: process.env.FIREBASE_appId,
  measurementId: process.env.FIREBASE_measurementId
};

try {

  const app = initializeApp(firebaseConfig);
  const db = getFirestore();
  async function fetchServer(list) {
    const querySnapshot = await getDocs(collection(db, list));
    let urlList = [];
    querySnapshot.forEach((doc) => {
      urlList.push(doc.data().URL)
    })
    return urlList
  }
  async function cacheServer() {
    let safeUrl = await fetchServer('approved_links')
    chrome.storage.local.set({ "serverApprovedList": safeUrl });
    let blockedUrl = await fetchServer('malicious_links')
    chrome.storage.local.set({ "serverBlockedList": blockedUrl });
  }
  chrome.alarms.onAlarm.addListener(cacheServer)

} catch (ex) {
  console.log('Trouble launching firebase', ex)
}


function checkRunResult(result) {
  if (result === 'safeLocal' || result === 'safeServer') {
    chrome.action.setBadgeText({ text: 'SAFE' });
    chrome.action.setBadgeBackgroundColor({ color: '#00FF00' });
  } else if (result === 'blockedLocal' || result === 'blockedServer') {
    // NOTIFICATION
    // chrome.notifications.create(
    //   'reminder', {
    //   type: 'basic',
    //   title: 'Don\'t forget!',
    //   iconUrl: "static/icon.png",
    //   message: 'You have ' + ' things to do. Wake up, dude!',
    //   priority: 2
    // })
    chrome.action.setBadgeText({ text: 'BAD' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  } else if (result === 'notFound') {
    chrome.action.setBadgeText({ text: '' });
  }
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (isURL(tab.url)) {
    var tmpURL = new URL(tab.url);
    let url = tmpURL.hostname.toLowerCase()
    run(url).then((result) => {
      checkRunResult(result)
    })
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
});

chrome.tabs.onActivated.addListener(function (info) {
  chrome.tabs.get(info.tabId, function (tab) {
    if (isURL(tab.url)) {
      var tmpURL = new URL(tab.url);
      let url = tmpURL.hostname.toLowerCase()
      run(url).then((result) => {
        checkRunResult(result)
      })
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  });
});
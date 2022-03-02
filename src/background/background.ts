import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import isURL from 'validator/lib/isURL';

chrome.runtime.onInstalled.addListener((details) => {
  chrome.alarms.create('fetchServer', { when: Date.now(), periodInMinutes: 30 })

  console.log('detail', details)
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: './pin.gif'
    });
  }
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

async function addURL(newURL, listtype) {
  var localApprovedlist = await fetchLocal("approvedlist");
  var localBlockedlist = await fetchLocal("blockedlist");
  if (listtype == "approvedlist") {
    if (localApprovedlist.includes(newURL)) {
      return 'existsSafe';
    }
    else {
      localApprovedlist.push(newURL);
      chrome.storage.local.set({ "approvedlist": localApprovedlist });
      return 'addedSafe';
    }
  }
  else if (listtype == "blockedlist") {
    if (localBlockedlist.includes(newURL)) {
      return 'existsBlocked';
    }
    else {
      localBlockedlist.push(newURL);
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
    return 'safeLocal';
  } else if (results["inServerApprovedlist"]) {
    return 'safeServer';
  } else if (results["inUserBlockedlist"]) {
    return 'blockedLocal';
  } else if (results["inServerBlockedlist"]) {
    return 'blockedServer';
  } else {
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

function checkRunResult(result, url) {
  if (result === 'safeLocal' || result === 'safeServer') {
    chrome.action.setBadgeText({ text: 'SAFE' });
    chrome.action.setBadgeBackgroundColor({ color: '#16BD00' });
  } else if (result === 'blockedLocal' || result === 'blockedServer') {
    chrome.notifications.create({
      type: 'basic',
      title: 'Malicious Website',
      iconUrl: "./icon-128.png",
      message: `${url} is a malicious website in the database`,
      priority: 2
    })
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
      checkRunResult(result, url)
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
        checkRunResult(result, url)
      })
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  });
});

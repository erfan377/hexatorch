import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import isURL from "validator/lib/isURL";

chrome.runtime.onInstalled.addListener((details) => {
  chrome.alarms.create("fetchServer", {
    when: Date.now(),
    periodInMinutes: 240,
  });
  chrome.alarms.create("serverSetting", {
    when: Date.now(),
    periodInMinutes: 60,
  });

  if (details.reason === "install") {
    chrome.tabs.create({
      url: "./pin.gif",
    });
  }
});

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
  } else {
    return emptylist;
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("bg:msgg", msg.command.type, msg.command.value);

  if (msg.command.type === "addToSafeList") {
    addURL(msg.command.value, "approvedlist").then((result) => {
      sendResponse(result);
    });
    return true;
  } else if (msg.command.type === "addToBlockedList") {
    addURL(msg.command.value, "blockedlist").then((result) => {
      sendResponse(result);
    });
    return true;
  } else if (msg.command.type === "checkAddress") {
    run(msg.command.value).then((result) => {
      sendResponse(result);
    });
    return true;
  } else if (msg.command.type === "removeAddress") {
    removeURL(msg.command.value).then((result) => {
      sendResponse(result);
    });
    return true;
  } else if (msg.command.type === "setNotification") {
    chrome.storage.local.set({ notificationBlocked: msg.command.value.block });
    chrome.storage.local.set({ notificationSafe: msg.command.value.safe });

    return true;
  }
});

async function removeURL(url) {
  var localApprovedlist = await fetchLocal("approvedlist");
  var localBlockedlist = await fetchLocal("blockedlist");
  if (localApprovedlist.includes(url)) {
    localApprovedlist = localApprovedlist.filter((item) => item !== url);
    chrome.storage.local.set({ approvedlist: localApprovedlist });
    return "removedSafe";
  }
  if (localBlockedlist.includes(url)) {
    localBlockedlist = localBlockedlist.filter((item) => item !== url);
    chrome.storage.local.set({ blockedlist: localBlockedlist });
    return "removedBlocked";
  }
}

async function addURL(newURL, listtype) {
  var localApprovedlist = await fetchLocal("approvedlist");
  var localBlockedlist = await fetchLocal("blockedlist");
  console.log("bg:add url approve list", localApprovedlist);
  console.log("bg:add url commands", newURL, listtype);

  if (listtype == "approvedlist") {
    if (localApprovedlist.includes(newURL)) {
      return "existsSafe";
    } else {
      localApprovedlist.push(newURL);
      chrome.storage.local.set({ approvedlist: localApprovedlist });
      return "addedSafe";
    }
  } else if (listtype == "blockedlist") {
    if (localBlockedlist.includes(newURL)) {
      return "existsBlocked";
    } else {
      localBlockedlist.push(newURL);
      chrome.storage.local.set({ blockedlist: localBlockedlist });
      return "addedBlocked";
    }
  }
}

async function checkURL(currelhost) {
  var localApprovedlist = await fetchLocal("approvedlist");
  var localBlockedlist = await fetchLocal("blockedlist");
  var serverApprovedList = await fetchLocal("serverApprovedList");
  var serverBlockedList = await fetchLocal("serverBlockedList");

  var results = {
    inUserApprovedlist: false,
    inUserBlockedlist: false,
    inServerApprovedlist: false,
    inServerBlockedlist: false,
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
  console.log("bg:checkurl", results, currelhost);

  return results;
}

async function run(currentHost: string) {
  let results = await checkURL(currentHost);
  if (results["inUserApprovedlist"]) {
    return "safeLocal";
  } else if (results["inServerApprovedlist"]) {
    return "safeServer";
  } else if (results["inUserBlockedlist"]) {
    return "blockedLocal";
  } else if (results["inServerBlockedlist"]) {
    return "blockedServer";
  } else {
    return "notFound";
  }
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_apiKey,
  authDomain: process.env.FIREBASE_authDomain,
  projectId: process.env.FIREBASE_projectId,
  storageBucket: process.env.FIREBASE_storageBucket,
  messagingSenderId: process.env.FIREBASE_messagingSenderId,
  appId: process.env.FIREBASE_appId,
  measurementId: process.env.FIREBASE_measurementId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

async function fetchServer(list) {
  const querySnapshot = await getDocs(collection(db, list));
  let urlList = [];
  querySnapshot.forEach((doc) => {
    if (doc.data().URLs !== undefined) {
      for (const elem of doc.data().URLs) {
        if (elem.URL !== undefined) {
          urlList.push(elem.URL);
        }
      }
    }
  });
  return urlList;
}

function updateDurationSetting(doc, alarmName) {
  if (doc.data().update !== undefined) {
    if (doc.data().update === true) {
      if (doc.data().duration !== undefined) {
        chrome.alarms.clear(alarmName, () => {});
        chrome.alarms.create(alarmName, {
          periodInMinutes: doc.data().duration,
        });
      }
    }
  }
}

async function getServerSetting() {
  const querySnapshot = await getDocs(collection(db, "globalSetting"));
  querySnapshot.forEach((doc) => {
    if (doc.id === "storage") {
      if (doc.data().update !== undefined) {
        chrome.storage.local.set({ updateServerStorage: doc.data().update });
      }
    } else if (doc.id === "storageDuration") {
      updateDurationSetting(doc, "fetchServer");
    } else if (doc.id === "updateDuration") {
      updateDurationSetting(doc, "serverSetting");
    }
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "serverSetting") {
    getServerSetting();
  }
  if (alarm.name === "fetchServer") {
    cacheServer();
  }
});

async function cacheServer() {
  let serverUpdate = await getObjectFromLocalStorage("updateServerStorage");
  if (serverUpdate === undefined) {
    // It will be undefined when it's installed first time
    console.log("bg: cache serve first time", serverUpdate);

    await getServerSetting();
    serverUpdate = await getObjectFromLocalStorage("updateServerStorage");
  }
  if (serverUpdate !== undefined && serverUpdate) {
    console.log("bg: cache serve 2nd time", serverUpdate);

    let safeUrl = await fetchServer("approved_links");
    chrome.storage.local.set({ serverApprovedList: safeUrl });
    console.log("bg: cache serve 2nd time safe", safeUrl);

    let blockedUrl = await fetchServer("malicious_links");
    chrome.storage.local.set({ serverBlockedList: blockedUrl });
  }
}

function showNotification(command, info) {
  if (command) {
    chrome.notifications.create(info);
  }
}

async function checkRunResult(result, url) {
  console.log("bg: checkrunresult", result, url);

  if (result === "safeLocal" || result === "safeServer") {
    let notificationSetting = {
      type: "basic",
      title: "HexaTorch Safe Website",
      iconUrl: "./icon-128.png",
      message: `${url} is a safe website in the database`,
      priority: 2,
    };

    let notificationStatus = await getObjectFromLocalStorage(
      "notificationSafe"
    );
    showNotification(notificationStatus, notificationSetting);

    chrome.action.setBadgeText({ text: "SAFE" });
    chrome.action.setBadgeBackgroundColor({ color: "#16BD00" });
  } else if (result === "blockedLocal" || result === "blockedServer") {
    let notificationSetting = {
      type: "basic",
      title: "HexaTorch Malicious Website",
      iconUrl: "./icon-128.png",
      message: `${url} is a malicious website in the database`,
      priority: 2,
    };

    let notificationStatus = await getObjectFromLocalStorage(
      "notificationBlocked"
    );
    showNotification(notificationStatus, notificationSetting);

    chrome.action.setBadgeText({ text: "BAD" });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
  } else if (result === "notFound") {
    chrome.action.setBadgeText({ text: "" });
  }
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.action.setBadgeText({ text: "" });
  console.log("bg: on updated iddddd", tabId, changeInfo, tab);

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    console.log("bg: query tabss", tabs);
  });

  chrome.windows.getCurrent(function (tabid) {
    console.log("current tabid", tabid);
  });

  if (isURL(tab.url)) {
    console.log("bg: on updated is url", tab.url);
    var tmpURL = new URL(tab.url);
    let url = tmpURL.hostname.toLowerCase();
    run(url).then((result) => {
      console.log("bg: on updated run result", result, url);
      checkRunResult(result, url);
    });
  }
});

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  console.log("get current tab", tab);
}

async function getCurrentTab2() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  console.log("get current tab2", tab);
}

chrome.tabs.onHighlighted.addListener(function (tabif) {
  console.log("on highlighted", tabif);
});

chrome.windows.onFocusChanged.addListener(function (tabId, changeInfo) {
  console.log("tab change foc", tabId, changeInfo);
  getCurrentTab();
  getCurrentTab2();
});

chrome.tabs.onZoomChange.addListener(function (tabId) {
  console.log("on zoomes", tabId);
});

chrome.tabs.onAttached.addListener(function (tabId) {
  console.log("on attached", tabId);
});

chrome.tabs.getCurrent(function (tabId) {
  console.log("onother get current", tabId);
});

chrome.tabs.onActivated.addListener(function (info) {
  console.log("bg: on activated", info);
  chrome.action.setBadgeText({ text: "" });
  chrome.tabs.get(info.tabId, function (tab) {
    if (isURL(tab.url)) {
      console.log("bg: on activated is url", tab.url);
      var tmpURL = new URL(tab.url);
      let url = tmpURL.hostname.toLowerCase();
      run(url).then((result) => {
        console.log("bg: on activated run result", result);
        checkRunResult(result, url);
      });
    }
  });
});

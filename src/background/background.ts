import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import isURL from "validator/lib/isURL";
import Contract from "web3-eth-contract";

chrome.runtime.onInstalled.addListener((details) => {
  // getGas();
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
      url: "./intro.html",
    });
  }
});

const getObjectFromLocalStorage = async function (key: string) {
  return new Promise<any[]>((resolve, reject) => {
    chrome.storage.local.get(key, function (value) {
      resolve(value[key]);
    });
  });
};

async function fetchLocal(listType: string) {
  var emptylist = [];
  var localApprovedlist = await getObjectFromLocalStorage(listType);
  if (localApprovedlist != undefined) {
    return localApprovedlist;
  } else {
    return emptylist;
  }
}

function getGas(callback) {
  var ContractAny = Contract as any;
  ContractAny.setProvider(
    `https://mainnet.infura.io/v3/${process.env.INFURA_projectId}`
  );

  const aggregatorV3InterfaceABI = [
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "description",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
      name: "getRoundData",
      outputs: [
        { internalType: "uint80", name: "roundId", type: "uint80" },
        { internalType: "int256", name: "answer", type: "int256" },
        { internalType: "uint256", name: "startedAt", type: "uint256" },
        { internalType: "uint256", name: "updatedAt", type: "uint256" },
        { internalType: "uint80", name: "answeredInRound", type: "uint80" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "latestRoundData",
      outputs: [
        { internalType: "uint80", name: "roundId", type: "uint80" },
        { internalType: "int256", name: "answer", type: "int256" },
        { internalType: "uint256", name: "startedAt", type: "uint256" },
        { internalType: "uint256", name: "updatedAt", type: "uint256" },
        { internalType: "uint80", name: "answeredInRound", type: "uint80" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "version",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const gweiAddr = "0x169E633A2D1E6c10dD91238Ba11c4A708dfEF37C";
  const gasFeed = new ContractAny(aggregatorV3InterfaceABI, gweiAddr);
  const priceAddr = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
  const priceFeed = new ContractAny(aggregatorV3InterfaceABI, priceAddr);
  let results = { gwei: undefined, eth: undefined };
  gasFeed.methods
    .latestRoundData()
    .call()
    .then((roundData) => {
      // Do something with roundData
      results.gwei = roundData.answer / 1000000000;
    })
    .then(() => {
      priceFeed.methods
        .latestRoundData()
        .call()
        .then((roundData) => {
          // Do something with roundData
          results.eth = roundData.answer / 100000000;
        })
        .then(() => {
          callback(results);
        });
    });
  //This is the hack I came up with to ignore typing
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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
  } else if (msg.command.type === "getGas") {
    getGas(sendResponse);
    return true;
  }
});

async function removeURL(url: string) {
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

async function addURL(newURL: string, listType: string) {
  var localApprovedlist = await fetchLocal("approvedlist");
  var localBlockedlist = await fetchLocal("blockedlist");
  if (listType == "approvedlist") {
    if (localApprovedlist.includes(newURL)) {
      return "existsSafe";
    } else {
      localApprovedlist.push(newURL);
      chrome.storage.local.set({ approvedlist: localApprovedlist });
      return "addedSafe";
    }
  } else if (listType == "blockedlist") {
    if (localBlockedlist.includes(newURL)) {
      return "existsBlocked";
    } else {
      localBlockedlist.push(newURL);
      chrome.storage.local.set({ blockedlist: localBlockedlist });
      return "addedBlocked";
    }
  }
}

async function checkURL(currelhost: string) {
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

async function fetchServer(listType: string) {
  const querySnapshot = await getDocs(collection(db, listType));
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

function updateDurationSetting(doc: DocumentData, alarmName: string) {
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
    await getServerSetting();
    serverUpdate = await getObjectFromLocalStorage("updateServerStorage");
  }
  console.log("serverUpdate", serverUpdate);
  if (serverUpdate !== undefined && serverUpdate) {
    let safeUrl = await fetchServer("approved_links");
    console.log("safeURL", safeUrl);
    chrome.storage.local.set({ serverApprovedList: safeUrl });
    let blockedUrl = await fetchServer("malicious_links");
    chrome.storage.local.set({ serverBlockedList: blockedUrl });
  }
}

function showNotification(command, info) {
  if (command) {
    chrome.notifications.create(info);
  }
}

async function checkRunResult(result: string, url: string, tabNum: number) {
  if (url === "opensea.io") {
    if (result !== "safeServer") {
      console.log("yess its happenign");
    }
  }
  if (result === "safeLocal" || result === "safeServer") {
    let notificationSetting = {
      type: "basic",
      title: "HexaTorch Safe Website",
      iconUrl: "./logo_secure_128.png",
      message: `${url} is a safe website in the database`,
      priority: 2,
    };
    chrome.action.setIcon({
      path: {
        "128": "./logo_secure_128.png",
      },
      tabId: tabNum,
    });

    let notificationStatus = await getObjectFromLocalStorage(
      "notificationSafe"
    );
    showNotification(notificationStatus, notificationSetting);
  } else if (result === "blockedLocal" || result === "blockedServer") {
    chrome.action.setIcon({
      path: {
        "128": "./logo_notsecure_128.png",
      },
      tabId: tabNum,
    });
    let notificationSetting = {
      type: "basic",
      title: "HexaTorch Malicious Website",
      iconUrl: "./logo_notsecure_128.png",
      message: `${url} is a malicious website in the database`,
      priority: 2,
    };

    let notificationStatus = await getObjectFromLocalStorage(
      "notificationBlocked"
    );
    showNotification(notificationStatus, notificationSetting);
  } else if (result === "notFound") {
    chrome.action.setIcon({
      path: {
        "128": "./logo_neutral_128.png",
      },
      tabId: tabNum,
    });
  }
}

chrome.tabs.onUpdated.addListener(function (tabNum, changeInfo, tab) {
  // In case webpages keep updating in the background
  if (tab.active === true) {
    if (isURL(tab.url)) {
      var tmpURL = new URL(tab.url);
      let url = tmpURL.hostname.toLowerCase();
      run(url).then((result) => {
        checkRunResult(result, url, tabNum);
      });
    }
  }
});

chrome.tabs.onActivated.addListener(function (info) {
  chrome.tabs.get(info.tabId, function (tab) {
    // In case webpages keep updating in the background
    // not sure if we need it actually
    if (tab.active === true) {
      if (isURL(tab.url)) {
        var tmpURL = new URL(tab.url);
        let url = tmpURL.hostname.toLowerCase();
        run(url).then((result) => {
          checkRunResult(result, url, info.tabId);
        });
      }
    }
  });
});

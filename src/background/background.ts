// // TODO: background script
import { initializeApp } from "firebase/app";
import { doc, getFirestore, getDoc, collection, setDoc, query, where, getDocs } from "firebase/firestore";

chrome.runtime.onInstalled.addListener(() => {
  // TODO: on installed function
  console.log("am ii getting itn?");
  var tabIdToURL: Map<number, string> = new Map();
  var currentTabId = -1;

  var localApprovedlist = [];
  var localBlockedlist = [];

  var currentHost;
  var currentUrl;

  const processingTabId = {};

  //chrome.tabs.executeScript(null,{file:"contentScript.js"});


  function fetchLocal(listype) {
    if (listype == "approvedlist") {
      chrome.storage.local.get(["approvedlist"], (res) => {
        const isExist = res.approvedlist ?? true
        if (isExist) {
          localApprovedlist = res.approvedlist;
        }
        else {
          console.log("approvedlist is empty");
        }
      });
    }
    else if (listype == "blockedlist") {
      chrome.storage.local.get(["blockedlist"], (res) => {
        const isExist = res.blockedlist ?? true
        if (isExist) {
          localBlockedlist = res.blockedlist;
        }
        else {
          console.log("blockedlist is empty");
        }
      });
    }
  }

  function deleteURL(newURL, listtype) {
    if (listtype == "approvedlist") {
      if (localApprovedlist.includes(newURL)) {
        var idx = localApprovedlist.indexOf(newURL);
        if (idx != -1) localApprovedlist.splice(idx, 1);
        chrome.storage.local.set({ "approvedlist": localApprovedlist });
      }
      else {
        console.log("URLs does not exist in approvedlist");
      }
    }
    else if (listtype == "blockedlist") {
      if (localBlockedlist.includes(newURL)) {
        var idx = localBlockedlist.indexOf(newURL);
        if (idx != -1) localBlockedlist.splice(idx, 1);
        chrome.storage.local.set({ "blockedlist": localBlockedlist });
      }
      else {
        console.log("URLs does not exist in blockedlist");
      }
    }

  }

  function updateURL(oldURL, newURL, listtype) {
    if (listtype == "approvedlist") {
      if (localApprovedlist.includes(oldURL)) {
        var idx = localApprovedlist.indexOf(oldURL);
        if (idx != -1) localApprovedlist[idx] = newURL;
        chrome.storage.local.set({ "approvedlist": localApprovedlist });
      }
      else {
        console.log("URL does not exist in approvedlist");
      }
    }
    else if (listtype == "blockedlist") {
      if (localBlockedlist.includes(newURL)) {
        var idx = localBlockedlist.indexOf(newURL);
        if (idx != -1) localBlockedlist[idx] = newURL;
        chrome.storage.local.set({ "blockedlist": localBlockedlist });
      }
      else {
        console.log("URL does not exist in blockedlist");
      }
    }
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    console.log('sender status', sender);
    if (msg.command.type === 'addToSafeList') {
      console.log('bg adding to safe', msg.command.value)
      // TODO: do appropriate checks
      let result = addURL(msg.command.value, "approvedlist");
      sendResponse(result);
    } else if (msg.command.type === 'addToBlockedList') {
      console.log('bg adding to blocked', msg.command.value)
      let result = addURL(msg.command.value, "blockedlist");
      sendResponse(result);
    } else if (msg.command.type === "checkAddress") {
      console.log('bg just checking address her', msg.command.value)
      //TODO check URL and return 'found good' or 'found bad' or 'not found'
      // const tabId = [...tabIdToURL.keys()].find((k) => tabIdToURL[k] === msg.command.value)
      const result = run(msg.command.value)
      console.log('bg: res run ', result)
      sendResponse(result)
      // let result = run(msg.command.value)
      // sendResponse(result);
    } else if (msg.command.type === "getAddress") {
      console.log('bg: url', currentUrl)
      sendResponse(currentUrl);
    }
  });





  /*

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.foo.type === 'addToSafeList') {
      console.log('first', msg.foo.value)

      // TODO: do appropriate checks
      addURL(msg.foo.value, "approvedlist");

      //TODO: if addURL === true then sendResponse('true') else sendResponse('false')
      sendResponse('true');
    }
  });
  */

  //TODO: make this intro a if statement for response
  function addURL(newURL, listtype) {
    console.log('adding URL with list type ' + listtype);
    if (listtype == "approvedlist") {
      if (localApprovedlist.includes(newURL)) {
        console.log("URL already exists in approvedlist");
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
        console.log("URL already exists in blockedlist");
        return 'existsBlocked';
      }
      else {
        localBlockedlist.push(newURL);
        console.log("successfully added " + newURL + " to the blockedList");
        chrome.storage.local.set({ "blockedlist": localBlockedlist });
        return 'addedBLocked';
      }
    }
  }

  chrome.tabs.onRemoved.addListener(function (tabId) {
    var removed = tabIdToURL.get(tabId);
    tabIdToURL.delete(tabId);
    console.log("tabs removed ", removed);
  });

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log('updating ', tab.url);
    var tmpURL = new URL(tab.url);
    tabIdToURL.set(tabId, tmpURL.hostname);
    currentUrl = tab.url;
    if (changeInfo.url) {
      run(currentUrl);
    }
  });

  chrome.tabs.onActivated.addListener(function (info) {
    chrome.tabs.get(info.tabId, function (tab) {
      console.log('gett ', info.tabId);
      var tmpURL = new URL(tab.url);
      currentUrl = tab.url;
      tabIdToURL.set(info.tabId, tmpURL.hostname);
      run(currentUrl);
    });

  });

  function checkURL(currelhost) {
    console.log('approve list before', localApprovedlist)
    console.log('blocked list before', localBlockedlist)

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

  // chrome.runtime.onMessage.addListener(
  //   function(request, sender, sendResponse){
  //       if(request.function == "addURL") {
  //         sendResponse(true)
  //         addURL(request.url,request.listtype);
  //       }
  //   }
  // );

  function run(currentHost: string) {
    // console.log("pls", processingTabId[tabId])
    // if (processingTabId[tabId]) return 'tab id present';
    // processingTabId[tabId] = true;
    // console.log('tabId', tabId);
    //let newUrl = new URL(tabIdToURL[tabId]);
    // currentHost = tabIdToURL.get(tabId);

    console.log("URL changed: ", currentHost);

    let results = checkURL(currentHost);
    console.log('run', results);

    if (results["inUserApprovedlist"] || results["inServerBlockedlist"]) {
      console.log("it's in the approved list");
      // chrome.tabs.sendMessage(tabId, { msg: "approved" });
      console.log("it's in the approved list");
      return 'safe';
    }

    else if (results["inUserBlockedlist"] || results["inServerBlockedlist"]) {
      console.log("it's in the blocked list");
      // chrome.tabs.sendMessage(tabId, { msg: "blocked" });
      return 'blocked';

    } else {
      console.log("bg: didn't find it");
      return 'not found';
    }

    // delete processingTabId[tabId];
  }


  const firebaseConfig = {
    apiKey: process.env.REACT_APP_apiKey,
    authDomain: process.env.REACT_APP_authDomain,
    projectId: process.env.REACT_APP_projectId,
    storageBucket: process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_appId,
    measurementId: process.env.REACT_APP_measurementId
  };
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore();

  function query() {
    // const approvedRef = collection(db, collection_name);
    // const nameQuery = query(approvedRef, where("URL", "==", url));
    // const querySnapshot = getDocs(nameQuery);
  }

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

});

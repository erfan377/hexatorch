// // TODO: background script
import { initializeApp } from "firebase/app";
import { doc, getFirestore, getDoc, collection, setDoc, query, where, getDocs} from "firebase/firestore";

chrome.runtime.onInstalled.addListener(() => {
  // TODO: on installed function

    var tabIdToURL = {};
    var currentTabId = -1;

    var localWhiteList = [];
    var localBlackList = [];

    var currentHost;
    var currentUrl;

    const processingTabId = {};

    function fetchLocal(listype){
      if (listype=="whitelist"){
        chrome.storage.local.get(["whitelist"], (res) => {
          const isExist = res.whitelist ?? true
          if (isExist){
            localWhiteList = res.whitelist;
          }
          else{
            console.log("whitelist is empty");
          }
        });
      }
      else if (listype=="blacklist"){
        chrome.storage.local.get(["blacklist"], (res) => {
          const isExist = res.blacklist ?? true
          if (isExist){
            localBlackList = res.blacklist;
          }
          else{
            console.log("blacklist is empty");
          }
        });
      }
    }

    function deleteURL(newURL,listtype) {
      if (listtype=="whitelist"){
        if (localWhiteList.includes(newURL)){
          var idx = localWhiteList.indexOf(newURL);
          if (idx != -1) localWhiteList.splice(idx, 1);
          chrome.storage.local.set({"whitelist":localWhiteList});
        }
        else{
          console.log("URLs does not exist in whitelist");
        }
      }
      else if (listtype=="blacklist"){
        if (localBlackList.includes(newURL)){
          var idx = localBlackList.indexOf(newURL);
          if (idx != -1) localBlackList.splice(idx, 1);
          chrome.storage.local.set({"blacklist":localBlackList});
        }
        else{
          console.log("URLs does not exist in blacklist");
        }
      }
      
    }

    function updateURL(oldURL,newURL,listtype) {
      if (listtype=="whitelist"){
        if (localWhiteList.includes(oldURL)){
          var idx = localWhiteList.indexOf(oldURL);
          if (idx != -1) localWhiteList[idx]=newURL;
          chrome.storage.local.set({"whitelist":localWhiteList});
        }
        else{
          console.log("URLs does not exist in whitelist");
        }
      }
      else if (listtype=="blacklist"){
        if (localBlackList.includes(newURL)){
          var idx = localBlackList.indexOf(newURL);
          if (idx != -1) localBlackList[idx]=newURL;
          chrome.storage.local.set({"blacklist":localBlackList});
        }
        else{
          console.log("URLs does not exist in blacklist");
        }
      }
      
    }

    function addURL(newURL,listtype) {
      if (listtype=="whitelist"){
        if (localWhiteList.includes(newURL)){
          console.log("URL already exists in whitelist");

        }
        else{
          localWhiteList.push(newURL);
          chrome.storage.local.set({"whitelist":localWhiteList});
        }
      }
      else if (listtype=="blacklist"){
        if (localBlackList.includes(newURL)){
          console.log("URL already exists in blacklist");
        }
        else{
          localBlackList.push(newURL);
          chrome.storage.local.set({"blacklist":localBlackList});
        }
      }
      
    }
    chrome.tabs.onRemoved.addListener(function(tabId) {
      var removed = tabIdToURL[tabId];
      delete tabIdToURL[tabId];
      console.log("tabs removed "+removed);
    });

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
      console.log(tab.url);
      var tmpURL= new URL(tab.url);
      tabIdToURL[tabId] = tmpURL.hostname;
      if (changeInfo.url) {
        run(tabId);
      }
    });
    
    chrome.tabs.onActivated.addListener(function(info){
      chrome.tabs.get(info.tabId, function(tab){
        var tmpURL= new URL(tab.url);
        tabIdToURL[info.tabId] = tmpURL.hostname;
        run(info.tabId);
    });

    });

    function checkURL(currelhost){

      var results = {"inUserWhitelist":false,
                    "inUserBlacklist":false,
                    "inServerWhitelist":false,
                    "inServerBlacklist":false};

      if (localWhiteList.includes(currelhost)){
        results["inUserWhitelist"] = true;
      }

      if (localBlackList.includes(currelhost)){
        results["inUserBlacklist"] = true;
      }

      // to add: inServerWhitelist

      // to add: inServerBlacklist

      return results;

    }
    

    function run(tabId) {
      if (processingTabId[tabId]) return;
      processingTabId[tabId] = true;
      console.log(tabId);
      //let newUrl = new URL(tabIdToURL[tabId]);
      currentHost = tabIdToURL[tabId];
      //currentUrl = tab.url;

      console.log("URL changed: "+currentHost);
      //let result = checkURL(currentHost);

      
      delete processingTabId[tabId];
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
    
    let link = "cryptoslam.io";
    async function lookup(collection_name) {
      // Initialize Firebase
      const approvedRef = collection(db, collection_name);
      const nameQuery = query(approvedRef, where("URL", "==", link));
      const querySnapshot = await getDocs(nameQuery);
      querySnapshot.forEach((doc) => {
        console.log('Found', doc.data()['URL'], 'in', collection_name);
      });
    }
    //should return a bool value at least
    lookup("approved_links");
    lookup("malicious_links");

});

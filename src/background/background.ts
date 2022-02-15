// // TODO: background script
import { initializeApp } from "firebase/app";
import { doc, getFirestore, getDoc, collection, setDoc, query, where, getDocs} from "firebase/firestore";

chrome.runtime.onInstalled.addListener(() => {
  // TODO: on installed function

    var tabIdToURL = {};
    var currentTabId = -1;

    var localApprovedlist = [];
    var localBlockedlist = [];

    var currentHost;
    var currentUrl;

    const processingTabId = {};

    //chrome.tabs.executeScript(null,{file:"contentScript.js"});


    function fetchLocal(listype){
      if (listype=="approvedlist"){
        chrome.storage.local.get(["approvedlist"], (res) => {
          const isExist = res.approvedlist ?? true
          if (isExist){
            localApprovedlist = res.approvedlist;
          }
          else{
            console.log("approvedlist is empty");
          }
        });
      }
      else if (listype=="blockedlist"){
        chrome.storage.local.get(["blockedlist"], (res) => {
          const isExist = res.blockedlist ?? true
          if (isExist){
            localBlockedlist = res.blockedlist;
          }
          else{
            console.log("blockedlist is empty");
          }
        });
      }
    }

    function deleteURL(newURL,listtype) {
      if (listtype=="approvedlist"){
        if (localApprovedlist.includes(newURL)){
          var idx = localApprovedlist.indexOf(newURL);
          if (idx != -1) localApprovedlist.splice(idx, 1);
          chrome.storage.local.set({"approvedlist":localApprovedlist});
        }
        else{
          console.log("URLs does not exist in approvedlist");
        }
      }
      else if (listtype=="blockedlist"){
        if (localBlockedlist.includes(newURL)){
          var idx = localBlockedlist.indexOf(newURL);
          if (idx != -1) localBlockedlist.splice(idx, 1);
          chrome.storage.local.set({"blockedlist":localBlockedlist});
        }
        else{
          console.log("URLs does not exist in blockedlist");
        }
      }
      
    }

    function updateURL(oldURL,newURL,listtype) {
      if (listtype=="approvedlist"){
        if (localApprovedlist.includes(oldURL)){
          var idx = localApprovedlist.indexOf(oldURL);
          if (idx != -1) localApprovedlist[idx]=newURL;
          chrome.storage.local.set({"approvedlist":localApprovedlist});
        }
        else{
          console.log("URL does not exist in approvedlist");
        }
      }
      else if (listtype=="blockedlist"){
        if (localBlockedlist.includes(newURL)){
          var idx = localBlockedlist.indexOf(newURL);
          if (idx != -1) localBlockedlist[idx]=newURL;
          chrome.storage.local.set({"blockedlist":localBlockedlist});
        }
        else{
          console.log("URL does not exist in blockedlist");
        }
      }
      
    }

    /*

    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.foo.type === 'addToSafeList') {
        console.log('first', msg.foo.value)

        // TODO: do appropriate checks
        addURL(msg.foo.value, "approvedlist");

        //TODO: if addURL === true then sendResponse('true') else sendResponse('false')
        sendResponse('true');
      }
      if (msg.foo.type === 'checkAddress') {
        //TODO check URL and return 'found good' or 'found bad' or 'not found'
        sendResponse('fnot found');
      }
    });
    */




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
    function addURL(newURL,listtype) {
      console.log('adding URL with list type '+listtype);
      if (listtype=="approvedlist"){
        if (localApprovedlist.includes(newURL)){
          console.log("URL already exists in approvedlist");

        }
        else{
          localApprovedlist.push(newURL);
          console.log("successfully added "+newURL+" to the approvedlist");
          chrome.storage.local.set({"approvedlist":localApprovedlist});
        }
      }
      else if (listtype=="blockedlist"){
        if (localBlockedlist.includes(newURL)){
          console.log("URL already exists in blockedlist");
        }
        else{
          localBlockedlist.push(newURL);
          chrome.storage.local.set({"blockedlist":localBlockedlist});
        }
      }
    }

    chrome.tabs.onRemoved.addListener(function(tabId) {
      var removed = tabIdToURL[tabId];
      delete tabIdToURL[tabId];
      console.log("tabs removed ", removed);
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

      var results = {"inUserApprovedlist":false,
                    "inUserBlockedlist":false,
                    "inServerApprovedlist":false,
                    "inServerBlockedlist":false};

      if (localApprovedlist.includes(currelhost)){
        results["inUserApprovedlist"] = true;
      }

      if (localBlockedlist.includes(currelhost)){
        results["inUserBlockedlist"] = true;
      }

      if (serverLookup("malicious_links", currelhost)){
        results["inServerBlockedlist"] = true;
      }
      
      if (serverLookup("approved_links", currelhost)){
        results["inServerApprovedlist"] = true;
      }

      return results;

    }

    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse){
          if(request.function == "addURL") {
            addURL(request.url,request.listtype);
          }
      }
    );

    function run(tabId) {
      if (processingTabId[tabId]) return;
      processingTabId[tabId] = true;
      console.log(tabId);
      //let newUrl = new URL(tabIdToURL[tabId]);
      currentHost = tabIdToURL[tabId];
      //currentUrl = tab.url;

      console.log("URL changed: ", currentHost);

      let results = checkURL(currentHost);
      
      if (results["inUserApprovedlist"] || results["inServerBlockedlist"]){
        console.log("it's in the approved list");
        chrome.tabs.sendMessage(tabId,{msg:"approved"});
        console.log("it's in the approved list");
      }

      else if (results["inUserBlockedlist"] || results["inServerBlockedlist"]){
        console.log("it's in the blocked list");
        chrome.tabs.sendMessage(tabId,{msg:"blocked"});
      }
      
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

    async function serverLookup(collection_name, url) {
      // Initialize Firebase
      const approvedRef = collection(db, collection_name);
      const nameQuery = query(approvedRef, where("URL", "==", url));
      const querySnapshot = await getDocs(nameQuery);

      querySnapshot.forEach((doc) => {
        return true;
      });
      return false;
    }
    

});

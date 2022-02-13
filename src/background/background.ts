// // TODO: background script
import { initializeApp } from "firebase/app";
import { doc, getFirestore, getDoc, collection, setDoc, query, where, getDocs} from "firebase/firestore";

chrome.runtime.onInstalled.addListener(() => {
  // TODO: on installed function

    
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
    lookup("approved_links");
    lookup("malicious_links");
});

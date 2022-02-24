import React, { Component, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import './popup.css'
import logo from "./logo.jpg";
import Button from 'react-bootstrap/Button';

// const Ps = {
//   background-color: 'black',
//   height: 1000,
//   width: 1000,
// }


const NameForm = () => {
  //var port = chrome.runtime.connect({name: "myChannel"});
  const [value, setValue] = useState('');
  const [addressBar, setAddressBar] = useState('');
  const [showApproveBlocked, setShowApproveBlocked] = useState(false);
  const [showApproveSafe, setShowApproveSafe] = useState(false);
  const [showMainPage, setShowMainPage] = useState(true);
  const [showErrorBlocked, setShowErrorBlocked] = useState(false);
  const [showErrorSafe, setShowErrorSafe] = useState(false);
  const [showSafe, setShowSafe] = useState(false);
  const [showBad, setShowBad] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [submission, setSubmission] = useState(false);

  function handleChange(event) {
    event.preventDefault();
    setAddressBar(event.target.value);
  }

  function showNotFoundfn() {
    if (showNotFound) {
      return (
        <p>
          Nothing was found
        </p>)
    } else {
      return (
        <div>
        </div>);
    }
  }

  function showApprovefn() {
    if (showApproveSafe) {
      return (
        <p>
          Approved Safe added
        </p>)
    } else if (showApproveBlocked) {
      return (
        <p>
          Approved Blocked added
        </p>)
    } else {
      return (
        <div>
        </div>);
    }
  };



  function showErrorfn() {
    if (showErrorSafe) {
      return (
        <p>
          Got an error in adding, exists in safe list
        </p>)
    } else if (showErrorBlocked) {
      return (
        <p>
          Got an error in adding, exists in blocked list
        </p>)
    } else {
      return (
        <div>
        </div>);
    }
  };

  function showState() {

    if (showSafe) {
      return (
        <p>
          this address is safe
        </p>)
    } else if (showBad) {
      return (
        <p>
          this address is bad
        </p>)
    } else {
      return (
        <div>
        </div>);
    }
  };


  useEffect(() => {
  }, [showApproveSafe,
    showApproveBlocked,
    showMainPage,
    showErrorSafe,
    showErrorBlocked,
    showBad,
    showSafe,
    showNotFound,
    addressBar]);


  useEffect(() => {
    console.log('run on opening tabs');
    // fetchCurrentTab().then((url) => console.log('addressssssss', url));
    // console.log('addressssssss', url);
    setSubmission(false);
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      let tmpurl = tabs[0].url;
      let tmp = new URL(tmpurl);
      console.log('fetchh url', tmp.hostname)
      setAddressBar(tmp.hostname);
      checkAddress(tmp.hostname);
      return tmp.hostname;
    })
    console.log('should come after');
  }, []);


  //Todo handle blocklist
  function handleSubmit(event) {
    //  setValue(addressBar)
    setSubmission(true);
    event.preventDefault();
    checkAddress(addressBar);
  }



  function checkAddress(address) {
    console.log('pop: checkaddress', address);

    //chrome.extension.getBackgroundPage().window.location.reload();
    
    chrome.runtime.sendMessage({ command: { type: 'checkAddress', value: address } }, response => {

  
      console.log('pop: inside chrome check ad',  response)
      //response.then(console.log('pop: result of response,', response))
      // console.log('pop: result of response,', response)
      if (response === 'safe') {
        setShowSafe(true);
        setShowMainPage(false);
        console.log('pop: checking address safe')
      } else if (response === 'blocked') {
        setShowBad(true);
        setShowMainPage(false);
        console.log('pop: checking address blocked')
        // } 
        // else if (submission) {
        //   console.log('pop: checking address not found')
        //   setShowMainPage(false);
        //   setShowNotFound(true);
      } else {
        console.log('pop: just show main page')
        setShowMainPage(true);
      }
    }
    )
  };


  // function fetchCurrentTab(){

  //   chrome.runtime.sendMessage({command: {type: 'getAddress', value: ''}}, response => {

  //     console.log('address receiv', response);
  //     console.log('response safe', response)
  //     if (response === 'existsSafe' || response === 'existsBlocked'){
  //       setShowError(true);
  //       setShowMainPage(false);
  //       console.log('pop: address exists')
  //     } else if(response === 'addedSafe' || response === 'addedBlocked'){
  //       setShowApprove(true);
  //       setShowMainPage(false);
  //       console.log('pop: address added to safe')
  //     }
  //   })



  // }



  const addToDatabase = (action) => {
    chrome.runtime.sendMessage({ command: { type: action, value: addressBar } }, response => {
      console.log('response added', response)
      if (response === 'existsSafe') {
        setShowErrorSafe(true);
        setShowMainPage(false);
        console.log('pop: address exists')
      } else if (response === 'existsBlocked') {
        setShowErrorBlocked(true);
        setShowMainPage(false);
      } else if (response === 'addedSafe') {
        setShowApproveSafe(true);
        setShowMainPage(false);
        console.log('pop: address added to safe')
      } else if (response === 'addedBlocked') {
        setShowApproveBlocked(true);
        setShowMainPage(false);
      }
    })

  }


  const handleButtonEventSafe = () => {
    console.log("sending info to background for whitelist check");
    addToDatabase('addToSafeList');
  };

  const handleButtonEventBlock = () => {
    console.log("sending info to background for blocklist check");
    addToDatabase('addToBlockedList');
  };



  function mainpage() {
    if (showMainPage) {
      return (
        <form onSubmit={handleSubmit}>
          <label>
            <input
              type="text"
              placeholder="Type an address and press enter..."
              value={addressBar}
              onChange={e => handleChange(e)}
              style={{
                padding: "10px 20px",
                width: "300px",
                textAlign: "left",
                // align: "center",
                border: "0px",
                marginLeft: "25px",
                backgroundColor: '#EDE7E7',
                borderRadius: '10px',
              }}
            />
          </label>
          <img className='logo' src={logo} />
          <Button onClick={handleButtonEventSafe}> Add to Safe List</Button>
          <Button onClick={handleButtonEventBlock}> Add to Block List</Button>
        </form>
      );

    } else {
      return (
        <div>
        </div>);
    }
  }

  return (
    <div className='body'>
      <div className='header'>
        <text className='gaspricetitle'> ETH Mid Gas Price: </text>
        <br />
        <text className='gasprice'>  73 Gwei, $3.84 USD </text>
      </div>
      <div className='mainPage'>
        {mainpage()}
      </div>
      <div id='nextPages'>
        {showApprovefn()}
        {showErrorfn()}
        {showNotFoundfn()}
        {showState()}
      </div>
    </div>
  );

}

const App: React.FC<{}> = () => {
  return (
    <NameForm />
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
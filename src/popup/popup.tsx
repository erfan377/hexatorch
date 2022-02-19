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

  const [value, setValue] = useState('');
  const [addressBar, setAddressBar] = useState('');
  const [showApprove, setShowApprove] = useState(false);
  const [showMainPage, setShowMainPage] = useState(true);
  const [showError, setShowError] = useState(false);
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
    if (showApprove) {
      return (
        <p>
          Approved added
        </p>)
    } else {
      return (
        <div>
        </div>);
    }
  };



  function showErrorfn() {

    if (showError) {
      return (
        <p>
          Got an error in adding
        </p>)
    } else {
      return (
        <div>
        </div>);
    }
  };


  function showBadfn() {

    if (showBad) {
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

  function showSafefn() {

    if (showSafe) {
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
  }, [showApprove, showMainPage, showError, showBad, showSafe, showNotFound, addressBar]);


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



  async function checkAddress(address) {
    console.log('pop: checkaddress', address);

    chrome.runtime.sendMessage({ command: { type: 'checkAddress', value: address } }, async response => {

      console.log('pop: inside chrome check ad', response)
      let result = await response;
      response.then(console.log('pop: result of response,', response))
      // console.log('pop: result of response,', response)
      if (response === 'safe') {
        setShowSafe(true);
        setShowMainPage(false);
        console.log('pop: checking address safe')
      } else if (response === 'blocked') {
        setShowBad(true);
        setShowMainPage(false);
        console.log('pop: checking address blocked')

      } else if (submission) {
        console.log('pop: checking address not found')
        setShowMainPage(false);
        setShowNotFound(true);
      } else {
        console.log('pop: just show main page')
        setShowMainPage(true);
      }
    })
  };


  // async function fetchCurrentTab(){

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





  const handleButtonEventSafe = () => {
    console.log("sending info to background for whitelist check");

    chrome.runtime.sendMessage({ command: { type: 'addToSafeList', value: addressBar } }, response => {
      console.log('response safe', response)
      if (response === 'existsSafe' || response === 'existsBlocked') {
        setShowError(true);
        setShowMainPage(false);
        console.log('pop: address exists')
      } else if (response === 'addedSafe' || response === 'addedBlocked') {
        setShowApprove(true);
        setShowMainPage(false);
        console.log('pop: address added to safe')
      }
    })
  };

  const handleButtonEventBlock = () => {
    console.log("sending info to background for blocklist check");
    chrome.runtime.sendMessage({ command: { type: 'addToBLockedList', value: addressBar } }, response => {
      console.log('response block', response)
      if (response === 'existsSafe' || response === 'existsBlocked') {
        setShowError(true);
        setShowMainPage(false);
        console.log('pop: address exists blocked')
      } else if (response === 'addedSafe' || response === 'addedBLocked') {
        setShowApprove(true);
        setShowMainPage(false);
        console.log('pop: address added to blocked')
      }
    })
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
        {showBadfn()}
        {showSafefn()}
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
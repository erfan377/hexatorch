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
          Approved Safe added {addressBar}
        </p>)
    } else if (showApproveBlocked) {
      return (
        <p>
          Approved Blocked added {addressBar}
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
          Got an error in adding {addressBar} exists in safe list
        </p>)
    } else if (showErrorBlocked) {
      return (
        <p>
          Got an error in adding {addressBar} exists in blocked list
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
        <div className='safePage'>
          <p>
            {addressBar} address is safe
          </p>

          <Button onClick={handleButtonRemove}> Remove from SafeList</Button>
        </div>
      )
    } else if (showBad) {
      return (
        <p>
          {addressBar} address is bad
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
    setSubmission(false);
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      let tmpurl = tabs[0].url;
      let tmp = new URL(tmpurl);
      setAddressBar(tmp.hostname);
      checkAddress(tmp.hostname);
    })
  }, []);


  function handleSubmit(event) {
    setSubmission(true);
    event.preventDefault();
    checkAddress(addressBar);
  }



  function checkAddress(address) {
    chrome.runtime.sendMessage({ command: { type: 'checkAddress', value: address } }, response => {
      if (response === 'safe') {
        setShowSafe(true);
        setShowMainPage(false);
        return true
      } else if (response === 'blocked') {
        setShowBad(true);
        setShowMainPage(false);
        return true
      } else {
        setShowMainPage(true);
        return false
      }
    }
    )
  };


  const addToDatabase = (action) => {
    chrome.runtime.sendMessage({ command: { type: action, value: addressBar } }, response => {
      console.log('pop: response', response)
      if (response === 'existsSafe') {
        setShowErrorSafe(true);
        setShowMainPage(false);
      } else if (response === 'existsBlocked') {
        setShowErrorBlocked(true);
        setShowMainPage(false);
      } else if (response === 'addedSafe') {
        setShowApproveSafe(true);
        setShowMainPage(false);
      } else if (response === 'addedBlocked') {
        console.log('pop: im bad')
        setShowApproveBlocked(true);
        setShowMainPage(false);
      }
    })
  }


  const handleButtonRemove = () => {

  }

  function handleButtonEvent(command) {
    addToDatabase(command);
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
                border: "0px",
                marginLeft: "25px",
                backgroundColor: '#EDE7E7',
                borderRadius: '10px',
              }}
            />
          </label>
          <img className='logo' src={logo} />
          <Button onClick={() => handleButtonEvent('addToSafeList')}> Add to Safe List</Button>
          <Button onClick={() => handleButtonEvent('addToBlockedList')}> Add to Block List</Button>
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
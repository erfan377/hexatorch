import React, { Component, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import './popup.css'
import logo from "./logo.jpg";
import Button from 'react-bootstrap/Button';
import isURL from 'validator/lib/isURL';




// var validUrl = require('valid-url');
// console.log('')
const NameForm = () => {

  async function getGas() {
    let response = await fetch(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_apiKey}`);
    let responseJson = await response.json();
    let gasGwei = responseJson.result.SafeGasPrice
    response = await fetch(`https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_apiKey}`);
    responseJson = await response.json();
    let ethUsd = responseJson.result.ethusd
    let averagePrice = ethUsd * gasGwei / 1000000000 * 21000
    averagePrice = parseFloat(averagePrice.toFixed(3))
    setGas({ gwei: gasGwei, usd: averagePrice })
  }



  const [addressBar, setAddressBar] = useState('');
  const [page, setPage] = useState('main');
  const [gas, setGas] = useState({ gwei: 0, usd: 0 });

  function handleChange(event) {
    event.preventDefault();
    setAddressBar(event.target.value);
  }

  function showNotFoundfn() {
    return (
      <p>
        Nothing was found
      </p>
    )
  }

  function showRemovedfn() {
    return (
      <p>
        {addressBar} was removed from your list
      </p>
    )
  }


  function showApproveBlockedfn() {
    return (
      <div>
        <p>
          Approved blocked added {addressBar}
        </p>
        <Button onClick={handleRemoveButtonEvent}> Remove from blocked</Button>
      </div>
    )
  }

  function showApproveSafefn() {
    return (
      <div>
        <p>
          Approved Safe added {addressBar}
        </p>
        <Button onClick={handleRemoveButtonEvent}> Remove from SafeList</Button>
      </div>
    )
  }


  function showErrorAddfn() {
    return (
      <p>
        Got an error in adding {addressBar}
      </p>
    )
  }

  function showBlockedStateServer() {
    return (
      <div className='BlockedPage'>
        <p>
          {addressBar} address is bad
        </p>

        <Button onClick={handleRemoveButtonEvent}> Remove from BlockedList</Button>
      </div>
    )
  }

  function showBlockedStateLocal() {
    return (
      <div className='BlockedPage'>
        <p>
          {addressBar} address is bad
        </p>

        <Button onClick={handleRemoveButtonEvent}> Remove from BlockedList</Button>
      </div>
    )
  }

  function showSafeStateServer() {
    return (
      <div className='SafePage'>
        <p>
          {addressBar} address is safe
        </p>

        <Button onClick={handleRemoveButtonEvent}> Remove from SafeList</Button>
      </div>
    )
  }

  function showSafeStateLocal() {
    return (
      <div className='SafePage'>
        <p>
          {addressBar} address is safe
        </p>

        <Button onClick={handleRemoveButtonEvent}> Remove from SafeList</Button>
      </div>
    )
  }

  function showErrorType() {
    return (
      <div>
        <p>
          {addressBar} address is not valid address
        </p>
      </div>
    )
  }

  useEffect(() => {
    getGas()
    showPage()
  }, [addressBar, page]);



  useEffect(() => {
    if (page === 'removed' || page === 'notFound') {
      setPage('main')
    }
    getGas()
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      let tmpurl = tabs[0].url;
      let tmp = new URL(tmpurl);
      if (isURL(tmp.hostname.toLowerCase())) {
        setAddressBar(tmp.hostname.toLowerCase());
        checkAddress(tmp.hostname.toLowerCase(), false);
      }
    })
  }, []);


  function handleSubmit(event) {
    event.preventDefault();
    if (isURL(addressBar.toLowerCase())) {
      checkAddress(addressBar.toLowerCase(), true)
    } else {
      setPage('errorType')
    }
  }



  function checkAddress(address, submission) {
    chrome.runtime.sendMessage({ command: { type: 'checkAddress', value: address } }, response => {
      if (response === 'safeLocal') {
        setPage('safeLocal')
      } else if (response === 'safeServer') {
        setPage('safeServer')
      } else if (response === 'blockedLocal') {
        setPage('blockedLocal')
      } else if (response === 'blockedServer') {
        setPage('blockedServer')
      } else if (response === 'notFound' && submission == true) {
        setPage('notFound')
      }
    })
  };


  function showPage() {
    if (page === 'main') {

      return mainpage()

    } else if (page === 'addedSafe') {

      return showApproveSafefn()
    } else if (page === 'addedBlocked') {

      return showApproveBlockedfn()

    } else if (page === 'blockedLocal') {

      return showBlockedStateLocal()

    } else if (page === 'blockedServer') {

      return showBlockedStateServer()

    } else if (page === 'safeLocal') {

      return showSafeStateLocal()
    }
    else if (page === 'safeServer') {

      return showSafeStateServer()
    }
    else if (page === 'removed') {

      return showRemovedfn()

    } else if (page === 'notFound') {

      return showNotFoundfn()

    } else if (page === 'errorAdding') {

      return showErrorAddfn()

    } else if (page === 'errorType') {

      return showErrorType()

    } else {
      return (
        <div>
        </div>
      )
    }
  }



  const addToDatabase = (action, address) => {
    chrome.runtime.sendMessage({ command: { type: action, value: address } }, response => {
      if (response === 'existsSafe' || response === 'existsBlocked') {
        setPage('errorAdding')
      } else if (response === 'addedSafe') {
        setPage('addedSafe')
      } else if (response === 'addedBlocked') {
        setPage('addedBlocked')
      }
    })
  }


  const handleRemoveButtonEvent = () => {
    chrome.runtime.sendMessage({ command: { type: 'removeAddress', value: addressBar } }, response => {
      if (response === 'removedSafe' || response === 'removedBlocked') {
        setPage('removed')
        return true
      }
    })
  }

  function handleAddButtonEvent(command) {
    if (isURL(addressBar.toLowerCase())) {
      addToDatabase(command, addressBar.toLowerCase());
    } else {
      setPage('errorType')
    }
  };

  function mainpage() {
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
        <Button onClick={() => handleAddButtonEvent('addToSafeList')}> Add to Safe List</Button>
        <Button onClick={() => handleAddButtonEvent('addToBlockedList')}> Add to Block List</Button>
      </form>
    )
  }

  return (
    <div className='body'>
      <div className='header'>
        <text className='gaspricetitle'> ETH Mid Gas Price: </text>
        <br />
        <text className='gasprice'>  {gas.gwei} Gwei, ${gas.usd} USD </text>
      </div>
      <div className='mainPage'>
        {showPage()}
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
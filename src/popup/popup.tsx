import React, { Component, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import './popup.css'
import logo from "./logo.jpg";
import { Button } from "../components/Button";
import isURL from 'validator/lib/isURL';

const NameForm = () => {

  async function getGas() {
    let response = await fetch(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_apiKey}`);
    let responseJson = await response.json();
    let gasGwei = responseJson.result.SafeGasPrice
    response = await fetch(`https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_apiKey}`);
    responseJson = await response.json();
    let ethUsd = responseJson.result.ethusd
    let averagePrice = ethUsd * gasGwei / 1000000000 * 21000
    averagePrice = parseFloat(averagePrice.toFixed(2))
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
      <div className='confirmationPage'>
        <p>
          Nothing was found
        </p>
      </div>
    )
  }

  function showRemovedfn() {
    return (
      <div className='confirmationPage'>
        <p className='address'>
          {addressBar}
        </p>
        <p className='explanation'>
          was removed from your list
        </p>
      </div>
    )
  }


  function showApproveBlockedfn() {
    return (
      <div className='confirmationPage'>
        <p className='address'>
          {addressBar}
        </p>
        <p className='explanation'>
          Approved blocked added
        </p>
        <Button onClick={handleRemoveButtonEvent}> Remove from blocked</Button>
      </div>
    )
  }

  function showApproveSafefn() {
    return (
      <div className='confirmationPage'>
        <p className='address'>
          {addressBar}
        </p>
        <p className='explanation'>
          Approved Safe added
        </p>
        <Button onClick={handleRemoveButtonEvent}> Remove from SafeList</Button>
      </div>
    )
  }


  function showErrorAddfn() {
    return (
      <div className='confirmationPage'>

        <p className='address'>
          {addressBar}
        </p>
        <p className='explanation'>
          Got an error in adding
        </p>
      </div>
    )
  }

  function showBlockedStateServer() {
    return (
      <div className='confirmationPage'>
        <p className='address'>
          {addressBar}
        </p>
        <p className='explanation'>
          address is bad on server
        </p>
        <Button onClick={() => handleAddButtonEvent('addToSafeList')}> Add to Safe List</Button>
      </div>
    )
  }

  function showBlockedStateLocal() {
    return (
      <div className='confirmationPage'>
        <p className='address'>
          {addressBar}
        </p>
        <p className='explanation'>
          address is bad locally
        </p>
        <Button onClick={handleRemoveButtonEvent}> Remove from BlockedList</Button>
      </div>
    )
  }

  function showSafeStateServer() {
    return (
      <div className='confirmationPage'>
        <p className='address'>
          {addressBar}
        </p>
        <p className='explanation'>
          address is safe on server
        </p>

        <Button onClick={() => handleAddButtonEvent('addToBlockedList')}> Add to Block List</Button>
      </div>
    )
  }

  function showSafeStateLocal() {
    return (
      <div className='confirmationPage'>
        <p className='address'>
          {addressBar}
        </p>
        <p className='explanation'>
          address is safe locally
        </p>
        <Button onClick={handleRemoveButtonEvent}> Remove from SafeList</Button>
      </div>
    )
  }

  function showErrorType() {
    return (
      <div className='confirmationPage'>
        <p className='address'>
          {addressBar}
        </p>
        <p className='explanation'>
          address is not valid address
        </p>
      </div>
    )
  }

  useEffect(() => {
    showPage()
  }, [addressBar, page, gas]);



  useEffect(() => {

    if (page === 'removed' || page === 'notFound') {
      setPage('main')
    }
    getGas()
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      let tmpurl = tabs[0].url;
      if (isURL(tmpurl)) {
        let tmp = new URL(tmpurl);
        setAddressBar(tmp.hostname.toLowerCase());
        checkAddress(tmp.hostname.toLowerCase(), false);
      }
    })
  }, []);


  function handleSubmit(event) {
    event.preventDefault();
    if (isURL(addressBar)) {
      checkAddress(addressBar.toLowerCase(), true)
    } else {
      setPage('errorType')
    }
  }



  function checkAddress(address, submission) {
    chrome.runtime.sendMessage({ command: { type: 'checkAddress', value: address } }, response => {
      console.log('backend,', response)
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
      <div>
         <form onSubmit={handleSubmit}>
         <div className="content">
           <input
             type="text"
             placeholder="Type an address and press enter..."
             value={addressBar}
             onChange={e => handleChange(e)}
           />
         </div>
         </form>
         <div className="content">
         <Button onClick={() => handleAddButtonEvent('addToSafeList')} color="primary"> Add to Safelist</Button>
         <Button onClick={() => handleAddButtonEvent('addToBlockedList')} color="secondary"> Add to Blocklist</Button>
         </div>
       </div>
    )
  }

  return (
    <div className='body'>
      <div className='header'>
        <text className='gaspricetitle'> ETH Mid Gas Price: </text>
        <br />
        <text className='gasprice'>  {gas.gwei} Gwei, ${gas.usd} USD </text>
      </div>
      <img className='logo' src={logo} />
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
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import './popup.css'
import lock from "./logo.jpg";
import lock_unsecure from "./unsecure.jpg";
import lock_secure from "./secure.jpg";
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
      <div className='content'>
        <div className='confirmationPage'>
          <h3 className='explanationNeutral'>Nothing was found</h3>
        </div>
      </div>
    )
  }

  function showRemovedfn() {
    return (
      <div className='content'>
        <div className='confirmationPage'>
          <h3 className='address'>{addressBar}</h3>
          <h3 className='explanationNeutral'>Was just removed</h3>
        </div>
      </div>
    )
  }

  function showApproveBlockedfn() {
    return (
      <div>
      <img className='lockmain' src={lock_unsecure}/>
      <div className='content'>
        <p className='report'>
          This domain is now blocked in your browser.
        </p>
      </div>
      <div className='content'>
        <Button onClick={handleRemoveButtonEvent}>Remove from Blocklist</Button>
      </div>
      </div>
    )
  }

  function showApproveSafefn() {
    return (
      <div>
      <img className='lockmain' src={lock_secure}/>
      <div className='content'>
        <p className='report'>
          This domain is now safelisted in your browser.
        </p>
      </div>
      <div className='content'>
        <Button onClick={handleRemoveButtonEvent}>Remove from Safelist</Button>
      </div>
      </div>
    )
  }


  function showErrorAddfn() {
    return (
      <div className='content'>
        <div className='confirmationPage'>
          <h3 className='address'>{addressBar}</h3>
          <h3 className='explanationRed'>Error while adding. Please try again.</h3>
        </div>
      </div>
    )
  }

  function showBlockedStateServer() {
    return (
      <div>
      <img className='lockmain' src={lock_unsecure}/>
      <div className='content'>
        <p className='report'>
          This domain has been blocked by <strong>HexaTorch</strong>.
        </p>
      </div>
      </div>
    )
  }

  function showBlockedStateLocal() {
    return (
      <div>
      <img className='lockmain' src={lock_unsecure}/>
      <div className='content'>
        <p className='report'>
          This domain has been blocked by <strong>you</strong>.
        </p>
      </div>
      <div className='content'>
        <Button onClick={handleRemoveButtonEvent}> Remove from Blocklist</Button>
      </div>
      </div>
    )
  }

  function showSafeStateServer() {
    return (
      <div>
      <img className='lockmain' src={lock_secure}/>
      <div className='content'>
        <p className='report'>
          This domain has been <strong> verified by HexaTorch</strong>.
        </p>
      </div>
      </div>
    )
  }

  function showSafeStateLocal() {
    return (
      <div>
      <img className='lockmain' src={lock_secure}/>
      <div className='content'>
        <p className='report'>
          This website has been safelisted by <strong>you</strong>.
        </p>
      </div>
      <div className='content'>
        <Button onClick={handleRemoveButtonEvent}>Remove from Safelist</Button>
      </div>
      </div>
    )
  }

  function showErrorType() {
    return (
      <div className='content'>
        <div className='confirmationPage'>
          <h3 className='address'>{addressBar}</h3>
          <h3 className='explanationRed'>Not valid address</h3>
        </div>
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

      return mainpage()

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
      <img className='lockmain' src={lock} />
        <form onSubmit={handleSubmit}>
          <div className="content">
            <input
              type="text"
              placeholder="Type an address to safelist or blocklist..."
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

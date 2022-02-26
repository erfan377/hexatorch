import React, { Component, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import './popup.css'
import logo from "./logo.jpg";
import Button from 'react-bootstrap/Button';



const NameForm = () => {
  const [addressBar, setAddressBar] = useState('');
  const [page, setPage] = useState('main');

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


  function showErrorfn() {
    return (
      <p>
        Got an error in adding {addressBar}
      </p>
    )
  }

  function showBlockedState() {
    return (
      <div className='BlockedPage'>
        <p>
          {addressBar} address is bad
        </p>

        <Button onClick={handleRemoveButtonEvent}> Remove from BlockedList</Button>
      </div>
    )
  }

  function showSafeState() {
    return (
      <div className='SafePage'>
        <p>
          {addressBar} address is safe
        </p>

        <Button onClick={handleRemoveButtonEvent}> Remove from SafeList</Button>
      </div>
    )
  }

  useEffect(() => {

    showPage()
  }, [addressBar, page]);



  useEffect(() => {
    if (page === 'removed' || page === 'notFound') {
      setPage('main')
    }

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      let tmpurl = tabs[0].url;
      let tmp = new URL(tmpurl);
      setAddressBar(tmp.hostname);
      checkAddress(tmp.hostname, false);
    })
  }, []);


  function handleSubmit(event) {
    event.preventDefault();
    checkAddress(addressBar, true)
  }



  function checkAddress(address, submission) {
    chrome.runtime.sendMessage({ command: { type: 'checkAddress', value: address } }, response => {
      if (response === 'safe') {
        setPage('safe')
      } else if (response === 'blocked') {
        setPage('blocked')
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

    } else if (page === 'blocked') {

      return showBlockedState()

    } else if (page === 'safe') {

      return showSafeState()

    } else if (page === 'removed') {

      return showRemovedfn()

    } else if (page === 'notFound') {

      return showNotFoundfn()

    } else if (page === 'errorAdding') {

      return showErrorfn()

    } else {
      return (
        <div>
        </div>
      )
    }
  }



  const addToDatabase = (action) => {
    chrome.runtime.sendMessage({ command: { type: action, value: addressBar } }, response => {
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
      console.log('response remove', response)
      if (response === 'removedSafe' || response === 'removedBlocked') {
        console.log('yesss removed', response)
        setPage('removed')
        return true
      }
    })
  }

  function handleAddButtonEvent(command) {
    addToDatabase(command);
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
        <text className='gasprice'>  73 Gwei, $3.84 USD </text>
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
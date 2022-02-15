import React, {Component, useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import  './popup.css'
import logo from "./logo.jpg";
import Button from 'react-bootstrap/Button';

// const Ps = {
//   background-color: 'black',
//   height: 1000,
//   width: 1000,
// }


const NameForm = () => {

  // constructor(props) {
  //   super(props);
  //   this.state = {value: ''};

  //   this.handleChange = this.handleChange.bind(this);
  //   this.handleSubmit = this.handleSubmit.bind(this);
  // }

  const [value, setValue] = useState('');
  const [addressBar, setAddressBar] = useState('');
  const [showApprove, setShowApprove] = useState(false);
  const [showMainPage, setShowMainPage] = useState(true);
  const [showError, setShowError] = useState(false);
  const [showSafe, setShowSafe] = useState(false);
  const [showBad, setShowBad] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);

  function handleChange(event) {
    // this.setState({value: event.target.value});
    // alert(event.target.value);
    // setValue({value: event.target.value});
    setAddressBar(event.target.value);
  }

  function showNotFoundfn(){
    if (showNotFound){
      console.log('show approve fn inner', showApprove)
      return(
      <p>
        Nothing was found
      </p>)
    } else {
      console.log('falsseee')
      return(
      <div>
      </div>);
    }
  }

  function showApprovefn(){
    console.log('show approve man fn')

    if (showApprove){
      console.log('show approve fn inner', showApprove)
      return(
      <p>
        Approved added
      </p>)
    } else {
      console.log('falsseee')
      return(
      <div>
      </div>);
    }
  };



  function showErrorfn(){
    console.log('show error fn')

    if (showError){
      console.log('show approve fn')
      return(
      <p>
        Got an error in adding
      </p>)
    } else {
      return(
      <div>
      </div>);
    }
  };


  function showBadfn(){
    console.log('show bad fnnn')

    if (showBad){
      console.log('inner fn bad')
      return(
      <p>
        this address is bad
      </p>)
    } else {
      return(
      <div>
      </div>);
    }
  };

  function showSafefn(){
    console.log('inner safe fn')

    if (showSafe){
      console.log('ye ssafe sshow')
      return(
      <p>
        this address is bad
      </p>)
    } else {
      return(
      <div>
      </div>);
    }
  };


  useEffect(() => {
    console.log('updateddd')
  }, [showApprove, showMainPage, showError, showBad, showSafe, showNotFound]);


  useEffect(() => {
    fetchCurrentTab();
  }, []);


  //  //Todo handle blocklist
  //  function handleSubmit(event) {
  //   event.preventDefault();
  //   // This is for approve
  //   chrome.runtime.sendMessage({foo: {type: 'addToSafeList', value: value.value}}, response => {
  //     if (response === 'true'){
  //       setShowApprove(true);
  //       setShowMainPage(false);
  //       console.log('yayyy')
  //     } else {
  //       setShowError(true);
  //       setShowMainPage(false);
  //       console.log('oh no')
  //     }
  //   })
  // }


     //Todo handle blocklist
     function handleSubmit(event) {
      //  setValue(addressBar)
      event.preventDefault();
      checkAddress(addressBar);
    }



  function checkAddress(address) {
    console.log('checkaddress', address);
    chrome.runtime.sendMessage({foo: {type: 'checkAddress', value: address}}, response => {
      if (response === 'found good'){
        setShowSafe(true);
        setShowMainPage(false);
        console.log('yayyy')
      } else if(response === 'found bad'){
        setShowBad(true);
        setShowMainPage(false);
        console.log('oh no')
      } else {
        console.log('found nothing')
        setShowMainPage(false);
        setShowNotFound(true);
      }
    })
  }

  function fetchCurrentTab(){
    chrome.tabs.query({active: true,lastFocusedWindow: true}, async (tabs) =>{
      let tmpurl = await tabs[0].url;
      let tmp= new URL(tmpurl);
      setAddressBar(tmp.hostname);
    })
  }


  const handleButtonEventSafe = () => {
    console.log("sending info to background for whitelist check");
    chrome.runtime.sendMessage({url: addressBar, listtype:"approvedlist", function:"addURL"}), response => {
    }
    // Do something
    if (false) {
      setShowApprove(true);
      setShowMainPage(false);
    } else {
      setShowError(true);
      setShowMainPage(false);
    }
  };

  const handleButtonEventBlock = () => {
    console.log("sending info to background for blocklist check");
    chrome.runtime.sendMessage({url: addressBar, listtype:"blockedlist", function:"addURL"});
    // Do something
  };



  function mainpage() {
    if(showMainPage){
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
          <img className = 'logo' src = {logo}/>
          <Button onClick={handleButtonEventSafe}> Add to Safe List</Button>
          <Button onClick={handleButtonEventBlock}> Add to Block List</Button>
        </form>
      );
    
    } else {
      return(
      <div>
      </div>);
    }
  }
  
  return (
    <div className='body'>
        {/* {checkAddress()} */}
        {/* {showBadfn()}
        {showSafefn()} */}
        <div className='header'>
          <text className = 'gaspricetitle'> ETH Mid Gas Price: </text>
          <br />
          <text className = 'gasprice'>  73 Gwei, $3.84 USD </text>
        </div>
        <div className='mainPage'>
          {mainpage()}
        </div>
        <div id='nextPages'>
          {showApprovefn()}
          {showErrorfn()}
          {showNotFoundfn()}
        </div>
    </div>
  );

}

// class NameForm extends React.Component<{}, { value: string }> {

//   constructor(props) {
//     super(props);
//     this.state = {value: ''};

//     this.handleChange = this.handleChange.bind(this);
//     this.handleSubmit = this.handleSubmit.bind(this);
//   }

//   handleChange(event) {
//     this.setState({value: event.target.value});
//   }


//   //Todo handle blocklist
//   handleSubmit(event) {

//     // This is for approve
//     chrome.runtime.sendMessage({foo: {type: 'addToSafeList', value: this.state.value}}, response => {
//       if (response === 'true'){
//         // TODO: Show new page
//         console.log('yayyy')
//       } else {
//         // TODO:Show it existed
//         console.log('oh no')
//       }
//     });
//     event.preventDefault();
//   }

//   render() {
//     return (
//       <div className='body'>
//         <div className='header'>
//           <text className = 'gaspricetitle'> ETH Mid Gas Price: </text>
//           <br />
//           <text className = 'gasprice'>  73 Gwei, $3.84 USD </text>
//         </div>
//         <div id='main page'>
//           <form onSubmit={this.handleSubmit}>
//             <label>
//               <input
//                 type="text"
//                 placeholder="Type an address and press enter..."
//                 value={this.state.value}
//                 onChange={this.handleChange}
//                 style={{
//                   padding: "10px 20px",
//                   width: "300px",
//                   textAlign: "left",
//                   // align: "center",
//                   border: "0px",
//                   marginLeft: "25px",
//                   backgroundColor: '#EDE7E7',
//                   borderRadius: '10px',
//                 }}
//               />
//             </label>
//             <img className = 'logo' src = {logo}/>
//             <Button variant="primary" type="submit"> Safe List</Button>
//           </form>
//         </div>
//     </div>
//     );
//   }
// }

// function sendForm(){
//   //check for validity of link
// }


const App: React.FC<{}> = () => {
  return (
      <NameForm/>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
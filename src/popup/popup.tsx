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
  const [submission, setSubmission] = useState(false);

  function handleChange(event) {
    // this.setState({value: event.target.value});
    // alert(event.target.value);
    // setValue({value: event.target.value});
    event.preventDefault();
    setAddressBar(event.target.value);
  }

  function showNotFoundfn(){
    if (showNotFound){
      return(
      <p>
        Nothing was found
      </p>)
    } else {
      return(
      <div>
      </div>);
    }
  }

  function showApprovefn(){
    if (showApprove){
      return(
      <p>
        Approved added
      </p>)
    } else {
      return(
      <div>
      </div>);
    }
  };



  function showErrorfn(){

    if (showError){
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

    if (showBad){
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

    if (showSafe){
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
  }, [showApprove, showMainPage, showError, showBad, showSafe, showNotFound, addressBar]);


  useEffect(() => {
    console.log('run on opening tabs');
    // fetchCurrentTab().then((url) => console.log('addressssssss', url));
    // console.log('addressssssss', url);
    setSubmission(false);
    chrome.tabs.query({active: true,lastFocusedWindow: true}, (tabs) =>{
      let tmpurl = tabs[0].url;
      let tmp = new URL(tmpurl);
      console.log('fetchh url', tmp.hostname)
      setAddressBar(tmp.hostname);
      checkAddress(tmp.hostname);
      return tmp.hostname;
    })
    console.log('should come after');
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
      setSubmission(true);
      event.preventDefault();
      checkAddress(addressBar);
    }



  function checkAddress(address) {
    console.log('pop: checkaddress', address);
    // chrome.runtime.sendMessage({foo: {type: 'addToSafeList', value: address}}, response => {
    //   if (response === 'found good'){
    //     setShowSafe(true);
    //     setShowMainPage(false);
    //     console.log('yayyy')
    //   } else if(response === 'found bad'){
    //     setShowBad(true);
    //     setShowMainPage(false);
    //     console.log('oh no')
    //   } else {
    //     console.log('found nothing')
    //     setShowMainPage(false);
    //     setShowNotFound(true);
    //   }
    // })

    chrome.runtime.sendMessage({command: {type: 'checkAddress', value: address}}, response => {
      if (response === 'safe'){
        setShowSafe(true);
        setShowMainPage(false);
        console.log('pop: checking address safe')
      } else if(response === 'blocked'){
        setShowBad(true);
        setShowMainPage(false);
        console.log('pop: checking address blocked')

      } else if(submission){
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
    // chrome.runtime.sendMessage({foo: {type: 'checkAddress', value: addressBar}}, response => {
    //   // Do something
    //   console.log('inside fn')
    //   if (response) {
    //     console.log('trueeee')
    //     setShowApprove(true);
    //     setShowMainPage(false);
    //   } else {
    //     setShowError(true);
    //     setShowMainPage(false);
    //   }
    // })

    chrome.runtime.sendMessage({command: {type: 'addToSafeList', value: addressBar}}, response => {
      console.log('response safe', response)
      if (response === 'existsSafe' || response === 'existsBlocked'){
        setShowError(true);
        setShowMainPage(false);
        console.log('pop: address exists')
      } else if(response === 'addedSafe' || response === 'addedBlocked'){
        setShowApprove(true);
        setShowMainPage(false);
        console.log('pop: address added to safe')
      }
    })
  };

  const handleButtonEventBlock = () => {
    console.log("sending info to background for blocklist check");
    chrome.runtime.sendMessage({command: {type: 'addToBLockedList', value: addressBar}}, response => {
      console.log('response block', response)
      if (response === 'existsSafe' || response === 'existsBlocked'){
        setShowError(true);
        setShowMainPage(false);
        console.log('pop: address exists blocked')
      } else if(response === 'addedSafe' || response === 'addedBLocked'){
        setShowApprove(true);
        setShowMainPage(false);
        console.log('pop: address added to blocked')
      }
    })
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
          {showBadfn()}
          {showSafefn()}
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
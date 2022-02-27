import React, {useContext, useEffect} from 'react';
import {ExtensionContext} from "../context";

const AdressBar = () => {
    const {
        addressBar, setAddressBar, setSubmission, setShowSafe, setShowMainPage, setShowBad
    } = useContext(ExtensionContext);

    const handleChange = (event) => {
        event.preventDefault();
        setAddressBar(event.target.value);
    }

    const checkAddress = (address) => {
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

    useEffect(() => {
        console.log('run on opening tabs');
        // fetchCurrentTab().then((url) => console.log('addressssssss', url));
        // console.log('addressssssss', url);
        setSubmission(false);

        let tmpurl = location.href;
        let tmp = new URL(tmpurl);
        console.log('fetchh url', tmp.hostname)
        setAddressBar(tmp.hostname);
        checkAddress(tmp.hostname);

        console.log('should come after');
    }, []);

    return (
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
    );
};

export default AdressBar;
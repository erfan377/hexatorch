import React, {useState, useEffect} from 'react';
import {ExtensionContext} from "./index";

const ExtensionState = (props) => {
    const [showSafe, setShowSafe] = useState(false);
    const [showBad, setShowBad] = useState(false);
    const [showNotFound, setShowNotFound] = useState(false);
    const [showErrorBlocked, setShowErrorBlocked] = useState(false);
    const [showErrorSafe, setShowErrorSafe] = useState(false);
    const [showApproveSafe, setShowApproveSafe] = useState(false);
    const [showApproveBlocked, setShowApproveBlocked] = useState(false);
    const [submission, setSubmission] = useState(false);
    const [addressBar, setAddressBar] = useState('');
    const [showMainPage, setShowMainPage] = useState(true);
    const [extensionExpanded, setExtensionExpanded] = useState(false);
    const [extensionWasDragged, setExtensionWasDragged] = useState(false);


    return (
        <ExtensionContext.Provider value={{
            showSafe, setShowSafe,
            showBad, setShowBad,
            showNotFound, setShowNotFound,
            showErrorBlocked, setShowErrorBlocked,
            showErrorSafe, setShowErrorSafe,
            showApproveSafe, setShowApproveSafe,
            showApproveBlocked, setShowApproveBlocked,
            submission, setSubmission,
            addressBar, setAddressBar,
            showMainPage, setShowMainPage,
            extensionExpanded, setExtensionExpanded,
            extensionWasDragged, setExtensionWasDragged,
        }}>
            {props.children}
        </ExtensionContext.Provider>
    );
};

export default ExtensionState;
import React, {useContext} from 'react';
import Button from "react-bootstrap/Button";
import {ExtensionContext} from "../context";

export const ADD_TO_SAFE_LIST = 'addToSafeList';
export const ADD_TO_BLOCKED_LIST = 'addToBlockedList';

const AddToListButton = ({action ,children}) => {

    const {
        addressBar,setShowMainPage,
        setShowErrorSafe, setShowErrorBlocked, setShowApproveSafe, setShowApproveBlocked
    } = useContext(ExtensionContext);

    const addToDatabase = (action) => {
        chrome.runtime.sendMessage({ command: { type: action, value: addressBar } }, response => {
            console.log('response added', response)
            if (response === 'existsSafe') {
                setShowErrorSafe(true);
                setShowMainPage(false);
                console.log('pop: address exists')
            } else if (response === 'existsBlocked') {
                setShowErrorBlocked(true);
                setShowMainPage(false);
            } else if (response === 'addedSafe') {
                setShowApproveSafe(true);
                setShowMainPage(false);
            } else if (response === 'addedBlocked') {
                setShowApproveBlocked(true);
                setShowMainPage(false);
            }
        })
    }

    const onClick = () => {
        addToDatabase(action);
    };

    return (
        <Button onClick={onClick}>{children}</Button>
    );
};

export default AddToListButton;
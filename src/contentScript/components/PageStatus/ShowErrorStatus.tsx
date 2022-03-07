import React, {useContext, useState} from 'react';
import {ExtensionContext} from "../../context";

const ShowErrorStatus = () => {
    const {showErrorBlocked, showErrorSafe} = useContext(ExtensionContext);

    if (showErrorSafe) {
        return (
            <p>
                Got an error in adding, exists in safe list
            </p>)
    } else if (showErrorBlocked) {
        return (
            <p>
                Got an error in adding, exists in blocked list
            </p>)
    } else {
        return (
            <div>
            </div>);
    }
};

export default ShowErrorStatus;
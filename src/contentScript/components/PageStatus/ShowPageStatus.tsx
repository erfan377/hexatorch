import React, {useState, useContext} from 'react';
import {ExtensionContext} from "../../context";

const ShowPageStatus = () => {
    const {showSafe, showBad} = useContext(ExtensionContext);

    if (showSafe) {
        return (
            <p>
                this address is safe
            </p>)
    } else if (showBad) {
        return (
            <p>
                this address is bad
            </p>)
    } else {
        return (
            <div>
            </div>);
    }
};

export default ShowPageStatus;
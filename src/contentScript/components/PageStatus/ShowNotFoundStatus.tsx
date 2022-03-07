import React, {useContext, useState} from 'react';
import {ExtensionContext} from "../../context";

const ShowNotFoundStatus = () => {
    const {showNotFound} = useContext(ExtensionContext);

    if (showNotFound) {
        return (
            <p>
                Nothing was found
            </p>)
    } else {
        return (
            <div>
            </div>);
    }
};

export default ShowNotFoundStatus;
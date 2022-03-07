import React from 'react';

const PopupCss = () => {
    const cssFile = chrome.runtime.getURL('contentScript.bundle.css');

    return (
        <link type="text/css" rel="stylesheet" href={cssFile}/>
    );
};

export default PopupCss;
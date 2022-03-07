import React, {useCallback, useContext} from 'react';
import {ExtensionContext} from "../context";

const ApprovedButton = () => {
    const {
        setExtensionExpanded, extensionWasDragged
    } = useContext(ExtensionContext);

    const onClick = useCallback(() => {
        if(extensionWasDragged === false) {
            setExtensionExpanded(true);
        }
    }, [setExtensionExpanded, extensionWasDragged]);

    return (
        <div className="img approved" onClick={onClick} />
    );
};

export default ApprovedButton;
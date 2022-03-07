import React, {useCallback, useContext} from 'react';
import {ExtensionContext} from "../context";

const BlockedButton = () => {

    const {
        setExtensionExpanded, extensionWasDragged
    } = useContext(ExtensionContext);

    const onClick = useCallback(() => {
        if(extensionWasDragged === false) {
            setExtensionExpanded(true);
        }
    }, [setExtensionExpanded, extensionWasDragged]);

    return (
        <div className="img blocked" onClick={onClick} />
    );
};

export default BlockedButton;
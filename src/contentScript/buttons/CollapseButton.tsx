import React, {useCallback, useContext} from 'react';
import {ExtensionContext} from "../context";

const CollapseButton = () => {
    const {
        setExtensionExpanded, extensionWasDragged
    } = useContext(ExtensionContext);

    const onClick = useCallback(() => {
        if(extensionWasDragged === false) {
            setExtensionExpanded(false)
        }
    }, [setExtensionExpanded, extensionWasDragged]);
    return (
        <div className="img collapse" onClick={onClick} />
    );
};

export default CollapseButton;
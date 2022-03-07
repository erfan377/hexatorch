import React, {useCallback, useContext} from 'react';
import {ExtensionContext} from "../context";

const UnknownButton = () => {
    const {
        setExtensionExpanded, extensionWasDragged
    } = useContext(ExtensionContext);

    const onClick = useCallback(() => {
        if(extensionWasDragged === false) {
            setExtensionExpanded(true);
        }
    }, [setExtensionExpanded, extensionWasDragged]);

    return (
        <div className="img unknown" onClick={onClick} />
    );
};

export default UnknownButton;
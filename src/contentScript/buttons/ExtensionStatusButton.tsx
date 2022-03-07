import React, {useContext} from 'react';
import {ExtensionContext} from "../context";
import CollapseButton from "./CollapseButton";
import CurrentStatusButton from "./CurrentStatusButton";

const ExtensionStatusButton = () => {
    const {
        extensionExpanded
    } = useContext(ExtensionContext);

    return (
        <div>
            {extensionExpanded === false && <CurrentStatusButton />}
            {extensionExpanded === true && <CollapseButton />}
        </div>
    );
};

export default ExtensionStatusButton;
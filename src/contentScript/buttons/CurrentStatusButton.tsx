import React, {useContext, useMemo} from 'react';
import {ExtensionContext} from "../context";
import BlockedButton from "./BlockedButton";
import ApprovedButton from "./ApprovedButton";
import UnknownButton from "./UnknownButton";

const CurrentStatusButton = () => {
    const {
        showApproveSafe, showApproveBlocked, showSafe, showBad
    } = useContext(ExtensionContext);

    const unknownStatus = useMemo(() => {
        if(showBad) return false;
        if(showSafe) return false;
        return true;
    }, [showSafe, showBad]);

    return (
        <div className="collapsed-status-button" style={{display: "none"}}>
            {showBad === true && <BlockedButton />}
            {showSafe === true && <ApprovedButton />}
            {unknownStatus === true && <UnknownButton />}
        </div>
    );
};

export default CurrentStatusButton;
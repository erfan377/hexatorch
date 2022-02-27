import React, {useContext, useState} from 'react';
import {ExtensionContext} from "../../context";

const ShowApprovedStatus = () => {
    const {showApproveSafe, showApproveBlocked} = useContext(ExtensionContext);

    if (showApproveSafe) {
        return (
            <p>
                Approved Safe added
            </p>)
    } else if (showApproveBlocked) {
        return (
            <p>
                Approved Blocked added
            </p>)
    } else {
        return (
            <div>
            </div>);
    }
};

export default ShowApprovedStatus;
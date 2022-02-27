import React from 'react';
import ShowApprovedStatus from "./PageStatus/ShowApprovedStatus";
import ShowErrorStatus from "./PageStatus/ShowErrorStatus";
import ShowNotFoundStatus from "./PageStatus/ShowNotFoundStatus";
import ShowPageStatus from "./PageStatus/ShowPageStatus";

const PageStatus = () => {

    return (
        <div id='nextPages'>
            <ShowApprovedStatus />
            <ShowErrorStatus />
            <ShowNotFoundStatus />
            <ShowPageStatus />
        </div>
    );
};

export default PageStatus;
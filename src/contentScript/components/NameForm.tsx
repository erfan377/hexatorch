import React, {useContext, useEffect, useState} from 'react';
import FormHeader from "./FormHeader";
import PageStatus from "./PageStatus";
import MainPage from "./MainPage";
import {ExtensionContext} from "../context";

const NameForm = () => {
    const {showMainPage} = useContext(ExtensionContext);

    return (
        <div className='body'>
            <FormHeader />
            <div className='mainPage'>
                {(showMainPage) ? <MainPage /> : ''}
            </div>
            <PageStatus />
        </div>
    );
};

export default NameForm;
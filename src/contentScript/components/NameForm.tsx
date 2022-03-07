import React, {useCallback, useContext, useEffect, useState} from 'react';
import FormHeader from "./FormHeader";
import PageStatus from "./PageStatus";
import MainPage from "./MainPage";
import Draggable from 'react-draggable';
import {ExtensionContext} from "../context";
import ExtensionStatusButton from "../buttons/ExtensionStatusButton";

const NameForm = () => {
    const {showMainPage, extensionExpanded, extensionWasDragged, setExtensionWasDragged,} = useContext(ExtensionContext);

    const onDrag = useCallback(() => {
        setExtensionWasDragged(true);
    }, [setExtensionWasDragged]);
    const onStop = useCallback(() => {
        setTimeout(() => {
            setExtensionWasDragged(false);
        }, 5);
    }, [setExtensionWasDragged]);


    return (
        <Draggable onDrag={onDrag} onStop={onStop}>
            <div className={(extensionExpanded) ? 'expanded' : 'minimized'}>
                <div className="body">
                    <ExtensionStatusButton />
                    <div className="body-wrapper" style={{display: "none"}}>
                        <FormHeader />
                        <div className='mainPage'>
                            {(showMainPage) ? <MainPage /> : ''}
                        </div>
                        <PageStatus />
                    </div>
                </div>
            </div>
        </Draggable>
    );
};

export default NameForm;
import React, {useContext, useEffect, useState} from 'react';
import ExtLogo from "./ExtLogo";
import AdressBar from "./AdressBar";
import AddToListButton, {ADD_TO_BLOCKED_LIST, ADD_TO_SAFE_LIST} from "../buttons/AddToListButton";

const MainPage = () => {
    //Todo handle blocklist
    function handleSubmit(event) {
        event.preventDefault();
    }

    return (
        <form onSubmit={handleSubmit}>
            <AdressBar />
            <ExtLogo />

            <AddToListButton action={ADD_TO_SAFE_LIST}>Add to Safe List</AddToListButton>
            <AddToListButton action={ADD_TO_BLOCKED_LIST}>Add to Block List</AddToListButton>
        </form>
    );
};

export default MainPage;
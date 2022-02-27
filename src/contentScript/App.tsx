import React from "react";
import NameForm from "./components/NameForm";
import ExtensionState from "./context/ExtensionState";
import PopupCss from "./css/PopupCss";

const App = () => {
    return (
        <ExtensionState>
            <PopupCss />
            <NameForm />
        </ExtensionState>
    );
};

export default App;
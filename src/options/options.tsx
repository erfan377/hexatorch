import React from "react";
import ReactDOM from "react-dom";
import logo from "./logo.jpg";
import "./options.css";

const App: React.FC<{}> = () => {
  const [isCheckedSafe, setIsCheckedSafe] = React.useState(false);
  const [isCheckedBlock, setIsCheckedBlock] = React.useState(true);

  const handleOnChangeSafe = () => {
    setIsCheckedSafe(!isCheckedSafe);
  };

  const handleOnChangeBlock = () => {
    setIsCheckedBlock(!isCheckedBlock);
  };

  React.useEffect(() => {
    chrome.runtime.sendMessage({
      command: {
        type: "setNotification",
        value: {
          safe: isCheckedSafe,
          block: isCheckedBlock,
        },
      },
    });
  }, [isCheckedSafe, isCheckedBlock]);

  return (
    <div className="App">
      <img className="logo" src={logo} />
      <h3> Show notifications for</h3>
      <div className="container">
        <div className="options">
          <input
            type="checkbox"
            id="topping"
            name="topping"
            value="Paneer"
            checked={isCheckedBlock}
            onChange={handleOnChangeBlock}
          />
          Malicious
        </div>
        <div className="options">
          <input
            type="checkbox"
            id="topping"
            name="topping"
            value="Paneer"
            checked={isCheckedSafe}
            onChange={handleOnChangeSafe}
          />
          Safe
        </div>
      </div>
    </div>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);

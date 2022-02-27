import './css/popup.css'
import React, { Component, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import App from "./App";

const root = document.createElement('div')
root.style.position = "fixed";
root.style.right = "10px";
root.style.top = "10px";
root.style.width = "430px";
root.style.zIndex = "100000";
root.style.padding = "15px";
root.style.borderRadius = "5px";
root.style.boxSizing = "border-box";
root.style.background = "#fff";
root.style.border = "1px #000 solid";
document.body.appendChild(root)
root.attachShadow({ mode: 'open' })

ReactDOM.render(<App />, root.shadowRoot)
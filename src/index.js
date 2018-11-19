import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

let el = document.getElementById('thumbGenerator');
let nonce = el.getAttribute("data-nonce");
let shareImgURL = el.getAttribute("data-shareImgURL");
let shareImgSet = el.getAttribute("data-shareImgSet") === '1';
ReactDOM.render(<App nonce={nonce} shareImgURL={shareImgURL} shareImgSet={shareImgSet}/>, el);

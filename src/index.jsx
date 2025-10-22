
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";       // ✅ Main app component
import "../styles.css";             // ✅ Optional global styles

// Get the <div id="root"> element from index.html
const rootElement = document.getElementById("root");

// Create the React root and render your app
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

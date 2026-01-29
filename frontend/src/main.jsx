// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client"; // modern React 18+ API
import App from "./App.jsx"; // make sure the filename matches exactly, case-sensitive
import { PostsProvider } from "./Context/PostsContext";
import "./index.css"; // ensure this exists

// Find the root element
const container = document.getElementById("root");

// Create root and render the app
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <PostsProvider>
      <App />
    </PostsProvider>
  </React.StrictMode>
);

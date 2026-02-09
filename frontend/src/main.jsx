// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PostsProvider } from "./Context/PostsContext";
import { AuthProvider } from "./Context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <PostsProvider>
        <App />
      </PostsProvider>
    </AuthProvider>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PostsProvider } from "./Context/PostsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <PostsProvider>
    <App />
  </PostsProvider>
);

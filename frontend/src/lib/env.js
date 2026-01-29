// frontend/src/lib/env.js

// Detect if running locally
const IS_LOCALHOST = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Base API URL
export const API_URL = (
  import.meta.env.VITE_API_URL || (IS_LOCALHOST ? "http://localhost:4000" : "")
).replace(/\/$/, "");

// Backend authentication toggle
export const USE_BACKEND_AUTH = (() => {
  const env = String(import.meta.env.VITE_USE_BACKEND_AUTH || "").toLowerCase();
  if (env === "true") return true;
  if (env === "false") return false;
  return IS_LOCALHOST; // default to true on localhost, false in production
})();

// Use backend for posts
export const USE_POSTS_BACKEND = (() => {
  const env = String(import.meta.env.VITE_USE_POSTS_BACKEND || "").toLowerCase();
  if (env === "true") return true;
  if (env === "false") return false;
  return IS_LOCALHOST; // default to true on localhost, false in production
})();

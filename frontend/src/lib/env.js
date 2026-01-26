export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export const USE_BACKEND_AUTH =
  String(import.meta.env.VITE_USE_BACKEND_AUTH || "false") === "true";

export const USE_POSTS_BACKEND =
  String(import.meta.env.VITE_USE_POSTS_BACKEND || "false") === "true";

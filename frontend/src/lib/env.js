// src/lib/env.js

/* ---------------- Base API ---------------- */

export const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "http://localhost:4000/api";

/* ---------------- Feature Flags ---------------- */

export const USE_POSTS_BACKEND =
  String(import.meta.env.VITE_USE_POSTS_BACKEND).toLowerCase() === "true";

export const USE_BACKEND_AUTH =
  String(import.meta.env.VITE_USE_BACKEND_AUTH).toLowerCase() === "true";

/* ---------------- Environment Helpers ---------------- */

export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;

/* ---------------- Debug Logger ---------------- */

export function debugEnv() {
  if (!IS_DEV) return;

  console.group("🌍 ENV CONFIG");
  console.log("API_URL:", API_URL);
  console.log("USE_POSTS_BACKEND:", USE_POSTS_BACKEND);
  console.log("USE_BACKEND_AUTH:", USE_BACKEND_AUTH);
  console.log("MODE:", import.meta.env.MODE);
  console.groupEnd();
}

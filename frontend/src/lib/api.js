// src/lib/api.js

import { API_URL, USE_BACKEND_AUTH } from "./env";
import { authHelpers } from "./authApi";

/* =========================================================
   BASE FETCH WRAPPER
========================================================= */

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";

  let data = null;

  try {
    data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();
  } catch {}

  /* ---- Auto logout on 401 ---- */
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  if (!res.ok) {
    const msg =
      (typeof data === "object" && (data?.message || data?.error)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;

    throw new Error(msg);
  }

  return data;
}

/* =========================================================
   CORE FETCH FUNCTION
========================================================= */

export async function apiFetch(endpoint, options = {}) {
  const token = authHelpers?.getToken?.();

  const headers = {
    ...(options.headers || {}),
    ...(USE_BACKEND_AUTH && token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };

  /* ---- Add JSON header if body present ---- */
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse(res);
}

/* =========================================================
   HTTP HELPERS (Optional but Nice)
========================================================= */

export const api = {
  get: (url) =>
    apiFetch(url, { method: "GET" }),

  post: (url, body) =>
    apiFetch(url, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: (url, body) =>
    apiFetch(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  put: (url, body) =>
    apiFetch(url, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (url) =>
    apiFetch(url, { method: "DELETE" }),
};

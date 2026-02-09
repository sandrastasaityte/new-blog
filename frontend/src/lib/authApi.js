// src/lib/authApi.js
import { API_URL, USE_BACKEND_AUTH } from "./env.js";

/* =========================================================
   STORAGE HELPERS
========================================================= */

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAuth(token, user) {
  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/* =========================================================
   HEADERS
========================================================= */

function authHeaders({ json = true, token } = {}) {
  const t = token ?? getToken();

  return {
    ...(json && { "Content-Type": "application/json" }),
    ...(t && { Authorization: `Bearer ${t}` }),
  };
}

/* =========================================================
   RESPONSE HANDLER
========================================================= */

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  try {
    data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();
  } catch {}

  if (res.status === 401) {
    clearAuth();
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;

    throw new Error(msg);
  }

  return data;
}

/* =========================================================
   REGISTER
========================================================= */

export async function register(payload) {
  if (!payload?.email || !payload?.password) {
    throw new Error("Email and password required");
  }

  /* ---------- DEV MODE ---------- */
  if (!USE_BACKEND_AUTH) {
    const token = "dev-token";

    const user = {
      name: payload.name,
      email: payload.email,
    };

    saveAuth(token, user);

    return { token, user };
  }

  /* ---------- BACKEND ---------- */
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);

  const token =
    data?.token ||
    data?.accessToken ||
    data?.jwt ||
    data?.data?.token;

  const user =
    data?.user ||
    data?.data?.user ||
    null;

  saveAuth(token, user);

  return { token, user, raw: data };
}

/* =========================================================
   LOGIN
========================================================= */

export async function login(email, password) {

  if (!email || !password) {
    throw new Error("Email and password required");
  }

  /* ---------- DEV MODE ---------- */
  if (!USE_BACKEND_AUTH) {
    const token = "dev-token";
    const user = { email };

    saveAuth(token, user);

    return { token, user };
  }

  /* ---------- BACKEND ---------- */
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(res);

  const token =
    data?.token ||
    data?.accessToken ||
    data?.jwt ||
    data?.data?.token;

  const user =
    data?.user ||
    data?.data?.user ||
    null;

  saveAuth(token, user);

  return { token, user, raw: data };
}

/* =========================================================
   LOGOUT
========================================================= */

export function logout() {
  clearAuth();
}

/* =========================================================
   CURRENT USER
========================================================= */

export async function getMe() {

  if (!USE_BACKEND_AUTH) {
    return getUser();
  }

  try {
    const res = await fetch(
      `${API_URL}/auth/me`,
      { headers: authHeaders({ json: false }) }
    );

    const data = await handleResponse(res);

    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data?.user || null;

  } catch {
    return getUser();
  }
}

/* =========================================================
   EXPORT HELPERS
========================================================= */

export const authHelpers = {
  getToken,
  getUser,
  clearAuth,
};

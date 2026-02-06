// src/lib/authApi.js
import { API_URL, USE_BACKEND_AUTH } from "./env.js";

// ------------------ Local Storage Helpers ----------------
function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const raw = localStorage.getItem("user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function authHeaders({ json = true, token } = {}) {
  const t = token ?? getToken();
  return {
    ...(json && { "Content-Type": "application/json" }),
    ...(t && { Authorization: `Bearer ${t}` }),
  };
}

// ------------------ Response Handler ----------------
async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  try {
    data = contentType.includes("application/json") ? await res.json() : await res.text();
  } catch {}

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

// ------------------ AUTH FUNCTIONS ----------------
export const register = async (identifier, password) => {
  if (!USE_BACKEND_AUTH) {
    console.warn("Backend auth disabled - register skipped");
    const token = "dev-token";
    const user = { email: identifier };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return { token, user, raw: { message: "Mock register successful" } };
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: authHeaders({ json: true }),
      body: JSON.stringify({ identifier, password }),
    });
    const data = await handleResponse(res);

    const token = data?.token || data?.accessToken || data?.jwt || data?.data?.token;
    const user = data?.user || data?.data?.user || null;

    if (token) localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));

    return { token, user, raw: data };
  } catch (err) {
    console.error("register error:", err);
    throw err;
  }
};

export const login = async (identifier, password) => {
  if (!USE_BACKEND_AUTH) {
    console.warn("Backend auth disabled - login skipped");
    const token = "dev-token";
    const user = { email: identifier };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return { token, user, raw: { message: "Mock login successful" } };
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: authHeaders({ json: true }),
      body: JSON.stringify({ identifier, password }),
    });
    const data = await handleResponse(res);

    const token = data?.token || data?.accessToken || data?.jwt || data?.data?.token;
    const user = data?.user || data?.data?.user || null;

    if (token) localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));

    return { token, user, raw: data };
  } catch (err) {
    console.error("login error:", err);
    throw err;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ------------------ USER ----------------
export const getMe = async () => {
  if (!USE_BACKEND_AUTH) {
    return getUser(); // return locally stored user in dev mode
  }

  try {
    const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() });
    const data = await handleResponse(res);
    if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  } catch (err) {
    console.error("getMe error:", err);
    return getUser(); // fallback to local
  }
};

// ------------------ EXPORT HELPERS ----------------
export const authHelpers = { getToken, getUser };

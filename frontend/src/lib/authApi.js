// src/lib/authApi.js
const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = RAW_API_URL.replace(/\/$/, "");

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

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const hasJson = contentType.includes("application/json");

  let data = null;
  try {
    data = hasJson ? await res.json() : await res.text();
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

// ------------------ AUTH ------------------
export const register = async (identifier, password) => {
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
};

export const login = async (identifier, password) => {
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
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ------------------ USER ------------------
export const getMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders({ json: true }),
  });

  const data = await handleResponse(res);
  if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
};

// ------------------ HELPERS ------------------
export const authHelpers = {
  getToken,
  getUser,
};

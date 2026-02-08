import { API_URL } from "./env";

/* -------------------------------------------
   Constants
------------------------------------------- */

const TOKEN_KEY = "token";
const REQUEST_TIMEOUT = 15000;

/* -------------------------------------------
   Utilities
------------------------------------------- */

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function clearAuthStorage() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

/* -------------------------------------------
   Timeout Fetch Wrapper
------------------------------------------- */

async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    return res;
  } finally {
    clearTimeout(id);
  }
}

/* -------------------------------------------
   Base Request
------------------------------------------- */

async function request(path, options = {}) {

  const token = getToken();

  const res = await fetchWithTimeout(
    `${API_URL}/auth${path}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      ...options
    }
  );

  let data = null;

  try {
    data = await res.json();
  } catch {}

  /* ---------- Error Handling ---------- */

  if (!res.ok) {

    if (res.status === 401) {
      clearAuthStorage();
    }

    const error = new Error(data?.message || "Request failed");

    error.status = res.status;
    error.payload = data;

    throw error;
  }

  return data;
}

/* -------------------------------------------
   Auth Endpoints
------------------------------------------- */

export function login(credentials) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });
}

export function register(payload) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function me() {
  return request("/me");
}


// =============================
// blogs.js – Modern JS API SDK
// =============================

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = RAW_API_URL.replace(/\/$/, "");

// -----------------------------
// Token Utilities
// -----------------------------
export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export function logout() {
  setToken(null);
}

// -----------------------------
// Headers Helper
// -----------------------------
function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// -----------------------------
// Response Handler
// -----------------------------
async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let data = null;
  if (res.status !== 204) {
    try {
      data = isJson ? await res.json() : await res.text();
    } catch (err) {
      if (import.meta.env.DEV) console.warn("Failed to parse response", err);
    }
  }

  if (!res.ok) {
    let message =
      data?.message || data?.error || (typeof data === "string" ? data : "Request failed");

    if (res.status === 401) message = "Session expired. Please log in again.";
    if (res.status === 403) message = "Access denied.";
    if (res.status === 429) message = "Too many requests. Please slow down.";

    const err = new Error(message);
    err.status = res.status;
    err.original = data;
    throw err;
  }

  return data;
}

// -----------------------------
// Token Refresh Queue
// -----------------------------
let refreshingToken = null;
const refreshQueue = [];

async function refreshToken() {
  if (refreshingToken) return new Promise((resolve) => refreshQueue.push(resolve));

  refreshingToken = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: getToken() }),
      });
      const data = await res.json();
      if (res.ok && data?.token) {
        setToken(data.token);
        return data.token;
      }
    } catch (err) {
      console.warn("Token refresh failed", err);
    }
    logout();
    return null;
  })();

  const token = await refreshingToken;
  refreshingToken = null;

  refreshQueue.forEach((resolve) => resolve(token));
  refreshQueue.length = 0;

  return token;
}

// -----------------------------
// Core Fetch
// -----------------------------
export async function apiFetch(path, options = {}) {
  let {
    token,
    retry = true,
    timeout = 15000,
    params,
    retries = 0,
    maxRetries = 1,
    ...fetchOptions
  } = options;

  if (path.startsWith("/auth/refresh")) retry = false;

  // Handle query params
  if (params) {
    const qs = new URLSearchParams(params).toString();
    path += path.includes("?") ? "&" + qs : "?" + qs;
  }

  const t = token ?? getToken();
  const hasBody = fetchOptions.body != null;
  const isJson = hasBody && typeof fetchOptions.body === "object" && !(fetchOptions.body instanceof FormData);
  const body = hasBody ? (isJson ? JSON.stringify(fetchOptions.body) : fetchOptions.body) : undefined;

  const headers = {
    ...authHeaders(t),
    ...(fetchOptions.headers || {}),
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    "X-Request-ID": crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
  };

  const controller = new AbortController();
  const signal = fetchOptions.signal ?? controller.signal;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  if (import.meta.env.DEV) console.debug("[API FETCH]", path, fetchOptions);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: fetchOptions.method || "GET",
      ...fetchOptions,
      headers,
      ...(body !== undefined ? { body } : {}),
      signal,
    });

    try {
      return await handleResponse(res);
    } catch (err) {
      // Token expired -> refresh
      if (err.status === 401 && retry) {
        const newToken = await refreshToken();
        if (newToken) {
          return apiFetch(path, { ...fetchOptions, token: newToken, retry: false, timeout });
        }
      }
      throw err;
    }
  } catch (err) {
    if (err.name === "AbortError")
      throw new Error(`Request to ${path} timed out after ${timeout / 1000}s`);
    if (typeof navigator !== "undefined" && !navigator.onLine) throw new Error("No internet connection.");

    // Optional network retry for transient errors
    if (retries < maxRetries) {
      return apiFetch(path, { ...options, retries: retries + 1 });
    }

    console.error("[API ERROR]", path, err);
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// -----------------------------
// BLOG API
// -----------------------------
export const getBlogs = (params) => apiFetch("/blogs", { params });
export const getBlogById = (id) => apiFetch(`/blogs/${id}`);
export const createBlog = (blog) => apiFetch("/blogs", { method: "POST", body: blog });
export const updateBlog = (id, blog) => apiFetch(`/blogs/${id}`, { method: "PUT", body: blog });
export const deleteBlog = (id) => apiFetch(`/blogs/${id}`, { method: "DELETE" });

// -----------------------------
// AUTH API
// -----------------------------
export const login = (credentials) => apiFetch("/auth/login", { method: "POST", body: credentials, retry: false });
export const register = (data) => apiFetch("/auth/register", { method: "POST", body: data, retry: false });
export const me = () => apiFetch("/auth/me");

// -----------------------------
// USERS API
// -----------------------------
export const getUsers = (params) => apiFetch("/users", { params });
export const getUserById = (id) => apiFetch(`/users/${id}`);
export const updateUser = (id, data) => apiFetch(`/users/${id}`, { method: "PUT", body: data });
export const deleteUser = (id) => apiFetch(`/users/${id}`, { method: "DELETE" });

// -----------------------------
// FILE UPLOAD
// -----------------------------
export const uploadFile = (formData) => apiFetch("/upload", { method: "POST", body: formData });

// -----------------------------
// HEALTH CHECK
// -----------------------------
export const healthCheck = () => apiFetch("/health");

// -----------------------------
// SDK META
// -----------------------------
export const API_META = {
  version: "1.2.0",
  timeout: 15000,
  env: import.meta.env.MODE,
};

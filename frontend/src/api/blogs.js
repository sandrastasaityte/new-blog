// frontend/src/api/blogs.js

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = RAW_API_URL.replace(/\/$/, ""); // remove trailing slash

// ===== Token utilities =====
export const getToken = () => localStorage.getItem("token");

export const logout = () => {
  localStorage.removeItem("token");
};

function authHeaders(token) {
  const t = token ?? getToken();
  return {
    ...(t && { Authorization: `Bearer ${t}` }),
  };
}

// ===== Handle API responses =====
async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const hasJson = contentType.includes("application/json");

  let data = null;

  if (res.status !== 204) {
    try {
      data = hasJson ? await res.json() : await res.text();
    } catch {
      data = null;
    }
  }

  if (res.status === 401) {
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      "Request failed";
    throw new Error(msg);
  }

  return data;
}

// ===== Refresh token =====
async function refreshToken() {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: getToken() }),
    });

    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      return data.token;
    }
  } catch (err) {
    console.warn("Token refresh failed", err);
  }

  logout();
  return null;
}

// ===== Generic API fetch with auto-refresh =====
export async function apiFetch(path, { token, retry = true, ...options } = {}) {
  const t = token ?? getToken();

  const headers = {
    ...authHeaders(t),
    ...(options.headers || {}),
  };

  const hasBody = options.body !== undefined && options.body !== null;
  const isJson = hasBody && typeof options.body === "object" && !(options.body instanceof FormData);

  if (isJson && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  options.signal = controller.signal;

  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    try {
      return await handleResponse(res);
    } catch (err) {
      if (err.message.includes("Session expired") && retry) {
        const newToken = await refreshToken();
        if (newToken) {
          return apiFetch(path, { ...options, token: newToken, retry: false });
        }
      }
      throw err;
    }
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Request to ${path} timed out after 15s`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ===== Blogs API =====
export const getBlogs = () => apiFetch("/blogs");

export const createBlog = (blog, token) =>
  apiFetch("/blogs", { method: "POST", body: blog, token });

export const updateBlog = (id, blog, token) =>
  apiFetch(`/blogs/${id}`, { method: "PUT", body: blog, token });

export const deleteBlog = (id, token) =>
  apiFetch(`/blogs/${id}`, { method: "DELETE", token });

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const getToken = () => localStorage.getItem("token");

export const logout = () => {
  localStorage.removeItem("token");
};

function authHeaders(token, json = true) {
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

  if (res.status !== 204) {
    try {
      data = hasJson ? await res.json() : await res.text();
    } catch {
      data = null;
    }
  }

  // ✅ Optional: auto logout on expired/invalid token
  if (res.status === 401) {
    logout();
    // if this is an admin app, you might prefer: window.location.href = "/login";
    // keep "/" if that's your public home
    window.location.href = "/";
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

async function apiFetch(path, { token, json = true, ...options } = {}) {
  // ✅ If body is FormData, never set JSON headers
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(token, json && !isFormData),
      ...(options.headers || {}),
    },
  });

  return handleResponse(res);
}

// ===== Blogs API =====

// GET typically returns JSON, no need to set json:false unless you want to avoid sending Content-Type
export const getBlogs = () => apiFetch("/blogs", { json: false });

export const createBlog = (blog, token) =>
  apiFetch("/blogs", {
    method: "POST",
    token,
    body: JSON.stringify(blog),
  });

export const deleteBlog = (id, token) =>
  apiFetch(`/blogs/${id}`, {
    method: "DELETE",
    token,
    json: false,
  });

export const updateBlog = (id, blog, token) =>
  apiFetch(`/blogs/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(blog),
  });

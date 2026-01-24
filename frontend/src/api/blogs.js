const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const getToken = () => localStorage.getItem("token");

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

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && data.message) ||
      (typeof data === "string" && data) ||
      "Request failed";
    throw new Error(msg);
  }

  return data;
}

async function apiFetch(path, { token, json = true, ...options } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(token, json),
      ...(options.headers || {}),
    },
  });
  return handleResponse(res);
}

// ===== Blogs API =====
export const getBlogs = () => apiFetch("/blogs", { json: false }); // no need for Content-Type

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

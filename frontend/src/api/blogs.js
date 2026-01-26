const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = RAW_API_URL.replace(/\/$/, ""); // ✅ remove trailing slash

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
    logout();
    // ✅ Prefer letting UI decide navigation:
    // throw and handle it in your app (or keep redirect if you want)
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

export async function apiFetch(path, { token, ...options } = {}) {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...authHeaders(token),
    ...(options.headers || {}),
  };

  // ✅ set JSON Content-Type only when sending a JSON body
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  return handleResponse(res);
}

// ===== Blogs API =====

export const getBlogs = () => apiFetch("/blogs");

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
  });

export const updateBlog = (id, blog, token) =>
  apiFetch(`/blogs/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(blog),
  });

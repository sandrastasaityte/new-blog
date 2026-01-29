// src/lib/blogApi.js
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

const safeUrl = (path = "") => `${API_URL}/${String(path).replace(/^\/+/, "")}`;

function getToken(passed) {
  return passed || localStorage.getItem("token") || "";
}

function authHeaders(token, json = true) {
  const t = getToken(token);
  return {
    ...(json && { "Content-Type": "application/json" }),
    ...(t && { Authorization: `Bearer ${t}` }),
  };
}

async function handleResponse(res) {
  let data = null;
  const contentType = res.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = text ? { message: text } : {};
    }
  } catch {
    data = {};
  }

  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

// ------------------ POSTS ------------------
export const getBlogs = async () => {
  const res = await fetch(safeUrl("posts"));
  return handleResponse(res);
};

export const createBlog = async (blog, token) => {
  const res = await fetch(safeUrl("posts"), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(blog),
  });
  return handleResponse(res);
};

export const updateBlog = async (id, blog, token) => {
  const res = await fetch(safeUrl(`posts/${id}`), {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(blog),
  });
  return handleResponse(res);
};

export const deleteBlog = async (id, token) => {
  const res = await fetch(safeUrl(`posts/${id}`), {
    method: "DELETE",
    headers: authHeaders(token, false),
  });
  return handleResponse(res);
};

export const likeBlog = async (id, token) => {
  const res = await fetch(safeUrl(`posts/${id}/like`), {
    method: "POST",
    headers: authHeaders(token, false),
  });
  return handleResponse(res);
};

export const addComment = async (id, comment, token) => {
  const res = await fetch(safeUrl(`posts/${id}/comments`), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(comment),
  });
  return handleResponse(res);
};

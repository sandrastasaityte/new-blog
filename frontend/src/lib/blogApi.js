const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const safeUrl = (base, path = "") =>
  `${String(base).replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;

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
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {}
  } else {
    try {
      const text = await res.text();
      data = text ? { message: text } : null;
    } catch {}
  }

  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

// ✅ BACKEND IS /posts (not /blogs)
export const getBlogs = async () => {
  const res = await fetch(safeUrl(API_URL, "posts"));
  return handleResponse(res);
};

export const getBlog = async (id) => {
  const res = await fetch(safeUrl(API_URL, `posts/${id}`));
  return handleResponse(res);
};

export const createBlog = async (blog, token) => {
  const res = await fetch(safeUrl(API_URL, "posts"), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(blog),
  });
  return handleResponse(res);
};

export const updateBlog = async (id, blog, token) => {
  const res = await fetch(safeUrl(API_URL, `posts/${id}`), {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(blog),
  });
  return handleResponse(res);
};

export const deleteBlog = async (id, token) => {
  const res = await fetch(safeUrl(API_URL, `posts/${id}`), {
    method: "DELETE",
    headers: authHeaders(token, false),
  });
  return handleResponse(res);
};

// optional routes you already have:
export const likeBlog = async (id, token) => {
  const res = await fetch(safeUrl(API_URL, `posts/${id}/like`), {
    method: "POST",
    headers: authHeaders(token, false),
  });
  return handleResponse(res);
};

export const addComment = async (id, comment, token) => {
  const res = await fetch(safeUrl(API_URL, `posts/${id}/comments`), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(comment),
  });
  return handleResponse(res);
};

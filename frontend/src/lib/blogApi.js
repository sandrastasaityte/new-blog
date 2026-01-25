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

  // Try JSON first when possible
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      // fall through
    }
  } else {
    // backend might send text/html or empty
    try {
      const text = await res.text();
      data = text ? { message: text } : null;
    } catch {
      // ignore
    }
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

// -------------------- BLOGS --------------------

export const getBlogs = async () => {
  const res = await fetch(safeUrl(API_URL, "blogs"));
  return handleResponse(res);
};

export const getBlog = async (id) => {
  const res = await fetch(safeUrl(API_URL, `blogs/${id}`));
  return handleResponse(res);
};

export const createBlog = async (blog, token) => {
  const res = await fetch(safeUrl(API_URL, "blogs"), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(blog),
  });

  return handleResponse(res);
};

export const updateBlog = async (id, blog, token) => {
  const res = await fetch(safeUrl(API_URL, `blogs/${id}`), {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(blog),
  });

  return handleResponse(res);
};

export const deleteBlog = async (id, token) => {
  const res = await fetch(safeUrl(API_URL, `blogs/${id}`), {
    method: "DELETE",
    headers: authHeaders(token, false),
  });

  return handleResponse(res);
};

// -------------------- OPTIONAL (for your UI) --------------------
// Only use these if your backend supports these routes.
// If not, we can implement them in your backend.

export const toggleLike = async (id, token) => {
  const res = await fetch(safeUrl(API_URL, `blogs/${id}/like`), {
    method: "POST",
    headers: authHeaders(token, false),
  });
  return handleResponse(res);
};

export const addComment = async (id, comment, token) => {
  const res = await fetch(safeUrl(API_URL, `blogs/${id}/comments`), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(comment), // {name,text} or {text}
  });
  return handleResponse(res);
};

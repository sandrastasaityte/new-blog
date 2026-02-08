// src/lib/blogApi.js
import { API_URL, USE_POSTS_BACKEND, USE_BACKEND_AUTH } from "./env";
import { authHelpers } from "./authApi";

const BASE_URL = `${API_URL}/blogs`;

/* ---------------- Response Handler ---------------- */

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  try {
    data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();
  } catch {}

  if (res.status === 401) {
    authHelpers.clearAuth();
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;

    throw new Error(msg);
  }

  return data;
}

/* ---------------- Fetch Wrapper ---------------- */

async function blogFetch(url, options = {}) {
  const token = authHelpers.getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(USE_BACKEND_AUTH && token
      ? { Authorization: `Bearer ${token}` }
      : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse(res);
}

/* ---------------- DEV MOCK HELPERS ---------------- */

function mockId() {
  return `p-${Date.now()}`;
}

/* ---------------- CRUD ---------------- */

export const getPosts = async () => {
  if (!USE_POSTS_BACKEND) {
    const data = await import("../assets/blogsData.json");
    return data.default;
  }

  return blogFetch(BASE_URL, { method: "GET" });
};

export const createPost = async (payload) => {
  if (!USE_POSTS_BACKEND) {
    return { ...payload, _id: mockId() };
  }

  return blogFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updatePost = async (id, payload) => {
  if (!USE_POSTS_BACKEND) {
    return { ...payload, _id: id };
  }

  return blogFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deletePost = async (id) => {
  if (!USE_POSTS_BACKEND) {
    return { _id: id };
  }

  return blogFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
};

/* ---------------- COMMENTS ---------------- */

export const addComment = async (id, comment) => {
  if (!USE_POSTS_BACKEND) {
    return { ...comment, _id: mockId() };
  }

  return blogFetch(`${BASE_URL}/${id}/comments`, {
    method: "POST",
    body: JSON.stringify(comment),
  });
};

/* ---------------- LIKES ---------------- */

export const likeBlog = async (id) => {
  if (!USE_POSTS_BACKEND) {
    return { _id: id };
  }

  return blogFetch(`${BASE_URL}/${id}/like`, {
    method: "POST",
  });
};

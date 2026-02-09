// src/lib/blogApi.js
import { API_URL, USE_POSTS_BACKEND, USE_BACKEND_AUTH } from "./env";
import { authHelpers } from "./authApi";

const BASE_URL = `${API_URL}/blogs`;

/* =========================================================
   RESPONSE HANDLER
========================================================= */

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  try {
    data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();
  } catch {}

  /* ---------- Auto logout on 401 ---------- */
  if (res.status === 401) {
    authHelpers.logout?.(); // FIXED (you had clearAuth which doesn't exist)
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

/* =========================================================
   FETCH WRAPPER
========================================================= */

async function blogFetch(url, options = {}) {
  const token = authHelpers.getToken?.();

  const headers = {
    ...(options.body && { "Content-Type": "application/json" }),
    ...(USE_BACKEND_AUTH && token
      ? { Authorization: `Bearer ${token}` }
      : {}),
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    ...options,
    headers
  });

  return handleResponse(res);
}

/* =========================================================
   DEV MOCK HELPERS
========================================================= */

function mockId() {
  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mockPost(payload) {
  return {
    ...payload,
    _id: mockId(),
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    comments: [],
    views: 0
  };
}

/* =========================================================
   CRUD
========================================================= */

export const getPosts = async () => {
  if (!USE_POSTS_BACKEND) {
    const data = await import("../assets/blogsData.json");
    return data.default;
  }

  return blogFetch(BASE_URL);
};

export const getPostById = async (id) => {
  if (!id) throw new Error("Post ID required");

  if (!USE_POSTS_BACKEND) {
    const posts = await getPosts();
    return posts.find(p => String(p._id || p.id) === String(id));
  }

  return blogFetch(`${BASE_URL}/${id}`);
};

export const createPost = async (payload) => {
  if (!payload) throw new Error("Post payload required");

  if (!USE_POSTS_BACKEND) {
    return mockPost(payload);
  }

  return blogFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const updatePost = async (id, payload) => {
  if (!id) throw new Error("Post ID required");

  if (!USE_POSTS_BACKEND) {
    return { ...payload, _id: id };
  }

  return blogFetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
};

export const deletePost = async (id) => {
  if (!id) throw new Error("Post ID required");

  if (!USE_POSTS_BACKEND) {
    return { _id: id };
  }

  return blogFetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  });
};

/* =========================================================
   COMMENTS
========================================================= */

export const addComment = async (id, comment) => {
  if (!id) throw new Error("Post ID required");
  if (!comment) throw new Error("Comment required");

  const commentPayload =
    typeof comment === "string"
      ? { text: comment }
      : comment;

  if (!USE_POSTS_BACKEND) {
    return {
      ...commentPayload,
      _id: mockId(),
      createdAt: new Date().toISOString()
    };
  }

  return blogFetch(`${BASE_URL}/${id}/comments`, {
    method: "POST",
    body: JSON.stringify(commentPayload)
  });
};

/* =========================================================
   LIKES
========================================================= */

export const likeBlog = async (id) => {
  if (!id) throw new Error("Post ID required");

  if (!USE_POSTS_BACKEND) {
    return { _id: id };
  }

  return blogFetch(`${BASE_URL}/${id}/like`, {
    method: "POST"
  });
};

/* =========================================================
   VIEWS
========================================================= */

export const incViews = async (id) => {
  if (!id) return;

  if (!USE_POSTS_BACKEND) {
    return { _id: id };
  }

  return blogFetch(`${BASE_URL}/${id}/view`, {
    method: "POST"
  });
};

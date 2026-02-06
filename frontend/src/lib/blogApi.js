import { API_URL, USE_POSTS_BACKEND, USE_BACKEND_AUTH } from "./env";

const BASE_URL = `${API_URL}/blogs`;

export const getPosts = async () => {
  try {
    if (!USE_POSTS_BACKEND) {
      const data = await import("../assets/blogsData.json");
      return data.default;
    }

    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch blogs");
    return await res.json();
  } catch (err) {
    console.error("getPosts error:", err);
    return [];
  }
};

export const createPost = async (payload, token) => {
  if (!USE_POSTS_BACKEND) return { ...payload, id: Date.now() };
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(USE_BACKEND_AUTH && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create blog");
  return res.json();
};

export const updatePost = async (id, payload, token) => {
  if (!USE_POSTS_BACKEND) return { ...payload, id };
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(USE_BACKEND_AUTH && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update blog");
  return res.json();
};

export const deletePost = async (id, token) => {
  if (!USE_POSTS_BACKEND) return { id };
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: USE_BACKEND_AUTH && token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to delete blog");
  return res.json();
};
// ---------------- COMMENTS ----------------
export const addComment = async (id, comment) => {
  if (!USE_POSTS_BACKEND) {
    // local fallback
    return { ...comment, id: Date.now() };
  }
  const res = await fetch(`${BASE_URL}/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(comment),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
};

// ---------------- LIKES ----------------
export const likeBlog = async (id) => {
  if (!USE_POSTS_BACKEND) return { id };
  const res = await fetch(`${BASE_URL}/${id}/like`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to like blog");
  return res.json();
};

// src/lib/blogApi.js
import { API_URL, USE_POSTS_BACKEND, USE_BACKEND_AUTH } from "./env";

const BASE_URL = `${API_URL}/blogs`;

// ---------------- Helpers ----------------
function getAuthHeader(token) {
  if (!USE_BACKEND_AUTH || !token) return {};
  return { Authorization: `Bearer ${token}` };
}

// ---------------- CRUD ----------------
export const getPosts = async () => {
  if (!USE_POSTS_BACKEND) {
    const data = await import("../assets/blogsData.json");
    return data.default;
  }
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch blogs");
  return res.json();
};

export const createPost = async (payload, token) => {
  if (!USE_POSTS_BACKEND) return { ...payload, _id: Date.now().toString() };
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create blog");
  return res.json();
};

export const updatePost = async (id, payload, token) => {
  if (!USE_POSTS_BACKEND) return { ...payload, _id: id };
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update blog");
  return res.json();
};

export const deletePost = async (id, token) => {
  if (!USE_POSTS_BACKEND) return { _id: id };
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(token),
  });
  if (!res.ok) throw new Error("Failed to delete blog");
  return res.json();
};

// ---------------- COMMENTS ----------------
export const addComment = async (id, comment, token) => {
  if (!USE_POSTS_BACKEND) return { ...comment, _id: Date.now().toString() };
  const res = await fetch(`${BASE_URL}/${id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(token),
    },
    body: JSON.stringify(comment),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
};

// ---------------- LIKES ----------------
export const likeBlog = async (id, token) => {
  if (!USE_POSTS_BACKEND) return { _id: id };
  const res = await fetch(`${BASE_URL}/${id}/like`, {
    method: "POST",
    headers: getAuthHeader(token),
  });
  if (!res.ok) throw new Error("Failed to like blog");
  return res.json();
};
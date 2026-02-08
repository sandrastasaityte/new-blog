import { apiFetch } from "./apiFetch";

/* ---------------- Token Helper ---------------- */
const getToken = (token) => token || localStorage.getItem("token") || "";

/* ---------------- Auth Header Helper ---------------- */
const authHeader = (token) => {
  const t = getToken(token);
  return t ? { Authorization: `Bearer ${t}` } : {};
};

/* ---------------- Get All Blogs ---------------- */
export async function getBlogs() {
  return apiFetch("/blogs");
}

/* ---------------- Get Single Blog ---------------- */
export async function getBlogById(id) {
  if (!id) throw new Error("Blog id is required");
  return apiFetch(`/blogs/${id}`);
}

/* ---------------- Create Blog ---------------- */
export async function createBlog(blog, token) {
  if (!blog) throw new Error("Blog data is required");

  return apiFetch("/blogs", {
    method: "POST",
    headers: {
      ...authHeader(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(blog),
  });
}

/* ---------------- Update Blog ---------------- */
export async function updateBlog(id, patch, token) {
  if (!id) throw new Error("Blog id is required");

  return apiFetch(`/blogs/${id}`, {
    method: "PATCH",
    headers: {
      ...authHeader(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });
}

/* ---------------- Delete Blog ---------------- */
export async function deleteBlog(id, token) {
  if (!id) throw new Error("Blog id is required");

  return apiFetch(`/blogs/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

/* ---------------- Toggle Like ---------------- */
export async function likeBlog(id, token) {
  if (!id) throw new Error("Blog id is required");

  return apiFetch(`/blogs/${id}/like`, {
    method: "POST",
    headers: authHeader(token),
  });
}

/* ---------------- Add Comment ---------------- */
export async function addComment(id, comment, token) {
  if (!id) throw new Error("Blog id is required");

  return apiFetch(`/blogs/${id}/comments`, {
    method: "POST",
    headers: {
      ...authHeader(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: comment }),
  });
}

/* ---------------- Increment Views ---------------- */
export async function incViews(id) {
  if (!id) return;

  return apiFetch(`/blogs/${id}/view`, {
    method: "POST",
  });
}

import { apiFetch } from "./apiFetch";

// Get all blogs
export async function getBlogs() {
  return apiFetch("/blogs");
}

// Create a blog (requires token)
export async function createBlog(blog, token) {
  return apiFetch("/blogs", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(blog),
  });
}

// Update a blog
export async function updateBlog(id, patch, token) {
  return apiFetch(`/blogs/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(patch),
  });
}

// Delete a blog
export async function deleteBlog(id, token) {
  return apiFetch(`/blogs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

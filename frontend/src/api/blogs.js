const API_URL = import.meta.env.VITE_API_URL;

export const getBlogs = async () => {
  const res = await fetch(`${API_URL}/blogs`);
  return res.json();
};

export const createBlog = async (blog, token) => {
  const res = await fetch(`${API_URL}/blogs`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(blog),
  });
  return res.json();
};

export const deleteBlog = async (id, token) => {
  const res = await fetch(`${API_URL}/blogs/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  return res.json();
};

export const updateBlog = async (id, blog, token) => {
  const res = await fetch(`${API_URL}/blogs/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(blog),
  });
  return res.json();
};

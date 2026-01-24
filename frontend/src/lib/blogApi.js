const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function handleResponse(res) {
  let data;

  try {
    data = await res.json();
  } catch {
    throw new Error("Server returned invalid response");
  }

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

function authHeaders(token, json = true) {
  return {
    ...(json && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const getBlogs = async () => {
  const res = await fetch(`${API_URL}/blogs`);
  return handleResponse(res);
};

export const createBlog = async (blog, token) => {
  const res = await fetch(`${API_URL}/blogs`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(blog),
  });

  return handleResponse(res);
};

export const deleteBlog = async (id, token) => {
  const res = await fetch(`${API_URL}/blogs/${id}`, {
    method: "DELETE",
    headers: authHeaders(token, false),
  });

  return handleResponse(res);
};

export const updateBlog = async (id, blog, token) => {
  const res = await fetch(`${API_URL}/blogs/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(blog),
  });

  return handleResponse(res);
};

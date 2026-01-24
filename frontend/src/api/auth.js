const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const getToken = () => localStorage.getItem("token");

async function handleResponse(res) {
  let data;

  try {
    data = await res.json();
  } catch {
    throw new Error("Server returned invalid JSON");
  }

  if (res.status === 401) {
    logout();
    window.location.href = "/";
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Request failed");
  }

  return data;
}

export const authFetch = async (url, options = {}) => {
  const token = getToken();

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  return handleResponse(res);
};

export const register = (username, password) =>
  authFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const login = async (username, password) => {
  const data = await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = RAW_API_URL.replace(/\/$/, ""); // remove trailing slash

export const getToken = () => localStorage.getItem("token");

export const logout = () => {
  localStorage.removeItem("token");
};

async function handleResponse(res) {
  let data = null;

  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error("Server returned invalid JSON");
    return null;
  }

  if (res.status === 401) {
    logout();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Request failed");
  }

  return data;
}

export const authFetch = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Only set JSON header if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
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

  if (data?.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
};

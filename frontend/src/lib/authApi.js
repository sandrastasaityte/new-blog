const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders(json = true) {
  const token = getToken();
  return {
    ...(json && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponse(res) {
  let data;

  try {
    data = await res.json();
  } catch {
    throw new Error("Server returned invalid JSON");
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

// ------------------ AUTH ------------------

export const register = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ username, password }),
  });

  const data = await handleResponse(res);

  if (data?.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
};

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ username, password }),
  });

  const data = await handleResponse(res);

  if (data?.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ------------------ USER ------------------

export const getMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(false),
  });

  return handleResponse(res);
};

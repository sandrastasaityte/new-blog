const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Server returned invalid JSON");
  }

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export const register = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  return handleResponse(res);
};

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await handleResponse(res);

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

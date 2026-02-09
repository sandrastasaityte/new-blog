export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (!user) return;
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem("user");
}

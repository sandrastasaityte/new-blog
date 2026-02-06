// src/Context/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("demo_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async ({ username, password }) => {
    if (!username || !password) {
      return { ok: false, message: "Enter username and password" };
    }

    await new Promise((r) => setTimeout(r, 300));

    const demoUser = { username: username.trim() };
    setUser(demoUser);
    localStorage.setItem("demo_user", JSON.stringify(demoUser));

    return { ok: true, token: "demo-token" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("demo_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

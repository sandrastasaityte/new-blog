import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";

const AuthContext = createContext(null);

const LS_TOKEN = "admin_token_v1";
const LS_USER = "admin_user_v1";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Toggle when your backend is ready
const USE_BACKEND_AUTH = false;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(LS_TOKEN) || "");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      if (token) localStorage.setItem(LS_TOKEN, token);
      else localStorage.removeItem(LS_TOKEN);
    } catch {}
  }, [token]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
      else localStorage.removeItem(LS_USER);
    } catch {}
  }, [user]);

  const safeJson = useCallback(async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!USE_BACKEND_AUTH) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await safeJson(res);

        if (!res.ok) {
          if (!cancelled) {
            setToken("");
            setUser(null);
          }
        } else {
          if (!cancelled) {
            if (data?.user) setUser(data.user);
            else if (data?.username) setUser({ username: data.username });
          }
        }
      } catch {
        // network error: keep existing token/user
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [token, safeJson]);

  const login = useCallback(async ({ username, password }) => {
    if (!USE_BACKEND_AUTH) {
      if (username?.trim() && password?.trim()) {
        setToken("demo-token");
        setUser({ username: username.trim() });
        return { ok: true };
      }
      return { ok: false, message: "Enter username and password." };
    }

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await safeJson(res);
    if (!res.ok) return { ok: false, message: data?.message || "Login failed" };

    setToken(data?.token || "");
    setUser(data?.user || { username: data?.username || username });
    return { ok: true };
  }, [safeJson]);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthed: !!token,
      isLoading,
      login,
      logout,
    }),
    [token, user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

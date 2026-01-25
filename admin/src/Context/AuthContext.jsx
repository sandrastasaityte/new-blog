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

// ✅ control with .env (no code edits later)
const USE_BACKEND_AUTH = import.meta.env.VITE_USE_BACKEND_AUTH === "true";

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

  // Validate session on mount / token changes (backend mode)
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

  const login = useCallback(
    async ({ username, password }) => {
      const u = username?.trim();
      const p = password?.trim();

      if (!USE_BACKEND_AUTH) {
        if (u && p) {
          // demo session
          setToken("demo-token");
          setUser({ username: u });
          return { ok: true };
        }
        return { ok: false, message: "Enter username and password." };
      }

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await safeJson(res);
      if (!res.ok) return { ok: false, message: data?.message || "Login failed" };

      setToken(data?.token || "");
      setUser(data?.user || { username: data?.username || u });
      return { ok: true };
    },
    [safeJson]
  );

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      // ✅ demo mode: rely on user, backend mode: rely on token
      isAuthed: USE_BACKEND_AUTH ? !!token : !!user,
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

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

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = RAW_API_URL.replace(/\/$/, "");

// ✅ control with .env
const USE_BACKEND_AUTH = import.meta.env.VITE_USE_BACKEND_AUTH === "true";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(LS_TOKEN) || "";
    } catch {
      return "";
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken || "");
    setUser(nextUser || null);
  }, []);

  // persist token
  useEffect(() => {
    try {
      if (token) localStorage.setItem(LS_TOKEN, token);
      else localStorage.removeItem(LS_TOKEN);
    } catch {}
  }, [token]);

  // persist user
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

  const authHeaders = useCallback(
    (json = true) => ({
      ...(json ? { "Content-Type": "application/json" } : null),
      ...(token ? { Authorization: `Bearer ${token}` } : null),
    }),
    [token]
  );

  // ✅ Validate session on mount / token changes (backend mode)
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // demo mode → no backend check
      if (!USE_BACKEND_AUTH) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      // backend mode but no token → not authed
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: authHeaders(false),
        });

        const data = await safeJson(res);

        if (!res.ok) {
          if (!cancelled) setSession("", null);
        } else {
          if (!cancelled) {
            const nextUser = data?.user || data || null;
            setUser(nextUser);
          }
        }
      } catch {
        // network error → keep existing token/user, just stop loading
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [token, safeJson, authHeaders, setSession]);

  const login = useCallback(
    async ({ username, password }) => {
      const u = String(username || "").trim().toLowerCase();
      const p = String(password || "");

      if (!u || !p) return { ok: false, message: "Enter username and password." };

      // demo mode
      if (!USE_BACKEND_AUTH) {
        setSession("demo-token", { username: u });
        setIsLoading(false);
        return { ok: true };
      }

      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u, password: p }),
        });

        const data = await safeJson(res);
        if (!res.ok) return { ok: false, message: data?.message || "Login failed" };

        const t = data?.token || "";
        const nextUser = data?.user || { username: u };
        setSession(t, nextUser);

        return { ok: true };
      } catch (e) {
        return { ok: false, message: e?.message || "Network error" };
      }
    },
    [safeJson, setSession]
  );

  const logout = useCallback(() => {
    setSession("", null);
  }, [setSession]);

  // Optional helper for API calls (so you don’t repeat headers everywhere)
  const authFetch = useCallback(
    async (path, options = {}) => {
      const url = path.startsWith("http") ? path : `${API_URL}${path}`;
      const headers = {
        ...(options.headers || {}),
        ...authHeaders(!(options.body instanceof FormData)),
      };

      // if sending FormData, don't force content-type
      if (options.body instanceof FormData) {
        delete headers["Content-Type"];
      }

      const res = await fetch(url, { ...options, headers });
      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?.message || "Request failed";
        throw new Error(msg);
      }

      return data;
    },
    [authHeaders, safeJson]
  );

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthed: USE_BACKEND_AUTH ? !!token : !!user,
      isLoading,
      login,
      logout,
      authFetch, // ✅ optional: use in your api calls
      API_URL,   // ✅ optional: expose for debugging
      USE_BACKEND_AUTH,
    }),
    [token, user, isLoading, login, logout, authFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

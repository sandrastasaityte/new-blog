import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from "react";

import {
  login as loginAPI,
  register as registerAPI,
  me
} from "../lib/authApi";

/* -------------------------------------------
   Constants
------------------------------------------- */

const STORAGE_KEY = "token";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}

/* -------------------------------------------
   Provider
------------------------------------------- */

export function AuthProvider({ children }) {

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isMounted = useRef(true);

  /* -------------------------------------------
     Logout
  ------------------------------------------- */

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}

    if (!isMounted.current) return;

    setToken(null);
    setUser(null);
  }, []);

  /* -------------------------------------------
     Load user from token
  ------------------------------------------- */

  const loadUser = useCallback(async (currentToken) => {

    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await me(currentToken);

      if (!isMounted.current) return;

      setUser(userData);

    } catch (err) {

      console.warn("Session invalid → logout");
      logout();

    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }

  }, [logout]);

  /* -------------------------------------------
     Load user when token changes
  ------------------------------------------- */

  useEffect(() => {
    loadUser(token);
  }, [token, loadUser]);

  /* -------------------------------------------
     Login
  ------------------------------------------- */

  const login = useCallback(async (credentials) => {
    try {
      const data = await loginAPI(credentials);

      if (!data?.token) {
        return { ok: false, message: "Login failed" };
      }

      localStorage.setItem(STORAGE_KEY, data.token);

      setToken(data.token);
      setUser(data.user);

      return { ok: true };

    } catch (err) {
      return {
        ok: false,
        message: err?.message || "Login error"
      };
    }
  }, []);

  /* -------------------------------------------
     Register
  ------------------------------------------- */

  const register = useCallback(async (payload) => {
    try {
      const data = await registerAPI(payload);

      if (!data?.token) {
        return { ok: false, message: "Register failed" };
      }

      localStorage.setItem(STORAGE_KEY, data.token);

      setToken(data.token);
      setUser(data.user);

      return { ok: true };

    } catch (err) {
      return {
        ok: false,
        message: err?.message || "Register error"
      };
    }
  }, []);

  /* -------------------------------------------
     Sync auth across tabs
  ------------------------------------------- */

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== STORAGE_KEY) return;

      if (!e.newValue) {
        logout();
      } else {
        setToken(e.newValue);
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [logout]);

  /* -------------------------------------------
     Mounted safety
  ------------------------------------------- */

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /* -------------------------------------------
     Memoize context value (performance)
  ------------------------------------------- */

  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    login,
    register,
    logout
  }), [user, token, isLoading, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// src/pages/Login.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "./Admin.css";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const userRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect logged-in users to /admin
  useEffect(() => {
    if (user) {
      nav("/admin", { replace: true });
    }
  }, [user, nav]);

  useEffect(() => {
    userRef.current?.focus?.();
  }, []);

  const from = useMemo(() => {
    const s = loc.state?.from;

    if (s && typeof s === "object" && s.pathname) {
      return s.pathname + (s.search || "");
    }

    if (typeof s === "string" && s.trim()) return s;

    return "/admin";
  }, [loc.state]);

  const canSubmit = username.trim() && password.trim() && !loading;

  const onSubmit = async (e) => {
    e.preventDefault();

    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setErr("Enter username and password.");
      return;
    }

    if (loading) return;

    setErr("");
    setLoading(true);

    try {
      const res = await login({ username: u, password: p });
      if (!res?.ok) {
        setErr(res?.message || "Login failed");
        return;
      }
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <h2 style={{ marginTop: 0 }}>Admin Login</h2>

      {err ? <div className="form-error">{err}</div> : null}

      <form className="auth-form" onSubmit={onSubmit}>
        <input
          ref={userRef}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          disabled={loading}
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          disabled={loading}
        />

        <button className="btn primary" disabled={!canSubmit} type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p style={{ marginTop: 10, opacity: 0.7, fontSize: 13 }}>
          Demo mode: any username + password works.
        </p>
      </form>
    </div>
  );
}

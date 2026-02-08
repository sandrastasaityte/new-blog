import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback
} from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "./Admin.css";

export default function Login() {

  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const usernameRef = useRef(null);

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* -----------------------------------------
     Redirect if already authenticated
  ----------------------------------------- */

  useEffect(() => {
    if (user) navigate("/admin", { replace: true });
  }, [user, navigate]);

  /* -----------------------------------------
     Focus username input
  ----------------------------------------- */

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  /* -----------------------------------------
     Resolve redirect target safely
  ----------------------------------------- */

  const redirectPath = useMemo(() => {

    const from = location.state?.from;

    if (from && typeof from === "object" && from.pathname) {
      return from.pathname + (from.search || "");
    }

    if (typeof from === "string" && from.trim()) {
      return from;
    }

    return "/admin";

  }, [location.state]);

  /* -----------------------------------------
     Derived state
  ----------------------------------------- */

  const canSubmit = useMemo(() => {
    return (
      form.username.trim() &&
      form.password.trim() &&
      !loading
    );
  }, [form, loading]);

  /* -----------------------------------------
     Handlers
  ----------------------------------------- */

  const setField = useCallback((key) => (e) => {
    const value = e.target.value;

    setForm(prev => ({ ...prev, [key]: value }));
    setError("");
  }, []);

  /* -----------------------------------------
     Submit
  ----------------------------------------- */

  const handleSubmit = useCallback(async (e) => {

    e.preventDefault();

    const username = form.username.trim();
    const password = form.password.trim();

    if (!username || !password) {
      setError("Enter username and password.");
      return;
    }

    if (loading) return;

    setLoading(true);
    setError("");

    try {

      const res = await login({ username, password });

      if (!res?.ok) {
        setError(res?.message || "Login failed");
        return;
      }

      navigate(redirectPath, { replace: true });

    } catch (err) {

      setError(err?.message || "Login failed");

    } finally {
      setLoading(false);
    }

  }, [form, login, loading, navigate, redirectPath]);

  /* -----------------------------------------
     UI
  ----------------------------------------- */

  return (
    <div className="auth-wrapper">

      <h2 style={{ marginTop: 0 }}>Admin Login</h2>

      {error && (
        <div
          className="form-error"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >

        {/* Username */}

        <input
          ref={usernameRef}
          value={form.username}
          onChange={setField("username")}
          placeholder="Username"
          autoComplete="username"
          disabled={loading}
          aria-invalid={!!error}
        />

        {/* Password */}

        <input
          type="password"
          value={form.password}
          onChange={setField("password")}
          placeholder="Password"
          autoComplete="current-password"
          disabled={loading}
          aria-invalid={!!error}
        />

        {/* Submit */}

        <button
          className="btn primary"
          disabled={!canSubmit}
          type="submit"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {/* Demo note */}

        <p style={{ marginTop: 10, opacity: 0.7, fontSize: 13 }}>
          Demo mode: any username + password works.
        </p>

      </form>
    </div>
  );
}

// src/Components/Auth/AuthForm.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import "./AuthForm.css";
import { login, register } from "../../lib/authApi";

const initialState = {
  email: "",
  password: "",
  confirmPassword: "",
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---------- Universal token extractor ---------- */
function extractToken(data) {
  return (
    data?.token ||
    data?.accessToken ||
    data?.jwt ||
    data?.data?.token ||
    data?.data?.accessToken ||
    data?.data?.jwt ||
    null
  );
}

export default function AuthForm({ setToken, onClose, setBusy }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const errorRef = useRef(null);

  /* ---------- Trimmed values ---------- */
  const email = useMemo(() => formData.email.trim(), [formData.email]);
  const password = useMemo(() => formData.password.trim(), [formData.password]);
  const confirm = useMemo(
    () => formData.confirmPassword.trim(),
    [formData.confirmPassword]
  );

  /* ---------- Reset form when switching modes ---------- */
  useEffect(() => {
    setFormData(initialState);
    setError("");
  }, [isLogin]);

  /* ---------- Focus error ---------- */
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  /* ---------- Close modal on ESC ---------- */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  /* ---------- Input change ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  /* ---------- Validation ---------- */
  const validate = () => {
    if (!email || !password) return "Please fill all fields.";
    if (!isValidEmail(email)) return "Invalid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";

    if (!isLogin) {
      if (!confirm) return "Please confirm your password.";
      if (confirm !== password) return "Passwords do not match.";
    }

    return "";
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const msg = validate();
    if (msg) return setError(msg);

    try {
      setLoading(true);
      setBusy?.(true);
      setError("");

      const response = isLogin
        ? await login(email, password)
        : await register(email, password);

      const token =
        extractToken(response) || localStorage.getItem("token");

      if (!token) {
        setError("Authentication failed. No token returned.");
        return;
      }

      /* ---------- Save auth ---------- */
      localStorage.setItem("token", token);

      const user = response?.user || response?.data?.user;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      setToken?.(token);

      setFormData(initialState);
      onClose?.();

    } catch (err) {
      setError(err?.message || "Authentication failed.");
    } finally {
      setLoading(false);
      setBusy?.(false);
    }
  };

  /* ---------- Render ---------- */
  return (
    <div
      className="auth-modal-overlay"
      onMouseDown={(e) =>
        e.target === e.currentTarget && onClose?.()
      }
    >
      <div
        className="auth-modal"
        onMouseDown={(e) => e.stopPropagation()}
        aria-busy={loading}
      >
        <button
          className="auth-close-btn"
          onClick={onClose}
          type="button"
          disabled={loading}
        >
          ×
        </button>

        <h2>{isLogin ? "Login" : "Sign Up"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={loading}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            autoComplete={
              isLogin ? "current-password" : "new-password"
            }
            disabled={loading}
            minLength={6}
            required
          />

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={loading}
              minLength={6}
              required
            />
          )}

          {error && (
            <p
              className="error"
              role="alert"
              tabIndex={-1}
              ref={errorRef}
            >
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? isLogin
                ? "Logging in..."
                : "Creating account..."
              : isLogin
              ? "Login"
              : "Sign Up"}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            className="toggle-link"
            onClick={() => setIsLogin((v) => !v)}
            disabled={loading}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState, useRef } from "react";
import { login, register } from "../../lib/authApi";
import "./AuthModal.css";

const initialState = { email: "", password: "", confirmPassword: "" };

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const AuthModal = ({ isOpen, onClose, defaultMode = "login", setToken }) => {
  const [mode, setMode] = useState(defaultMode); // "login" | "signup"
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const errorRef = useRef(null);

  const emailTrimmed = useMemo(() => formData.email.trim(), [formData.email]);
  const passwordTrimmed = useMemo(() => formData.password.trim(), [formData.password]);

  useEffect(() => {
    if (!isOpen) return;
    setMode(defaultMode);
    setFormData(initialState);
    setError("");
  }, [isOpen, defaultMode]);

  useEffect(() => {
    if (error && errorRef.current) errorRef.current.focus();
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validate = () => {
    if (!emailTrimmed || !passwordTrimmed) return "Please fill all fields.";
    if (!isValidEmail(emailTrimmed)) return "Enter a valid email.";
    if (passwordTrimmed.length < 6) return "Password must be at least 6 characters.";

    if (mode === "signup") {
      const confirmTrimmed = formData.confirmPassword.trim();
      if (!confirmTrimmed) return "Please confirm your password.";
      if (passwordTrimmed !== confirmTrimmed) return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const msg = validate();
    if (msg) return setError(msg);

    try {
      setLoading(true);
      setError("");

      const data = mode === "login"
        ? await login(emailTrimmed, passwordTrimmed)
        : await register(emailTrimmed, passwordTrimmed);

      const token = data?.token || data?.accessToken || null;
      if (!token) return setError("No token returned from server.");

      localStorage.setItem("token", token);
      setToken?.(token);
      onClose?.();
      setFormData(initialState);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="auth-box" onMouseDown={(e) => e.stopPropagation()}>
        <button
          className="close-btn"
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          ×
        </button>

        <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            disabled={loading}
          />
          {mode === "signup" && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
            />
          )}

          {error && (
            <p className="error" role="alert" ref={errorRef} tabIndex={-1}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? (mode === "login" ? "Logging in..." : "Creating account...") : mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="toggle-text">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="toggle-link"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            disabled={loading}
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;

// src/Components/Login/Login.jsx

import React, { useState, useMemo, useRef, useEffect } from "react";
import "./Login.css";
import { login } from "../../lib/authApi";

const initialState = { email: "", password: "" };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = ({ setToken, onSwitchToSignUp, setBusy }) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const errorRef = useRef(null);

  /* ---------- Normalized Values ---------- */
  const email = useMemo(() => formData.email.trim(), [formData.email]);
  const password = useMemo(
    () => formData.password.trim(),
    [formData.password]
  );

  /* ---------- Focus error when shown ---------- */
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  /* ---------- Input change ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  /* ---------- Validation ---------- */
  const validate = () => {
    if (!email || !password) return "Please fill all fields.";
    if (!EMAIL_REGEX.test(email)) return "Invalid email address.";
    if (password.length < 6)
      return "Password must be at least 6 characters.";
    return "";
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setLoading(true);
      setBusy?.(true);
      setError("");

      const res = await login(email, password);

      const token =
        res?.token ||
        res?.accessToken ||
        res?.jwt ||
        localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication failed. No token returned.");
      }

      /* ---------- Persist auth ---------- */
      localStorage.setItem("token", token);

      if (res?.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      setToken?.(token);
      setFormData(initialState);

    } catch (err) {
      setError(
        typeof err?.message === "string"
          ? err.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
      setBusy?.(false);
    }
  };

  /* ---------- Render ---------- */
  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit}
      aria-busy={loading}
      noValidate
    >
      <h2>Login</h2>

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
        autoComplete="email"
        aria-invalid={!!error}
        required
      />

      <div className="password-field">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          autoComplete="current-password"
          aria-invalid={!!error}
          required
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword((v) => !v)}
          aria-pressed={showPassword}
          aria-label={showPassword ? "Hide password" : "Show password"}
          disabled={loading}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {error && (
        <p
          className="error"
          ref={errorRef}
          role="alert"
          tabIndex={-1}
        >
          {error}
        </p>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Logging in…" : "Login"}
      </button>

      <p className="toggle-text">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          className="toggle-link"
          onClick={onSwitchToSignUp}
          disabled={loading}
        >
          Sign Up
        </button>
      </p>
    </form>
  );
};

export default Login;

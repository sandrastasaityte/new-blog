import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { login as loginAPI } from "../../lib/authApi";

const initial = { email: "", password: "" };

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Login = ({
  setToken,
  closePopup,
  onSuccess,
  onSwitchToSignup,
  setBusy,
}) => {
  const [formData, setFormData] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailTrimmed = useMemo(() => formData.email.trim(), [formData.email]);

  const canSubmit = useMemo(() => {
    return isValidEmail(emailTrimmed) && formData.password.length >= 6 && !loading;
  }, [emailTrimmed, formData.password, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const validate = () => {
    if (!emailTrimmed || !formData.password) return "Please fill all fields.";
    if (!isValidEmail(emailTrimmed)) return "Please enter a valid email.";
    if (formData.password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const msg = validate();
    if (msg) return setError(msg);

    try {
      setLoading(true);
      setBusy?.(true);
      setError("");

      const data = await loginAPI(emailTrimmed, formData.password);

      // ✅ support multiple token keys + fallback to localStorage
      const token =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        localStorage.getItem("token");

      if (!token) {
        setError(data?.message || "Login failed (no token returned).");
        return;
      }

      // keep storage consistent even if loginAPI already stored it
      localStorage.setItem("token", token);

      if (data?.user) {
        try {
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch {}
      }

      setToken?.(token);
      setFormData(initial);

      onSuccess?.();      // modal: close from parent
      closePopup?.();     // legacy prop (safe)
    } catch (err) {
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setBusy?.(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-form">
        <h2>Login</h2>

        <form onSubmit={handleSubmit} noValidate>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
            disabled={loading}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            minLength={6}
            disabled={loading}
          />

          {error ? (
            <p className="error" role="alert" aria-live="polite">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={!canSubmit}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-note">
          Don&apos;t have an account?{" "}
          {onSwitchToSignup ? (
            <button
              type="button"
              className="toggle-link"
              onClick={onSwitchToSignup}
              disabled={loading}
            >
              Sign Up
            </button>
          ) : (
            <Link to="/signup">Sign Up</Link>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;

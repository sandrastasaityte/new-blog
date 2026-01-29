import React, { useState, useMemo, useRef, useEffect } from "react";
import "./Login.css"; // compact CSS
import { login } from "../../lib/authApi";

const initialState = { email: "", password: "" };

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const Login = ({ setToken, onSwitchToSignUp, setBusy }) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const errorRef = useRef(null);

  const emailTrimmed = useMemo(() => formData.email.trim(), [formData.email]);
  const passwordTrimmed = useMemo(
    () => formData.password.trim(),
    [formData.password]
  );

  // Focus error when it appears
  useEffect(() => {
    if (error && errorRef.current) errorRef.current.focus();
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const validate = () => {
    if (!emailTrimmed || !passwordTrimmed) return "Please fill all fields.";
    if (!isValidEmail(emailTrimmed)) return "Please enter a valid email.";
    if (passwordTrimmed.length < 6)
      return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const msg = validate();
    if (msg) return setError(msg);

    try {
      setLoading(true);
      setBusy?.(true);
      setError("");

      const data = await login(emailTrimmed, passwordTrimmed);
      const token = data?.token || data?.accessToken || localStorage.getItem("token");

      if (!token) {
        setError(data?.message || "No token returned from server.");
        return;
      }

      localStorage.setItem("token", token);
      const user = data?.user || data?.data?.user;
      if (user) localStorage.setItem("user", JSON.stringify(user));
      setToken?.(token);

      setFormData(initialState);
    } catch (err) {
      setError(err?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
      setBusy?.(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} aria-busy={loading}>
      <h2>Login</h2>

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        autoComplete="email"
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
        autoComplete="current-password"
        disabled={loading}
      />

      {error && (
        <p
          className="error"
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          ref={errorRef}
        >
          {error}
        </p>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="toggle-text">
        Don't have an account?{" "}
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

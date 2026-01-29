import React, { useState, useMemo, useRef, useEffect } from "react";
import "./AuthForm.css";
import { login, register } from "../../lib/authApi";

const initialState = { email: "", password: "", confirmPassword: "" };

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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

const AuthForm = ({ setToken, onClose, setBusy }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const errorRef = useRef(null);

  const emailTrimmed = useMemo(() => formData.email.trim(), [formData.email]);
  const passwordTrimmed = useMemo(
    () => formData.password.trim(),
    [formData.password]
  );

  useEffect(() => {
    setFormData(initialState);
    setError("");
  }, [isLogin]);

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
    if (passwordTrimmed.length < 6) return "Password must be at least 6 characters.";
    if (!isLogin) {
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
      setBusy?.(true);
      setError("");

      const data = isLogin
        ? await login(emailTrimmed, passwordTrimmed)
        : await register(emailTrimmed, passwordTrimmed);

      const token = extractToken(data) || localStorage.getItem("token");

      if (!token) {
        setError((data?.message || data?.error) ?? "No token returned from server.");
        return;
      }

      localStorage.setItem("token", token);
      const user = data?.user || data?.data?.user;
      if (user) localStorage.setItem("user", JSON.stringify(user));

      setToken?.(token);
      setFormData(initialState);
      setError("");
      onClose?.();
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setBusy?.(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} aria-busy={loading}>
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>

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
        autoComplete={isLogin ? "current-password" : "new-password"}
        disabled={loading}
      />

      {!isLogin && (
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
          autoComplete="new-password"
          disabled={loading}
        />
      )}

      {error && (
        <p className="error" role="alert" tabIndex={-1} ref={errorRef}>
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

      <p className="toggle-text">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="toggle-link"
          onClick={() => setIsLogin((v) => !v)}
          disabled={loading}
        >
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </form>
  );
};

export default AuthForm;

import React, { useState, useMemo, useRef, useEffect } from "react";
import "./Login.css";
import { login } from "../../lib/authApi";

const initialState = { email: "", password: "" };

const Login = ({ setToken, onSwitchToSignUp, setBusy }) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const errorRef = useRef(null);

  const email = useMemo(() => formData.email.trim(), [formData.email]);
  const password = useMemo(() => formData.password.trim(), [formData.password]);

  useEffect(() => {
    if (error && errorRef.current) errorRef.current.focus();
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const validate = () => {
    if (!email || !password) return "Fill all fields";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email";
    if (password.length < 6) return "Password must be 6+ chars";
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

      const res = await login(email, password);

      const token =
        res?.token ||
        res?.accessToken ||
        res?.jwt ||
        localStorage.getItem("token");

      if (!token) throw new Error("No token received");

      localStorage.setItem("token", token);

      if (res?.user)
        localStorage.setItem("user", JSON.stringify(res.user));

      setToken?.(token);
      setFormData(initialState);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
      setBusy?.(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
        autoComplete="email"
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
          required
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword((s) => !s)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {error && (
        <p className="error" ref={errorRef} role="alert">
          {error}
        </p>
      )}

      <button disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="toggle-text">
        Don't have account?{" "}
        <button
          type="button"
          className="toggle-link"
          onClick={onSwitchToSignUp}
        >
          Sign Up
        </button>
      </p>
    </form>
  );
};

export default Login;

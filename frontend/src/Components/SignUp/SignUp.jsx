// src/Components/Auth/SignUp.jsx
import React, { useState } from "react";
import { register as registerAPI } from "../../lib/authApi";
import "./SignUp.css";

export default function SignUp({ setToken, closePopup, onSuccess, onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  // Validate form
  const validate = () => {
    if (!form.name.trim()) return "Enter your name";
    if (!form.email.includes("@")) return "Valid email required";
    if (!form.password) return "Enter password";
    if (form.password.length < 6) return "Password min 6 chars";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return "";
  };

  // Save auth to localStorage
  const saveAuth = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return setError(msg);

    try {
      setLoading(true);

      // Send name, email, password to backend
      const data = await registerAPI({ name: form.name, email: form.email, password: form.password });

      if (!data?.token) return setError("Sign up failed.");

      saveAuth(data.token, data.user || { name: form.name, email: form.email });
      setToken?.(data.token);
      onSuccess?.();
      closePopup?.();
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch {
      setError("An error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-form">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
            required
            autoComplete="name"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            required
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
            required
            autoComplete="new-password"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            required
            autoComplete="new-password"
          />

          {error && (
            <p className="error" aria-live="polite">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-switch">
          Already have an account?{" "}
          <button
            type="button"
            className="toggle-link"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./SignUp.css"; // ✅ this file contains your signup-wrapper/signup-form css
import { register as registerAPI } from "../../lib/authApi";

const SignUp = ({
  setToken,
  closePopup,
  onSuccess,
  onSwitchToLogin,
  setBusy, // optional (used by AuthModal)
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailTrimmed = useMemo(() => formData.email.trim(), [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const validate = () => {
    const name = formData.name.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name) return "Please enter your full name.";
    if (!emailTrimmed) return "Please enter your email.";
    if (!emailTrimmed.includes("@")) return "Please enter a valid email.";
    if (!password) return "Please enter a password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!confirmPassword) return "Please confirm your password.";
    if (password !== confirmPassword) return "Passwords do not match.";

    return "";
  };

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

      // backend expects (username,password) -> pass email as username
      const data = await registerAPI(emailTrimmed, formData.password);

      const token = data?.token || localStorage.getItem("token");
      if (!token) {
        setError(data?.message || "Sign up failed (no token returned).");
        return;
      }

      localStorage.setItem("token", token);
      setToken?.(token);

      // optional store user (or at least name/email)
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        localStorage.setItem(
          "user",
          JSON.stringify({ name: formData.name.trim(), email: emailTrimmed })
        );
      }

      onSuccess?.();
      closePopup?.();

      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setBusy?.(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-form">
        <h2>Sign Up</h2>

        <form onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            required
            disabled={loading}
          />

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
            autoComplete="new-password"
            required
            disabled={loading}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
            disabled={loading}
          />

          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-switch">
          Already have an account?{" "}
          {onSwitchToLogin ? (
            <button
              type="button"
              className="toggle-link"
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              Login
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </p>
      </div>
    </div>
  );
};

export default SignUp;

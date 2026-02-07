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

  // Reset modal state when opened
  useEffect(() => {
    if (!isOpen) return;
    setMode(defaultMode);
    setFormData(initialState);
    setError("");
  }, [isOpen, defaultMode]);

  // Focus error message when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus({ preventScroll: false });
    }
  }, [error]);

  // ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validate = (data) => {
    const errors = {};
    if (!data.email) errors.email = "Email is required.";
    else if (!isValidEmail(data.email)) errors.email = "Enter a valid email.";

    if (!data.password) errors.password = "Password is required.";
    else if (data.password.length < 6) errors.password = "Password must be at least 6 characters.";

    if (mode === "signup") {
      if (!data.confirmPassword) errors.confirmPassword = "Please confirm your password.";
      else if (data.password !== data.confirmPassword) errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const normalizedData = {
      email: formData.email.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
    };

    const errors = validate(normalizedData);
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]); // show first error
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        mode === "login"
          ? await login(normalizedData.email, normalizedData.password)
          : await register(normalizedData.email, normalizedData.password);

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

  const inputProps = {
    onChange: handleChange,
    disabled: loading,
    required: true,
  };

  return (
    <div className="auth-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="auth-box" onMouseDown={(e) => e.stopPropagation()} aria-busy={loading}>
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
            {...inputProps}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            minLength={6}
            value={formData.password}
            {...inputProps}
          />
          {mode === "signup" && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              minLength={6}
              value={formData.confirmPassword}
              {...inputProps}
            />
          )}

          {error && (
            <p className="error" role="alert" ref={errorRef} tabIndex={-1}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Creating account..."
              : mode === "login"
              ? "Login"
              : "Sign Up"}
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

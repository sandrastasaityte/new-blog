import React, { useEffect, useMemo, useState } from "react";
import "./AuthForm.css";
import { login, register } from "../../lib/authApi"; // ✅ adjust path if needed

const initialState = {
  email: "",
  password: "",
  confirmPassword: "",
};

// simple but better than includes("@")
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const AuthForm = ({ setToken, onClose, isLogin, setIsLogin, setBusy }) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailTrimmed = useMemo(() => formData.email.trim(), [formData.email]);

  useEffect(() => {
    // when switching between login/signup, clear confirm password + errors
    setFormData((p) => ({ ...p, confirmPassword: "" }));
    setError("");
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const validate = () => {
    if (!emailTrimmed || !formData.password) return "Please fill all fields.";
    if (!isValidEmail(emailTrimmed)) return "Please enter a valid email.";
    if (formData.password.length < 6)
      return "Password must be at least 6 characters.";

    if (!isLogin) {
      if (!formData.confirmPassword) return "Please confirm your password.";
      if (formData.password !== formData.confirmPassword)
        return "Passwords do not match.";
    }

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

      // NOTE: your authApi expects (username, password)
      // We're passing email as "username" (fine as long as backend accepts it).
      const data = isLogin
        ? await login(emailTrimmed, formData.password)
        : await register(emailTrimmed, formData.password);

      // token may come from response OR already stored by login() OR under other keys
      const token =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        localStorage.getItem("token");

      if (!token) {
        setError(data?.message || "No token returned from server.");
        return;
      }

      // Ensure it is stored (safe even if login() already stored it)
      localStorage.setItem("token", token);

      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setToken?.(token);
      setFormData(initialState);
      onClose?.();
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setBusy?.(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
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

      {error ? (
        <p className="error" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

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

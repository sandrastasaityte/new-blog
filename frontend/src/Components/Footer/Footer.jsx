// src/Components/Footer/Footer.jsx

import React, { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

import linkedin from "../../assets/linkedin.png";
import whatsapp from "../../assets/whatsapp.png";
import instagram from "../../assets/instagram.png";
import telegram from "../../assets/telegram.png";

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function Footer() {
  const emailId = useId();
  const timerRef = useRef(null);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });

  // Cleanup timer
  useEffect(() => {
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, []);

  const autoClearSuccess = () => {
    timerRef.current = setTimeout(() => {
      setStatus((s) => ({ ...s, success: false }));
    }, 3000);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (status.loading) return;

    const trimmed = email.trim();

    if (!trimmed) {
      return setStatus({
        loading: false,
        success: false,
        error: "Please enter your email.",
      });
    }

    if (!isValidEmail(trimmed)) {
      return setStatus({
        loading: false,
        success: false,
        error: "Enter a valid email address.",
      });
    }

    try {
      setStatus({ loading: true, success: false, error: "" });

      // 👉 connect backend later
      await new Promise((res) => setTimeout(res, 700));

      setEmail("");
      setStatus({ loading: false, success: true, error: "" });
      autoClearSuccess();
    } catch {
      setStatus({
        loading: false,
        success: false,
        error: "Subscription failed. Try again.",
      });
    }
  };

  const onEmailChange = (e) => {
    setEmail(e.target.value);
    if (status.error) setStatus((s) => ({ ...s, error: "" }));
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About */}
        <div className="footer-section">
          <h3>About</h3>
          <p>
            My Creative Blog shares ideas, tech tips and inspiration for
            creators and developers.
          </p>
        </div>

        {/* Links */}
        <nav className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/blogs">Blogs</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </nav>

        {/* Contact */}
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: contact@mycreativeblog.com</p>
          <p>Phone: +44 123 456 789</p>

          <div className="social-icons">
            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
            >
              <img src={telegram} alt="Telegram" />
            </a>

            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <img src={instagram} alt="" loading="lazy" />
            </a>

            <a
              href="https://linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <img src={linkedin} alt="" loading="lazy" />
            </a>

            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <img src={whatsapp} alt="" loading="lazy" />
            </a>
          </div>
        </div>

        {/* Subscribe */}
        <div className="footer-section">
          <h3>Subscribe</h3>
          <p>Get latest posts in your inbox</p>

          <form
            className="subscribe-form"
            onSubmit={handleSubscribe}
            noValidate
          >
            <label htmlFor={emailId} className="sr-only">
              Email
            </label>

            <input
              id={emailId}
              type="email"
              placeholder="Your email"
              value={email}
              onChange={onEmailChange}
              disabled={status.loading}
              aria-invalid={!!status.error}
              required
            />

            <button disabled={status.loading}>
              {status.loading ? "Subscribing…" : "Subscribe"}
            </button>
          </form>

          {status.error && (
            <p className="subscribe-error" role="alert">
              {status.error}
            </p>
          )}

          {status.success && (
            <p className="subscribe-success" role="status">
              ✅ Subscribed successfully!
            </p>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} My Creative Blog
      </div>
    </footer>
  );
}

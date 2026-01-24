import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

import linkedin from "../../assets/linkedin.png";
import whatsapp from "../../assets/whatsapp.png";
import instagram from "../../assets/instagram.png";
import telegram from "../../assets/telegram.png";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (status.loading) return;

    const trimmed = email.trim();

    if (!trimmed) {
      setStatus({ loading: false, success: false, error: "Please enter your email." });
      return;
    }

    if (!validateEmail(trimmed)) {
      setStatus({ loading: false, success: false, error: "Please enter a valid email." });
      return;
    }

    try {
      setStatus({ loading: true, success: false, error: "" });

      // 🔌 Connect backend here later
      console.log("Subscribed email:", trimmed);

      // simulate API delay
      await new Promise((res) => setTimeout(res, 700));

      setEmail("");
      setStatus({ loading: false, success: true, error: "" });

      setTimeout(() => {
        setStatus((s) => ({ ...s, success: false }));
      }, 3000);
    } catch {
      setStatus({
        loading: false,
        success: false,
        error: "Subscription failed. Try again.",
      });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About */}
        <div className="footer-section about">
          <h3>About</h3>
          <p>
            My Creative Blog is a space to share ideas, stories, and tips.
            Connect, learn, and get inspired!
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/blogs">Blogs</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section contact">
          <h3>Contact</h3>
          <p>Email: contact@mycreativeblog.com</p>
          <p>Phone: +44 123 456 789</p>

          <div className="social-icons">
            <a href="https://t.me/" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <img src={telegram} alt="Telegram" />
            </a>

            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src={instagram} alt="Instagram" />
            </a>

            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <img src={linkedin} alt="LinkedIn" />
            </a>

            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <img src={whatsapp} alt="WhatsApp" />
            </a>
          </div>
        </div>

        {/* Subscribe */}
        <div className="footer-section subscribe">
          <h3>Subscribe</h3>
          <p>Get our latest posts directly in your inbox!</p>

          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status.error) setStatus((s) => ({ ...s, error: "" }));
              }}
              disabled={status.loading}
              required
            />
            <button type="submit" disabled={status.loading}>
              {status.loading ? "Subscribing…" : "Subscribe"}
            </button>
          </form>

          {status.error && (
            <p className="subscribe-error" role="alert">
              {status.error}
            </p>
          )}

          {status.success && (
            <p className="subscribe-success">Thanks for subscribing! 🎉</p>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} My Creative Blog. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

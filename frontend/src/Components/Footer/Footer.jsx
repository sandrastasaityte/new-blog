import React from "react";
import "./Footer.css";
import linkedin from "../../assets/linkedin.png";

import whatsapp from "../../assets/whatsapp.png";
import instagram from "../../assets/instagram.png";
import telegram from '../../assets/telegram.png'


const Footer = () => {
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
            <li><a href="/">Home</a></li>
            <li><a href="/blogs">Blogs</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section contact">
          <h3>Contact</h3>
          <p>Email: contact@mycreativeblog.com</p>
          <p>Phone: +44 123 456 789</p>
          <div className="social-icons">
         
             <a href="#"><img src={telegram} alt="telegram" /></a>
            <a href="#"><img src={instagram} alt="Instagram" /></a>
            <a href="#"><img src={linkedin} alt="LinkedIn" /></a>
            <a href="#"><img src={whatsapp} alt="WhatsApp" /></a> {/* optional */}
          </div>
        </div>

        {/* Subscribe */}
        <div className="footer-section subscribe">
          <h3>Subscribe</h3>
          <p>Get our latest posts directly in your inbox!</p>
          <form>
            <input type="email" placeholder="Your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} My Creative Blog. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

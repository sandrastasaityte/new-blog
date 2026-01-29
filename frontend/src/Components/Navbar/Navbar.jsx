import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import AuthModal from "../Auth/AuthModal"; // ✅ fixed path
import "./Navbar.css";

const Navbar = ({ token, setToken }) => {
  const [open, setOpen] = useState(false); // mobile menu
  const [authOpen, setAuthOpen] = useState(false); // AuthModal visibility
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"

  const location = useLocation();

  // Close mobile menu on route change
  React.useEffect(() => setOpen(false), [location.pathname]);

  const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main">
        <div className="logo">
          <Link to="/">MyEconomics</Link>
        </div>

        <ul className="nav-links">
          <li><NavLink to="/" className={linkClass} end>Home</NavLink></li>
          <li><NavLink to="/about" className={linkClass}>About</NavLink></li>
          <li><NavLink to="/blogs" className={linkClass}>Blogs</NavLink></li>
          <li><NavLink to="/contact" className={linkClass}>Contact</NavLink></li>
          {token && <li><NavLink to="/add-blog" className={linkClass}>Add Blog</NavLink></li>}
        </ul>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => token ? setToken(null) : setAuthOpen(true)}
            aria-label={token ? "Logout" : "Login / Sign up"}
          >
            {token ? "Logout" : <FaUserCircle size={28} />}
          </button>

          <button
            type="button"
            className="icon-btn nav-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {open && (
          <div className="nav-mobile-overlay open">
            <div className="nav-mobile">
              <NavLink to="/" className={linkClass} end>Home</NavLink>
              <NavLink to="/about" className={linkClass}>About</NavLink>
              <NavLink to="/blogs" className={linkClass}>Blogs</NavLink>
              <NavLink to="/contact" className={linkClass}>Contact</NavLink>
              {token && <NavLink to="/add-blog" className={linkClass}>Add Blog</NavLink>}

              <div className="nav-mobile-actions">
                <button
                  className="auth-btn"
                  onClick={() => token ? setToken(null) : setAuthOpen(true)}
                  type="button"
                >
                  {token ? "Logout" : "Login / Sign up"}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      {authOpen && (
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          defaultMode={authMode}
          setToken={setToken}
        />
      )}
    </>
  );
};

export default Navbar;

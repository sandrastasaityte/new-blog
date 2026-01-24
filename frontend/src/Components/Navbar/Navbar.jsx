import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ token, onLogin, onLogout }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

  const closeIfOverlay = (e) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main">
      <div className="logo">
        <Link to="/">MyEconomics</Link>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
        </li>
        <li>
          <NavLink to="/blogs" className={linkClass}>
            Blogs
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
        </li>
        {token ? (
          <li>
            <NavLink to="/add-blog" className={linkClass}>
              Add Blog
            </NavLink>
          </li>
        ) : null}
      </ul>

      <div className="nav-actions">
        {token ? (
          <button className="auth-btn" onClick={onLogout} type="button">
            Logout
          </button>
        ) : (
          <button
            type="button"
            className="icon-btn"
            onClick={onLogin}
            aria-label="Login or sign up"
            title="Login / Sign up"
          >
            <FaUserCircle size={28} />
          </button>
        )}

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

      {open ? (
        <div
          className="nav-mobile-overlay"
          onMouseDown={closeIfOverlay}
          role="dialog"
          aria-label="Menu"
        >
          <div className="nav-mobile" onMouseDown={(e) => e.stopPropagation()}>
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
            <NavLink to="/blogs" className={linkClass}>
              Blogs
            </NavLink>
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>
            {token ? (
              <NavLink to="/add-blog" className={linkClass}>
                Add Blog
              </NavLink>
            ) : null}

            <div className="nav-mobile-actions">
              {token ? (
                <button className="auth-btn" onClick={onLogout} type="button">
                  Logout
                </button>
              ) : (
                <button className="auth-btn" onClick={onLogin} type="button">
                  Login / Sign up
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;

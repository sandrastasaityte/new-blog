// src/Components/Navbar/Navbar.jsx

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import AuthModal from "../Auth/AuthModal";
import "./Navbar.css";

export default function Navbar({ token, setToken }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  /* ---------------- Navigation Config ---------------- */
  const navItems = useMemo(() => [
    { to: "/", label: "Home", end: true },
    { to: "/about", label: "About" },
    { to: "/blogs", label: "Blogs" },
    { to: "/contact", label: "Contact" }
  ], []);

  /* ---------------- Close menus on route change ---------------- */
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  /* ---------------- Sticky Navbar (Optimised) ---------------- */
  useEffect(() => {
    const onScroll = () => {
      const shouldScroll = window.scrollY > 20;
      setScrolled(prev => (prev !== shouldScroll ? shouldScroll : prev));
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------------- Lock Body Scroll ---------------- */
  useEffect(() => {
    document.body.style.overflow =
      mobileOpen || authOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [mobileOpen, authOpen]);

  /* ---------------- Click Outside Dropdown ---------------- */
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  /* ---------------- ESC Close ---------------- */
  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setDropdownOpen(false);
        setAuthOpen(false);
      }
    };

    document.addEventListener("keydown", escHandler);
    return () => document.removeEventListener("keydown", escHandler);
  }, []);

  /* ---------------- Logout ---------------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken?.("");
    setDropdownOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? "active" : ""}`;

  /* ---------------- Render Nav Links ---------------- */
  const renderLinks = () => (
    <>
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={linkClass}
          end={item.end}
        >
          {item.label}
        </NavLink>
      ))}

      {token && (
        <NavLink to="/add-blog" className={linkClass}>
          Add Blog
        </NavLink>
      )}
    </>
  );

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>

        {/* Logo */}
        <div className="logo">
          <Link to="/">MyEconomics</Link>
        </div>

        {/* Desktop Links */}
        <ul className="nav-links">
          {renderLinks()}
        </ul>

        {/* Actions */}
        <div className="nav-actions">

          {/* User Dropdown */}
          <div className="user-menu" ref={dropdownRef}>
            <button
              className="icon-btn"
              onClick={() =>
                token
                  ? setDropdownOpen(v => !v)
                  : setAuthOpen(true)
              }
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
            >
              <FaUserCircle size={26} />
            </button>

            {token && dropdownOpen && (
              <div className="user-dropdown" role="menu">
                <button
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="icon-btn nav-toggle"
            onClick={() => setMobileOpen(v => !v)}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>

        </div>

        {/* Mobile Menu */}
        <div
          className={`nav-mobile-overlay ${mobileOpen ? "open" : ""}`}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="nav-mobile"
            onClick={(e) => e.stopPropagation()}
          >
            {renderLinks()}

            <button
              className="auth-btn mobile-only"
              onClick={() =>
                token ? handleLogout() : setAuthOpen(true)
              }
            >
              {token ? "Logout" : "Login / Sign up"}
            </button>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {authOpen && (
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          setToken={setToken}
        />
      )}
    </>
  );
}

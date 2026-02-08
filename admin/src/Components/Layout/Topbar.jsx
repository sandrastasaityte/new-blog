import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import "./topbar.css";

export default function Topbar({
  collapsed = false,
  onToggleCollapse = () => {},
  onOpenMobileMenu = () => {},
  mobileDrawerId = "admin-mobile-drawer",
  isMobileMenuOpen = false,
  contentId = "admin-content",
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  /* --------------------------------------------
     LOGOUT
  --------------------------------------------- */

  const onLogout = useCallback(() => {
    try {
      logout?.();
    } finally {
      navigate("/login", { replace: true });
    }
  }, [logout, navigate]);

  /* --------------------------------------------
     CLOSE MENU ON OUTSIDE CLICK + ESC
  --------------------------------------------- */

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  /* --------------------------------------------
     KEYBOARD NAVIGATION INSIDE MENU
  --------------------------------------------- */

  useEffect(() => {
    if (!menuOpen) return;

    const menu = menuRef.current;
    if (!menu) return;

    const items = menu.querySelectorAll('[role="menuitem"]');

    if (items.length > 0) {
      items[0].focus();
    }

    const handleKeys = (e) => {
      const items = menu.querySelectorAll('[role="menuitem"]');
      if (!items.length) return;

      const active = document.activeElement;
      const index = Array.from(items).indexOf(active);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = items[index + 1] || items[0];
        next.focus();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = items[index - 1] || items[items.length - 1];
        prev.focus();
      }

      if (e.key === "Tab") {
        setMenuOpen(false);
      }
    };

    menu.addEventListener("keydown", handleKeys);
    return () => menu.removeEventListener("keydown", handleKeys);
  }, [menuOpen]);

  return (
    <header className="admin-topbar" role="banner">
      
      {/* Skip link */}
      <a className="tb-skip" href={`#${contentId}`}>
        Skip to content
      </a>

      {/* LEFT */}
      <div className="tb-left">

        {/* MOBILE MENU */}
        <button
          className="tb-icon-btn tb-mobile-only"
          type="button"
          onClick={onOpenMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-controls={mobileDrawerId}
          aria-expanded={isMobileMenuOpen}
        >
          ☰
        </button>

        {/* DESKTOP COLLAPSE */}
        <button
          className="tb-icon-btn tb-desktop-only"
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "»" : "«"}
        </button>

        <h1 className="tb-title">Admin Panel</h1>
      </div>

      {/* RIGHT */}
      <div className="tb-right">

        {/* Notifications */}
        <button
          className="tb-icon-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          
        </button>

        {/* USER MENU */}
        <div className="tb-user" ref={menuRef}>

          <button
            ref={buttonRef}
            className="tb-user-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls="user-menu"
          >
            <div className="tb-avatar">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>

            <span className="tb-username">
              {user?.username || "User"}
            </span>
          </button>

          {menuOpen && (
            <div
              id="user-menu"
              className="tb-dropdown"
              role="menu"
            >
              <button
                role="menuitem"
                className="tb-dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
              >
                Profile
              </button>

              <button
                role="menuitem"
                className="tb-dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
              >
                Settings
              </button>

              <hr className="tb-divider" />

              <button
                role="menuitem"
                className="tb-dropdown-item danger"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}

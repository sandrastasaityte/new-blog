import React, { useCallback } from "react";
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

  // Logout handler
  const onLogout = useCallback(() => {
    try {
      logout?.();
    } finally {
      navigate("/login", { replace: true });
    }
  }, [logout, navigate]);

  return (
    <header className="admin-topbar" role="banner">
      {/* Skip link for keyboard users */}
      <a className="tb-skip" href={`#${contentId}`}>
        Skip to content
      </a>

      <div className="tb-left">
        {/* Mobile menu toggle */}
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

        {/* Sidebar collapse toggle */}
        <button
          className="tb-icon-btn tb-desktop-only"
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "»" : "«"}
        </button>

        {/* Title */}
        <div className="tb-title">Admin Panel</div>
      </div>

      <div className="tb-right">
        {/* User greeting */}
        <div className="tb-pill">
          {user?.username ? `Hi, ${user.username}` : "Welcome"}
        </div>

        {/* Logout */}
        <button className="tb-btn" onClick={onLogout} type="button">
          Logout
        </button>
      </div>
    </header>
  );
}

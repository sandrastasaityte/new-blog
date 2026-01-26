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

  // optional: where the skip link should jump
  contentId = "admin-content",
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

        <button
          className="tb-icon-btn tb-desktop-only"
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "»" : "«"}
        </button>

        <div className="tb-title">Admin Panel</div>
      </div>

      <div className="tb-right">
        <div className="tb-pill">
          {user?.username ? `Hi, ${user.username}` : "Welcome"}
        </div>

        <button className="tb-btn" onClick={onLogout} type="button">
          Logout
        </button>
      </div>
    </header>
  );
}

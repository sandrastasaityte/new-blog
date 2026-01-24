import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import "./topbar.css";

export default function Topbar({
  collapsed,
  onToggleCollapse,
  onOpenMobileMenu,

  // ✅ optional a11y props (safe defaults)
  mobileDrawerId = "admin-mobile-drawer",
  isMobileMenuOpen = false,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return (
    <header className="admin-topbar" role="banner">
      <div className="tb-left">
        <button
          className="tb-icon-btn tb-mobile-only"
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
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

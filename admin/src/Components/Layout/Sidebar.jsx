import React from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

const NAV_ITEMS = [
  { to: "/admin", end: true, icon: "🏠", label: "Dashboard" },
  { to: "/admin/posts", icon: "📰", label: "Posts" },
  { to: "/admin/add-post", icon: "➕", label: "Add Post" },
];

export default function Sidebar({ collapsed = false, onNavigate }) {
  const linkClass = ({ isActive }) => `sb-link ${isActive ? "active" : ""}`;

  const handleNavClick = (e) => {
    // Only close drawer for normal left-click navigation
    if (e.button !== 0) return; // not left click
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // modified click (new tab etc.)
    onNavigate?.();
  };

  return (
    <nav
      className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}
      aria-label="Admin navigation"
    >
      {/* Brand */}
      <div className="sb-brand">
        <NavLink
          to="/admin"
          end
          className="sb-brand-link"
          onClick={handleNavClick}
          aria-label={collapsed ? "Admin dashboard" : undefined}
          title={collapsed ? "Admin dashboard" : undefined}
        >
          <div className="sb-logo" aria-hidden="true">
            A
          </div>
          {!collapsed && <div className="sb-name">Admin</div>}
        </NavLink>
      </div>

      {/* Links */}
      <div className="sb-section">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkClass}
            onClick={handleNavClick}
            aria-label={collapsed ? item.label : undefined}
            data-tip={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                {/* aria-current helps screen readers */}
                {isActive ? <span className="sr-only" aria-current="page" /> : null}
                <span className="sb-ico" aria-hidden="true">
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="sb-footer">{!collapsed && <div className="sb-muted">v1.0</div>}</div>
    </nav>
  );
}

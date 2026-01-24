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

  const handleClick = (e) => {
    // Let normal navigation happen, then close mobile drawer
    onNavigate?.();
  };

  return (
    <nav className={`admin-sidebar ${collapsed ? "collapsed" : ""}`} aria-label="Admin navigation">
      <div className="sb-brand">
        <div className="sb-logo" aria-hidden="true">A</div>
        {!collapsed && <div className="sb-name">Admin</div>}
      </div>

      <div className="sb-section">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkClass}
            onClick={handleClick}
            aria-label={collapsed ? item.label : undefined}
            data-tip={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
          >
            <span className="sb-ico" aria-hidden="true">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>

      <div className="sb-footer">
        {!collapsed && <div className="sb-muted">v1.0</div>}
      </div>
    </nav>
  );
}

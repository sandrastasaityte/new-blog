import React, { memo, useCallback, useId } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./sidebar.css";

/* --------------------------------------------
   Navigation Config
--------------------------------------------- */

const NAV_ITEMS = Object.freeze([
  { to: "/admin", end: true, icon: "🏠", label: "Dashboard" },
  { to: "/admin/posts", icon: "📰", label: "Posts" },
  { to: "/admin/add-post", icon: "➕", label: "Add Post" },
]);

/* --------------------------------------------
   Component
--------------------------------------------- */

function Sidebar({ collapsed = false, onNavigate }) {
  const navId = useId();
  const location = useLocation();

  /* Close mobile drawer only on normal click */
  const handleNavClick = useCallback(
    (e) => {
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      onNavigate?.();
    },
    [onNavigate]
  );

  const linkClass = ({ isActive }) =>
    `sb-link ${isActive ? "active" : ""}`;

  /* ⭐ FILTER OUT CURRENT PAGE */
  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.end) {
      return location.pathname !== item.to;
    }

    return !location.pathname.startsWith(item.to);
  });

  return (
    <nav
      id={navId}
      className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}
      aria-label="Admin navigation"
    >

      {/* ================= BRAND ================= */}

      <div className="sb-brand">
        <NavLink
          to="/admin"
          end
          className="sb-brand-link"
          onClick={handleNavClick}
          aria-label="Admin dashboard"
          title={collapsed ? "Admin dashboard" : undefined}
        >
          <div className="sb-logo" aria-hidden="true">
            A
          </div>

          {!collapsed && (
            <span className="sb-name">Admin</span>
          )}
        </NavLink>
      </div>

      {/* ================= NAV LINKS ================= */}

      <ul className="sb-section" role="list">
        {visibleItems.map((item) => (
          <li key={item.to} className="sb-item">
            <NavLink
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={handleNavClick}
              aria-label={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
              data-tooltip={collapsed ? item.label : undefined}
            >
              <span className="sb-ico" aria-hidden="true">
                {item.icon}
              </span>

              {!collapsed && (
                <span className="sb-label">
                  {item.label}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* ================= FOOTER ================= */}

      <footer className="sb-footer">
        {!collapsed && (
          <div className="sb-muted">
            v1.0
          </div>
        )}
      </footer>
    </nav>
  );
}

export default memo(Sidebar);

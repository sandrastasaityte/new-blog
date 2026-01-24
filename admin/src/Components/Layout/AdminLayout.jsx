import React, { useEffect, useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./layout.css";

const LS_KEY = "admin_sidebar_collapsed_v1";

function readCollapsed() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : false;
  } catch {
    return false;
  }
}

export default function AdminLayout() {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => readCollapsed());

  // persist collapse
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(collapsed));
    } catch {}
  }, [collapsed]);

  // close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // esc closes drawer
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleCloseMobile = useCallback(() => setSidebarOpen(false), []);
  const handleOpenMobile = useCallback(() => setSidebarOpen(true), []);
  const handleToggleCollapse = useCallback(() => setCollapsed((v) => !v), []);

  return (
    <div className={`admin-shell ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="admin-sidebar-desktop">
        <Sidebar collapsed={collapsed} />
      </aside>

      <div
        className={`admin-sidebar-mobile ${sidebarOpen ? "open" : ""}`}
        aria-hidden={!sidebarOpen}
      >
        <button
          className="admin-overlay"
          onClick={handleCloseMobile}
          aria-label="Close menu"
          type="button"
        />

        <div
          id="admin-mobile-drawer"
          className="admin-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
        >
          <Sidebar collapsed={false} onNavigate={handleCloseMobile} />
        </div>
      </div>

      <div className="admin-main">
        <Topbar
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobileMenu={handleOpenMobile}
          // Optional: if your Topbar has a button, wire these:
          // mobileDrawerId="admin-mobile-drawer"
        />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

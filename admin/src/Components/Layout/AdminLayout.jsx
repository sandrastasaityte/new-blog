// src/components/layout/AdminLayout.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./layout.css";

const LS_KEY = "admin_sidebar_collapsed_v1";

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || false; } 
    catch { return false; }
  });

  const drawerRef = useRef(null);
  const lastFocusRef = useRef(null);
  const prevOverflowRef = useRef("");
  const prevPaddingRightRef = useRef("");

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(collapsed)); }, [collapsed]);
  useEffect(() => setSidebarOpen(false), [location.pathname]);
  const handleCloseMobile = useCallback(() => setSidebarOpen(false), []);
  const handleOpenMobile = useCallback(() => setSidebarOpen(true), []);
  const handleToggleCollapse = useCallback(() => setCollapsed((v) => !v), []);

  // Focus trap + ESC
  useEffect(() => {
    if (!sidebarOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    lastFocusRef.current = document.activeElement;
    const focusables = drawer.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0], last = focusables[focusables.length - 1];
    (first || drawer).focus?.();

    const onKeyDown = (e) => {
      if (e.key === "Escape") { e.preventDefault(); setSidebarOpen(false); return; }
      if (e.key !== "Tab") return;
      const active = document.activeElement;
      if (e.shiftKey) { if (active === first || !drawer.contains(active)) { e.preventDefault(); last.focus(); } }
      else { if (active === last) { e.preventDefault(); first.focus(); } }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  // restore focus
  useEffect(() => { if (!sidebarOpen && lastFocusRef.current?.focus) lastFocusRef.current.focus(); lastFocusRef.current = null; }, [sidebarOpen]);

  // lock scroll
  useEffect(() => {
    if (sidebarOpen) {
      prevOverflowRef.current = document.body.style.overflow || "";
      prevPaddingRightRef.current = document.body.style.paddingRight || "";
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = prevOverflowRef.current || "";
      document.body.style.paddingRight = prevPaddingRightRef.current || "";
    }
    return () => { document.body.style.overflow = prevOverflowRef.current || ""; document.body.style.paddingRight = prevPaddingRightRef.current || ""; };
  }, [sidebarOpen]);

  return (
    <div className={`admin-shell ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="admin-sidebar-desktop"><Sidebar collapsed={collapsed} /></aside>
      <div className={`admin-sidebar-mobile ${sidebarOpen ? "open" : ""}`} aria-hidden={!sidebarOpen}>
        <button className="admin-overlay" onClick={handleCloseMobile} aria-label="Close menu" />
        <div id="admin-mobile-drawer" className="admin-drawer" role="dialog" aria-modal="true" ref={drawerRef} tabIndex={-1}>
          <Sidebar collapsed={false} onNavigate={handleCloseMobile} />
        </div>
      </div>
      <div className="admin-main">
        <Topbar
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobileMenu={() => setSidebarOpen((v) => !v)}
          mobileDrawerId="admin-mobile-drawer"
          isMobileMenuOpen={sidebarOpen}
        />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

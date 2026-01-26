import React, { useEffect, useCallback, useState, useRef } from "react";
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

  // refs for a11y + scroll locking
  const drawerRef = useRef(null);
  const lastFocusRef = useRef(null);
  const prevOverflowRef = useRef("");
  const prevPaddingRightRef = useRef("");

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

  const handleCloseMobile = useCallback(() => setSidebarOpen(false), []);
  const handleOpenMobile = useCallback(() => setSidebarOpen(true), []);
  const handleToggleCollapse = useCallback(() => setCollapsed((v) => !v), []);

  // ESC + focus trap (only when open)
  useEffect(() => {
    if (!sidebarOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    // remember focus and move focus into drawer
    lastFocusRef.current = document.activeElement;
    const focusables = drawer.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    (first || drawer).focus?.();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setSidebarOpen(false);
        return;
      }

      if (e.key !== "Tab") return;

      // trap tab inside drawer
      if (!focusables.length) {
        e.preventDefault();
        drawer.focus?.();
        return;
      }

      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !drawer.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  // restore focus after close
  useEffect(() => {
    if (sidebarOpen) return;
    const el = lastFocusRef.current;
    if (el && typeof el.focus === "function") {
      el.focus();
    }
    lastFocusRef.current = null;
  }, [sidebarOpen]);

  // lock body scroll when drawer open (+ prevent layout shift due to scrollbar)
  useEffect(() => {
    if (sidebarOpen) {
      prevOverflowRef.current = document.body.style.overflow || "";
      prevPaddingRightRef.current = document.body.style.paddingRight || "";

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = prevOverflowRef.current || "";
      document.body.style.paddingRight = prevPaddingRightRef.current || "";
    }

    return () => {
      document.body.style.overflow = prevOverflowRef.current || "";
      document.body.style.paddingRight = prevPaddingRightRef.current || "";
    };
  }, [sidebarOpen]);

  return (
    <div className={`admin-shell ${collapsed ? "is-collapsed" : ""}`}>
      {/* Sidebar (desktop) */}
      <aside className="admin-sidebar-desktop">
        <Sidebar collapsed={collapsed} />
      </aside>

      {/* Sidebar (mobile drawer) */}
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
          ref={drawerRef}
          tabIndex={-1}
        >
          <Sidebar collapsed={false} onNavigate={handleCloseMobile} />
        </div>
      </div>

      {/* Main */}
      <div className="admin-main">
        <Topbar
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobileMenu={() => setSidebarOpen((v) => !v)} // toggle
          mobileDrawerId="admin-mobile-drawer"
          isMobileMenuOpen={sidebarOpen}
        />

        <main className="admin-content" id="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

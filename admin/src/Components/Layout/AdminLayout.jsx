import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./layout.css";

const LS_KEY = "admin_sidebar_collapsed_v1";

export default function AdminLayout() {
  const location = useLocation();
  const drawerId = useId();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const drawerRef = useRef(null);
  const lastFocusRef = useRef(null);

  // -----------------------------
  // Persist collapsed state
  // -----------------------------
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // -----------------------------
  // Close mobile sidebar on route change
  // -----------------------------
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // -----------------------------
  // Toggle Handlers
  // -----------------------------
  const toggleMobile = useCallback(() => {
    setIsSidebarOpen((v) => !v);
  }, []);

  const closeMobile = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((v) => !v);
  }, []);

  // ---------------------------------------------------
  // Focus trap + ESC close
  // ---------------------------------------------------
  useEffect(() => {
    if (!isSidebarOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    lastFocusRef.current = document.activeElement;

    const getFocusables = () =>
      drawer.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );

    const focusables = getFocusables();

    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      drawer.setAttribute("tabindex", "0");
      drawer.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMobile();
        return;
      }

      if (e.key !== "Tab") return;

      const focusables = getFocusables();
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, closeMobile]);

  // ---------------------------------------------------
  // Restore focus when drawer closes
  // ---------------------------------------------------
  useEffect(() => {
    if (!isSidebarOpen && lastFocusRef.current?.focus) {
      lastFocusRef.current.focus();
      lastFocusRef.current = null;
    }
  }, [isSidebarOpen]);

  // ---------------------------------------------------
  // Body scroll lock
  // ---------------------------------------------------
  useEffect(() => {
    if (!isSidebarOpen) return;

    const originalOverflow = document.body.style.overflow;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className={`admin-shell ${isCollapsed ? "is-collapsed" : ""}`}>
      
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar-desktop">
        <Sidebar collapsed={isCollapsed} />
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`admin-sidebar-mobile ${isSidebarOpen ? "open" : ""}`}
        aria-hidden={!isSidebarOpen}
        inert={!isSidebarOpen ? "" : undefined}
      >
        <button
          type="button"
          className="admin-overlay"
          aria-label="Close menu"
          onClick={closeMobile}
        />

        <div
          id={drawerId}
          className="admin-drawer"
          role="dialog"
          aria-modal="true"
          ref={drawerRef}
        >
          <Sidebar collapsed={false} onNavigate={closeMobile} />
        </div>
      </div>

      {/* Main */}
      <div className="admin-main">
        <Topbar
          collapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          onOpenMobileMenu={toggleMobile}
          mobileDrawerId={drawerId}
          isMobileMenuOpen={isSidebarOpen}
        />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

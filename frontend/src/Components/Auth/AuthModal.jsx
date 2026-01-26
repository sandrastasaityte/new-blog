import React, { useEffect, useId, useRef, useState } from "react";
import Login from "../Login/Login";
import SignUp from "../SignUp/SignUp";
import "./AuthModal.css";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
  setToken,
}) {
  const [mode, setMode] = useState(defaultMode); // "login" | "signup"
  const [busy, setBusy] = useState(false);

  const modalRef = useRef(null);
  const lastActiveRef = useRef(null);
  const busyRef = useRef(false);

  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  // Reset mode when opening (only when opening, not on every defaultMode change)
  useEffect(() => {
    if (isOpen) setMode(defaultMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    lastActiveRef.current = document.activeElement;

    const t = setTimeout(() => {
      const root = modalRef.current;
      if (!root) return;
      const first = root.querySelector(FOCUSABLE);
      first?.focus?.();
    }, 0);

    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const getFocusables = () => {
      const root = modalRef.current;
      if (!root) return [];
      return Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (el) =>
          !el.hasAttribute("disabled") &&
          el.getAttribute("aria-hidden") !== "true" &&
          el.offsetParent !== null
      );
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (!busyRef.current) onClose?.();
        return;
      }

      if (e.key !== "Tab") return;

      const root = modalRef.current;
      if (!root) return;

      const focusables = getFocusables();
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      const activeInside = root.contains(active);

      if (e.shiftKey) {
        if (!activeInside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!activeInside || active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;

      lastActiveRef.current?.focus?.();

      setBusy(false);
      busyRef.current = false;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLogin = mode === "login";

  const handleOverlayPointerDown = (e) => {
    if (e.target === e.currentTarget && !busyRef.current) onClose?.();
  };

  const handleSuccess = () => onClose?.();

  return (
    <div
      className="modal-overlay"
      onPointerDown={handleOverlayPointerDown}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="modal auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="sr-only">
          {isLogin ? "Login" : "Sign up"}
        </h2>
        <p id={descId} className="sr-only">
          Authenticate to continue.
        </p>

        <button
          className="close-btn"
          onClick={() => !busyRef.current && onClose?.()}
          aria-label="Close"
          type="button"
          disabled={busy}
        >
          ×
        </button>

        {isLogin ? (
          <Login
            onSuccess={handleSuccess}
            setBusy={setBusy}
            setToken={setToken}
            closePopup={onClose}
          />
        ) : (
          <SignUp
            onSuccess={handleSuccess}
            setBusy={setBusy}
            setToken={setToken}
            closePopup={onClose}
          />
        )}

        <p className="switch-text" aria-live="polite">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="switch-link"
            onClick={() => setMode(isLogin ? "signup" : "login")}
            disabled={busy}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

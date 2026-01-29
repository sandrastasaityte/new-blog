import React, { useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function ProtectedRoute({ token, onRequireAuth, children }) {
  const location = useLocation();
  const authToken = token || localStorage.getItem("token");
  const askedRef = useRef(false);

  // Trigger auth prompt only once when no token
  useEffect(() => {
    if (!authToken && !askedRef.current) {
      askedRef.current = true;
      onRequireAuth?.(location);
    }
  }, [authToken, location, onRequireAuth]);

  // Fallback UI when user is not authenticated
  const fallbackUI = useMemo(
    () => (
      <div style={{ padding: 24, textAlign: "center", opacity: 0.7 }}>
        <h3>Authentication required</h3>
        <p>Please log in to access this page.</p>
      </div>
    ),
    []
  );

  if (!authToken) return fallbackUI;

  return children;
}

// src/Components/ProtectedRoute.jsx
import React, { useEffect, useRef } from "react";
import { useLocation, Navigate } from "react-router-dom";

export default function ProtectedRoute({ token, onRequireAuth, children, loginPath = "/login" }) {
  const location = useLocation();
  const authToken = token || localStorage.getItem("token");
  const askedRef = useRef(false);

  // Trigger auth prompt callback only once
  useEffect(() => {
    if (!authToken && !askedRef.current) {
      askedRef.current = true;
      onRequireAuth?.(location);
    }
  }, [authToken, location, onRequireAuth]);

  // If not authenticated, redirect to login with `from` state
  if (!authToken) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Render protected content
  return children;
}

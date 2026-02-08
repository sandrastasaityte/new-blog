// src/Components/ProtectedRoute.jsx

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function ProtectedRoute({
  children,

  /* Redirect destination */
  redirectTo = "/login",

  /* Optional roles: ["admin"] */
  roles = null,

  /* Loading UI */
  fallback = (
    <div className="route-loading">
      Checking session…
    </div>
  ),

  /* Unauthorized UI */
  unauthorizedFallback = (
    <div style={{ padding: 20 }}>
      <h3>Access denied</h3>
      <p>You do not have permission to view this page.</p>
    </div>
  ),
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  /* -----------------------
     Loading state
  ------------------------ */

  if (isLoading) return fallback;

  /* -----------------------
     Not authenticated
  ------------------------ */

  if (!user) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{
          from: location
        }}
      />
    );
  }

  /* -----------------------
     Role protection
  ------------------------ */

  if (roles && !roles.includes(user.role)) {
    return unauthorizedFallback;
  }

  /* -----------------------
     Success
  ------------------------ */

  return children;
}

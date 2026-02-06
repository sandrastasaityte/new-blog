// src/Components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function ProtectedRoute({
  children,
  redirectTo = "/login",
  fallback = (
    <div style={{ padding: 18, display: "grid", placeItems: "center" }}>
      Checking session…
    </div>
  ),
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loader while auth state is being determined
  if (isLoading) return fallback;

  // Redirect unauthorized users
  if (!user) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    );
  }

  // Authorized users can access children
  return children;
}

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
  const { isAuthed, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return fallback;

  if (!isAuthed) {
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

  return children;
}

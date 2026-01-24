import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthed, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null; // or a loader component

  if (!isAuthed) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
}

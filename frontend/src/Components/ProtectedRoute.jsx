// src/components/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ProtectedRoute = ({ token, onRequireAuth, children }) => {
  const location = useLocation();
  const authToken = token || localStorage.getItem("token");

  useEffect(() => {
    if (!authToken) {
      onRequireAuth?.(location);
    }
  }, [authToken, location, onRequireAuth]);

  if (!authToken) {
    return (
      <div style={{ padding: 24, textAlign: "center", opacity: 0.7 }}>
        <h3>Authentication required</h3>
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

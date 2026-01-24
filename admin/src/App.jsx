import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { AuthProvider } from "./Context/AuthContext";
import { PostsProvider } from "./Context/PostsContext";

import ProtectedRoute from "./Components/ProtectedRoute";
import AdminLayout from "./Components/Layout/AdminLayout";
import ErrorBoundary from "./Components/ErrorBoundary"; // adjust path to yours

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import AddPost from "./pages/AddPost";

function AppRoutes() {
  const location = useLocation();

  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<Posts />} />
          <Route path="add-post" element={<AddPost />} />
        </Route>

        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PostsProvider>
          <AppRoutes />
        </PostsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

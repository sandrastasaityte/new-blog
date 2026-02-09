// src/App.jsx
import React, { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import Home from "./Components/Home/Home";
import Blogs from "./Components/Blogs/Blogs";
import AddBlog from "./Components/AddBlog/AddBlog";
import About from "./Components/About/About";
import Contact from "./Components/Contact/Contact";
import BlogDetails from "./Components/BlogDetails/BlogDetails";
import AuthModal from "./Components/Auth/AuthModal";
import ProtectedRoute from "./Components/ProtectedRoute";

/* ======================================================== */

function AppRoutes({ token, onRequireAuth }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/blog/:id" element={<BlogDetails />} />

      <Route
        path="/add-blog"
        element={
          <ProtectedRoute token={token} onRequireAuth={onRequireAuth}>
            <AddBlog />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/* ======================================================== */

function Shell({ token, setToken }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [authOpen, setAuthOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    navigate("/", { replace: true });
  }, [navigate, setToken]);

  const onRequireAuth = useCallback(
    (loc) => {
      const target =
        (loc?.pathname || location.pathname) +
        (loc?.search || location.search || "");
      setRedirectTo(target);
      setAuthOpen(true);
    },
    [location]
  );

  const handleSetToken = useCallback(
    (newToken) => {
      if (!newToken) return;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setAuthOpen(false);

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        setRedirectTo(null);
      }
    },
    [navigate, redirectTo, setToken]
  );

  return (
    <>
      <Navbar token={token} setToken={logout} />
      <AppRoutes token={token} onRequireAuth={onRequireAuth} />
      <Footer />

      {authOpen && (
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          setToken={handleSetToken}
        />
      )}
    </>
  );
}

/* ======================================================== */

export default function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );

  return (
    <Router>
      <Shell token={token} setToken={setToken} />
    </Router>
  );
}

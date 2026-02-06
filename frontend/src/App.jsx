import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

// Context
import { PostsProvider } from "./Context/PostsContext";

// Components
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

// ---------------- Routes ----------------
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

// ---------------- Shell ----------------
function Shell({ token, setToken }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [authOpen, setAuthOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);

  // Keep token in sync with localStorage
  useEffect(() => {
    const onStorage = (e) => e.key === "token" && setToken(e.newValue || "");
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setToken]);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    navigate("/", { replace: true });
  };

  const onRequireAuth = (loc) => {
    const target = (loc?.pathname || location.pathname) + (loc?.search || location.search || "");
    setRedirectTo(target);
    setAuthOpen(true);
  };

  const handleSetToken = (t) => {
    setToken(t || "");
    setAuthOpen(false);
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
      setRedirectTo(null);
    }
  };

  return (
    <>
      <Navbar token={token} setToken={setToken} /> {/* ✅ Pass setToken here */}
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

// ---------------- App ----------------
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  return (
    <PostsProvider>
      <Router>
        <Shell token={token} setToken={setToken} />
      </Router>
    </PostsProvider>
  );
}

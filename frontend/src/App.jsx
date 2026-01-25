// src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import Home from "./Components/Home/Home";
import Blogs from "./Components/Blogs/Blogs";
import Contact from "./Components/Contact/Contact";
import About from "./Components/About/About";
import AddBlog from "./Components/AddBlog/AddBlog";

import AuthModal from "./Components/Auth/AuthModal";
import ProtectedRoute from "./Components/ProtectedRoute";

import PostsProvider from "./Context/PostsContext";

// Helper component so we can use ProtectedRoute cleanly
function AppRoutes({ token, onRequireAuth }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />

      <Route
        path="/add-blog"
        element={
          <ProtectedRoute token={token} onRequireAuth={onRequireAuth}>
            <AddBlog />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [authOpen, setAuthOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
  };

  const handleRequireAuth = (location) => {
    // remember where user wanted to go
    setRedirectTo(location?.pathname || "/");
    setAuthOpen(true);
  };

  return (
    <PostsProvider>
      <Router>
        <AppShell
          token={token}
          setToken={setToken}
          authOpen={authOpen}
          setAuthOpen={setAuthOpen}
          redirectTo={redirectTo}
          setRedirectTo={setRedirectTo}
          onLogout={handleLogout}
          onRequireAuth={handleRequireAuth}
        />
      </Router>
    </PostsProvider>
  );
}

function AppShell({
  token,
  setToken,
  authOpen,
  setAuthOpen,
  redirectTo,
  setRedirectTo,
  onLogout,
  onRequireAuth,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSetToken = (t) => {
    setToken(t);

    // ✅ After login:
    // - If user was redirected by ProtectedRoute -> go there
    // - Otherwise just stay on the current page
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
      setRedirectTo(null);
    } else {
      // stay where you are (no need to navigate if already there)
      navigate(location.pathname, { replace: true });
    }

    setAuthOpen(false);
  };

  return (
    <>
      <Navbar
        token={token}
        onLogin={() => setAuthOpen(true)}
        onLogout={onLogout}
      />

      {/* ✅ token is passed */}
      <AppRoutes token={token} onRequireAuth={onRequireAuth} />

      <Footer />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        setToken={handleSetToken}
      />
    </>
  );
}

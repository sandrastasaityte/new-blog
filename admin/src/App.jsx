import React, { Suspense, lazy, useMemo } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import { AuthProvider } from "./Context/AuthContext";
import { PostsProvider } from "./Context/PostsContext";

import ProtectedRoute from "./Components/ProtectedRoute";
import AdminLayout from "./Components/Layout/AdminLayout";
import ErrorBoundary from "./Components/ErrorBoundary";

/* -----------------------------------------
   Lazy Pages
----------------------------------------- */

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Posts = lazy(() => import("./pages/Posts"));
const AddPost = lazy(() => import("./pages/AddPost"));

/* -----------------------------------------
   Route Constants (Scalable Pattern)
----------------------------------------- */

const ROUTES = {
  LOGIN: "/login",
  ADMIN: "/admin",
  POSTS: "/admin/posts",
  ADD_POST: "/admin/add-post"
};

/* -----------------------------------------
   Loading Fallback
----------------------------------------- */

function PageLoader() {
  return (
    <div
      style={{
        padding: 30,
        textAlign: "center"
      }}
      role="status"
      aria-live="polite"
    >
      Loading...
    </div>
  );
}

/* -----------------------------------------
   Routes
----------------------------------------- */

function AppRoutes() {

  const location = useLocation();

  /* Memo prevents unnecessary boundary resets */
  const resetKey = useMemo(() => location.pathname, [location.pathname]);

  return (
    <ErrorBoundary resetKey={resetKey}>

      <Suspense fallback={<PageLoader />}>

        <Routes>

          {/* ---------- Public ---------- */}

          <Route path={ROUTES.LOGIN} element={<Login />} />

          {/* ---------- Protected Admin ---------- */}

          <Route
            path={ROUTES.ADMIN}
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

          {/* ---------- Default Redirect ---------- */}

          <Route
            path="/"
            element={<Navigate to={ROUTES.ADMIN} replace />}
          />

          {/* ---------- Catch All ---------- */}

          <Route
            path="*"
            element={<Navigate to={ROUTES.LOGIN} replace />}
          />

        </Routes>

      </Suspense>
    </ErrorBoundary>
  );
}

/* -----------------------------------------
   Provider Composition
----------------------------------------- */

function AppProviders({ children }) {

  return (
    <AuthProvider>
      <PostsProvider>
        {children}
      </PostsProvider>
    </AuthProvider>
  );
}

/* -----------------------------------------
   Root App
----------------------------------------- */

export default function App() {

  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}

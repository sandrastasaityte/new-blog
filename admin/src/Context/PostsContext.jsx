import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const PostsContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const LS_POSTS = "admin_posts_v1";

// ✅ Toggle from .env
// VITE_USE_POSTS_BACKEND=false  (later true)
const USE_BACKEND = import.meta.env.VITE_USE_POSTS_BACKEND === "true";

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function PostsProvider({ children }) {
  const { token } = useAuth();

  const [posts, setPosts] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_POSTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Only persist local posts when NOT using backend
  useEffect(() => {
    if (USE_BACKEND) return;
    try {
      localStorage.setItem(LS_POSTS, JSON.stringify(posts));
    } catch {}
  }, [posts]);

  const safeJson = useCallback(async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  const authHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const refetch = useCallback(async () => {
    if (!USE_BACKEND) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/posts`, {
        headers: { ...authHeaders() },
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Failed to load posts");
      setPosts(Array.isArray(data) ? data : data?.posts || []);
    } catch (e) {
      setError(e?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [safeJson, authHeaders]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addPost = useCallback(
    async ({ title, content, image, tags }) => {
      setError("");

      // Local mode
      if (!USE_BACKEND) {
        const now = new Date().toISOString();
        const newPost = {
          id: uid(),
          title: title?.trim() || "Untitled",
          content: content?.trim() || "",
          image: image?.trim() || "",
          tags: (tags || []).map((t) => String(t).trim()).filter(Boolean),
          date: now,
          views: 0,
          likes: 0,
          comments: [],
        };
        setPosts((prev) => [newPost, ...prev]);
        return newPost;
      }

      // Backend mode
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ title, content, image, tags }),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Create post failed");
      await refetch();
      return data;
    },
    [safeJson, refetch, authHeaders]
  );

  const deletePost = useCallback(
    async (id) => {
      setError("");

      if (!USE_BACKEND) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        return;
      }

      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Delete failed");
      await refetch();
    },
    [safeJson, refetch, authHeaders]
  );

  // Like post
  const likePost = useCallback(
    async (id) => {
      setError("");

      if (!USE_BACKEND) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, likes: Number(p.likes || 0) + 1 } : p
          )
        );
        return;
      }

      // Optional backend route: POST /posts/:id/like
      try {
        const res = await fetch(`${API_URL}/posts/${id}/like`, {
          method: "POST",
          headers: { ...authHeaders() },
        });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.message || "Like failed");
        await refetch();
      } catch (e) {
        // If you don't have /like route yet, you can remove this and keep local-only.
        setError(e?.message || "Like failed");
      }
    },
    [safeJson, refetch, authHeaders]
  );

  // Add comment
  const addComment = useCallback(
    async (postId, comment) => {
      setError("");

      const newComment = {
        id: uid(),
        name: (comment?.name || "Anonymous").trim(),
        text: (comment?.text || "").trim(),
        date: new Date().toISOString(),
      };

      if (!newComment.text) return;

      if (!USE_BACKEND) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments: [...(p.comments || []), newComment] }
              : p
          )
        );
        return newComment;
      }

      // Optional backend route: POST /posts/:id/comments
      const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(newComment),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Add comment failed");
      await refetch();
      return data;
    },
    [safeJson, refetch, authHeaders]
  );

  const updatePost = useCallback(
    async (postId, patch) => {
      setError("");

      if (!USE_BACKEND) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, ...patch } : p))
        );
        return;
      }

      // Backend route: PUT /posts/:id
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(patch),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Update failed");
      await refetch();
      return data;
    },
    [safeJson, refetch, authHeaders]
  );

  const value = useMemo(
    () => ({
      posts,
      loading,
      error,
      refetch,
      addPost,
      deletePost,
      likePost,
      addComment,
      updatePost,
      USE_BACKEND, // helpful for UI badges
    }),
    [posts, loading, error, refetch, addPost, deletePost, likePost, addComment, updatePost]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside <PostsProvider>");
  return ctx;
}

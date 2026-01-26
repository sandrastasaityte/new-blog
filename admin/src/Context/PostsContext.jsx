// src/Context/PostsContext.jsx
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

// VITE_USE_POSTS_BACKEND=true/false
const USE_BACKEND = import.meta.env.VITE_USE_POSTS_BACKEND === "true";

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ✅ single, consistent id getter used everywhere
function getId(p) {
  return String(p?.id ?? p?._id ?? "");
}

// ✅ normalize backend/local posts so UI always has `id`
function normalizePosts(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr.map((p, idx) => {
    const id = getId(p) || `local-${idx}-${uid()}`;
    return { ...p, id };
  });
}

export function PostsProvider({ children }) {
  const { token } = useAuth();

  const [posts, setPosts] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_POSTS);
      const parsed = raw ? JSON.parse(raw) : [];
      return normalizePosts(parsed);
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // persist only in local mode
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
      const res = await fetch(`${API_URL}/posts`, { headers: { ...authHeaders() } });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Failed to load posts");

      const list = Array.isArray(data) ? data : data?.posts || data?.data || [];
      setPosts(normalizePosts(list));
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

      // local mode
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

      // backend mode
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
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
      const targetId = String(id || "");

      if (!USE_BACKEND) {
        setPosts((prev) => prev.filter((p) => getId(p) !== targetId));
        return;
      }

      const res = await fetch(`${API_URL}/posts/${targetId}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      await refetch();
    },
    [safeJson, refetch, authHeaders]
  );

  const toggleLike = useCallback(
    async (id) => {
      setError("");
      const targetId = String(id || "");

      // local mode: just increment
      if (!USE_BACKEND) {
        setPosts((prev) =>
          prev.map((p) =>
            getId(p) === targetId ? { ...p, likes: Number(p.likes || 0) + 1 } : p
          )
        );
        return;
      }

      // backend route: POST /posts/:id/like
      const res = await fetch(`${API_URL}/posts/${targetId}/like`, {
        method: "POST",
        headers: { ...authHeaders() },
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Like failed");

      await refetch();
      return data;
    },
    [safeJson, refetch, authHeaders]
  );

  const addComment = useCallback(
    async (postId, comment) => {
      setError("");

      const pid = String(postId || "");
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
            getId(p) === pid
              ? { ...p, comments: [...(p.comments || []), newComment] }
              : p
          )
        );
        return newComment;
      }

      const res = await fetch(`${API_URL}/posts/${pid}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
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
      const pid = String(postId || "");

      if (!USE_BACKEND) {
        setPosts((prev) => prev.map((p) => (getId(p) === pid ? { ...p, ...patch } : p)));
        return;
      }

      const res = await fetch(`${API_URL}/posts/${pid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
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

      // ✅ expose getId so Posts.jsx can use it
      getId,

      refetch,
      addPost,
      deletePost,
      toggleLike,
      addComment,
      updatePost,
      USE_BACKEND,
    }),
    [posts, loading, error, refetch, addPost, deletePost, toggleLike, addComment, updatePost]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside <PostsProvider>");
  return ctx;
}

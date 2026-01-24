import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

const PostsContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const LS_POSTS = "admin_posts_v1";

// Toggle when backend is ready
const USE_BACKEND = false;

function uid() {
  // Best available unique id
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function PostsProvider({ children }) {
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

  useEffect(() => {
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

  const refetch = useCallback(async () => {
    if (!USE_BACKEND) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/posts`);
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Failed to load posts");
      setPosts(Array.isArray(data) ? data : data?.posts || []);
    } catch (e) {
      setError(e?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [safeJson]);

  useEffect(() => {
    // if backend enabled, load from backend on start
    refetch();
  }, [refetch]);

  const addPost = useCallback(
    async ({ title, content, image, tags }, token) => {
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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content, image, tags }),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Create post failed");
      await refetch();
      return data;
    },
    [safeJson, refetch]
  );

  const deletePost = useCallback(
    async (id, token) => {
      setError("");

      if (!USE_BACKEND) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        return;
      }

      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Delete failed");
      await refetch();
    },
    [safeJson, refetch]
  );

  // ✅ local-only helpers (safe even if backend later; you can swap to API)
  const likePost = useCallback((id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: Number(p.likes || 0) + 1 } : p
      )
    );
  }, []);

  const addComment = useCallback((postId, comment) => {
    const newComment = {
      id: uid(),
      name: (comment?.name || "Anonymous").trim(),
      text: (comment?.text || "").trim(),
      date: new Date().toISOString(),
    };

    if (!newComment.text) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...(p.comments || []), newComment] }
          : p
      )
    );
  }, []);

  const updatePost = useCallback((postId, patch) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...patch } : p))
    );
  }, []);

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

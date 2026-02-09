// src/Context/PostsContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import { USE_POSTS_BACKEND, USE_BACKEND_AUTH } from "../lib/env";
import * as api from "../lib/blogApi";

import {
  loadPosts,
  savePosts,
  addPost as addPostLS,
  updatePost as updatePostLS,
  deletePost as deletePostLS,
  incViews as incViewsLS,
  toggleLike as toggleLikeLS,
  addComment as addCommentLS,
} from "./postStorage";

const PostsContext = createContext(null);

/* ========================= */
/* Helpers */
/* ========================= */

const safeJSON = (value, fallback = {}) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getId = (p) => String(p?._id || p?.id);

const normalizePost = (p) => ({
  ...p,
  _id: p._id || p.id,
  createdAt: p.createdAt || p.date || new Date().toISOString(),
  likes: Number(p.likes || 0),
  likedBy: Array.isArray(p.likedBy) ? p.likedBy : [],
  comments: Array.isArray(p.comments) ? p.comments : [],
  tags: Array.isArray(p.tags) ? p.tags : [],
});

/* ========================= */
/* Provider */
/* ========================= */

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState(() =>
    USE_POSTS_BACKEND ? [] : loadPosts()
  );

  const [loading, setLoading] = useState(USE_POSTS_BACKEND);
  const [error, setError] = useState("");

  const likeLock = useRef(new Set());

  /* ---------------- Auth ---------------- */

  const getAuthToken = useCallback(
    () => (USE_BACKEND_AUTH ? localStorage.getItem("token") : null),
    []
  );

  const getUserKey = useCallback(() => {
    const user = safeJSON(localStorage.getItem("user") || "{}");
    return user?.id || user?.email || "guest";
  }, []);

  /* ---------------- Local Storage Sync ---------------- */

  useEffect(() => {
    if (!USE_POSTS_BACKEND) {
      savePosts(posts);
    }
  }, [posts]);

  /* ---------------- Safe API Wrapper ---------------- */

  const tryApi = useCallback(async (fn, rollback) => {
    setError("");

    try {
      return await fn();
    } catch (e) {
      rollback?.();
      setError(e?.message || "Operation failed");
      throw e;
    }
  }, []);

  /* ---------------- Fetch ---------------- */

  const refetch = useCallback(async () => {
    if (!USE_POSTS_BACKEND) return;

    setLoading(true);

    try {
      const data = await api.getPosts();
      setPosts(Array.isArray(data) ? data.map(normalizePost) : []);
    } catch (e) {
      setError(e?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (USE_POSTS_BACKEND) refetch();
  }, [refetch]);

  /* ========================= */
  /* ADD POST */
  /* ========================= */

  const addPost = useCallback(
    async (post) =>
      tryApi(async () => {
        const tempId = `temp-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)}`;

        const optimistic = normalizePost({
          ...post,
          _id: tempId,
        });

        setPosts((prev) => [optimistic, ...prev]);

        if (!USE_POSTS_BACKEND) return optimistic;

        const token = getAuthToken();
        const created = normalizePost(
          await api.createPost(post, token)
        );

        setPosts((prev) =>
          prev.map((p) => (getId(p) === tempId ? created : p))
        );

        return created;
      }, () => {
        setPosts((prev) =>
          prev.filter((p) => !String(p._id).startsWith("temp-"))
        );
      }),
    [getAuthToken, tryApi]
  );

  /* ========================= */
  /* UPDATE POST */
  /* ========================= */

  const updatePost = useCallback(
    async (id, patch) =>
      tryApi(
        async () => {
          const prevSnapshot = [...posts];

          setPosts((prev) =>
            prev.map((p) =>
              getId(p) === String(id) ? { ...p, ...patch } : p
            )
          );

          if (!USE_POSTS_BACKEND) return;

          const token = getAuthToken();
          await api.updatePost(id, patch, token);
        },
        () => setPosts([...posts])
      ),
    [posts, getAuthToken, tryApi]
  );

  /* ========================= */
  /* DELETE POST */
  /* ========================= */

  const deletePost = useCallback(
    async (id) =>
      tryApi(
        async () => {
          const prevSnapshot = [...posts];

          setPosts((prev) =>
            prev.filter((p) => getId(p) !== String(id))
          );

          if (!USE_POSTS_BACKEND) return;

          const token = getAuthToken();
          await api.deletePost(id, token);
        },
        () => setPosts([...posts])
      ),
    [posts, getAuthToken, tryApi]
  );

  /* ========================= */
  /* VIEWS */
  /* ========================= */

  const incViews = useCallback((id) => {
    setPosts((prev) => incViewsLS(prev, id));
  }, []);

  /* ========================= */
  /* LIKE */
  /* ========================= */

  const toggleLike = useCallback(
    async (id) => {
      if (likeLock.current.has(id)) return;
      likeLock.current.add(id);

      const userKey = getUserKey();
      const prevSnapshot = [...posts];

      setPosts((prev) => toggleLikeLS(prev, id, userKey));

      try {
        if (USE_POSTS_BACKEND) {
          const token = getAuthToken();
          await api.likeBlog(id, token);
        }
      } catch {
        setPosts(prevSnapshot);
      } finally {
        likeLock.current.delete(id);
      }
    },
    [posts, getUserKey, getAuthToken]
  );

  /* ========================= */
  /* COMMENTS */
  /* ========================= */

  const addComment = useCallback(
    async (id, comment) => {
      const enriched = {
        ...comment,
        createdAt: new Date().toISOString(),
      };

      const prevSnapshot = [...posts];

      setPosts((prev) => addCommentLS(prev, id, enriched));

      if (!USE_POSTS_BACKEND) return;

      const token = getAuthToken();

      try {
        await api.addComment(id, enriched, token);
      } catch {
        setPosts(prevSnapshot);
      }
    },
    [posts, getAuthToken]
  );

  /* ========================= */
  /* HELPERS */
  /* ========================= */

  const getPostById = useCallback(
    (id) => posts.find((p) => getId(p) === String(id)) || null,
    [posts]
  );

  const uniqueTags = useMemo(() => {
    const set = new Set();
    posts.forEach((p) =>
      p.tags?.forEach((t) => t && set.add(t.toLowerCase()))
    );
    return [...set].sort();
  }, [posts]);

  /* ========================= */
  /* CONTEXT VALUE */
  /* ========================= */

  const value = useMemo(
    () => ({
      posts,
      loading,
      error,
      refetch,
      addPost,
      updatePost,
      deletePost,
      incViews,
      toggleLike,
      addComment,
      getPostById,
      uniqueTags,
      USE_POSTS_BACKEND,
      USE_BACKEND_AUTH,
      getId,
    }),
    [
      posts,
      loading,
      error,
      refetch,
      addPost,
      updatePost,
      deletePost,
      incViews,
      toggleLike,
      addComment,
      getPostById,
      uniqueTags,
    ]
  );

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}

/* ========================= */
/* Hook */
/* ========================= */

export function usePosts() {
  const ctx = useContext(PostsContext);

  if (!ctx) {
    throw new Error("usePosts must be used inside <PostsProvider>");
  }

  return ctx;
}

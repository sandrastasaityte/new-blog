//frontend... src/Context/PostsContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
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

/* ---------------- Normalizer ---------------- */

const normalizePost = (p) => ({
  ...p,
  _id: p._id || p.id,
  createdAt: p.createdAt || p.date || new Date().toISOString(),
  likes: Number(p.likes || 0),
  likedBy: Array.isArray(p.likedBy) ? p.likedBy : [],
  comments: Array.isArray(p.comments) ? p.comments : [],
  tags: Array.isArray(p.tags) ? p.tags : [],
});

/* ---------------- Provider ---------------- */

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState(() =>
    USE_POSTS_BACKEND ? [] : loadPosts()
  );

  const [loading, setLoading] = useState(USE_POSTS_BACKEND);
  const [error, setError] = useState("");

  /* ---------------- Auth Helpers ---------------- */

  const getAuthToken = useCallback(() => {
    return USE_BACKEND_AUTH ? localStorage.getItem("token") : null;
  }, []);

  const getUserKey = useCallback(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.id || user?.email || "guest";
    } catch {
      return "guest";
    }
  }, []);

  const getId = (p) => String(p?._id || p?.id);

  /* ---------------- Local Storage Sync ---------------- */

  useEffect(() => {
    if (!USE_POSTS_BACKEND) {
      savePosts(posts);
    }
  }, [posts]);

  /* ---------------- Error Wrapper ---------------- */

  const tryApi = useCallback(async (fn, fallback) => {
    setError("");
    try {
      return await fn();
    } catch (e) {
      const msg = e?.message || "Operation failed";
      setError(msg);
      fallback?.();
      throw e;
    }
  }, []);

  /* ---------------- Fetch ---------------- */

  const refetch = useCallback(async () => {
    if (!USE_POSTS_BACKEND) return;

    setLoading(true);
    setError("");

    try {
      const data = await api.getPosts();

      setPosts(
        Array.isArray(data)
          ? data.map(normalizePost)
          : []
      );
    } catch (e) {
      setError(e?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (USE_POSTS_BACKEND) refetch();
  }, [refetch]);

  /* ---------------- CRUD ---------------- */

  const addPost = useCallback(async (post) =>
    tryApi(async () => {

      const normalized = normalizePost(post);

      if (!USE_POSTS_BACKEND) {
        setPosts((prev) => [normalized, ...prev]);
        return normalized;
      }

      const token = getAuthToken();

      // optimistic update
      setPosts((prev) => [normalized, ...prev]);

      const created = await api.createPost(post, token);

      setPosts((prev) =>
        prev.map((p) =>
          getId(p) === getId(normalized) ? normalizePost(created) : p
        )
      );

      return created;

    }),
  [getAuthToken, tryApi]);

  /* ---------------- Update ---------------- */

  const updatePost = useCallback(async (id, patch) =>
    tryApi(async () => {

      if (!USE_POSTS_BACKEND) {
        setPosts((prev) => updatePostLS(prev, id, patch));
        return;
      }

      const token = getAuthToken();

      // optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          getId(p) === String(id)
            ? { ...p, ...patch }
            : p
        )
      );

      await api.updatePost(id, patch, token);

    }),
  [getAuthToken, tryApi]);

  /* ---------------- Delete ---------------- */

  const deletePost = useCallback(async (id) =>
    tryApi(async () => {

      if (!USE_POSTS_BACKEND) {
        setPosts((prev) => deletePostLS(prev, id));
        return;
      }

      const token = getAuthToken();

      // optimistic
      setPosts((prev) =>
        prev.filter((p) => getId(p) !== String(id))
      );

      await api.deletePost(id, token);

    }),
  [getAuthToken, tryApi]);

  /* ---------------- Views ---------------- */

  const incViews = useCallback((id) => {
    setPosts((prev) => incViewsLS(prev, id));
  }, []);

  /* ---------------- Likes ---------------- */

  const toggleLike = useCallback(async (id) => {

    const userKey = getUserKey();

    // optimistic update always
    setPosts((prev) => toggleLikeLS(prev, id, userKey));

    if (!USE_POSTS_BACKEND) return;

    const token = getAuthToken();

    await tryApi(async () => {
      await api.likeBlog(id, token);
    });

  }, [getUserKey, getAuthToken, tryApi]);

  /* ---------------- Comments ---------------- */

  const addComment = useCallback(async (id, comment) => {

    const enriched = {
      ...comment,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      addCommentLS(prev, id, enriched)
    );

    if (!USE_POSTS_BACKEND) return;

    const token = getAuthToken();

    await tryApi(async () => {
      await api.addComment(id, enriched, token);
    });

  }, [getAuthToken, tryApi]);

  /* ---------------- Helpers ---------------- */

  const getPostById = useCallback(
    (id) =>
      posts.find((p) => getId(p) === String(id)) || null,
    [posts]
  );

  const uniqueTags = useMemo(() => {
    const set = new Set();

    posts.forEach((p) =>
      p.tags?.forEach((t) =>
        t && set.add(t.toLowerCase())
      )
    );

    return Array.from(set);
  }, [posts]);

  /* ---------------- Context ---------------- */

  const value = useMemo(() => ({
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
  }), [
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
  ]);

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}

/* ---------------- Hook ---------------- */

export function usePosts() {
  const ctx = useContext(PostsContext);

  if (!ctx) {
    throw new Error("usePosts must be used inside <PostsProvider>");
  }

  return ctx;
}

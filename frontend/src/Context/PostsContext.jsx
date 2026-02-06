// src/Context/PostsContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
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

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState(() => (USE_POSTS_BACKEND ? [] : loadPosts()));
  const [loading, setLoading] = useState(USE_POSTS_BACKEND);
  const [error, setError] = useState("");

  // ---------------- Helpers ----------------
  const getAuthToken = useCallback(() => (USE_BACKEND_AUTH ? localStorage.getItem("token") : null), []);

  const tryApi = useCallback(async (fn, fallback) => {
    setError("");
    try {
      return await fn();
    } catch (e) {
      const msg = e?.message || "Operation failed";
      setError(msg);
      if (fallback) fallback();
      throw e;
    }
  }, []);

  // ---------------- Sync localStorage for local mode ----------------
  useEffect(() => {
    if (!USE_POSTS_BACKEND) savePosts(posts);
  }, [posts]);

  // ---------------- Fetch posts from backend ----------------
  const refetch = useCallback(async () => {
    if (!USE_POSTS_BACKEND) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to fetch posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (USE_POSTS_BACKEND) refetch();
  }, [refetch]);

  // ---------------- CRUD FUNCTIONS ----------------
  const addPost = useCallback(
    async (post) => tryApi(async () => {
      if (!USE_POSTS_BACKEND) {
        let created;
        setPosts((prev) => {
          created = addPostLS(prev, post)[0];
          return [created, ...prev];
        });
        return created;
      }
      const token = getAuthToken();
      const created = await api.createPost(post, token);
      await refetch();
      return created;
    }),
    [refetch, getAuthToken, tryApi]
  );

  const updatePost = useCallback(
    async (id, patch) => tryApi(async () => {
      if (!USE_POSTS_BACKEND) {
        setPosts((prev) => updatePostLS(prev, id, patch));
        return;
      }
      const token = getAuthToken();
      await api.updatePost(id, patch, token);
      await refetch();
    }),
    [refetch, getAuthToken, tryApi]
  );

  const deletePost = useCallback(
    async (id) => tryApi(async () => {
      if (!USE_POSTS_BACKEND) {
        setPosts((prev) => deletePostLS(prev, id));
        return;
      }
      const token = getAuthToken();
      await api.deletePost(id, token);
      await refetch();
    }),
    [refetch, getAuthToken, tryApi]
  );

  const incViews = useCallback((id) => setPosts((prev) => incViewsLS(prev, id)), []);
  const toggleLike = useCallback((id, userKey) => setPosts((prev) => toggleLikeLS(prev, id, userKey)), []);
  const addComment = useCallback((id, comment) => setPosts((prev) => addCommentLS(prev, id, comment)), []);

  // ---------------- Helpers ----------------
  const getPostById = useCallback((id) => posts.find((p) => String(p._id ?? p.id) === String(id)) || null, [posts]);

  const uniqueTags = useMemo(() => {
    const set = new Set();
    posts?.forEach((p) => p?.tags?.forEach((t) => t && set.add(t.toLowerCase())));
    return Array.from(set);
  }, [posts]);

  // ---------------- Context Value ----------------
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
    }),
    [posts, loading, error, refetch, addPost, updatePost, deletePost, incViews, toggleLike, addComment, getPostById, uniqueTags]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

// ---------------- Hook ----------------
export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside <PostsProvider>");
  return ctx;
}

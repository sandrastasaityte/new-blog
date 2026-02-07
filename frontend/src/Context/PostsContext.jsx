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

  const getId = (p) => p._id || p.id;

  // ---------------- Sync localStorage ----------------
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
      setPosts(
        Array.isArray(data)
          ? data.map((p) => ({
              ...p,
              _id: p._id || p.id,
              createdAt: p.createdAt || p.date || new Date().toISOString(),
              likes: p.likes || 0,
              likedBy: p.likedBy || [],
              comments: p.comments || [],
            }))
          : []
      );
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

  // ---------------- CRUD ----------------
  const addPost = useCallback(
    async (post) =>
      tryApi(async () => {
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
    async (id, patch) =>
      tryApi(async () => {
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
    async (id) =>
      tryApi(async () => {
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

  // ---------------- Views ----------------
  const incViews = useCallback(
    async (id) => {
      if (!USE_POSTS_BACKEND) {
        setPosts((prev) => incViewsLS(prev, id));
        return;
      }
      // optional: backend endpoint to increment views
      setPosts((prev) => incViewsLS(prev, id)); // optimistic update
    },
    []
  );

  // ---------------- Likes ----------------
  const toggleLike = useCallback(
    async (id) => {
      const userKey = localStorage.getItem("user") || "guest";
      if (!USE_POSTS_BACKEND) {
        setPosts((prev) => toggleLikeLS(prev, id, userKey));
        return;
      }
      const token = getAuthToken();
      await tryApi(async () => {
        await api.likeBlog(id, token);
        await refetch(); // ensures both admin and frontend see updated likes
      });
    },
    [refetch, getAuthToken, tryApi]
  );

  // ---------------- Comments ----------------
  const addComment = useCallback(
    async (id, comment) => {
      if (!USE_POSTS_BACKEND) {
        setPosts((prev) => addCommentLS(prev, id, comment));
        return;
      }
      const token = getAuthToken();
      await tryApi(async () => {
        await api.addComment(id, comment, token);
        await refetch(); // ensures both admin and frontend see updated comments
      });
    },
    [refetch, getAuthToken, tryApi]
  );

  // ---------------- Helpers ----------------
  const getPostById = useCallback((id) => posts.find((p) => getId(p) === String(id)) || null, [posts]);

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
      getId,
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

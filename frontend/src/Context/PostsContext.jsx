// src/Context/PostsContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { USE_POSTS_BACKEND } from "../lib/env";
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

  // Sync to localStorage when posts change (for local mode)
  useEffect(() => {
    if (!USE_POSTS_BACKEND) savePosts(posts);
  }, [posts]);

  // Fetch posts from backend
  const refetch = useCallback(async () => {
    if (!USE_POSTS_BACKEND) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.getBlogs();
      const list = Array.isArray(data) ? data : data?.posts || [];
      setPosts(list);
    } catch (e) {
      setError(e?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (USE_POSTS_BACKEND) refetch();
  }, [refetch]);

  // ---------------- CRUD FUNCTIONS ----------------
  const addPost = useCallback(
    async (post) => {
      setError("");
      try {
        if (!USE_POSTS_BACKEND) {
          let created;
          setPosts((prev) => {
            created = addPostLS(prev, post)[0];
            return [created, ...prev];
          });
          return created;
        }

        const token = localStorage.getItem("token");
        const created = await api.createBlog(post, token);
        await refetch();
        return created;
      } catch (e) {
        const msg = e?.message || "Failed to add post";
        setError(msg);
        throw e;
      }
    },
    [refetch]
  );

  const updatePost = useCallback(
    async (id, patch) => {
      setError("");
      try {
        if (!USE_POSTS_BACKEND) {
          setPosts((prev) => updatePostLS(prev, id, patch));
          return;
        }

        const token = localStorage.getItem("token");
        await api.updateBlog(id, patch, token);
        await refetch();
      } catch (e) {
        const msg = e?.message || "Failed to update post";
        setError(msg);
        throw e;
      }
    },
    [refetch]
  );

  const deletePost = useCallback(
    async (id) => {
      setError("");
      try {
        if (!USE_POSTS_BACKEND) {
          setPosts((prev) => deletePostLS(prev, id));
          return;
        }

        const token = localStorage.getItem("token");
        await api.deleteBlog(id, token);
        await refetch();
      } catch (e) {
        const msg = e?.message || "Failed to delete post";
        setError(msg);
        throw e;
      }
    },
    [refetch]
  );

  const incViews = useCallback((id) => setPosts((prev) => incViewsLS(prev, id)), []);
  const toggleLike = useCallback((id, userKey) => setPosts((prev) => toggleLikeLS(prev, id, userKey)), []);
  const addComment = useCallback((id, comment) => setPosts((prev) => addCommentLS(prev, id, comment)), []);

  // ---------------- HELPERS ----------------
  const getId = useCallback((post) => String(post?.id ?? post?._id), []);
  const findPostById = useCallback((id) => posts.find((p) => getId(p) === String(id)), [posts, getId]);

  const uniqueTags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags || []))], [posts]);

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
      getId,
      findPostById,
      uniqueTags,
      USE_POSTS_BACKEND,
    }),
    [posts, loading, error, refetch, addPost, updatePost, deletePost, incViews, toggleLike, addComment, getId, findPostById, uniqueTags]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

// ---------------- HOOK ----------------
export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside <PostsProvider>");
  return ctx;
}

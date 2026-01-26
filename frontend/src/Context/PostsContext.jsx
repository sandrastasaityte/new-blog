// src/Context/PostsContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { USE_POSTS_BACKEND } from "../lib/env";

import {
  loadPosts,
  savePosts,
  addPost as addPostFn,
  updatePost as updatePostFn,
  deletePost as deletePostFn,
  incViews as incViewsFn,
  incLikes as incLikesFn,
  addComment as addCommentFn,
  clearPostsStorage,
  normalize,
  toggleLike as toggleLikeFn,
} from "./postStorage";

import * as blogsApi from "../lib/blogApi";

const DEFAULT_SEED = [];
const PostsContext = createContext(null);

export const getId = (p) => String(p?._id ?? p?.id ?? "");

export const PostsProvider = ({ children, seed = DEFAULT_SEED }) => {
  const [posts, setPosts] = useState(() =>
    USE_POSTS_BACKEND ? [] : loadPosts(seed),
  );
  const [loading, setLoading] = useState(USE_POSTS_BACKEND);
  const [error, setError] = useState("");

  // -------- BACKEND: initial load --------
  useEffect(() => {
    if (!USE_POSTS_BACKEND) return;

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await blogsApi.getBlogs();
        // support array or {blogs:[...]} shapes
        const list = Array.isArray(data)
          ? data
          : data?.blogs || data?.data || [];
        if (alive) setPosts(normalize(list));
      } catch (e) {
        if (alive) setError(e?.message || "Failed to load blogs");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [seed, USE_POSTS_BACKEND]);

  // -------- LOCALSTORAGE: auto-save --------
  useEffect(() => {
    if (USE_POSTS_BACKEND) return;
    savePosts(posts);
  }, [posts]);

  const value = useMemo(() => {
    return {
      posts,
      loading,
      error,
      getId,

      // common helpers
      getPostById: (id) => {
        const target = String(id ?? "");
        if (!target) return null;
        return (posts || []).find((p) => getId(p) === target) || null;
      },

      // ✅ setPosts
      setPosts: (next) => setPosts(normalize(next)),

      // -------- add/update/delete --------
      addPost: async (post) => {
        if (!USE_POSTS_BACKEND) {
          setPosts((prev) => addPostFn(prev, post));
          return;
        }
        const token = localStorage.getItem("token");
        const created = await blogsApi.createBlog(post, token);
        // backend might return created post or {blog:...}
        const p = created?.blog || created?.data || created;
        setPosts((prev) => addPostFn(prev, p));
      },

      updatePost: async (id, patch) => {
        if (!USE_POSTS_BACKEND) {
          setPosts((prev) => updatePostFn(prev, id, patch));
          return;
        }
        const token = localStorage.getItem("token");
        const updated = await blogsApi.updateBlog(id, patch, token);
        const p = updated?.blog || updated?.data || updated;
        setPosts((prev) => updatePostFn(prev, id, p));
      },

      deletePost: async (id) => {
        if (!USE_POSTS_BACKEND) {
          setPosts((prev) => deletePostFn(prev, id));
          return;
        }
        const token = localStorage.getItem("token");
        await blogsApi.deleteBlog(id, token);
        setPosts((prev) => deletePostFn(prev, id));
      },

      // -------- views/likes/comments --------
      incViews: (id) => {
        // (optional) you can add backend route later; for now local-only UI
        setPosts((prev) => incViewsFn(prev, id));
      },

      incLikes: (id) => setPosts((prev) => incLikesFn(prev, id)),
      toggleLike: async (id, userKey) => {
        if (!USE_POSTS_BACKEND) {
          setPosts((prev) => toggleLikeFn(prev, id, userKey));
          return;
        }

        const token = localStorage.getItem("token");
        const res = await blogsApi.toggleLike(id, token);

        // backend returns { likes }
        if (typeof res?.likes === "number") {
          setPosts((prev) => updatePostFn(prev, id, { likes: res.likes }));
        } else {
          // fallback
          setPosts((prev) => incLikesFn(prev, id));
        }
      },

      addComment: async (id, comment) => {
        if (!USE_POSTS_BACKEND) {
          setPosts((prev) => addCommentFn(prev, id, comment));
          return;
        }

        const token = localStorage.getItem("token");
        const res = await blogsApi.addComment(id, comment, token);

        if (Array.isArray(res?.comments)) {
          setPosts((prev) =>
            updatePostFn(prev, id, { comments: res.comments }),
          );
        } else {
          setPosts((prev) => addCommentFn(prev, id, comment));
        }
      },

      // seed/storage helpers (only relevant for localStorage mode)
      resetToSeed: () => {
        if (USE_POSTS_BACKEND) return;
        setPosts(loadPosts(seed));
      },

      clearStorage: () => {
        if (USE_POSTS_BACKEND) return;
        clearPostsStorage();
        setPosts(loadPosts(seed));
      },
    };
  }, [posts, loading, error, seed]);

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
};

export const usePosts = () => {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside <PostsProvider>");
  return ctx;
};

export default PostsProvider;

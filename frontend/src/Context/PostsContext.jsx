// src/Context/PostsContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
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
} from "./postStorage";

// Optional seed (you can import your JSON seed here instead)
const DEFAULT_SEED = [];

const PostsContext = createContext(null);

const getId = (p) => String(p?._id ?? p?.id ?? "");

const PostsProvider = ({ children, seed = DEFAULT_SEED }) => {
  const [posts, setPosts] = useState(() => loadPosts(seed));

  // auto-save
  useEffect(() => {
    savePosts(posts);
  }, [posts]);

  const value = useMemo(() => {
    return {
      posts,

      // ✅ Helper: consistent id getter for UI
      getId,

      // ✅ Helper: lookup post by id/_id
      getPostById: (id) => {
        const target = String(id ?? "");
        if (!target) return null;
        return (posts || []).find((p) => getId(p) === target) || null;
      },

      // Always normalize when setting directly
      setPosts: (next) => setPosts(normalize(next)),

      addPost: (post) => setPosts((prev) => addPostFn(prev, post)),

      updatePost: (id, patch) =>
        setPosts((prev) => updatePostFn(prev, id, patch)),

      deletePost: (id) => setPosts((prev) => deletePostFn(prev, id)),

      incViews: (id) => setPosts((prev) => incViewsFn(prev, id)),

      incLikes: (id) => setPosts((prev) => incLikesFn(prev, id)),

      // ✅ Supports comment string OR {name,text,date}
      addComment: (id, comment) =>
        setPosts((prev) => addCommentFn(prev, id, comment)),

      // Seed helpers
      resetToSeed: () => setPosts(loadPosts(seed)),

      clearStorage: () => {
        clearPostsStorage();
        setPosts(loadPosts(seed));
      },
    };
  }, [posts, seed]);

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside <PostsProvider>");
  return ctx;
};

export default PostsProvider;

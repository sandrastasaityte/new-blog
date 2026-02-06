import React, { createContext, useContext, useState, useCallback } from "react";

// Simple ID generator (no uuid needed)
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const PostsContext = createContext();

export function usePosts() {
  return useContext(PostsContext);
}

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([
    // Demo initial post
    {
      id: generateId(),
      title: "Welcome to your blog!",
      date: new Date().toISOString(),
      likes: 0,
      comments: [],
    },
  ]);

  // Get post ID (supports objects with id)
  const getId = useCallback((p) => p?.id, []);

  // Add a post
  const addPost = useCallback(({ title }) => {
    const newPost = {
      id: generateId(),
      title: title || "Untitled",
      date: new Date().toISOString(),
      likes: 0,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    return newPost;
  }, []);

  // Delete a post
  const deletePost = useCallback((id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Toggle like
  const toggleLike = useCallback((id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p
      )
    );
  }, []);

  const value = {
    posts,
    addPost,
    deletePost,
    toggleLike,
    getId,
  };

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
}

// src/Context/PostsContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

// Simple ID generator (no uuid needed)
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
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
      slug: "welcome-to-your-blog",
      content: "This is your first post. Edit or delete it to get started.",
      tags: ["Demo", "Welcome"],
      image: "https://via.placeholder.com/600x300",
      author: "Admin",
      publishedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: [],
    },
  ]);

  // Get post ID safely
  const getId = useCallback((p) => p?.id, []);

  // Add a post
  const addPost = useCallback(
    ({ title, content, tags, image, author }) => {
      const newPost = {
        id: generateId(),
        title: title || "Untitled",
        slug: title ? slugify(title) : "untitled",
        content: content || "",
        tags: tags || [],
        image: image || "https://via.placeholder.com/600x300",
        author: author || "Anonymous",
        publishedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        comments: [],
      };
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    },
    []
  );

  // Delete a post
  const deletePost = useCallback((id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Edit a post
  const editPost = useCallback((id, updatedFields) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updatedFields, slug: updatedFields.title ? slugify(updatedFields.title) : p.slug }
          : p
      )
    );
  }, []);

  // Toggle like
  const toggleLike = useCallback((id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p
      )
    );
  }, []);

  // Add comment
  const addComment = useCallback((id, comment) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, comments: [...(p.comments || []), { id: generateId(), ...comment }] }
          : p
      )
    );
  }, []);

  const value = {
    posts,
    getId,
    addPost,
    editPost,
    deletePost,
    toggleLike,
    addComment,
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

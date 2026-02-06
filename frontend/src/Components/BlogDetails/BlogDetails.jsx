// src/Components/BlogDetails/BlogDetails.jsx
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePosts } from "../../Context/PostsContext";
import BlogModal from "../Blogs/BlogModal";

export default function BlogDetails() {
  const { id } = useParams();
  const { posts, addComment, toggleLike, getPostById } = usePosts(); // ✅ removed getId

  // Find the blog from context
  const post = useMemo(() => {
    return getPostById(id); // ✅ use getPostById helper
  }, [id, getPostById]);

  if (!post) return <p>Blog not found.</p>;

  return (
    <BlogModal
      post={post}
      onClose={() => window.history.back()}
      onAddComment={addComment}
      onLike={toggleLike}
    />
  );
}

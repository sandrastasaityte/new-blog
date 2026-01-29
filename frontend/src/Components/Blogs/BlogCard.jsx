// src/Blogs/BlogCard.jsx
import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "./BlogCard.css";
import { usePosts } from "../../Context/PostsContext";

export default function BlogCard({ post, onReadMore }) {
  const { toggleLike, getId } = usePosts();

  const handleLike = () => {
    toggleLike(getId(post));
  };

  const likedByUser = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const key = user?.id || user?.email || "";
      if (!key) return false;
      return post.likedBy.some((x) => x.toLowerCase() === key.toLowerCase());
    } catch {
      return false;
    }
  })();

  return (
    <div className="blog-card">
      <img src={post.image} alt={post.title} className="blog-card-image" />

      <div className="blog-card-body">
        <h3>{post.title}</h3>
        <p className="blog-card-meta">
          {post.author} • {new Date(post.date).toLocaleDateString()}
        </p>

        <p className="blog-card-excerpt">
          {post.content.slice(0, 120)}{post.content.length > 120 ? "..." : ""}
        </p>

        <div className="blog-card-actions">
          <button type="button" className="read-more-btn" onClick={onReadMore}>
            Read More
          </button>

          <button
            type="button"
            className={`like-btn ${likedByUser ? "liked" : ""}`}
            onClick={handleLike}
            aria-pressed={likedByUser}
            title={likedByUser ? "Unlike" : "Like"}
          >
            {likedByUser ? <FaHeart color="red" /> : <FaRegHeart />}
            <span>{post.likes || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import "./BlogCard.css";

const BlogCard = ({ post, onReadMore }) => {
  return (
    <div className="blog-card">
      <img src={post.image || "https://via.placeholder.com/400x200"} alt={post.title} />
      <div className="blog-content">
        <h3>{post.title}</h3>
        <p className="blog-meta">
          By <strong>{post.author || "Admin"}</strong> | {new Date(post.date).toLocaleDateString()} | {post.views || 0} views
        </p>
        <p className="blog-excerpt">{post.content.slice(0, 120)}...</p>
        <p className="blog-rating">⭐ {post.rating || 0}/5</p>
        <button onClick={onReadMore}>Read More</button>
      </div>
    </div>
  );
};

export default BlogCard;

import React from "react";
import CommentSection from "../CommentSection/CommentSection";
import "./BlogModal.css";

const BlogModal = ({ post, onClose, onAddComment }) => {
  const handleComment = (text) => {
    if (!text) return;
    onAddComment(post.id, text);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <img src={post.image || "https://via.placeholder.com/600x300"} alt={post.title} className="modal-img"/>
        <div className="modal-details">
          <h2>{post.title}</h2>
          <p className="modal-meta">
            By <strong>{post.author || "Admin"}</strong> | {new Date(post.date).toLocaleDateString()} | {post.views || 0} views
          </p>
          <p className="modal-rating">⭐ {post.rating || 0}/5</p>
          <p className="modal-content-text">{post.content}</p>
        </div>
        <CommentSection comments={post.comments || []} onAddComment={handleComment} />
      </div>
    </div>
  );
};

export default BlogModal;

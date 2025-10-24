import React, { useState } from "react";

const CommentSection = ({ comments, onAddComment }) => {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText) return;
    onAddComment(commentText);
    setCommentText("");
  };

  return (
    <div className="comment-section">
      <h4>Comments</h4>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} />
        <button type="submit">Comment</button>
      </form>
      <ul>
        {comments.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
    </div>
  );
};

export default CommentSection;

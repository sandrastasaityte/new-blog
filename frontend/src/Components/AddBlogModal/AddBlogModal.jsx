import React, { useState } from "react";
import "./AddBlogModal.css";

const AddBlogModal = ({ onClose, onAddPost }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !content) return;

    onAddPost({
      title,
      content,
      tags: tags.split(",").map(t => t.trim()),
      image: image || "https://via.placeholder.com/400x200",
      author: author || "Admin",
      rating: parseFloat(rating) || 0,
      date: new Date().toISOString().slice(0, 10),
      views: 0,
      comments: []
    });

    setTitle("");
    setContent("");
    setTags("");
    setImage("");
    setAuthor("");
    setRating("");
    onClose();
  };

  return (
    <div className="addblog-overlay">
      <div className="addblog-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Add New Blog</h2>
        <form onSubmit={handleSubmit} className="addblog-form">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <input
            type="text"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <input
            type="number"
            placeholder="Rating (0-5)"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            min="0"
            max="5"
            step="0.1"
          />
          <button type="submit">Add Blog</button>
        </form>
      </div>
    </div>
  );
};

export default AddBlogModal;

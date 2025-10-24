import React, { useState } from "react";
import "./AddBlog.css";

const AddBlog = ({ onAddPost, authors = [] }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState(authors[0] || "");
  const [rating, setRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !content) return;

    onAddPost({
      title,
      content,
      tags: tags.split(",").map(t => t.trim()),
      image: image || "https://via.placeholder.com/400x200",
      author,
      rating
    });

    setTitle("");
    setContent("");
    setTags("");
    setImage("");
    setAuthor(authors[0] || "");
    setRating(0);
  };

  return (
    <form className="add-blog-form" onSubmit={handleSubmit}>
      <h3>Add New Blog</h3>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} />
      <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
      <input type="text" placeholder="Image URL" value={image} onChange={e => setImage(e.target.value)} />
      <select value={author} onChange={e => setAuthor(e.target.value)}>
        {authors.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <div className="rating-input">
        <label>Rating: </label>
        {[1,2,3,4,5].map(star => (
          <span key={star} className={star <= rating ? "star filled" : "star"} onClick={() => setRating(star)}>★</span>
        ))}
      </div>
      <button type="submit">Add Blog</button>
    </form>
  );
};

export default AddBlog;

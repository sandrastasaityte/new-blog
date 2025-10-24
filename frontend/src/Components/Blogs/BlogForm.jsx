// BlogForm.jsx
import React, { useState, useEffect } from "react";

const BlogForm = ({ onSubmit, editingPost }) => {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    image: null,
    imagePreview: null,
  });

  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title,
        excerpt: editingPost.excerpt,
        content: editingPost.content,
        tags: editingPost.tags?.join(", ") || "",
        image: null,
        imagePreview: editingPost.image,
      });
    }
  }, [editingPost]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, image: file, imagePreview: URL.createObjectURL(file) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt) return alert("Title and excerpt are required!");
    onSubmit(formData);
    setFormData({ title: "", excerpt: "", content: "", tags: "", image: null, imagePreview: null });
  };

  return (
    <form className="blog-form" onSubmit={handleSubmit}>
      <h2>{editingPost ? "Edit Post" : "Add New Post"}</h2>
      <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
      <input type="text" name="excerpt" placeholder="Excerpt" value={formData.excerpt} onChange={handleChange} required />
      <textarea name="content" placeholder="Content" rows="4" value={formData.content} onChange={handleChange}></textarea>
      <input type="text" name="tags" placeholder="Tags (comma separated)" value={formData.tags} onChange={handleChange} />
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {formData.imagePreview && <img src={formData.imagePreview} alt="Preview" className="image-preview" />}
      <button type="submit">{editingPost ? "Update Post" : "Add Post"}</button>
    </form>
  );
};

export default BlogForm;

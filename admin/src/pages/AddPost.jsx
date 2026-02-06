// src/pages/admin/AddPost.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { usePosts } from "../Context/PostsContext";
import { v4 as uuid } from "uuid";
import "./AddPost.css";

const PLACEHOLDER_IMG = "https://via.placeholder.com/600x300";
const DEFAULT_TAGS = ["Economics", "Trade", "AI", "Finance", "Investment"];

function parseTags(input) {
  if (!input) return [];
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isImageUrl(url) {
  return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function AddPost() {
  const navigate = useNavigate();
  const { addPost } = usePosts();
  const previewRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "Economics, Trade",
    image: "",
    author: "Sandra Stasaityte",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Autosave draft
  useEffect(() => {
    localStorage.setItem("admin_post_draft", JSON.stringify(form));
  }, [form]);

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem("admin_post_draft");
    if (draft) setForm(JSON.parse(draft));
  }, []);

  const tagsArray = useMemo(() => parseTags(form.tags), [form.tags]);

  const setField = (key) => (e) => {
    const value = e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const addTag = (tag) => {
    if (!tagsArray.includes(tag)) {
      setForm((p) => ({
        ...p,
        tags: p.tags ? p.tags + ", " + tag : tag,
      }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title || form.title.trim().length < 3)
      errs.title = "Title must be at least 3 characters";
    if (!form.content || form.content.trim().length < 20)
      errs.content = "Content must be at least 20 characters";
    if (form.image && !isValidHttpUrl(form.image))
      errs.image = "Invalid image URL";
    else if (form.image && !isImageUrl(form.image))
      errs.image = "URL must point to an image";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCancel = () => navigate("/admin/posts");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const newPost = {
      id: uuid(),
      title: form.title.trim(),
      slug: slugify(form.title),
      content: form.content.trim(),
      tags: tagsArray,
      image: form.image.trim() || PLACEHOLDER_IMG,
      author: form.author.trim(),
      publishedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: [],
    };

    addPost(newPost);
    localStorage.removeItem("admin_post_draft");
    navigate("/admin/posts");
  };

  const markdownPreview = useMemo(() => {
    const raw = marked.parse(form.content || "");
    return { __html: DOMPurify.sanitize(raw) };
  }, [form.content]);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.scrollTop = previewRef.current.scrollHeight;
    }
  }, [form.content]);

  return (
    <form className="add-blog-form" onSubmit={handleSubmit}>
      <h3>Add New Post</h3>

      {/* Title */}
      <label className="field">
        <span>Title</span>
        <input
          value={form.title}
          onChange={setField("title")}
          placeholder="Title"
          required
          disabled={submitting}
        />
        {errors.title && <div className="field-error">{errors.title}</div>}
        {form.title && (
          <div className="slug-preview">
            Slug: <code>{slugify(form.title)}</code>
          </div>
        )}
      </label>

      {/* Content */}
      <label className="field">
        <span>Content (Markdown supported)</span>
        <textarea
          value={form.content}
          onChange={setField("content")}
          placeholder="Write your post content…"
          required
          rows={7}
          disabled={submitting}
        />
        {errors.content && <div className="field-error">{errors.content}</div>}
        {form.content && (
          <div
            ref={previewRef}
            className="markdown-preview"
            dangerouslySetInnerHTML={markdownPreview}
          />
        )}
      </label>

      {/* Tags */}
      <label className="field">
        <span>Tags</span>
        <input
          value={form.tags}
          onChange={setField("tags")}
          placeholder="Economics, Trade"
          disabled={submitting}
        />
        <div className="tag-suggestions">
          {DEFAULT_TAGS.map((tag) => (
            <button
              type="button"
              key={tag}
              className="tag-suggestion-btn"
              onClick={() => addTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="tag-preview">
          {tagsArray.map((t) => (
            <span key={t.toLowerCase()} className="tag-chip">
              {t}
            </span>
          ))}
        </div>
      </label>

      {/* Image */}
      <label className="field">
        <span>Image URL</span>
        <input
          value={form.image}
          onChange={setField("image")}
          placeholder="https://…"
          disabled={submitting}
        />
        {errors.image && <div className="field-error">{errors.image}</div>}
        <div className="image-preview-wrap">
          <img
            src={form.image || PLACEHOLDER_IMG}
            alt="Preview"
            className="image-preview"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER_IMG;
            }}
          />
        </div>
      </label>

      {/* Author */}
      <label className="field">
        <span>Author</span>
        <input
          value={form.author}
          onChange={setField("author")}
          placeholder="Author"
          disabled={submitting}
        />
      </label>

      {/* Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="btn secondary"
          onClick={handleCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? "Adding…" : "Add Post"}
        </button>
      </div>
    </form>
  );
}

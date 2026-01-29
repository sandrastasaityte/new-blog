import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { usePosts } from "../../Context/PostsContext";
import { createBlog } from "../../lib/blogApi";
import "./AddBlog.css";

const PLACEHOLDER_IMG = "https://via.placeholder.com/600x300";

// ================= Helpers =================
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

function normalizeCreatedBlog(created, fallbackPayload) {
  if (!created) return fallbackPayload;
  return {
    ...fallbackPayload,
    ...created,
    id: created.id || created._id || fallbackPayload.id,
  };
}

// ================= Component =================
export default function AddBlog() {
  const navigate = useNavigate();
  const { addPost } = usePosts();

  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    image: "",
    author: "Admin",
    rating: 0,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // ===== Autosave draft =====
  useEffect(() => {
    localStorage.setItem("blog_draft", JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    const draft = localStorage.getItem("blog_draft");
    if (draft) setForm(JSON.parse(draft));
  }, []);

  const tagsArray = useMemo(() => parseTags(form.tags), [form.tags]);

  const setField = (key) => (e) => {
    const value = e.target.value;
    setForm((p) => ({ ...p, [key]: key === "rating" ? Number(value) : value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setApiError("");
  };

  // ===== Validation =====
  const validate = () => {
    const errs = {};

    if (!form.title || form.title.trim().length < 4)
      errs.title = "Title must be at least 4 characters";

    if (!form.content || form.content.trim().length < 20)
      errs.content = "Content must be at least 20 characters";

    if (form.image) {
      if (!isValidHttpUrl(form.image)) errs.image = "Invalid URL";
      else if (!isImageUrl(form.image)) errs.image = "URL must be an image";
    }

    if (form.rating < 0 || form.rating > 5)
      errs.rating = "Rating must be between 0 and 5";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCancel = () => navigate("/blogs");

  const setRating = (star) => {
    setForm((p) => ({ ...p, rating: star }));
  };

  const onStarKeyDown = (star) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setRating(star);
    }
  };

  // ===== Submit =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError("");

    const payload = {
      title: form.title.trim(),
      slug: slugify(form.title),
      content: form.content.trim(),
      tags: tagsArray,
      image: form.image.trim() || null,
      author: form.author.trim(),
      rating: form.rating,
      createdAt: new Date().toISOString(),
    };

    try {
      const created = await createBlog(payload);
      const normalized = normalizeCreatedBlog(created, payload);
      addPost(normalized);
      localStorage.removeItem("blog_draft");
      navigate("/blogs");
    } catch (err) {
      setApiError(err.message || "Failed to create blog");
    } finally {
      setSubmitting(false);
    }
  };

  const previewSrc = form.image.trim() || PLACEHOLDER_IMG;

  // ===== Markdown Preview (Sanitized) =====
  const markdownPreview = useMemo(() => {
    const raw = marked.parse(form.content || "");
    const clean = DOMPurify.sanitize(raw);
    return { __html: clean };
  }, [form.content]);

  // ===== Reading time =====
  const readingTime = useMemo(() => {
    if (!form.content) return 0;
    const words = form.content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [form.content]);

  return (
    <form className="add-blog-form" onSubmit={handleSubmit}>
      <h3>Add New Blog</h3>
      {apiError && <div className="form-error">{apiError}</div>}

      {/* Title */}
      <label className="field">
        <span>Title</span>
        <input
          value={form.title}
          onChange={setField("title")}
          placeholder="Title"
          required
          minLength={4}
          disabled={submitting}
        />
        {errors.title && <div className="field-error">{errors.title}</div>}
      </label>

      {/* Content */}
      <label className="field">
        <span>Content (Markdown supported)</span>
        <textarea
          value={form.content}
          onChange={setField("content")}
          placeholder="Write your blog content…"
          required
          minLength={20}
          rows={7}
          disabled={submitting}
        />
        {errors.content && <div className="field-error">{errors.content}</div>}

        {form.content && (
          <>
            <div className="reading-time">⏱ {readingTime} min read</div>
            <div className="markdown-preview" dangerouslySetInnerHTML={markdownPreview}></div>
          </>
        )}
      </label>

      {/* Tags */}
      <label className="field">
        <span>Tags</span>
        <input
          value={form.tags}
          onChange={setField("tags")}
          placeholder="Economics, Trade, AI"
          disabled={submitting}
        />
        {tagsArray.length > 0 && (
          <div className="tag-preview">
            {tagsArray.map((t) => (
              <span key={t.toLowerCase()} className="tag-chip">{t}</span>
            ))}
          </div>
        )}
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
            className="image-preview"
            src={previewSrc}
            alt="Blog preview"
            loading="lazy"
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

      {/* Rating */}
      <div className="rating-input">
        <label>Rating:</label>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= form.rating ? "star filled" : "star"}
              onClick={() => !submitting && setRating(star)}
              onKeyDown={onStarKeyDown(star)}
              role="button"
              tabIndex={0}
              aria-label={`${star} star`}
            >
              ★
            </span>
          ))}
        </div>
        {errors.rating && <div className="field-error">{errors.rating}</div>}
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="btn secondary" onClick={handleCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? "Adding…" : "Add Blog"}
        </button>
      </div>
    </form>
  );
}

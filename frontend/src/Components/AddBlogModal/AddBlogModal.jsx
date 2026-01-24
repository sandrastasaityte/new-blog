// src/Components/AddBlogModal/AddBlogModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./AddBlogModal.css";
import { createBlog } from "../../lib/blogApi";
import { usePosts } from "../../Context/PostsContext";

const PLACEHOLDER_IMG = "https://via.placeholder.com/600x300";

const initialForm = {
  title: "",
  content: "",
  tags: "",
  image: "",
  author: "Admin",
  rating: 0,
};

function parseTags(input) {
  const raw = String(input || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const seen = new Set();
  const out = [];
  for (const t of raw) {
    const key = t.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(t);
    }
  }
  return out;
}

function normalizeCreatedBlog(created, fallback) {
  const b = created?.blog ?? created?.data ?? created ?? fallback;

  const id = String(
    b?.id ??
      b?._id ??
      fallback?.id ??
      (globalThis.crypto?.randomUUID?.() || Date.now())
  );

  return { ...fallback, ...(b || {}), id };
}

const AddBlogModal = ({ isOpen, onClose }) => {
  const { addPost } = usePosts();

  const overlayRef = useRef(null);
  const titleRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const token = localStorage.getItem("token");
  const tagsArray = useMemo(() => parseTags(form.tags), [form.tags]);

  useEffect(() => {
    if (!isOpen) return;

    const t = setTimeout(() => titleRef.current?.focus(), 0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEsc = (e) => {
      if (e.key === "Escape" && !submitting) onClose?.();
    };
    document.addEventListener("keydown", onEsc);

    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onEsc);

      setApiError("");
      setErrors({});
      setForm(initialForm);
      setSubmitting(false);
    };
  }, [isOpen, onClose, submitting]);

  const setField = (key) => (e) => {
    const value = e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: "" }));
    setApiError("");
  };

  const validate = () => {
    const next = {};

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title) next.title = "Title is required.";
    else if (title.length < 4) next.title = "Title must be at least 4 characters.";

    if (!content) next.content = "Content is required.";
    else if (content.length < 20) next.content = "Content must be at least 20 characters.";

    if (form.image.trim()) {
      try {
        const u = new URL(form.image.trim());
        if (!/^https?:$/.test(u.protocol)) next.image = "Image URL must start with http/https.";
      } catch {
        next.image = "Image must be a valid URL (https://...)";
      }
    }

    const ratingNum = Number(form.rating);
    if (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      next.rating = "Rating must be between 0 and 5.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const safeClose = () => {
    if (!submitting) onClose?.();
  };

  const onOverlayClick = (e) => {
    if (e.target === overlayRef.current) safeClose();
  };

  const onStarKeyDown = (star) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setForm((p) => ({ ...p, rating: star }));
      setErrors((prev) => ({ ...prev, rating: "" }));
      setApiError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setApiError("");

    if (!token) {
      setApiError("Please log in first.");
      return;
    }

    if (!validate()) return;

    setSubmitting(true);

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      tags: tagsArray,
      image: form.image.trim() || PLACEHOLDER_IMG,
      author: (form.author || "Admin").trim(),
      rating: Number(form.rating) || 0,
      date: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: [],
    };

    try {
      const created = await createBlog(payload, token);
      const blog = normalizeCreatedBlog(created, payload);
      addPost?.(blog);
      onClose?.();
    } catch (err) {
      setApiError(err?.message || "Failed to create blog.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="addblog-modal-overlay"
      ref={overlayRef}
      onMouseDown={onOverlayClick}
    >
      <div
        className="addblog-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="addblog-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="addblog-modal-head">
          <h3 id="addblog-title">Add New Blog</h3>

          <button
            type="button"
            className="addblog-close"
            onClick={safeClose}
            disabled={submitting}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="addblog-body">
          {!token ? (
            <div className="form-error">Please log in to add a blog.</div>
          ) : apiError ? (
            <div className="form-error">{apiError}</div>
          ) : null}

          <form className="add-blog-form add-blog-form--modal" onSubmit={handleSubmit}>
            <label className={`field ${errors.title ? "is-error" : ""}`}>
              <span>Title</span>
              <input
                ref={titleRef}
                value={form.title}
                onChange={setField("title")}
                required
                minLength={4}
                disabled={submitting}
              />
              {errors.title && <div className="field-error">{errors.title}</div>}
            </label>

            <label className={`field ${errors.content ? "is-error" : ""}`}>
              <span>Content</span>
              <textarea
                rows={6}
                value={form.content}
                onChange={setField("content")}
                required
                minLength={20}
                disabled={submitting}
              />
              {errors.content && <div className="field-error">{errors.content}</div>}
            </label>

            <label className="field">
              <span>Tags</span>
              <input
                value={form.tags}
                onChange={setField("tags")}
                disabled={submitting}
              />
              {tagsArray.length > 0 && (
                <div className="tag-preview">
                  {tagsArray.map((t) => (
                    <span key={t.toLowerCase()} className="tag-chip">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </label>

            <label className={`field ${errors.image ? "is-error" : ""}`}>
              <span>Image URL</span>
              <input
                value={form.image}
                onChange={setField("image")}
                disabled={submitting}
              />
              {errors.image && <div className="field-error">{errors.image}</div>}
            </label>

            <div className="image-preview">
              <img
                src={form.image || PLACEHOLDER_IMG}
                onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
                alt=""
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={safeClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn primary"
                disabled={submitting || !token}
              >
                {submitting ? "Saving..." : "Add Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBlogModal;

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddBlog.css";
import { usePosts } from "../../Context/PostsContext";
import { createBlog } from "../../lib/blogApi";

const PLACEHOLDER_IMG = "https://via.placeholder.com/600x300";

function parseTags(input) {
  const raw = input
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

function normalizeCreatedBlog(created, fallbackPayload) {
  // backend may return created directly or { blog: created }
  const b = created?.blog ?? created ?? fallbackPayload;

  // normalize id for frontend
  const id = b.id ?? b._id ?? fallbackPayload.id;

  return {
    ...fallbackPayload,
    ...b,
    id,
  };
}

const AddBlog = () => {
  const navigate = useNavigate();
  const { addPost } = usePosts();

  const token = localStorage.getItem("token");

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

  const tagsArray = useMemo(() => parseTags(form.tags), [form.tags]);

  const setField = (key) => (e) => {
    const value = e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setApiError("");
  };

  const validate = () => {
    const next = {};

    if (!form.title.trim()) next.title = "Title is required.";
    else if (form.title.trim().length < 4)
      next.title = "Title must be at least 4 characters.";

    if (!form.content.trim()) next.content = "Content is required.";
    else if (form.content.trim().length < 20)
      next.content = "Content must be at least 20 characters.";

    const ratingNum = Number(form.rating);
    if (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      next.rating = "Rating must be between 0 and 5.";
    }

    if (form.image.trim()) {
      const url = form.image.trim();
      const ok = /^https?:\/\/.+/i.test(url);
      if (!ok) next.image = "Image must be a valid URL starting with http/https.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCancel = () => navigate("/blogs");

  const onStarKeyDown = (star) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setForm((p) => ({ ...p, rating: star }));
      setErrors((prev) => ({ ...prev, rating: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setApiError("");

    if (!token) {
      setApiError("You must be logged in to add a blog.");
      return;
    }

    if (!validate()) return;

    setSubmitting(true);

    // Send ISO date; backend stores Date nicely
    const nowIso = new Date().toISOString();

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      tags: tagsArray,
      image: form.image.trim() || PLACEHOLDER_IMG,
      author: form.author.trim() || "Admin",
      rating: Number(form.rating) || 0,
      date: nowIso,
      views: 0,
    };

    try {
      const created = await createBlog(payload, token);
      const normalized = normalizeCreatedBlog(created, payload);

      // keep your UI state in sync
      addPost?.(normalized);

      setForm({ title: "", content: "", tags: "", image: "", author: "Admin", rating: 0 });
      navigate("/blogs");
    } catch (err) {
      setApiError(err?.message || "Failed to create blog.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="add-blog-form" onSubmit={handleSubmit}>
      <h3>Add New Blog</h3>

      {apiError ? <div className="form-error">{apiError}</div> : null}

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
        {errors.title ? <div className="field-error">{errors.title}</div> : null}
      </label>

      <label className="field">
        <span>Content</span>
        <textarea
          value={form.content}
          onChange={setField("content")}
          placeholder="Write your blog content…"
          required
          minLength={20}
          rows={7}
          disabled={submitting}
        />
        {errors.content ? <div className="field-error">{errors.content}</div> : null}
      </label>

      <label className="field">
        <span>Tags</span>
        <input
          value={form.tags}
          onChange={setField("tags")}
          placeholder="Economics, Trade, AI"
          disabled={submitting}
        />
        {tagsArray.length ? (
          <div className="tag-preview">
            {tagsArray.map((t) => (
              <span key={t.toLowerCase()} className="tag-chip">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </label>

      <label className="field">
        <span>Image URL</span>
        <input
          value={form.image}
          onChange={setField("image")}
          placeholder="https://…"
          disabled={submitting}
        />
        {errors.image ? <div className="field-error">{errors.image}</div> : null}
      </label>

      <label className="field">
        <span>Author</span>
        <input
          value={form.author}
          onChange={setField("author")}
          placeholder="Author"
          disabled={submitting}
        />
      </label>

      <div className="rating-input" aria-label="Rating">
        <label>Rating:</label>
        <div className="stars" aria-label={`Rating ${form.rating} out of 5`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= form.rating ? "star filled" : "star"}
              onClick={() => !submitting && setForm((p) => ({ ...p, rating: star }))}
              onKeyDown={onStarKeyDown(star)}
              role="button"
              tabIndex={0}
              aria-label={`${star} star`}
            >
              ★
            </span>
          ))}
        </div>
        {errors.rating ? <div className="field-error">{errors.rating}</div> : null}
      </div>

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
};

export default AddBlog;

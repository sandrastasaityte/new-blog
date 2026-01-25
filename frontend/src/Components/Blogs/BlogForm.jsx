import React, { useEffect, useMemo, useRef, useState } from "react";

const PLACEHOLDER_IMG = "https://via.placeholder.com/600x300";

const parseTags = (input) => {
  const raw = String(input || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const seen = new Set();
  const out = [];
  for (const t of raw) {
    const k = t.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(t);
    }
  }
  return out;
};

const getId = (p) => p?.id ?? p?._id;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const BlogForm = ({ onSubmit, editingPost, onCancel, submitLabel, busy = false }) => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    imageUrl: "",
    imageFile: null,  // UI-only unless you implement upload
    imagePreview: "", // URL or blob
    author: "Admin",
    rating: 0,
  });

  const [errors, setErrors] = useState({});
  const tagsArray = useMemo(() => parseTags(form.tags), [form.tags]);

  // Track current blob URL so we can revoke properly
  const blobUrlRef = useRef("");

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      tags: "",
      imageUrl: "",
      imageFile: null,
      imagePreview: "",
      author: "Admin",
      rating: 0,
    });
    setErrors({});
  };

  // Hydrate when editing
  useEffect(() => {
    // revoke any existing blob URL when switching modes/posts
    if (blobUrlRef.current) {
      try { URL.revokeObjectURL(blobUrlRef.current); } catch {}
      blobUrlRef.current = "";
    }

    if (!editingPost) {
      resetForm();
      return;
    }

    const image = editingPost.image || "";

    setForm({
      title: editingPost.title || "",
      content: editingPost.content || "",
      tags: Array.isArray(editingPost.tags) ? editingPost.tags.join(", ") : "",
      imageUrl: image,
      imageFile: null,
      imagePreview: image,
      author: editingPost.author || "Admin",
      rating: Number(editingPost.rating || 0),
    });
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPost]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        try { URL.revokeObjectURL(blobUrlRef.current); } catch {}
      }
    };
  }, []);

  const setField = (key) => (e) => {
    const value = e.target.value;

    setForm((p) => {
      const next = { ...p, [key]: value };

      if (key === "imageUrl") {
        const url = value.trim();

        // If user types a URL -> show it immediately
        if (url) {
          next.imagePreview = url;
        } else {
          // If URL cleared: keep file preview if exists, else fall back to editing image (or empty)
          if (p.imageFile && blobUrlRef.current) next.imagePreview = blobUrlRef.current;
          else next.imagePreview = editingPost?.image || "";
        }
      }

      if (key === "rating") {
        const num = Number(value);
        next.rating = Number.isFinite(num) ? clamp(num, 0, 5) : 0;
      }

      return next;
    });

    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (blobUrlRef.current) {
      try { URL.revokeObjectURL(blobUrlRef.current); } catch {}
      blobUrlRef.current = "";
    }

    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;

    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: blobUrl,
      // Optional: clear URL when file is chosen:
      // imageUrl: "",
    }));
  };

  const validate = () => {
    const next = {};
    const title = form.title.trim();
    const content = form.content.trim();
    const ratingNum = Number(form.rating);

    if (!title) next.title = "Title is required.";
    else if (title.length < 4) next.title = "Title must be at least 4 characters.";

    if (!content) next.content = "Content is required.";
    else if (content.length < 20) next.content = "Content must be at least 20 characters.";

    if (!Number.isFinite(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      next.rating = "Rating must be between 0 and 5.";
    }

    if (form.imageUrl.trim()) {
      try {
        const u = new URL(form.imageUrl.trim());
        if (!/^https?:$/.test(u.protocol)) next.imageUrl = "Image URL must start with http/https.";
      } catch {
        next.imageUrl = "Image must be a valid URL (https://...)";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (busy) return;
    if (!validate()) return;

    const payload = {
      id: getId(editingPost) || undefined,
      title: form.title.trim(),
      content: form.content.trim(),
      tags: tagsArray,
      image: form.imageUrl.trim() || form.imagePreview || PLACEHOLDER_IMG,
      author: form.author.trim() || "Admin",
      rating: clamp(Number(form.rating) || 0, 0, 5),
    };

    onSubmit?.(payload, { imageFile: form.imageFile });

    // Clear only if adding
    if (!editingPost) resetForm();
  };

  const isEditing = !!editingPost;

  return (
    <form className="blog-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? "Edit Post" : "Add New Post"}</h2>

      <label className={`field ${errors.title ? "is-error" : ""}`}>
        <span>Title</span>
        <input
          type="text"
          value={form.title}
          onChange={setField("title")}
          placeholder="Title"
          required
          minLength={4}
          disabled={busy}
        />
        {errors.title ? <div className="field-error">{errors.title}</div> : null}
      </label>

      <label className={`field ${errors.content ? "is-error" : ""}`}>
        <span>Content</span>
        <textarea
          value={form.content}
          onChange={setField("content")}
          placeholder="Write your blog content…"
          rows={6}
          required
          minLength={20}
          disabled={busy}
        />
        {errors.content ? <div className="field-error">{errors.content}</div> : null}
      </label>

      <label className="field">
        <span>Tags</span>
        <input
          type="text"
          value={form.tags}
          onChange={setField("tags")}
          placeholder="Tags (comma separated)"
          disabled={busy}
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

      <label className={`field ${errors.imageUrl ? "is-error" : ""}`}>
        <span>Image URL (recommended)</span>
        <input
          type="text"
          value={form.imageUrl}
          onChange={setField("imageUrl")}
          placeholder="https://…"
          disabled={busy}
        />
        {errors.imageUrl ? <div className="field-error">{errors.imageUrl}</div> : null}
      </label>

      <label className="field">
        <span>Or choose an image file (preview only)</span>
        <input type="file" accept="image/*" onChange={handleImageFile} disabled={busy} />
      </label>

      {form.imagePreview ? (
        <img
          src={form.imagePreview}
          alt="Preview"
          className="image-preview"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMG;
          }}
        />
      ) : null}

      <div className="row">
        <label className="field">
          <span>Author</span>
          <input
            type="text"
            value={form.author}
            onChange={setField("author")}
            disabled={busy}
          />
        </label>

        <label className={`field ${errors.rating ? "is-error" : ""}`}>
          <span>Rating (0–5)</span>
          <input
            type="number"
            min="0"
            max="5"
            step="1"
            value={form.rating}
            onChange={setField("rating")}
            disabled={busy}
          />
          {errors.rating ? <div className="field-error">{errors.rating}</div> : null}
        </label>
      </div>

      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="btn secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        ) : null}

        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? "Saving…" : submitLabel || (isEditing ? "Update Post" : "Add Post")}
        </button>
      </div>
    </form>
  );
};

export default BlogForm;

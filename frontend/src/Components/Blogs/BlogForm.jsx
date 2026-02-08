import React, { useEffect, useMemo, useRef, useState } from "react";
import StarRating from "../StarRating/StarRating";
import "./BlogForm.css";

const PLACEHOLDER_IMG = "https://via.placeholder.com/600x300";

/* ---------------- Utils ---------------- */

const parseTags = (input) =>
  [...new Set(
    String(input || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  )];

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const DRAFT_KEY = "blog_draft";

/* ---------------- Component ---------------- */

export default function BlogForm({
  onSubmit,
  editingPost,
  onCancel,
  submitLabel,
  busy = false,
}) {
  const blobRef = useRef("");

  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    imageUrl: "",
    preview: "",
    imageFile: null,
    author: "Admin",
    rating: 0,
  });

  const [errors, setErrors] = useState({});

  /* ---------------- Reading Time ---------------- */

  const readingTime = useMemo(() => {
    const words = form.content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [form.content]);

  const tagsArray = useMemo(() => parseTags(form.tags), [form.tags]);

  /* ---------------- Draft Autosave ---------------- */

  useEffect(() => {
    if (editingPost) return;

    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form, editingPost]);

  useEffect(() => {
    if (editingPost) return;

    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch {}
    }
  }, [editingPost]);

  /* ---------------- Editing Hydration ---------------- */

  useEffect(() => {
    if (!editingPost) return;

    setForm({
      title: editingPost.title || "",
      content: editingPost.content || "",
      tags: (editingPost.tags || []).join(", "),
      imageUrl: editingPost.image || "",
      preview: editingPost.image || "",
      imageFile: null,
      author: editingPost.author || "Admin",
      rating: Number(editingPost.rating || 0),
    });
  }, [editingPost]);

  /* ---------------- Cleanup Blob ---------------- */

  useEffect(() => {
    return () => {
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, []);

  /* ---------------- Field Setter ---------------- */

  const setField = (key) => (e) => {
    const val = e.target.value;

    setForm((p) => ({
      ...p,
      [key]: key === "rating" ? clamp(Number(val), 0, 5) : val,
    }));

    setErrors((p) => ({ ...p, [key]: "" }));
  };

  /* ---------------- Drag & Drop Upload ---------------- */

  const handleFile = (file) => {
    if (!file) return;

    if (blobRef.current) URL.revokeObjectURL(blobRef.current);

    const blob = URL.createObjectURL(file);
    blobRef.current = blob;

    setForm((p) => ({
      ...p,
      imageFile: file,
      preview: blob,
    }));
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const next = {};

    if (!form.title.trim())
      next.title = "Title required";

    if (form.content.trim().length < 20)
      next.content = "Minimum 20 characters";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ---------------- Submit ---------------- */

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    localStorage.removeItem(DRAFT_KEY);

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      tags: tagsArray,
      image: form.imageUrl || PLACEHOLDER_IMG,
      author: form.author || "Admin",
      rating: form.rating,
    };

    onSubmit?.(payload, { imageFile: form.imageFile });
  };

  /* ---------------- UI ---------------- */

  return (
    <form className="blog-form" onSubmit={submit}>
      <h2>{editingPost ? "Edit Blog" : "Create Blog"}</h2>

      {/* Title */}
      <label className={`field ${errors.title ? "is-error" : ""}`}>
        <span>Title</span>
        <input value={form.title} onChange={setField("title")} />
        <small>{form.title.length}/80</small>
        {errors.title && <p className="field-error">{errors.title}</p>}
      </label>

      {/* Content */}
      <label className={`field ${errors.content ? "is-error" : ""}`}>
        <span>Content</span>
        <textarea
          rows={6}
          value={form.content}
          onChange={setField("content")}
        />
        <small>{readingTime} min read</small>
        {errors.content && <p className="field-error">{errors.content}</p>}
      </label>

      {/* Tags */}
      <label className="field">
        <span>Tags</span>
        <input value={form.tags} onChange={setField("tags")} />

        <div className="tag-preview">
          {tagsArray.map((t) => (
            <span key={t} className="tag-chip">{t}</span>
          ))}
        </div>
      </label>

      {/* Drag Drop Upload */}
      <div
        className="upload-drop"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        Drag image here or click upload
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {form.preview && (
        <img
          src={form.preview}
          className="image-preview"
          onError={(e) => (e.target.src = PLACEHOLDER_IMG)}
        />
      )}

      {/* Author + Rating */}
      <div className="row">
        <label className="field">
          <span>Author</span>
          <input value={form.author} onChange={setField("author")} />
        </label>

        <div className="field">
          <span>Rating</span>
          <StarRating
            value={form.rating}
            onChange={(v) => setForm((p) => ({ ...p, rating: v }))}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel
          </button>
        )}

        <button className="btn primary">
          {busy ? "Saving..." : submitLabel || "Save"}
        </button>
      </div>
    </form>
  );
}

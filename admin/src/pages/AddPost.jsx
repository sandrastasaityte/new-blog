import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { usePosts } from "../Context/PostsContext";

import { AUTHORS } from "../assets/authors";

import "./AddPost.css";

const PLACEHOLDER_IMG = "https://via.placeholder.com/600x300";

const COMMON_TAGS = [
  "Economics","Trade","AI","Finance","Investment",
  "Technology","Programming","Startups","Web","Cloud",
  "Lifestyle","Productivity","Writing","Creativity"
];

function parseTags(input) {
  if (!input) return [];
  return input
    .split(",")
    .map(t => t.trim())
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
  return text.toLowerCase().trim().replace(/[^\w\s-]/g,"").replace(/\s+/g,"-");
}

/* ⭐ IMPORTANT CHANGE → redirectTo prop */

export default function AddBlog({ redirectTo = "/blogs" }) {

  const navigate = useNavigate();
  const { addPost } = usePosts();
  const previewRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    image: "",
    author: AUTHORS[0]?.name || ""
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [suggestedTags, setSuggestedTags] = useState([]);

  /* ---------- Draft Autosave ---------- */

  useEffect(() => {
    localStorage.setItem("blog_draft", JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    const draft = localStorage.getItem("blog_draft");
    if (draft) setForm(JSON.parse(draft));
  }, []);

  /* ---------- Tags ---------- */

  const tagsArray = useMemo(() => parseTags(form.tags), [form.tags]);

  const setField = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    setErrors(prev => ({ ...prev, [key]: "" }));
    setApiError("");
  };

  const addTag = (tag) => {
    if (!tagsArray.includes(tag)) {
      setForm(p => ({ ...p, tags: tagsArray.concat(tag).join(", ") }));
    }
  };

  const removeTag = (tag) => {
    setForm(p => ({ ...p, tags: tagsArray.filter(t => t !== tag).join(", ") }));
  };

  /* ---------- Auto Tag Suggest ---------- */

  useEffect(() => {
    if (!form.content) return setSuggestedTags([]);

    const lowerContent = form.content.toLowerCase();

    const matched = COMMON_TAGS.filter(tag =>
      lowerContent.includes(tag.toLowerCase()) &&
      !tagsArray.includes(tag)
    );

    setSuggestedTags(matched);

  }, [form.content, tagsArray]);

  /* ---------- Upload ---------- */

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setForm(p => ({ ...p, image: reader.result }));
    reader.readAsDataURL(file);
  };

  /* ---------- Validation ---------- */

  const validate = () => {
    const errs = {};

    if (!form.title || form.title.trim().length < 4)
      errs.title = "Title must be at least 4 characters";

    if (!form.content || form.content.trim().length < 20)
      errs.content = "Content must be at least 20 characters";

    if (form.image && !form.image.startsWith("data:") && !isValidHttpUrl(form.image))
      errs.image = "Invalid URL";

    else if (form.image && !form.image.startsWith("data:") && !isImageUrl(form.image))
      errs.image = "URL must be an image";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ---------- Cancel ---------- */

  const handleCancel = () => navigate(redirectTo);

  /* ---------- Submit ---------- */

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
      image: form.image || null,
      author: form.author.trim(),
      createdAt: new Date().toISOString()
    };

    try {

      await addPost(payload);

      localStorage.removeItem("blog_draft");

      /* ⭐ Redirect configurable */
      navigate(redirectTo);

    } catch (err) {
      setApiError(err.message || "Failed to create blog");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Preview ---------- */

  const previewSrc = form.image || PLACEHOLDER_IMG;

  const markdownPreview = useMemo(() => ({
    __html: DOMPurify.sanitize(marked.parse(form.content || ""))
  }), [form.content]);

  useEffect(() => {
    if (previewRef.current)
      previewRef.current.scrollTop = previewRef.current.scrollHeight;
  }, [form.content]);

  /* ---------- UI ---------- */

  return (
    <form className="add-blog-form" onSubmit={handleSubmit}>

      <h3>Add New Blog</h3>

      {apiError && <div className="form-error">{apiError}</div>}

      {/* Title */}
      <label className="field">
        <span>Title</span>
        <input value={form.title} onChange={setField("title")} disabled={submitting}/>
        {errors.title && <div className="field-error">{errors.title}</div>}
      </label>

      {/* Content */}
      <label className="field">
        <span>Content</span>
        <textarea value={form.content} onChange={setField("content")} rows={7} disabled={submitting}/>
        {errors.content && <div className="field-error">{errors.content}</div>}
        {form.content && (
          <div ref={previewRef} className="markdown-preview"
            dangerouslySetInnerHTML={markdownPreview}/>
        )}
      </label>

      {/* Suggested Tags */}
      {suggestedTags.length > 0 && (
        <div className="tag-suggestions">
          {suggestedTags.map(t => (
            <button type="button" key={t}
              className="tag-suggestion-btn"
              onClick={() => addTag(t)}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Tags */}
      <label className="field">
        <span>Tags</span>
        <input value={form.tags} onChange={setField("tags")} />
        <div className="tag-preview">
          {tagsArray.map(t => (
            <span key={t} className="tag-chip" onClick={() => removeTag(t)}>
              {t} ×
            </span>
          ))}
        </div>
      </label>

      {/* Image */}
      <label className="field">
        <span>Image URL or Upload</span>
        <input
          type="text"
          value={form.image.startsWith("data:") ? "" : form.image}
          onChange={setField("image")}
        />
        <input type="file" accept="image/*" onChange={handleFileUpload} />
        {errors.image && <div className="field-error">{errors.image}</div>}

        <div className="image-preview-wrap">
          <img className="image-preview"
            src={previewSrc}
            alt="Preview"
            onError={(e)=>{e.currentTarget.src = PLACEHOLDER_IMG}}
          />
        </div>
      </label>

      {/* Author */}
      <label className="field">
        <span>Author</span>
        <select value={form.author} onChange={setField("author")}>
          {AUTHORS.map(a => (
            <option key={a.id} value={a.name}>{a.name}</option>
          ))}
        </select>
      </label>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="btn secondary"
          onClick={handleCancel}>
          Cancel
        </button>

        <button type="submit" className="btn primary"
          disabled={submitting}>
          Add Blog
        </button>
      </div>

    </form>
  );
}

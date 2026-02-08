import React, { useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { createBlog, uploadFile } from "../../lib/blogApi";
import { usePosts } from "../../Context/PostsContext";
import "./AddBlogModal.css";

const PLACEHOLDER = "https://via.placeholder.com/600x300";
const DRAFT_KEY = "blog_draft";

marked.setOptions({ mangle: false, headerIds: false });

function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export default function AddBlogModal({ isOpen, onClose }) {
  const { addPost } = usePosts();
  const modalRef = useRef(null);
  const titleRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    image: "",
    rating: 0,
  });

  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  /* ================= Draft Autosave ================= */
  useEffect(() => {
    if (!isOpen) return;

    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) setForm(JSON.parse(saved));

  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  /* ================= Undo / Redo ================= */
  const pushHistory = (newState) => {
    setHistory(h => [...h, form]);
    setRedoStack([]);
    setForm(newState);
  };

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setRedoStack(r => [form, ...r]);
    setHistory(h => h.slice(0, -1));
    setForm(prev);
  };

  const redo = () => {
    if (!redoStack.length) return;
    const next = redoStack[0];
    setHistory(h => [...h, form]);
    setRedoStack(r => r.slice(1));
    setForm(next);
  };

  /* ================= Markdown Preview ================= */
  const preview = useMemo(() => ({
    __html: DOMPurify.sanitize(marked.parse(form.content || "")),
  }), [form.content]);

  /* ================= Drag & Drop Upload ================= */
  const onDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await uploadFile(fd);
      pushHistory({ ...form, image: res.url });
    } catch {
      setApiError("Upload failed");
    }
  };

  /* ================= Toolbar ================= */
  const insertMarkdown = (syntax) => {
    pushHistory({
      ...form,
      content: form.content + syntax,
    });
  };

  /* ================= Submit ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const blog = await createBlog({
        ...form,
        tags: form.tags.split(",").map(t => t.trim()),
        image: form.image || PLACEHOLDER,
        date: new Date().toISOString(),
      });

      addPost(blog);
      localStorage.removeItem(DRAFT_KEY);
      onClose();

    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal premium"
        ref={modalRef}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <header className="modal-header">
          <h3>Add Blog</h3>
          <button onClick={onClose}>×</button>
        </header>

        <form className="modal-body" onSubmit={handleSubmit}>
          {apiError && <div className="error">{apiError}</div>}

          {/* Toolbar */}
          <div className="toolbar">
            <button type="button" onClick={() => insertMarkdown("**bold**")}>B</button>
            <button type="button" onClick={() => insertMarkdown("_italic_")}>I</button>
            <button type="button" onClick={() => insertMarkdown("### Heading")}>H</button>
            <button type="button" onClick={undo}>Undo</button>
            <button type="button" onClick={redo}>Redo</button>
          </div>

          <input
            ref={titleRef}
            placeholder="Title"
            value={form.title}
            onChange={(e) => pushHistory({ ...form, title: e.target.value })}
            required
          />

          <textarea
            rows={8}
            placeholder="Write blog..."
            value={form.content}
            onChange={(e) => pushHistory({ ...form, content: e.target.value })}
          />

          <input
            placeholder="Tags"
            value={form.tags}
            onChange={(e) => pushHistory({ ...form, tags: e.target.value })}
          />

          <input
            placeholder="Image URL or drag image"
            value={form.image}
            onChange={(e) => pushHistory({ ...form, image: e.target.value })}
          />

          <div className="image-preview">
            <img src={form.image || PLACEHOLDER} alt="" />
          </div>

          <div className="preview"
               dangerouslySetInnerHTML={preview} />

          <div className="actions">
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

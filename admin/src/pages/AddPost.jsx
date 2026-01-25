import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
import { usePosts } from "../Context/PostsContext";

function normalizeTags(input) {
  const raw = input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const seen = new Map();
  for (const t of raw) {
    const key = t.toLowerCase();
    if (!seen.has(key)) seen.set(key, t);
  }
  return Array.from(seen.values());
}

export default function AddPost() {
  const nav = useNavigate();
  const { addPost } = usePosts();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [ok, setOk] = useState("");
  const [localError, setLocalError] = useState("");

  const tags = useMemo(() => normalizeTags(tagInput), [tagInput]);
  const canSubmit = title.trim().length > 0 && !saving;

  const onSubmit = async (e) => {
    e.preventDefault();
    setOk("");
    setLocalError("");

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setLocalError("Title is required.");
      return;
    }

    setSaving(true);
    try {
      // PostsContext(local) expects a single post object
      addPost({
        title: cleanTitle,
        content: content.trim(),
        image: image.trim(),
        tags,
        date: new Date().toISOString(),
        views: 0,
        likes: 0,
        comments: [],
      });

      setOk("Post created ✅");
      nav("/admin/posts", { replace: true });
    } catch (e2) {
      setLocalError(e2?.message || "Failed to create post.");
      console.error(e2);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <h1>Add Post</h1>
          <p className="admin-muted">Create a new post.</p>
        </div>
      </div>

      {ok ? <div className="form-ok">{ok}</div> : null}
      {localError ? <div className="form-error">{localError}</div> : null}

      <form className="admin-form" onSubmit={onSubmit}>
        <label>
          Title <span style={{ opacity: 0.6 }}>(required)</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            disabled={saving}
          />
        </label>

        <label>
          Image URL (optional)
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
            disabled={saving}
          />
        </label>

        <label>
          Tags (comma separated)
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="news, tech, lifestyle"
            disabled={saving}
          />

          {tags.length ? (
            <div className="tags-preview" style={{ marginTop: 8 }}>
              {tags.map((t) => (
                <span className="tag-chip" key={t.toLowerCase()}>
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </label>

        <label>
          Content
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post..."
            disabled={saving}
          />
        </label>

        <div className="form-actions">
          <button className="btn primary" disabled={!canSubmit} type="submit">
            {saving ? "Saving..." : "Publish"}
          </button>

          <button
            className="btn"
            type="button"
            onClick={() => nav("/admin/posts")}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

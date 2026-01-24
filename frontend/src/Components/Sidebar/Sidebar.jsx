import React, { useMemo } from "react";
import "./Sidebar.css";

const getId = (p) => p?.id ?? p?._id;

const safeDateNum = (d) => {
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const safeDateLabel = (d) => {
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? "" : t.toLocaleDateString();
};

export default function Sidebar({
  posts = [],
  uniqueTags = [],
  filterTags = [],
  setFilterTags,
  onSelectPost,
}) {
  const toggleTag = (tag) => {
    if (typeof setFilterTags !== "function") return;

    setFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const recent = useMemo(() => {
    return [...(posts || [])]
      .sort((a, b) => safeDateNum(b?.date) - safeDateNum(a?.date))
      .slice(0, 6);
  }, [posts]);

  return (
    <aside className="sidebar">
      <div className="sidebar-card">
        <h3 className="sidebar-title">Tags</h3>

        {uniqueTags.length === 0 ? (
          <p className="sidebar-muted">No tags yet.</p>
        ) : (
          <div className="sidebar-tags" aria-label="Filter by tags">
            {uniqueTags.map((tag) => {
              const active = filterTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`sidebar-tag ${active ? "active" : ""}`}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={active}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="sidebar-card">
        <h3 className="sidebar-title">Recent Posts</h3>

        {recent.length === 0 ? (
          <p className="sidebar-muted">No posts yet.</p>
        ) : (
          <div className="sidebar-list">
            {recent.map((p, idx) => {
              const id = getId(p);
              const key = id ? String(id) : `recent-${idx}`;

              const title = p?.title || "Untitled post";
              const meta = `${p?.author || "Admin"}${
                p?.date ? ` • ${safeDateLabel(p.date)}` : ""
              }`;

              return (
                <button
                  key={key}
                  type="button"
                  className="sidebar-post"
                  onClick={() => onSelectPost?.(p)}
                  aria-label={`Open post: ${title}`}
                >
                  <p className="sidebar-post-title">{title}</p>
                  <p className="sidebar-post-meta">{meta}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

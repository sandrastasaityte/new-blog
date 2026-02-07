import React, { useState, useMemo } from "react";
import { usePosts } from "../../Context/PostsContext";
import "./Sidebar.css";

export default function Sidebar({ filterTags = [], setFilterTags, onSelectPost }) {
  const { posts, uniqueTags } = usePosts();
  const [keyword, setKeyword] = useState("");

  const filteredPosts = useMemo(() => {
    return posts
      .filter((p) =>
        (p.title + " " + p.content).toLowerCase().includes(keyword.toLowerCase())
      )
      .filter((p) =>
        filterTags.length ? p.tags?.some((t) => filterTags.includes(t)) : true
      )
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }, [posts, keyword, filterTags]);

  const toggleTag = (tag) => {
    if (!setFilterTags) return;
    setFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getPostId = (p) => p._id || p.id || null;

  return (
    <aside className="sidebar">
      <div className="sidebar-card">
        <input
          type="text"
          placeholder="Search posts..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="sidebar-search"
        />
      </div>

      <div className="sidebar-card">
        <h3 className="sidebar-title">Tags</h3>
        {uniqueTags.length ? (
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
        ) : (
          <p className="sidebar-muted">No tags yet.</p>
        )}
      </div>

      <div className="sidebar-card">
        <h3 className="sidebar-title">Recent Posts</h3>
        {filteredPosts.length ? (
          <div className="sidebar-list">
            {filteredPosts.slice(0, 6).map((p, idx) => (
              <button
                key={getPostId(p) || `recent-${idx}`}
                type="button"
                className="sidebar-post"
                onClick={() => onSelectPost?.(p)}
                aria-label={`Open post: ${p.title}`}
              >
                <p className="sidebar-post-title">{p.title}</p>
                <p className="sidebar-post-meta">
                  {p.author}{" "}
                  {(p.date || p.createdAt) &&
                    `• ${new Date(p.date || p.createdAt).toLocaleDateString()}`}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="sidebar-muted">No matching posts.</p>
        )}
      </div>
    </aside>
  );
}

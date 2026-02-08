import React, { useState, useMemo } from "react";
import { usePosts } from "../../Context/PostsContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({
  filterTags = [],
  setFilterTags,
  onSelectPost,
}) {
  const { posts, uniqueTags } = usePosts();

  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState("");

  /* ---------------- Search + Filter ---------------- */
  const filteredPosts = useMemo(() => {
    const kw = keyword.toLowerCase();

    return posts
      .filter((p) =>
        `${p.title || ""} ${p.content || ""}`
          .toLowerCase()
          .includes(kw)
      )
      .filter((p) =>
        filterTags.length
          ? p.tags?.some((t) => filterTags.includes(t))
          : true
      )
      .sort(
        (a, b) =>
          new Date(b.date || b.createdAt) -
          new Date(a.date || a.createdAt)
      );
  }, [posts, keyword, filterTags]);

  /* ---------------- Toggle Tag ---------------- */
  const toggleTag = (tag) => {
    if (!setFilterTags) return;

    setFilterTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const getPostId = (p) => p?._id || p?.id || null;

  /* ---------------- SAFE Post Open ---------------- */
  const openPost = (post) => {
    if (!post) return;

    // If parent provided modal open handler
    if (onSelectPost) {
      onSelectPost(post);
      return;
    }

    // Fallback → open modal using URL
    const id = getPostId(post);
    if (!id) return;

    const sp = new URLSearchParams(location.search);
    sp.set("open", id);

    navigate(`/blogs?${sp.toString()}`);
  };

  /* ---------------- JSX ---------------- */
  return (
    <aside className="sidebar">
      {/* ===== SEARCH ===== */}
      <div className="sidebar-card">
        <input
          type="text"
          placeholder="Search posts..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="sidebar-search"
          aria-label="Search blog posts"
        />
      </div>

      {/* ===== TAGS ===== */}
      <div className="sidebar-card">
        <h3 className="sidebar-title">Tags</h3>

        {uniqueTags.length ? (
          <div className="sidebar-tags" aria-label="Filter by tags">
            {uniqueTags.map((tag) => {
              const active = filterTags.includes(tag);

              return (
                <button
                  key={`tag-${tag}`}
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

      {/* ===== RECENT POSTS ===== */}
      <div className="sidebar-card">
        <h3 className="sidebar-title">Recent Posts</h3>

        {filteredPosts.length ? (
          <div className="sidebar-list">
            {filteredPosts.slice(0, 6).map((p) => {
              const id = getPostId(p);

              return (
                <button
                  key={`recent-${id}`}
                  type="button"
                  className="sidebar-post"
                  onClick={() => openPost(p)}
                  aria-label={`Open post: ${p.title}`}
                >
                  <p className="sidebar-post-title">
                    {p.title}
                  </p>

                  <p className="sidebar-post-meta">
                    {p.author || "Admin"}

                    {(p.date || p.createdAt) &&
                      ` • ${new Date(
                        p.date || p.createdAt
                      ).toLocaleDateString()}`}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="sidebar-muted">No matching posts.</p>
        )}
      </div>
    </aside>
  );
}

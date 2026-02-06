import React, { useState, useMemo, useCallback, useEffect } from "react";
import { usePosts } from "../../Context/PostsContext";
import BlogCard from "./BlogCard";
import BlogModal from "./BlogModal";
import Pagination from "./Pagination";
import Sidebar from "../Sidebar/Sidebar";
import "./Blogs.css";
import { useModalSync } from "../../hooks/useModalSync";

const PER_PAGE = 6;

// ---------------- Utils ----------------
const safeDateNum = (d) => {
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
};
const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase();
const getId = (p) => p?._id ?? p?.id;

export default function Blogs() {
  const { posts = [], loading, error, addComment, toggleLike } = usePosts();
  const [filterTags, setFilterTags] = useState([]);
  const [page, setPage] = useState(1);

  const { selectedId, openPost, closeModal } = useModalSync(posts);

  // ---------------- Unique tags ----------------
  const uniqueTags = useMemo(() => {
    const map = new Map();
    posts.forEach((p) => {
      (p?.tags || []).forEach((t) => {
        const raw = String(t || "").trim();
        if (!raw) return;
        const key = raw.toLowerCase();
        if (!map.has(key)) map.set(key, raw);
      });
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  // ---------------- Filtered posts ----------------
  const filteredPosts = useMemo(() => {
    if (!filterTags.length) return posts;
    const selected = filterTags.map(norm);
    return posts.filter((p) => {
      const postTags = (p?.tags || []).map(norm);
      return selected.every((t) => postTags.includes(t));
    });
  }, [posts, filterTags]);

  // ---------------- Sorted newest first ----------------
  const sortedPosts = useMemo(
    () =>
      [...filteredPosts].sort(
        (a, b) => safeDateNum(b?.date) - safeDateNum(a?.date),
      ),
    [filteredPosts],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedPosts.length / PER_PAGE)),
    [sortedPosts],
  );

  // Reset page when filters change
  useEffect(() => setPage(1), [filterTags]);
  useEffect(
    () => setPage((p) => Math.min(Math.max(1, p), totalPages)),
    [totalPages],
  );

  // ---------------- Current page slice ----------------
  const pagedPosts = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return sortedPosts.slice(start, start + PER_PAGE);
  }, [sortedPosts, page]);

  // ---------------- Selected post ----------------
  const selectedPost = useMemo(() => {
    if (!selectedId) return null;
    return posts.find((p) => String(getId(p)) === selectedId) || null;
  }, [selectedId, posts]);

  // ---------------- Handlers ----------------
  const handleAddComment = useCallback(
    (postId, payload) => {
      if (!postId) return;
      const text =
        typeof payload === "string"
          ? payload.trim()
          : String(payload?.text || "").trim();
      if (!text) return;
      addComment?.(postId, text);
    },
    [addComment],
  );

  const handleLike = useCallback(
    (postId) => postId && toggleLike?.(postId),
    [toggleLike],
  );
  const removeTag = useCallback(
    (t) => setFilterTags((prev) => prev.filter((x) => x !== t)),
    [],
  );
  const clearFilters = useCallback(() => setFilterTags([]), []);

  // ---------------- Render ----------------
  return (
    <div className="blogs-page">
      <div className="blogs-layout">
        <main className="blogs-main">
          <div className="blogs-head">
            <h1>Blogs</h1>

            {filterTags.length > 0 && (
              <div className="active-filters">
                <span className="filters-label">Active filters:</span>
                {filterTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="filter-chip"
                    onClick={() => removeTag(t)}
                  >
                    {t} <span aria-hidden>×</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="clear-filters"
                  onClick={clearFilters}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="blogs-loading">
              <h3>Loading posts...</h3>
            </div>
          ) : error ? (
            <div className="blogs-error">
              <h3>Error loading posts</h3>
              <p>{error}</p>
            </div>
          ) : sortedPosts.length === 0 ? (
            <div className="blogs-empty">
              <h3>No posts found</h3>
              <p>Try removing filters.</p>
            </div>
          ) : (
            <>
              <div className="blogs-grid">
                {pagedPosts.map((post) => (
                  <BlogCard
                    key={String(getId(post))}
                    post={post}
                    onReadMore={() => openPost(post)}
                  />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </>
          )}
        </main>

        <Sidebar
          posts={sortedPosts}
          uniqueTags={uniqueTags}
          filterTags={filterTags}
          setFilterTags={setFilterTags}
          onSelectPost={openPost}
        />
      </div>

      {selectedPost && (
        <BlogModal
          post={selectedPost}
          onClose={closeModal}
          onAddComment={handleAddComment}
          onLike={handleLike}
        />
      )}
    </div>
  );
}

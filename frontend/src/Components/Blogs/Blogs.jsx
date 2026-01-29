import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BlogCard from "./BlogCard";
import BlogModal from "./BlogModal";
import Pagination from "./Pagination";
import Sidebar from "../Sidebar/Sidebar";
import "./Blogs.css";

import { usePosts } from "../../Context/PostsContext";

const PER_PAGE = 6;
const safeDateNum = (d) => {
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
};
const getId = (p) => p?._id ?? p?.id;
const norm = (s) => String(s || "").trim().toLowerCase();

function useModalSync(posts) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const openedFromUrlRef = useRef(false);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const openId = sp.get("open");

    if (openId) {
      const id = decodeURIComponent(openId).trim();
      const post = posts.find((p) => String(getId(p)) === id);
      if (post) {
        openedFromUrlRef.current = true;
        setSelectedId(id);
      }
    } else {
      openedFromUrlRef.current = false;
      setSelectedId(null);
    }
  }, [location.search, posts]);

  const closeModal = () => {
    setSelectedId(null);
    const sp = new URLSearchParams(location.search);
    if (sp.has("open")) {
      sp.delete("open");
      const next = sp.toString();
      navigate(`/blogs${next ? `?${next}` : ""}`, { replace: true });
    }
  };

  const openPost = (post) => {
    const id = getId(post);
    if (!id) return;

    const sp = new URLSearchParams(location.search);
    sp.set("open", id);
    navigate(`/blogs?${sp.toString()}`, { replace: true });

    setSelectedId(id);
    return id;
  };

  return { selectedId, openPost, closeModal, openedFromUrlRef };
}

export default function Blogs() {
  const { posts, incViews, addComment, toggleLike } = usePosts();
  const [filterTags, setFilterTags] = useState([]);
  const [page, setPage] = useState(1);

  const { selectedId, openPost, closeModal, openedFromUrlRef } = useModalSync(posts);

  // ---------------- Unique tags ----------------
  const uniqueTags = useMemo(() => {
    const map = new Map();
    (posts || []).forEach((p) => {
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
    if (!filterTags.length) return posts || [];
    const selected = filterTags.map(norm);
    return (posts || []).filter((p) => {
      const postTags = (p?.tags || []).map(norm);
      return selected.every((t) => postTags.includes(t));
    });
  }, [posts, filterTags]);

  // ---------------- Sorted newest first ----------------
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort(
      (a, b) => safeDateNum(b?.date) - safeDateNum(a?.date)
    );
  }, [filteredPosts]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedPosts.length / PER_PAGE)),
    [sortedPosts.length]
  );

  // Reset page when filters change
  const filterKey = useMemo(
    () => filterTags.map(norm).sort().join("|"),
    [filterTags]
  );

  useEffect(() => setPage(1), [filterKey]);

  useEffect(() => setPage((p) => Math.min(Math.max(1, p), totalPages)), [totalPages]);

  // ---------------- Page slice ----------------
  const pagedPosts = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return sortedPosts.slice(start, start + PER_PAGE);
  }, [sortedPosts, page]);

  const selectedPost = useMemo(() => {
    if (!selectedId) return null;
    return (posts || []).find((p) => String(getId(p)) === selectedId) || null;
  }, [selectedId, posts]);

  const handleAddComment = (postId, payload) => {
    if (!postId) return;
    const text = typeof payload === "string" ? payload.trim() : String(payload?.text || "").trim();
    if (!text) return;
    addComment?.(postId, text);
  };

  const handleLike = (postId) => postId && toggleLike?.(postId);

  const removeTag = (t) => setFilterTags((prev) => prev.filter((x) => x !== t));
  const clearFilters = () => setFilterTags([]);

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
                  <button key={t} type="button" className="filter-chip" onClick={() => removeTag(t)}>
                    {t} <span aria-hidden>×</span>
                  </button>
                ))}
                <button type="button" className="clear-filters" onClick={clearFilters}>
                  Clear
                </button>
              </div>
            )}
          </div>

          {sortedPosts.length === 0 ? (
            <div className="blogs-empty">
              <h3>No posts found</h3>
              <p>Try removing filters.</p>
            </div>
          ) : (
            <>
              <div className="blogs-grid">
                {pagedPosts.map((post) => (
                  <BlogCard key={String(getId(post))} post={post} onReadMore={() => openPost(post)} />
                ))}
              </div>

              <Pagination currentPage={page} totalPages={totalPages} setPage={setPage} />
            </>
          )}
        </main>

        <Sidebar
          posts={sortedPosts}
          uniqueTags={uniqueTags}
          filterTags={filterTags}
          setFilterTags={setFilterTags}
          onSelectPost={(p) => openPost(p)}
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

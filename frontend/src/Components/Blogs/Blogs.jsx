import React, { useEffect, useMemo, useState } from "react";
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

const getId = (p) => p?.id ?? p?._id;
const norm = (s) => String(s || "").trim().toLowerCase();

const Blogs = () => {
  const { posts, incViews, addComment, toggleLike } = usePosts();

  const [selectedId, setSelectedId] = useState(null);
  const [filterTags, setFilterTags] = useState([]);
  const [page, setPage] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Unique tags
  const uniqueTags = useMemo(() => {
    const map = new Map(); // lower -> original
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

  // ✅ Filtered posts (AND logic)
  const filteredPosts = useMemo(() => {
    if (!filterTags.length) return posts || [];
    const selected = filterTags.map(norm);

    return (posts || []).filter((p) => {
      const postTags = (p?.tags || []).map(norm);
      return selected.every((t) => postTags.includes(t));
    });
  }, [posts, filterTags]);

  // ✅ Sorted newest first
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort(
      (a, b) => safeDateNum(b?.date) - safeDateNum(a?.date)
    );
  }, [filteredPosts]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedPosts.length / PER_PAGE));
  }, [sortedPosts.length]);

  // ✅ Reset page when filters change
  const filterKey = useMemo(
    () => JSON.stringify(filterTags.slice().map(norm).sort()),
    [filterTags]
  );

  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  // ✅ Clamp page
  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  // ✅ Page slice
  const pagedPosts = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return sortedPosts.slice(start, start + PER_PAGE);
  }, [sortedPosts, page]);

  // ✅ Selected post object
  const selectedPost = useMemo(() => {
    if (!selectedId) return null;
    return (
      (posts || []).find((p) => String(getId(p)) === String(selectedId)) || null
    );
  }, [selectedId, posts]);

  const openPost = (post) => {
    const id = getId(post);
    if (!id) return;

    incViews?.(id);
    setSelectedId(String(id));
  };

  const handleAddComment = (postId, payload) => {
    if (!postId) return;

    if (typeof payload === "string") {
      const text = payload.trim();
      if (!text) return;
      addComment?.(postId, text);
      return;
    }

    if (payload && typeof payload === "object") {
      const text = String(payload.text || "").trim();
      if (!text) return;

      // Keep your current string-only context expectation:
      addComment?.(postId, text);
    }
  };

  const handleLike = (postId) => {
    if (!postId) return;
    toggleLike?.(postId);
  };

  const removeTag = (t) => setFilterTags((prev) => prev.filter((x) => x !== t));
  const clearFilters = () => setFilterTags([]);

  // ✅ NEW: read query params (?open= and ?tag=)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const openId = sp.get("open");
    const tag = sp.get("tag");

    // apply tag filter (single tag)
    if (tag) {
      const decoded = decodeURIComponent(tag).trim();
      if (decoded) setFilterTags([decoded]);
    }

    // open modal by id
    if (openId) {
      const id = decodeURIComponent(openId).trim();
      if (!id) return;

      // find post
      const found = (posts || []).find((p) => String(getId(p)) === String(id));
      if (found) openPost(found);
    }
    // only re-run when search/posts changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, posts]);

  // ✅ NEW: when modal closes, remove ?open= from URL (keep tag if exists)
  const closeModal = () => {
    setSelectedId(null);

    const sp = new URLSearchParams(location.search);
    if (sp.has("open")) {
      sp.delete("open");
      const next = sp.toString();
      navigate(`/blogs${next ? `?${next}` : ""}`, { replace: true });
    }
  };

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

          {sortedPosts.length === 0 ? (
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
};

export default Blogs;

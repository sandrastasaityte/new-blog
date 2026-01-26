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

// ✅ prefer Mongo id
const getId = (p) => p?._id ?? p?.id;
const norm = (s) => String(s || "").trim().toLowerCase();

export default function Blogs() {
  const { posts, incViews, addComment, toggleLike } = usePosts();

  const [selectedId, setSelectedId] = useState(null);
  const [filterTags, setFilterTags] = useState([]);
  const [page, setPage] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();

  // prevents double view increments when opening from URL + local clicks
  const openedFromUrlRef = useRef(false);

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

    // Optional UX: when filters change, close modal + remove open param
    const sp = new URLSearchParams(location.search);
    if (sp.has("open")) {
      sp.delete("open");
      const next = sp.toString();
      navigate(`/blogs${next ? `?${next}` : ""}`, { replace: true });
      setSelectedId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const openPost = (post, { fromUrl = false } = {}) => {
    const id = getId(post);
    if (!id) return;

    // ✅ update URL so refresh keeps modal open
    const sp = new URLSearchParams(location.search);
    sp.set("open", String(id));
    navigate(`/blogs?${sp.toString()}`, { replace: true });

    // ✅ prevent double incViews when opened via URL parsing
    if (!fromUrl) incViews?.(id);

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
      addComment?.(postId, text);
    }
  };

  const handleLike = (postId) => {
    if (!postId) return;
    toggleLike?.(postId);
  };

  const removeTag = (t) => setFilterTags((prev) => prev.filter((x) => x !== t));
  const clearFilters = () => setFilterTags([]);

  // ✅ Read query params (?open= and ?tag=) once per change
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const openId = sp.get("open");
    const tag = sp.get("tag");

    // apply single tag only if user doesn't already have filters selected
    if (tag && filterTags.length === 0) {
      const decoded = decodeURIComponent(tag).trim();
      if (decoded) setFilterTags([decoded]);
    }

    if (openId) {
      const id = decodeURIComponent(openId).trim();
      if (!id) return;

      const found = (posts || []).find((p) => String(getId(p)) === String(id));
      if (found) {
        openedFromUrlRef.current = true;
        openPost(found, { fromUrl: true });
      }
    } else {
      openedFromUrlRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, posts]);

  // ✅ When modal closes, remove ?open=
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

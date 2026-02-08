// src/Components/BlogDetails/BlogDetails.jsx

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { usePosts } from "../../Context/PostsContext";
import BlogModal from "../Blogs/BlogModal";
import "./BlogDetails.css";

/* ========================= */
/* Helpers */
/* ========================= */

function getPostId(post) {
  return post?._id ?? post?.id ?? null;
}

function copyToClipboard(text) {
  if (navigator.clipboard) return navigator.clipboard.writeText(text);

  // fallback
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

/* ========================= */
/* Reading Progress Hook */
/* ========================= */

function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = null;

    const handleScroll = () => {
      if (raf) return;

      raf = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const height =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;

        const pct = height > 0 ? (scrollTop / height) * 100 : 0;
        setProgress(Math.min(100, Math.max(0, pct)));

        raf = null;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}

/* ========================= */
/* BlogDetails Component */
/* ========================= */

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const commentRef = useRef(null);

  const progress = useReadingProgress();

  const { posts, addComment, toggleLike, getPostById } = usePosts();

  /* ===== Resolve Post ===== */
  const post = useMemo(() => getPostById(id), [id, getPostById]);

  const postId = useMemo(() => getPostId(post), [post]);

  /* ===== Scroll to Top ===== */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  /* ===== SEO ===== */
  useEffect(() => {
    if (!post) return;

    const prevTitle = document.title;
    document.title = `${post.title} | Blog`;

    return () => {
      document.title = prevTitle;
    };
  }, [post]);

  /* ===== Safe Close ===== */
  const handleClose = useCallback(() => {
    if (location.key !== "default") navigate(-1);
    else navigate("/blogs");
  }, [navigate, location.key]);

  /* ===== Like Handler (FIXED) ===== */
  const handleLike = useCallback(() => {
    if (!postId) return;
    toggleLike(postId);
  }, [postId, toggleLike]);

  /* ===== Share Handler ===== */
  const handleShare = useCallback(() => {
    copyToClipboard(window.location.href);
  }, []);

  /* ===== Scroll To Comments ===== */
  const handleScrollComments = useCallback(() => {
    commentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  /* ===== Reading Time ===== */
  const readingTime = useMemo(() => {
    if (!post?.content) return 0;
    return Math.ceil(post.content.split(/\s+/).length / 200);
  }, [post]);

  /* ========================= */
  /* Loading Skeleton */
  /* ========================= */

  if (!posts?.length) {
    return <div className="blog-skeleton" />;
  }

  /* ========================= */
  /* Not Found */
  /* ========================= */

  if (!post) {
    return (
      <div className="blog-notfound">
        <h2>Blog not found</h2>
        <button onClick={() => navigate("/blogs")}>
          Back to Blogs
        </button>
      </div>
    );
  }

  /* ========================= */
  /* Render */
  /* ========================= */

  return (
    <>
      {/* ===== Reading Progress ===== */}
      <div className="reading-progress">
        <div style={{ width: `${progress}%` }} />
      </div>

      {/* ===== Floating Actions ===== */}
      <div className="floating-actions">
        <button
          aria-label="Like post"
          onClick={handleLike}
        >
          ⭐ {post.likes ?? 0}
        </button>

        <button
          aria-label="Copy link"
          onClick={handleShare}
        >
          🔗
        </button>

        <button
          aria-label="Go to comments"
          onClick={handleScrollComments}
        >
          💬
        </button>
      </div>

      {/* ===== Blog Modal ===== */}
      <BlogModal
        post={post}
        onClose={handleClose}
        onAddComment={addComment}
        onLike={handleLike}
        commentRef={commentRef}
        readingTime={readingTime}
      />
    </>
  );
}

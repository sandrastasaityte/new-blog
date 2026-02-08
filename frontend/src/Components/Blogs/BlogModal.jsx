// src/Components/Blogs/BlogModal.jsx

import React, { useEffect, useMemo, useRef, useId, useCallback } from "react";
import CommentSection from "../CommentSection/CommentSection";
import StarRating from "../StarRating/StarRating";
import "./BlogModal.css";

const PLACEHOLDER_IMG = "https://via.placeholder.com/600x300";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const safeDateLabel = (d) => {
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString();
};

const getId = (p) => p?._id ?? p?.id;

export default function BlogModal({
  post,
  onClose,
  onAddComment,
  onLike,
  onRate, // ⭐ NEW
}) {
  const modalRef = useRef(null);
  const lastActiveRef = useRef(null);
  const reactId = useId();

  const postId = useMemo(() => String(getId(post) ?? ""), [post]);

  const titleId = `blogmodal-title-${reactId}`;
  const descId = `blogmodal-desc-${reactId}`;

  /* ---------------- Safe Values ---------------- */

  const title = String(post?.title || "Untitled");
  const author = String(post?.author || "Admin");
  const dateLabel = safeDateLabel(post?.date || post?.createdAt);

  const views = Number(post?.views || 0);
  const likes = Number(post?.likes || 0);
  const rating = clamp(Number(post?.rating || 0), 0, 5);

  const content =
    String(post?.content || "").trim() || "No content available.";

  const image = String(post?.image || PLACEHOLDER_IMG);

  const comments = useMemo(() => post?.comments || [], [post?.comments]);

  /* ---------------- Focus Trap ---------------- */

  useEffect(() => {
    if (!post) return;

    lastActiveRef.current = document.activeElement;

    const t = setTimeout(() => {
      modalRef.current?.querySelector(FOCUSABLE)?.focus();
    }, 0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") return onClose?.();

      if (e.key !== "Tab") return;

      const root = modalRef.current;
      if (!root) return;

      const focusables = Array.from(root.querySelectorAll(FOCUSABLE));

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      lastActiveRef.current?.focus?.();
    };
  }, [post, onClose]);

  /* ---------------- Comment Handler ---------------- */

  const handleComment = useCallback(
    ({ text, rating: commentRating }) => {
      if (!postId) return;

      onAddComment?.(postId, {
        text,
        rating: commentRating || 0,
        date: new Date().toISOString(),
      });

      // ⭐ Optional: Update overall rating
      if (commentRating && onRate) {
        onRate(postId, commentRating);
      }
    },
    [postId, onAddComment, onRate]
  );

  /* ---------------- Rating Handler ---------------- */

  const handleRating = (value) => {
    if (!postId) return;
    onRate?.(postId, value);
  };

  if (!post) return null;

  /* ---------------- UI ---------------- */

  return (
    <div
      className="blogmodal-overlay"
      onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="blogmodal-content"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
      >
        {/* Close */}
        <button
          className="blogmodal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Image */}
        <img
          src={image}
          alt={title}
          className="blogmodal-img"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMG;
          }}
        />

        {/* Details */}
        <div className="blogmodal-details">
          <h2 id={titleId}>{title}</h2>

          <p className="blogmodal-meta" id={descId}>
            By <strong>{author}</strong> | {dateLabel} | {views} views | ❤️{" "}
            {likes}
          </p>

          {/* Like */}
          <div className="blogmodal-top-actions">
            <button
              className="blogmodal-like-btn"
              onClick={() => onLike?.(postId)}
            >
              ❤️ Like ({likes})
            </button>
          </div>

          {/* ⭐ Rating */}
          <div className="blogmodal-rating-section">
            <StarRating value={rating} onChange={handleRating} />
            <span className="blogmodal-rating-text">
              {rating.toFixed(1)} / 5
            </span>
          </div>

          {/* Content */}
          <p className="blogmodal-text">{content}</p>
        </div>

        {/* Comments */}
        <CommentSection
          comments={comments}
          onAddComment={handleComment}
        />
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useId } from "react";
import CommentSection from "../CommentSection/CommentSection";
import "./BlogModal.css";

const PLACEHOLDER_IMG = "https://via.placeholder.com/600x300";
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const safeDateLabel = (d) => {
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString();
};

const normalizeComments = (comments) =>
  (comments || [])
    .map((c) => {
      if (!c) return null;
      if (typeof c === "string") return { name: "Anonymous", text: c };
      if (typeof c === "object")
        return { name: c.name || "Anonymous", text: c.text || "" };
      return null;
    })
    .filter((c) => c && String(c.text || "").trim());

const getId = (p) => p?._id ?? p?.id;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export default function BlogModal({ post, onClose, onAddComment, onLike }) {
  const modalRef = useRef(null);
  const lastActiveRef = useRef(null);
  const reactId = useId();

  const postId = useMemo(() => String(getId(post) ?? ""), [post]);
  const comments = useMemo(
    () => normalizeComments(post?.comments),
    [post?.comments],
  );

  const titleId = `blogmodal-title-${reactId}`;
  const descId = `blogmodal-desc-${reactId}`;

  // ---------------- Focus & Escape Handling ----------------
  useEffect(() => {
    if (!post) return;

    lastActiveRef.current = document.activeElement;

    const t = setTimeout(() => {
      const first = modalRef.current?.querySelector(FOCUSABLE);
      (first || modalRef.current)?.focus?.();
    }, 0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;

      const root = modalRef.current;
      if (!root) return;

      const focusables = Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (el) =>
          !el.hasAttribute("disabled") &&
          el.getAttribute("aria-hidden") !== "true" &&
          el.offsetParent !== null,
      );
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = root.contains(active);

      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!inside || active === last) {
          e.preventDefault();
          first.focus();
        }
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

  // ---------------- Handle Comment ----------------
  const handleComment = ({ text }) => {
    const t = String(text || "").trim();
    if (!t || !postId) return;
    onAddComment?.(postId, t);
  };

  if (!post) return null;

  // ---------------- Safe Values ----------------
  const title = String(post?.title || "Untitled");
  const author = String(post?.author || "Admin");
  const dateLabel = safeDateLabel(post?.date || post?.createdAt);
  const views = Number.isFinite(Number(post?.views)) ? Number(post.views) : 0;
  const likes = Number.isFinite(Number(post?.likes)) ? Number(post.likes) : 0;
  const rating = Number.isFinite(Number(post?.rating))
    ? clamp(Number(post.rating), 0, 5)
    : 0;
  const content = String(post?.content || "").trim() || "No content available.";
  const image = String(post?.image || PLACEHOLDER_IMG);

  return (
    <div
      className="blogmodal-overlay"
      onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}
      role="presentation"
    >
      <div
        className="blogmodal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onPointerDown={(e) => e.stopPropagation()}
        tabIndex={-1}
        ref={modalRef}
      >
        <button
          className="blogmodal-close"
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          ×
        </button>
        <img
          src={post.image || "/20260207_FND001.jpg"} // use post.image if it exists, otherwise fallback
          alt={post.title}
          onError={(e) => {
            e.currentTarget.onerror = null; // prevent infinite loop
            e.currentTarget.src = "/20260207_FND001.jpg"; // local fallback
          }}
          className="blogmodal-img"
        />

        <div className="blogmodal-details">
          <h2 id={titleId}>{title}</h2>
          <p className="blogmodal-meta" id={descId}>
            By <strong>{author}</strong> | {dateLabel} | {views} views | ❤️{" "}
            {likes}
          </p>

          <div className="blogmodal-top-actions">
            <button
              className="blogmodal-like-btn"
              onClick={() => onLike?.(postId)}
              disabled={!onLike || !postId}
              type="button"
              aria-pressed={!!post?.likedBy?.length}
            >
              ❤️ Like ({likes})
            </button>
          </div>

          <p className="blogmodal-rating">⭐ {rating.toFixed(1)}/5</p>
          <p className="blogmodal-text">{content}</p>
        </div>

        <CommentSection comments={comments} onAddComment={handleComment} />
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useRef } from "react";
import CommentSection from "../CommentSection/CommentSection";
import "./BlogModal.css";

const PLACEHOLDER_IMG = "https://via.placeholder.com/600x300";

const safeDateLabel = (d) => {
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString();
};

const normalizeComments = (comments) => {
  // supports: ["nice post", ...] OR [{name,text}, ...]
  return (comments || [])
    .map((c) => {
      if (typeof c === "string") return { name: "Anonymous", text: c };
      if (c && typeof c === "object") {
        return { name: c.name || "Anonymous", text: c.text || "" };
      }
      return null;
    })
    .filter((c) => c && String(c.text || "").trim());
};

const getId = (p) => p?.id ?? p?._id;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const BlogModal = ({ post, onClose, onAddComment, onLike }) => {
  const contentRef = useRef(null);
  const lastActiveRef = useRef(null);

  const postId = useMemo(() => String(getId(post) ?? ""), [post?.id, post?._id]);
  const comments = useMemo(
    () => normalizeComments(post?.comments),
    [post?.comments]
  );

  const titleId = `blogmodal-title-${postId || "x"}`;
  const descId = `blogmodal-desc-${postId || "x"}`;

  // Close on ESC + lock scroll + focus mgmt
  useEffect(() => {
    if (!post) return;

    lastActiveRef.current = document.activeElement;

    const t = setTimeout(() => {
      contentRef.current?.focus?.();
    }, 0);

    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onEsc);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prevOverflow;
      lastActiveRef.current?.focus?.();
    };
  }, [post, onClose]);

  const handleComment = ({ name, text }) => {
    const t = String(text || "").trim();
    if (!t || !postId) return;

    onAddComment?.(postId, {
      name: String(name || "").trim() || "Anonymous",
      text: t,
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  if (!post) return null;

  const title = post?.title || "Blog post";
  const author = post?.author || "Admin";
  const dateLabel = safeDateLabel(post?.date);

  const views = Number.isFinite(Number(post?.views)) ? Number(post.views) : 0;
  const likes = Number.isFinite(Number(post?.likes)) ? Number(post.likes) : 0;

  const rawRating = Number(post?.rating);
  const rating = Number.isFinite(rawRating) ? clamp(rawRating, 0, 5) : 0;

  const content = String(post?.content || "").trim();

  return (
    <div
      className="blogmodal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="blogmodal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        ref={contentRef}
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
          src={post?.image || PLACEHOLDER_IMG}
          alt={title}
          className="blogmodal-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMG;
          }}
        />

        <div className="blogmodal-details">
          <h2 id={titleId}>{title}</h2>

          <p className="blogmodal-meta" id={descId}>
            By <strong>{author}</strong> | {dateLabel} | {views} views | ❤️ {likes}
          </p>

          <div className="blogmodal-top-actions">
            <button
              className="blogmodal-like-btn"
              onClick={() => onLike?.(postId)}
              disabled={!onLike || !postId}
              type="button"
              aria-label="Like this post"
            >
              ❤️ Like
            </button>
          </div>

          <p className="blogmodal-rating">⭐ {rating.toFixed(1)}/5</p>

          <p className="blogmodal-text">
            {content || "No content available."}
          </p>
        </div>

        <CommentSection comments={comments} onAddComment={handleComment} />
      </div>
    </div>
  );
};

export default BlogModal;

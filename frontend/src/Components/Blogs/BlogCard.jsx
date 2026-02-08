// src/Components/Blogs/BlogCard.jsx

import React, { useMemo, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { usePosts } from "../../Context/PostsContext";
import "./BlogCard.css";

const FALLBACK_IMG = "/placeholder.jpg";

/* ---------- Helpers ---------- */
const getPostId = (post) => String(post?._id ?? post?.id ?? "");

const getUserKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.id || user?.email || "guest";
  } catch {
    return "guest";
  }
};

export default function BlogCard({ post, onReadMore }) {
  const { toggleLike } = usePosts();
  const [isLiking, setIsLiking] = useState(false);

  /* ---------- Safe Values ---------- */
  const postId = useMemo(() => getPostId(post), [post]);

  const title = post?.title || "Untitled";
  const author = post?.author || "Admin";

  const date = useMemo(() => {
    const d = post?.createdAt || post?.date;
    return d ? new Date(d).toLocaleDateString() : "—";
  }, [post]);

  const excerpt = useMemo(() => {
    const content = String(post?.content || "").trim();
    return content.length > 110 ? content.slice(0, 110) + "…" : content;
  }, [post?.content]);

  const tags = useMemo(() => post?.tags || [], [post?.tags]);

  const imageSrc = post?.image || FALLBACK_IMG;

  /* ---------- Like Logic ---------- */
  const likedByUser = useMemo(() => {
    const userKey = getUserKey();
    if (!Array.isArray(post?.likedBy)) return false;

    return post.likedBy.some(
      (x) => String(x).toLowerCase() === String(userKey).toLowerCase()
    );
  }, [post?.likedBy]);

  const handleLike = async () => {
    if (!postId || isLiking) return;

    setIsLiking(true);
    try {
      await toggleLike(postId);
    } catch (err) {
      console.error("Like failed:", err);
    } finally {
      setIsLiking(false);
    }
  };

  /* ---------- Render ---------- */
  return (
    <article className="blog-card" aria-labelledby={`blog-${postId}`}>
      {/* ---------- Image ---------- */}
      <img
        src={imageSrc}
        alt={title}
        className="blog-card-image"
        loading="lazy"
        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
      />

      {/* ---------- Content ---------- */}
      <div className="blog-card-body">
        <h3 id={`blog-${postId}`} className="blog-card-title">
          {title}
        </h3>

        <p className="blog-card-meta">
          {author} • {date}
        </p>

        <p className="blog-card-excerpt">{excerpt}</p>

        {/* ---------- Tags ---------- */}
        {tags.length > 0 && (
          <div className="blog-card-tags">
            {tags.slice(0, 4).map((tag) => (
              <span key={`${postId}-${tag}`} className="blog-card-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ---------- Actions ---------- */}
        <div className="blog-card-actions">
          {onReadMore ? (
            <button className="read-more-btn" onClick={onReadMore}>
              Read More
            </button>
          ) : (
            <Link to={`/blog/${postId}`} className="read-more-btn">
              Read More
            </Link>
          )}

          <button
            className={`like-btn ${likedByUser ? "liked" : ""}`}
            onClick={handleLike}
            disabled={isLiking}
            aria-pressed={likedByUser}
            aria-label={likedByUser ? "Unlike post" : "Like post"}
          >
            {likedByUser ? <FaHeart /> : <FaRegHeart />}
            <span>{Number(post?.likes || 0)}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

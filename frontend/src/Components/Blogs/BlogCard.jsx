import React, { useMemo, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { usePosts } from "../../Context/PostsContext";
import "./BlogCard.css";

const FALLBACK_IMG = "https://via.placeholder.com/400x200";

export default function BlogCard({ post, onReadMore }) {
  const { toggleLike } = usePosts(); // ✅ removed getId
  const [isLiking, setIsLiking] = useState(false);

  // ✅ SAFE ID (backend + local JSON)
  const postId = useMemo(() => {
    return post?._id || post?.id || null;
  }, [post]);

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

  const likedByUser = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const key = user?.id || user?.email;
      if (!key || !Array.isArray(post?.likedBy)) return false;

      return post.likedBy.some(
        (x) => String(x).toLowerCase() === String(key).toLowerCase()
      );
    } catch {
      return false;
    }
  }, [post?.likedBy]);

  const title = post?.title || "Untitled";
  const author = post?.author || "Admin";
  const date = post?.createdAt
    ? new Date(post.createdAt).toLocaleDateString()
    : "—";
  const excerpt = post?.content
    ? post.content.slice(0, 100) + "…"
    : "";

  return (
    <div className="blog-card">
      <img
        src={post?.image || FALLBACK_IMG}
        alt={title}
        className="blog-card-image"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_IMG;
        }}
      />

      <div className="blog-card-body">
        <h3>{title}</h3>
        <p className="blog-card-meta">{author} • {date}</p>
        <p className="blog-card-excerpt">{excerpt}</p>

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
          >
            {likedByUser ? <FaHeart /> : <FaRegHeart />}
            <span>{Number(post?.likes || 0)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { usePosts } from "../../Context/PostsContext";
import "./BlogCard.css";

const FALLBACK_IMG = "/placeholder.jpg"; // in public folder

export default function BlogCard({ post, onReadMore }) {
  const { toggleLike } = usePosts();
  const [isLiking, setIsLiking] = useState(false);

  const postId = useMemo(() => post?._id || post?.id || "", [post]);

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

  const excerpt = useMemo(() => {
    const content = post?.content?.trim() || "";
    return content.length > 100 ? content.slice(0, 100) + "…" : content;
  }, [post?.content]);

  const imageSrc = post?.image || FALLBACK_IMG;

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

  return (
    <div className="blog-card">
      <img
        src={imageSrc}
        alt={title}
        className="blog-card-image"
        loading="lazy"
        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
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
            aria-label={likedByUser ? "Unlike this post" : "Like this post"}
          >
            {likedByUser ? <FaHeart /> : <FaRegHeart />}
            <span>{Number(post?.likes || 0)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo } from "react";
import "./BlogCard.css";

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x200";

const safeDate = (d) => {
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString();
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const BlogCard = ({ post, onReadMore }) => {
  const img = post?.image || PLACEHOLDER_IMG;
  const title = post?.title?.trim() || "Untitled post";

  const dateStr = useMemo(() => safeDate(post?.date), [post?.date]);
  const views = Number.isFinite(Number(post?.views)) ? Number(post.views) : 0;
  const author = post?.author?.trim() || "Admin";

  const rawRating = Number(post?.rating);
  const rating = Number.isFinite(rawRating) ? clamp(rawRating, 0, 5) : 0;

  const content = String(post?.content || "").trim();
  const excerpt = content
    ? content.length > 140
      ? `${content.slice(0, 140)}…`
      : content
    : "No description available.";

  const tags = Array.isArray(post?.tags) ? post.tags.filter(Boolean) : [];
  const id = post?.id ?? post?._id ?? title; // for key fallback / handlers

  const handleReadMore = () => onReadMore?.(post);

  const onCardKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleReadMore();
    }
  };

  return (
    <article className="blog-card" tabIndex={0} onKeyDown={onCardKeyDown}>
      <div className="blog-card__imgWrap">
        <img
          className="blog-card__img"
          src={img}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMG;
          }}
        />
      </div>

      <div className="blog-card__body">
        <h3 className="blog-card__title">{title}</h3>

        <div className="blog-card__meta">
          <span className="meta-item">{author}</span>

          {dateStr ? (
            <>
              <span className="meta-dot" aria-hidden="true">
                •
              </span>
              <span className="meta-item">{dateStr}</span>
            </>
          ) : null}

          <span className="meta-dot" aria-hidden="true">
            •
          </span>
          <span className="meta-item">{views} views</span>
        </div>

        {tags.length ? (
          <div className="blog-card__tags" aria-label="Tags">
            {tags.slice(0, 4).map((t) => (
              <span key={`${id}-${t}`} className="tag-chip">
                {t}
              </span>
            ))}
            {tags.length > 4 ? (
              <span className="tag-more" aria-label={`${tags.length - 4} more tags`}>
                +{tags.length - 4}
              </span>
            ) : null}
          </div>
        ) : null}

        <p className="blog-card__excerpt">{excerpt}</p>

        <div className="blog-card__footer">
          <div className="blog-card__rating" aria-label={`Rating ${rating} out of 5`}>
            <span className="star" aria-hidden="true">
              ★
            </span>
            <span className="rating-num">{rating.toFixed(1)}/5</span>
          </div>

          <button
            type="button"
            className="blog-card__btn"
            onClick={handleReadMore}
            aria-label={`Read more: ${title}`}
          >
            Read More
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;

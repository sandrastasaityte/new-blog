// src/Components/Home/Home.jsx

import React, { useMemo, useState } from "react";
import { usePosts } from "../../Context/PostsContext";
import BlogCard from "../Blogs/BlogCard";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const { posts: blogs, loading } = usePosts();
  const [selectedTag, setSelectedTag] = useState("");

  /* ---------- Featured ---------- */
  const featuredBlogs = useMemo(() => {
    return [...blogs]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 3);
  }, [blogs]);

  /* ---------- Unique Tags ---------- */
  const uniqueTags = useMemo(() => {
    const set = new Set();
    blogs.forEach((b) => b.tags?.forEach((t) => t && set.add(t)));
    return Array.from(set).slice(0, 6);
  }, [blogs]);

  /* ---------- Filter ---------- */
  const filteredBlogs = useMemo(() => {
    if (!selectedTag) return featuredBlogs;

    return blogs.filter((b) =>
      b.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
    );
  }, [blogs, selectedTag, featuredBlogs]);

  const toggleTag = (tag) => {
    setSelectedTag((prev) => (prev === tag ? "" : tag));
  };

  return (
    <div className="home-container">

      {/* ---------- HERO ---------- */}
      <section className="home-hero fade-in">
        <h1>Discover Inspiring Stories</h1>
        <p>Explore articles, tutorials and inspiration from our community.</p>

        <Link to="/blogs" className="hero-btn">
          Explore Blogs
        </Link>
      </section>

      {/* ---------- TAG FILTER ---------- */}
      {uniqueTags.length > 0 && (
        <section className="home-tags-section fade-in">
          <div className="home-tags-header">
            <h2>Popular Topics</h2>

            {selectedTag && (
              <button
                className="clear-tag-btn"
                onClick={() => setSelectedTag("")}
              >
                Clear Filter ✕
              </button>
            )}
          </div>

          <div className="home-tags">
            {uniqueTags.map((tag) => (
              <button
                key={tag}
                className={`home-tag ${
                  selectedTag === tag ? "active" : ""
                }`}
                onClick={() => toggleTag(tag)}
                aria-pressed={selectedTag === tag}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ---------- BLOG GRID ---------- */}
      <section className="home-featured-section fade-in">
        <h2>
          {selectedTag
            ? `Posts about "${selectedTag}"`
            : "Featured Blogs"}
        </h2>

        {loading ? (
          <div className="home-skeleton-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="home-empty">
            <p>No blogs found for this topic.</p>
            <button onClick={() => setSelectedTag("")}>
              Show Featured Posts
            </button>
          </div>
        ) : (
          <div className="home-blogs">
            {filteredBlogs.map((post) => (
              <BlogCard
                key={post._id || post.id}
                post={post}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---------- CTA ---------- */}
      {!selectedTag && blogs.length > 3 && (
        <div className="home-cta fade-in">
          <Link to="/blogs" className="cta-button">
            View All Blogs →
          </Link>
        </div>
      )}
    </div>
  );
}

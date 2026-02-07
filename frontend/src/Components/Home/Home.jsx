import React, { useMemo, useState } from "react";
import { usePosts } from "../../Context/PostsContext";
import BlogCard from "../Blogs/BlogCard";
import "../Blogs/BlogCard.css";
import "./Home.css";

export default function Home() {
  const { posts: blogs, loading } = usePosts();
  const [selectedTag, setSelectedTag] = useState("");

  // Pick top 3 featured blogs (based on likes)
  const featuredBlogs = useMemo(() => {
    return [...blogs]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 3);
  }, [blogs]);

  // Pick 5 unique tags
  const uniqueTags = useMemo(() => {
    const set = new Set();
    blogs.forEach((b) => b.tags?.forEach((t) => t && set.add(t)));
    return Array.from(set).slice(0, 5);
  }, [blogs]);

  // Filter blogs by selected tag
  const filteredBlogs = useMemo(() => {
    if (!selectedTag) return blogs;
    return blogs.filter((b) => b.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));
  }, [blogs, selectedTag]);

  return (
    <div className="home-container">
      {/* ---------------- Hero Section ---------------- */}
      <section className="home-hero">
        <h1>Welcome to Our Blog</h1>
        <p>
          Explore stories, tips, and insights from our authors. Discover the latest trends in technology, lifestyle, and more.
        </p>
      </section>

      {/* ---------------- Quick Tags ---------------- */}
      {uniqueTags.length > 0 && (
        <section className="home-tags-section">
          <h2>Popular Topics</h2>
          <div className="home-tags">
            {uniqueTags.map((tag) => (
              <span
                key={tag}
                className={`home-tag ${selectedTag === tag ? "home-tag-selected" : ""}`}
                onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Featured Blogs ---------------- */}
      <section className="home-featured-section">
        <h2>{selectedTag ? `Blogs about "${selectedTag}"` : "Featured Blogs"}</h2>
        {loading ? (
          <p className="home-message">Loading blogs...</p>
        ) : filteredBlogs.length === 0 ? (
          <p className="home-message">No blogs yet.</p>
        ) : (
          <div className="home-blogs">
            {filteredBlogs.map((post) => (
              <BlogCard key={post._id || post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Call To Action ---------------- */}
      {blogs.length > 3 && !selectedTag && (
        <div className="home-cta">
          <a href="/blogs" className="cta-button">See All Blogs</a>
        </div>
      )}
    </div>
  );
}

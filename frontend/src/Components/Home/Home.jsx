// src/Components/Home/Home.jsx
import React, { useEffect, useState, useMemo } from "react";
import { getPosts } from "../../lib/blogApi";
import BlogCard from "../Blogs/BlogCard";
import "../Blogs/BlogCard.css";
import "./Home.css";

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filterTags, setFilterTags] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getPosts();
        setBlogs(data);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      }
    };
    fetchBlogs();
  }, []);

  // Extract unique tags from all blogs
  const uniqueTags = useMemo(() => {
    const set = new Set();
    blogs.forEach((b) => b.tags?.forEach((t) => t && set.add(t)));
    return Array.from(set);
  }, [blogs]);

  // Filter blogs by keyword and tags
  const filteredBlogs = useMemo(() => {
    return blogs
      .filter((b) => {
        const text = (b.title + " " + b.content + " " + b.excerpt).toLowerCase();
        return text.includes(keyword.toLowerCase());
      })
      .filter((b) => {
        if (!filterTags.length) return true;
        return b.tags?.some((t) => filterTags.includes(t));
      })
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }, [blogs, keyword, filterTags]);

  const toggleTag = (tag) => {
    setFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="home-container">
      {/* ---------------- Search ---------------- */}
      <div className="home-search">
        <input
          type="text"
          placeholder="Search blogs..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* ---------------- Tags ---------------- */}
      {uniqueTags.length > 0 && (
        <div className="home-tags">
          {uniqueTags.map((tag) => {
            const active = filterTags.includes(tag);
            return (
              <button
                key={tag}
                className={`home-tag ${active ? "active" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* ---------------- Blog Cards ---------------- */}
      {filteredBlogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        filteredBlogs.map((post) => (
          <BlogCard key={post._id || post.id} post={post} />
        ))
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { getBlogs } from "../../lib/blogApi";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const data = await getBlogs();
        const sorted = data
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 8); // latest 8 blogs
        setBlogs(sorted);
        setFilteredBlogs(sorted);

        const allTags = Array.from(
          new Set(sorted.flatMap((b) => b.tags || []))
        );
        setTags(allTags);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      }
    }
    fetchBlogs();
  }, []);

  const filterByTag = (tag) => {
    setActiveTag(tag);
    if (!tag) {
      setFilteredBlogs(blogs);
    } else {
      setFilteredBlogs(blogs.filter((b) => (b.tags || []).includes(tag)));
    }
  };

  return (
    <main className="home-container">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to My Blog</h1>
          <p>Discover latest insights, stories, and updates from our community.</p>
        </div>
      </section>

      {/* Tags Filter */}
      <section className="tags-filter">
        <button
          className={!activeTag ? "active" : ""}
          onClick={() => filterByTag("")}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            className={activeTag === tag ? "active" : ""}
            onClick={() => filterByTag(tag)}
          >
            {tag}
          </button>
        ))}
      </section>

      {/* Blogs Grid */}
      <section className="blogs-grid">
        {filteredBlogs.length === 0 ? (
          <p>No blogs available.</p>
        ) : (
          filteredBlogs.map((blog) => (
            <div key={blog.id} className="blog-card">
              <img
                src={blog.image || "https://via.placeholder.com/300x200"}
                alt={blog.title}
              />
              <div className="blog-content">
                <h3>{blog.title}</h3>
                <p>{blog.content.slice(0, 100)}...</p>
                <div className="blog-tags">
                  {(blog.tags || []).map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <Link to={`/blog/${blog.id}`} className="read-more">
                  Read More →
                </Link>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

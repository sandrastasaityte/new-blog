import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import BlogCard from "../Blogs/BlogCard";
import "./Home.css";

import { usePosts } from "../../Context/PostsContext";

const safeDateNum = (d) => {
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const getId = (p) => p?.id ?? p?._id;

const norm = (s) => String(s || "").trim().toLowerCase();

const Home = () => {
  const { posts = [] } = usePosts();
  const navigate = useNavigate();

  const featuredBlogs = useMemo(() => {
    const sorted = [...(posts || [])].sort(
      (a, b) => safeDateNum(b?.date) - safeDateNum(a?.date)
    );
    return sorted.slice(0, 4);
  }, [posts]);

  // ✅ Unique tags (case-insensitive), but keep a nice display value
  const tags = useMemo(() => {
    const map = new Map(); // lower -> original display

    (posts || []).forEach((b) => {
      (b?.tags || []).forEach((t) => {
        const raw = String(t || "").trim();
        if (!raw) return;

        const key = raw.toLowerCase();
        if (!map.has(key)) map.set(key, raw);
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [posts]);

  const openBlog = (blog) => {
    const id = getId(blog);
    if (!id) return;
    navigate(`/blogs?open=${encodeURIComponent(String(id))}`);
  };

  const goTag = (tag) => {
    if (!tag) return;
    navigate(`/blogs?tag=${encodeURIComponent(String(tag))}`);
  };

  return (
    <div className="home-wrapper">
      <section className="home-hero">
        <h1>Welcome to Our Blog</h1>
        <p>Explore insights, tutorials, and latest updates.</p>

        <Link to="/blogs" className="view-blogs-btn">
          View All Blogs
        </Link>
      </section>

      <section className="home-featured">
        <h2>Latest Articles</h2>

        {featuredBlogs.length === 0 ? (
          <p style={{ opacity: 0.75, margin: 0 }}>No posts yet.</p>
        ) : (
          <div className="home-blog-grid">
            {featuredBlogs.map((blog) => (
              <BlogCard
                key={String(getId(blog))}
                post={blog}
                onReadMore={() => openBlog(blog)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="home-tags">
        <h3>Browse by Tags</h3>

        {tags.length === 0 ? (
          <p style={{ opacity: 0.75, margin: 0 }}>No tags yet.</p>
        ) : (
          <div className="tags-list">
            {tags.map((tag) => (
              <button
                key={norm(tag)}
                type="button"
                className="tag"
                onClick={() => goTag(tag)}
                aria-label={`Browse tag ${tag}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

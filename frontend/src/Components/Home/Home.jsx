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

const Home = () => {
  const { posts = [] } = usePosts();
  const navigate = useNavigate();

  const featuredBlogs = useMemo(() => {
    const sorted = [...(posts || [])].sort(
      (a, b) => safeDateNum(b?.date) - safeDateNum(a?.date)
    );
    return sorted.slice(0, 4);
  }, [posts]);

  const tags = useMemo(() => {
    const set = new Set();
    (posts || []).forEach((b) => {
      (b?.tags || []).forEach((t) => {
        const tag = String(t || "").trim();
        if (tag) set.add(tag);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const openBlog = (blog) => {
    const id = getId(blog);
    if (!id) return;
    // Opens the modal from Blogs page (you'll handle ?open= in Blogs.jsx)
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
                key={tag}
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

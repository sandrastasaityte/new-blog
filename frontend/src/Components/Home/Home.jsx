import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import blogsData from "../../assets/blogsData.json";
import BlogCard from "../Blogs/BlogCard";

import "./Home.css";

const Home = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);

  useEffect(() => {
    // Get latest 4 blogs for home
    const sortedBlogs = [...blogsData].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setFeaturedBlogs(sortedBlogs.slice(0, 4));
  }, []);

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="home-hero">
        <h1>Welcome to Our Blog</h1>
        <p>Explore insights, tutorials, and latest updates.</p>
        <Link to="/blogs" className="view-blogs-btn">
          View All Blogs
        </Link>
      </section>

      {/* Featured Blogs */}
      <section className="home-featured">
        <h2>Latest Articles</h2>
        <div className="home-blog-grid">
          {featuredBlogs.map(blog => (
            <BlogCard key={blog.id} post={blog} />
          ))}
        </div>
      </section>

      {/* Categories / Tags Preview */}
      <section className="home-tags">
        <h3>Browse by Tags</h3>
        <div className="tags-list">
          {[...new Set(blogsData.flatMap(blog => blog.tags || []))].map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

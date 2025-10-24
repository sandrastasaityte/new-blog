import React, { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ posts, uniqueTags, filterTags, setFilterTags, onSelectPost }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter posts by search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Popular posts by views
  const popularPosts = [...posts].sort((a, b) => b.views - a.views).slice(0, 5);

  // Latest posts by date
  const latestPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // Handle tag click
  const toggleTag = (tag) => {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter(t => t !== tag));
    } else {
      setFilterTags([...filterTags, tag]);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h4>Search</h4>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="sidebar-section">
        <h4>Popular Posts</h4>
        <ul>
          {popularPosts.map(post => (
            <li key={post.id} onClick={() => onSelectPost(post)}>
              {post.title} ({post.views} views)
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <h4>Latest Posts</h4>
        <ul>
          {latestPosts.map(post => (
            <li key={post.id} onClick={() => onSelectPost(post)}>
              {post.title} ({post.date})
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <h4>Tags</h4>
        <div className="tags">
          {uniqueTags.map(tag => (
            <span
              key={tag}
              className={`tag ${filterTags.includes(tag) ? "active" : ""}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

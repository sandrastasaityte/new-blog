// src/pages/Posts.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePosts } from "../Context/PostsContext";
import "./Admin.css";

export default function Posts() {
  const { posts = [], deletePost, toggleLike, getId } = usePosts();

  const sorted = useMemo(() => [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)), [posts]);

  const onDelete = (p) => {
    if (!window.confirm(`Delete "${p.title || "this post"}"?`)) return;
    deletePost(getId(p));
  };

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1>Posts</h1>
        <p className="admin-muted">Manage your blog posts.</p>
        <Link className="btn primary" to="/admin/add-post">+ Add Post</Link>
      </div>

      <div className="table">
        <div className="row head">
          <div>Title</div>
          <div className="right">Date</div>
          <div className="right">Likes</div>
          <div className="right">Actions</div>
        </div>

        {sorted.length ? sorted.map((p) => (
          <div className="row" key={getId(p)}>
            <div className="strong" title={p.title}>{p.title || "Untitled"}</div>
            <div className="right">{new Date(p.date).toLocaleDateString()}</div>
            <div className="right">{p.likes || 0}</div>
            <div className="right actions">
              <button className="btn" onClick={() => toggleLike(getId(p))}>Like</button>
              <button className="btn danger" onClick={() => onDelete(p)}>Delete</button>
            </div>
          </div>
        )) : (
          <div className="row"><div className="admin-muted">No posts yet.</div><div/><div/><div/></div>
        )}
      </div>
    </div>
  );
}

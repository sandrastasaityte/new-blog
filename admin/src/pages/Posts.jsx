import React from "react";
import { Link } from "react-router-dom";
import "./Admin.css";
import { usePosts } from "../Context/PostsContext";
import { useAuth } from "../Context/AuthContext";

export default function Posts() {
  const { posts, loading, error, deletePost, likePost } = usePosts();
  const { token } = useAuth();

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <h1>Posts</h1>
          <p className="admin-muted">Manage your blog posts.</p>
        </div>

        <Link className="btn primary" to="/admin/add-post">
          + Add Post
        </Link>
      </div>

      {error ? <div className="form-error">{error}</div> : null}
      {loading ? <div className="admin-muted">Loading…</div> : null}

      <div className="table">
        <div className="row head">
          <div>Title</div>
          <div>Date</div>
          <div>Likes</div>
          <div className="right">Actions</div>
        </div>

        {(posts || []).map((p) => (
          <div className="row" key={p.id}>
            <div className="strong">{p.title}</div>
            <div>{p.date ? new Date(p.date).toLocaleDateString() : "-"}</div>
            <div>{p.likes || 0}</div>
            <div className="right actions">
              <button className="btn" type="button" onClick={() => likePost(p.id)}>
                Like
              </button>
              <button className="btn danger" type="button" onClick={() => deletePost(p.id, token)}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {!posts?.length ? <div className="admin-muted" style={{ marginTop: 10 }}>No posts yet.</div> : null}
      </div>
    </div>
  );
}

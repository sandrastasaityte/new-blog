import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";
import { usePosts } from "../Context/PostsContext";

function prettyDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function Posts() {
  const { posts = [], deletePost, toggleLike, getId } = usePosts();

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => {
      const ad = new Date(a?.date || 0).getTime();
      const bd = new Date(b?.date || 0).getTime();
      return bd - ad;
    });
  }, [posts]);

  const onDelete = (p) => {
    const title = p?.title || "this post";
    const ok = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!ok) return;
    deletePost(getId(p));
  };

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

      <div className="table">
        <div className="row head">
          <div>Title</div>
          <div className="right">Date</div>
          <div className="right">Likes</div>
          <div className="right">Actions</div>
        </div>

        {sorted.length ? (
          sorted.map((p) => (
            <div className="row" key={getId(p)}>
              <div
                className="strong"
                style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                title={p.title || "Untitled"}
              >
                {p.title || "Untitled"}
              </div>

              <div className="right">{prettyDate(p.date)}</div>
              <div className="right">{Number(p.likes || 0)}</div>

              <div className="right actions">
                <button className="btn" type="button" onClick={() => toggleLike(getId(p))}>
                  Like
                </button>
                <button className="btn danger" type="button" onClick={() => onDelete(p)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="row">
            <div className="admin-muted">No posts yet. Click “Add Post” to create one.</div>
            <div />
            <div />
            <div />
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useMemo } from "react";
import "./Admin.css";
import { usePosts } from "../Context/PostsContext";

function fmt(n) {
  return new Intl.NumberFormat().format(Number(n || 0));
}

function isWithinDays(isoDate, days) {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return false;
  const now = Date.now();
  const diff = now - d.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

export default function Dashboard() {
  const { posts = [], loading, error } = usePosts();

  const stats = useMemo(() => {
    const totalPosts = posts.length;
    const totalViews = posts.reduce((s, p) => s + Number(p?.views || 0), 0);
    const totalLikes = posts.reduce((s, p) => s + Number(p?.likes || 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p?.comments?.length || 0), 0);

    const last7Posts = posts.filter((p) => isWithinDays(p?.date, 7)).length;
    const last7Likes = posts
      .filter((p) => isWithinDays(p?.date, 7))
      .reduce((s, p) => s + Number(p?.likes || 0), 0);

    return { totalPosts, totalViews, totalLikes, totalComments, last7Posts, last7Likes };
  }, [posts]);

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-muted">Quick overview of your blog performance.</p>
        </div>
      </div>

      {loading ? <div className="form-ok">Loading dashboard…</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="admin-grid">
        <div className="admin-card">
          <p className="admin-card-label">Posts</p>
          <p className="admin-card-value">{fmt(stats.totalPosts)}</p>
          <p className="admin-muted" style={{ margin: "6px 0 0" }}>
            +{fmt(stats.last7Posts)} last 7 days
          </p>
        </div>

        <div className="admin-card">
          <p className="admin-card-label">Views</p>
          <p className="admin-card-value">{fmt(stats.totalViews)}</p>
        </div>

        <div className="admin-card">
          <p className="admin-card-label">Likes</p>
          <p className="admin-card-value">{fmt(stats.totalLikes)}</p>
          <p className="admin-muted" style={{ margin: "6px 0 0" }}>
            +{fmt(stats.last7Likes)} last 7 days
          </p>
        </div>

        <div className="admin-card">
          <p className="admin-card-label">Comments</p>
          <p className="admin-card-value">{fmt(stats.totalComments)}</p>
        </div>
      </div>
    </div>
  );
}

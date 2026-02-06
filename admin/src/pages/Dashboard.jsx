// src/pages/Dashboard.jsx
import React, { useMemo } from "react";
import { usePosts } from "../Context/PostsContext";
import "./Admin.css";

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

function prettyDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function Dashboard() {
  const { posts = [] } = usePosts();

  const { stats, recent } = useMemo(() => {
    const sorted = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalPosts = sorted.length;
    const totalViews = sorted.reduce((s, p) => s + (p.views || 0), 0);
    const totalLikes = sorted.reduce((s, p) => s + (p.likes || 0), 0);
    const totalComments = sorted.reduce((s, p) => s + (p.comments?.length || 0), 0);

    const last7 = sorted.filter((p) => isWithinDays(p.date, 7));
    const last7Posts = last7.length;
    const last7Likes = last7.reduce((s, p) => s + (p.likes || 0), 0);

    return {
      stats: { totalPosts, totalViews, totalLikes, totalComments, last7Posts, last7Likes },
      recent: sorted.slice(0, 5),
    };
  }, [posts]);

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1>Dashboard</h1>
        <p className="admin-muted">Quick overview of your blog performance.</p>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <p className="admin-card-label">Posts</p>
          <p className="admin-card-value">{fmt(stats.totalPosts)}</p>
          {stats.last7Posts > 0 && <p className="admin-muted">+{fmt(stats.last7Posts)} last 7 days</p>}
        </div>
        <div className="admin-card">
          <p className="admin-card-label">Views</p>
          <p className="admin-card-value">{fmt(stats.totalViews)}</p>
        </div>
        <div className="admin-card">
          <p className="admin-card-label">Likes</p>
          <p className="admin-card-value">{fmt(stats.totalLikes)}</p>
          {stats.last7Likes > 0 && <p className="admin-muted">+{fmt(stats.last7Likes)} last 7 days</p>}
        </div>
        <div className="admin-card">
          <p className="admin-card-label">Comments</p>
          <p className="admin-card-value">{fmt(stats.totalComments)}</p>
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="table">
        <div className="row head">
          <div>Title</div>
          <div className="right">Likes</div>
          <div className="right">Comments</div>
          <div className="right">Date</div>
        </div>
        {recent.length ? recent.map((p) => (
          <div className="row" key={p.id}>
            <div className="strong">{p.title || "Untitled"}</div>
            <div className="right">{fmt(p.likes)}</div>
            <div className="right">{fmt(p.comments?.length || 0)}</div>
            <div className="right">{prettyDate(p.date)}</div>
          </div>
        )) : (
          <div className="row">
            <div className="admin-muted">No posts yet.</div>
            <div /><div /><div />
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useMemo } from "react";
import { usePosts } from "../Context/PostsContext";
import "./Admin.css";

/* -----------------------------------------
   Format Helpers
----------------------------------------- */

const numberFormatter = new Intl.NumberFormat();

function fmt(n) {
  return numberFormatter.format(Number(n || 0));
}

function safeDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isWithinDays(isoDate, days) {
  const d = safeDate(isoDate);
  if (!d) return false;

  const diff = Date.now() - d.getTime();
  return diff >= 0 && diff <= days * 86400000;
}

function prettyDate(iso) {
  const d = safeDate(iso);
  if (!d) return "-";

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

/* -----------------------------------------
   Component
----------------------------------------- */

export default function Dashboard() {

  const { posts = [] } = usePosts();

  /* -----------------------------------------
     Derived Analytics
  ----------------------------------------- */

  const analytics = useMemo(() => {

    if (!posts.length) {
      return {
        stats: {
          totalPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          last7Posts: 0,
          last7Likes: 0
        },
        recent: []
      };
    }

    /* ---------- Sort only once ---------- */

    const sorted = [...posts].sort((a, b) => {
      return safeDate(b.publishedAt)?.getTime() -
             safeDate(a.publishedAt)?.getTime();
    });

    /* ---------- Aggregations ---------- */

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;

    let last7Posts = 0;
    let last7Likes = 0;

    for (const p of sorted) {

      totalViews += p.views || 0;
      totalLikes += p.likes || 0;
      totalComments += p.comments?.length || 0;

      if (isWithinDays(p.publishedAt, 7)) {
        last7Posts++;
        last7Likes += p.likes || 0;
      }
    }

    return {
      stats: {
        totalPosts: sorted.length,
        totalViews,
        totalLikes,
        totalComments,
        last7Posts,
        last7Likes
      },
      recent: sorted.slice(0, 5)
    };

  }, [posts]);

  const { stats, recent } = analytics;

  /* -----------------------------------------
     UI
  ----------------------------------------- */

  return (
    <div className="admin-page">

      <div className="admin-head">
        <h1>Dashboard</h1>
        <p className="admin-muted">
          Quick overview of your blog performance.
        </p>
      </div>

      {/* ---------- Stats ---------- */}

      <div className="admin-grid">

        <DashboardCard
          label="Posts"
          value={fmt(stats.totalPosts)}
          delta={stats.last7Posts}
        />

        <DashboardCard
          label="Views"
          value={fmt(stats.totalViews)}
        />

        <DashboardCard
          label="Likes"
          value={fmt(stats.totalLikes)}
          delta={stats.last7Likes}
        />

        <DashboardCard
          label="Comments"
          value={fmt(stats.totalComments)}
        />

      </div>

      {/* ---------- Recent Posts ---------- */}

      <div className="table" style={{ marginTop: 14 }}>

        <div className="row head">
          <div>Title</div>
          <div className="right">Likes</div>
          <div className="right">Comments</div>
          <div className="right">Date</div>
        </div>

        {recent.length ? (
          recent.map(p => (
            <div className="row" key={p.id}>
              <div className="strong">{p.title || "Untitled"}</div>
              <div className="right">{fmt(p.likes)}</div>
              <div className="right">{fmt(p.comments?.length)}</div>
              <div className="right">{prettyDate(p.publishedAt)}</div>
            </div>
          ))
        ) : (
          <div className="row">
            <div className="admin-muted">No posts yet.</div>
            <div />
            <div />
            <div />
          </div>
        )}

      </div>

    </div>
  );
}

/* -----------------------------------------
   Reusable Card Component
----------------------------------------- */

function DashboardCard({ label, value, delta }) {
  return (
    <div className="admin-card">
      <p className="admin-card-label">{label}</p>
      <p className="admin-card-value">{value}</p>

      {delta > 0 && (
        <p className="admin-muted">
          +{fmt(delta)} last 7 days
        </p>
      )}
    </div>
  );
}

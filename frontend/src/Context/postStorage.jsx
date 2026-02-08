// src/Context/postStorage.js

/* ---------------- Constants ---------------- */

const STORAGE_KEY = "blog_posts_v1";

const nowIso = () => new Date().toISOString();
const today = () => nowIso().slice(0, 10);

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const makeLocalId = () =>
  `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;


/* ---------------- User Helper ---------------- */

export function getUserKey(userKey) {
  if (userKey) return String(userKey);

  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "guest";

    const u = JSON.parse(raw);
    return String(u?.id || u?._id || u?.email || "guest");
  } catch {
    return "guest";
  }
}


/* ---------------- Normalizers ---------------- */

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  const seen = new Set();

  return tags
    .map((t) => String(t || "").trim())
    .filter(Boolean)
    .filter((t) => {
      const k = t.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

function normalizeComments(comments) {
  const iso = nowIso();

  return (Array.isArray(comments) ? comments : [])
    .map((c) => {
      if (typeof c === "string") {
        const text = c.trim();
        if (!text) return null;
        return { text, name: "Guest", date: iso };
      }

      const text = String(c?.text || "").trim();
      if (!text) return null;

      return {
        text,
        name: String(c?.name || "Guest"),
        date: c?.date || iso
      };
    })
    .filter(Boolean);
}

function normalizeLikedBy(arr) {
  if (!Array.isArray(arr)) return [];

  return [...new Set(arr.map((x) => String(x)))];
}


/* ---------------- Normalize Posts ---------------- */

export function normalize(posts) {
  return (Array.isArray(posts) ? posts : []).map((p, index) => {
    const id = String(p?._id || p?.id || `seed-${index}`);

    const likedBy = normalizeLikedBy(p?.likedBy);

    return {
      ...p,

      id,
      _id: p?._id,

      title: String(p?.title || "Untitled post"),
      content: String(p?.content || ""),

      tags: normalizeTags(p?.tags),
      comments: normalizeComments(p?.comments),

      likedBy,
      likes: likedBy.length || toNum(p?.likes, 0),

      views: toNum(p?.views, 0),
      rating: clamp(toNum(p?.rating, 0), 0, 5),

      author: String(p?.author || "Admin"),
      date: p?.date || today(),
      image: p?.image || "/placeholder.jpg"
    };
  });
}


/* ---------------- Storage ---------------- */

export function loadPosts(fallback = []) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : fallback;
    return normalize(data);
  } catch {
    return normalize(fallback);
  }
}

export function savePosts(posts) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(normalize(posts))
  );
}


/* ---------------- CRUD ---------------- */

export function addPost(posts, post) {
  const newPost = normalize([
    {
      ...post,
      id: post?.id || post?._id || makeLocalId(),
      date: post?.date || today(),
      likes: 0,
      views: 0,
      likedBy: [],
      comments: []
    }
  ])[0];

  const updated = [newPost, ...(posts || [])];
  savePosts(updated);

  return updated;
}


export function updatePost(posts, id, patch) {
  const updated = normalize(
    posts.map((p) =>
      String(p.id) === String(id) ? { ...p, ...patch } : p
    )
  );

  savePosts(updated);
  return updated;
}


export function deletePost(posts, id) {
  const updated = normalize(
    posts.filter((p) => String(p.id) !== String(id))
  );

  savePosts(updated);
  return updated;
}


/* ---------------- Views ---------------- */

export function incViews(posts, id) {
  const updated = normalize(
    posts.map((p) =>
      String(p.id) === String(id)
        ? { ...p, views: toNum(p.views) + 1 }
        : p
    )
  );

  savePosts(updated);
  return updated;
}


/* ---------------- Likes ---------------- */

export function toggleLike(posts, id, userKey) {
  const who = getUserKey(userKey);

  const updated = normalize(
    posts.map((p) => {
      if (String(p.id) !== String(id)) return p;

      const likedBy = normalizeLikedBy(p.likedBy);

      const exists = likedBy.includes(who);

      const nextLikedBy = exists
        ? likedBy.filter((x) => x !== who)
        : [...likedBy, who];

      return {
        ...p,
        likedBy: nextLikedBy,
        likes: nextLikedBy.length
      };
    })
  );

  savePosts(updated);
  return updated;
}


/* ---------------- Comments ---------------- */

export function addComment(posts, id, comment) {
  const iso = nowIso();

  const newComment =
    typeof comment === "string"
      ? { text: comment.trim(), name: "Guest", date: iso }
      : {
          text: String(comment?.text || "").trim(),
          name: String(comment?.name || "Guest"),
          date: comment?.date || iso
        };

  if (!newComment.text) return posts;

  const updated = normalize(
    posts.map((p) =>
      String(p.id) === String(id)
        ? { ...p, comments: [...(p.comments || []), newComment] }
        : p
    )
  );

  savePosts(updated);
  return updated;
}

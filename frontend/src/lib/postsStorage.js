// src/Context/postStorage.js

// ------------------- Constants -------------------
const KEY = "blog_posts_v1";

const nowIso = () => new Date().toISOString();
const today = () => nowIso().slice(0, 10);

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const safeStr = (v, fallback = "") => String(v ?? fallback);

// Stable local ID generator
const makeLocalId = () => `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Pick ID from post
const pickId = (p) => {
  if (p?._id) return String(p._id);
  if (p?.id) return String(p.id);
  return ""; // fallback
};

// ------------------- Normalize -------------------
export function normalize(arr) {
  const iso = nowIso();

  return (Array.isArray(arr) ? arr : []).map((p, idx) => {
    let id = pickId(p);
    if (!id) id = `seed-${idx}`;

    const tags = Array.isArray(p?.tags)
      ? p.tags.map((t) => safeStr(t).trim()).filter(Boolean)
      : [];

    const comments = Array.isArray(p?.comments)
      ? p.comments
          .map((c) => {
            if (typeof c === "string") {
              const text = c.trim();
              if (!text) return null;
              return { text, name: "Guest", date: iso };
            }
            const text = safeStr(c?.text).trim();
            if (!text) return null;
            return {
              text,
              name: safeStr(c?.name, "Guest").trim() || "Guest",
              date: c?.date || iso,
            };
          })
          .filter(Boolean)
      : [];

    return {
      ...p,
      _id: p?._id,
      id,
      title: safeStr(p?.title, "Untitled post").trim(),
      content: safeStr(p?.content, "").trim(),
      tags,
      comments,
      views: toNum(p?.views, 0),
      likes: toNum(p?.likes, 0),
      rating: clamp(toNum(p?.rating, 0), 0, 5),
      author: safeStr(p?.author, "Admin").trim() || "Admin",
      date: p?.date || today(),
      image: p?.image || "https://via.placeholder.com/600x300",
    };
  });
}

// ------------------- Safe helper -------------------
const safePosts = (posts) => Array.isArray(posts) ? posts : [];

// ------------------- Event System -------------------
const subscribers = new Set();

export function subscribePosts(callback) {
  if (typeof callback !== "function") return () => {};
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notifySubscribers(posts) {
  const norm = normalize(posts);
  subscribers.forEach((cb) => cb(norm));
}

// ------------------- Load / Clear -------------------
export function loadPosts(fallback = []) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return normalize(fallback);

    const data = JSON.parse(raw);
    const norm = normalize(data);
    return norm.length ? norm : normalize(fallback);
  } catch (e) {
    console.warn("Failed to load posts:", e);
    return normalize(fallback);
  }
}

export function clearPostsStorage() {
  try {
    localStorage.removeItem(KEY);
    notifySubscribers([]);
  } catch {}
}

// ------------------- Save -------------------
export function savePosts(posts) {
  try {
    const norm = normalize(posts);
    localStorage.setItem(KEY, JSON.stringify(norm));
    notifySubscribers(norm);
  } catch (e) {
    console.warn("Failed to save posts:", e);
  }
}

// ------------------- Mutators -------------------
export function addPost(posts, post) {
  const iso = nowIso();
  const p = post || {};
  const id = p?._id ? String(p._id) : p?.id ? String(p.id) : makeLocalId();

  const newPost = normalize([{
    ...p,
    id,
    _id: p._id,
    date: p.date ?? iso.slice(0, 10),
    views: p.views ?? 0,
    likes: p.likes ?? 0,
    comments: p.comments ?? [],
  }])[0];

  const updated = [newPost, ...safePosts(posts)];
  savePosts(updated);
  return updated;
}

export function updatePost(posts, id, patch) {
  const updated = normalize(
    safePosts(posts).map((p) => (String(p.id) === String(id) ? { ...p, ...patch } : p))
  );
  savePosts(updated);
  return updated;
}

export function deletePost(posts, id) {
  const updated = normalize(safePosts(posts).filter((p) => String(p.id) !== String(id)));
  savePosts(updated);
  return updated;
}

export function incViews(posts, id) {
  const updated = normalize(
    safePosts(posts).map((p) =>
      String(p.id) === String(id) ? { ...p, views: toNum(p.views) + 1 } : p
    )
  );
  savePosts(updated);
  return updated;
}

export function incLikes(posts, id) {
  const updated = normalize(
    safePosts(posts).map((p) =>
      String(p.id) === String(id) ? { ...p, likes: toNum(p.likes) + 1 } : p
    )
  );
  savePosts(updated);
  return updated;
}

export function toggleLike(posts, id) {
  return incLikes(posts, id);
}

export function addComment(posts, id, comment) {
  const iso = nowIso();
  const c = typeof comment === "string"
    ? { text: comment.trim(), name: "Guest", date: iso }
    : { text: safeStr(comment?.text), name: safeStr(comment?.name, "Guest") || "Guest", date: comment?.date || iso };

  if (!c.text) return normalize(posts);

  const updated = normalize(
    safePosts(posts).map((p) =>
      String(p.id) === String(id) ? { ...p, comments: [...(p.comments || []), c] } : p
    )
  );
  savePosts(updated);
  return updated;
}

// src/Context/postStorage.js

/* ---------------- Constants ---------------- */

const KEY = "blog_posts_v1";

const nowIso = () => new Date().toISOString();
const today = () => nowIso().slice(0, 10);

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const safeStr = (v, fallback = "") => String(v ?? fallback);

/* ---------------- ID Generator ---------------- */

const makeLocalId = () =>
  `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const pickId = (p) => String(p?._id || p?.id || "");

/* ---------------- User Key ---------------- */

let cachedUserKey = null;

export const getUserKey = () => {
  if (cachedUserKey) return cachedUserKey;

  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const u = JSON.parse(raw);

    cachedUserKey = String(u?.id || u?._id || u?.email || "");
    return cachedUserKey;
  } catch {
    return "";
  }
};

/* ---------------- Normalize Helpers ---------------- */

const normalizeTags = (tags) =>
  (Array.isArray(tags) ? tags : [])
    .map((t) => safeStr(t).trim())
    .filter(Boolean);

const normalizeLikedBy = (likedBy) => {
  const set = new Set();
  (Array.isArray(likedBy) ? likedBy : []).forEach((x) => {
    const s = safeStr(x).trim().toLowerCase();
    if (s) set.add(s);
  });
  return Array.from(set);
};

const normalizeComments = (comments) => {
  const iso = nowIso();

  return (Array.isArray(comments) ? comments : [])
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
    .filter(Boolean);
};

/* ---------------- Normalize Posts ---------------- */

export function normalize(arr) {
  const iso = nowIso();

  return (Array.isArray(arr) ? arr : []).map((p, idx) => {
    let id = pickId(p);
    if (!id) id = `seed-${idx}`;

    const likedBy = normalizeLikedBy(p?.likedBy);

    return {
      ...p,
      id,
      _id: p?._id,
      title: safeStr(p?.title, "Untitled post").trim(),
      content: safeStr(p?.content).trim(),
      tags: normalizeTags(p?.tags),
      comments: normalizeComments(p?.comments),
      likedBy,
      likes: likedBy.length || toNum(p?.likes),
      views: toNum(p?.views),
      rating: clamp(toNum(p?.rating), 0, 5),
      author: safeStr(p?.author, "Admin").trim(),
      date: p?.date || today(),
      image: p?.image || "https://via.placeholder.com/600x300",
    };
  });
}

/* ---------------- Safe Helpers ---------------- */

const safePosts = (posts) => (Array.isArray(posts) ? posts : []);

/* ---------------- Event System ---------------- */

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

/* ---------------- Storage ---------------- */

export function loadPosts(fallback = []) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return normalize(fallback);

    return normalize(JSON.parse(raw));
  } catch {
    return normalize(fallback);
  }
}

export function savePosts(posts) {
  try {
    const norm = normalize(posts);
    localStorage.setItem(KEY, JSON.stringify(norm));
    notifySubscribers(norm);
  } catch (e) {
    console.warn("Failed to save posts:", e);
  }
}

export function clearPostsStorage() {
  localStorage.removeItem(KEY);
  notifySubscribers([]);
}

/* ---------------- CRUD ---------------- */

export function addPost(posts, post) {
  const iso = nowIso();

  const id = pickId(post) || makeLocalId();

  const newPost = normalize([
    {
      ...post,
      id,
      date: post?.date ?? iso.slice(0, 10),
      views: post?.views ?? 0,
      likes: 0,
      likedBy: [],
      comments: post?.comments ?? [],
    },
  ])[0];

  const updated = [newPost, ...safePosts(posts)];
  savePosts(updated);
  return updated;
}

export function updatePost(posts, id, patch) {
  const updated = normalize(
    safePosts(posts).map((p) =>
      String(p.id) === String(id) ? { ...p, ...patch } : p
    )
  );

  savePosts(updated);
  return updated;
}

export function deletePost(posts, id) {
  const updated = normalize(
    safePosts(posts).filter((p) => String(p.id) !== String(id))
  );

  savePosts(updated);
  return updated;
}

/* ---------------- Views ---------------- */

export function incViews(posts, id) {
  const updated = normalize(
    safePosts(posts).map((p) =>
      String(p.id) === String(id)
        ? { ...p, views: toNum(p.views) + 1 }
        : p
    )
  );

  savePosts(updated);
  return updated;
}

/* ---------------- Likes ---------------- */

export function toggleLike(posts, id) {
  const user = getUserKey();
  if (!user) return posts;

  const updated = normalize(
    safePosts(posts).map((p) => {
      if (String(p.id) !== String(id)) return p;

      const likedBy = normalizeLikedBy(p.likedBy);
      const exists = likedBy.includes(user.toLowerCase());

      const next = exists
        ? likedBy.filter((x) => x !== user.toLowerCase())
        : [...likedBy, user.toLowerCase()];

      return {
        ...p,
        likedBy: next,
        likes: next.length,
      };
    })
  );

  savePosts(updated);
  return updated;
}

/* ---------------- Comments ---------------- */

export function addComment(posts, id, comment) {
  const iso = nowIso();

  const c =
    typeof comment === "string"
      ? { text: comment.trim(), name: "Guest", date: iso }
      : {
          text: safeStr(comment?.text).trim(),
          name: safeStr(comment?.name, "Guest"),
          date: comment?.date || iso,
        };

  if (!c.text) return posts;

  const updated = normalize(
    safePosts(posts).map((p) =>
      String(p.id) === String(id)
        ? { ...p, comments: [...(p.comments || []), c] }
        : p
    )
  );

  savePosts(updated);
  return updated;
}

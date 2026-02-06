// src/Context/postStorage.js
const KEY = "blog_posts_v1";

const nowIso = () => new Date().toISOString();
const today = () => nowIso().slice(0, 10);

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const uniqStrings = (arr) => {
  const out = [];
  const seen = new Set();
  (Array.isArray(arr) ? arr : []).forEach((x) => {
    const s = String(x || "").trim();
    if (!s) return;
    const k = s.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push(s);
  });
  return out;
};

// ---------------- Cached User Key ----------------
let cachedUserKey = null;
export const getUserKey = (userKey) => {
  if (userKey) return String(userKey).trim();
  if (cachedUserKey) return cachedUserKey;

  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const u = JSON.parse(raw);
    cachedUserKey = String(u?.id || u?._id || u?.email || "").trim();
    return cachedUserKey;
  } catch {
    return "";
  }
};

// ---------------- Normalization Helpers ----------------
const normalizeComments = (comments) => {
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
        name: String(c?.name || "Guest").trim(),
        date: c?.date || iso,
      };
    })
    .filter(Boolean);
};

const normalizeTags = (tags) =>
  (Array.isArray(tags) ? tags : [])
    .map((t) => String(t).trim())
    .filter(Boolean);

const normalizeLikedBy = (likedBy) => uniqStrings(likedBy || []);

// ---------------- Normalize Posts ----------------
export function normalize(arr) {
  const iso = nowIso();
  return (Array.isArray(arr) ? arr : []).map((p, idx) => {
    const id = String(p?.id ?? p?._id ?? `${idx}-${p?.title ?? "post"}`);
    const tags = normalizeTags(p?.tags);
    const comments = normalizeComments(p?.comments);
    const likedBy = normalizeLikedBy(p?.likedBy);
    return {
      ...p,
      id,
      title: String(p?.title || "Untitled post").trim(),
      content: String(p?.content || "").trim(),
      tags,
      comments,
      views: toNum(p?.views, 0),
      likedBy,
      likes: likedBy.length ? likedBy.length : toNum(p?.likes, 0),
      rating: clamp(toNum(p?.rating, 0), 0, 5),
      author: String(p?.author || "Admin").trim(),
      date: p?.date || today(),
      image: p?.image || "https://via.placeholder.com/600x300",
    };
  });
}

// ---------------- Storage Helpers ----------------
export function loadPosts(fallback = []) {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : fallback;
    return normalize(data);
  } catch (e) {
    console.warn("Failed to load posts:", e);
    return normalize(fallback);
  }
}

export function savePosts(posts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(normalize(posts)));
  } catch (e) {
    console.warn("Failed to save posts:", e);
  }
}

export function clearPostsStorage() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

// ---------------- CRUD Functions ----------------
export function addPost(posts, post) {
  const iso = nowIso();
  const newPost = normalize([{
    ...post,
    id: post.id ?? post._id ?? `p-${Date.now()}`,
    date: post.date ?? iso.slice(0, 10),
    views: post.views ?? 0,
    likes: post.likes ?? 0,
    likedBy: post.likedBy ?? [],
    comments: post.comments ?? [],
  }])[0];
  return { posts: [newPost, ...(Array.isArray(posts) ? posts : [])], post: newPost };
}

export function updatePost(posts, id, patch) {
  const updatedPosts = normalize(
    (Array.isArray(posts) ? posts : []).map((p) => (String(p.id) === String(id) ? { ...p, ...patch } : p))
  );
  const updatedPost = updatedPosts.find((p) => String(p.id) === String(id));
  return { posts: updatedPosts, post: updatedPost };
}

export function deletePost(posts, id) {
  return normalize((Array.isArray(posts) ? posts : []).filter((p) => String(p.id) !== String(id)));
}

export function incViews(posts, id) {
  return normalize(
    (Array.isArray(posts) ? posts : []).map((p) =>
      String(p.id) === String(id) ? { ...p, views: toNum(p.views, 0) + 1 } : p
    )
  );
}

export function toggleLike(posts, id, userKey) {
  const who = getUserKey(userKey);
  if (!who) return normalize(posts);

  return normalize(
    (Array.isArray(posts) ? posts : []).map((p) => {
      if (String(p.id) !== String(id)) return p;
      const likedBy = normalizeLikedBy(p?.likedBy);
      const exists = likedBy.some((x) => x.toLowerCase() === who.toLowerCase());
      const nextLikedBy = exists
        ? likedBy.filter((x) => x.toLowerCase() !== who.toLowerCase())
        : [...likedBy, who];
      return { ...p, likedBy: nextLikedBy, likes: nextLikedBy.length };
    })
  );
}

export function addComment(posts, id, comment) {
  const c =
    typeof comment === "string"
      ? { text: comment.trim(), name: "Guest", date: nowIso() }
      : {
          text: String(comment?.text || "").trim(),
          name: String(comment?.name || "Guest").trim(),
          date: comment?.date || nowIso(),
        };
  if (!c.text) return normalize(posts);

  return normalize(
    (Array.isArray(posts) ? posts : []).map((p) =>
      String(p.id) === String(id) ? { ...p, comments: [...(p.comments || []), c] } : p
    )
  );
}

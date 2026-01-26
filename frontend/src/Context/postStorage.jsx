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

const getUserKey = (userKey) => {
  // userKey can be passed in (preferred), otherwise read from localStorage user
  if (userKey) return String(userKey).trim();
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const u = JSON.parse(raw);
    return String(u?.id || u?._id || u?.email || "").trim();
  } catch {
    return "";
  }
};

/* Normalize posts so UI never crashes */
export function normalize(arr) {
  const iso = nowIso();

  return (Array.isArray(arr) ? arr : []).map((p, idx) => {
    const id = String(p?.id ?? p?._id ?? `${idx}-${p?.title ?? "post"}`);


    const tags = Array.isArray(p?.tags)
      ? p.tags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    const comments = Array.isArray(p?.comments)
      ? p.comments
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
          .filter(Boolean)
      : [];

    // ✅ likedBy array (backward compatible)
    const likedBy = uniqStrings(p?.likedBy || []);

    return {
      ...p,
      id,
      title: String(p?.title || "Untitled post").trim(),
      content: String(p?.content || "").trim(),
      tags,
      comments,
      views: toNum(p?.views, 0),

      // ✅ likes always consistent with likedBy length (fallback to numeric if no likedBy)
      likedBy,
      likes: likedBy.length ? likedBy.length : toNum(p?.likes, 0),

      rating: clamp(toNum(p?.rating, 0), 0, 5),
      author: String(p?.author || "Admin").trim(),
      date: p?.date || today(),
      image: p?.image || "https://via.placeholder.com/600x300",
    };
  });
}

/* Load from localStorage */
export function loadPosts(fallback = []) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return normalize(fallback);

    const data = JSON.parse(raw);
    const norm = normalize(data);

    // if empty storage but fallback exists
    if (norm.length === 0 && Array.isArray(fallback) && fallback.length) {
      return normalize(fallback);
    }

    return norm;
  } catch (e) {
    console.warn("Failed to load posts:", e);
    return normalize(fallback);
  }
}

/* Save safely */
export function savePosts(posts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(normalize(posts)));
  } catch (e) {
    console.warn("Failed to save posts:", e);
  }
}

/* Add post */
export function addPost(posts, post) {
  const iso = nowIso();
  const p = post || {};

  const newPost = normalize([
    {
      ...p,
      id: p.id ?? p._id ?? `p-${Date.now()}`,
      date: p.date ?? iso.slice(0, 10),
      views: p.views ?? 0,
      likes: p.likes ?? 0,
      likedBy: p.likedBy ?? [],
      comments: p.comments ?? [],
    },
  ])[0];

  return [newPost, ...(Array.isArray(posts) ? posts : [])];
}

/* Update post */
export function updatePost(posts, id, patch) {
  const list = Array.isArray(posts) ? posts : [];
  return normalize(
    list.map((p) => (String(p.id) === String(id) ? { ...p, ...patch } : p))
  );
}

/* Delete post */
export function deletePost(posts, id) {
  const list = Array.isArray(posts) ? posts : [];
  return normalize(list.filter((p) => String(p.id) !== String(id)));
}

/* Increment views */
export function incViews(posts, id) {
  const list = Array.isArray(posts) ? posts : [];
  return normalize(
    list.map((p) =>
      String(p.id) === String(id)
        ? { ...p, views: toNum(p.views, 0) + 1 }
        : p
    )
  );
}

/* Increment likes (legacy/simple) */
export function incLikes(posts, id) {
  const list = Array.isArray(posts) ? posts : [];
  return normalize(
    list.map((p) =>
      String(p.id) === String(id)
        ? { ...p, likes: toNum(p.likes, 0) + 1 }
        : p
    )
  );
}

/* ✅ Toggle like (real like/unlike per user) */
export function toggleLike(posts, id, userKey) {
  const list = Array.isArray(posts) ? posts : [];
  const who = getUserKey(userKey);
  if (!who) return normalize(list); // no logged in user => do nothing

  return normalize(
    list.map((p) => {
      if (String(p.id) !== String(id)) return p;

      const likedBy = uniqStrings(p?.likedBy || []);
      const exists = likedBy.some((x) => x.toLowerCase() === who.toLowerCase());

      const nextLikedBy = exists
        ? likedBy.filter((x) => x.toLowerCase() !== who.toLowerCase())
        : [...likedBy, who];

      return {
        ...p,
        likedBy: nextLikedBy,
        likes: nextLikedBy.length,
      };
    })
  );
}

/* Add comment */
export function addComment(posts, id, comment) {
  const list = Array.isArray(posts) ? posts : [];
  const iso = nowIso();

  const c =
    typeof comment === "string"
      ? { text: comment.trim(), name: "Guest", date: iso }
      : {
          text: String(comment?.text || "").trim(),
          name: String(comment?.name || "Guest").trim(),
          date: comment?.date || iso,
        };

  if (!c.text) return normalize(list);

  return normalize(
    list.map((p) =>
      String(p.id) === String(id)
        ? { ...p, comments: [...(p.comments || []), c] }
        : p
    )
  );
}

/* Clear storage */
export function clearPostsStorage() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

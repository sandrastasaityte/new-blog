const KEY = "blog_posts_v1";

const nowIso = () => new Date().toISOString();
const today = () => nowIso().slice(0, 10);

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const safeStr = (v, fallback = "") => String(v ?? fallback);

const getStableId = (p, idx) => {
  // ✅ Prefer MongoDB _id if exists
  if (p?._id) return String(p._id);
  if (p?.id) return String(p.id);

  // ✅ Stable fallback (no title-based ids)
  // NOTE: still stable per saved list because it’s saved to localStorage after first normalize
  return `local-${Date.now()}-${idx}`;
};

/* Normalize posts so UI never crashes */
export function normalize(arr) {
  const iso = nowIso();

  return (Array.isArray(arr) ? arr : []).map((p, idx) => {
    const id = getStableId(p, idx);

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

      // ✅ Keep _id if backend has it (helpful if you send it back)
      _id: p?._id,

      // ✅ Single source of truth for UI
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

/* Load from localStorage */
export function loadPosts(fallback = []) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return normalize(fallback);

    const data = JSON.parse(raw);
    const norm = normalize(data);

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
      // ✅ if backend returns _id/id it will be used automatically
      id: p.id,
      _id: p._id,
      date: p.date ?? iso.slice(0, 10),
      views: p.views ?? 0,
      likes: p.likes ?? 0,
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
      String(p.id) === String(id) ? { ...p, views: toNum(p.views, 0) + 1 } : p
    )
  );
}

/* Increment likes */
export function incLikes(posts, id) {
  const list = Array.isArray(posts) ? posts : [];
  return normalize(
    list.map((p) =>
      String(p.id) === String(id) ? { ...p, likes: toNum(p.likes, 0) + 1 } : p
    )
  );
}

/* ✅ Optional: toggle like (like/unlike) */
export function toggleLike(posts, id) {
  const list = Array.isArray(posts) ? posts : [];
  return normalize(
    list.map((p) =>
      String(p.id) === String(id)
        ? { ...p, likes: Math.max(0, toNum(p.likes, 0) + 1) } // if you want true toggle, we’ll store a "liked" flag
        : p
    )
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
          text: safeStr(comment?.text).trim(),
          name: safeStr(comment?.name, "Guest").trim() || "Guest",
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

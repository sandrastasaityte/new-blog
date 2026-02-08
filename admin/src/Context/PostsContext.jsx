import React,
{
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect
} from "react";

/* -------------------------------------------
   Constants
------------------------------------------- */

const STORAGE_KEY = "blog_posts";

/* -------------------------------------------
   Helpers
------------------------------------------- */

function generateId() {
  return crypto.randomUUID();
}

function slugify(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function ensureUniqueSlug(posts, slug) {
  let unique = slug;
  let counter = 1;

  while (posts.some(p => p.slug === unique)) {
    unique = `${slug}-${counter++}`;
  }

  return unique;
}

/* -------------------------------------------
   Context
------------------------------------------- */

const PostsContext = createContext(null);

export function usePosts() {
  const ctx = useContext(PostsContext);

  if (!ctx) {
    throw new Error("usePosts must be used inside PostsProvider");
  }

  return ctx;
}

/* -------------------------------------------
   Provider
------------------------------------------- */

export function PostsProvider({ children }) {

  /* ---------- Load posts from storage ---------- */

  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  /* ---------- Persist posts ---------- */

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {}
  }, [posts]);

  /* ---------- Add Post ---------- */

  const addPost = useCallback(
    ({ title, content, tags, image, author }) => {

      setPosts(prev => {

        const baseSlug = slugify(title || "untitled");
        const slug = ensureUniqueSlug(prev, baseSlug);

        const newPost = {
          id: generateId(),
          title: title || "Untitled",
          slug,
          content: content || "",
          tags: tags || [],
          image: image || "https://via.placeholder.com/600x300",
          author: author || "Anonymous",
          publishedAt: new Date().toISOString(),
          views: 0,
          likes: [],
          comments: []
        };

        return [newPost, ...prev];
      });
    },
    []
  );

  /* ---------- Delete Post ---------- */

  const deletePost = useCallback((id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  /* ---------- Edit Post ---------- */

  const editPost = useCallback((id, updatedFields) => {

    setPosts(prev =>
      prev.map(p => {

        if (p.id !== id) return p;

        const updated = { ...p, ...updatedFields };

        if (updatedFields.title) {
          const newSlug = ensureUniqueSlug(prev, slugify(updatedFields.title));
          updated.slug = newSlug;
        }

        return updated;
      })
    );

  }, []);

  /* ---------- Track Views ---------- */

  const incrementViews = useCallback((id) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, views: (p.views || 0) + 1 }
          : p
      )
    );
  }, []);

  /* ---------- Toggle Like ---------- */

  const toggleLike = useCallback((id, userId = "guest") => {

    setPosts(prev =>
      prev.map(p => {

        if (p.id !== id) return p;

        const likes = new Set(p.likes || []);

        likes.has(userId)
          ? likes.delete(userId)
          : likes.add(userId);

        return { ...p, likes: Array.from(likes) };
      })
    );

  }, []);

  /* ---------- Add Comment ---------- */

  const addComment = useCallback((id, comment) => {

    setPosts(prev =>
      prev.map(p => {

        if (p.id !== id) return p;

        const newComment = {
          id: generateId(),
          text: comment.text || "",
          author: comment.author || "Guest",
          createdAt: new Date().toISOString()
        };

        return {
          ...p,
          comments: [...(p.comments || []), newComment]
        };
      })
    );

  }, []);

  /* ---------- Memoized Value ---------- */

  const value = useMemo(() => ({
    posts,
    addPost,
    editPost,
    deletePost,
    toggleLike,
    addComment,
    incrementViews
  }), [posts, addPost, editPost, deletePost, toggleLike, addComment, incrementViews]);

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}

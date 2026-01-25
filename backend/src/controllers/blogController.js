import Blog from "../models/Blog.js";

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags.map((t) => String(t || "").trim()).filter(Boolean);
  if (typeof tags === "string") {
    return tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
};

const safeDate = (d) => {
  if (!d) return new Date();
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? new Date() : dt;
};

// GET /posts
export async function getBlogs(req, res, next) {
  try {
    const blogs = await Blog.find().sort({ date: -1, createdAt: -1 });
    res.json(blogs);
  } catch (e) {
    next(e);
  }
}

// POST /posts (protected)
export async function createBlog(req, res, next) {
  try {
    const { title, content, image, tags, date, rating, author, authorImage } = req.body || {};

    if (!title || !String(title).trim() || !content || !String(content).trim()) {
      res.status(400);
      throw new Error("Title and content are required");
    }

    const blog = await Blog.create({
      title: String(title).trim(),
      content: String(content).trim(),
      image: String(image || "").trim(),
      tags: parseTags(tags),
      date: safeDate(date),

      // ✅ don’t trust client for these
      views: 0,
      likes: 0,
      comments: [],

      rating: clamp(toNum(rating, 0), 0, 5),
      author: String(author || "Admin").trim(),
      authorImage: String(authorImage || "").trim(),
    });

    res.status(201).json(blog);
  } catch (e) {
    next(e);
  }
}

// PUT /posts/:id (protected)
export async function updateBlog(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error("Post not found");
    }

    const patch = req.body || {};

    if (patch.title !== undefined) {
      const t = String(patch.title || "").trim();
      if (!t) {
        res.status(400);
        throw new Error("Title cannot be empty");
      }
      blog.title = t;
    }

    if (patch.content !== undefined) {
      const c = String(patch.content || "").trim();
      if (!c) {
        res.status(400);
        throw new Error("Content cannot be empty");
      }
      blog.content = c;
    }

    if (patch.image !== undefined) blog.image = String(patch.image || "").trim();

    // ✅ only change tags if provided
    if (patch.tags !== undefined) blog.tags = parseTags(patch.tags);

    if (patch.date !== undefined) blog.date = safeDate(patch.date);
    if (patch.rating !== undefined) blog.rating = clamp(toNum(patch.rating, 0), 0, 5);

    if (patch.author !== undefined) blog.author = String(patch.author || "Admin").trim();
    if (patch.authorImage !== undefined) blog.authorImage = String(patch.authorImage || "").trim();

    // ✅ protect counters from being edited directly unless you want it
    // if (patch.views !== undefined) blog.views = toNum(patch.views, 0);
    // if (patch.likes !== undefined) blog.likes = toNum(patch.likes, 0);

    const saved = await blog.save();
    res.json(saved);
  } catch (e) {
    next(e);
  }
}

// DELETE /posts/:id (protected)
export async function deleteBlog(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error("Post not found");
    }

    await blog.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (e) {
    next(e);
  }
}

// POST /posts/:id/like (protected or public — your choice)
export async function likeBlog(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404);
      throw new Error("Post not found");
    }

    blog.likes = Number(blog.likes || 0) + 1;
    await blog.save();

    res.json({ message: "Liked", likes: blog.likes });
  } catch (e) {
    next(e);
  }
}

// POST /posts/:id/comments (public or protected — your choice)
export async function addComment(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404);
      throw new Error("Post not found");
    }

    const name = String(req.body?.name || "Guest").trim() || "Guest";
    const text = String(req.body?.text || "").trim();

    if (!text) {
      res.status(400);
      throw new Error("Comment text is required");
    }

    blog.comments = blog.comments || [];
    blog.comments.push({ name, text, date: new Date() });

    await blog.save();

    res.status(201).json({ message: "Comment added", comments: blog.comments });
  } catch (e) {
    next(e);
  }
}

import Blog from "../models/Blog.js";

/* =========================================================
   Helpers
========================================================= */

const sanitize = (doc) => {
  const obj = doc.toObject();
  delete obj.__v;
  return obj;
};

const parseTags = (tags) => {
  if (Array.isArray(tags))
    return tags.map(t => String(t).trim()).filter(Boolean);

  if (typeof tags === "string")
    return tags.split(",").map(t => t.trim()).filter(Boolean);

  return [];
};

const slugify = (text) =>
  text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");


/* =========================================================
   GET BLOGS
========================================================= */

export async function getBlogs(req, res, next) {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs.map(sanitize));
  } catch (e) {
    next(e);
  }
}


/* =========================================================
   CREATE BLOG
========================================================= */

export async function createBlog(req, res, next) {
  try {
    const { title, content, image, tags, author } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({
        message: "Title and content required"
      });
    }

    const blog = await Blog.create({
      title: title.trim(),
      slug: slugify(title),
      content: content.trim(),
      image: image || "",
      tags: parseTags(tags),
      author: author || req.user?.username || "Admin",
      likes: 0,
      views: 0,
      comments: [],
      likedBy: []
    });

    res.status(201).json(sanitize(blog));

  } catch (e) {
    next(e);
  }
}


/* =========================================================
   UPDATE BLOG
========================================================= */

export async function updateBlog(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog)
      return res.status(404).json({ message: "Post not found" });

    const patch = req.body;

    if (patch.title) {
      blog.title = patch.title.trim();
      blog.slug = slugify(patch.title);
    }

    if (patch.content) blog.content = patch.content.trim();
    if (patch.tags) blog.tags = parseTags(patch.tags);
    if (patch.image !== undefined) blog.image = patch.image;

    await blog.save();

    res.json(sanitize(blog));

  } catch (e) {
    next(e);
  }
}


/* =========================================================
   DELETE BLOG
========================================================= */

export async function deleteBlog(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog)
      return res.status(404).json({ message: "Post not found" });

    await blog.deleteOne();

    res.json({ message: "Post deleted" });

  } catch (e) {
    next(e);
  }
}


/* =========================================================
   LIKE BLOG
========================================================= */

export async function likeBlog(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog)
      return res.status(404).json({ message: "Post not found" });

    const userKey = req.user?.id || "guest";

    const already = blog.likedBy.includes(userKey);

    if (already) {
      blog.likedBy = blog.likedBy.filter(id => id !== userKey);
      blog.likes = Math.max(0, blog.likes - 1);
    } else {
      blog.likedBy.push(userKey);
      blog.likes += 1;
    }

    await blog.save();

    res.json({
      likes: blog.likes,
      liked: !already
    });

  } catch (e) {
    next(e);
  }
}


/* =========================================================
   ADD COMMENT  ⭐ THIS WAS MISSING
========================================================= */

export async function addComment(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog)
      return res.status(404).json({ message: "Post not found" });

    const text = String(req.body.text || "").trim();

    if (!text)
      return res.status(400).json({ message: "Comment required" });

    blog.comments.push({
      user: req.user?.username || "Guest",
      content: text,
      createdAt: new Date()
    });

    await blog.save();

    res.status(201).json(sanitize(blog));

  } catch (e) {
    next(e);
  }
}

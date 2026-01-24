import Blog from "../models/Blog.js";

// GET /blogs
export async function getBlogs(req, res, next) {
  try {
    const blogs = await Blog.find().sort({ date: -1, createdAt: -1 });
    res.json(blogs);
  } catch (e) {
    next(e);
  }
}

// POST /blogs (protected)
export async function createBlog(req, res, next) {
  try {
    const { title, content, image, tags, date, views, author, authorImage } =
      req.body || {};

    if (!title || !content) {
      res.status(400);
      throw new Error("Title and content are required");
    }

    const blog = await Blog.create({
      title,
      content,
      image: image || "",
      tags: Array.isArray(tags) ? tags : [],
      date: date ? new Date(date) : new Date(),
      views: typeof views === "number" ? views : 0,
      author: author || "Admin",
      authorImage: authorImage || "",
    });

    res.status(201).json(blog);
  } catch (e) {
    next(e);
  }
}

// PUT /blogs/:id (protected)
export async function updateBlog(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error("Blog not found");
    }

    const patch = req.body || {};

    if (patch.title !== undefined) blog.title = patch.title;
    if (patch.content !== undefined) blog.content = patch.content;
    if (patch.image !== undefined) blog.image = patch.image;
    if (patch.tags !== undefined)
      blog.tags = Array.isArray(patch.tags) ? patch.tags : [];
    if (patch.date !== undefined) blog.date = new Date(patch.date);
    if (patch.views !== undefined) blog.views = Number(patch.views) || 0;
    if (patch.author !== undefined) blog.author = patch.author;
    if (patch.authorImage !== undefined) blog.authorImage = patch.authorImage;

    const saved = await blog.save();
    res.json(saved);
  } catch (e) {
    next(e);
  }
}

// DELETE /blogs/:id (protected)
export async function deleteBlog(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error("Blog not found");
    }

    await blog.deleteOne();
    res.json({ message: "Blog deleted" });
  } catch (e) {
    next(e);
  }
}

import Blog from "../models/Blog.js";

/* =========================================================
   HELPERS
========================================================= */

const sanitize = (doc) => {
  const obj = doc.toObject();
  delete obj.__v;
  return obj;
};

const parseTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map(t => String(t).trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
  }

  return [];
};

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

/* =========================================================
   GET ALL POSTS
========================================================= */

export async function getPosts(req, res, next) {
  try {
    const posts = await Blog.find().sort({ createdAt: -1 });
    res.json(posts.map(sanitize));
  } catch (err) {
    next(err);
  }
}

/* =========================================================
   GET SINGLE POST
========================================================= */

export async function getPostById(req, res, next) {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(sanitize(post));
  } catch (err) {
    next(err);
  }
}

/* =========================================================
   CREATE POST (AUTH REQUIRED)
========================================================= */

export async function createPost(req, res, next) {
  try {
    const { title, content, image, tags } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const post = await Blog.create({
      title: title.trim(),
      slug: slugify(title),
      content: content.trim(),
      image: image || "",
      tags: parseTags(tags),
      author: req.user?.username || "Admin",
      likes: 0,
      likedBy: [],
      views: 0,
      comments: [],
    });

    res.status(201).json(sanitize(post));
  } catch (err) {
    next(err);
  }
}

/* =========================================================
   UPDATE POST (AUTH REQUIRED)
========================================================= */

export async function updatePost(req, res, next) {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { title, content, tags, image } = req.body;

    if (title) {
      post.title = title.trim();
      post.slug = slugify(title);
    }

    if (content) post.content = content.trim();
    if (tags) post.tags = parseTags(tags);
    if (image !== undefined) post.image = image;

    await post.save();

    res.json(sanitize(post));
  } catch (err) {
    next(err);
  }
}

/* =========================================================
   DELETE POST (AUTH REQUIRED)
========================================================= */

export async function deletePost(req, res, next) {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
}

/* =========================================================
   LIKE / UNLIKE POST (AUTH REQUIRED)
========================================================= */

export async function likePost(req, res, next) {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userKey = String(req.user._id);
    const alreadyLiked = post.likedBy.includes(userKey);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(id => id !== userKey);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userKey);
      post.likes += 1;
    }

    await post.save();

    res.json({
      likes: post.likes,
      liked: !alreadyLiked,
    });
  } catch (err) {
    next(err);
  }
}

/* =========================================================
   ADD COMMENT
========================================================= */

export async function addComment(req, res, next) {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const text = String(req.body.text || "").trim();
    if (!text) {
      return res.status(400).json({ message: "Comment text required" });
    }

    post.comments.push({
      user: req.user?.username || "Guest",
      content: text,
      createdAt: new Date(),
    });

    await post.save();

    res.status(201).json(sanitize(post));
  } catch (err) {
    next(err);
  }
}

/* =========================================================
   INCREMENT VIEWS
========================================================= */

export async function incViews(req, res, next) {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.views += 1;
    await post.save();

    res.json({ views: post.views });
  } catch (err) {
    next(err);
  }
}

import express from "express";
import Blog from "../Models/Blog.js";

const router = express.Router();

// GET all blogs
router.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single blog by ID
router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new blog
router.post("/", async (req, res) => {
    const { title, content, author } = req.body;
    const newBlog = new Blog({ title, content, author });
    try {
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a blog
router.delete("/:id", async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });
        res.json({ message: "Blog deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE a blog
router.put("/:id", async (req, res) => {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBlog) return res.status(404).json({ message: "Blog not found" });
        res.json(updatedBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;

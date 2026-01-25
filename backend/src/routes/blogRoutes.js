import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
} from "../controllers/blogController.js";

const router = express.Router();

router.get("/", getBlogs);
router.post("/", protect, createBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

// optional: protect these or make them public
router.post("/:id/like", likeBlog);
router.post("/:id/comments", addComment);

export default router;

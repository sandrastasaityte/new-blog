import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.get("/", getBlogs);
router.post("/", protect, createBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

export default router;

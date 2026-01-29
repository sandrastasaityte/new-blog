import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import { getBlogs, createBlog, updateBlog, deleteBlog, likeBlog, addComment } from "../controllers/blogController.js";

const router = express.Router();
const asyncHandler = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

const commentLimiter = rateLimit({ windowMs: 1*60*1000, max:5, message:{ message:"Too many comments, try again later." } });
const blogValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("rating").optional().isFloat({ min:0, max:5 }),
];

router.get("/", asyncHandler(getBlogs));
router.post("/", protect, blogValidation, asyncHandler(createBlog));
router.put("/:id", protect, blogValidation, asyncHandler(updateBlog));
router.delete("/:id", protect, asyncHandler(deleteBlog));
router.post("/:id/like", asyncHandler(likeBlog));
router.post("/:id/comments", commentLimiter, asyncHandler(addComment));

export default router;

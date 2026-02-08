import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment
} from "../controllers/blogController.js";

const router = express.Router();

/* ---------------- Async Wrapper ---------------- */

const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ---------------- Rate Limits ---------------- */

const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Too many comments. Try later." }
});

/* ---------------- Validation Handler ---------------- */

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg
    });
  }

  next();
};

/* ---------------- CREATE Validation ---------------- */

const createBlogValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),

  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
];

/* ---------------- UPDATE Validation ---------------- */

const updateBlogValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),

  body("content")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty"),

  body("tags")
    .optional()
    .isArray(),

  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
];

/* ---------------- Routes ---------------- */

router.get("/", asyncHandler(getBlogs));

router.post(
  "/",
  protect,
  createBlogValidation,
  validate,
  asyncHandler(createBlog)
);

router.put(
  "/:id",
  protect,
  updateBlogValidation,
  validate,
  asyncHandler(updateBlog)
);

router.delete("/:id", protect, asyncHandler(deleteBlog));

router.post("/:id/like", protect, asyncHandler(likeBlog));

router.post(
  "/:id/comments",
  protect,
  commentLimiter,
  body("text").trim().notEmpty().withMessage("Comment text required"),
  validate,
  asyncHandler(addComment)
);

export default router;

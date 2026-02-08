import express from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

import { register, login, me } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------------- Async Wrapper ---------------- */

const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ---------------- Rate Limits ---------------- */

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again later." },
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many registrations. Try later." },
});

/* ---------------- Validation ---------------- */

const registerValidation = [
  body("username")
    .trim()
    .toLowerCase()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),

  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("email")
    .optional()
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Invalid email"),
];

const loginValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username or email is required"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required"),
];

/* ---------------- Validation Handler ---------------- */

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
    });
  }

  next();
};

/* ---------------- Routes ---------------- */

router.post(
  "/register",
  registerLimiter,
  registerValidation,
  validate,
  asyncHandler(register)
);

router.post(
  "/login",
  loginLimiter,
  loginValidation,
  validate,
  asyncHandler(login)
);

router.get("/me", protect, asyncHandler(me));

export default router;

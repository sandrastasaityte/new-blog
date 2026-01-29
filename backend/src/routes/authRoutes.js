import express from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import { register, login, me } from "../controllers/authController.js";
import { protect as requireAuth } from "../middleware/authMiddleware.js";


const router = express.Router();

// ---------- Async wrapper to catch errors ----------
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- Rate limiter for login ----------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // max 10 attempts per window
  message: { message: "Too many login attempts. Try again later." },
});

// ---------- Validation rules ----------
const registerValidation = [
  body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("email").optional().isEmail().withMessage("Invalid email address"),
];

const loginValidation = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// ---------- Routes ----------
router.post("/register", registerValidation, asyncHandler(register));
router.post("/login", loginLimiter, loginValidation, asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

export default router;

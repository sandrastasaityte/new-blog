import express from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { register, login, me } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Try again later." },
});

const registerValidation = [
  body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("email").optional().isEmail().withMessage("Invalid email address"),
];

const loginValidation = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post("/register", registerValidation, validate, asyncHandler(register));
router.post("/login", loginLimiter, loginValidation, validate, asyncHandler(login));
router.get("/me", protect, asyncHandler(me));

export default router;

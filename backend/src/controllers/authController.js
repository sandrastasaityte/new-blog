// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper to generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing in .env");
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ---------------- REGISTER ----------------
export async function register(req, res, next) {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      res.status(400);
      throw new Error("Username and password are required");
    }

    // Check if username exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      res.status(400);
      throw new Error("Username already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      passwordHash,
      email: email || undefined,
    });

    const token = generateToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
}

// ---------------- LOGIN ----------------
export async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400);
      throw new Error("Username and password are required");
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    // Optional: update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

// ---------------- ME ----------------
export async function me(req, res, next) {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }
    res.json(req.user);
  } catch (err) {
    next(err);
  }
}

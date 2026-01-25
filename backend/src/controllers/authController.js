import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export async function register(req, res, next) {
  try {
    let { username, password } = req.body || {};

    username = String(username || "").trim().toLowerCase();
    password = String(password || "");

    if (!username || !password) {
      res.status(400);
      throw new Error("Username and password are required");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const exists = await User.findOne({ username });
    if (exists) {
      res.status(409);
      throw new Error("Username already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });

    // ✅ IMPORTANT: return token so frontend can log in immediately
    const token = signToken(user);

    res.status(201).json({
      message: "Registered successfully",
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    let { username, password } = req.body || {};

    username = String(username || "").trim().toLowerCase();
    password = String(password || "");

    if (!username || !password) {
      res.status(400);
      throw new Error("Username and password are required");
    }

    const user = await User.findOne({ username });
    if (!user) {
      res.status(401);
      throw new Error("Invalid username or password");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401);
      throw new Error("Invalid username or password");
    }

    const token = signToken(user);

    res.json({
      message: "Logged in",
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    next(err);
  }
}

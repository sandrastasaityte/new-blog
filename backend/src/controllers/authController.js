import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export async function register(req, res, next) {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      res.status(400);
      throw new Error("Username and password are required");
    }

    if (String(password).length < 6) {
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

    res.status(201).json({
      message: "Registered successfully",
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body || {};

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

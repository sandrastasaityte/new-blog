import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Use environment variables for security
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Utility: sanitize user object for response
const safeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// ---------------- REGISTER ----------------
export async function register(req, res) {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check for existing username (case-insensitive)
    const existing = await User.findOne({ username: new RegExp(`^${username}$`, "i") });
    if (existing) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      email: email?.trim(),
      passwordHash,
      role: "user",
      isActive: true,
    });

    res.status(201).json({ user: safeUser(user) });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ---------------- LOGIN ----------------
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Sign JWT
    if (!JWT_SECRET) {
      console.error("JWT_SECRET missing");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}

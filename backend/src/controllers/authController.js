import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ---------------- TOKEN ----------------
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// Remove sensitive data
const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

// ---------------- REGISTER ----------------
export async function register(req, res, next) {
  try {
    let { username, password, email } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Username and password required" });

    username = username.toLowerCase().trim();
    email = email?.toLowerCase().trim();

    const exists = await User.findOne({ username });
    if (exists)
      return res.status(400).json({ message: "Username already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      passwordHash,
      email,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: sanitizeUser(user),
    });

  } catch (err) {
    next(err);
  }
}

// ---------------- LOGIN ----------------
export async function login(req, res, next) {
  try {
    let { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Username and password required" });

    username = username.toLowerCase().trim();

    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    user.lastLogin = new Date();
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: sanitizeUser(user),
    });

  } catch (err) {
    next(err);
  }
}

// ---------------- ME ----------------
export async function me(req, res) {
  if (!req.user)
    return res.status(401).json({ message: "Not authorized" });

  res.json(sanitizeUser(req.user));
}

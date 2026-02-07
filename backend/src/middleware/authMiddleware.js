import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id username role");
    if (!user) return res.status(401).json({ message: "Not authorized" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Protect middleware error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

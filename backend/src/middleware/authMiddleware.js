import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized, no token"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, ... }
    next();
  } catch (e) {
    res.status(401);
    next(new Error("Not authorized, token invalid"));
  }
}

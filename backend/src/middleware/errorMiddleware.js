// src/middleware/errorMiddleware.js

// ---------------- Not Found ----------------
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// ---------------- Error Handler ----------------
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server Error";

  // ---------------- Mongoose Cast Error (Invalid ID) ----------------
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ---------------- Mongoose Duplicate Key ----------------
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // ---------------- Mongoose Validation Error ----------------
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // ---------------- JWT Errors ----------------
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // ---------------- Console Logging ----------------
  if (process.env.NODE_ENV !== "production") {
    console.error("❌ ERROR:", err);
  } else {
    console.error("❌ ERROR:", message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
      error: err,
    }),
  });
};

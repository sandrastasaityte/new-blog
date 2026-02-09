// src/middleware/errorMiddleware.js

/* =====================================================
   NOT FOUND MIDDLEWARE
===================================================== */

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/* =====================================================
   ERROR HANDLER
===================================================== */

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  /* ---------- Default Status ---------- */
  let statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : 500;

  let message = err.message || "Server Error";

  /* =====================================================
     MONGOOSE ERRORS
  ===================================================== */

  // Invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field} already exists`;
  }

  // Validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map(e => e.message)
      .join(", ");
  }

  /* =====================================================
     JWT ERRORS
  ===================================================== */

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  /* =====================================================
     LOGGING
  ===================================================== */

  if (process.env.NODE_ENV !== "production") {
    console.error("❌ ERROR:", err);
  } else {
    console.error("❌ ERROR:", message);
  }

  /* =====================================================
     RESPONSE FORMAT
  ===================================================== */

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
    })
  });
};

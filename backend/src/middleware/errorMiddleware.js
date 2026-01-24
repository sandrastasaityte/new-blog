export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Server error",
  });
}

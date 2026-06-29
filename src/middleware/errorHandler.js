/**
 * Global error handling middleware.
 * Catches all errors thrown in route handlers and middleware.
 */
const errorHandler = (err, req, res, _next) => {
  console.error("Error:", err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Prisma known request errors
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A record with that unique value already exists.",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found.",
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;

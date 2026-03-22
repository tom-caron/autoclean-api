class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Capture la stack trace pour le débug
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
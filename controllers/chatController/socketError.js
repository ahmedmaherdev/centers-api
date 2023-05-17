class SocketError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.data = {
      statusCode: statusCode,
      status: `${statusCode}`.startsWith("4") ? "fail" : "error",
    };
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = SocketError;

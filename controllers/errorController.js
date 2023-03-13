const AppError = require("./../utils/appError");
const { StatusCodes } = require("http-status-codes");

const handleLenError = (err) => {
  const message = `Invalid input data. ${err.errors[0].path} must be more than ${err.errors[0].validatorArgs[0]} characters and less than ${err.errors[0].validatorArgs[1]} characters.`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleNotFoundForeignkeyError = (err) => {
  const message = `${err.fields.join(" , ")} not found.`;
  return new AppError(message, StatusCodes.NOT_FOUND);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${JSON.stringify(
    err.fields
  )}. Please use another value`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (err) => {
  // handle len error
  if (err.errors[0]?.validatorName === "len") return handleLenError(err);
  //handle unique error
  if (err.original?.code === "ER_DUP_ENTRY")
    return handleDuplicateFieldsDB(err);
  // handle other validation error
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleJWTError = () =>
  new AppError("Invalid token! Please log in again.", StatusCodes.UNAUTHORIZED);

const handleJWTExpiredError = () =>
  new AppError(
    "Your token has expired! please log in again.",
    StatusCodes.UNAUTHORIZED
  );

const sendErrorDev = (err, req, res) => {
  // Api
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith("/api")) {
    // Operational, trusted error: send message to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Programming or other unknown error: don't leak error details
    }

    // 1) Log the error to the console
    console.error("Error", err);

    // 2) Send generic message
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (error.message.toLocaleLowerCase().includes("validation error"))
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (error.name === "SequelizeForeignKeyConstraintError")
      error = handleNotFoundForeignkeyError(error);
    sendErrorProd(error, req, res);
  }
};

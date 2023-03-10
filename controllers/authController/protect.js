const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { Stat, StatusCodesusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const db = require("../../models");

module.exports = catchAsync(async (req, res, next) => {
  let token = req.cookies.jwt;
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    token = req.headers.authorization.split(" ")[1];

  if (!token)
    return next(
      new AppError(
        "You are not logged in! Please log in to get access.",
        StatusCodes.UNAUTHORIZED
      )
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await db.Users.findByPk(decoded.id);

  if (!currentUser)
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        StatusCodes.UNAUTHORIZED
      )
    );

  if (currentUser.isPasswordChangedAfter(decoded.iat))
    return next(
      new AppError(
        "User recently changed the password! Please log in again.",
        StatusCodes.UNAUTHORIZED
      )
    );

  req.user = currentUser;
  next();
});

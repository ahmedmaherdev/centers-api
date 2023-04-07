const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { StatusCodes } = require("http-status-codes");
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

  const currentUser = await db.Users.findByPk(decoded.id, {
    attributes: {
      include: ["isSuspended"],
    },
  });

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

  if (currentUser.isSuspended)
    return next(
      new AppError(
        "User is suspended, please contact the support to active your account.",
        StatusCodes.UNAUTHORIZED
      )
    );

  if (
    currentUser.student &&
    new Date(currentUser.student.subscribedTill) < new Date(Date.now())
  )
    return next(
      new AppError(
        "Student must be subscribe first to access the application.",
        StatusCodes.UNAUTHORIZED
      )
    );

  req.user = {
    id: currentUser.id,
    role: currentUser.role,
    name: currentUser.name,
    studentId: currentUser.student?.id,
    departmentId: currentUser.student?.department?.id,
    schoolYearId: currentUser.student?.schoolYear?.id,
  };
  next();
});

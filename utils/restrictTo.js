const ApiError = require("./appError");
const { StatusCodes } = require("http-status-codes");

module.exports = (...roles) => {
  return (req, res, next) => {
    const isHasPermission = roles.includes(req.user.role);
    if (!isHasPermission)
      return next(
        new ApiError(
          `You don't has permission for this action.`,
          StatusCodes.FORBIDDEN
        )
      );
    next();
  };
};

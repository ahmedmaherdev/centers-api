const SocketError = require("./socketError");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const db = require("../../models");

module.exports = (io) => {
  return async (socket, next) => {
    try {
      let { auth: token } = socket.handshake.query;
      if (!token)
        return next(
          new SocketError(
            "You are not logged in! Please log in to get access.",
            StatusCodes.UNAUTHORIZED
          )
        );

      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      const currentUser = await db.Users.findByPk(decoded.id, {
        attributes: {
          include: ["isSuspended", "email"],
        },
      });

      if (!currentUser)
        return next(
          new SocketError(
            "The user belonging to this token does no longer exist.",
            StatusCodes.UNAUTHORIZED
          )
        );

      if (currentUser.isPasswordChangedAfter(decoded.iat))
        return next(
          new SocketError(
            "User recently changed the password! Please log in again.",
            StatusCodes.UNAUTHORIZED
          )
        );

      if (currentUser.isSuspended)
        return next(
          new SocketError(
            "User is suspended, please contact the support to active your account.",
            StatusCodes.UNAUTHORIZED
          )
        );

      if (
        currentUser.student &&
        new Date(currentUser.student.subscribedTill) < new Date(Date.now())
      )
        return next(
          new SocketError(
            "Student must be subscribe first to access the application.",
            StatusCodes.UNAUTHORIZED
          )
        );

      socket.user = {
        id: currentUser.id,
        role: currentUser.role,
        name: currentUser.name,
        photo: currentUser.photo,
      };

      next();
    } catch (error) {
      console.log(error);
      next(
        new SocketError(
          "Somthing went wrong",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  };
};

const catchAsync = require("../utils/catchAsync");
const AppError = require("../errors/AppError");
const Token = require("../services/Token");
const { StatusCodes } = require("http-status-codes");
const Sender = require("../services/Sender");
const Email = require("../services/Email");
const crypto = require("crypto");
const db = require("../models");
const { Op } = require("sequelize");
const stringToNumber = require("../utils/stringToNumber");
const authValidator = require("../validators/authValidator");
const validate = require("../utils/validate");
const Logger = require("../services/Logger");
const authLogger = new Logger("auth");

exports.loginAsParent = catchAsync(async (req, res, next) => {
  const { parentPhone, code } = req.body;

  const errorMessage = validate(req, authValidator.loginAsParent);
  if (errorMessage) {
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${errorMessage}`
    );
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }

  const student = await db.Students.findOne({
    where: {
      code,
      parentPhone,
    },
  });

  if (!student) {
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | incorrect parent phone number or code.`
    );
    return next(
      new AppError(
        "Incorrect parent phone number or code.",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  const user = await db.Users.findOne({ where: { studentId: student.id } });
  authLogger.info(
    req.ip,
    `${req.method} ${req.originalUrl} | ${user.name}'s parent login.`
  );
  Token.sendUser(res, StatusCodes.CREATED, user);
});

exports.signup = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    password,
    parentPhone,
    gender,
    schoolYearId,
    departmentId,
  } = req.body;

  const errorMessage = validate(req, authValidator.signup);
  if (errorMessage) {
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${errorMessage}`
    );
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }

  let user = await db.Users.create(
    {
      name,
      email,
      phone,
      password,
      student: {
        parentPhone,
        gender,
        schoolYearId,
        departmentId,
      },
    },
    {
      include: "student",
    }
  );

  user.student.code = stringToNumber(user.email);
  await user.student.save();

  user = await db.Users.findByPk(user.id, {
    attributes: {
      include: ["email", "phone"],
    },
  });

  authLogger.info(
    req.ip,
    `${req.method} ${req.originalUrl} | ${
      user.name
    } signup with data: ${JSON.stringify({ id: user.id, name, email, phone })}.`
  );
  Token.sendUser(res, StatusCodes.CREATED, user);
});

exports.login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  const errorMessage = validate(req, authValidator.login);
  if (errorMessage) {
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }

  const user = await db.Users.findOne({
    where: {
      email,
    },
    attributes: {
      include: ["email", "password", "isSuspended", "phone"],
    },
  });
  if (!user || !(await user.correctPassword(user.password, password))) {
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | Incorrect email or password.`
    );
    return next(
      new AppError("Incorrect email or password.", StatusCodes.BAD_REQUEST)
    );
  }

  if (user.isSuspended) {
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.UNAUTHORIZED} | User is suspended, please contact the support to active your account.`
    );
    return next(
      new AppError(
        "User is suspended, please contact the support to active your account.",
        StatusCodes.UNAUTHORIZED
      )
    );
  }

  if (
    user.student &&
    new Date(user.student.subscribedTill) < new Date(Date.now())
  ) {
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.UNAUTHORIZED} | Student must be subscribe first to access the application.`
    );
    return next(
      new AppError(
        "Student must be subscribe first to access the application.",
        StatusCodes.UNAUTHORIZED
      )
    );
  }
  authLogger.info(
    req.ip,
    `${req.method} ${req.originalUrl} | ${user.role} ${user.name} login.`
  );
  Token.sendUser(res, StatusCodes.OK, user);
});

exports.logout = catchAsync((req, res, next) => {
  Sender.send(res.clearCookie("jwt"), StatusCodes.OK, undefined, {
    message: "You logged out successfully.",
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const errorMessage = validate(req, authValidator.forgetPassword);
  if (errorMessage) {
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${errorMessage}`
    );
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }

  const user = await db.Users.findOne({
    where: { email },
    attributes: {
      include: ["email"],
    },
  });
  if (!user) {
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | There is no user with this email.`
    );
    return next(
      new AppError("There is no user with this email.", StatusCodes.BAD_REQUEST)
    );
  }

  const resetToken = user.createPasswordResetToken();

  await user.save();

  try {
    const URL = `http://${req.hostname}:${process.env.PORT}/reset-password?token=${resetToken}`;

    await new Email(user, URL).sendPasswordReset();
    authLogger.info(
      req.ip,
      `${req.method} ${
        req.originalUrl
      } | ${URL} is sent to user: ${JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
      })}`
    );
    Sender.send(res, StatusCodes.OK, undefined, {
      message: "Token is sent to your email.",
    });
  } catch (error) {
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    console.log(error);
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.INTERNAL_SERVER_ERROR} | There was an error sending the email. Try again later`
    );
    return next(
      new AppError(
        "There was an error sending the email. Try again later",
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await db.Users.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | Token is invalid or has expired.`
    );
    return next(
      new AppError("Token is invalid or has expired", StatusCodes.BAD_REQUEST)
    );
  }

  const errorMessage = validate(req, authValidator.resetPassword);
  if (errorMessage) {
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${errorMessage}`
    );
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  authLogger.info(
    req.ip,
    `${req.method} ${req.originalUrl} | ${user.role} ${user.name} reset his password successfully.`
  );
  Token.sendUser(res, StatusCodes.OK, user);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, newPassword } = req.body;

  const errorMessage = validate(req, authValidator.updatePassword);
  if (errorMessage) {
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${errorMessage}`
    );
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }

  const user = await db.Users.findByPk(req.user.id, {
    attributes: {
      include: ["email", "phone", "password"],
    },
  });
  const isPasswordCorrect = await user.correctPassword(user.password, password);

  if (!isPasswordCorrect) {
    authLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | The old password is incorrect.`
    );
    return next(
      new AppError("The old password is incorrect.", StatusCodes.BAD_REQUEST)
    );
  }

  user.password = newPassword;
  await user.save();
  authLogger.info(
    req.ip,
    `${req.method} ${req.originalUrl} | ${user.role} ${user.name} update his password successfully.`
  );
  Token.sendUser(res, StatusCodes.OK, user);
});

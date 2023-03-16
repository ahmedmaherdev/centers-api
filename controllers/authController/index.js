const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const Token = require("./Token");
const { StatusCodes } = require("http-status-codes");
const Sender = require("../../utils/Sender");
const Email = require("../../utils/email");
const crypto = require("crypto");
const db = require("../../models");
const { Op } = require("sequelize");
const stringToNumber = require("../../utils/stringToNumber");
const authValidator = require("../../validators/authValidator");

exports.loginAsParent = catchAsync(async (req, res, next) => {
  const { parentPhone, code } = req.body;

  const result = authValidator.loginAsParent.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }

  const student = await db.Students.findOne({
    where: {
      code,
      parentPhone,
    },
  });

  if (!student)
    return next(
      new AppError(
        "Incorrect parent phone number or code.",
        StatusCodes.BAD_REQUEST
      )
    );

  const user = await db.Users.findOne({ where: { studentId: student.id } });

  Token.sendUser(res, StatusCodes.CREATED, user);
});

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, parentPhone, gender, schoolYearId } =
    req.body;

  const result = authValidator.signup.validate(req.body);

  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }

  const user = await db.Users.create(
    {
      name,
      email,
      phone,
      password,
      student: {
        parentPhone,
        gender,
        schoolYearId,
      },
    },
    {
      include: "student",
    }
  );

  await db.Students.update(
    { code: stringToNumber(user.email) },
    { where: { id: user.studentId } }
  );

  Token.sendUser(res, StatusCodes.CREATED, user);
});

exports.login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  const result = authValidator.login.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }

  const user = await db.Users.findOne({
    where: {
      email,
    },
    attributes: {
      include: ["password"],
    },
  });
  if (!user || !(await user.correctPassword(user.password, password)))
    return next(
      new AppError("Incorrect email or password.", StatusCodes.BAD_REQUEST)
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
  const result = authValidator.forgetPassword.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }

  const user = await db.Users.findOne({ where: { email } });
  if (!user)
    return next(
      new AppError("There is no user with this email.", StatusCodes.BAD_REQUEST)
    );

  const resetToken = user.createPasswordResetToken();

  await user.save();

  try {
    const URL = `http://${req.hostname}/reset-password?token=${resetToken}`;
    console.log(URL);
    await new Email(user, URL).sendPasswordReset();

    Sender.send(res, StatusCodes.OK, undefined, {
      message: "Token is sent to your email.",
    });
  } catch (error) {
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    console.log(error);
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

  if (!user)
    return next(
      new AppError("Token is invalid or has expired", StatusCodes.BAD_REQUEST)
    );

  const result = authValidator.resetPassword.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  Token.sendUser(res, StatusCodes.OK, user);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, newPassword } = req.body;

  const result = authValidator.updatePassword.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }

  const user = await db.Users.findByPk(req.user.id, {
    attributes: {
      include: ["password"],
    },
  });
  const isPasswordCorrect = await user.correctPassword(user.password, password);

  if (!isPasswordCorrect)
    return next(
      new AppError("The old password is incorrect.", StatusCodes.BAD_REQUEST)
    );

  user.password = newPassword;
  await user.save();

  Token.sendUser(res, StatusCodes.OK, user);
});

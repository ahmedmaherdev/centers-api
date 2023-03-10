const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const Token = require("./Token");
const { StatusCodes } = require("http-status-codes");
const Sender = require("../../utils/Sender");
const Email = require("../../utils/email");
const crypto = require("crypto");
const db = require("../../models");
const { Op } = require("sequelize");

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm)
    return next(new AppError("Two passwords are not the same."));

  const user = await db.Users.create({
    name,
    email,
    phone,
    password,
    passwordConfirm,
  });
  Token.sendUser(res, StatusCodes.CREATED, user);
});

exports.login = catchAsync(async (req, res, next) => {
  const { password, phone } = req.body;

  if (!phone || !password)
    return next(
      new AppError(
        "Please, provide phone number or password",
        StatusCodes.BAD_REQUEST
      )
    );

  const user = await db.Users.findOne({
    where: {
      phone,
    },
  });

  if (!user || !(await user.correctPassword(user.password, password)))
    return next(
      new AppError(
        "Incorrect phone number or password.",
        StatusCodes.BAD_REQUEST
      )
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
  const user = await db.Users.findOne({ where: { email } });
  if (!user)
    return next(
      new AppError("There is no user with this email.", StatusCodes.BAD_REQUEST)
    );

  const resetToken = user.createPasswordResetToken();

  await user.save();

  try {
    const URL = `http://${req.hostname}/reset-password?token=${resetToken}`;
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
  const { password, passwordConfirm } = req.body;
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

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  if (password !== passwordConfirm)
    return next(
      new AppError("Two passwords are not the same.", StatusCodes.BAD_REQUEST)
    );

  await user.save();

  Token.sendUser(res, StatusCodes.OK, user);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, newPassword, newPasswordConfirm } = req.body;
  const user = await db.Users.findByPk(req.user.id);
  const isPasswordCorrect = await user.correctPassword(user.password, password);

  if (!isPasswordCorrect)
    return next(
      new AppError("The old password is incorrect.", StatusCodes.BAD_REQUEST)
    );

  user.password = newPassword;

  if (user.password !== newPasswordConfirm)
    return next(
      new AppError("Two passwords are not the same.", StatusCodes.BAD_REQUEST)
    );

  await user.save();

  Token.sendUser(res, StatusCodes.OK, user);
});

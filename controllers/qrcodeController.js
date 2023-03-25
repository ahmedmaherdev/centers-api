const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const qrCodeGenerator = require("../utils/qrCodeGenerator");
const Token = require("./authController/Token");

exports.qrcodeStudent = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const token = Token.sign({ id }, "24h");
  const qr = await qrCodeGenerator(token);
  console.log(req.user.name, token);
  res.status(StatusCodes.OK).send(qr);
});

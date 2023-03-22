const catchAsync = require("../utils/catchAsync");
const Sender = require("../utils/Sender");
const { StatusCodes } = require("http-status-codes");
const cloudinary = require("../utils/cloudinary");

const generateSignature = async (folder) => {
  const { signature, timestamp } = await cloudinary.createImageUpload(folder);
  return `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/auto/upload?api_key=${process.env.API_KEY}&timestamp=${timestamp}&signature=${signature}`;
};

exports.generateUserSignature = catchAsync(async (req, res, next) => {
  const URL = await generateSignature("userPhotos");
  Sender.send(res, StatusCodes.OK, undefined, {
    url: URL,
  });
});

exports.generateTeacherSignature = catchAsync(async (req, res, next) => {
  const URL = await generateSignature("teacherPhotos");
  Sender.send(res, StatusCodes.OK, undefined, {
    url: URL,
  });
});

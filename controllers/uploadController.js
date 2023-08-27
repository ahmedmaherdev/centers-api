const catchAsync = require("../utils/catchAsync");
const Sender = require("../services/Sender");
const { StatusCodes } = require("http-status-codes");
const cloudinary = require("../utils/cloudinary");

const generateSignature = async (folder) => {
  const { signature, timestamp } = await cloudinary.createImageUpload(folder);
  return `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/auto/upload?api_key=${process.env.API_KEY}&timestamp=${timestamp}&signature=${signature}`;
};

exports.generateUserSignature = catchAsync(async (req, res, next) => {
  const folder = "userPhotos";
  const URL = await generateSignature(folder);
  Sender.send(res, StatusCodes.OK, undefined, {
    url: URL,
    folder,
  });
});

exports.generateTeacherSignature = catchAsync(async (req, res, next) => {
  const folder = "teacherPhotos";
  const URL = await generateSignature(folder);
  Sender.send(res, StatusCodes.OK, undefined, {
    url: URL,
    folder,
  });
});

exports.generateExamSignature = catchAsync(async (req, res, next) => {
  const folder = "examPhotos";
  const URL = await generateSignature(folder);
  Sender.send(res, StatusCodes.OK, undefined, {
    url: URL,
    folder,
  });
});

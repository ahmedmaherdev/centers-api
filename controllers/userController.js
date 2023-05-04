const db = require("../models");
const factoryHandler = require("./factoryHandler");
const cloudinary = require("../utils/cloudinary");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const userValidator = require("../validators/userValidator");
const stringToNumber = require("../utils/stringToNumber");

exports.getAllUsers = factoryHandler.getAll(db.Users);

exports.getUser = factoryHandler.getOne(db.Users);

exports.createUserMiddleware = (req, res, next) => {
  const { name, email, phone, role, password } = req.body;
  const result = userValidator.createUser.validate(req.body);
  if (result.error)
    return next(
      new AppError(result.error.details[0].message),
      StatusCodes.BAD_REQUEST
    );
  req.body = { name, email, phone, role, password };
  next();
};
exports.createUser = factoryHandler.createOne(db.Users);

exports.updateUserMiddleware = (req, res, next) => {
  const { name, email, phone, role } = req.body;
  const result = userValidator.updateUser.validate(req.body);
  if (result.error)
    return next(
      new AppError(result.error.details[0].message),
      StatusCodes.BAD_REQUEST
    );

  req.body = { name, email, phone, role };
  next();
};
exports.updateUser = factoryHandler.updateOne(db.Users);

exports.deleteUser = factoryHandler.deleteOne(db.Users);

exports.searchUser = factoryHandler.search(db.Users);

exports.getMeMiddleware = (req, res, next) => {
  req.params.id = req.user.id;
  req.includedObj = {
    attributes: {
      include: ["email", "phone"],
    },
  };
  next();
};

exports.getMe = factoryHandler.getOne(db.Users);

exports.updateMeMiddleware = async (req, res, next) => {
  const { name, email, phone } = req.body;
  const result = userValidator.updateMe.validate(req.body);

  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }

  req.params.id = req.user.id;
  req.body = {
    name,
    email,
    phone,
  };

  next();
};

exports.updateMe = factoryHandler.updateOne(db.Users);

exports.deleteMeMiddleware = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = factoryHandler.deleteOne(db.Users);

exports.updateMyPhotoMiddleware = async (req, res, next) => {
  const { publicId } = req.body;
  req.params.id = req.user.id;

  try {
    await cloudinary.api.resource(publicId, {
      resource_type: "image",
    });

    req.body = {
      photo: publicId,
    };

    next();
  } catch (error) {
    return next(new AppError("Invalid public id.", StatusCodes.BAD_REQUEST));
  }
};

exports.updateMyPhoto = factoryHandler.updateOne(db.Users);

exports.updateMeAsStudentMiddleware = async (req, res, next) => {
  const { parentPhone, gender, schoolYearId, departmentId } = req.body;
  const result = userValidator.updateMe.validate(req.body);

  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  let code = stringToNumber(req.user.email);
  req.params.id = req.user.studentId;
  req.body = {
    parentPhone,
    gender,
    schoolYearId,
    departmentId,
    code,
  };

  next();
};

exports.updateMeAsStudent = factoryHandler.updateOne(db.Students);

exports.addMydeviceTokenMiddleware = (req, res, next) => {
  const { id: userId } = req.user;
  const { deviceToken } = req.body;

  req.body = {
    userId,
    deviceToken,
  };
  next();
};
exports.addMydeviceToken = factoryHandler.createOne(db.UserDeviceTokens);

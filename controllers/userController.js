const db = require("../models");
const factoryHandler = require("./factoryHandler");
const cloudinary = require("../utils/cloudinary");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const { userValidator } = require("../validators/userValidator");

exports.getAllUsers = factoryHandler.getAll(db.Users);

exports.getUser = factoryHandler.getOne(db.Users);

exports.createUserMiddleware = (req, res, next) => {
  const { name, email, phone, role, password } = req.body;
  const result = userValidator.validate(req.body);
  if (result.error)
    return next(
      new AppError(result.error.details[0].message),
      StatusCodes.BAD_REQUEST
    );
  req.body = { name, email, phone, role, password };
  next();
};
exports.createUser = factoryHandler.createOne(db.Users);

exports.updateUser = factoryHandler.updateOne(db.Users);

exports.deleteUser = factoryHandler.deleteOne(db.Users);

exports.searchUser = factoryHandler.search(db.Users);

exports.getMeMiddleware = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getMe = factoryHandler.getOne(db.Users);

exports.updateMeMiddleware = async (req, res, next) => {
  const { name, email, phone } = req.body;

  req.params.id = req.user.id;
  req.body = {
    name: name ?? undefined,
    email: email ?? undefined,
    phone: phone ?? undefined,
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
  const { publicid: publicId } = req.body;
  req.params.id = req.user.id;

  try {
    const data = await cloudinary.api.resource(publicId, {
      resource_type: "image",
    });

    req.body = {
      photo: data.publicid,
    };

    next();
  } catch (error) {
    return next(new AppError("Invalid public id.", StatusCodes.BAD_REQUEST));
  }
};

exports.updateMyPhoto = factoryHandler.updateOne(db.User);

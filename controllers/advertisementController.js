const db = require("../models");
const factoryHandler = require("./factoryHandler");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const advertisementValidator = require("../validators/advertisementValidator");

exports.getAllAdvertisements = factoryHandler.getAll(db.Advertisements);

exports.getAdvertisement = factoryHandler.getOne(db.Advertisements);

exports.createAdvertisementMiddleware = (req, res, next) => {
  const result = advertisementValidator.createAdvertisement.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};
exports.createAdvertisement = factoryHandler.createOne(db.Advertisements);

exports.updateAdvertisementMiddleware = (req, res, next) => {
  const result = advertisementValidator.updateAdvertisement.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};
exports.updateAdvertisement = factoryHandler.updateOne(db.Advertisements);

exports.deleteAdvertisement = factoryHandler.deleteOne(db.Advertisements);

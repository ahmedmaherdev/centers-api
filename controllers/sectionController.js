const db = require("../models");
const factoryHandler = require("./factoryHandler");
const sectionValidator = require("../validators/sectionValidator");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const Sender = require("../utils/Sender");

exports.getAllSections = factoryHandler.getAll(db.Sections);

exports.getSection = factoryHandler.getOne(db.Sections);

exports.createSectionMiddleware = (req, res, next) => {
  const result = sectionValidator.createSection.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};
exports.createSection = factoryHandler.createOne(db.Sections);

exports.updateSectionMiddleware = (req, res, next) => {
  const result = sectionValidator.updateSection.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};

exports.updateSection = factoryHandler.updateOne(db.Sections);

exports.deleteSection = factoryHandler.deleteOne(db.Sections);

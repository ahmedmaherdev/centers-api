const db = require("../models");
const factoryHandler = require("./factoryHandler");
const centerValidator = require("../validators/centerValidator");
const validate = require("../utils/validate");
const Logger = require("../services/Logger");
const AppError = require("../errors/AppError");
const { StatusCodes } = require("http-status-codes");
const centerLogger = new Logger("center");

exports.getCenterMiddleware = (req, res, next) => {
  req.params.id = 1;
  next();
};

exports.getCenter = factoryHandler.getOne(db.Centers, centerLogger);

exports.updateCenterMiddleware = async (req, res, next) => {
  const errorMessage = validate(req, centerValidator.updateCenter);
  if (errorMessage) {
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }
  req.params.id = 1;
  next();
};
exports.updateCenter = factoryHandler.updateOne(db.Centers, centerLogger);

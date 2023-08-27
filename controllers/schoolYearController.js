const db = require("../models");
const factoryHandler = require("./factoryHandler");
const schoolYearValidator = require("../validators/schoolYearValidator");
const Logger = require("../services/Logger");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../errors/AppError");
const schoolYearLogger = new Logger("schoolYear");
exports.getAllSchoolYears = factoryHandler.getAll(
  db.SchoolYears,
  schoolYearLogger
);

exports.getSchoolYear = factoryHandler.getOne(db.SchoolYears, schoolYearLogger);

exports.createAndUpdateSchoolYearMiddleware = (req, res, next) => {
  const result = schoolYearValidator.createSchoolYear.validate(req.body);
  if (result.error) {
    schoolYearLogger.error(
      req.ip,
      `STATUS: ${StatusCodes.BAD_REQUEST} , msg: ${result.error.details[0].message}`
    );
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};
exports.createSchoolYear = factoryHandler.createOne(
  db.SchoolYears,
  schoolYearLogger
);

exports.updateSchoolYear = factoryHandler.updateOne(
  db.SchoolYears,
  schoolYearLogger
);

exports.deleteSchoolYear = factoryHandler.deleteOne(
  db.SchoolYears,
  schoolYearLogger
);

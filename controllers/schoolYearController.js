const db = require("../models");
const factoryHandler = require("./factoryHandler");
const schoolYearValidator = require("../validators/schoolYearValidator");

exports.getAllSchoolYears = factoryHandler.getAll(db.SchoolYears);

exports.getSchoolYear = factoryHandler.getOne(db.SchoolYears);

exports.createAndUpdateSchoolYearMiddleware = (req, res, next) => {
  const result = schoolYearValidator.createSchoolYear.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};
exports.createSchoolYear = factoryHandler.createOne(db.SchoolYears);

exports.updateSchoolYear = factoryHandler.updateOne(db.SchoolYears);

exports.deleteSchoolYear = factoryHandler.deleteOne(db.SchoolYears);

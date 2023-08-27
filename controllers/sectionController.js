const db = require("../models");
const factoryHandler = require("./factoryHandler");
const sectionValidator = require("../validators/sectionValidator");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../errors/AppError");
const { StatusCodes } = require("http-status-codes");
const Sender = require("../services/Sender");
const { Op, literal } = require("sequelize");

exports.getAllSectionsMiddleware = async (req, res, next) => {
  const { departmentId, schoolYearId } = req.query;

  if (departmentId) {
    // addaitional filter obj
    req.filterObj = {
      subjectId: {
        [Op.in]: literal(
          `(SELECT subjectId FROM SubjectDepartments WHERE departmentId = ${departmentId})`
        ),
      },
    };

    delete req.query.departmentId;
  }

  if (schoolYearId) {
    // addaitional filter obj
    req.filterObj = {
      subjectId: {
        [Op.in]: literal(
          `(SELECT id FROM Subjects WHERE schoolYearId = ${schoolYearId})`
        ),
      },
    };

    delete req.query.schoolYearId;
  }
  next();
};
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

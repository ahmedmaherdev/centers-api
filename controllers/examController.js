const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const factoryHandler = require("./factoryHandler");
const AppError = require("../utils/appError");
const { Op, literal } = require("sequelize");
const examValidator = require("../validators/examValidator");
const validate = require("../utils/validate");

exports.getAllExamsMiddleware = (req, res, next) => {
  const { role: userRole, id: userId } = req.user;
  if (userRole === "student") {
    req.filterObj = {
      subjectId: {
        [Op.in]: literal(
          `(SELECT subjectId FROM StudentSubjects WHERE studentId = ${userId})`
        ),
      },
    };
  }
  next();
};

exports.getAllExams = factoryHandler.getAll(db.Exams);

exports.getExam = factoryHandler.getOne(db.Exams);

exports.createExamMiddleware = (req, res, next) => {
  const errorMessage = validate(req, examValidator.createExam);
  if (errorMessage) {
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }

  req.body.createdById = req.user.id;
  next();
};
exports.createExam = factoryHandler.createOne(db.Exams);

exports.updateExamMiddleware = (req, res, next) => {
  const errorMessage = validate(req, examValidator.updateExam);
  if (errorMessage) {
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }
  next();
};
exports.updateExam = factoryHandler.updateOne(db.Exams);

exports.deleteExam = factoryHandler.deleteOne(db.Exams);

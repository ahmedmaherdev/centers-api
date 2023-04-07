const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const factoryHandler = require("./factoryHandler");
const AppError = require("../utils/appError");
const { Op, literal } = require("sequelize");
const examValidator = require("../validators/examValidator");
const validate = require("../utils/validate");
const catchAsync = require("../utils/catchAsync");

exports.getAllExamsMiddleware = (req, res, next) => {
  const { role: userRole, id: userId } = req.user;
  if (userRole === "student") {
    req.filterObj = {
      departmentId: req.user.departmentId,
      id: {
        [Op.notIn]: literal(
          `(SELECT examId FROM ${db.Grades.tableName} WHERE studentId = ${userId})`
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

exports.checkExamMiddleware = catchAsync(async (req, res, next) => {
  const { examId } = req.params;
  const exam = await db.Exams.findByPk(examId);
  if (!exam)
    return next(
      new AppError(`No exam with this id: ${examId}`, StatusCodes.NOT_FOUND)
    );

  req.exam = exam;
  next();
});

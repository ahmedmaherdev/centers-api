const db = require("../models");
const factoryHandler = require("./factoryHandler");
const examValidator = require("../validators/examValidator");
const { Op, literal } = require("sequelize");

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
  const result = examValidator.createExam.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }

  req.body.createdById = req.user.id;
  next();
};
exports.createExam = factoryHandler.createOne(db.Exams);

exports.updateExamMiddleware = (req, res, next) => {
  const result = examValidator.updateExam.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};
exports.updateExam = factoryHandler.updateOne(db.Exams);

exports.deleteExam = factoryHandler.deleteOne(db.Exams);

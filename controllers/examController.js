const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const factoryHandler = require("./factoryHandler");
const AppError = require("../utils/appError");
const { Op, literal } = require("sequelize");
const examValidator = require("../validators/examValidator");
const validate = require("../utils/validate");
const catchAsync = require("../utils/catchAsync");
const Notification = require("../utils/notification");
const Logger = require("../utils/Logger");
const examLogger = new Logger("exam");

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

exports.getAllExams = factoryHandler.getAll(db.Exams, examLogger);

exports.getExam = factoryHandler.getOne(db.Exams, examLogger);

exports.createExamMiddleware = (req, res, next) => {
  const errorMessage = validate(req, examValidator.createExam);
  if (errorMessage) {
    examLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${errorMessage}`
    );
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }

  req.body.createdById = req.user.id;
  req.isHasNotification = true;
  next();
};
exports.createExam = factoryHandler.createOne(db.Exams, examLogger);

exports.createExamNotification = async (req, res, next) => {
  try {
    // notification here
    const { id, name, departmentId } = req.createdData;
    const type = "exam";
    const examNotification = new Notification([], {
      type,
      id,
      name,
    });

    // find all students that department belongs to department of exam
    let studentsDeviceTokens = await db.UserDeviceTokens.findAll({
      include: {
        as: "user",
        model: db.Users,
        where: { role: "student" },
        include: {
          as: "student",
          model: db.Students,
          where: { departmentId },
        },
      },
    });

    studentsDeviceTokens = studentsDeviceTokens.map((stud) => stud.deviceToken);

    if (studentsDeviceTokens.length > 0) {
      examNotification.deviceTokens = studentsDeviceTokens;
      const res = await examNotification.send();
      examLogger.info(req.ip, `exam notification sent: ${JSON.stringify(res)}`);
    }
  } catch (error) {
    examLogger.error(req.ip, `exam notification failed: ${error.message}`);
  }
};

exports.updateExamMiddleware = (req, res, next) => {
  const errorMessage = validate(req, examValidator.updateExam);
  if (errorMessage) {
    examLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${errorMessage}`
    );
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }
  next();
};
exports.updateExam = factoryHandler.updateOne(db.Exams, examLogger);

exports.deleteExam = factoryHandler.deleteOne(db.Exams, examLogger);

exports.checkExamMiddleware = catchAsync(async (req, res, next) => {
  const { examId } = req.params;
  const exam = await db.Exams.findByPk(examId);
  if (!exam) {
    examLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.NOT_FOUND} | No exam with this id: ${examId}`
    );
    return next(
      new AppError(`No exam with this id: ${examId}`, StatusCodes.NOT_FOUND)
    );
  }

  req.exam = exam;
  next();
});

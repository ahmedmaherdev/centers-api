const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factoryHandler = require("./factoryHandler");
const Sender = require("../utils/Sender");
const validate = require("../utils/validate");
const questionValidator = require("../validators/questionValidator");

exports.getAllQuestions = catchAsync(async (req, res, next) => {
  const { id: examId } = req.exam;

  const questions = await db.Questions.findAll({
    where: {
      examId,
    },
    sort: ["id"],
  });

  Sender.send(
    res,
    StatusCodes.OK,
    { questions },
    {
      questions: questions.length,
    }
  );
});

exports.getQuestion = factoryHandler.getOne(db.Questions);

exports.createQuestionMiddleware = async (req, res, next) => {
  const { id: examId } = req.exam;

  const errorMessage = validate(req, questionValidator.createQuestion);
  if (errorMessage) {
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }
  req.body.createdById = req.user.id;
  req.body.examId = examId;

  next();
};
exports.createQuestion = factoryHandler.createOne(db.Questions);

exports.updateQuestionMiddleware = async (req, res, next) => {
  const errorMessage = validate(req, questionValidator.updateQuestion);
  if (errorMessage) {
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }
  next();
};
exports.updateQuestion = factoryHandler.updateOne(db.Questions);

exports.deleteQuestion = factoryHandler.deleteOne(db.Questions);

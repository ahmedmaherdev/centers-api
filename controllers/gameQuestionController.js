const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factoryHandler = require("./factoryHandler");
const Sender = require("../utils/Sender");
const validate = require("../utils/validate");
const questionValidator = require("../validators/gameQuestionValidator");

exports.getAllGameQuestions = catchAsync(async (req, res, next) => {
  const { id: gameId } = req.exam;

  const gameQuestions = await db.GameQuestions.findAll({
    where: {
      gameId,
    },
    sort: ["id"],
  });

  Sender.send(
    res,
    StatusCodes.OK,
    { questions: gameQuestions },
    {
      count: gameQuestions.length,
    }
  );
});

exports.getQuestion = factoryHandler.getOne(db.GameQuestions);

exports.createQuestionMiddleware = async (req, res, next) => {
  const { id: gameId, department } = req.game;

  const errorMessage = validate(req, questionValidator.createGameQuestion);
  if (errorMessage) {
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }

  try {
    const subject = await db.SubjectDepartments.findOne({
      where: {
        subjectId: req.body.subjectId,
        departmentId: department.id,
      },
    });

    if (!subject)
      return next(
        new AppError(
          "This subject do not belongs to game department.",
          StatusCodes.BAD_REQUEST
        )
      );

    req.body.createdById = req.user.id;
    req.body.gameId = gameId;

    next();
  } catch (error) {
    console.log(error);
    next(
      new AppError("Can not create this question.", StatusCodes.BAD_REQUEST)
    );
  }
};
exports.createQuestion = factoryHandler.createOne(db.GameQuestions);

exports.updateQuestionMiddleware = async (req, res, next) => {
  const errorMessage = validate(req, questionValidator.updateGameQuestion);
  if (errorMessage) {
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }
  next();
};
exports.updateQuestion = factoryHandler.updateOne(db.GameQuestions);

exports.deleteQuestion = factoryHandler.deleteOne(db.GameQuestions);

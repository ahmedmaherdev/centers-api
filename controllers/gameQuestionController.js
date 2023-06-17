const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factoryHandler = require("./factoryHandler");
const Sender = require("../utils/Sender");
const validate = require("../utils/validate");
const questionValidator = require("../validators/gameQuestionValidator");

exports.getAllGameQuestions = catchAsync(async (req, res, next) => {
  const { id: gameId } = req.game;

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

exports.createGameAnswer = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;
  const { id: gameId, endedAt: gameEndedAt } = req.game;

  const errorMessage = validate(req, questionValidator.gameAnswer);
  if (errorMessage) {
    gameLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${errorMessage}`
    );
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }

  if (moment(gameEndedAt).isAfter(Date.now())) {
    gameLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | game is ended.`
    );
    return next(new AppError("Game is ended.", StatusCodes.BAD_REQUEST));
  }

  const gameStudent = await db.GameStudents.findOne({
    gameId,
    studentId: userId,
  });

  if (!gameStudent) {
    gameLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | student is not joined the game.`
    );
    return next(
      new AppError("You must join the game first.", StatusCodes.BAD_REQUEST)
    );
  }

  const gameMatch = await db.GameMatches.findByPk(req.body.matchId);

  const gameQuestion = await db.GameQuestios.findOne({
    where: {
      gameId,
      questionId: gameMatch.questionId,
      answer,
    },
  });

  // if the correct answer
  let points = 0;
  if (gameQuestion) {
    // clac the points for student (endedAt (startedAt) - now)
    const endedAt = moment(gameMatch.createdAt).add(req.game.period, "second");
    const now = moment(Date.now());
    const diff = endedAt.diff(now, "second");
    points = diff > 0 ? Math.ceil((diff / req.game.period) * 100) : 0;
  }

  await db.GameAnswers.create({
    gameId: socket.game.id,
    gameMatchId: gameMatch.id,
    answer,
    studentId: userId,
    points,
  });

  Sender.send(res, StatusCodes.CREATED, undefined, {
    message: "Answer is created Successfully.",
  });
});

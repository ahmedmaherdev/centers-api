const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const factoryHandler = require("./factoryHandler");
const AppError = require("../utils/appError");
const gameValidator = require("../validators/gameValidator");
const gameQuestionsValidator = require("../validators/gameQuestionValidator");
const validate = require("../utils/validate");
const catchAsync = require("../utils/catchAsync");
const Logger = require("../services/Logger");
const { fn, col } = require("sequelize");
const Sender = require("../services/Sender");
const gameLogger = new Logger("game");

exports.getBestTenStudents = catchAsync(async (req, res, next) => {
  if (req.query.gameId) {
    return next(
      new AppError(
        "Please , provide game id in the query string.",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  const { gameId } = req.query;
  const students = await db.GameAnswers.findAll({
    where: { gameId },
    include: {
      as: "student",
      model: db.Users,
      attributes: ["id", "name", "photo", "role"],
      include: {
        as: "student",
        model: db.Students,
        attributes: [],
      },
    },
    attributes: ["studentId", [fn("SUM", col("points")), "totalPoints"]],
    group: ["studentId"],
    order: [["totalPoints", "DESC"]],
    limit: 10,
  });

  Sender.send(
    res,
    StatusCodes.OK,
    {
      students,
    },
    {
      count: students.length,
    }
  );
});

exports.getAllGamesMiddleware = (req, res, next) => {
  const { role: userRole, id: userId } = req.user;
  if (userRole === "student") {
    req.filterObj = {
      departmentId: req.user.departmentId,
    };
  }
  next();
};

exports.getAllGames = factoryHandler.getAll(db.Games, gameLogger);

exports.getGame = factoryHandler.getOne(db.Games, gameLogger);

exports.createGameMiddleware = (req, res, next) => {
  const errorMessage = validate(req, gameValidator.createGame);
  if (errorMessage) {
    gameLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${errorMessage}`
    );
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }

  req.body.createdById = req.user.id;
  next();
};
exports.createGame = factoryHandler.createOne(db.Games, gameLogger);

exports.updateGameMiddleware = (req, res, next) => {
  const errorMessage = validate(req, gameValidator.updateGame);
  if (errorMessage) {
    gameLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${errorMessage}`
    );
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
  }
  next();
};
exports.updateGame = factoryHandler.updateOne(db.Games, gameLogger);

exports.deleteGame = factoryHandler.deleteOne(db.Games, gameLogger);

exports.checkGameMiddleware = catchAsync(async (req, res, next) => {
  const { gameId } = req.params;
  const game = await db.Games.findByPk(gameId);
  if (!game) {
    gameLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.NOT_FOUND} | No Game with this id: ${gameId}`
    );
    return next(
      new AppError(`No game with this id: ${gameId}`, StatusCodes.NOT_FOUND)
    );
  }

  req.game = game;
  next();
});

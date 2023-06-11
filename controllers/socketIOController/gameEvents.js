const { StatusCodes } = require("http-status-codes");
const SocketError = require("./socketError");
const db = require("../../models");
const { gameAnswer } = require("../../validators/gameQuestionValidator");
const moment = require("moment");

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

exports.startGame = (io, socket) => {
  return async () => {
    try {
      const { role: userRole } = socket.user;

      if (userRole !== "admin") {
        socket.emit(
          "error",
          new SocketError(
            `You do not have a permission to this action.`,
            StatusCodes.UNAUTHORIZED
          )
        );
        return;
      }

      // check if user join a game
      if (!socket.game) {
        socket.emit(
          "error",
          new SocketError("Please join a game first.", StatusCodes.BAD_REQUEST)
        );
        return;
      }

      const gameQuestions = await db.GameQuestions.findAll({
        where: { gameId: socket.game.id },
        sort: ["id"],
      });

      // send to game room gameStarted event
      io.to(socket.gameName).emit("gameStarted");
      const startedAt = moment(Date.now());

      for (let question of gameQuestions) {
        io.to(socket.gameName).emit("newQuestion", question);
        question.sendedAt = moment(Date.now());
        await question.save();
        await sleep(question.period * 1000);
      }

      io.to(socket.gameName).emit("gameEnded");
      const endedAt = moment(Date.now());

      await db.Games.update(
        { startedAt, endedAt },
        { where: { id: socket.game.id } }
      );
    } catch (error) {
      console.log(error);
      socket.emit(
        "error",
        new SocketError(
          "Can not join this game, try again later.",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  };
};

exports.joinGame = (io, socket) => {
  return async (gameId) => {
    try {
      const { role: userRole, id: userId } = socket.user;
      const game = await db.Games.findByPk(gameId);

      if (!game) {
        socket.emit(
          "error",
          new SocketError(
            `No game with this id: ${gameId}`,
            StatusCodes.NOT_FOUND
          )
        );
        return;
      }

      socket.gameName = `game-${game.id}`;
      socket.join(socket.gameName); // room name is 'game-{gameId}'

      if (userRole === "student") {
        game.studentsCount++;
        await db.GameStudents.create({
          gameId,
          studentId: userId,
        });
        await game.save();
        io.to(socket.gameName).emit("studentJoined", socket.user);
      }

      socket.emit("joinGameSuccess", game);

      socket.game = {
        id: game.id,
        name: game.name,
        questionsCount: game.questionsCount,
        studentsCount: game.studentsCount,
        period: game.period,
      };
    } catch (error) {
      console.log(error);
      socket.emit(
        "error",
        new SocketError(
          "Can not join this game, try again later.",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  };
};

exports.sendGameAnswer = (io, socket) => {
  return async ({ questionId, answer }) => {
    const { role: userRole, id: userId } = socket.user;
    // check if user join a game
    if (!socket.game) {
      socket.emit(
        "error",
        new SocketError("Please join a game first.", StatusCodes.BAD_REQUEST)
      );
      return;
    }

    if (userRole !== "student") {
      socket.emit(
        "error",
        new SocketError(
          `You do not have a permission to this action.`,
          StatusCodes.UNAUTHORIZED
        )
      );
      return;
    }

    const result = gameAnswer.validate({ questionId, answer });
    if (result.error) {
      socket.emit(
        "error",
        new SocketError(
          `Invalid input data: ${result.error.details[0].message}`,
          StatusCodes.BAD_REQUEST
        )
      );
      return;
    }

    const gameQuestion = await db.GameQuestions.findOne({
      where: {
        gameId: socket.game.id,
        questionId,
        answer,
      },
    });

    // if the correct answer
    let points = 0;
    if (gameQuestion) {
      const game = await db.Games.findByPk(socket.game.id);
      // clac the points for student (endedAt (startedAt) - now)
      const endedAt = moment(game.startedAt).add(game.period, "second");
      const now = moment(Date.now());
      points = endedAt.diff(now, "second");
    }

    await db.GameAnswers.create({
      gameId: socket.game.id,
      questionId,
      answer,
      studentId: userId,
      points,
    });
  };
};

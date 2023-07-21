const { StatusCodes } = require("http-status-codes");
const SocketError = require("./socketError");
const db = require("../../models");
const moment = require("moment");
const gameUtils = require("./gameUtils");

const startSocketGame = async (io, socket) => {
  socket.game.startedAt = moment(Date.now());
  await socket.game.save();
  io.in(socket.gameName).emit("gameStarted");
  console.log(
    `${socket.user.role} ${socket.user.name} start the game: ${socket.gameName}`
  );
};

const endSocketGame = async (io, socket) => {
  socket.game.endedAt = moment(Date.now());
  await socket.game.save();
  io.in(socket.gameName).emit("gameEnded");
  console.log(`${socket.gameName} game is ended.`);
};

exports.joinGame = (io, socket) => {
  return async (gameId) => {
    try {
      const { role: userRole, id: userId } = socket.user;

      if (socket.game) {
        socket.emit(
          "error",
          new SocketError(`You already in a game.`, StatusCodes.BAD_REQUEST)
        );
        return;
      }

      const game = await db.Games.findByPk(gameId);
      // Game Rules
      // - can not join game is started
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

      const isGameStarted =
        game.startedAt && moment(Date.now()).isAfter(game.startedAt);

      if (isGameStarted) {
        socket.emit(
          "error",
          new SocketError(
            `This game is started and you can not join it.`,
            StatusCodes.BAD_REQUEST
          )
        );
        return;
      }
      socket.gameName = `game-${game.id}`;
      socket.join(socket.gameName); // room name is 'game-{gameId}'
      console.log(
        `${socket.user.role} ${socket.user.name} join the game: ${socket.gameName}`
      );

      if (userRole === "student") {
        await db.GameStudents.create({
          gameId,
          studentId: userId,
        });
      }
      socket.emit("joinGameSuccess", game);
      socket.game = game;
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
          new SocketError(
            "Please join the game first.",
            StatusCodes.BAD_REQUEST
          )
        );
        return;
      }

      // start the game.
      await startSocketGame(io, socket);

      // handle the game logic and get the winners when game finished
      const winners = await gameUtils.handleGame(io, socket);

      io.in(socket.gameName).emit("winners", winners);
      // end the game
      await endSocketGame(io, socket);
    } catch (error) {
      console.log(error);
      socket.emit(
        "error",
        new SocketError(
          "Can not start this game, try again later.",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  };
};

exports.leaveGame = async (io, socket) => {
  if (socket.game && socket.user.role === "student") {
    await db.GameStudents.destroy({
      where: {
        gameId: socket.game.id,
        studentId: socket.user.id,
      },
    });
    io.in(socket.gameName).emit("studentLeft", socket.user);
  }
};

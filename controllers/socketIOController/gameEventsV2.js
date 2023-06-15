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

const getRandomNumberLessThan = (num) => {
  return Math.floor(Math.random() * num);
};

const handleQuestions = async (io, socket) => {
  socket.gameRound = 1;
  io.to(socket.gameName).emit("roundStarted", socket.gameRound);

  const gameQuestions = await db.GameQuestions.findAll({
    where: { gameId: socket.game.id },
    sort: ["id"],
  });

  const gameStudents = await db.GameStudents.findAll({
    where: { gameId: socket.game.id },
    sort: ["id"],
  });

  const allGameSockets = await io.in(socket.gameName).fetchSockets();

  for (let i = 0; i < gameStudents.length - 1; i += 2) {
    const randomIndex = getRandomNumberLessThan(gameQuestions.length);
    const selectedQuestion = gameQuestions[randomIndex];
    const student1 = allGameSockets.find(
      (sock) => sock.user.id === gameStudents[i].studentId
    );
    const student2 = allGameSockets.find(
      (sock) => sock.user.id === gameStudents[i + 1].studentId
    );

    selectedQuestion.sendedAt = moment(Date.now());
    io.to(student1.id).emit("newQuestion", selectedQuestion);
    io.to(student2.id).emit("newQuestion", selectedQuestion);
  }

  await sleep(socket.game.period * 1000);
};

exports.joinGame = (io, socket) => {
  return async (gameId) => {
    try {
      const { role: userRole, id: userId } = socket.user;
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
          new SocketError("Please join a game first.", StatusCodes.BAD_REQUEST)
        );
        return;
      }

      io.to(socket.gameName).emit("gameStarted");
      socket.game.startedAt = moment(Date.now());
      await socket.game.save();

      await handleQuestions(io, socket);

      io.to(socket.gameName).emit("gameEnded");
      socket.game.endedAt = moment(Date.now());
      await socket.game.save();
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

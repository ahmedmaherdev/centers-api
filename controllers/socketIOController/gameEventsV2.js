const { StatusCodes } = require("http-status-codes");
const SocketError = require("./socketError");
const db = require("../../models");
const { gameAnswer } = require("../../validators/gameQuestionValidator");
const moment = require("moment");
const gameUtils = require("./gameUtils");

const handleGame = async (io, socket) => {
  let round = 1;

  // get all students on sockets
  let allGameSockets = await io.in(socket.gameName).fetchSockets();
  allGameSockets = allGameSockets.filter(
    (sock) => sock.user.role === "student"
  );

  let gameQuestions = await db.GameQuestions.findAll({
    where: { gameId: socket.game.id },
    sort: ["id"],
  });

  while (allGameSockets.length > 10) {
    // start the round

    let gameStudents = await db.GameStudents.findAll({
      where: { gameId: socket.game.id },
      sort: ["id"],
    });

    // randomize the questions and students order
    gameStudents = gameUtils.randomizeArray(gameStudents);

    // send questions to students
    for (let i = 0; i < gameStudents.length - 1; i += 2) {
      const randomIndex = gameUtils.getRandomNumberLessThan(
        gameQuestions.length
      );
      const selectedQuestion = gameQuestions[randomIndex];
      const studentSocket1 = allGameSockets.find(
        (sock) => sock.user.id === gameStudents[i].studentId
      );
      const studentSocket2 = allGameSockets.find(
        (sock) => sock.user.id === gameStudents[i + 1].studentId
      );

      const match = await db.gameMatches.create({
        student1Id: studentSocket1.user.id,
        student2Id: studentSocket2.user.id,
        questionId: selectedQuestion.id,
        gameId: socket.game.id,
        round,
      });

      io.to(studentSocket1.id).emit(
        "newMatch",
        selectedQuestion,
        studentSocket2.user
      );
      io.to(studentSocket2.id).emit(
        "newMatch",
        selectedQuestion,
        studentSocket1.user
      );
    }

    await gameUtils.sleep(socket.game.period * 1000);

    // filter the winners and losers
    const gameMatches = await db.GameMatches.findAll({
      where: {
        gameId: socket.game.id,
        round,
      },
    });

    for (let match of gameMatches) {
      const studentSocket1 = allGameSockets.find(
        (sock) => sock.user.id === match.student1Id
      );
      const studentSocket2 = allGameSockets.find(
        (sock) => sock.user.id === match.student2Id
      );

      const winnerAnswer = await db.GameAnswers.findOne({
        where: {
          gameMatchId: match.gameMatchId,
        },

        order: [["points", "DESC"]],
        limit: 1,
      });

      // 2 students do not answer
      if (!winnerAnswer) {
        io.to(studentSocket1.id).emit("loser");
        io.to(studentSocket2.id).emit("loser");
        studentSocket1.leave(socket.gameName);
        studentSocket2.leave(socket.gameName);
      }
    }
    round++;
  }
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

      // start the game.
      socket.game.startedAt = moment(Date.now());
      await socket.game.save();

      await handleQuestions(io, socket);

      // end the game
      socket.game.endedAt = moment(Date.now());
      await socket.game.save();
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

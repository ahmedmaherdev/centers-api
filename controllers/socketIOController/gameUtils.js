const db = require("../../models");

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const getRandomNumberLessThan = (num) => {
  return Math.floor(Math.random() * num);
};

const randomizeArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const randIndex = getRandomNumberLessThan(i + 1);
    [arr[i], arr[randIndex]] = [arr[randIndex], arr[i]];
  }
  return arr;
};

const getMatchResult = (studentSocket1, studentSocket2, winnerAnswer) => {
  if (studentSocket1 && studentSocket1.user.id === winnerAnswer.studentId) {
    return [studentSocket1, studentSocket2];
  }

  if (studentSocket2 && studentSocket2.user.id === winnerAnswer.studentId) {
    return [studentSocket2, studentSocket1];
  }

  return undefined;
};

const filterStudents = async (socket, allGameSockets) => {
  // filter the winners and losers
  const gameMatches = await db.GameMatches.findAll({
    where: {
      gameId: socket.game.id,
      round,
    },
  });

  for (let match of gameMatches) {
    const winnerAnswer = await db.GameAnswers.findOne({
      where: {
        gameMatchId: match.gameMatchId,
      },

      order: [["points", "DESC"]],
      limit: 1,
    });

    const studentSocket1 = allGameSockets.find(
      (sock) => sock.user.id === match.student1Id
    );
    const studentSocket2 = allGameSockets.find(
      (sock) => sock.user.id === match.student2Id
    );

    // 2 students do not answer
    const matchResult = getMatchResult(
      studentSocket1,
      studentSocket2,
      winnerAnswer
    );

    if (matchResult) {
      [winnerSocket, loserSocket] = matchResult;
      io.to(winnerSocket.id).emit("winner");
      io.to(loserSocket.id).emit("loser");
      loserSocket.disconnect();
    } else {
      // 2 players are wrong
      if (studentSocket1) {
        io.to(studentSocket1.id).emit("loser");
        studentSocket1.disconnect();
      }

      if (studentSocket2) {
        io.to(studentSocket2.id).emit("loser");
        studentSocket2.disconnect();
      }
    }
  }
};

const handleQuestions = async (io, socket, allGameSockets, gameQuestions) => {
  let gameStudents = await db.GameStudents.findAll({
    where: { gameId: socket.game.id },
    sort: ["id"],
  });

  // randomize the questions and students order
  gameStudents = gameUtils.randomizeArray(gameStudents);

  // send questions to students
  for (let i = 0; i < gameStudents.length - 1; i += 2) {
    const randomIndex = gameUtils.getRandomNumberLessThan(gameQuestions.length);
    const selectedQuestion = gameQuestions[randomIndex];
    const studentSocket1 = allGameSockets.find(
      (sock) => sock.user.id === gameStudents[i].studentId
    );
    const studentSocket2 = allGameSockets.find(
      (sock) => sock.user.id === gameStudents[i + 1].studentId
    );

    let match = await db.gameMatches.create({
      student1Id: studentSocket1.user.id,
      student2Id: studentSocket2.user.id,
      questionId: selectedQuestion.id,
      gameId: socket.game.id,
      round,
    });

    match = await db.GameMatches.findByPk(match.id, {
      include: [
        {
          as: "student1",
          model: db.Users,
          attributes: ["id", "name", "photo", "role"],
        },
        {
          as: "student2",
          model: db.Users,
          attributes: ["id", "name", "photo", "role"],
        },
        {
          as: "question",
          model: db.GameQuestions,
        },
      ],
    });

    io.to(studentSocket1.id).emit("newMatch", match);
    io.to(studentSocket2.id).emit("newMatch", match);
  }
};

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
    io.in(socket.gameName).emit("roundStarted", round);

    // start sending questions
    await handleQuestions(io, socket, allGameSockets, gameQuestions);

    // block the code for game question period
    await gameUtils.sleep(socket.game.period * 1000);

    // filter students
    await filterStudents(socket, allGameSockets);

    // round finished
    io.in(socket.gameName).emit("roundfinished", round);
    round++;

    // get all students on sockets
    allGameSockets = await io.in(socket.gameName).fetchSockets();
    allGameSockets = allGameSockets.filter(
      (sock) => sock.user.role === "student"
    );
  }
};

module.exports = {
  sleep,
  getRandomNumberLessThan,
  randomizeArray,
  handleGame,
};

const db = require("../../../models");
const getRandomNumberLessThan = require("../../../utils/getRandomNumberLessThan");
const randomizeArray = require("../../../utils/randomizeArray");

const getMatchResult = (studentSocket1, studentSocket2, winnerAnswer) => {
  if (!winnerAnswer) return undefined;
  if (studentSocket1 && studentSocket1.user.id === winnerAnswer.studentId) {
    return [studentSocket1, studentSocket2];
  }

  if (studentSocket2 && studentSocket2.user.id === winnerAnswer.studentId) {
    return [studentSocket2, studentSocket1];
  }

  return undefined;
};

const getGameMatchesForRound = async (socket, round) => {
  return await db.GameMatches.findAll({
    where: {
      gameId: socket.game.id,
      round,
    },
  });
};

const getWinnerAnswerForMatch = async (match) => {
  return await db.GameAnswers.findOne({
    where: {
      gameMatchId: match.id,
    },

    order: [["points", "DESC"]],
    limit: 1,
  });
};

const findStudentSocketById = (allGameSockets, studentId) => {
  return allGameSockets.find((sock) => sock.user.id === studentId);
};

const filterStudents = async (io, socket, allGameSockets, round) => {
  // filter the winners and losers
  const gameMatches = await getGameMatchesForRound(socket, round);

  for (let match of gameMatches) {
    const winnerAnswer = await getWinnerAnswerForMatch(match);

    const studentSocket1 = findStudentSocketById(
      allGameSockets,
      match.student1Id
    );
    const studentSocket2 = findStudentSocketById(
      allGameSockets,
      match.student2Id
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

      console.log(
        `${loserSocket.user.role} ${loserSocket.user.name} lose the game: ${socket.gameName}`
      );
      console.log(
        `${winnerSocket.user.role} ${winnerSocket.user.name} win the game: ${socket.gameName}`
      );
    } else {
      // 2 players are wrong
      if (studentSocket1) {
        io.to(studentSocket1.id).emit("loser");
        studentSocket1.disconnect();
        console.log(
          `${studentSocket1.user.role} ${studentSocket1.user.name} lose the game: ${socket.gameName}`
        );
      }

      if (studentSocket2) {
        io.to(studentSocket2.id).emit("loser");
        studentSocket2.disconnect();
        console.log(
          `${studentSocket2.user.role} ${studentSocket1.user.name} lose the game: ${socket.gameName}`
        );
      }
    }
  }
};

const getAllStudentSockets = async (io, socket) => {
  let allGameSockets = await io.in(socket.gameName).fetchSockets();
  return allGameSockets.filter((sock) => sock.user.role === "student");
};

const getAllGameQuestions = async (socket) => {
  return await db.GameQuestions.findAll({
    where: { gameId: socket.game.id },
    sort: ["id"],
    raw: true,
  });
};

const getMatchDetails = async (matchId) => {
  return await db.GameMatches.findByPk(matchId, {
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
};

const getGameStudents = async (gameId) => {
  return await db.GameStudents.findAll({
    where: { gameId },
    sort: ["id"],
    raw: true,
  });
};

const sendQuestionToStudents = async (
  io,
  studentSocket1,
  studentSocket2,
  matchId
) => {
  const match = await getMatchDetails(matchId);
  io.to(studentSocket1.id).emit("newMatch", match);
  io.to(studentSocket2.id).emit("newMatch", match);
};

const getWinners = (allGameSockets) => {
  return allGameSockets.map((sock) => {
    if (sock.user.role === "student") return sock.user;
  });
};

const handleQuestions = async (
  io,
  socket,
  round,
  allGameSockets,
  gameQuestions
) => {
  let gameStudents = await getGameStudents(socket.game.id);

  // randomize the questions and students order
  gameStudents = randomizeArray(gameStudents);
  // send questions to students
  for (let i = 0; i < gameStudents.length - 1; i += 2) {
    const randomIndex = getRandomNumberLessThan(gameQuestions.length);
    const selectedQuestion = gameQuestions[randomIndex];
    const studentSocket1 = findStudentSocketById(
      allGameSockets,
      gameStudents[i].studentId
    );
    const studentSocket2 = findStudentSocketById(
      allGameSockets,
      gameStudents[i + 1].studentId
    );

    let match = await db.GameMatches.create({
      student1Id: studentSocket1.user.id,
      student2Id: studentSocket2.user.id,
      gameQuestionId: selectedQuestion.id,
      gameId: socket.game.id,
      round,
    });

    await sendQuestionToStudents(io, studentSocket1, studentSocket2, match.id);
  }
};

module.exports = {
  getAllStudentSockets,
  getAllGameQuestions,
  handleQuestions,
  filterStudents,
  getWinners,
};

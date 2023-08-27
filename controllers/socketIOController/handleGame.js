const gameUtils = require("../../utils/gameUtils");
const sleep = require("../../utils/sleep");

module.exports = async (io, socket) => {
  let round = 1;

  // get all students on sockets
  let allGameSockets = await gameUtils.getAllStudentSockets(io, socket);

  let gameQuestions = await gameUtils.getAllGameQuestions(socket);

  while (allGameSockets.length > 2) {
    // start the round
    io.in(socket.gameName).emit("roundStarted", round);
    console.log(`game round: ${round} is started.`);

    // start sending questions
    await gameUtils.handleQuestions(
      io,
      socket,
      round,
      allGameSockets,
      gameQuestions
    );

    // block the code for game question period
    await sleep(socket.game.period * 1000);
    console.log(`Stop for ${socket.game.period} seconds.`);

    // filter students
    await gameUtils.filterStudents(io, socket, allGameSockets, round);

    // round finished
    io.in(socket.gameName).emit("roundEnded", round);
    console.log(`game round: ${round} is ended.`);
    round++;

    // get all students on sockets
    allGameSockets = await gameUtils.getAllStudentSockets(io, socket);
  }

  // send the winners to all users in the game
  const winners = gameUtils.getWinners(allGameSockets);
  io.in(socket.gameName).emit("winners", winners);
};

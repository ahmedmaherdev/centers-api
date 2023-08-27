const gameEvents = require("./gameEventsController");

module.exports = (io) => {
  return (socket) => {
    console.log("user connected with id: ", socket.id);

    // game events
    socket.on("joinGame", gameEvents.joinGame(io, socket));
    socket.on("startGame", gameEvents.startGame(io, socket));

    socket.on("disconnect", async () => {
      console.log("user disconnected with id: ", socket.id);
      await gameEvents.leaveGame(io, socket);
    });
  };
};

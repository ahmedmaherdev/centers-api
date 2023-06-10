const chatEvents = require("./chatEvents");
const gameEvents = require("./gameEvents");

module.exports = (io) => {
  return (socket) => {
    console.log("user connected with id: ", socket.id);

    // chat events
    socket.on("joinRoom", chatEvents.joinRoom(io, socket));
    socket.on("sendMessage", chatEvents.sendMessage(io, socket));

    // game events
    socket.on("joinGame", gameEvents.joinGame(io, socket));
    socket.on("startGame", gameEvents.startGame(io, socket));
    socket.on("sendGameAnswer", gameEvents.sendGameAnswer(io, socket));

    socket.on("disconnect", () => {
      console.log("user disconnected with id: ", socket.id);
    });
  };
};

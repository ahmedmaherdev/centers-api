const chatEvents = require("./chatEvents");
const gameEvents = require("./gameEvents");
const gameEventsV2 = require("./gameEventsV2");

module.exports = (io) => {
  return (socket) => {
    console.log("user connected with id: ", socket.id);

    // chat events
    // socket.on("joinRoom", chatEvents.joinRoom(io, socket));
    // socket.on("sendMessage", chatEvents.sendMessage(io, socket));

    // game events
    socket.on("joinGame", gameEventsV2.joinGame(io, socket));
    socket.on("startGame", gameEventsV2.startGame(io, socket));
    // socket.on("sendGameAnswer", gameEvents.sendGameAnswer(io, socket));

    socket.on("disconnect", async () => {
      console.log("user disconnected with id: ", socket.id);
      await gameEventsV2.leaveGame(io, socket);
    });
  };
};

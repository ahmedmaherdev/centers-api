const { StatusCodes } = require("http-status-codes");
const db = require("../../models");
const SocketError = require("./socketError");

module.exports = (io) => {
  return (socket) => {
    console.log("user connected with id: ", socket.id);

    socket.on("sendMessage", async ({ content, to }) => {
      // validate message data
      try {
        const { id: userId, role: userRole } = socket.user;
        if (!content || !to) {
          return next(
            new SocketError(
              "Invalid input data: messageData must have content and to.",
              StatusCodes.BAD_REQUEST
            )
          );
        }

        const room = await db.Rooms.findOne({
          where: {
            studentId: userId,
          },
        });

        socket.emit("sendMessageSuccess");
      } catch (error) {
        console.log(error);
        next(
          new SocketError(
            "Something went wrong.",
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("user disconnected with id: ", socket.id);
    });
  };
};

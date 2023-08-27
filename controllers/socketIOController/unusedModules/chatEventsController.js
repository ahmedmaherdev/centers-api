const { StatusCodes } = require("http-status-codes");
const SocketError = require("./socketError");
const db = require("../../../models");

exports.sendMessage = (io, socket) => {
  return async (content) => {
    try {
      // validate message data
      const { id: userId, role: userRole } = socket.user;
      if (!content) {
        socket.emit(
          "error",
          new SocketError(
            "Invalid input data: Invaild message content.",
            StatusCodes.BAD_REQUEST
          )
        );
        return;
      }

      // check if user join a room
      if (!socket.room) {
        socket.emit(
          "error",
          new SocketError("Please join a room first.", StatusCodes.BAD_REQUEST)
        );
        return;
      }

      // create the message
      const message = await db.Messages.create({
        roomId: socket.room.id,
        sender: userRole === "student" ? userRole : "center",
        createdById: userId,
        content,
      });

      // update room last message
      const room = await db.Rooms.findByPk(socket.room.id);
      room.lastMessage = content;
      await room.save();

      // send message to joined room sockets
      io.to(socket.roomName).emit("newMessage", message);
      // send the message to user
      socket.emit("sendMessageSuccess", message);
    } catch (error) {
      console.log(error);
      socket.emit(
        "error",
        new SocketError(
          "Can not send this message.",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  };
};

exports.joinRoom = (io, socket) => {
  return async (roomId) => {
    try {
      const room = await db.Rooms.findByPk(roomId);

      if (!room) {
        socket.emit(
          "error",
          new SocketError(
            `No room with this id: ${roomId}`,
            StatusCodes.NOT_FOUND
          )
        );
        return;
      }

      socket.room = {
        id: room.id,
        studentId: room.studentId,
      };

      socket.roomName = `room-${room.id}`;
      socket.join(socket.roomName);
      socket.emit("joinRoomSuccess", room);
    } catch (error) {
      console.log(error);
      socket.emit(
        "error",
        new SocketError(
          "Can not join this room, try again later.",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  };
};

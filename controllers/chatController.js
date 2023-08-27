const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const factoryHandler = require("./factoryHandler");
const catchAsync = require("../utils/catchAsync");
const Sender = require("../services/Sender");
const AppError = require("../utils/appError");

exports.getStudentRoom = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  let room = await db.Rooms.findOne({
    where: {
      studentId: userId,
    },
  });
  if (!room) room = await db.Rooms.create({ studentId: userId });

  Sender.send(res, StatusCodes.OK, {
    room,
  });
});
exports.getAllRooms = factoryHandler.getAll(db.Rooms);

// getAll
exports.getAllMessagesMiddleware = async (req, res, next) => {
  req.query.roomId = req.room.id;
  next();
};
exports.getAllMessages = factoryHandler.getAll(db.Rooms);
// get
exports.getMessage = factoryHandler.getOne(db.Messages);

// delete
exports.deleteMessage = factoryHandler.deleteOne(db.Messages);

//
exports.checkRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  const room = await db.Rooms.findByPk(roomId);
  if (!room) {
    return next(
      new AppError(`No room with this id: ${roomId}`, StatusCodes.NOT_FOUND)
    );
  }
  req.room = {
    id: room.id,
    studentId: room.studentId,
  };
  next();
});

const db = require("../models");
const factoryHandler = require("./factoryHandler");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const noteValidator = require("../validators/noteValidator");
const Notification = require("../utils/notification");
const Logger = require("../utils/Logger");
const noteLogger = new Logger("note");

exports.getAllNotes = factoryHandler.getAll(db.Notes, noteLogger);

exports.getNote = factoryHandler.getOne(db.Notes, noteLogger);

exports.createNoteMiddleware = (req, res, next) => {
  const result = noteValidator.createNote.validate(req.body);
  if (result.error) {
    noteLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${result.error.details[0].message}`
    );
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  req.isHasNotification = true;
  next();
};

exports.createNote = factoryHandler.createOne(db.Notes, noteLogger);

exports.createNoteNotification = async (req, res, next) => {
  try {
    // notification here
    const { id, name, url, schoolYearId } = req.createdData;
    const type = "note";
    const noteNotification = new Notification([], {
      type,
      id,
      name,
      url,
    });

    // find all students that schoolYear belongs to schoolYear of note
    const students = await db.Users.findAll({
      where: {
        role: "student",
      },
      include: {
        as: "student",
        model: db.Students,
        where: {
          schoolYearId,
        },
      },
      attributes: ["id", "name"],
    });

    for (const student of students) {
      let userDeviceTokens = await db.UserDeviceTokens.findAll({
        where: { userId: student.id },
        attributes: ["deviceToken"],
      });
      userDeviceTokens = userDeviceTokens.map((obj) => obj.deviceToken);

      if (userDeviceTokens.length > 0) {
        noteNotification.deviceTokens = userDeviceTokens;
        const res = await noteNotification.send();
        noteLogger.info(
          req.ip,
          `note notification sent: ${JSON.stringify(res)}`
        );
      }
    }
  } catch (error) {
    noteLogger.error(req.ip, `note notification failed: ${error.message}`);
  }
};

exports.updateNoteMiddleware = (req, res, next) => {
  const result = noteValidator.updateNote.validate(req.body);
  if (result.error) {
    noteLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${result.error.details[0].message}`
    );
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};
exports.updateNote = factoryHandler.updateOne(db.Notes, noteLogger);

exports.deleteNote = factoryHandler.deleteOne(db.Notes, noteLogger);

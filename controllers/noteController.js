const db = require("../models");
const factoryHandler = require("./factoryHandler");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const noteValidator = require("../validators/noteValidator");

exports.getAllNotes = factoryHandler.getAll(db.Notes);

exports.getNote = factoryHandler.getOne(db.Notes);

exports.createNoteMiddleware = (req, res, next) => {
  const result = noteValidator.createNote.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};

exports.createNote = factoryHandler.createOne(db.Notes);

exports.createNoteNotification = async (req, res, next) => {
  // notification here
};

exports.updateNoteMiddleware = (req, res, next) => {
  const result = noteValidator.updateNote.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};
exports.updateNote = factoryHandler.updateOne(db.Notes);

exports.deleteNote = factoryHandler.deleteOne(db.Notes);

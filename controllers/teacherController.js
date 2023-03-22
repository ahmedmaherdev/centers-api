const db = require("../models");
const factoryHandler = require("./factoryHandler");

exports.getAllTeachers = factoryHandler.getAll(db.Teachers);

exports.getTeacher = factoryHandler.getOne(db.Teachers);

exports.createTeacher = factoryHandler.createOne(db.Teachers);

exports.updateTeacher = factoryHandler.updateOne(db.Teachers);

exports.deleteTeacher = factoryHandler.deleteOne(db.Teachers);

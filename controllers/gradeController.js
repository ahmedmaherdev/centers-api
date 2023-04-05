const db = require("../models");
const factoryHandler = require("./factoryHandler");

exports.getAllGradesMiddleware = (req, res, next) => {
  const { role: userRole, id: userId } = req.user;
  if (userRole === "student") req.query.studentId = userId;
  next();
};

exports.getAllGrades = factoryHandler.getAll(db.Grades);

exports.getGrade = factoryHandler.getOne(db.Grades);

exports.deleteGrade = factoryHandler.deleteOne(db.Grades);

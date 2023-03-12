const db = require("../models");
const factoryHandler = require("./factoryHandler");

exports.getAllSchoolYears = factoryHandler.getAll(db.SchoolYears);

exports.getSchoolYear = factoryHandler.getOne(db.SchoolYears);

exports.createSchoolYear = factoryHandler.createOne(db.SchoolYears);

exports.updateSchoolYear = factoryHandler.updateOne(db.SchoolYears);

exports.deleteSchoolYear = factoryHandler.deleteOne(db.SchoolYears);

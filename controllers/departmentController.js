const db = require("../models");
const factoryHandler = require("./factoryHandler");
const departmentValidator = require("../validators/departmentValidator");
const AppError = require("../errors/AppError");
const { StatusCodes } = require("http-status-codes");

exports.getAllDepartments = factoryHandler.getAll(db.Departments);

exports.getDepartment = factoryHandler.getOne(db.Departments);

exports.createAndUpdateDepartmentMiddleware = (req, res, next) => {
  const result = departmentValidator.createDepartment.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};
exports.createDepartment = factoryHandler.createOne(db.Departments);

exports.updateDepartment = factoryHandler.updateOne(db.Departments);

exports.deleteDepartment = factoryHandler.deleteOne(db.Departments);

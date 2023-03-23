const db = require("../models");
const factoryHandler = require("./factoryHandler");
const subjectValidator = require("../validators/subjectValidator");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const Sender = require("../utils/Sender");

exports.getAllSubjects = factoryHandler.getAll(db.Subjects);

exports.getSubject = factoryHandler.getOne(db.Subjects);

exports.createAndUpdateSubjectMiddleware = (req, res, next) => {
  const result = subjectValidator.createSubject.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};
exports.createSubject = factoryHandler.createOne(db.Subjects);

exports.updateSubject = factoryHandler.updateOne(db.Subjects);

exports.deleteSubject = factoryHandler.deleteOne(db.Subjects);

exports.addMySubjects = catchAsync(async (req, res, next) => {
  let subjects = req.body.subjects;
  const {
    id: userId,
    student: { department: userDepartment },
  } = req.user;

  if (subjects.length === 0)
    return next(
      new AppError("please, provide your subjects", StatusCodes.BAD_REQUEST)
    );

  let studentSubjects = [];
  for (let sub of subjects) {
    const subject = await db.Subjects.findByPk(sub);
    if (subject && subject.department.id === userDepartment.id) {
      studentSubjects.push({
        studentId: userId,
        subjectId: subject.id,
        sections: subject.sections,
      });
    }
  }

  const StudentSubjects = await db.StudentSubjects.bulkCreate(studentSubjects);
  Sender.send(res, StatusCodes.OK, StudentSubjects);
});

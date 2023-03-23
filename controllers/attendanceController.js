const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factoryHandler = require("./factoryHandler");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

exports.getAllAttendancesMiddleware = (req, res, next) => {
  const { sectionId } = req.params;
  req.query.sectionId = sectionId;
  next();
};
exports.getAllAttendances = factoryHandler.getAll(db.Attendances);

exports.getAttendance = factoryHandler.getOne(db.Attendances);

exports.createAttendanceMiddleware = async (req, res, next) => {
  const { id: studentId } = req.student;
  const { subject } = req.section;

  try {
    const studentSubject = await db.StudentSubjects.findOne({
      where: {
        studentId,
        subjectId: subject.id,
      },
    });

    if (!studentSubject)
      return next(
        new AppError(
          "this student can not join this section.",
          StatusCodes.BAD_REQUEST
        )
      );

    req.body = {
      createdById: req.user.id,
      sectionId: req.section.id,
      studentId,
      status: "presence",
    };
  } catch (error) {
    next(new AppError("Can not join this section.", StatusCodes.BAD_REQUEST));
  }
};
exports.createAttendance = factoryHandler.createOne(db.Attendances);

exports.deleteAttendance = factoryHandler.deleteOne(db.Attendances);

exports.scanStudentQrcodeMiddleware = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  req.student = decoded;
  next();
});

exports.checkSectionMiddleware = catchAsync(async (req, res, next) => {
  const { sectionId } = req.params;
  const section = await db.Sections.findByPk(sectionId);
  if (!section)
    return next(
      new AppError(
        `No section with this id: ${sectionId}`,
        StatusCodes.NOT_FOUND
      )
    );

  req.section = section;
  next();
});

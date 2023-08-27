const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const { Op, literal } = require("sequelize");
const AppError = require("../errors/AppError");
const catchAsync = require("../utils/catchAsync");
const factoryHandler = require("./factoryHandler");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Sender = require("../services/Sender");
const moment = require("moment");

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
    next();
  } catch (error) {
    next(new AppError("Can not join this section.", StatusCodes.BAD_REQUEST));
  }
};
exports.createAttendance = factoryHandler.createOne(db.Attendances);

exports.deleteAttendance = factoryHandler.deleteOne(db.Attendances);

exports.finishAttendances = catchAsync(async (req, res, next) => {
  // get all students that join subject and not presence
  const presenceStudentsSubQuery = literal(
    `(SELECT studentId FROM Attendances WHERE sectionId = ${
      req.section.id
    } AND date = '${moment(Date.now()).format("YYYY-MM-DD")}')`
  );

  let absenceStudents = await db.StudentSubjects.findAll({
    where: {
      subjectId: req.section.subject.id,
      studentId: {
        [Op.notIn]: presenceStudentsSubQuery,
      },
    },
  });

  absenceStudents = absenceStudents.map((item) => {
    return {
      studentId: item.studentId,
      sectionId: req.section.id,
      status: "absence",
      createdById: req.user.id,
    };
  });

  await db.Attendances.bulkCreate(absenceStudents);
  Sender.send(res, StatusCodes.OK, undefined, {
    message: "section is ended successfully.",
  });
});

exports.scanStudentQrcodeMiddleware = catchAsync(async (req, res, next) => {
  const { studentId } = req.body;

  // const decoded = await promisify(jwt.verify)(qr, process.env.JWT_SECRET);

  const student = await db.Users.findByPk(studentId);

  if (!student)
    return next(new AppError("this student not found", StatusCodes.NOT_FOUND));
  req.student = {
    id: student.id,
    name: student.name,
    studentId: student.student.id,
  };
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

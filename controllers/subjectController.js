const db = require("../models");
const factoryHandler = require("./factoryHandler");
const subjectValidator = require("../validators/subjectValidator");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const Sender = require("../utils/Sender");
const { Op, literal } = require("sequelize");

exports.getAllSubjectsMiddleware = async (req, res, next) => {
  const { departmentId } = req.query;
  if (departmentId) {
    // addaitional filter obj
    req.filterObj = {
      id: {
        [Op.in]: literal(
          `(SELECT subjectId FROM SubjectDepartments WHERE departmentId = ${departmentId})`
        ),
      },
    };

    delete req.query.departmentId;
  }

  next();
};
exports.getAllSubjects = factoryHandler.getAll(db.Subjects);

exports.getSubject = factoryHandler.getOne(db.Subjects);

exports.createSubjectMiddleware = (req, res, next) => {
  const result = subjectValidator.createSubject.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};

exports.createSubject = catchAsync(async (req, res, next) => {
  const { name, schoolYearId, sections, departments } = req.body;

  const createdDepartments = await db.Departments.findAll({
    where: { id: departments },
  });

  const subject = await db.Subjects.create({
    name,
    schoolYearId,
    sections,
  });
  await subject.setDepartments(createdDepartments);

  Sender.send(res, StatusCodes.CREATED, subject);
});

exports.updateSubjectMiddleware = async (req, res, next) => {
  const result = subjectValidator.updateSubject.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};
exports.updateSubject = factoryHandler.updateOne(db.Subjects);

exports.deleteSubject = factoryHandler.deleteOne(db.Subjects);

exports.addMySubjects = catchAsync(async (req, res, next) => {
  let subjects = req.body.subjects;
  const { id: userId, departmentId: userDepartmentId } = req.user;

  if (subjects.length === 0)
    return next(
      new AppError("please, provide your subjects", StatusCodes.BAD_REQUEST)
    );

  let studentSubjects = [];
  for (let sub of subjects) {
    const subject = await db.Subjects.findByPk(sub);
    if (
      subject &&
      subject.departments.some((dep) => dep.id === userDepartmentId)
    ) {
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

exports.getMySubjects = catchAsync(async (req, res, next) => {
  const { id: studentId, departmentId } = req.user;

  // get student subjects
  const studentSubjects = await db.StudentSubjects.findAll({
    where: { studentId },
    attributes: ["subjectId"],
  });

  // get all subjects by student department
  let subjects = await db.Subjects.findAll({
    where: {
      id: {
        [Op.in]: literal(
          `(SELECT subjectId FROM SubjectDepartments WHERE departmentId = ${departmentId})`
        ),
      },
    },
  });

  // put isJoined flag that check if subject enrolled by student
  subjects = subjects.map((sub) => {
    let isJoined = studentSubjects.some(
      (studentSubject) => sub.id === studentSubject.subjectId
    );
    sub.dataValues.isJoined = isJoined;
    return sub;
  });

  Sender.send(res, StatusCodes.OK, subjects, {
    count: subjects.length,
  });
});

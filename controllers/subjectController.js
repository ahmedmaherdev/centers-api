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

  let subject = await db.Subjects.create({
    name,
    schoolYearId,
    sections,
  });

  const createdDepartments = await db.Departments.findAll({
    where: { id: departments, schoolYearId: subject.schoolYearId },
  });
  await subject.setDepartments(createdDepartments);

  subject = await db.Subjects.findByPk(subject.id);
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
// exports.updateSubject = factoryHandler.updateOne(db.Subjects);

exports.updateSubject = catchAsync(async (req, res, next) => {
  const { name, schoolYearId, sections, departments } = req.body;
  let subject = await db.Subjects.findByPk(req.params.id);

  subject.name = name ?? subject.name;
  subject.schoolYearId = schoolYearId ?? subject.schoolYearId;
  subject.sections = sections ?? subject.sections;

  if (departments) {
    const createdDepartments = await db.Departments.findAll({
      where: { id: departments, schoolYearId: subject.schoolYearId },
    });
    await subject.setDepartments(createdDepartments);
  }

  await subject.save();

  subject = await db.Subjects.findByPk(subject.id);
  Sender.send(res, StatusCodes.OK, subject);
});

exports.deleteSubject = factoryHandler.deleteOne(db.Subjects);

exports.addMySubjects = catchAsync(async (req, res, next) => {
  // validate the subject input
  const result = subjectValidator.addMySubjects.validate(req.body);
  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }

  let subjects = req.body.subjects;
  const { id: userId, departmentId: userDepartmentId } = req.user;

  // validate the length of subjects
  if (subjects.length === 0)
    return next(
      new AppError("please, provide your subjects", StatusCodes.BAD_REQUEST)
    );

  // get the subjects
  const subjectsData = await db.Subjects.findAll({
    where: {
      [Op.and]: [
        {
          id: subjects,
        },
        {
          id: {
            [Op.in]: literal(
              `(SELECT subjectId FROM ${db.SubjectDepartments.tableName} WHERE departmentId = ${userDepartmentId})`
            ),
          },
        },
      ],
    },
  });

  // create subjects for student
  let studentSubjects = subjectsData.map((sub) => {
    return {
      subjectId: sub.id,
      studentId: userId,
      sections: sub.sections,
    };
  });

  if (studentSubjects.length > 0) {
    await db.StudentSubjects.destroy({
      where: { studentId: userId },
    });
  }

  studentSubjects = await db.StudentSubjects.bulkCreate(studentSubjects);
  Sender.send(res, StatusCodes.OK, { subjects: studentSubjects });
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

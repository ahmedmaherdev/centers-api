const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const factoryHandler = require("./factoryHandler");
const catchAsync = require("../utils/catchAsync");
const Sender = require("../utils/Sender");

exports.getMyAnswers = catchAsync(async (req, res, next) => {
  const { id: studentId } = req.user;
  const { id: examId } = req.exam;
  const answers = await db.Answers.findAll({
    where: {
      studentId,
      examId,
    },
    sort: ["questionId"],
  });
  Sender.send(
    res,
    StatusCodes.OK,
    { answers },
    {
      count: answers.length,
    }
  );
});

exports.getAnswer = factoryHandler.getOne(db.Answers);

exports.createAnswers = catchAsync(async (req, res, next) => {
  const { id: studentId } = req.user;
  const { id: examId } = req.exam;
  const { answers: studentAnswers } = req.body;

  const examAnswers = await db.Questions.findAll({
    where: {
      examId,
    },
    attributes: ["id", "answer"],
  });

  const studentGrade = new db.Grades({
    total: examAnswers.length,
    correct: 0,
    wrong: 0,
    studentId,
    examId,
  });

  examAnswers.forEach((question) => {
    let studentAnswer = studentAnswers.find(
      (ans) => ans.questionId === question.id && ans.answer === question.answer
    );

    studentAnswer ? studentGrade.correct++ : studentGrade.wrong++;
  });

  let createdAnswers = studentAnswers.map((ans) => {
    return {
      examId: examId,
      studentId: studentId,
      questionId: ans.questionId,
      answer: ans.answer,
    };
  });

  await db.Answers.bulkCreate(createdAnswers);
  await studentGrade.save();
  Sender.send(res, StatusCodes.CREATED, studentGrade);
});

exports.deleteAnswer = factoryHandler.deleteOne(db.Answers);

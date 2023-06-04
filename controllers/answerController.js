const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const factoryHandler = require("./factoryHandler");
const catchAsync = require("../utils/catchAsync");
const Sender = require("../utils/Sender");
const validate = require("../utils/validate");
const answerValidator = require("../validators/answerValidator");
const AppError = require("../utils/appError");

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

  // validate the input
  const errorMessage = validate(req, answerValidator.createAnswers);
  if (errorMessage)
    return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));

  // get the exam answers
  const examAnswers = await db.Questions.findAll({
    where: {
      examId,
    },
    attributes: ["id", "answer"],
  });

  // init new grade
  const studentGrade = new db.Grades({
    total: examAnswers.length,
    correct: 0,
    wrong: 0,
    studentId,
    examId,
  });

  let createdAnswers = [];
  examAnswers.forEach((question) => {
    // find student answer
    let studentAnswer = studentAnswers.find(
      (ans) => ans.questionId === question.id
    );

    const isCorrect = studentAnswer && studentAnswer.answer === question.answer;
    isCorrect ? studentGrade.correct++ : studentGrade.wrong++;

    // push answer to createdAnswers
    createdAnswers.push({
      examId: examId,
      studentId: studentId,
      questionId: question.id,
      answer: studentAnswer?.answer ?? null,
    });
  });

  await db.Answers.bulkCreate(createdAnswers);
  await studentGrade.save();
  Sender.send(res, StatusCodes.CREATED, studentGrade);
});

exports.deleteAnswer = factoryHandler.deleteOne(db.Answers);

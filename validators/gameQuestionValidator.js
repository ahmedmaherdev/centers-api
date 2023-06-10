const joi = require("joi");

exports.createGameQuestion = joi.object({
  content: joi.string().min(5).max(200).required(),
  choices: joi
    .object({
      A: joi.string().required(),
      B: joi.string().required(),
      C: joi.string().required(),
      D: joi.string().required(),
    })
    .required(),
  answer: joi.string().valid("A", "B", "C", "D").required(),
  subjectId: joi.number().integer().required(),
  period: joi
    .number()
    .min(5 * 60)
    .max(2 * 60 * 60)
    .required(), // min 5 mins and max 2 hours
});

exports.updateGameQuestion = joi.object({
  content: joi.string().min(5).max(200),
  choices: joi.object({
    A: joi.string(),
    B: joi.string(),
    C: joi.string(),
    D: joi.string(),
  }),
  answer: joi.string().valid("A", "B", "C", "D"),
  subjectId: joi.number().integer(),
  period: joi
    .number()
    .min(5 * 60)
    .max(2 * 60 * 60), // min 5 mins and max 2 hours
});

exports.gameAnswer = joi.object({
  answer: joi.string().valid("A", "B", "C", "D").required(),
  questionId: joi.number().integer().required(),
});

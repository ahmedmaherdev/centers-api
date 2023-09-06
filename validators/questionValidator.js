const joi = require("joi");

exports.createQuestion = joi.object({
  content: joi.string().min(5).required(),
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
});

exports.updateQuestion = joi.object({
  content: joi.string().min(5),
  choices: joi.object({
    A: joi.string(),
    B: joi.string(),
    C: joi.string(),
    D: joi.string(),
  }),
  answer: joi.string().valid("A", "B", "C", "D"),
  subjectId: joi.number().integer(),
});

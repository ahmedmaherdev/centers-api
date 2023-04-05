const joi = require("joi");

exports.createAnswers = joi.object({
  answers: joi
    .array()
    .items({
      questionId: joi.number().integer().required(),
      answer: joi.string().valid("A", "B", "C", "D").required(),
    })
    .required(),
});

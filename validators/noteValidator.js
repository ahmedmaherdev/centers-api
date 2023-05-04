const joi = require("joi");

exports.createNote = joi.object({
  name: joi.string().min(5).max(100).required(),
  url: joi.string().uri().required(),
  schoolYearId: joi.number().integer().required(),
});

exports.updateNote = joi.object({
  name: joi.string().min(5).max(100),
  url: joi.string().uri(),
  schoolYearId: joi.number().integer(),
});

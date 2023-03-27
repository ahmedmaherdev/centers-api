const joi = require("joi");

exports.createSubject = joi.object({
  name: joi.string().min(5).max(100).required(),
  departments: joi.array().items(joi.number().required()),
  schoolYearId: joi.number().required(),
  sections: joi.number().required(),
});

exports.updateSubject = joi.object({
  name: joi.string().min(5).max(100),
  departments: joi.array().items(joi.number()),
  schoolYearId: joi.number(),
  sections: joi.number(),
});

exports.addMySubjects = joi.array().items(joi.number().required());

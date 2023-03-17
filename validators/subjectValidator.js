const joi = require("joi");

exports.createSubject = joi.object({
  name: joi.string().min(5).max(100).required(),
  departmentId: joi.number().required(),
  schoolYearId: joi.number().required(),
  sections: joi.number().required(),
});

exports.addMySubjects = joi.array().items(joi.number().required());

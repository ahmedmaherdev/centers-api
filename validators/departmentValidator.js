const joi = require("joi");

exports.createDepartment = joi.object({
  name: joi.string().min(5).max(100).required(),
  schoolYearId: joi.number().required(),
});

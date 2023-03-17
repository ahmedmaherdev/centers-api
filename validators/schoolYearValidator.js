const joi = require("joi");

exports.createSchoolYear = joi.object({
  name: joi.string().min(5).max(100).required(),
});

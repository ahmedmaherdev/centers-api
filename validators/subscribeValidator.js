const joi = require("joi");

exports.createSubscribe = joi.object({
  studentId: joi.number().integer().required(),
});

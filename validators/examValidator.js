const joi = require("joi");
const moment = require("moment");

exports.createExam = joi.object({
  name: joi.string().min(5).max(100).required(),
  period: joi
    .number()
    .min(5 * 60)
    .max(2 * 60 * 60)
    .required(), // min 5 mins and max 2 hours

  departmentId: joi.number().integer().required(),
  photo: joi.string(),
  startedAt: joi.date().min(moment(Date.now())).required(),
});

exports.updateExam = joi.object({
  name: joi.string().min(5).max(100),
  period: joi
    .number()
    .min(5 * 60 * 1000)
    .max(2 * 60 * 60 * 1000), // min 5 mins and max 2 hours
  departmentId: joi.number().integer(),
  photo: joi.string(),
  startedAt: joi.date().min(moment(Date.now())),
});

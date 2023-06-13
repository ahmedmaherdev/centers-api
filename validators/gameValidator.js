const joi = require("joi");
const moment = require("moment");

exports.createGame = joi.object({
  name: joi.string().min(5).max(100).required(),
  departmentId: joi.number().integer().required(),
  startedAt: joi.date().min(moment(Date.now())),
});

exports.updateGame = joi.object({
  name: joi.string().min(5).max(100),
  departmentId: joi.number().integer(),
  startedAt: joi.date().min(moment(Date.now())),
});

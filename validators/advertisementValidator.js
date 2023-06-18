const joi = require("joi");

exports.createAdvertisement = joi.object({
  name: joi.string().min(5).max(100).required(),
  description: joi.string().required(),
  pirority: joi.string().valid("important", "unimportant"),
  startedAt: joi.date().custom((value, helpers) => {
    if (new Date(value) < new Date(Date.now()))
      return helpers.message("startedAt date must bigger than now.");
  }),
  endedAt: joi
    .date()
    .custom((value, helpers) => {
      if (new Date(value) < new Date(Date.now()))
        return helpers.message("endedAt date must bigger than now.");
    })
    .required(),
  departmentId: joi.number().integer().required(),
});

exports.updateAdvertisement = joi.object({
  name: joi.string().min(5).max(100),
  description: joi.string(),
  pirority: joi.string().valid("important", "unimportant"),
  startedAt: joi.date().custom((value, helpers) => {
    if (new Date(value) < new Date(Date.now()))
      return helpers.message("startedAt date must bigger than now.");
  }),
  endedAt: joi.date().custom((value, helpers) => {
    if (new Date(value) < new Date(Date.now()))
      return helpers.message("startedAt date must bigger than now.");
  }),
  departmentId: joi.number().integer(),
});

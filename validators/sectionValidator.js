const joi = require("joi");

exports.createSection = joi.object({
  subjectId: joi.number().required(),
  teacherId: joi.number().required(),
  day: joi
    .string()
    .valid(
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    )
    .required(),

  time: joi.string().required(),
});

exports.updateSection = joi.object({
  subjectId: joi.number(),
  teacherId: joi.number(),
  day: joi
    .string()
    .valid(
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ),
  time: joi.string(),
});

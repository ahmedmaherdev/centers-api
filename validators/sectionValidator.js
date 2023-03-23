const joi = require("joi");

exports.createSection = joi.object({
  subjectId: joi.number().required(),
  teacherId: joi.number().required(),
  day: joi
    .string()
    .valid(
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
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
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ),
  time: joi.string(),
});

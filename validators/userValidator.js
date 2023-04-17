const joi = require("joi");
const { isMobilePhone } = require("validator");

exports.createUser = joi.object({
  name: joi.string().min(6).max(100).required(),
  email: joi.string().email().required(),
  phone: joi
    .string()
    .custom((value, helpers) => {
      if (!isMobilePhone(value, "ar-EG"))
        return helpers.message(`Invalid phone number.`);
    })
    .required(),
  password: joi.string().min(8).required(),
  passwordConfirm: joi
    .string()
    .valid(joi.ref("password"))
    .messages({
      "any.only": "Two passwords are not the same.",
    })
    .required(),
  role: joi.string().valid("student", "manager", "admin"),
});

exports.updateUser = joi.object({
  name: joi.string().min(6).max(100),
  email: joi.string().email(),
  phone: joi.string().custom((value, helpers) => {
    if (!isMobilePhone(value, "ar-EG"))
      return helpers.message(`Invalid phone number.`);
  }),
  role: joi.string().valid("student", "manager", "admin"),
});

exports.updateMe = joi.object({
  name: joi.string().min(6).max(100),
  email: joi.string().email(),
  phone: joi.string().custom((value, helpers) => {
    if (!isMobilePhone(value, "ar-EG"))
      return helpers.message(`Invalid phone number.`);
  }),
  gender: joi.string().valid("male", "female"),
  parentPhone: joi.string().custom((value, helpers) => {
    if (!isMobilePhone(value, "ar-EG"))
      return helpers.message(`Invalid phone number.`);
  }),
  schoolYearId: joi.number().integer(),
  departmentId: joi.number().integer(),
});

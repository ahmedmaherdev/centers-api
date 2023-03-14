const joi = require("joi");
const { isMobilePhone } = require("validator");

exports.userValidator = joi.object({
  name: joi.string().min(6).max(100).required(),
  email: joi.string().email().required(),
  phone: joi.string().custom((value, helpers) => {
    if (!isMobilePhone(value, "ar-EG"))
      return helpers.message(`Invalid input data. invalid phone number.`);
  }),
  password: joi.string().min(8).required(),
  passwordConfirm: joi.string().valid(joi.ref("password")).messages({
    "any.only": "Two passwords are not the same.",
  }),
  role: joi.string().valid("student", "manager", "admin"),
});

exports.studentValidator = joi.object({
  name: joi.string().min(6).max(100).required(),
  email: joi.string().email().required(),
  phone: joi.string().custom((value, helpers) => {
    if (!isMobilePhone(value, "ar-EG"))
      return helpers.message(`Invalid input data. invalid phone number.`);
  }),
  password: joi.string().min(8).required(),
  passwordConfirm: joi.string().valid(joi.ref("password")).messages({
    "any.only": "Two passwords are not the same.",
  }),
  gender: joi.string().valid("male", "female").required(),
  parentPhone: joi.string().custom((value, helpers) => {
    if (!isMobilePhone(value, "ar-EG"))
      return helpers.message(`Invalid input data. invalid phone number.`);
  }),
  schoolYearId: joi.number().required(),
});

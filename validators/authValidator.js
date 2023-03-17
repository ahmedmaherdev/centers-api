const joi = require("joi");
const { isMobilePhone } = require("validator");

exports.signup = joi.object({
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
  gender: joi.string().valid("male", "female").required(),
  parentPhone: joi
    .string()
    .custom((value, helpers) => {
      if (!isMobilePhone(value, "ar-EG"))
        return helpers.message(`Invalid phone number.`);
    })
    .required(),
  schoolYearId: joi.number().required(),
  departmentId: joi.number().required(),
});

exports.login = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

exports.loginAsParent = joi.object({
  parentPhone: joi
    .string()
    .custom((value, helpers) => {
      if (!isMobilePhone(value, "ar-EG"))
        return helpers.message(`Invalid phone number.`);
    })
    .required(),
  code: joi.number().required(),
});

exports.forgetPassword = joi.object({
  email: joi.string().email().required(),
});

exports.resetPassword = joi.object({
  password: joi.string().min(8).required(),
  passwordConfirm: joi
    .string()
    .valid(joi.ref("password"))
    .messages({
      "any.only": "Two passwords are not the same",
    })
    .required(),
});

exports.updatePassword = joi.object({
  password: joi.string().min(8).required(),
  newPassword: joi.string().min(8).required(),
  newPasswordConfirm: joi
    .string()
    .valid(joi.ref("newPassword"))
    .messages({
      "any.only": "Two passwords are not the same",
    })
    .required(),
});

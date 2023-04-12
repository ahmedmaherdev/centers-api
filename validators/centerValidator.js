const joi = require("joi");
const { isMobilePhone } = require("validator");

exports.createCenter = joi.object({
  name: joi.string().min(5).max(100).required(),
  phone: joi
    .string()
    .custom((value, helpers) => {
      if (!isMobilePhone(value, "ar-EG"))
        return helpers.message(`Invalid phone number.`);
    })
    .required(),
  location: joi.object({
    latitude: joi.number().required(),
    longitude: joi.number().required(),
    description: joi.string().required(),
  }),
});

exports.updateCenter = joi.object({
  name: joi.string().min(5).max(100),
  phone: joi.string().custom((value, helpers) => {
    if (!isMobilePhone(value, "ar-EG"))
      return helpers.message(`Invalid phone number.`);
  }),
  location: joi.object({
    latitude: joi.number().required(),
    longitude: joi.number().required(),
    description: joi.string().required(),
  }),
});

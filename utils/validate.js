module.exports = (req, schema) => {
  const result = schema.validate(req.body);
  return result.error
    ? `Invalid input data: ${result.error.details[0].message}`
    : "";
};

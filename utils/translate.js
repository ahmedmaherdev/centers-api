const translate = require("translatte");
module.exports = async (content) => {
  const res = await translate(content, { to: "ar", from: "en" });
  return res.text;
};

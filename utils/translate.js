const { translateAPI } = require("../config");
const axios = require("axios");

module.exports = async (text, from = "en", to = "ar") => {
  const req = await axios.get(`${translateAPI}&sl=${from}&tl=${to}&q=${text}`);
  const [[[translatedText]]] = req.data;
  return translatedText ?? text;
};

module.exports = (io) => {
  const protect = require("./protectMiddleware")(io);
  const connection = require("./onConnection")(io);
  return {
    protect,
    connection,
  };
};

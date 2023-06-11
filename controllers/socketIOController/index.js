module.exports = (io) => {
  return {
    protect: require("./protectMiddleware")(io),
    connection: require("./onConnection")(io),
  };
};

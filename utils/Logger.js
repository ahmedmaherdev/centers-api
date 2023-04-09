const winston = require("winston");
const moment = require("moment");

module.exports = class Logger {
  constructor(route) {
    this.route = route;
    this._logger = winston.createLogger({
      format: winston.format.printf((info) => {
        const dateNow = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
        const msg = `${dateNow} | ${info.level.toUpperCase()} | ${
          info.message
        }`;
        return msg;
      }),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: `./logs/${this.route}.log`,
        }),
        new winston.transports.File({
          filename: `./logs/${this.route}.error.log`,
          level: "error",
        }),
      ],
    });
  }

  info(ip, msg) {
    this._logger.info(`${ip} | ${msg}`);
  }

  warn(ip, msg) {
    this._logger.warn(`${ip} | ${msg}`);
  }
  error(ip, msg) {
    this._logger.error(`${ip} | ${msg}`);
  }
};

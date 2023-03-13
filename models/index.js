const { Sequelize } = require("sequelize");
const config = require("./config");
const db = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  dialect: config.dialect,
  pool: config.pool,
  logging: false,
});

db.Users = require("./userModel")(db);
db.Students = require("./studentModel")(db);
db.SchoolYears = require("./schoolYearModel")(db);

module.exports = db;

const { Sequelize } = require("sequelize");
const config = require("./config");
const db = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  dialect: config.dialect,
  pool: config.pool,
  logging: false,
});

db.SchoolYears = require("./schoolYearModel")(db);
db.Departments = require("./departmentModel")(db);
db.Students = require("./studentModel")(db);
db.Users = require("./userModel")(db);
db.Subjects = require("./subjectModel")(db);
db.StudentSubjects = require("./studentSubjectModel")(db);

module.exports = db;

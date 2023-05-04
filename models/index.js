const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const connectionString =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE
    : process.env.DATABASE_LOCAL;

const db = new Sequelize(connectionString, {
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
});

db.SchoolYears = require("./schoolYearModel")(db);
db.Departments = require("./departmentModel")(db);
db.Students = require("./studentModel")(db);
db.Users = require("./userModel")(db);
db.UserDeviceTokens = require("./UserDeviceTokenModel")(db);
db.Subjects = require("./subjectModel")(db);
db.Teachers = require("./teacherModel")(db);
db.Sections = require("./sectionModel")(db);
db.Attendances = require("./attendanceModel")(db);
db.StudentSubjects = require("./studentSubjectModel")(db);
db.SubjectDepartments = require("./subjectDepartmentModel")(db);
db.Exams = require("./examModel")(db);
db.Questions = require("./questionModel")(db);
db.Grades = require("./gradeModel")(db);
db.Answers = require("./answerModel")(db);
db.Subscribes = require("./subscribeModel")(db);
db.Centers = require("./centerModel")(db);
db.Advertisements = require("./advertisementModel")(db);
db.Notes = require("./noteModel")(db);

module.exports = db;

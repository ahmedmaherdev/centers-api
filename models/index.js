const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const dbOptions = {
  dialect: "mysql",
  charset: "utf8mb4",
  collate: "utf8mb4_unicode_ci",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
};

const db =
  process.env.NODE_ENV === "production"
    ? new Sequelize(
        process.env.DATABASE_NAME,
        process.env.DATABASE_USER,
        process.env.DATABASE_PASSWORD,
        {
          host: process.env.DATABASE_HOST,
          ...dbOptions,
        }
      )
    : new Sequelize(process.env.DATABASE, dbOptions);

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
db.Games = require("./game/gameModel")(db);
db.GameStudents = require("./game/gameStudentModel")(db);
db.GameQuestions = require("./game/gameQuestionModel")(db);
db.GameMatches = require("./game/gameMatchModel")(db);
db.GameAnswers = require("./game/gameAnswerModel")(db);
// db.Rooms = require("./chat/roomModel")(db);
// db.Messages = require("./chat/messageModel")(db);

module.exports = db;

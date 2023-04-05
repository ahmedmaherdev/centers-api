const Auth = require("./authRoutes");
const User = require("./userRoutes");
const Teacher = require("./teacherRoutes");
const SchoolYear = require("./schoolYearRoutes");
const Department = require("./departmentRoutes");
const Subject = require("./subjectRoutes");
const Section = require("./sectionRoutes");
const Exam = require("./examRoutes");
const Grade = require("./gradeRoutes");
const Subscribe = require("./subscribeRoutes");
const Upload = require("./uploadRoutes");

module.exports = {
  User,
  Auth,
  SchoolYear,
  Department,
  Subject,
  Teacher,
  Section,
  Exam,
  Grade,
  Subscribe,
  Upload,
};

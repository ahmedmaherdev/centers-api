const Auth = require("./authRoutes");
const User = require("./userRoutes");
const Teacher = require("./teacherRoutes");
const SchoolYear = require("./schoolYearRoutes");
const Department = require("./departmentRoutes");
const Subject = require("./subjectRoutes");
const Section = require("./sectionRoutes");
const Upload = require("./uploadRoutes");

module.exports = {
  User,
  Auth,
  SchoolYear,
  Department,
  Subject,
  Upload,
  Teacher,
  Section,
};

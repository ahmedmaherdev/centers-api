const User = require("./userRoutes");
const Auth = require("./authRoutes");
const SchoolYear = require("./schoolYearRoutes");
const Department = require("./departmentRoutes");
const Subject = require("./subjectRoutes");
const Upload = require("./uploadRoutes");

module.exports = {
  User,
  Auth,
  SchoolYear,
  Department,
  Subject,
  Upload,
};

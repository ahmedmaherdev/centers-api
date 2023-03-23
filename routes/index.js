const Auth = require("./authRoutes");
const User = require("./userRoutes");
const Teacher = require("./teacherRoutes");
const SchoolYear = require("./schoolYearRoutes");
const Department = require("./departmentRoutes");
const Subject = require("./subjectRoutes");
const Section = require("./sectionRoutes");
const Upload = require("./uploadRoutes");
const Qrcode = require("./qrcodeRoutes");

module.exports = {
  User,
  Auth,
  SchoolYear,
  Department,
  Subject,
  Teacher,
  Section,
  Upload,
  Qrcode,
};

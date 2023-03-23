const express = require("express");
const router = express.Router({ mergeParams: true });
const attendances = require("../controllers/attendanceController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../controllers/authController/protect");

router.use(protect);
router.use(restrictTo("manager", "admin"));
router.use(attendances.checkSectionMiddleware);

router.get("/", attendances.getAllAttendances);
router.get("/:id", attendances.getAttendance);
router.route("/:id").delete(attendances.deleteAttendance);

router.use(attendances.scanStudentQrcodeMiddleware);
router.post("/", createAttendanceMiddleware, attendances.createAttendance);

module.exports = router;

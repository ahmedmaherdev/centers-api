const express = require("express");
const router = express.Router({ mergeParams: true });
const attendances = require("../controllers/attendanceController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../middlewares/protectMiddleware");

router.use(protect);
router.use(restrictTo("manager", "admin"));
router.use(attendances.checkSectionMiddleware);

router.get(
  "/",
  attendances.getAllAttendancesMiddleware,
  attendances.getAllAttendances
);
router.get("/finish", attendances.finishAttendances);
router
  .route("/:id")
  .get(attendances.getAttendance)
  .delete(attendances.deleteAttendance);

router.use(attendances.scanStudentQrcodeMiddleware);
router.post(
  "/",
  attendances.createAttendanceMiddleware,
  attendances.createAttendance
);

module.exports = router;

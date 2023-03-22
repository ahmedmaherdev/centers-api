const express = require("express");
const router = express.Router();
const teachers = require("../controllers/teacherController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../controllers/authController/protect");

router.use(protect);
router.get("/", teachers.getAllTeachers);
router.get("/:id", teachers.getTeacher);

router.use(restrictTo("admin"));
router.post("/", teachers.createTeacher);
router
  .route("/:id")
  .patch(teachers.updateTeacher)
  .delete(teachers.deleteTeacher);

module.exports = router;

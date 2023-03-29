const express = require("express");
const router = express.Router();
const exams = require("../controllers/examController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../controllers/authController/protect");

router.use(protect);
router.get("/", exams.getAllExamsMiddleware, exams.getAllExams);
router.get("/:id", exams.getExam);

router.use(restrictTo("admin", "manager"));
router.post("/", exams.createExamMiddleware, exams.createExam);
router
  .route("/:id")
  .patch(exams.updateExamMiddleware, exams.updateExam)
  .delete(exams.deleteExam);

module.exports = router;

const express = require("express");
const router = express.Router();
const exams = require("../controllers/examController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../controllers/authController/protect");
const questions = require("./questionRoutes");
const answers = require("./answerRoutes");

router.use("/:examId/questions", questions);
router.use("/:examId/answers", answers);

router.use(protect);
router.get("/", exams.getAllExamsMiddleware, exams.getAllExams);
// router.get("/getMyExams", exams.getMyExamsMiddleware, exams.getMyExams);
router.get("/:id", exams.getExam);

router.use(restrictTo("admin", "manager"));
router.post(
  "/",
  exams.createExamMiddleware,
  exams.createExam,
  exams.createExamNotification
);
router
  .route("/:id")
  .patch(exams.updateExamMiddleware, exams.updateExam)
  .delete(exams.deleteExam);

module.exports = router;

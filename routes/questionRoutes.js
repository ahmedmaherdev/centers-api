const express = require("express");
const router = express.Router({ mergeParams: true });
const questions = require("../controllers/questionController");
const { checkExamMiddleware } = require("../controllers/examController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../controllers/authController/protect");

router.use(protect);
router.use(checkExamMiddleware);

router.get("/", questions.getAllQuestions);

router.get("/:id", questions.getQuestion);

router.use(restrictTo("manager", "admin"));

router.post("/", questions.createQuestionMiddleware, questions.createQuestion);
router
  .route("/:id")
  .get(questions.getQuestion)
  .patch(questions.updateQuestionMiddleware, questions.updateQuestion)
  .delete(questions.deleteQuestion);

module.exports = router;

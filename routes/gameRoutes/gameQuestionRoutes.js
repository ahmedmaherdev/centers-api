const express = require("express");
const router = express.Router({ mergeParams: true });
const questions = require("../../controllers/gameQuestionController");
const { checkGameMiddleware } = require("../../controllers/gameController");
const restrictTo = require("../../utils/restrictTo");
const protect = require("../../controllers/authController/protect");

router.use(protect);
router.use(checkGameMiddleware);

router.get("/", questions.getAllGameQuestions);

router.get("/:id", questions.getQuestion);
router.post("/createAnswer", restrictTo("student"), questions.createGameAnswer);

router.use(restrictTo("manager", "admin"));

router.post("/", questions.createQuestionMiddleware, questions.createQuestion);
router
  .route("/:id")
  .get(questions.getQuestion)
  .patch(questions.updateQuestionMiddleware, questions.updateQuestion)
  .delete(questions.deleteQuestion);

module.exports = router;

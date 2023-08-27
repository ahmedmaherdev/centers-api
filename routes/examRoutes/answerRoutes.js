const express = require("express");
const router = express.Router({ mergeParams: true });
const answers = require("../../controllers/answerController");
const { checkExamMiddleware } = require("../../controllers/examController");
const restrictTo = require("../../utils/restrictTo");
const protect = require("../../middlewares/protectMiddleware");

router.use(protect);
router.use(checkExamMiddleware);

router.get("/", answers.getMyAnswers);

router.get("/:id", answers.getAnswer);
router.post("/", restrictTo("student"), answers.createAnswers);

router.use(restrictTo("admin"));

router.delete("/:id", answers.deleteAnswer);

module.exports = router;

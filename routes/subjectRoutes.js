const express = require("express");
const router = express.Router();
const subjects = require("../controllers/subjectController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../middlewares/protectMiddleware");

router.get(
  "/getMySubjects",
  protect,
  restrictTo("student"),
  subjects.getMySubjects
);

router.get("/", subjects.getAllSubjectsMiddleware, subjects.getAllSubjects);
router.get("/:id", subjects.getSubject);

router.use(protect);

router.post("/addMySubjects", restrictTo("student"), subjects.addMySubjects);

router.use(restrictTo("admin"));
router.post("/", subjects.createSubjectMiddleware, subjects.createSubject);
router
  .route("/:id")
  .patch(subjects.updateSubjectMiddleware, subjects.updateSubject)
  .delete(subjects.deleteSubject);

module.exports = router;

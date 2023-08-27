const express = require("express");
const router = express.Router();
const grades = require("../controllers/gradeController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../middlewares/protectMiddleware");

router.use(protect);
router.get("/", grades.getAllGradesMiddleware, grades.getAllGrades);
router.get("/:id", grades.getGrade);

router.use(restrictTo("admin", "manager"));
router.delete("/:id", grades.deleteGrade);

module.exports = router;

const express = require("express");
const router = express.Router();
const SchoolYears = require("../controllers/schoolYearController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../controllers/authController/protect");

router.use(protect);
router.get("/", SchoolYears.getAllSchoolYears);
router.get("/:id", SchoolYears.getSchoolYear);

router.use(restrictTo("admin"));
router.post("/", SchoolYears.createSchoolYear);
router
  .route("/:id")
  .patch(SchoolYears.updateSchoolYear)
  .delete(SchoolYears.deleteSchoolYear);

module.exports = router;

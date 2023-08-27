const express = require("express");
const router = express.Router();
const schoolYears = require("../controllers/schoolYearController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../middlewares/protectMiddleware");

router.get("/", schoolYears.getAllSchoolYears);
router.get("/:id", schoolYears.getSchoolYear);

router.use(protect);
router.use(restrictTo("admin"));
router.post(
  "/",
  schoolYears.createAndUpdateSchoolYearMiddleware,
  schoolYears.createSchoolYear
);
router
  .route("/:id")
  .patch(schoolYears.updateSchoolYear)
  .delete(schoolYears.deleteSchoolYear);

module.exports = router;

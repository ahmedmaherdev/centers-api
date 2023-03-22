const express = require("express");
const router = express.Router();
const sections = require("../controllers/sectionController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../controllers/authController/protect");

router.use(protect);
router.get("/", sections.getAllSections);
router.get("/:id", sections.getSection);

router.use(restrictTo("admin"));
router.post("/", sections.createSectionMiddleware, sections.createSection);
router
  .route("/:id")
  .patch(sections.updateSectionMiddleware, sections.updateSection)
  .delete(sections.deleteSection);

module.exports = router;

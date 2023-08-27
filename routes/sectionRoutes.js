const express = require("express");
const router = express.Router();
const sections = require("../controllers/sectionController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../middlewares/protectMiddleware");
const attendances = require("./attendanceRoutes");

router.use(protect);
router.use("/:sectionId/attendances", attendances);

router.get("/", sections.getAllSectionsMiddleware, sections.getAllSections);
router.get("/:id", sections.getSection);

router.use(restrictTo("admin"));
router.post("/", sections.createSectionMiddleware, sections.createSection);
router
  .route("/:id")
  .patch(sections.updateSectionMiddleware, sections.updateSection)
  .delete(sections.deleteSection);

module.exports = router;

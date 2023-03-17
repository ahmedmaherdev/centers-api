const express = require("express");
const router = express.Router();
const departments = require("../controllers/departmentController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../controllers/authController/protect");

router.get("/", departments.getAllDepartments);
router.get("/:id", departments.getDepartment);

router.use(protect);
router.use(restrictTo("admin"));
router.post(
  "/",
  departments.createAndUpdateDepartmentMiddleware,
  departments.createDepartment
);
router
  .route("/:id")
  .patch(departments.updateDepartment)
  .delete(departments.deleteDepartment);

module.exports = router;

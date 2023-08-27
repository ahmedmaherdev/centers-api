const express = require("express");
const router = express.Router({ mergeParams: true });
const centers = require("../controllers/centerController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../middlewares/protectMiddleware");

router.use(protect);
router.get("/", centers.getCenterMiddleware, centers.getCenter);

router.use(restrictTo("manager", "admin"));
router.patch("/", centers.updateCenterMiddleware, centers.updateCenter);

module.exports = router;

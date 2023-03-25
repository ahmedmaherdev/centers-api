const express = require("express");
const router = express.Router();
const qrcodes = require("../controllers/qrcodeController");
const protect = require("../controllers/authController/protect");
const restrictTo = require("../utils/restrictTo");

router.use(protect);
router.use(restrictTo("student"));
router.get("/student", qrcodes.qrcodeStudent);

module.exports = router;

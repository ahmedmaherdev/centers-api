const express = require("express");
const router = express.Router();
const upload = require("../controllers/uploadController");
const protect = require("../controllers/authController/protect");

router.use(protect);

router.get("/user", upload.generateUserSignature);
router.get("/teacher", upload.generateTeacherSignature);

module.exports = router;

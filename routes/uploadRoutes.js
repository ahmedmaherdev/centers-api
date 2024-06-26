const express = require("express");
const router = express.Router();
const upload = require("../controllers/uploadController");
const protect = require("../middlewares/protectMiddleware");

router.use(protect);

router.get("/user", upload.generateUserSignature);
router.get("/teacher", upload.generateTeacherSignature);
router.get("/exam", upload.generateExamSignature);

module.exports = router;

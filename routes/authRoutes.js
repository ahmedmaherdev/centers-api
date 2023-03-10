const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const protect = require("../controllers/authController/protect");

router.post("/signup", auth.signup);

router.post("/login", auth.login);
router.get("/logout", auth.logout);

router.patch("/forgetPassword", auth.forgetPassword);
router.patch("/resetPassword/:token", auth.resetPassword);

router.use(protect);
router.patch("/updatePassword", auth.updatePassword);

module.exports = router;

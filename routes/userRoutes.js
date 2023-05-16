const express = require("express");
const router = express.Router();
const users = require("../controllers/userController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../controllers/authController/protect");

router.use(protect);

router.get("/getMe", users.getMeMiddleware, users.getMe);
router.patch("/updateMe", users.updateMeMiddleware, users.updateMe);
router.patch(
  "/updateMyPhoto",
  users.updateMyPhotoMiddleware,
  users.updateMyPhoto
);
router.patch(
  "/updateMeAsStudent",
  users.updateMeAsStudentMiddleware,
  users.updateMeAsStudent
);
router.delete("/deleteMe", users.deleteMeMiddleware, users.deleteMe);

router.patch(
  "/addMyDeviceToken",
  users.addMydeviceTokenMiddleware,
  users.addMydeviceToken
);

router.use(restrictTo("admin"));
router
  .route("/")
  .get(users.getAllUsers)
  .post(users.createUserMiddleware, users.createUser)
  .patch(users.suspendUser);

router.get("/search", users.searchUser);
router
  .route("/:id")
  .get(users.getUser)
  .patch(users.updateUserMiddleware, users.updateUser)
  .delete(users.deleteUser);

module.exports = router;

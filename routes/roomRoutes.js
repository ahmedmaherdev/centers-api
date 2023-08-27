const protect = require("../middlewares/protectMiddleware");
const restrictTo = require("../utils/restrictTo");
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.use(protect);

router.get("/getMyRoom", restrictTo("student"), chatController.getStudentRoom);
router.get("/", restrictTo("manager", "admin"), chatController.getAllRooms);

router.use(chatController.checkRoom);
router.get(
  "/rooms/:roomId/messages",
  chatController.getAllMessagesMiddleware,
  chatController.getAllMessages
);
router
  .route("/rooms/:roomId/messages/:id")
  .get(chatController.getMessage)
  .delete(restrictTo("admin"), chatController.deleteMessage);

module.exports = router;

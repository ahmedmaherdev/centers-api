const express = require("express");
const router = express.Router();
const subscribes = require("../controllers/subscribeController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../middlewares/protectMiddleware");

router.use(protect);
router.use(restrictTo("admin"));

router.get("/", subscribes.getAllSubscribes);
router.get("/:id", subscribes.getSubscribe);

router.post(
  "/",
  subscribes.createSubscribeMiddleware,
  subscribes.createSubscribe,
  subscribes.createSubscribeNotification
);
router.delete("/:id", subscribes.deleteSubscribe);

module.exports = router;

const express = require("express");
const router = express.Router();
const advertisements = require("../controllers/advertisementController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../controllers/authController/protect");

router.use(protect);

router.get("/", advertisements.getAllAdvertisements);
router.get("/:id", advertisements.getAdvertisement);

router.use(restrictTo("admin", "manager"));
router.post(
  "/",
  advertisements.createAdvertisementMiddleware,
  advertisements.createAdvertisement
);
router
  .route("/:id")
  .patch(
    advertisements.updateAdvertisementMiddleware,
    advertisements.updateAdvertisement
  )
  .delete(advertisements.deleteAdvertisement);

module.exports = router;

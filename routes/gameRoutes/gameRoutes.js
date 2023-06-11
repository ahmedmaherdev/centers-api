const express = require("express");
const router = express.Router();
const games = require("../../controllers/gameController");
const restrictTo = require("../../utils/restrictTo");
const protect = require("../../controllers/authController/protect");
const questions = require("./gameQuestionRoutes");

router.use("/:examId/questions", questions);

router.use(protect);
router.get("/", games.getAllGamesMiddleware, games.getAllGames);
router.get("/:id", games.getGame);

router.use(restrictTo("admin", "manager"));
router.post("/", games.createGameMiddleware, games.createGame);
router
  .route("/:id")
  .patch(games.updateGameMiddleware, games.updateGame)
  .delete(games.deleteGame);

module.exports = router;

const express = require("express");
const router = express.Router();
const notes = require("../controllers/noteController");
const restrictTo = require("../utils/restrictTo");
const protect = require("../middlewares/protectMiddleware");

router.use(protect);

router.get("/", notes.getAllNotes);
router.get("/:id", notes.getNote);

router.use(restrictTo("admin", "manager"));
router.post(
  "/",
  notes.createNoteMiddleware,
  notes.createNote,
  notes.createNoteNotification
);
router
  .route("/:id")
  .patch(notes.updateNoteMiddleware, notes.updateNote)
  .delete(notes.deleteNote);

module.exports = router;

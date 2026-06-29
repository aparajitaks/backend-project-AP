const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const { validateRequiredFields } = require("../middleware/validate");
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  togglePin,
  toggleArchive,
  restoreNote,
  getTrash,
} = require("../controllers/noteController");

// All note routes are protected
router.use(authenticate);

// GET /api/notes/trash — must be before /:id to avoid conflict
router.get("/trash", getTrash);

// CRUD
router.post("/", validateRequiredFields(["title"]), createNote);
router.get("/", getNotes);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

// Special actions
router.patch("/:id/pin", togglePin);
router.patch("/:id/archive", toggleArchive);
router.patch("/:id/restore", restoreNote);

module.exports = router;

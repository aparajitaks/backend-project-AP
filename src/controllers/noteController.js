const prisma = require("../config/db");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Find a note that belongs to the authenticated user.
 * Returns null if not found or does not belong to the user.
 */
const findUserNote = async (noteId, userId, includeDeleted = false) => {
  return prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
      ...(includeDeleted ? {} : { isDeleted: false }),
    },
  });
};

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /api/notes
 * Create a new note for the authenticated user.
 */
const createNote = async (req, res, next) => {
  try {
    const { title, content, tags, isPinned } = req.body;

    const note = await prisma.note.create({
      data: {
        title,
        content: content || "",
        tags: tags || [],
        isPinned: isPinned || false,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Note created successfully.",
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notes
 * Retrieve all non-deleted notes for the authenticated user.
 *
 * Query params:
 *   - search   : search notes by title (case-insensitive)
 *   - tags     : filter by tags (comma-separated, e.g. "work,personal")
 *   - sortBy   : sort by "createdAt" or "updatedAt" (default: "updatedAt")
 *   - order    : "asc" or "desc" (default: "desc")
 *   - pinned   : filter by isPinned ("true" / "false")
 *   - archived : filter by isArchived ("true" / "false")
 */
const getNotes = async (req, res, next) => {
  try {
    const { search, tags, sortBy, order, pinned, archived } = req.query;

    // Build the where clause
    const where = {
      userId: req.user.id,
      isDeleted: false,
    };

    // Search by title (case-insensitive for PostgreSQL)
    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Filter by tags — match notes that contain ALL specified tags (JSON array)
    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      where.tags = {
        array_contains: tagList,
      };
    }

    // Filter by pinned status
    if (pinned === "true") where.isPinned = true;
    if (pinned === "false") where.isPinned = false;

    // Filter by archived status
    if (archived === "true") where.isArchived = true;
    if (archived === "false") where.isArchived = false;

    // Sorting
    const validSortFields = ["createdAt", "updatedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "updatedAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const notes = await prisma.note.findMany({
      where,
      orderBy: [
        { isPinned: "desc" }, // Pinned notes always appear first
        { [sortField]: sortOrder },
      ],
    });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: { notes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notes/:id
 * Retrieve a single note by ID.
 */
const getNoteById = async (req, res, next) => {
  try {
    const note = await findUserNote(req.params.id, req.user.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notes/:id
 * Update a note's title, content, and/or tags.
 */
const updateNote = async (req, res, next) => {
  try {
    const existing = await findUserNote(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const { title, content, tags, isPinned, isArchived } = req.body;

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isArchived !== undefined && { isArchived }),
      },
    });

    res.status(200).json({
      success: true,
      message: "Note updated successfully.",
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notes/:id
 * Soft-delete a note (sets isDeleted = true).
 */
const deleteNote = async (req, res, next) => {
  try {
    const existing = await findUserNote(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: { isDeleted: true },
    });

    res.status(200).json({
      success: true,
      message: "Note moved to trash.",
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notes/:id/pin
 * Toggle the isPinned status of a note.
 */
const togglePin = async (req, res, next) => {
  try {
    const existing = await findUserNote(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: { isPinned: !existing.isPinned },
    });

    res.status(200).json({
      success: true,
      message: note.isPinned ? "Note pinned." : "Note unpinned.",
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notes/:id/archive
 * Toggle the isArchived status of a note.
 */
const toggleArchive = async (req, res, next) => {
  try {
    const existing = await findUserNote(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: { isArchived: !existing.isArchived },
    });

    res.status(200).json({
      success: true,
      message: note.isArchived ? "Note archived." : "Note unarchived.",
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notes/:id/restore
 * Restore a soft-deleted note.
 */
const restoreNote = async (req, res, next) => {
  try {
    const existing = await findUserNote(req.params.id, req.user.id, true);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    if (!existing.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Note is not in trash.",
      });
    }

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: { isDeleted: false },
    });

    res.status(200).json({
      success: true,
      message: "Note restored from trash.",
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notes/trash
 * Retrieve all soft-deleted notes for the authenticated user.
 */
const getTrash = async (req, res, next) => {
  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: req.user.id,
        isDeleted: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: { notes },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  togglePin,
  toggleArchive,
  restoreNote,
  getTrash,
};

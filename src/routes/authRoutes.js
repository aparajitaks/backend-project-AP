const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const authenticate = require("../middleware/auth");
const { validateRequiredFields, validateEmailFormat } = require("../middleware/validate");

// POST /api/auth/register
router.post("/register", validateRequiredFields(["email", "password", "name"]), validateEmailFormat, register);

// POST /api/auth/login
router.post("/login", validateRequiredFields(["email", "password"]), login);

// GET /api/auth/me — protected
router.get("/me", authenticate, getMe);

module.exports = router;

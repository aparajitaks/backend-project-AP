/**
 * Validates that the request body contains the required fields.
 * @param {string[]} fields - Array of required field names.
 */
const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(
      (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === ""
    );

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Validates that the email field in the request body has a valid format if present.
 */
const validateEmailFormat = (req, res, next) => {
  const { email } = req.body;
  if (email !== undefined && email !== null) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address format.",
      });
    }
  }
  next();
};

module.exports = { validateRequiredFields, validateEmailFormat };

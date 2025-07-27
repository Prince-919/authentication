const { validationResult } = require("express-validator");

exports.isFieldErrorFree = async (req, res) => {
  const errors = await validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
};

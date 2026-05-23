const express = require("express");
const {
  requestPasswordReset,
  confirmPasswordReset,
} = require("../controllers/password.controller");

const router = express.Router();

router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", confirmPasswordReset);

module.exports = router;

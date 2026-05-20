const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const { simulatePayment } = require("../controllers/payments.controller");

const router = express.Router();

router.post(
  "/simulate",
  authenticateToken,
  authorizeRoles("cliente"),
  simulatePayment,
);

module.exports = router;

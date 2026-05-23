const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
} = require("../controllers/admin-users.controller");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("administrador"),
  getAllUsers,
);
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("administrador"),
  getUserById,
);
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("administrador"),
  updateUserStatus,
);

module.exports = router;

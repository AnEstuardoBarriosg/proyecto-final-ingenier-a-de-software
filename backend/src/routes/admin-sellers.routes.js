const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  getAllSellers,
  getSellerById,
  updateSellerApprovalStatus,
} = require("../controllers/admin-sellers.controller");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("administrador"),
  getAllSellers,
);
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("administrador"),
  getSellerById,
);
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("administrador"),
  updateSellerApprovalStatus,
);

module.exports = router;

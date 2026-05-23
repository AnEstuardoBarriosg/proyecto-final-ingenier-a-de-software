const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
} = require("../controllers/admin.controller");

const router = express.Router();

router.get(
  "/orders",
  authenticateToken,
  authorizeRoles("administrador"),
  getAllOrders,
);
router.get(
  "/orders/:id",
  authenticateToken,
  authorizeRoles("administrador"),
  getOrderByIdAdmin,
);
router.patch(
  "/orders/:id/status",
  authenticateToken,
  authorizeRoles("administrador"),
  updateOrderStatus,
);

module.exports = router;

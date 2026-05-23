const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  getSellerOrders,
  getSellerOrderById,
} = require("../controllers/seller-orders.controller");

const router = express.Router();

router.get("/", authenticateToken, authorizeRoles("vendedor"), getSellerOrders);
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("vendedor"),
  getSellerOrderById,
);

module.exports = router;

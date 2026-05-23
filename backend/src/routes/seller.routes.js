const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  getMyProducts,
  createProduct,
  updateProduct,
  updateStock,
} = require("../controllers/seller.controller");

const router = express.Router();

router.get(
  "/products",
  authenticateToken,
  authorizeRoles("vendedor"),
  getMyProducts,
);
router.post(
  "/products",
  authenticateToken,
  authorizeRoles("vendedor"),
  createProduct,
);
router.put(
  "/products/:id",
  authenticateToken,
  authorizeRoles("vendedor"),
  updateProduct,
);
router.patch(
  "/products/:id/stock",
  authenticateToken,
  authorizeRoles("vendedor"),
  updateStock,
);

module.exports = router;

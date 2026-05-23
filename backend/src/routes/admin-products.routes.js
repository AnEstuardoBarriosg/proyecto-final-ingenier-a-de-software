const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  getAllProductsAdmin,
  getProductByIdAdmin,
  updateProductStatusAdmin,
} = require("../controllers/admin-products.controller");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("administrador"),
  getAllProductsAdmin,
);
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("administrador"),
  getProductByIdAdmin,
);
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("administrador"),
  updateProductStatusAdmin,
);

module.exports = router;

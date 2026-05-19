const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
    getCart,
    addItemToCart,
    updateCartItem,
    deleteCartItem,
} = require("../controllers/cart.controller");

const router = express.Router();

router.get("/", authenticateToken, authorizeRoles("cliente"), getCart);
router.post(
    "/items",
    authenticateToken,
    authorizeRoles("cliente"),
    addItemToCart,
);
router.put(
    "/items/:id",
    authenticateToken,
    authorizeRoles("cliente"),
    updateCartItem,
);
router.delete(
    "/items/:id",
    authenticateToken,
    authorizeRoles("cliente"),
    deleteCartItem,
);

module.exports = router;

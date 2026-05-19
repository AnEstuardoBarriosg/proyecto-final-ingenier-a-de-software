const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
    createOrder,
    getMyOrders,
    getOrderById,
} = require("../controllers/orders.controller");

const router = express.Router();

router.post("/", authenticateToken, authorizeRoles("cliente"), createOrder);
router.get(
    "/my-orders",
    authenticateToken,
    authorizeRoles("cliente"),
    getMyOrders,
);
router.get("/:id", authenticateToken, authorizeRoles("cliente"), getOrderById);

module.exports = router;

const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const router = express.Router();

router.get("/profile", authenticateToken, (req, res) => {
    res.json({
        ok: true,
        message: "Ruta protegida accesible",
        user: req.user,
    });
});

router.get(
    "/cliente-only",
    authenticateToken,
    authorizeRoles("cliente"),
    (req, res) => {
        res.json({
            ok: true,
            message: "Ruta solo para clientes",
        });
    },
);

module.exports = router;

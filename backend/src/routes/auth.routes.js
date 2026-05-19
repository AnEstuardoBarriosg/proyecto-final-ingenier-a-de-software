const express = require('express');
const { register, login } = require("../controllers/auth.controller");

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({
    ok: true,
    message: 'Ruta de autenticación funcionando'
  });
});

router.post("/register", register);
router.post("/login", login);

module.exports = router;
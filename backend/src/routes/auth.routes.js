const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login } = require("../controllers/auth.controller");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.'
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Demasiados registros desde esta IP. Intenta en una hora.'
  }
});

router.get('/test', (req, res) => {
  res.json({
    ok: true,
    message: 'Ruta de autenticación funcionando'
  });
});

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);

module.exports = router;
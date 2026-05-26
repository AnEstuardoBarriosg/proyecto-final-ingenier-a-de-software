const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const pool = require("../db/pool");

const router = express.Router();

/* GET /addresses — lista las direcciones del usuario autenticado */
router.get("/", authenticateToken, authorizeRoles("cliente"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_direccion, direccion_linea, ciudad, referencia, codigo_postal, es_principal
       FROM direcciones
       WHERE id_usuario = $1
       ORDER BY es_principal DESC, id_direccion DESC`,
      [req.user.id_usuario]
    );
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/* POST /addresses — crea una nueva dirección para el usuario autenticado */
router.post("/", authenticateToken, authorizeRoles("cliente"), async (req, res) => {
  const { direccion_linea, ciudad, referencia, codigo_postal, es_principal } = req.body;

  if (!direccion_linea?.trim()) {
    return res.status(400).json({ ok: false, message: "La dirección es obligatoria" });
  }
  if (!ciudad?.trim()) {
    return res.status(400).json({ ok: false, message: "La ciudad es obligatoria" });
  }

  try {
    // Si se marca como principal, desmarcar las otras
    if (es_principal) {
      await pool.query(
        "UPDATE direcciones SET es_principal = FALSE WHERE id_usuario = $1",
        [req.user.id_usuario]
      );
    }

    const result = await pool.query(
      `INSERT INTO direcciones (id_usuario, direccion_linea, ciudad, referencia, codigo_postal, es_principal)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_direccion, direccion_linea, ciudad, referencia, codigo_postal, es_principal`,
      [
        req.user.id_usuario,
        direccion_linea.trim(),
        ciudad.trim(),
        referencia?.trim() || null,
        codigo_postal?.trim() || null,
        es_principal ?? false,
      ]
    );

    res.status(201).json({ ok: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

module.exports = router;

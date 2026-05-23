const crypto = require("crypto");
const bcrypt = require("bcrypt");
const pool = require("../db/pool");

const requestPasswordReset = async ({ correo }) => {
  if (!correo) {
    throw new Error("El correo es obligatorio");
  }

  const userResult = await pool.query(
    `
    SELECT id_usuario, correo
    FROM usuarios
    WHERE correo = $1
    LIMIT 1
    `,
    [correo],
  );

  if (userResult.rows.length === 0) {
    throw new Error("No existe un usuario con ese correo");
  }

  const user = userResult.rows[0];
  const resetToken = crypto.randomBytes(24).toString("hex");

  await pool.query(
    `
    UPDATE usuarios
    SET reset_token = $1,
        reset_token_expira = NOW() + INTERVAL '15 minutes'
    WHERE id_usuario = $2
    `,
    [resetToken, user.id_usuario],
  );

  return {
    correo: user.correo,
    reset_token: resetToken,
    mensaje: "Token de recuperación generado con vigencia de 15 minutos",
  };
};

const confirmPasswordReset = async ({ correo, token, nueva_password }) => {
  if (!correo || !token || !nueva_password) {
    throw new Error("correo, token y nueva_password son obligatorios");
  }

  if (nueva_password.length < 8) {
    throw new Error("La nueva contraseña debe tener al menos 8 caracteres");
  }

  const userResult = await pool.query(
    `
    SELECT id_usuario, reset_token, reset_token_expira
    FROM usuarios
    WHERE correo = $1
    LIMIT 1
    `,
    [correo],
  );

  if (userResult.rows.length === 0) {
    throw new Error("No existe un usuario con ese correo");
  }

  const user = userResult.rows[0];

  if (!user.reset_token || !user.reset_token_expira) {
    throw new Error("No existe un proceso de recuperación activo");
  }

  if (user.reset_token !== token) {
    throw new Error("El token no es válido");
  }

  const isExpired = await pool.query(
    `
    SELECT NOW() > $1 AS expirado
    `,
    [user.reset_token_expira],
  );

  if (isExpired.rows[0].expirado) {
    throw new Error("El token ya expiró");
  }

  const passwordHash = await bcrypt.hash(nueva_password, 10);

  await pool.query(
    `
    UPDATE usuarios
    SET password_hash = $1,
        reset_token = NULL,
        reset_token_expira = NULL
    WHERE id_usuario = $2
    `,
    [passwordHash, user.id_usuario],
  );

  return {
    correo,
    mensaje: "La contraseña fue restablecida correctamente",
  };
};

module.exports = {
  requestPasswordReset,
  confirmPasswordReset,
};

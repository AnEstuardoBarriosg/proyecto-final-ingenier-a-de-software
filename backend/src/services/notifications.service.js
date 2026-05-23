const pool = require("../db/pool");

const createNotification = async ({ id_usuario, titulo, mensaje }) => {
  if (!id_usuario || !titulo || !mensaje) {
    throw new Error("id_usuario, titulo y mensaje son obligatorios");
  }

  const result = await pool.query(
    `
    INSERT INTO notificaciones (id_usuario, titulo, mensaje)
    VALUES ($1, $2, $3)
    RETURNING id_notificacion, id_usuario, titulo, mensaje, leida, fecha_creacion
    `,
    [id_usuario, titulo, mensaje],
  );

  return result.rows[0];
};

const getMyNotifications = async (idUsuario) => {
  const result = await pool.query(
    `
    SELECT
      id_notificacion,
      titulo,
      mensaje,
      leida,
      fecha_creacion
    FROM notificaciones
    WHERE id_usuario = $1
    ORDER BY fecha_creacion DESC, id_notificacion DESC
    `,
    [idUsuario],
  );

  return result.rows;
};

const markAsRead = async (idUsuario, idNotificacion) => {
  const existing = await pool.query(
    `
    SELECT id_notificacion, leida
    FROM notificaciones
    WHERE id_notificacion = $1 AND id_usuario = $2
    LIMIT 1
    `,
    [idNotificacion, idUsuario],
  );

  if (existing.rows.length === 0) {
    throw new Error("La notificación no existe o no pertenece al usuario");
  }

  const result = await pool.query(
    `
    UPDATE notificaciones
    SET leida = TRUE
    WHERE id_notificacion = $1
    RETURNING id_notificacion, titulo, mensaje, leida, fecha_creacion
    `,
    [idNotificacion],
  );

  return result.rows[0];
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
};

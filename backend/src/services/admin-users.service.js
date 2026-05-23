const pool = require("../db/pool");

const getAllUsers = async () => {
  const result = await pool.query(
    `
    SELECT
      u.id_usuario,
      u.nombre_completo,
      u.correo,
      u.telefono,
      u.estado,
      r.nombre AS rol
    FROM usuarios u
    INNER JOIN roles r ON u.id_rol = r.id_rol
    ORDER BY u.id_usuario DESC
    `,
  );

  return result.rows;
};

const getUserById = async (idUsuario) => {
  const userResult = await pool.query(
    `
    SELECT
      u.id_usuario,
      u.nombre_completo,
      u.correo,
      u.telefono,
      u.estado,
      r.nombre AS rol
    FROM usuarios u
    INNER JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.id_usuario = $1
    LIMIT 1
    `,
    [idUsuario],
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  const user = userResult.rows[0];

  if (user.rol === "vendedor") {
    const sellerResult = await pool.query(
      `
      SELECT
        id_vendedor,
        nombre_tienda,
        descripcion,
        estado_aprobacion
      FROM vendedores
      WHERE id_usuario = $1
      LIMIT 1
      `,
      [idUsuario],
    );

    user.vendedor = sellerResult.rows[0] || null;
  }

  return user;
};

const updateUserStatus = async (idUsuario, { estado }) => {
  if (!estado) {
    throw new Error("El estado es obligatorio");
  }

  const estadosValidos = ["activo", "inactivo"];

  if (!estadosValidos.includes(estado)) {
    throw new Error("El estado enviado no es válido");
  }

  const existingUser = await pool.query(
    `
    SELECT id_usuario, estado
    FROM usuarios
    WHERE id_usuario = $1
    LIMIT 1
    `,
    [idUsuario],
  );

  if (existingUser.rows.length === 0) {
    throw new Error("El usuario no existe");
  }

  const result = await pool.query(
    `
    UPDATE usuarios
    SET estado = $1
    WHERE id_usuario = $2
    RETURNING id_usuario, nombre_completo, correo, telefono, estado
    `,
    [estado, idUsuario],
  );

  return {
    estado_anterior: existingUser.rows[0].estado,
    usuario: result.rows[0],
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
};

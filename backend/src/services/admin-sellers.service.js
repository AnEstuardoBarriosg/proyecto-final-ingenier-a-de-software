const pool = require("../db/pool");

const getAllSellers = async () => {
  const result = await pool.query(
    `
    SELECT
      v.id_vendedor,
      v.id_usuario,
      u.nombre_completo,
      u.correo,
      u.telefono,
      v.nombre_tienda,
      v.descripcion,
      v.estado_aprobacion
    FROM vendedores v
    INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
    ORDER BY v.id_vendedor DESC
    `,
  );

  return result.rows;
};

const getSellerById = async (idVendedor) => {
  const sellerResult = await pool.query(
    `
    SELECT
      v.id_vendedor,
      v.id_usuario,
      u.nombre_completo,
      u.correo,
      u.telefono,
      v.nombre_tienda,
      v.descripcion,
      v.estado_aprobacion
    FROM vendedores v
    INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
    WHERE v.id_vendedor = $1
    LIMIT 1
    `,
    [idVendedor],
  );

  if (sellerResult.rows.length === 0) {
    return null;
  }

  const productsResult = await pool.query(
    `
    SELECT
      id_producto,
      nombre,
      precio,
      stock,
      estado
    FROM productos
    WHERE id_vendedor = $1
    ORDER BY id_producto DESC
    `,
    [idVendedor],
  );

  const seller = sellerResult.rows[0];
  seller.productos = productsResult.rows;

  return seller;
};

const updateSellerApprovalStatus = async (
  idVendedor,
  { estado_aprobacion },
) => {
  if (!estado_aprobacion) {
    throw new Error("El estado_aprobacion es obligatorio");
  }

  const estadosValidos = ["pendiente", "aprobado", "rechazado"];

  if (!estadosValidos.includes(estado_aprobacion)) {
    throw new Error("El estado de aprobación no es válido");
  }

  const existingSeller = await pool.query(
    `
    SELECT id_vendedor, estado_aprobacion
    FROM vendedores
    WHERE id_vendedor = $1
    LIMIT 1
    `,
    [idVendedor],
  );

  if (existingSeller.rows.length === 0) {
    throw new Error("El vendedor no existe");
  }

  const result = await pool.query(
    `
    UPDATE vendedores
    SET estado_aprobacion = $1
    WHERE id_vendedor = $2
    RETURNING id_vendedor, id_usuario, nombre_tienda, estado_aprobacion
    `,
    [estado_aprobacion, idVendedor],
  );

  return {
    estado_anterior: existingSeller.rows[0].estado_aprobacion,
    vendedor: result.rows[0],
  };
};

module.exports = {
  getAllSellers,
  getSellerById,
  updateSellerApprovalStatus,
};

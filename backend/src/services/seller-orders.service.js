const pool = require("../db/pool");

const getSellerIdByUserId = async (idUsuario) => {
  const result = await pool.query(
    `
    SELECT id_vendedor
    FROM vendedores
    WHERE id_usuario = $1
    LIMIT 1
    `,
    [idUsuario],
  );

  if (result.rows.length === 0) {
    throw new Error("El usuario no tiene perfil de vendedor");
  }

  return result.rows[0].id_vendedor;
};

const getOrdersBySeller = async (idUsuario) => {
  const idVendedor = await getSellerIdByUserId(idUsuario);

  const result = await pool.query(
    `
    SELECT DISTINCT
      p.id_pedido,
      p.id_usuario,
      u.nombre_completo,
      u.correo,
      p.total,
      p.estado,
      p.fecha_pedido
    FROM pedidos p
    INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
    INNER JOIN pedido_detalles pd ON p.id_pedido = pd.id_pedido
    INNER JOIN productos pr ON pd.id_producto = pr.id_producto
    WHERE pr.id_vendedor = $1
    ORDER BY p.fecha_pedido DESC, p.id_pedido DESC
    `,
    [idVendedor],
  );

  return result.rows;
};

const getOrderDetailBySeller = async (idUsuario, idPedido) => {
  const idVendedor = await getSellerIdByUserId(idUsuario);

  const orderResult = await pool.query(
    `
    SELECT DISTINCT
      p.id_pedido,
      p.id_usuario,
      u.nombre_completo,
      u.correo,
      p.total,
      p.estado,
      p.fecha_pedido
    FROM pedidos p
    INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
    INNER JOIN pedido_detalles pd ON p.id_pedido = pd.id_pedido
    INNER JOIN productos pr ON pd.id_producto = pr.id_producto
    WHERE p.id_pedido = $1
      AND pr.id_vendedor = $2
    LIMIT 1
    `,
    [idPedido, idVendedor],
  );

  if (orderResult.rows.length === 0) {
    return null;
  }

  const detailsResult = await pool.query(
    `
    SELECT
      pd.id_detalle_pedido,
      pd.id_producto,
      pr.nombre,
      pd.cantidad,
      pd.precio_unitario,
      pd.subtotal
    FROM pedido_detalles pd
    INNER JOIN productos pr ON pd.id_producto = pr.id_producto
    WHERE pd.id_pedido = $1
      AND pr.id_vendedor = $2
    ORDER BY pd.id_detalle_pedido ASC
    `,
    [idPedido, idVendedor],
  );

  const order = orderResult.rows[0];
  order.detalles = detailsResult.rows;

  return order;
};

module.exports = {
  getOrdersBySeller,
  getOrderDetailBySeller,
};

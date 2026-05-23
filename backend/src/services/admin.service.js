const pool = require("../db/pool");
const notificationsService = require("./notifications.service");

const getAllOrders = async () => {
  const result = await pool.query(
    `
    SELECT
      p.id_pedido,
      p.id_usuario,
      u.nombre_completo,
      u.correo,
      p.total,
      p.estado,
      p.fecha_pedido
    FROM pedidos p
    INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
    ORDER BY p.fecha_pedido DESC, p.id_pedido DESC
    `,
  );

  return result.rows;
};

const getOrderById = async (idPedido) => {
  const orderResult = await pool.query(
    `
    SELECT
      p.id_pedido,
      p.id_usuario,
      u.nombre_completo,
      u.correo,
      p.id_direccion,
      p.total,
      p.estado,
      p.fecha_pedido,
      d.direccion_linea,
      d.ciudad,
      d.referencia,
      d.codigo_postal
    FROM pedidos p
    INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
    INNER JOIN direcciones d ON p.id_direccion = d.id_direccion
    WHERE p.id_pedido = $1
    LIMIT 1
    `,
    [idPedido],
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
    ORDER BY pd.id_detalle_pedido ASC
    `,
    [idPedido],
  );

  const paymentResult = await pool.query(
    `
    SELECT
      id_pago,
      metodo_pago,
      referencia_externa,
      monto,
      estado_pago,
      fecha_pago
    FROM pagos
    WHERE id_pedido = $1
    ORDER BY id_pago DESC
    LIMIT 1
    `,
    [idPedido],
  );

  const order = orderResult.rows[0];
  order.detalles = detailsResult.rows;
  order.pago = paymentResult.rows[0] || null;

  return order;
};

const updateOrderStatus = async (idPedido, { estado }) => {
  if (!estado) {
    throw new Error("El estado es obligatorio");
  }

  const estadosValidos = [
    "pendiente_pago",
    "pendiente_confirmacion_pago",
    "pagado",
    "pago_rechazado",
    "en_proceso",
    "enviado",
    "entregado",
    "cancelado",
  ];

  if (!estadosValidos.includes(estado)) {
    throw new Error("El estado enviado no es válido");
  }

  const existingOrder = await pool.query(
    `
    SELECT id_pedido, id_usuario, estado
    FROM pedidos
    WHERE id_pedido = $1
    LIMIT 1
    `,
    [idPedido],
  );

  if (existingOrder.rows.length === 0) {
    throw new Error("El pedido no existe");
  }

  const result = await pool.query(
    `
    UPDATE pedidos
    SET estado = $1
    WHERE id_pedido = $2
    RETURNING id_pedido, total, estado, fecha_pedido
    `,
    [estado, idPedido],
  );

  await notificationsService.createNotification({
    id_usuario: existingOrder.rows[0].id_usuario,
    titulo: "Estado de pedido actualizado",
    mensaje: `Tu pedido #${idPedido} cambió de estado a ${estado}.`,
  });

  return {
    estado_anterior: existingOrder.rows[0].estado,
    pedido: result.rows[0],
  };
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};

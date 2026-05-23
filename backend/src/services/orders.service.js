const pool = require("../db/pool");
const notificationsService = require("./notifications.service");

const createOrder = async (idUsuario, { id_direccion }) => {
  if (!id_direccion) {
    throw new Error("La dirección es obligatoria para crear el pedido");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const addressResult = await client.query(
      `
      SELECT id_direccion, id_usuario
      FROM direcciones
      WHERE id_direccion = $1 AND id_usuario = $2
      LIMIT 1
      `,
      [id_direccion, idUsuario],
    );

    if (addressResult.rows.length === 0) {
      throw new Error("La dirección no existe o no pertenece al usuario");
    }

    const cartResult = await client.query(
      `
      SELECT id_carrito
      FROM carritos
      WHERE id_usuario = $1 AND estado = 'activo'
      ORDER BY id_carrito DESC
      LIMIT 1
      `,
      [idUsuario],
    );

    if (cartResult.rows.length === 0) {
      throw new Error("No existe un carrito activo para el usuario");
    }

    const id_carrito = cartResult.rows[0].id_carrito;

    const itemsResult = await client.query(
      `
      SELECT 
        cd.id_producto,
        cd.cantidad,
        cd.precio_unitario,
        (cd.cantidad * cd.precio_unitario) AS subtotal
      FROM carrito_detalles cd
      WHERE cd.id_carrito = $1
      ORDER BY cd.id_detalle_carrito ASC
      `,
      [id_carrito],
    );

    if (itemsResult.rows.length === 0) {
      throw new Error("El carrito está vacío");
    }

    const total = itemsResult.rows.reduce((acc, item) => {
      return acc + Number(item.subtotal);
    }, 0);

    const orderResult = await client.query(
      `
      INSERT INTO pedidos (id_usuario, id_direccion, total, estado)
      VALUES ($1, $2, $3, $4)
      RETURNING id_pedido, id_usuario, id_direccion, total, estado, fecha_pedido
      `,
      [idUsuario, id_direccion, total, "pendiente_pago"],
    );

    const order = orderResult.rows[0];

    for (const item of itemsResult.rows) {
      await client.query(
        `
        INSERT INTO pedido_detalles (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          order.id_pedido,
          item.id_producto,
          item.cantidad,
          item.precio_unitario,
          item.subtotal,
        ],
      );

      await client.query(
        `
        UPDATE productos
        SET stock = stock - $1
        WHERE id_producto = $2
        `,
        [item.cantidad, item.id_producto],
      );
    }

    await client.query(
      `
      UPDATE carritos
      SET estado = 'cerrado'
      WHERE id_carrito = $1
      `,
      [id_carrito],
    );

    await notificationsService.createNotification({
      id_usuario: idUsuario,
      titulo: "Pedido creado",
      mensaje: `Tu pedido #${order.id_pedido} fue creado correctamente y está en estado ${order.estado}.`,
    });

    await client.query("COMMIT");

    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getOrdersByUser = async (idUsuario) => {
  const result = await pool.query(
    `
    SELECT 
      id_pedido,
      total,
      estado,
      fecha_pedido
    FROM pedidos
    WHERE id_usuario = $1
    ORDER BY fecha_pedido DESC
    `,
    [idUsuario],
  );

  return result.rows;
};

const getOrderDetail = async (idUsuario, idPedido) => {
  const orderResult = await pool.query(
    `
    SELECT 
      p.id_pedido,
      p.id_usuario,
      p.id_direccion,
      p.total,
      p.estado,
      p.fecha_pedido,
      d.direccion_linea,
      d.ciudad,
      d.referencia,
      d.codigo_postal
    FROM pedidos p
    INNER JOIN direcciones d ON p.id_direccion = d.id_direccion
    WHERE p.id_pedido = $1 AND p.id_usuario = $2
    LIMIT 1
    `,
    [idPedido, idUsuario],
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

  const order = orderResult.rows[0];
  order.detalles = detailsResult.rows;

  return order;
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrderDetail,
};

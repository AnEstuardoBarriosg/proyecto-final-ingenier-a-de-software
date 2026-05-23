const pool = require("../db/pool");

const createReview = async (
  idUsuario,
  { id_producto, calificacion, comentario },
) => {
  if (!id_producto || !calificacion) {
    throw new Error("id_producto y calificacion son obligatorios");
  }

  const rating = Number(calificacion);

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error("La calificación debe estar entre 1 y 5");
  }

  const productResult = await pool.query(
    `
    SELECT id_producto, nombre
    FROM productos
    WHERE id_producto = $1
    LIMIT 1
    `,
    [id_producto],
  );

  if (productResult.rows.length === 0) {
    throw new Error("El producto no existe");
  }

  const purchasedResult = await pool.query(
    `
    SELECT pd.id_detalle_pedido
    FROM pedido_detalles pd
    INNER JOIN pedidos p ON pd.id_pedido = p.id_pedido
    WHERE p.id_usuario = $1
      AND pd.id_producto = $2
    LIMIT 1
    `,
    [idUsuario, id_producto],
  );

  if (purchasedResult.rows.length === 0) {
    throw new Error("Solo puedes reseñar productos que ya compraste");
  }

  const existingReview = await pool.query(
    `
    SELECT id_resena
    FROM resenas
    WHERE id_producto = $1 AND id_usuario = $2
    LIMIT 1
    `,
    [id_producto, idUsuario],
  );

  if (existingReview.rows.length > 0) {
    throw new Error("Ya registraste una reseña para este producto");
  }

  const result = await pool.query(
    `
    INSERT INTO resenas (id_producto, id_usuario, calificacion, comentario)
    VALUES ($1, $2, $3, $4)
    RETURNING id_resena, id_producto, id_usuario, calificacion, comentario, fecha_resena
    `,
    [id_producto, idUsuario, rating, comentario || null],
  );

  return result.rows[0];
};

const getReviewsByProduct = async (idProducto) => {
  const productResult = await pool.query(
    `
    SELECT id_producto, nombre
    FROM productos
    WHERE id_producto = $1
    LIMIT 1
    `,
    [idProducto],
  );

  if (productResult.rows.length === 0) {
    throw new Error("El producto no existe");
  }

  const reviewsResult = await pool.query(
    `
    SELECT
      r.id_resena,
      r.id_producto,
      r.id_usuario,
      u.nombre_completo,
      r.calificacion,
      r.comentario,
      r.fecha_resena
    FROM resenas r
    INNER JOIN usuarios u ON r.id_usuario = u.id_usuario
    WHERE r.id_producto = $1
    ORDER BY r.fecha_resena DESC, r.id_resena DESC
    `,
    [idProducto],
  );

  const summaryResult = await pool.query(
    `
    SELECT
      COUNT(*)::int AS total_resenas,
      COALESCE(ROUND(AVG(calificacion)::numeric, 2), 0) AS promedio_calificacion
    FROM resenas
    WHERE id_producto = $1
    `,
    [idProducto],
  );

  return {
    producto: productResult.rows[0],
    resumen: summaryResult.rows[0],
    resenas: reviewsResult.rows,
  };
};

module.exports = {
  createReview,
  getReviewsByProduct,
};

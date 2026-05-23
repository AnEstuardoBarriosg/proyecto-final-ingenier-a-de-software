const pool = require("../db/pool");

const getAllProducts = async ({ search, category, minPrice, maxPrice }) => {
  let query = `
    SELECT 
      p.id_producto,
      p.nombre,
      p.descripcion,
      p.precio,
      p.stock,
      p.estado,
      c.nombre AS categoria,
      v.nombre_tienda,
      pi.url_imagen,
      COALESCE(COUNT(r.id_resena), 0)::int AS total_resenas,
      COALESCE(ROUND(AVG(r.calificacion)::numeric, 2), 0) AS promedio_calificacion
    FROM productos p
    INNER JOIN categorias c ON p.id_categoria = c.id_categoria
    INNER JOIN vendedores v ON p.id_vendedor = v.id_vendedor
    LEFT JOIN producto_imagenes pi 
      ON p.id_producto = pi.id_producto AND pi.es_principal = true
    LEFT JOIN resenas r
      ON p.id_producto = r.id_producto
    WHERE p.estado = 'activo'
  `;

  const values = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND LOWER(p.nombre) LIKE LOWER($${paramIndex})`;
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (category) {
    query += ` AND p.id_categoria = $${paramIndex}`;
    values.push(category);
    paramIndex++;
  }

  if (minPrice) {
    query += ` AND p.precio >= $${paramIndex}`;
    values.push(minPrice);
    paramIndex++;
  }

  if (maxPrice) {
    query += ` AND p.precio <= $${paramIndex}`;
    values.push(maxPrice);
    paramIndex++;
  }

  query += `
    GROUP BY
      p.id_producto,
      p.nombre,
      p.descripcion,
      p.precio,
      p.stock,
      p.estado,
      c.nombre,
      v.nombre_tienda,
      pi.url_imagen,
      p.fecha_creacion
    ORDER BY p.fecha_creacion DESC
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

const getProductById = async (id) => {
  const productResult = await pool.query(
    `
    SELECT 
      p.id_producto,
      p.nombre,
      p.descripcion,
      p.precio,
      p.stock,
      p.estado,
      c.id_categoria,
      c.nombre AS categoria,
      v.id_vendedor,
      v.nombre_tienda,
      v.descripcion AS descripcion_vendedor
    FROM productos p
    INNER JOIN categorias c ON p.id_categoria = c.id_categoria
    INNER JOIN vendedores v ON p.id_vendedor = v.id_vendedor
    WHERE p.id_producto = $1
    LIMIT 1
    `,
    [id],
  );

  if (productResult.rows.length === 0) {
    return null;
  }

  const imagesResult = await pool.query(
    `
    SELECT id_imagen, url_imagen, es_principal
    FROM producto_imagenes
    WHERE id_producto = $1
    ORDER BY es_principal DESC, id_imagen ASC
    `,
    [id],
  );

  const reviewsSummaryResult = await pool.query(
    `
    SELECT
      COUNT(*)::int AS total_resenas,
      COALESCE(ROUND(AVG(calificacion)::numeric, 2), 0) AS promedio_calificacion
    FROM resenas
    WHERE id_producto = $1
    `,
    [id],
  );

  const product = productResult.rows[0];
  product.imagenes = imagesResult.rows;
  product.resumen_resenas = reviewsSummaryResult.rows[0];

  return product;
};

module.exports = {
  getAllProducts,
  getProductById,
};

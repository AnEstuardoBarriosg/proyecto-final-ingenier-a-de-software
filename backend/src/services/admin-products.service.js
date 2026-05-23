const pool = require("../db/pool");

const getAllProducts = async () => {
  const result = await pool.query(
    `
    SELECT
      p.id_producto,
      p.nombre,
      p.descripcion,
      p.precio,
      p.stock,
      p.estado,
      c.nombre AS categoria,
      v.nombre_tienda
    FROM productos p
    INNER JOIN categorias c ON p.id_categoria = c.id_categoria
    INNER JOIN vendedores v ON p.id_vendedor = v.id_vendedor
    ORDER BY p.id_producto DESC
    `,
  );

  return result.rows;
};

const getProductById = async (idProducto) => {
  const productResult = await pool.query(
    `
    SELECT
      p.id_producto,
      p.id_vendedor,
      p.id_categoria,
      p.nombre,
      p.descripcion,
      p.precio,
      p.stock,
      p.estado,
      c.nombre AS categoria,
      v.nombre_tienda
    FROM productos p
    INNER JOIN categorias c ON p.id_categoria = c.id_categoria
    INNER JOIN vendedores v ON p.id_vendedor = v.id_vendedor
    WHERE p.id_producto = $1
    LIMIT 1
    `,
    [idProducto],
  );

  if (productResult.rows.length === 0) {
    return null;
  }

  const imagesResult = await pool.query(
    `
    SELECT
      id_imagen,
      url_imagen,
      es_principal
    FROM producto_imagenes
    WHERE id_producto = $1
    ORDER BY es_principal DESC, id_imagen ASC
    `,
    [idProducto],
  );

  const product = productResult.rows[0];
  product.imagenes = imagesResult.rows;

  return product;
};

const updateProductStatus = async (idProducto, { estado }) => {
  if (!estado) {
    throw new Error("El estado es obligatorio");
  }

  const estadosValidos = ["activo", "agotado", "inactivo"];

  if (!estadosValidos.includes(estado)) {
    throw new Error("El estado enviado no es válido");
  }

  const existingProduct = await pool.query(
    `
    SELECT id_producto, estado
    FROM productos
    WHERE id_producto = $1
    LIMIT 1
    `,
    [idProducto],
  );

  if (existingProduct.rows.length === 0) {
    throw new Error("El producto no existe");
  }

  const result = await pool.query(
    `
    UPDATE productos
    SET estado = $1
    WHERE id_producto = $2
    RETURNING id_producto, nombre, stock, estado
    `,
    [estado, idProducto],
  );

  return {
    estado_anterior: existingProduct.rows[0].estado,
    producto: result.rows[0],
  };
};

module.exports = {
  getAllProducts,
  getProductById,
  updateProductStatus,
};

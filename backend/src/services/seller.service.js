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

const getProductsBySeller = async (idUsuario) => {
  const idVendedor = await getSellerIdByUserId(idUsuario);

  const result = await pool.query(
    `
    SELECT
      p.id_producto,
      p.nombre,
      p.descripcion,
      p.precio,
      p.stock,
      p.estado,
      c.nombre AS categoria
    FROM productos p
    INNER JOIN categorias c ON p.id_categoria = c.id_categoria
    WHERE p.id_vendedor = $1
    ORDER BY p.id_producto DESC
    `,
    [idVendedor],
  );

  return result.rows;
};

const createProduct = async (
  idUsuario,
  { id_categoria, nombre, descripcion, precio, stock },
) => {
  if (
    !id_categoria ||
    !nombre ||
    !descripcion ||
    !precio ||
    stock === undefined
  ) {
    throw new Error("Todos los campos son obligatorios");
  }

  if (Number(precio) <= 0) {
    throw new Error("El precio debe ser mayor que cero");
  }

  if (Number(stock) < 0) {
    throw new Error("El stock no puede ser negativo");
  }

  const idVendedor = await getSellerIdByUserId(idUsuario);

  const categoryResult = await pool.query(
    `
    SELECT id_categoria
    FROM categorias
    WHERE id_categoria = $1
    LIMIT 1
    `,
    [id_categoria],
  );

  if (categoryResult.rows.length === 0) {
    throw new Error("La categoría no existe");
  }

  const result = await pool.query(
    `
    INSERT INTO productos (
      id_vendedor,
      id_categoria,
      nombre,
      descripcion,
      precio,
      stock,
      estado
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id_producto, id_vendedor, id_categoria, nombre, descripcion, precio, stock, estado
    `,
    [
      idVendedor,
      id_categoria,
      nombre,
      descripcion,
      precio,
      stock,
      stock === 0 ? "agotado" : "activo",
    ],
  );

  return result.rows[0];
};

const updateProduct = async (
  idUsuario,
  idProducto,
  { id_categoria, nombre, descripcion, precio, estado },
) => {
  const idVendedor = await getSellerIdByUserId(idUsuario);

  const existingProduct = await pool.query(
    `
    SELECT id_producto
    FROM productos
    WHERE id_producto = $1 AND id_vendedor = $2
    LIMIT 1
    `,
    [idProducto, idVendedor],
  );

  if (existingProduct.rows.length === 0) {
    throw new Error("El producto no existe o no pertenece al vendedor");
  }

  if (!id_categoria || !nombre || !descripcion || !precio || !estado) {
    throw new Error("Todos los campos son obligatorios");
  }

  if (Number(precio) <= 0) {
    throw new Error("El precio debe ser mayor que cero");
  }

  const result = await pool.query(
    `
    UPDATE productos
    SET id_categoria = $1,
        nombre = $2,
        descripcion = $3,
        precio = $4,
        estado = $5
    WHERE id_producto = $6
    RETURNING id_producto, id_categoria, nombre, descripcion, precio, stock, estado
    `,
    [id_categoria, nombre, descripcion, precio, estado, idProducto],
  );

  return result.rows[0];
};

const updateStock = async (idUsuario, idProducto, { stock }) => {
  const idVendedor = await getSellerIdByUserId(idUsuario);

  const existingProduct = await pool.query(
    `
    SELECT id_producto
    FROM productos
    WHERE id_producto = $1 AND id_vendedor = $2
    LIMIT 1
    `,
    [idProducto, idVendedor],
  );

  if (existingProduct.rows.length === 0) {
    throw new Error("El producto no existe o no pertenece al vendedor");
  }

  if (stock === undefined) {
    throw new Error("El stock es obligatorio");
  }

  if (Number(stock) < 0) {
    throw new Error("El stock no puede ser negativo");
  }

  const nuevoEstado = Number(stock) === 0 ? "agotado" : "activo";

  const result = await pool.query(
    `
    UPDATE productos
    SET stock = $1,
        estado = $2
    WHERE id_producto = $3
    RETURNING id_producto, nombre, stock, estado
    `,
    [stock, nuevoEstado, idProducto],
  );

  return result.rows[0];
};

module.exports = {
  getProductsBySeller,
  createProduct,
  updateProduct,
  updateStock,
};

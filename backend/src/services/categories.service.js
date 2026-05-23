const pool = require("../db/pool");

const getAllCategories = async () => {
  const result = await pool.query(
    `
    SELECT
      id_categoria,
      nombre,
      descripcion
    FROM categorias
    ORDER BY nombre ASC
    `,
  );

  return result.rows;
};

const getCategoryById = async (idCategoria) => {
  const result = await pool.query(
    `
    SELECT
      id_categoria,
      nombre,
      descripcion
    FROM categorias
    WHERE id_categoria = $1
    LIMIT 1
    `,
    [idCategoria],
  );

  return result.rows[0] || null;
};

module.exports = {
  getAllCategories,
  getCategoryById,
};

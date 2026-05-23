const categoriesService = require("../services/categories.service");

const getCategories = async (req, res) => {
  try {
    const result = await categoriesService.getAllCategories();

    res.status(200).json({
      ok: true,
      message: "Categorías obtenidas correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const result = await categoriesService.getCategoryById(req.params.id);

    if (!result) {
      return res.status(404).json({
        ok: false,
        message: "Categoría no encontrada",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Categoría obtenida correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
};

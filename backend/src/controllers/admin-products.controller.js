const adminProductsService = require("../services/admin-products.service");

const getAllProductsAdmin = async (req, res) => {
  try {
    const result = await adminProductsService.getAllProducts();

    res.status(200).json({
      ok: true,
      message: "Productos obtenidos correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const getProductByIdAdmin = async (req, res) => {
  try {
    const result = await adminProductsService.getProductById(req.params.id);

    if (!result) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Producto obtenido correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const updateProductStatusAdmin = async (req, res) => {
  try {
    const result = await adminProductsService.updateProductStatus(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      ok: true,
      message: "Estado del producto actualizado correctamente",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllProductsAdmin,
  getProductByIdAdmin,
  updateProductStatusAdmin,
};

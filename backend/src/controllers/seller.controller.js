const sellerService = require("../services/seller.service");

const getMyProducts = async (req, res) => {
  try {
    const result = await sellerService.getProductsBySeller(req.user.id_usuario);

    res.status(200).json({
      ok: true,
      message: "Productos del vendedor obtenidos correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const result = await sellerService.createProduct(
      req.user.id_usuario,
      req.body,
    );

    res.status(201).json({
      ok: true,
      message: "Producto registrado correctamente",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const result = await sellerService.updateProduct(
      req.user.id_usuario,
      req.params.id,
      req.body,
    );

    res.status(200).json({
      ok: true,
      message: "Producto actualizado correctamente",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

const updateStock = async (req, res) => {
  try {
    const result = await sellerService.updateStock(
      req.user.id_usuario,
      req.params.id,
      req.body,
    );

    res.status(200).json({
      ok: true,
      message: "Inventario actualizado correctamente",
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
  getMyProducts,
  createProduct,
  updateProduct,
  updateStock,
};

const adminSellersService = require("../services/admin-sellers.service");

const getAllSellers = async (req, res) => {
  try {
    const result = await adminSellersService.getAllSellers();

    res.status(200).json({
      ok: true,
      message: "Vendedores obtenidos correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const getSellerById = async (req, res) => {
  try {
    const result = await adminSellersService.getSellerById(req.params.id);

    if (!result) {
      return res.status(404).json({
        ok: false,
        message: "Vendedor no encontrado",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Vendedor obtenido correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const updateSellerApprovalStatus = async (req, res) => {
  try {
    const result = await adminSellersService.updateSellerApprovalStatus(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      ok: true,
      message: "Estado de aprobación actualizado correctamente",
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
  getAllSellers,
  getSellerById,
  updateSellerApprovalStatus,
};

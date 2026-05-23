const adminService = require("../services/admin.service");

const getAllOrders = async (req, res) => {
  try {
    const result = await adminService.getAllOrders();

    res.status(200).json({
      ok: true,
      message: "Pedidos obtenidos correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const getOrderByIdAdmin = async (req, res) => {
  try {
    const result = await adminService.getOrderById(req.params.id);

    if (!result) {
      return res.status(404).json({
        ok: false,
        message: "Pedido no encontrado",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Detalle del pedido obtenido correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const result = await adminService.updateOrderStatus(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      ok: true,
      message: "Estado del pedido actualizado correctamente",
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
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
};

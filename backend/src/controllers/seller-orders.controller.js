const sellerOrdersService = require("../services/seller-orders.service");

const getSellerOrders = async (req, res) => {
  try {
    const result = await sellerOrdersService.getOrdersBySeller(
      req.user.id_usuario,
    );

    res.status(200).json({
      ok: true,
      message: "Pedidos del vendedor obtenidos correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const getSellerOrderById = async (req, res) => {
  try {
    const result = await sellerOrdersService.getOrderDetailBySeller(
      req.user.id_usuario,
      req.params.id,
    );

    if (!result) {
      return res.status(404).json({
        ok: false,
        message: "Pedido no encontrado para este vendedor",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Detalle del pedido del vendedor obtenido correctamente",
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
  getSellerOrders,
  getSellerOrderById,
};

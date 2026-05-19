const ordersService = require("../services/orders.service");

const createOrder = async (req, res) => {
    try {
        const result = await ordersService.createOrder(
            req.user.id_usuario,
            req.body,
        );

        res.status(201).json({
            ok: true,
            message: "Pedido creado correctamente",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message,
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const result = await ordersService.getOrdersByUser(req.user.id_usuario);

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

const getOrderById = async (req, res) => {
    try {
        const result = await ordersService.getOrderDetail(
            req.user.id_usuario,
            req.params.id,
        );

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

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
};

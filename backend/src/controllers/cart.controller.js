const cartService = require("../services/cart.service");

const getCart = async (req, res) => {
    try {
        const result = await cartService.getActiveCart(req.user.id_usuario);

        res.status(200).json({
            ok: true,
            message: "Carrito obtenido correctamente",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message,
        });
    }
};

const addItemToCart = async (req, res) => {
    try {
        const result = await cartService.addItem(req.user.id_usuario, req.body);

        res.status(201).json({
            ok: true,
            message: "Producto agregado al carrito correctamente",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message,
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const result = await cartService.updateItem(
            req.user.id_usuario,
            req.params.id,
            req.body,
        );

        res.status(200).json({
            ok: true,
            message: "Producto del carrito actualizado correctamente",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message,
        });
    }
};

const deleteCartItem = async (req, res) => {
    try {
        const result = await cartService.deleteItem(
            req.user.id_usuario,
            req.params.id,
        );

        res.status(200).json({
            ok: true,
            message: "Producto eliminado del carrito correctamente",
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
    getCart,
    addItemToCart,
    updateCartItem,
    deleteCartItem,
};

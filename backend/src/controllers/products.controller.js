const productsService = require("../services/products.service");

const getProducts = async (req, res) => {
    try {
        const result = await productsService.getAllProducts(req.query);

        res.status(200).json({
            ok: true,
            message: "Listado de productos obtenido correctamente",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message,
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const result = await productsService.getProductById(req.params.id);

        if (!result) {
            return res.status(404).json({
                ok: false,
                message: "Producto no encontrado",
            });
        }

        res.status(200).json({
            ok: true,
            message: "Detalle de producto obtenido correctamente",
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
    getProducts,
    getProductById,
};

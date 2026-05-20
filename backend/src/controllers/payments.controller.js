const paymentsService = require("../services/payments.service");

const simulatePayment = async (req, res) => {
    try {
        const result = await paymentsService.simulatePayment(
            req.user.id_usuario,
            req.body,
        );

        res.status(201).json({
            ok: true,
            message: "Pago simulado procesado correctamente",
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
    simulatePayment,
};

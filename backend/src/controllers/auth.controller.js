const authService = require("../services/auth.service");

const handleError = (res, error, context) => {
    const status = error.statusCode || 500;

    if (status >= 500) {
        console.error(`[auth:${context}] error inesperado:`, error);
        return res.status(500).json({
            ok: false,
            message: "Error interno del servidor",
        });
    }

    return res.status(status).json({
        ok: false,
        message: error.message,
    });
};

const register = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);

        res.status(201).json({
            ok: true,
            message: "Usuario registrado correctamente",
            data: result,
        });
    } catch (error) {
        handleError(res, error, "register");
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body);

        res.status(200).json({
            ok: true,
            message: "Inicio de sesión correcto",
            data: result,
        });
    } catch (error) {
        handleError(res, error, "login");
    }
};

module.exports = {
    register,
    login,
};

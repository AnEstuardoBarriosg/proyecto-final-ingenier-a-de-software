const authService = require("../services/auth.service");

const register = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);

        res.status(201).json({
            ok: true,
            message: "Usuario registrado correctamente",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message,
        });
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
        res.status(401).json({
            ok: false,
            message: error.message,
        });
    }
};

module.exports = {
    register,
    login,
};

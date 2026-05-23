const passwordService = require("../services/password.service");

const requestPasswordReset = async (req, res) => {
  try {
    const result = await passwordService.requestPasswordReset(req.body);

    res.status(200).json({
      ok: true,
      message: "Proceso de recuperación generado correctamente",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

const confirmPasswordReset = async (req, res) => {
  try {
    const result = await passwordService.confirmPasswordReset(req.body);

    res.status(200).json({
      ok: true,
      message: "Contraseña actualizada correctamente",
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
  requestPasswordReset,
  confirmPasswordReset,
};

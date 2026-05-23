const adminUsersService = require("../services/admin-users.service");

const getAllUsers = async (req, res) => {
  try {
    const result = await adminUsersService.getAllUsers();

    res.status(200).json({
      ok: true,
      message: "Usuarios obtenidos correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const result = await adminUsersService.getUserById(req.params.id);

    if (!result) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Usuario obtenido correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const result = await adminUsersService.updateUserStatus(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      ok: true,
      message: "Estado del usuario actualizado correctamente",
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
  getAllUsers,
  getUserById,
  updateUserStatus,
};

const notificationsService = require("../services/notifications.service");

const getMyNotifications = async (req, res) => {
  try {
    const result = await notificationsService.getMyNotifications(
      req.user.id_usuario,
    );

    res.status(200).json({
      ok: true,
      message: "Notificaciones obtenidas correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const result = await notificationsService.markAsRead(
      req.user.id_usuario,
      req.params.id,
    );

    res.status(200).json({
      ok: true,
      message: "Notificación marcada como leída correctamente",
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
  getMyNotifications,
  markNotificationAsRead,
};

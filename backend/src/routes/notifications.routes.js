const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const {
  getMyNotifications,
  markNotificationAsRead,
} = require("../controllers/notifications.controller");

const router = express.Router();

router.get("/", authenticateToken, getMyNotifications);
router.patch("/:id/read", authenticateToken, markNotificationAsRead);

module.exports = router;

const notificationService = require("../services/notificationService");
const asyncHandler = require("../utils/asyncHandler");

const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await notificationService.getMyNotifications(req.user);
    res.status(200).json({ success: true, notifications });
});

const markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user);
    res.status(200).json({ success: true, notification });
});

module.exports = {
    getMyNotifications,
    markAsRead,
};

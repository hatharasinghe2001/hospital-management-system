const Notification = require("../models/Notification");
const { AppError } = require("./authService");

async function createNotification({ recipientUser, recipientRole, type, message, appointment }) {
    return Notification.create({ recipientUser, recipientRole, type, message, appointment });
}

async function getMyNotifications(user) {
    return Notification.find({
        $or: [{ recipientUser: user.id }, { recipientRole: user.role }],
    })
        .sort({ createdAt: -1 })
        .limit(50);
}

async function markAsRead(notificationId, user) {
    const notification = await Notification.findOne({
        _id: notificationId,
        $or: [{ recipientUser: user.id }, { recipientRole: user.role }],
    });
    if (!notification) {
        throw new AppError("Notification not found", 404);
    }
    notification.read = true;
    await notification.save();
    return notification;
}

module.exports = {
    createNotification,
    getMyNotifications,
    markAsRead,
};

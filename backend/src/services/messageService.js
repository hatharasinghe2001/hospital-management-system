const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const { INTERNAL_ROLES } = require("../models/User");
const { AppError } = require("./authService");

async function findInternalUser(userId) {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("User not found", 404);
    }
    const user = await User.findOne({ _id: userId, role: { $in: INTERNAL_ROLES }, isActive: true });
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user;
}

// Every other active staff member, with the last message exchanged and the unread count.
async function getContacts(currentUser) {
    const me = new mongoose.Types.ObjectId(currentUser.id);

    const [users, lastMessages, unreadCounts] = await Promise.all([
        User.find({ _id: { $ne: me }, role: { $in: INTERNAL_ROLES }, isActive: true })
            .select("name username role avatar")
            .lean(),
        Message.aggregate([
            { $match: { $or: [{ sender: me }, { recipient: me }] } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: { $cond: [{ $eq: ["$sender", me] }, "$recipient", "$sender"] },
                    body: { $first: "$body" },
                    createdAt: { $first: "$createdAt" },
                    sender: { $first: "$sender" },
                },
            },
        ]),
        Message.aggregate([
            { $match: { recipient: me, read: false } },
            { $group: { _id: "$sender", count: { $sum: 1 } } },
        ]),
    ]);

    const lastById = new Map(lastMessages.map((m) => [m._id.toString(), m]));
    const unreadById = new Map(unreadCounts.map((u) => [u._id.toString(), u.count]));

    return users
        .map((u) => {
            const id = u._id.toString();
            const last = lastById.get(id);
            return {
                _id: id,
                name: u.name,
                username: u.username,
                role: u.role,
                avatar: u.avatar,
                unread: unreadById.get(id) || 0,
                lastMessage: last
                    ? { body: last.body, createdAt: last.createdAt, fromMe: last.sender.toString() === currentUser.id }
                    : null,
            };
        })
        .sort((a, b) => {
            const at = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const bt = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return bt - at || a.name.localeCompare(b.name);
        });
}

// Full conversation with one user; marks their messages to me as read.
async function getConversation(currentUser, otherUserId) {
    await findInternalUser(otherUserId);

    await Message.updateMany(
        { sender: otherUserId, recipient: currentUser.id, read: false },
        { $set: { read: true } }
    );

    return Message.find({
        $or: [
            { sender: currentUser.id, recipient: otherUserId },
            { sender: otherUserId, recipient: currentUser.id },
        ],
    })
        .sort({ createdAt: 1 })
        .limit(500)
        .lean();
}

async function sendMessage(currentUser, recipientId, body) {
    if (recipientId === currentUser.id) {
        throw new AppError("You cannot message yourself", 400);
    }
    await findInternalUser(recipientId);
    return Message.create({ sender: currentUser.id, recipient: recipientId, body: body.trim() });
}

async function getUnreadCount(currentUser) {
    return Message.countDocuments({ recipient: currentUser.id, read: false });
}

module.exports = {
    getContacts,
    getConversation,
    sendMessage,
    getUnreadCount,
};

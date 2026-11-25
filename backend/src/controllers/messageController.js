const messageService = require("../services/messageService");
const asyncHandler = require("../utils/asyncHandler");

const getContacts = asyncHandler(async (req, res) => {
    const contacts = await messageService.getContacts(req.user);
    res.status(200).json({ success: true, contacts });
});

const getConversation = asyncHandler(async (req, res) => {
    const messages = await messageService.getConversation(req.user, req.params.userId);
    res.status(200).json({ success: true, messages });
});

const sendMessage = asyncHandler(async (req, res) => {
    const message = await messageService.sendMessage(req.user, req.params.userId, req.body.body);
    res.status(201).json({ success: true, message });
});

const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await messageService.getUnreadCount(req.user);
    res.status(200).json({ success: true, count });
});

module.exports = {
    getContacts,
    getConversation,
    sendMessage,
    getUnreadCount,
};

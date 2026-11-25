const express = require("express");
const {
    getContacts,
    getConversation,
    sendMessage,
    getUnreadCount,
} = require("../controllers/messageController");
const protect = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { sendMessageValidator } = require("../validators/messageValidator");
const { INTERNAL_ROLES } = require("../models/User");

const router = express.Router();

// Staff-only messaging
router.use(protect, restrictTo(...INTERNAL_ROLES));

router.get("/contacts", getContacts);
router.get("/unread-count", getUnreadCount);
router.get("/:userId", getConversation);
router.post("/:userId", sendMessageValidator, validate, sendMessage);

module.exports = router;

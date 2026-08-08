const express = require("express");
const { getUsers } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, restrictTo("admin"), getUsers);

module.exports = router;

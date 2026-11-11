const express = require("express");
const {
    getUserNotifications,
    markNotificationRead,
    getAdminAdvisories,
    createAdminAdvisory
} = require("../controllers/notificationController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, getUserNotifications);
router.post("/:id/read", verifyToken, markNotificationRead);
router.get("/admin/advisories", verifyToken, verifyAdmin, getAdminAdvisories);
router.post("/admin/advisories", verifyToken, verifyAdmin, createAdminAdvisory);

module.exports = router;

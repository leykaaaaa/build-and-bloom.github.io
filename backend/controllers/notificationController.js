const pool = require("../config/db");

function getNotificationErrorMessage(error, fallback) {
    if (error.code === "ER_NO_SUCH_TABLE") {
        return "Weather notification tables are missing. Apply database/migrations/20261109_add_weather_advisories.sql and restart the backend.";
    }

    return fallback;
}

const getUserNotifications = async (req, res) => {
    try {
        const [notifications] = await pool.query(
            `
            SELECT
                a.advisory_id,
                a.title,
                a.message,
                a.advisory_type,
                a.priority,
                a.created_at,
                a.location_id,
                l.location_name,
                r.read_at
            FROM weather_advisories a
            INNER JOIN users u
                ON u.user_id = ?
               AND u.role = 'user'
               AND (
                    a.target_scope = 'all'
                    OR (
                        a.target_scope = 'location'
                        AND a.location_id = u.location_id
                    )
               )
            LEFT JOIN locations l
                ON l.location_id = a.location_id
            LEFT JOIN weather_advisory_reads r
                ON r.advisory_id = a.advisory_id
               AND r.user_id = u.user_id
            ORDER BY a.created_at DESC
            LIMIT 100
            `,
            [req.user.user_id]
        );

        const [unreadResult] = await pool.query(
            `
            SELECT COUNT(*) AS unread_count
            FROM weather_advisories a
            INNER JOIN users u
                ON u.user_id = ?
               AND u.role = 'user'
               AND (
                    a.target_scope = 'all'
                    OR (
                        a.target_scope = 'location'
                        AND a.location_id = u.location_id
                    )
               )
            LEFT JOIN weather_advisory_reads r
                ON r.advisory_id = a.advisory_id
               AND r.user_id = u.user_id
            WHERE r.read_at IS NULL
            `,
            [req.user.user_id]
        );

        res.json({
            success: true,
            unreadCount: unreadResult[0].unread_count,
            data: notifications
        });
    } catch (error) {
        console.error("Notification retrieval error:", error);
        res.status(500).json({
            success: false,
            message: getNotificationErrorMessage(
                error,
                "Failed to retrieve notifications."
            )
        });
    }
};

const markNotificationRead = async (req, res) => {
    const advisoryId = Number(req.params.id);

    if (!Number.isInteger(advisoryId) || advisoryId < 1) {
        return res.status(400).json({
            success: false,
            message: "A valid advisory ID is required."
        });
    }

    try {
        const [advisories] = await pool.query(
            `
            SELECT a.advisory_id
            FROM weather_advisories a
            INNER JOIN users u
                ON u.user_id = ?
               AND u.role = 'user'
               AND (
                    a.target_scope = 'all'
                    OR (
                        a.target_scope = 'location'
                        AND a.location_id = u.location_id
                    )
               )
            WHERE a.advisory_id = ?
            `,
            [req.user.user_id, advisoryId]
        );

        if (advisories.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        await pool.query(
            `
            INSERT INTO weather_advisory_reads (advisory_id, user_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP
            `,
            [advisoryId, req.user.user_id]
        );

        res.json({
            success: true,
            message: "Notification marked as read."
        });
    } catch (error) {
        console.error("Notification read update error:", error);
        res.status(500).json({
            success: false,
            message: getNotificationErrorMessage(
                error,
                "Failed to update notification."
            )
        });
    }
};

const getAdminAdvisories = async (req, res) => {
    try {
        const [advisories] = await pool.query(
            `
            SELECT
                a.advisory_id,
                a.title,
                a.message,
                a.advisory_type,
                a.priority,
                a.target_scope,
                a.location_id,
                a.created_at,
                l.location_name,
                (
                    SELECT COUNT(*)
                    FROM users u
                    WHERE u.role = 'user'
                      AND (
                        a.target_scope = 'all'
                        OR (
                            a.target_scope = 'location'
                            AND u.location_id = a.location_id
                        )
                      )
                ) AS recipient_count
            FROM weather_advisories a
            LEFT JOIN locations l
                ON l.location_id = a.location_id
            ORDER BY a.created_at DESC
            LIMIT 100
            `
        );

        res.json({
            success: true,
            data: advisories
        });
    } catch (error) {
        console.error("Admin advisory retrieval error:", error);
        res.status(500).json({
            success: false,
            message: getNotificationErrorMessage(
                error,
                "Failed to retrieve sent advisories."
            )
        });
    }
};

const createAdminAdvisory = async (req, res) => {
    const body = req.body || {};
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const advisoryType = typeof body.advisory_type === "string"
        ? body.advisory_type.trim()
        : "";
    const priority = body.priority;
    const locationId = body.location_id === undefined
        || body.location_id === null
        || body.location_id === ""
        ? null
        : Number(body.location_id);
    const targetScope = locationId === null ? "all" : "location";

    if (!title || title.length > 150 || !message || message.length > 5000) {
        return res.status(400).json({
            success: false,
            message: "A title (up to 150 characters) and message (up to 5000 characters) are required."
        });
    }

    if (!advisoryType || advisoryType.length > 50) {
        return res.status(400).json({
            success: false,
            message: "A valid advisory type is required."
        });
    }

    if (!["info", "warning", "high"].includes(priority)) {
        return res.status(400).json({
            success: false,
            message: "Priority must be info, warning, or high."
        });
    }

    if (locationId !== null && (!Number.isInteger(locationId) || locationId < 1)) {
        return res.status(400).json({
            success: false,
            message: "Select a valid recipient location."
        });
    }

    try {
        if (locationId !== null) {
            const [locations] = await pool.query(
                "SELECT location_id FROM locations WHERE location_id = ?",
                [locationId]
            );

            if (locations.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "The selected location does not exist."
                });
            }
        }

        const [result] = await pool.query(
            `
            INSERT INTO weather_advisories (
                title,
                message,
                advisory_type,
                priority,
                target_scope,
                location_id,
                created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                title,
                message,
                advisoryType,
                priority,
                targetScope,
                locationId,
                req.user.user_id
            ]
        );

        const [recipients] = await pool.query(
            `
            SELECT COUNT(*) AS recipient_count
            FROM users
            WHERE role = 'user'
              AND (? = 'all' OR location_id = ?)
            `,
            [targetScope, locationId]
        );

        res.status(201).json({
            success: true,
            message: "Weather advisory sent successfully.",
            data: {
                advisory_id: result.insertId,
                recipient_count: recipients[0].recipient_count
            }
        });
    } catch (error) {
        console.error("Admin advisory creation error:", error);
        res.status(500).json({
            success: false,
            message: getNotificationErrorMessage(
                error,
                "Failed to send weather advisory."
            )
        });
    }
};

module.exports = {
    getUserNotifications,
    markNotificationRead,
    getAdminAdvisories,
    createAdminAdvisory
};

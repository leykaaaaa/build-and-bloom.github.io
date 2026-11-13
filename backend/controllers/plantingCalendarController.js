const pool = require("../config/db");


// GET ALL PLANTING CALENDAR ENTRIES
const getPlantingCalendar = async (req, res) => {
    try {

        const { location_id } = req.query;

        let query = `
            SELECT
                pc.calendar_id,
                pc.crop_id,
                c.crop_name,
                c.category,
                c.description,
                pc.location_id,
                l.location_name,
                pc.planting_month,
                pc.season,
                pc.notes
            FROM planting_calendar pc
            INNER JOIN crops c
                ON pc.crop_id = c.crop_id
            LEFT JOIN locations l
                ON pc.location_id = l.location_id
        `;

        const params = [];


        // FILTER BY LOCATION IF PROVIDED
        if (location_id) {

            query += `
                WHERE pc.location_id IS NULL
                    OR pc.location_id = ?
            `;

            params.push(location_id);

        }


        // ORDER RESULTS
        query += `
            ORDER BY
                CASE WHEN pc.location_id IS NULL THEN 0 ELSE 1 END,
                c.crop_name ASC,
                pc.season ASC,
                pc.planting_month ASC,
                l.location_name ASC
        `;


        const [rows] = await pool.query(
            query,
            params
        );


        res.json({
            success: true,
            data: rows
        });

    } catch (error) {

        console.error(
            "Error retrieving planting calendar:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to retrieve planting calendar."
        });

    }
};


// GET PLANTING CALENDAR BY LOCATION NAME
const getPlantingCalendarByLocation = async (req, res) => {
    try {

        const { location } = req.params;


        const [rows] = await pool.query(
            `
            SELECT
                pc.calendar_id,
                pc.crop_id,
                c.crop_name,
                c.category,
                c.description,
                pc.location_id,
                l.location_name,
                pc.planting_month,
                pc.season,
                pc.notes
            FROM planting_calendar pc
            INNER JOIN crops c
                ON pc.crop_id = c.crop_id
            LEFT JOIN locations l
                ON pc.location_id = l.location_id
            WHERE pc.location_id IS NULL
                OR l.location_name = ?
            ORDER BY c.crop_name ASC, pc.season ASC, pc.planting_month ASC
            `,
            [location]
        );


        res.json({
            success: true,
            data: rows
        });

    } catch (error) {

        console.error(
            "Error retrieving planting calendar by location:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to retrieve planting calendar."
        });

    }
};

// CREATE PLANTING CALENDAR ENTRY
const createPlantingCalendar = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            crop_id,
            location_id,
            planting_month,
            season,
            notes
        } = req.body;

        if (!crop_id) {
            return res.status(400).json({
                success: false,
                message: "Crop is required."
            });
        }

        // CHECK IF CROP EXISTS
        const [crop] = await connection.query(
            `
            SELECT crop_id
            FROM crops
            WHERE crop_id = ?
            `,
            [crop_id]
        );

        if (crop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Crop not found."
            });
        }

        if (location_id != null && location_id !== "") {
            const [location] = await connection.query(
                `
                SELECT location_id
                FROM locations
                WHERE location_id = ?
                `,
                [location_id]
            );

            if (location.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Location not found."
                });
            }
        }

        // START TRANSACTION
        await connection.beginTransaction();

        // INSERT INTO DATABASE
        const [result] = await connection.query(
            `
            INSERT INTO planting_calendar (
                crop_id,
                location_id,
                planting_month,
                season,
                notes
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                crop_id,
                location_id || null,
                planting_month || null,
                season || null,
                notes || null
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message:
                "Planting calendar entry created successfully.",
            calendar_id: result.insertId
        });

    } catch (error) {

        await connection.rollback();

        console.error(
            "Error creating planting calendar:",
            error
        );

        if (error.code === "ER_BAD_NULL_ERROR") {
            return res.status(409).json({
                success: false,
                message:
                    "The database still requires a location for planting schedules. Run database/migrations/20261025_make_planting_calendar_location_optional.sql, then try again."
            });
        }

        res.status(500).json({
            success: false,
            message:
                "Failed to create planting calendar entry."
        });

    } finally {
        connection.release();
    }
};

const updatePlantingCalendarSchedules = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            calendar_ids,
            crop_id,
            planting_month,
            season,
            notes
        } = req.body;

        const requestedIds = Array.isArray(calendar_ids)
            ? calendar_ids.map(Number)
            : [];
        const ids = [...new Set(requestedIds)];

        if (
            ids.length === 0 ||
            ids.length !== requestedIds.length ||
            ids.some((id) => !Number.isInteger(id) || id <= 0) ||
            !Number.isInteger(Number(crop_id)) ||
            Number(crop_id) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid schedule IDs and crop are required."
            });
        }

        await connection.beginTransaction();

        const [existingSchedules] = await connection.query(
            "SELECT calendar_id FROM planting_calendar WHERE calendar_id IN (?) FOR UPDATE",
            [ids]
        );

        if (existingSchedules.length !== ids.length) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "One or more planting schedules were not found."
            });
        }

        const [crop] = await connection.query(
            "SELECT crop_id FROM crops WHERE crop_id = ?",
            [Number(crop_id)]
        );

        if (crop.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Crop not found."
            });
        }

        await connection.query(
            `
            UPDATE planting_calendar
            SET
                crop_id = ?,
                planting_month = ?,
                season = ?,
                notes = ?
            WHERE calendar_id IN (?)
            `,
            [
                Number(crop_id),
                planting_month || null,
                season || null,
                notes || null,
                ids
            ]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Planting schedules updated successfully.",
            calendar_ids: ids
        });
    } catch (error) {
        await connection.rollback();

        console.error("Error updating planting calendar schedules:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update planting calendar schedules."
        });
    } finally {
        connection.release();
    }
};

const deletePlantingCalendarSchedules = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const requestedIds = Array.isArray(req.body.calendar_ids)
            ? req.body.calendar_ids.map(Number)
            : [];
        const ids = [...new Set(requestedIds)];

        if (
            ids.length === 0 ||
            ids.length !== requestedIds.length ||
            ids.some((id) => !Number.isInteger(id) || id <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid schedule IDs are required."
            });
        }

        await connection.beginTransaction();

        const [existingSchedules] = await connection.query(
            "SELECT calendar_id FROM planting_calendar WHERE calendar_id IN (?) FOR UPDATE",
            [ids]
        );

        if (existingSchedules.length !== ids.length) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "One or more planting schedules were not found."
            });
        }

        await connection.query(
            "DELETE FROM planting_calendar WHERE calendar_id IN (?)",
            [ids]
        );
        await connection.commit();

        res.json({
            success: true,
            message: "Planting schedules deleted successfully."
        });
    } catch (error) {
        await connection.rollback();

        console.error("Error deleting planting calendar schedules:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete planting calendar schedules."
        });
    } finally {
        connection.release();
    }
};

// UPDATE PLANTING CALENDAR ENTRY
const updatePlantingCalendar = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        const {
            crop_id,
            location_id,
            planting_month,
            season,
            notes
        } = req.body;

        if (!crop_id) {
            return res.status(400).json({
                success: false,
                message: "Crop is required."
            });
        }

        // CHECK IF CALENDAR ENTRY EXISTS
        const [existingEntry] =
            await connection.query(
                `
                SELECT calendar_id
                FROM planting_calendar
                WHERE calendar_id = ?
                `,
                [id]
            );

        if (existingEntry.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Planting calendar entry not found."
            });
        }

        // CHECK IF CROP EXISTS
        const [crop] =
            await connection.query(
                `
                SELECT crop_id
                FROM crops
                WHERE crop_id = ?
                `,
                [crop_id]
            );

        if (crop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Crop not found."
            });
        }

        if (location_id != null && location_id !== "") {
            const [location] = await connection.query(
                `
                SELECT location_id
                FROM locations
                WHERE location_id = ?
                `,
                [location_id]
            );

            if (location.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Location not found."
                });
            }
        }

        // START TRANSACTION
        await connection.beginTransaction();

        // UPDATE DATABASE
        await connection.query(
            `
            UPDATE planting_calendar
            SET
                crop_id = ?,
                location_id = ?,
                planting_month = ?,
                season = ?,
                notes = ?
            WHERE calendar_id = ?
            `,
            [
                crop_id,
                location_id || null,
                planting_month || null,
                season || null,
                notes || null,
                id
            ]
        );

        await connection.commit();

        res.json({
            success: true,
            message:
                "Planting calendar entry updated successfully.",
            calendar_id: id
        });

    } catch (error) {

        await connection.rollback();

        console.error(
            "Error updating planting calendar:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update planting calendar entry."
        });

    } finally {
        connection.release();
    }
};

// DELETE PLANTING CALENDAR ENTRY
const deletePlantingCalendar = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        const [existingEntry] =
            await connection.query(
                `
                SELECT calendar_id
                FROM planting_calendar
                WHERE calendar_id = ?
                `,
                [id]
            );

        if (existingEntry.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Planting calendar entry not found."
            });
        }

        await connection.beginTransaction();

        await connection.query(
            `
            DELETE FROM planting_calendar
            WHERE calendar_id = ?
            `,
            [id]
        );

        await connection.commit();

        res.json({
            success: true,
            message:
                "Planting calendar entry deleted successfully.",
            calendar_id: id
        });

    } catch (error) {
        await connection.rollback();

        console.error(
            "Error deleting planting calendar:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to delete planting calendar entry."
        });

    } finally {
        connection.release();
    }
};


module.exports = {
    getPlantingCalendar,
    getPlantingCalendarByLocation,
    createPlantingCalendar,
    updatePlantingCalendarSchedules,
    deletePlantingCalendarSchedules,
    updatePlantingCalendar,
    deletePlantingCalendar
};
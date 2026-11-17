
const pool = require("../config/db");

// GET ALL PLANTING CALENDAR ENTRIES
const getPlantingCalendar = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                pc.calendar_id,
                pc.crop_id,
                c.crop_name,
                c.category,
                c.description,
                pc.planting_month,
                pc.season,
                pc.notes
            FROM planting_calendar pc
            INNER JOIN crops c
                ON pc.crop_id = c.crop_id
            ORDER BY
                c.crop_name ASC,
                pc.season ASC,
                pc.planting_month ASC
        `);

        return res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Error retrieving planting calendar:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve planting calendar."
        });
    }
};


// GET PLANTING CALENDAR BY LOCATION NAME
// The calendar is now general for Pangasinan.
// Keep this function for compatibility with existing routes.
const getPlantingCalendarByLocation = async (req, res) => {
    return getPlantingCalendar(req, res);
};


// CREATE PLANTING CALENDAR ENTRY
const createPlantingCalendar = async (req, res) => {
    let connection;

    try {
        connection = await pool.getConnection();

        const {
            crop_id,
            planting_month,
            notes
        } = req.body;

        if (!Number.isInteger(Number(crop_id)) || Number(crop_id) <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid crop is required."
            });
        }

        const [crop] = await connection.query(
            `
            SELECT c.crop_id, cr.season
            FROM crops c
            LEFT JOIN crop_requirements cr
                ON c.crop_id = cr.crop_id
            WHERE c.crop_id = ?
            `,
            [Number(crop_id)]
        );

        if (crop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Crop not found."
            });
        }

        await connection.beginTransaction();

        const [result] = await connection.query(
            `
            INSERT INTO planting_calendar (
                crop_id,
                planting_month,
                season,
                notes
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                Number(crop_id),
                planting_month || null,
                crop[0].season || null,
                notes || null
            ]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Planting calendar entry created successfully.",
            calendar_id: result.insertId
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error creating planting calendar:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create planting calendar entry."
        });

    } finally {
        if (connection) connection.release();
    }
};


// UPDATE MULTIPLE PLANTING CALENDAR SCHEDULES
const updatePlantingCalendarSchedules = async (req, res) => {
    let connection;

    try {
        connection = await pool.getConnection();

        const {
            calendar_ids,
            crop_id,
            planting_month,
            notes
        } = req.body;

        const requestedIds = Array.isArray(calendar_ids)
            ? calendar_ids.map(Number)
            : [];

        const ids = [...new Set(requestedIds)];

        if (
            ids.length === 0 ||
            ids.length !== requestedIds.length ||
            ids.some(id => !Number.isInteger(id) || id <= 0) ||
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
            `
            SELECT calendar_id
            FROM planting_calendar
            WHERE calendar_id IN (?)
            FOR UPDATE
            `,
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
            `
            SELECT c.crop_id, cr.season
            FROM crops c
            LEFT JOIN crop_requirements cr
                ON c.crop_id = cr.crop_id
            WHERE c.crop_id = ?
            `,
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
                crop[0].season || null,
                notes || null,
                ids
            ]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: "Planting schedules updated successfully.",
            calendar_ids: ids
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error updating planting calendar schedules:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update planting calendar schedules."
        });

    } finally {
        if (connection) connection.release();
    }
};


// DELETE MULTIPLE PLANTING CALENDAR SCHEDULES
const deletePlantingCalendarSchedules = async (req, res) => {
    let connection;

    try {
        connection = await pool.getConnection();

        const requestedIds = Array.isArray(req.body.calendar_ids)
            ? req.body.calendar_ids.map(Number)
            : [];

        const ids = [...new Set(requestedIds)];

        if (
            ids.length === 0 ||
            ids.length !== requestedIds.length ||
            ids.some(id => !Number.isInteger(id) || id <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid schedule IDs are required."
            });
        }

        await connection.beginTransaction();

        const [existingSchedules] = await connection.query(
            `
            SELECT calendar_id
            FROM planting_calendar
            WHERE calendar_id IN (?)
            FOR UPDATE
            `,
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
            `
            DELETE FROM planting_calendar
            WHERE calendar_id IN (?)
            `,
            [ids]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: "Planting schedules deleted successfully."
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error deleting planting calendar schedules:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete planting calendar schedules."
        });

    } finally {
        if (connection) connection.release();
    }
};


// UPDATE ONE PLANTING CALENDAR ENTRY
const updatePlantingCalendar = async (req, res) => {
    let connection;

    try {
        connection = await pool.getConnection();

        const { id } = req.params;
        const {
            crop_id,
            planting_month,
            notes
        } = req.body;

        if (
            !Number.isInteger(Number(crop_id)) ||
            Number(crop_id) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid crop is required."
            });
        }

        const [existingEntry] = await connection.query(
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
                message: "Planting calendar entry not found."
            });
        }

        const [crop] = await connection.query(
            `
            SELECT c.crop_id, cr.season
            FROM crops c
            LEFT JOIN crop_requirements cr
                ON c.crop_id = cr.crop_id
            WHERE c.crop_id = ?
            `,
            [Number(crop_id)]
        );

        if (crop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Crop not found."
            });
        }

        await connection.beginTransaction();

        await connection.query(
            `
            UPDATE planting_calendar
            SET
                crop_id = ?,
                planting_month = ?,
                season = ?,
                notes = ?
            WHERE calendar_id = ?
            `,
            [
                Number(crop_id),
                planting_month || null,
                crop[0].season || null,
                notes || null,
                id
            ]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: "Planting calendar entry updated successfully.",
            calendar_id: id
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error updating planting calendar:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update planting calendar entry."
        });

    } finally {
        if (connection) connection.release();
    }
};


// DELETE ONE PLANTING CALENDAR ENTRY
const deletePlantingCalendar = async (req, res) => {
    let connection;

    try {
        connection = await pool.getConnection();

        const { id } = req.params;

        const [existingEntry] = await connection.query(
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
                message: "Planting calendar entry not found."
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

        return res.json({
            success: true,
            message: "Planting calendar entry deleted successfully.",
            calendar_id: id
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error deleting planting calendar:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete planting calendar entry."
        });

    } finally {
        if (connection) connection.release();
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

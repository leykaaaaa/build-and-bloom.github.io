const pool = require("../config/db");

const getAllCrops = async (req, res) => {
    try {
        const [crops] = await pool.query(`
            SELECT
                c.crop_id,
                c.crop_name,
                c.category,
                c.description,
                c.growing_period,
                c.harvest_period,
                cr.soil_type,
                cr.water_requirement,
                cr.sunlight_requirement,
                cr.min_temperature,
                cr.max_temperature,
                cr.season,
                cr.environment,
                cr.flood_tolerance,
                cr.drainage_requirement
            FROM crops c
            LEFT JOIN crop_requirements cr
                ON c.crop_id = cr.crop_id
            ORDER BY c.crop_name ASC
        `);

        res.json({
            success: true,
            count: crops.length,
            data: crops
        });

    } catch (error) {
        console.error("Crop retrieval error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve crops."
        });
    }
};


const getCropById = async (req, res) => {
    try {
        const { id } = req.params;

        const [crops] = await pool.query(`
            SELECT
                c.crop_id,
                c.crop_name,
                c.category,
                c.description,
                c.growing_period,
                c.harvest_period,
                cr.soil_type,
                cr.water_requirement,
                cr.sunlight_requirement,
                cr.min_temperature,
                cr.max_temperature,
                cr.season,
                cr.environment,
                cr.flood_tolerance,
                cr.drainage_requirement
            FROM crops c
            LEFT JOIN crop_requirements cr
                ON c.crop_id = cr.crop_id
            WHERE c.crop_id = ?
        `, [id]);

        if (crops.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Crop not found."
            });
        }

        res.json({
            success: true,
            data: crops[0]
        });

    } catch (error) {
        console.error("Crop retrieval error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve crop."
        });
    }
};

const createCrop = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            crop_name,
            category,
            description,
            growing_period,
            harvest_period,
            soil_type,
            water_requirement,
            sunlight_requirement,
            min_temperature,
            max_temperature,
            season,
            environment,
            flood_tolerance,
            drainage_requirement
        } = req.body;

        // Validate required fields
        if (
            !crop_name ||
            !category ||
            !soil_type ||
            !water_requirement ||
            !sunlight_requirement ||
            min_temperature === undefined ||
            max_temperature === undefined ||
            !season ||
            !environment ||
            !flood_tolerance ||
            !drainage_requirement
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide all required crop and requirement information."
            });
        }

        // Check if crop already exists
        const [existingCrop] = await connection.query(
            `
            SELECT crop_id
            FROM crops
            WHERE crop_name = ?
            `,
            [crop_name.trim()]
        );

        if (existingCrop.length > 0) {
            return res.status(409).json({
                success: false,
                message: "A crop with this name already exists."
            });
        }

        await connection.beginTransaction();

        // Insert crop
        const [cropResult] = await connection.query(
            `
            INSERT INTO crops
            (
                crop_name,
                category,
                description,
                growing_period,
                harvest_period
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                crop_name.trim(),
                category.trim(),
                description || null,
                growing_period || null,
                harvest_period || null
            ]
        );

        const cropId = cropResult.insertId;

        // Insert crop requirements
        await connection.query(
            `
            INSERT INTO crop_requirements
            (
                crop_id,
                soil_type,
                water_requirement,
                sunlight_requirement,
                min_temperature,
                max_temperature,
                season,
                environment,
                flood_tolerance,
                drainage_requirement
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                cropId,
                soil_type.trim(),
                water_requirement.trim(),
                sunlight_requirement.trim(),
                min_temperature,
                max_temperature,
                season.trim(),
                environment.trim(),
                flood_tolerance.trim(),
                drainage_requirement.trim()
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Crop created successfully.",
            crop_id: cropId
        });

    } catch (error) {
        await connection.rollback();

        console.error(
            "Crop creation error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to create crop."
        });

    } finally {
        connection.release();
    }
};

const updateCrop = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        const {
            crop_name,
            category,
            description,
            growing_period,
            harvest_period,
            soil_type,
            water_requirement,
            sunlight_requirement,
            min_temperature,
            max_temperature,
            season,
            environment,
            flood_tolerance,
            drainage_requirement
        } = req.body;

        // Validate required fields
        if (
            !crop_name ||
            !category ||
            !soil_type ||
            !water_requirement ||
            !sunlight_requirement ||
            min_temperature === undefined ||
            max_temperature === undefined ||
            !season ||
            !environment ||
            !flood_tolerance ||
            !drainage_requirement
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide all required crop and requirement information."
            });
        }

        // Check if crop exists
        const [existingCrop] = await connection.query(
            `
            SELECT crop_id
            FROM crops
            WHERE crop_id = ?
            `,
            [id]
        );

        if (existingCrop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Crop not found."
            });
        }

        // Check for duplicate crop name
        const [duplicateCrop] = await connection.query(
            `
            SELECT crop_id
            FROM crops
            WHERE crop_name = ?
            AND crop_id != ?
            `,
            [
                crop_name.trim(),
                id
            ]
        );

        if (duplicateCrop.length > 0) {
            return res.status(409).json({
                success: false,
                message: "A crop with this name already exists."
            });
        }

        await connection.beginTransaction();

        // Update crop information
        await connection.query(
            `
            UPDATE crops
            SET
                crop_name = ?,
                category = ?,
                description = ?,
                growing_period = ?,
                harvest_period = ?
            WHERE crop_id = ?
            `,
            [
                crop_name.trim(),
                category.trim(),
                description || null,
                growing_period || null,
                harvest_period || null,
                id
            ]
        );

        // Update crop requirements
        await connection.query(
            `
            UPDATE crop_requirements
            SET
                soil_type = ?,
                water_requirement = ?,
                sunlight_requirement = ?,
                min_temperature = ?,
                max_temperature = ?,
                season = ?,
                environment = ?,
                flood_tolerance = ?,
                drainage_requirement = ?
            WHERE crop_id = ?
            `,
            [
                soil_type.trim(),
                water_requirement.trim(),
                sunlight_requirement.trim(),
                min_temperature,
                max_temperature,
                season.trim(),
                environment.trim(),
                flood_tolerance.trim(),
                drainage_requirement.trim(),
                id
            ]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Crop updated successfully.",
            crop_id: id
        });

    } catch (error) {
        await connection.rollback();

        console.error(
            "Crop update error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update crop."
        });

    } finally {
        connection.release();
    }
};

const deleteCrop = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        // Check if crop exists
        const [existingCrop] = await connection.query(
            `
            SELECT crop_id
            FROM crops
            WHERE crop_id = ?
            `,
            [id]
        );

        if (existingCrop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Crop not found."
            });
        }

        await connection.beginTransaction();

        // Delete crop requirements first
        await connection.query(
            `
            DELETE FROM crop_requirements
            WHERE crop_id = ?
            `,
            [id]
        );

        // Delete crop
        await connection.query(
            `
            DELETE FROM crops
            WHERE crop_id = ?
            `,
            [id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Crop deleted successfully.",
            crop_id: id
        });

    } catch (error) {
        await connection.rollback();

        console.error(
            "Crop deletion error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete crop."
        });

    } finally {
        connection.release();
    }
};

module.exports = {
    getAllCrops,
    getCropById,
    createCrop,
    updateCrop,
    deleteCrop
};
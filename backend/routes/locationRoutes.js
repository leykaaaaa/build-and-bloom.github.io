
const express = require("express");
const pool = require("../config/db");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET ALL PANGASINAN LOCATIONS
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {

    try {

        const [locations] = await pool.query(
            `
            SELECT
                location_id,
                location_name,
                location_type
            FROM locations
            ORDER BY location_name ASC
            `
        );

        res.json({
            success: true,
            total: locations.length,
            data: locations
        });

    } catch (error) {

        console.error(
            "Get locations error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to retrieve locations.",
            error: error.message
        });

    }

});

module.exports = router;
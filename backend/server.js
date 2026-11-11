require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./config/db");
const cropRoutes = require("./routes/cropRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const plantingPlanRoutes = require("./routes/plantingPlanRoutes");
const authRoutes = require("./routes/authRoutes");
const plantingCalendarRoutes = require("./routes/plantingCalendarRoutes");
const locationRoutes = require("./routes/locationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/crops", cropRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/weather", weatherRoutes);

app.use(
    "/api/planting-plans",
    plantingPlanRoutes
);

app.use(
    "/api/auth",
    authRoutes
);

app.use("/api/locations", locationRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/planting-calendar", plantingCalendarRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Build & Bloom API is running."
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [result] = await pool.query("SELECT 1 AS test");

        res.json({
            success: true,
            message: "MySQL connection successful.",
            result
        });

    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "MySQL connection failed.",
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Build & Bloom API running on port ${PORT}`);
});
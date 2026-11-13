
const pool = require("../config/db");

const API_KEY = process.env.OPENWEATHER_API_KEY;

const BASE_URL = "https://api.openweathermap.org/data/2.5";


/*
|--------------------------------------------------------------------------
| LOCATION COORDINATES
|--------------------------------------------------------------------------
|
| Coordinates are now retrieved from MySQL instead of a hardcoded list.
| This supports all Pangasinan locations with saved coordinates.
|--------------------------------------------------------------------------
*/

async function getCoordinates(location) {

    if (!location) {
        throw new Error("Location is required.");
    }

    // Handle names such as "Dagupan City" as "Dagupan".
    const locationName = String(location)
        .trim()
        .replace(/\s+city$/i, "");

    const [rows] = await pool.query(
        `
        SELECT
            l.location_name,
            l.latitude,
            l.longitude
        FROM locations l
        WHERE LOWER(TRIM(l.location_name)) = LOWER(?)
        LIMIT 1
        `,
        [locationName]
    );

    if (rows.length === 0) {
        throw new Error(
            `Weather coordinates not available for ${location}.`
        );
    }

    const lat = Number(rows[0].latitude);
    const lon = Number(rows[0].longitude);

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
    ) {
        throw new Error(
            `Invalid weather coordinates for ${location}.`
        );
    }

    return {
        lat,
        lon,
        location_name: rows[0].location_name
    };
}


/*
|--------------------------------------------------------------------------
| WEATHER API REQUEST
|--------------------------------------------------------------------------
*/

async function requestWeather(endpoint, lat, lon) {

    if (!API_KEY) {
        throw new Error(
            "OpenWeatherMap API key is not configured."
        );
    }

    const url =
        `${BASE_URL}/${endpoint}` +
        `?lat=${lat}` +
        `&lon=${lon}` +
        `&appid=${API_KEY}` +
        `&units=metric`;

    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to retrieve weather information."
        );
    }

    return data;
}


/*
|--------------------------------------------------------------------------
| CURRENT WEATHER
|--------------------------------------------------------------------------
*/

async function getCurrentWeather(location) {

    const coordinates =
        await getCoordinates(location);

    const data = await requestWeather(
        "weather",
        coordinates.lat,
        coordinates.lon
    );

    return {

        location: coordinates.location_name,

        temperature:
            data.main?.temp ?? null,

        feels_like:
            data.main?.feels_like ?? null,

        humidity:
            data.main?.humidity ?? null,

        rainfall:
            data.rain?.["1h"] ??
            data.rain?.["3h"] ??
            0,

        weather_condition:
            data.weather?.[0]?.main ??
            "Unknown",

        weather_description:
            data.weather?.[0]?.description ??
            "Unknown",

        wind_speed:
            data.wind?.speed ?? null,

        recorded_at:
            new Date()

    };

}


/*
|--------------------------------------------------------------------------
| WEATHER FORECAST
|--------------------------------------------------------------------------
*/

async function getWeatherForecast(location) {

    const coordinates =
        await getCoordinates(location);

    const data = await requestWeather(
        "forecast",
        coordinates.lat,
        coordinates.lon
    );

    return {

        location: coordinates.location_name,

        forecast: data.list.map((item) => ({

            datetime: item.dt_txt,

            temperature:
                item.main?.temp ?? null,

            feels_like:
                item.main?.feels_like ?? null,

            humidity:
                item.main?.humidity ?? null,

            rainfall:
                item.rain?.["3h"] ?? 0,

            weather_condition:
                item.weather?.[0]?.main ??
                "Unknown",

            weather_description:
                item.weather?.[0]?.description ??
                "Unknown",

            wind_speed:
                item.wind?.speed ?? null

        }))

    };

}


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {
    getCurrentWeather,
    getWeatherForecast
};

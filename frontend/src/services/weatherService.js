
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCurrentWeather(location) {
    const response = await fetch(
        `${API_URL}/api/weather/current?location=${encodeURIComponent(location)}`
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Failed to retrieve current weather."
        );
    }

    return result.data;
}


export async function getWeatherForecast(location) {
    const response = await fetch(
        `${API_URL}/api/weather/forecast?location=${encodeURIComponent(location)}`
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Failed to retrieve weather forecast."
        );
    }

    return result.data;
}


// =========================================================
// WEATHER-BASED CARE ADVISORIES
// =========================================================

export async function getWeatherAdvisory(location) {
    const response = await fetch(
        `${API_URL}/api/weather/advisory?location=${encodeURIComponent(location)}`
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Failed to retrieve weather advisories."
        );
    }

    return result;
}
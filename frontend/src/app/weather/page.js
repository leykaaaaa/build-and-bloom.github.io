"use client";

import { useEffect, useState } from "react";

import {
    getCurrentWeather,
    getWeatherForecast,
    getWeatherAdvisory
} from "../../services/weatherService";

import styles from "./weather.module.css";


// =========================================================
// SMALL INLINE ICONS (no extra package needed)
// =========================================================

function Icon({ size = 20, strokeWidth = 2, children }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const MapPinIcon = () => (
    <Icon size={18}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </Icon>
);

const DropIcon = ({ size = 22 }) => (
    <Icon size={size}>
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </Icon>
);

const WindIcon = () => (
    <Icon size={22}>
        <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
        <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
        <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
    </Icon>
);

const RainIcon = ({ size = 22 }) => (
    <Icon size={size}>
        <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
        <path d="M16 14v6" />
        <path d="M8 14v6" />
        <path d="M12 16v6" />
    </Icon>
);

const CloudIcon = ({ size = 22 }) => (
    <Icon size={size}>
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </Icon>
);

const ThunderIcon = ({ size = 22 }) => (
    <Icon size={size}>
        <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
        <path d="m13 12-3 5h4l-3 5" />
    </Icon>
);

const SnowIcon = ({ size = 22 }) => (
    <Icon size={size}>
        <path d="m10 20-1.25-2.5L6 18" />
        <path d="M10 4 8.75 6.5 6 6" />
        <path d="m14 20 1.25-2.5L18 18" />
        <path d="m14 4 1.25 2.5L18 6" />
        <path d="m17 21-3-6h-4" />
        <path d="m17 3-3 6 1.5 3" />
        <path d="M2 12h6.5L10 9" />
        <path d="m20 10-1.5 2 1.5 2" />
        <path d="M22 12h-6.5L14 15" />
        <path d="m4 10 1.5 2L4 14" />
        <path d="m7 21 3-6-1.5-3" />
        <path d="m7 3 3 6h4" />
    </Icon>
);

const SunIcon = ({ size = 22 }) => (
    <Icon size={size}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
);

const CloudSunIcon = ({ size = 22 }) => (
    <Icon size={size}>
        <path d="M12 2v2M4.9 4.9l1.4 1.4M20 12h2M19.1 4.9l-1.4 1.4M15.9 11.5a4 4 0 0 0-7.8-.5" />
        <path d="M17.5 19H9a5 5 0 1 1 4.9-6.1" />
        <path d="M17.5 19a3.5 3.5 0 0 0 0-7h-.4" />
    </Icon>
);

const AlertTriangleIcon = () => (
    <Icon>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </Icon>
);

const AlertCircleIcon = () => (
    <Icon>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
    </Icon>
);

const SproutIcon = () => (
    <Icon>
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </Icon>
);


// Same matching order as before, now returning an icon instead of an emoji
function WeatherIcon({ condition, size = 22 }) {

    const weather = condition?.toLowerCase() || "";

    if (weather.includes("rain")) {
        return <RainIcon size={size} />;
    }

    if (weather.includes("cloud")) {
        return <CloudIcon size={size} />;
    }

    if (weather.includes("thunder")) {
        return <ThunderIcon size={size} />;
    }

    if (weather.includes("snow")) {
        return <SnowIcon size={size} />;
    }

    if (weather.includes("clear")) {
        return <SunIcon size={size} />;
    }

    return <CloudSunIcon size={size} />;
}


function AdvisoryIcon({ priority }) {

    if (priority === "high") {
        return <AlertTriangleIcon />;
    }

    if (priority === "warning") {
        return <AlertCircleIcon />;
    }

    return <SproutIcon />;
}

function advisoryClass(priority) {

    if (priority === "high") {
        return `${styles.advisory} ${styles.priorityHigh}`;
    }

    if (priority === "warning") {
        return `${styles.advisory} ${styles.priorityWarning}`;
    }

    return styles.advisory;
}


function formatForecastDate(datetime) {

    const date = new Date(
        datetime.replace(" ", "T")
    );

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short",
            month: "short",
            day: "numeric"
        }
    );

}


function formatForecastTime(datetime) {

    const date = new Date(
        datetime.replace(" ", "T")
    );

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// Short label for the trend bars, e.g. "Wed 3 PM"
function formatTrendLabel(datetime) {

    const date = new Date(
        datetime.replace(" ", "T")
    );

    const day = date.toLocaleDateString(
        "en-US",
        { weekday: "short" }
    );

    const time = date.toLocaleTimeString(
        "en-US",
        { hour: "numeric" }
    );

    return `${day} ${time}`;
}


export default function WeatherPage() {

    const [location, setLocation] =
        useState("Dagupan");

    const [currentWeather, setCurrentWeather] =
        useState(null);

    const [forecast, setForecast] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [currentAdvisories, setCurrentAdvisories] =
        useState([]);

    const [forecastAdvisories, setForecastAdvisories] =
        useState([]);

    const [advisoryError, setAdvisoryError] =
        useState("");

    const [locations, setLocations] = useState([]);

    // =========================================================
    // LOAD PANGASINAN LOCATIONS
    // =========================================================

    useEffect(() => {

        async function loadLocations() {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/locations"
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Failed to load locations."
                    );
                }

                setLocations(result.data || []);

            } catch (error) {

                console.error(
                    "Failed to load locations:",
                    error
                );

            }

        }

        loadLocations();

    }, []);


    // =========================================================
    // AUTH CHECK
    // =========================================================

    useEffect(() => {

        const storedUser =
            localStorage.getItem(
                "buildAndBloomUser"
            );

        if (!storedUser) {

            window.location.href = "/login";

            return;

        }

        try {

            const parsedUser =
                JSON.parse(storedUser);

            if (!parsedUser?.user_id) {

                localStorage.removeItem(
                    "buildAndBloomUser"
                );

                window.location.href = "/login";

            }

        } catch (error) {

            console.error(
                "Invalid stored user:",
                error
            );

            localStorage.removeItem(
                "buildAndBloomUser"
            );

            window.location.href = "/login";

        }

    }, []);


    // =========================================================
    // LOAD WEATHER
    // =========================================================

    async function loadWeather(selectedLocation) {

        setLoading(true);
        setError("");
        setAdvisoryError("");

        setCurrentAdvisories([]);
        setForecastAdvisories([]);

        try {

            // =========================================
            // LOAD CURRENT WEATHER AND FORECAST
            // =========================================

            const [
                current,
                forecastData
            ] = await Promise.all([
                getCurrentWeather(selectedLocation),
                getWeatherForecast(selectedLocation)
            ]);

            setCurrentWeather(current);

            setForecast(
                forecastData.forecast || []
            );


            // =========================================
            // LOAD WEATHER-BASED CARE ADVISORIES
            // =========================================

            try {

                const advisoryData =
                    await getWeatherAdvisory(selectedLocation);

                setCurrentAdvisories(
                    advisoryData.currentAdvisories || []
                );

                setForecastAdvisories(
                    advisoryData.forecastAdvisories || []
                );

            } catch (advisoryErr) {

                console.error(
                    "Weather advisory error:",
                    advisoryErr
                );

                setAdvisoryError(
                    advisoryErr.message ||
                    "Unable to load plant care advisories."
                );

            }

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load weather information."
            );

            setCurrentWeather(null);
            setForecast([]);

            setCurrentAdvisories([]);
            setForecastAdvisories([]);

        } finally {

            setLoading(false);

        }

    }

    function handleLocationChange(event) {

        const selectedLocation =
            event.target.value;

        setLocation(selectedLocation);

        loadWeather(selectedLocation);

    }


    // Temperature trend: first 8 forecast entries, bar height scaled to the range
    const trendItems = forecast.slice(0, 8);
    const trendTemps = trendItems.map((item) => Number(item.temperature));
    const trendMin = Math.min(...trendTemps);
    const trendMax = Math.max(...trendTemps);

    function trendHeight(temperature) {

        const range = trendMax - trendMin;

        if (!range) {
            return 110;
        }

        return 50 + ((Number(temperature) - trendMin) / range) * 100;

    }


    // Advisory list (used for current and upcoming sections)
    function renderAdvisories(advisories, emptyText, showOccurrences) {

        if (advisories.length === 0) {

            return (
                <p className={styles.emptyNote}>
                    {emptyText}
                </p>
            );

        }

        return (

            <div className={styles.advisoryList}>

                {advisories.map(
                    (advisory, index) => (

                        <article
                            className={advisoryClass(advisory.priority)}
                            key={`${advisory.type}-${index}`}
                        >

                            <div className={styles.advisoryIcon}>
                                <AdvisoryIcon priority={advisory.priority} />
                            </div>

                            <div>

                                <span className={styles.advisoryLabel}>
                                    {advisory.priority.toUpperCase()}
                                </span>

                                <h3>
                                    {advisory.title}
                                </h3>

                                <p>
                                    {advisory.message}
                                </p>

                                {showOccurrences &&
                                    advisory.occurrences !== undefined && (

                                    <small>
                                        Detected in {advisory.occurrences} forecast entries.
                                    </small>

                                )}

                            </div>

                        </article>

                    )
                )}

            </div>

        );

    }


    return (

        <section className={styles.weatherPage}>

            <div className={styles.weatherContainer}>


                {/* HEADER + LOCATION */}

                <div className={styles.weatherHeader}>

                    <div className={styles.weatherHeading}>

                        <span className={styles.eyebrow}>
                            Weather
                        </span>

                        <h1>
                            Weather Forecast
                        </h1>

                        <p>
                            Check current weather and upcoming
                            conditions to help you make better
                            planting and care decisions.
                        </p>

                    </div>


                    <div className={styles.locationPicker}>

                        <label
                            htmlFor="weather-location"
                            className={styles.visuallyHidden}
                        >
                            Growing Location
                        </label>

                        <select
                            id="weather-location"
                            value={location}
                            onChange={handleLocationChange}
                            disabled={locations.length === 0}
                        >

                            {locations.map((item) => (

                                <option
                                    key={item.location_id}
                                    value={item.location_name}
                                >
                                    {item.location_name}
                                </option>

                            ))}

                        </select>

                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div className={styles.weatherError} role="alert">

                        <AlertTriangleIcon />

                        <div>

                            <strong>
                                Unable to load weather
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* LOADING */}

                {loading && (

                    <div className={styles.weatherLoading}>

                        <CloudSunIcon size={36} />

                        <p>
                            Loading weather information...
                        </p>

                    </div>

                )}


                {/* WEATHER CONTENT */}

                {!loading &&
                    !error &&
                    currentWeather && (

                    <>

                        {/* CURRENT WEATHER */}

                        <section className={styles.currentGrid}>

                            <div className={styles.currentCard}>

                                <div className={styles.currentLocation}>

                                    <MapPinIcon />

                                    {location}, Pangasinan

                                </div>


                                <div className={styles.currentMain}>

                                    <div className={styles.currentIcon}>

                                        <WeatherIcon
                                            condition={currentWeather.weather_condition}
                                            size={52}
                                        />

                                    </div>


                                    <div>

                                        <strong className={styles.currentTemp}>

                                            {Math.round(
                                                currentWeather.temperature
                                            )}

                                            °C

                                        </strong>

                                        <span className={styles.currentDescription}>

                                            {currentWeather.weather_description}

                                        </span>

                                    </div>

                                </div>


                                <span className={styles.currentFeels}>

                                    Feels like{" "}

                                    {Math.round(
                                        currentWeather.feels_like
                                    )}

                                    °C

                                </span>

                            </div>


                            <div className={styles.statGrid}>

                                <div className={styles.statCard}>

                                    <span className={`${styles.statIcon} ${styles.toneWater}`}>
                                        <DropIcon />
                                    </span>

                                    <div>

                                        <small>
                                            Humidity
                                        </small>

                                        <strong>
                                            {currentWeather.humidity}%
                                        </strong>

                                    </div>

                                </div>


                                <div className={styles.statCard}>

                                    <span className={`${styles.statIcon} ${styles.toneSoil}`}>
                                        <WindIcon />
                                    </span>

                                    <div>

                                        <small>
                                            Wind
                                        </small>

                                        <strong>
                                            {currentWeather.wind_speed} m/s
                                        </strong>

                                    </div>

                                </div>


                                <div className={styles.statCard}>

                                    <span className={`${styles.statIcon} ${styles.toneMint}`}>
                                        <RainIcon />
                                    </span>

                                    <div>

                                        <small>
                                            Rainfall
                                        </small>

                                        <strong>
                                            {currentWeather.rainfall} mm
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* CURRENT WEATHER-BASED CARE ADVISORIES */}

                        <section className={styles.weatherSection}>

                            <div className={styles.sectionTitle}>

                                <div>

                                    <span className={styles.eyebrow}>
                                        Smart Plant Care
                                    </span>

                                    <h2>
                                        Current Care Advisories
                                    </h2>

                                </div>

                            </div>

                            {renderAdvisories(
                                currentAdvisories,
                                "No current care advisories available.",
                                false
                            )}

                        </section>


                        {/* FORECAST-BASED CARE ADVISORIES */}

                        <section className={styles.weatherSection}>

                            <div className={styles.sectionTitle}>

                                <div>

                                    <span className={styles.eyebrow}>
                                        Weather Preparation
                                    </span>

                                    <h2>
                                        Upcoming Care Advisories
                                    </h2>

                                </div>

                            </div>

                            {renderAdvisories(
                                forecastAdvisories,
                                "No upcoming care advisories available.",
                                true
                            )}

                            {advisoryError && (

                                <div className={styles.weatherError} role="alert">

                                    <AlertTriangleIcon />

                                    <div>

                                        <strong>
                                            Unable to load care advisories
                                        </strong>

                                        <p>
                                            {advisoryError}
                                        </p>

                                    </div>

                                </div>

                            )}

                        </section>


                        {/* TEMPERATURE TREND (from the forecast) */}

                        {trendItems.length > 1 && (

                            <section className={styles.weatherSection}>

                                <div className={styles.sectionTitle}>

                                    <div>

                                        <span className={styles.eyebrow}>
                                            Next hours
                                        </span>

                                        <h2>
                                            Temperature Trend
                                        </h2>

                                    </div>

                                </div>

                                <div className={styles.trendBars}>

                                    {trendItems.map((item, index) => (

                                        <div
                                            className={styles.trendBar}
                                            key={`${item.datetime}-trend-${index}`}
                                        >

                                            <span className={styles.trendValue}>
                                                {Math.round(item.temperature)}°
                                            </span>

                                            <div
                                                className={styles.trendColumn}
                                                style={{
                                                    height: `${trendHeight(item.temperature)}px`
                                                }}
                                            />

                                            <span className={styles.trendLabel}>
                                                {formatTrendLabel(item.datetime)}
                                            </span>

                                        </div>

                                    ))}

                                </div>

                            </section>

                        )}


                        {/* FORECAST */}

                        <section className={styles.weatherSection}>

                            <div className={styles.sectionTitle}>

                                <div>

                                    <span className={styles.eyebrow}>
                                        Extended Forecast
                                    </span>

                                    <h2>
                                        Upcoming Weather
                                    </h2>

                                </div>

                                <p>
                                    Weather forecast provided
                                    through OpenWeatherMap.
                                </p>

                            </div>


                            <div className={styles.forecastGrid}>

                                {forecast.map(
                                    (item, index) => (

                                        <article
                                            className={styles.forecastCard}
                                            key={`${item.datetime}-${index}`}
                                        >

                                            <span className={styles.forecastDate}>

                                                {formatForecastDate(
                                                    item.datetime
                                                )}

                                            </span>


                                            <span className={styles.forecastTime}>

                                                {formatForecastTime(
                                                    item.datetime
                                                )}

                                            </span>


                                            <div className={styles.forecastIcon}>

                                                <WeatherIcon
                                                    condition={item.weather_condition}
                                                    size={26}
                                                />

                                            </div>


                                            <strong className={styles.forecastTemp}>

                                                {Math.round(
                                                    item.temperature
                                                )}

                                                °C

                                            </strong>


                                            <span className={styles.forecastCondition}>

                                                {item.weather_description}

                                            </span>


                                            <div className={styles.forecastDetails}>

                                                <span>
                                                    <DropIcon size={14} />
                                                    {item.humidity}%
                                                </span>

                                                <span>
                                                    <RainIcon size={14} />
                                                    {item.rainfall} mm
                                                </span>

                                            </div>

                                        </article>

                                    )
                                )}

                            </div>

                        </section>

                    </>

                )}

            </div>

        </section>

    );

}
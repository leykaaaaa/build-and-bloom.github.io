"use client";

import { useCallback, useEffect, useState } from "react";
import { getWeatherAdvisory } from "../../../services/weatherService";
import {
    getAdminAdvisories,
    sendWeatherAdvisory
} from "../../../services/notificationService";
import styles from "./weather.module.css";

const API_URL = "http://localhost:5000";

function formatDate(value) {
    return new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

export default function AdminWeatherPage() {
    const [locations, setLocations] = useState([]);
    const [locationId, setLocationId] = useState("");
    const [recipientScope, setRecipientScope] = useState("all");
    const [weather, setWeather] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [advisories, setAdvisories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        title: "",
        message: "",
        advisory_type: "general",
        priority: "info"
    });

    const selectedLocation = locations.find(
        (location) => String(location.location_id) === locationId
    );

    const loadAdvisories = useCallback(async () => {
        const result = await getAdminAdvisories();
        setAdvisories(result.data || []);
    }, []);

    useEffect(() => {
        async function loadPage() {
            try {
                const [locationResponse] = await Promise.all([
                    fetch(`${API_URL}/api/locations`),
                    loadAdvisories()
                ]);
                const locationResult = await locationResponse.json();

                if (!locationResponse.ok || !locationResult.success) {
                    throw new Error(locationResult.message || "Failed to load locations.");
                }

                const availableLocations = locationResult.data || [];
                setLocations(availableLocations);
                if (availableLocations.length > 0) {
                    setLocationId(String(availableLocations[0].location_id));
                }
            } catch (requestError) {
                console.error("Failed to load weather dashboard:", requestError);
                setError(requestError.message || "Unable to load weather dashboard.");
            } finally {
                setLoading(false);
            }
        }

        loadPage();
    }, [loadAdvisories]);

    useEffect(() => {
        if (!selectedLocation) {
            return;
        }

        let active = true;
        setWeatherLoading(true);
        setWeather(null);
        setSuggestions([]);

        getWeatherAdvisory(selectedLocation.location_name)
            .then((result) => {
                if (active) {
                    setWeather(result.currentWeather);
                    setSuggestions([
                        ...(result.currentAdvisories || []),
                        ...(result.forecastAdvisories || [])
                    ]);
                    setError("");
                }
            })
            .catch((requestError) => {
                console.error("Failed to load selected location weather:", requestError);
                if (active) {
                    setError(requestError.message || "Unable to retrieve weather for this location.");
                }
            })
            .finally(() => {
                if (active) {
                    setWeatherLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [selectedLocation]);

    function selectSuggestion(suggestion) {
        setForm({
            title: suggestion.title,
            message: suggestion.message,
            advisory_type: suggestion.type || "general",
            priority: suggestion.priority || "info"
        });
        setSuccess("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSending(true);
        setError("");
        setSuccess("");

        try {
            const result = await sendWeatherAdvisory({
                ...form,
                location_id: recipientScope === "all" ? null : Number(locationId)
            });
            setSuccess(`Advisory sent to ${result.data.recipient_count} user(s).`);
            setForm({
                title: "",
                message: "",
                advisory_type: "general",
                priority: "info"
            });
            await loadAdvisories();
        } catch (requestError) {
            console.error("Failed to send weather advisory:", requestError);
            setError(requestError.message || "Unable to send weather advisory.");
        } finally {
            setSending(false);
        }
    }

    if (loading) {
        return <div className={styles.state}>Loading weather dashboard...</div>;
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>ADMIN · WEATHER CENTER</span>
                    <h1>Weather advisories</h1>
                    <p>Review local conditions and send actionable alerts to growers.</p>
                </div>
                <span className={styles.headerIcon} aria-hidden="true">
                    <i className="fa-solid fa-cloud-sun" />
                </span>
            </header>

            {error && <div className={styles.error} role="alert">{error}</div>}
            {success && <div className={styles.success} role="status">{success}</div>}

            <section className={styles.weatherPanel}>
                <div className={styles.panelHeading}>
                    <div>
                        <span className={styles.sectionEyebrow}>LIVE CONDITIONS</span>
                        <h2>Weather dashboard</h2>
                    </div>
                    <label className={styles.locationLabel}>
                        Weather location
                        <select
                            value={locationId}
                            onChange={(event) => setLocationId(event.target.value)}
                            disabled={locations.length === 0}
                        >
                            {locations.map((location) => (
                                <option key={location.location_id} value={location.location_id}>
                                    {location.location_name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {weatherLoading ? (
                    <div className={styles.state}>Retrieving the latest weather and advisories...</div>
                ) : weather ? (
                    <>
                        <div className={styles.weatherStats}>
                            <div><span>Temperature</span><strong>{weather.temperature}°C</strong></div>
                            <div><span>Feels like</span><strong>{weather.feels_like}°C</strong></div>
                            <div><span>Humidity</span><strong>{weather.humidity}%</strong></div>
                            <div><span>Rainfall</span><strong>{weather.rainfall} mm</strong></div>
                            <div><span>Conditions</span><strong>{weather.weather_description}</strong></div>
                        </div>
                        <p className={styles.weatherFootnote}>
                            {weather.location} · Updated {formatDate(weather.recorded_at)}
                        </p>
                    </>
                ) : (
                    <div className={styles.state}>Weather data is not available for a selected location.</div>
                )}
            </section>

            <section className={styles.suggestionsPanel}>
                <div className={styles.panelHeading}>
                    <div>
                        <span className={styles.sectionEyebrow}>AUTOMATIC SUGGESTIONS</span>
                        <h2>Weather advisory suggestions</h2>
                    </div>
                </div>
                {suggestions.length === 0 ? (
                    <p className={styles.helpText}>
                        {weatherLoading ? "Checking current conditions and forecast..." : "No advisory suggestions are available."}
                    </p>
                ) : (
                    <div className={styles.suggestionList}>
                        {suggestions.map((suggestion, index) => (
                            <article className={styles.suggestion} key={`${suggestion.title}-${index}`}>
                                <div>
                                    <span className={`${styles.priority} ${styles[suggestion.priority]}`}>
                                        {suggestion.priority}
                                    </span>
                                    <h3>{suggestion.title}</h3>
                                    <p>{suggestion.message}</p>
                                </div>
                                <button type="button" onClick={() => selectSuggestion(suggestion)}>
                                    Use this advisory
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className={styles.composePanel}>
                <div className={styles.panelHeading}>
                    <div>
                        <span className={styles.sectionEyebrow}>SEND TO GROWERS</span>
                        <h2>Compose notification</h2>
                    </div>
                </div>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <label>
                        Advisory title
                        <input
                            required
                            maxLength={150}
                            value={form.title}
                            onChange={(event) => setForm({ ...form, title: event.target.value })}
                            placeholder="e.g. Heavy Rain Advisory"
                        />
                    </label>
                    <label>
                        Message
                        <textarea
                            required
                            maxLength={5000}
                            rows={4}
                            value={form.message}
                            onChange={(event) => setForm({ ...form, message: event.target.value })}
                            placeholder="Explain what growers should do."
                        />
                    </label>
                    <div className={styles.formRow}>
                        <label>
                            Priority
                            <select
                                value={form.priority}
                                onChange={(event) => setForm({ ...form, priority: event.target.value })}
                            >
                                <option value="info">Information</option>
                                <option value="warning">Warning</option>
                                <option value="high">High</option>
                            </select>
                        </label>
                        <label>
                            Recipients
                            <select
                                value={recipientScope}
                                onChange={(event) => setRecipientScope(event.target.value)}
                            >
                                <option value="all">All users</option>
                                <option value="location" disabled={!selectedLocation}>
                                    Users in {selectedLocation?.location_name || "selected location"}
                                </option>
                            </select>
                        </label>
                    </div>
                    <button className={styles.sendButton} type="submit" disabled={sending || !selectedLocation}>
                        {sending ? "Sending..." : "Send weather advisory"}
                    </button>
                </form>
            </section>

            <section className={styles.historyPanel}>
                <div className={styles.panelHeading}>
                    <div>
                        <span className={styles.sectionEyebrow}>DELIVERY HISTORY</span>
                        <h2>Recently sent advisories</h2>
                    </div>
                </div>
                {advisories.length === 0 ? (
                    <p className={styles.helpText}>No weather advisories have been sent yet.</p>
                ) : (
                    <div className={styles.historyList}>
                        {advisories.map((advisory) => (
                            <article className={styles.historyItem} key={advisory.advisory_id}>
                                <div>
                                    <strong>{advisory.title}</strong>
                                    <span>{advisory.target_scope === "all" ? "All locations" : advisory.location_name || "Location no longer available"} · {advisory.recipient_count} recipients · {formatDate(advisory.created_at)}</span>
                                </div>
                                <span className={`${styles.priority} ${styles[advisory.priority]}`}>
                                    {advisory.priority}
                                </span>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

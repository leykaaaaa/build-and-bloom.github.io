"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    useRouter,
    useSearchParams
} from "next/navigation";

import { assessCrops } from "../../services/recommendationService";
import { getCropById } from "../../services/cropService";
import CropImage from "../../components/CropImage";

export default function AssessmentPage() {

    const router = useRouter();

    const searchParams = useSearchParams();

    const selectedCrop = searchParams.get("crop");

   const [form, setForm] = useState({
    location: "",
    soil: "",
    water: "",
    sunlight: "",
    environment: "",
    planting_month: ""
});

    const [specificCrop, setSpecificCrop] = useState(null);
    const [locations, setLocations] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(true);
    const [locationsError, setLocationsError] = useState("");

    const [results, setResults] = useState([]);

    const [locationDetails, setLocationDetails] = useState(null);

    const [currentWeather, setCurrentWeather] =
        useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [submitted, setSubmitted] = useState(false);

        /*
        Protect the assessment page.
        Only logged-in users can access it.
    */

    useEffect(() => {

        const storedUser =
            localStorage.getItem(
                "buildAndBloomUser"
            );


        if (!storedUser) {

            router.push("/login");

            return;

        }


        try {

            const parsedUser =
                JSON.parse(storedUser);


            if (!parsedUser?.user_id) {

                localStorage.removeItem(
                    "buildAndBloomUser"
                );

                router.push("/login");

            }

        } catch (error) {

            console.error(
                "Invalid stored user:",
                error
            );

            localStorage.removeItem(
                "buildAndBloomUser"
            );

            router.push("/login");

        }

    }, [router]);


    
/*
    Load all Pangasinan locations from the database API.
*/

useEffect(() => {

    async function loadLocations() {

        try {

            setLocationsLoading(true);
            setLocationsError("");

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

            console.error("Location loading error:", error);

            setLocationsError(
                error.message || "Unable to load locations."
            );

        } finally {

            setLocationsLoading(false);

        }

    }

    loadLocations();

}, []);


    /*
        Load specific crop when the page is opened
        through "Can I Grow This?"
    */

    useEffect(() => {

        async function loadSpecificCrop() {

            if (!selectedCrop) {
                return;
            }

            try {

                const crop =
                    await getCropById(selectedCrop);

                setSpecificCrop(crop);

            } catch (err) {

                console.error(err);

            }

        }

        loadSpecificCrop();

    }, [selectedCrop]);


    function handleChange(event) {

        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

    }


    async function handleSubmit(event) {

        event.preventDefault();

        setLoading(true);

        setError("");

        setSubmitted(false);

        setResults([]);

        setCurrentWeather(null);

        setLocationDetails(null);

        try {

           const storedUser =
    localStorage.getItem("buildAndBloomUser");

const loggedInUser =
    storedUser
        ? JSON.parse(storedUser)
        : null;


const result = await assessCrops({
    ...form,

    crop_id: selectedCrop
        ? Number(selectedCrop)
        : null,

    user_id:
        loggedInUser?.user_id || null
});


            console.log(
                "Assessment API result:",
                result
            );


            /*
                IMPORTANT:
                Backend returns recommendations,
                not data.
            */

            setResults(
                Array.isArray(result.recommendations)
                    ? result.recommendations
                    : []
            );


            setCurrentWeather(
                result.currentWeather || null
            );

            setLocationDetails(
                result.locationDetails || null
            );

            setSubmitted(true);


        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to process the assessment."
            );

        } finally {

            setLoading(false);

        }

    }


    return (

        <section className="assessment-page">

            <div className="assessment-container">


                {/* HEADER */}

                <div className="assessment-header">

                    <span className="section-badge">
                        Build & Bloom
                    </span>

                    <h1>
                        Crop Assessment
                    </h1>

                    <p>
                        Get crop recommendations tailored to your location,
                        growing conditions, and planting schedule.
                    </p>

                </div>

                <div className="assessment-steps" aria-label="Assessment steps">
                    <div className="assessment-step">
                        <span>01</span>
                        <div>
                            <strong>Choose location</strong>
                            <small>Where you'll grow</small>
                        </div>
                    </div>
                    <div className="assessment-step">
                        <span>02</span>
                        <div>
                            <strong>Set conditions</strong>
                            <small>Soil, water, and sunlight</small>
                        </div>
                    </div>
                    <div className="assessment-step">
                        <span>03</span>
                        <div>
                            <strong>Pick a month</strong>
                            <small>When you plan to plant</small>
                        </div>
                    </div>
                </div>


                {/* SPECIFIC CROP */}

                {specificCrop && (

                    <div className="specific-crop-banner">

                        <span aria-hidden="true"></span>

                        <div>

                            <strong>
                                Checking:{" "}
                                {specificCrop.crop_name}
                            </strong>

                            <p>
                                This assessment will determine
                                whether your conditions are suitable
                                for growing{" "}
                                {specificCrop.crop_name}.
                            </p>

                        </div>

                    </div>

                )}


                {/* ASSESSMENT FORM */}

                <div className="assessment-card">

                    <form onSubmit={handleSubmit}>

                        <div className="assessment-form-heading">
                            <div>
                                <span>YOUR GROWING PLAN</span>
                                <h2>Assessment details</h2>
                            </div>
                            <p>Complete each section to get your crop matches.</p>
                        </div>

                        {/* LOCATION */}

                        <div className="form-section">

                            <h2>
                                 Your Growing Location
                            </h2>

                            <p className="form-description">
                                Select the Pangasinan location where
                                you plan to grow.
                            </p>


                            <label htmlFor="assessment-location">
                                Location
                            </label>

                            
                            <select
                                id="assessment-location"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                required
                                disabled={locationsLoading || locations.length === 0}
                            >

                                <option value="">
                                    {locationsLoading
                                        ? "Loading locations..."
                                        : "Select your location"}
                                </option>

                                {locations.map((location) => (

                                    <option
                                        key={location.location_id}
                                        value={location.location_name}
                                    >
                                        {location.location_name} ({location.location_type})
                                    </option>

                                ))}

                            </select>

                            {locationsError && (
                                <p className="form-error">
                                    {locationsError}
                                </p>
                            )}

                        </div>


                        {/* GROWING CONDITIONS */}

                        <div className="form-section">

                            <h2>
                                 Growing Conditions
                            </h2>

                            <p className="form-description">
                                Provide the conditions available
                                in your growing area.
                            </p>


                            <div className="assessment-grid">


                                {/* SOIL */}

                                <div className="assessment-field">

                                    <label htmlFor="assessment-soil">
                                        Soil Type
                                    </label>

                                    <select
                                        id="assessment-soil"
                                        name="soil"
                                        value={form.soil}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select soil type
                                        </option>

                                        <option value="Loam">
                                            Loam
                                        </option>

                                        <option value="Clay">
                                            Clay
                                        </option>

                                        <option value="Sandy">
                                            Sandy
                                        </option>

                                        <option value="Silty">
                                            Silty
                                        </option>

                                    </select>

                                </div>


                                {/* WATER */}

                                <div className="assessment-field">

                                    <label htmlFor="assessment-water">
                                        Water Availability
                                    </label>

                                    <select
                                        id="assessment-water"
                                        name="water"
                                        value={form.water}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select water availability
                                        </option>

                                        <option value="Low">
                                            Low
                                        </option>

                                        <option value="Moderate">
                                            Moderate
                                        </option>

                                        <option value="High">
                                            High
                                        </option>

                                    </select>

                                </div>


                                {/* SUNLIGHT */}

                                <div className="assessment-field">

                                    <label htmlFor="assessment-sunlight">
                                        Sunlight
                                    </label>

                                    <select
                                        id="assessment-sunlight"
                                        name="sunlight"
                                        value={form.sunlight}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select sunlight
                                        </option>

                                        <option value="Low">
                                            Low
                                        </option>

                                        <option value="Partial">
                                            Partial Sun
                                        </option>

                                        <option value="Full">
                                            Full Sun
                                        </option>

                                    </select>

                                </div>


                                {/* ENVIRONMENT */}

                                <div className="assessment-field">

                                    <label htmlFor="assessment-environment">
                                        Growing Environment
                                    </label>

                                    <select
                                        id="assessment-environment"
                                        name="environment"
                                        value={form.environment}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select environment
                                        </option>

                                        <option value="Open Field">
                                            Open Field
                                        </option>

                                        <option value="Greenhouse">
                                            Greenhouse
                                        </option>

                                        <option value="Container">
                                            Container
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>
                        {/* PLANTING MONTH */}

                        <div className="form-section">

                            <h2>
                                Planting Schedule
                            </h2>

                            <p className="form-description">
                                Choose when you plan to start planting.
                            </p>

                            <div className="assessment-field assessment-month-field">
                                <label htmlFor="assessment-planting-month">
                                    Intended Planting Month
                                </label>

                                <select
                                    id="assessment-planting-month"
                                    name="planting_month"
                                    value={form.planting_month}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select planting month
                                    </option>

                                    {[
                                        "January",
                                        "February",
                                        "March",
                                        "April",
                                        "May",
                                        "June",
                                        "July",
                                        "August",
                                        "September",
                                        "October",
                                        "November",
                                        "December"
                                    ].map((month) => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}

                                </select>
                            </div>

                        </div>

                        {/* WEATHER NOTE */}

                        <div className="assessment-note">

                            <span aria-hidden="true">️</span>

                            <div>

                                <strong>
                                    Weather is included in the analysis
                                </strong>

                                <p>
                                    Current weather conditions are
                                    considered together with your
                                    growing conditions and crop
                                    requirements when calculating
                                    compatibility.
                                </p>

                            </div>

                        </div>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="assessment-submit"
                            disabled={loading}
                            aria-busy={loading}
                        >

                            {loading
                                ? "Analyzing..."
                                : "Analyze Growing Conditions"
                            }

                        </button>

                    </form>


                    {/* ERROR */}

                    {error && (

                        <div className="assessment-error">

                            <span>
                                ️
                            </span>

                            <div>

                                <strong>
                                    Assessment failed
                                </strong>

                                <p>
                                    {error}
                                </p>

                            </div>

                        </div>

                    )}

                </div>


                {/* RESULTS */}

                {submitted && (

                    <section className="assessment-results">


                        {/* RESULT HEADER */}

                        <div className="results-header">

                            <div>

                                <span className="section-badge">
                                     Results
                                </span>

                                <h2>
                                    Crop Compatibility Results
                                </h2>

                                <p>
                                    Based on the growing conditions
                                    and current weather conditions
                                    available for your selected
                                    location.
                                </p>

                            </div>


                            <div className="results-count">
                                {results.length}

                            <span>
                                {results.length === 1
                                    ? "highly suitable crop found"
                                    : "highly suitable crops found"}
                            </span>

                            </div>

                        </div>


                        {/* CURRENT WEATHER SUMMARY */}

                        {/* LOCATION RISK SUMMARY */}

                        {locationDetails && (
                            <div className="location-risk-summary">
                                <h3>Location Risk Assessment</h3>

                                <p>
                                    <strong>Location:</strong>{" "}
                                    {locationDetails.location_name || form.location}
                                </p>

                                <p>
                                    <strong>Overall Risk Level:</strong>{" "}
                                    {locationDetails.risk_level || "Unknown"}
                                </p>

                                <p>
                                    {locationDetails.risk_message ||
                                        "Location risk information is unavailable."}
                                </p>

                                {Array.isArray(locationDetails.warnings) &&
                                    locationDetails.warnings.length > 0 && (
                                        <div>
                                            <strong>Location Warnings</strong>

                                            <ul>
                                                {locationDetails.warnings.map(
                                                    (warning, index) => (
                                                        <li key={index}>{warning}</li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}
                            </div>
                        )}

                        {currentWeather && (

                            <div className="assessment-weather-summary">

                                <div className="assessment-weather-icon" aria-hidden="true">
                                    ️
                                </div>

                                <div>

                                    <span>
                                        Current Weather
                                    </span>

                                    <strong>
                                        {Math.round(
                                            currentWeather.temperature
                                        )}°C
                                    </strong>

                                    <p>
                                        {currentWeather.weather_description}
                                        {" · "}
                                        Humidity{" "}
                                        {currentWeather.humidity}%
                                    </p>

                                </div>

                            </div>

                        )}


                        {/* NO RESULTS */}

                        {results.length === 0 ? (

                            <div className="no-results">

                                <div className="no-results-icon" aria-hidden="true">
                                    
                                </div>
                                <h3>
                                    No highly suitable crops found
                                </h3>

                                <p>
                                    {specificCrop
                                        ? `${specificCrop.crop_name} did not meet the 70% minimum score for a highly suitable recommendation based on the conditions you entered.`
                                        : "None of the available crops met the 70% minimum score for a highly suitable recommendation based on the conditions you entered."}
                                    {" "}Try adjusting your growing conditions or explore the Crop Catalogue to learn more about different crops.
                                </p>

                                <Link
                                    href="/crops"
                                    className="no-results-button"
                                >
                                    Explore Crop Catalogue 
                                </Link>

                            </div>

                        ) : (

                            <div className="recommendation-grid">

                                {results.map((crop) => (

                                    <article
                                        className="recommendation-card"
                                        key={crop.crop_id}
                                    >


                                        {/* CROP HEADER */}

                                        <div className="recommendation-top">

                                            <CropImage
                                                cropName={crop.crop_name}
                                                className="recommendation-image"
                                                sizes="52px"
                                            />

                                            <div>

                                                <span className="crop-category">
                                                    {crop.category}
                                                </span>

                                                <h3>
                                                    {crop.crop_name}
                                                </h3>

                                            </div>

                                        </div>


                                        {/* SCORE */}

                                        <div className="compatibility-score">

                                            <strong>
                                                {crop.score}%
                                            </strong>

                                            <span>
                                                Compatibility
                                            </span>

                                        </div>


                                        {/* LEVEL */}

                                        <div
                                            className={`compatibility-level ${
                                                crop.compatibility_level
                                                    .toLowerCase()
                                                    .replaceAll(
                                                        " ",
                                                        "-"
                                                    )
                                            }`}
                                        >

                                            {crop.compatibility_level}

                                        </div>


                                        {/* FACTORS */}

                                        <div className="factor-list">

                                        <div>
                                            <span>Soil</span>
                                            <strong>{crop.factors.soil}%</strong>
                                        </div>

                                        <div>
                                            <span>Water</span>
                                            <strong>{crop.factors.water}%</strong>
                                        </div>

                                        <div>
                                            <span>Sunlight</span>
                                            <strong>{crop.factors.sunlight}%</strong>
                                        </div>

                                        <div>
                                            <span>Environment</span>
                                            <strong>{crop.factors.environment}%</strong>
                                        </div>

                                        <div>
                                            <span>Weather</span>
                                            <strong>{crop.factors.weather}%</strong>
                                        </div>

                                        <div>
                                            <span>Planting Season</span>
                                            <strong>{crop.factors.season}%</strong>
                                        </div>

                                        <div className="location-factor">
                                            <span>Location Suitability</span>
                                            <strong>{crop.factors.location_suitability ?? "N/A"}{crop.factors.location_suitability != null ? "%" : ""}</strong>
                                        </div>

                                        <div>
                                            <span>Flood Compatibility</span>
                                            <strong>{crop.factors.flood ?? "N/A"}{crop.factors.flood != null ? "%" : ""}</strong>
                                        </div>

                                        <div>
                                            <span>Drainage Compatibility</span>
                                            <strong>{crop.factors.drainage ?? "N/A"}{crop.factors.drainage != null ? "%" : ""}</strong>
                                        </div>

                                    </div>

                                        {/* EXPLANATION */}

                                                <div className="recommendation-explanation">

                                    <strong>
                                        Why?
                                    </strong>

                                    <p>
                                        {crop.explanation}
                                    </p>

                                    {crop.planting_season && (
                                        <p>
                                            <strong>Selected planting month:</strong>{" "}
                                            {form.planting_month} — {crop.planting_season}
                                        </p>
                                    )}

                                </div>



                                        {/* CROP-SPECIFIC LOCATION RISK */}

                                        <div className="crop-location-risk">
                                            <strong>
                                                Crop-Specific Location Caution:{" "}
                                                {crop.crop_location_risk || "Unknown"}
                                            </strong>

                                            <p>
                                                {crop.crop_location_risk_message ||
                                                    "Crop-specific location risk information is unavailable."}
                                            </p>
                                        </div>



                                        {/* ACTIONS */}

                                        <div className="recommendation-actions">

                                            <Link
                                                href={`/crops/${crop.crop_id}`}
                                                className="view-recommendation"
                                            >
                                                View Crop
                                            </Link>
                                    <Link
                                        href={`/plants/plan?crop=${crop.crop_id}`}
                                        className="plan-recommendation"
                                    >
                                        Plan This Plant
                                    </Link>

                                        </div>

                                    </article>

                                ))}

                            </div>

                        )}

                    </section>

                )}

            </div>

        </section>

    );

}
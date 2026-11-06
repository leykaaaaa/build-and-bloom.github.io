"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    useRouter,
    useSearchParams
} from "next/navigation";

import { assessCrops } from "../../services/recommendationService";
import { getCropById } from "../../services/cropService";
import CropImage from "../../components/CropImage";

import styles from "./assessment.module.css";


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

const MapPinIcon = ({ size }) => (
    <Icon size={size}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </Icon>
);

const LayersIcon = ({ size }) => (
    <Icon size={size}>
        <path d="m12 2 10 5-10 5L2 7z" />
        <path d="m2 12 10 5 10-5" />
        <path d="m2 17 10 5 10-5" />
    </Icon>
);

const DropIcon = ({ size }) => (
    <Icon size={size}>
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </Icon>
);

const SunIcon = ({ size }) => (
    <Icon size={size}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
);

const HomeIcon = ({ size }) => (
    <Icon size={size}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
    </Icon>
);

const CalendarIcon = ({ size }) => (
    <Icon size={size}>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
    </Icon>
);

const ArrowRightIcon = ({ size = 18 }) => (
    <Icon size={size} strokeWidth={2.4}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </Icon>
);

const ResetIcon = ({ size = 18 }) => (
    <Icon size={size} strokeWidth={2.4}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </Icon>
);

const CloudSunIcon = ({ size = 24 }) => (
    <Icon size={size}>
        <path d="M12 2v2M4.9 4.9l1.4 1.4M20 12h2M19.1 4.9l-1.4 1.4M15.9 11.5a4 4 0 0 0-7.8-.5" />
        <path d="M17.5 19H9a5 5 0 1 1 4.9-6.1" />
        <path d="M17.5 19a3.5 3.5 0 0 0 0-7h-.4" />
    </Icon>
);

const SproutIcon = ({ size = 24 }) => (
    <Icon size={size}>
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </Icon>
);

const ShieldIcon = ({ size = 24 }) => (
    <Icon size={size}>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </Icon>
);

const AlertIcon = ({ size = 20 }) => (
    <Icon size={size}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </Icon>
);

const SearchXIcon = ({ size = 28 }) => (
    <Icon size={size}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
        <path d="m8.5 8.5 5 5" />
        <path d="m13.5 8.5-5 5" />
    </Icon>
);


const MONTHS = [
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
];

const INITIAL_FORM = {
    location: "",
    soil: "",
    water: "",
    sunlight: "",
    environment: "",
    planting_month: ""
};

const FACTOR_LABELS = [
    ["Soil", "soil"],
    ["Water", "water"],
    ["Sunlight", "sunlight"],
    ["Environment", "environment"],
    ["Weather", "weather"],
    ["Planting Season", "season"],
    ["Location Suitability", "location_suitability"],
    ["Flood Compatibility", "flood"],
    ["Drainage Compatibility", "drainage"]
];

function formatFactor(value) {
    return value == null ? "N/A" : `${value}%`;
}

function levelClass(level) {

    const value = String(level || "").toLowerCase();

    if (value.includes("high")) {
        return styles.levelHigh;
    }

    if (value.includes("moder")) {
        return styles.levelModerate;
    }

    return styles.levelLow;
}

function clampPercent(value) {
    return Math.min(100, Math.max(0, Number(value) || 0));
}


export default function AssessmentPage() {

    const router = useRouter();

    const searchParams = useSearchParams();

    const selectedCrop = searchParams.get("crop");

    const resultsRef = useRef(null);

    const [form, setForm] = useState(INITIAL_FORM);

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

    const [levelFilter, setLevelFilter] = useState("");

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
        through "Run Assessment" / "Can I Grow This?"
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


    /*
        After the results arrive, bring them into view.
    */

    useEffect(() => {

        if (!submitted || !resultsRef.current) {
            return;
        }

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        resultsRef.current.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
        });

    }, [submitted]);


    function handleChange(event) {

        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

    }


    function handleReset() {

        setForm(INITIAL_FORM);
        setResults([]);
        setCurrentWeather(null);
        setLocationDetails(null);
        setError("");
        setSubmitted(false);
        setLevelFilter("");

        window.scrollTo({ top: 0 });

    }


    async function handleSubmit(event) {

        event.preventDefault();

        setLoading(true);

        setError("");

        setSubmitted(false);

        setResults([]);

        setLevelFilter("");

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


    // Results are shown best match first
    const rankedResults = [...results].sort(
        (a, b) => (Number(b.score) || 0) - (Number(a.score) || 0)
    );

    const topPick = rankedResults[0];

    const levels = [
        ...new Set(
            rankedResults
                .map((crop) => crop.compatibility_level)
                .filter(Boolean)
        )
    ];

    const visibleResults = levelFilter
        ? rankedResults.filter(
            (crop) => crop.compatibility_level === levelFilter
        )
        : rankedResults;


    return (

        <section className={styles.assessmentPage}>

            <div className={styles.assessmentContainer}>


                {/* HEADER */}

                <div className={styles.pageHeader}>

                    <div className={styles.pageHeading}>

                        <span className={styles.eyebrow}>
                            Crop Assessment
                        </span>

                        <h1>
                            Assess Your Growing Conditions
                        </h1>

                        <p>
                            Get crop recommendations tailored to your location,
                            growing conditions, and planting schedule.
                        </p>

                    </div>

                </div>


                {/* SPECIFIC CROP */}

                {specificCrop && (

                    <div className={styles.cropBanner}>

                        <span className={styles.cropBannerIcon} aria-hidden="true">
                            <SproutIcon />
                        </span>

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


                {/* FORM + HOW IT WORKS */}

                <div className={styles.assessmentGrid}>

                    <form
                        className={styles.formCard}
                        onSubmit={handleSubmit}
                    >

                        <div className={styles.fieldGrid}>

                            {/* LOCATION */}

                            <div className={styles.field}>

                                <label htmlFor="assessment-location">
                                    Location
                                </label>

                                <div className={styles.selectWrap}>

                                    <span className={styles.fieldIcon}>
                                        <MapPinIcon size={20} />
                                    </span>

                                    <select
                                        id="assessment-location"
                                        className={styles.fieldSelect}
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

                                </div>

                                {locationsError && (
                                    <p className={styles.formError}>
                                        {locationsError}
                                    </p>
                                )}

                            </div>


                            {/* SOIL */}

                            <div className={styles.field}>

                                <label htmlFor="assessment-soil">
                                    Soil Type
                                </label>

                                <div className={styles.selectWrap}>

                                    <span className={styles.fieldIcon}>
                                        <LayersIcon size={20} />
                                    </span>

                                    <select
                                        id="assessment-soil"
                                        className={styles.fieldSelect}
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

                                        <option value="Sandy">
                                            Sandy
                                        </option>

                                        <option value="Silt">
                                            Silt
                                        </option>

                                        <option value="Clay">
                                            Clay
                                        </option>

                                        <option value="Peat">
                                            Peat
                                        </option>

                                        <option value="Chalky">
                                            Chalky
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* SUNLIGHT */}

                            <div className={styles.field}>

                                <label htmlFor="assessment-sunlight">
                                    Sunlight
                                </label>

                                <div className={styles.selectWrap}>

                                    <span className={styles.fieldIcon}>
                                        <SunIcon size={20} />
                                    </span>

                                    <select
                                        id="assessment-sunlight"
                                        className={styles.fieldSelect}
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

                            </div>


                            {/* WATER */}

                            <div className={styles.field}>

                                <label htmlFor="assessment-water">
                                    Water Availability
                                </label>

                                <div className={styles.selectWrap}>

                                    <span className={styles.fieldIcon}>
                                        <DropIcon size={20} />
                                    </span>

                                    <select
                                        id="assessment-water"
                                        className={styles.fieldSelect}
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

                            </div>


                            {/* ENVIRONMENT */}

                            <div className={styles.field}>

                                <label htmlFor="assessment-environment">
                                    Growing Environment
                                </label>

                                <div className={styles.selectWrap}>

                                    <span className={styles.fieldIcon}>
                                        <HomeIcon size={20} />
                                    </span>

                                    <select
                                        id="assessment-environment"
                                        className={styles.fieldSelect}
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

                                        <option value="Backyard Garden">
                                            Backyard Garden
                                        </option>

                                        <option value="Raised Garden Bed">
                                            Raised Garden Bed
                                        </option>

                                        <option value="Shade House">
                                            Shade House
                                        </option>

                                        <option value="Rooftop/ Balcony Garden">
                                            Rooftop/ Balcony Garden
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* PLANTING MONTH */}

                            <div className={styles.field}>

                                <label htmlFor="assessment-planting-month">
                                    Intended Planting Month
                                </label>

                                <div className={styles.selectWrap}>

                                    <span className={styles.fieldIcon}>
                                        <CalendarIcon size={20} />
                                    </span>

                                    <select
                                        id="assessment-planting-month"
                                        className={styles.fieldSelect}
                                        name="planting_month"
                                        value={form.planting_month}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select planting month
                                        </option>

                                        {MONTHS.map((month) => (
                                            <option key={month} value={month}>
                                                {month}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                            </div>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className={styles.assessmentError} role="alert">

                                <AlertIcon />

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


                        {/* SUBMIT */}

                        <div className={styles.formActions}>

                            <button
                                type="submit"
                                className={styles.primaryButton}
                                disabled={loading}
                                aria-busy={loading}
                            >

                                {loading
                                    ? "Analyzing..."
                                    : (
                                        <>
                                            Analyze Growing Conditions
                                            <ArrowRightIcon />
                                        </>
                                    )
                                }

                            </button>

                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={handleReset}
                                disabled={loading}
                            >
                                Reset
                            </button>

                        </div>

                    </form>


                    {/* SIDE PANEL */}

                    <aside className={styles.sidePanel}>

                        <div className={styles.howItWorks}>

                            <h2>
                                How it works
                            </h2>

                            <div className={styles.howStep}>
                                <span className={styles.howNumber}>1</span>
                                <div>
                                    <strong>Choose location</strong>
                                    <span>Where you&apos;ll grow</span>
                                </div>
                            </div>

                            <div className={styles.howStep}>
                                <span className={styles.howNumber}>2</span>
                                <div>
                                    <strong>Set conditions</strong>
                                    <span>Soil, water, and sunlight</span>
                                </div>
                            </div>

                            <div className={styles.howStep}>
                                <span className={styles.howNumber}>3</span>
                                <div>
                                    <strong>Pick a month</strong>
                                    <span>When you plan to plant</span>
                                </div>
                            </div>

                        </div>


                        {/* WEATHER NOTE */}

                        <div className={styles.noteCard}>

                            <span className={styles.noteIcon} aria-hidden="true">
                                <CloudSunIcon />
                            </span>

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

                    </aside>

                </div>


                {/* RESULTS */}

                {submitted && (

                    <section
                        className={styles.resultsSection}
                        ref={resultsRef}
                    >

                        {/* RESULT HEADER */}

                        <div className={styles.pageHeader}>

                            <div className={styles.pageHeading}>

                                <span className={styles.eyebrow}>
                                    Assessment Results
                                </span>

                                <h2>
                                    Your Crop Matches
                                </h2>

                                <p>
                                    Ranked by how well each crop fits your
                                    conditions, based on the growing
                                    conditions and current weather available
                                    for your selected location.
                                </p>

                            </div>

                            <div className={styles.countPill}>

                                <strong>
                                    {results.length}
                                </strong>

                                {results.length === 1
                                    ? "highly suitable crop found"
                                    : "highly suitable crops found"}

                            </div>

                        </div>


                        {/* TOP RECOMMENDATION */}

                        {topPick && (

                            <div className={styles.topPick}>

                                <div
                                    className={styles.matchRing}
                                    style={{
                                        background: `conic-gradient(#ffffff 0 ${clampPercent(topPick.score)}%, rgba(255, 255, 255, 0.22) 0)`
                                    }}
                                >

                                    <div className={styles.matchInner}>

                                        <strong>
                                            {topPick.score}%
                                        </strong>

                                        <span>
                                            MATCH
                                        </span>

                                    </div>

                                </div>


                                <div className={styles.topPickBody}>

                                    <span className={styles.eyebrow}>
                                        Top Recommendation
                                    </span>

                                    <h3>
                                        {topPick.crop_name}
                                    </h3>

                                    <span>
                                        Based on your conditions:
                                    </span>

                                    <div className={styles.topChips}>

                                        {form.location && (
                                            <span className={styles.topChip}>
                                                <MapPinIcon size={16} />
                                                {form.location}
                                            </span>
                                        )}

                                        {form.soil && (
                                            <span className={styles.topChip}>
                                                <LayersIcon size={16} />
                                                {form.soil}
                                            </span>
                                        )}

                                        {form.sunlight && (
                                            <span className={styles.topChip}>
                                                <SunIcon size={16} />
                                                {form.sunlight}
                                            </span>
                                        )}

                                        {form.water && (
                                            <span className={styles.topChip}>
                                                <DropIcon size={16} />
                                                {form.water}
                                            </span>
                                        )}

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* LOCATION RISK + CURRENT WEATHER */}

                        {(locationDetails || currentWeather) && (

                            <div className={styles.infoGrid}>

                                {locationDetails && (

                                    <div className={styles.infoCard}>

                                        <span className={`${styles.infoIcon} ${styles.toneLeaf}`}>
                                            <ShieldIcon />
                                        </span>

                                        <div className={styles.infoBody}>

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

                                    </div>

                                )}


                                {currentWeather && (

                                    <div className={styles.infoCard}>

                                        <span className={`${styles.infoIcon} ${styles.toneWater}`}>
                                            <CloudSunIcon />
                                        </span>

                                        <div className={styles.infoBody}>

                                            <span className={styles.infoLabel}>
                                                Current Weather
                                            </span>

                                            <strong className={styles.infoValue}>
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

                            </div>

                        )}


                        {/* NO RESULTS */}

                        {results.length === 0 ? (

                            <div className={styles.noResults}>

                                <span className={styles.noResultsIcon} aria-hidden="true">
                                    <SearchXIcon />
                                </span>

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
                                    className={styles.primaryButton}
                                >
                                    Explore Crop Catalogue
                                    <ArrowRightIcon />
                                </Link>

                            </div>

                        ) : (

                            <>

                                {/* LEVEL FILTER (only when there is more than one level) */}

                                {levels.length > 1 && (

                                    <div className={styles.filterRow}>

                                        <button
                                            type="button"
                                            className={`${styles.filterChip} ${!levelFilter ? styles.filterChipActive : ""}`}
                                            onClick={() => setLevelFilter("")}
                                        >
                                            All crops
                                        </button>

                                        {levels.map((level) => (

                                            <button
                                                type="button"
                                                key={level}
                                                className={`${styles.filterChip} ${levelFilter === level ? styles.filterChipActive : ""}`}
                                                onClick={() => setLevelFilter(level)}
                                            >
                                                {level}
                                            </button>

                                        ))}

                                    </div>

                                )}


                                {/* RANKED LIST */}

                                <div className={styles.rankList}>

                                    {visibleResults.map((crop) => {

                                        const rank =
                                            rankedResults.indexOf(crop) + 1;

                                        const factors =
                                            crop.factors || {};

                                        return (

                                            <article
                                                className={styles.rankCard}
                                                key={crop.crop_id}
                                            >

                                                <div className={styles.rankRow}>

                                                    <span className={styles.rankNumber}>
                                                        {rank}
                                                    </span>

                                                    <CropImage
                                                        cropName={crop.crop_name}
                                                        className={styles.rankImage}
                                                        sizes="84px"
                                                    />

                                                    <div className={styles.rankName}>

                                                        <strong>
                                                            {crop.crop_name}
                                                        </strong>

                                                        <span>
                                                            {crop.category}
                                                        </span>

                                                    </div>

                                                    <div className={styles.scoreWrap}>

                                                        <div className={styles.scoreTrack}>

                                                            <div
                                                                className={styles.scoreFill}
                                                                style={{
                                                                    width: `${clampPercent(crop.score)}%`
                                                                }}
                                                            />

                                                        </div>

                                                        <strong className={styles.scoreValue}>
                                                            {crop.score}%
                                                        </strong>

                                                    </div>

                                                    <span
                                                        className={`${styles.levelBadge} ${levelClass(crop.compatibility_level)}`}
                                                    >
                                                        {crop.compatibility_level}
                                                    </span>

                                                    <div className={styles.rankActions}>

                                                        <Link
                                                            href={`/crops/${crop.crop_id}`}
                                                            className={styles.softButton}
                                                        >
                                                            View Details
                                                            <ArrowRightIcon size={16} />
                                                        </Link>

                                                        <Link
                                                            href={`/plants/plan?crop=${crop.crop_id}`}
                                                            className={styles.primaryButton}
                                                        >
                                                            Plan This Plant
                                                        </Link>

                                                    </div>

                                                </div>


                                                {/* WHY THIS MATCH */}

                                                <details className={styles.detailsPanel}>

                                                    <summary className={styles.detailsToggle}>
                                                        Why this match?
                                                    </summary>

                                                    <div className={styles.detailsBody}>

                                                        <div className={styles.factorGrid}>

                                                            {FACTOR_LABELS.map(([label, key]) => (

                                                                <div
                                                                    className={styles.factorItem}
                                                                    key={key}
                                                                >

                                                                    <span>
                                                                        {label}
                                                                    </span>

                                                                    <strong>
                                                                        {formatFactor(factors[key])}
                                                                    </strong>

                                                                </div>

                                                            ))}

                                                        </div>


                                                        <div className={styles.explanation}>

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

                                                        <div className={styles.cautionBox}>

                                                            <strong>
                                                                Crop-Specific Location Caution:{" "}
                                                                {crop.crop_location_risk || "Unknown"}
                                                            </strong>

                                                            <p>
                                                                {crop.crop_location_risk_message ||
                                                                    "Crop-specific location risk information is unavailable."}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </details>

                                            </article>

                                        );

                                    })}

                                </div>

                            </>

                        )}


                        {/* NEW ASSESSMENT */}

                        <div>

                            <button
                                type="button"
                                className={styles.softButton}
                                onClick={handleReset}
                            >
                                <ResetIcon />
                                New Assessment
                            </button>

                        </div>

                    </section>

                )}

            </div>

        </section>

    );

}
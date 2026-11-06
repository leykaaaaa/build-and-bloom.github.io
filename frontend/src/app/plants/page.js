"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CropImage from "../../components/CropImage";
import styles from "./plants.module.css";

import {
    getPlantingPlans,
    getPlantingPlanAdvisories,
    updatePlantingPlanStatus
} from "../../services/plantingPlanService";


function Icon({ size = 18, strokeWidth = 2, children }) {
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

const SproutIcon = ({ size = 26 }) => (
    <Icon size={size}>
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </Icon>
);

const ClipboardIcon = () => (
    <Icon size={26}>
        <rect width="8" height="4" x="8" y="2" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </Icon>
);

const CalendarIcon = ({ size = 14 }) => (
    <Icon size={size}>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
    </Icon>
);

const BasketIcon = () => (
    <Icon size={26}>
        <path d="m5 11 4-7M19 11l-4-7M2 11h20" />
        <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
    </Icon>
);

const CheckCircleIcon = () => (
    <Icon size={26}>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </Icon>
);

const PlusIcon = ({ size = 18 }) => (
    <Icon size={size} strokeWidth={2.4}>
        <path d="M12 5v14M5 12h14" />
    </Icon>
);

const AlertIcon = () => (
    <Icon size={20}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4M12 17h.01" />
    </Icon>
);

const MapPinIcon = () => (
    <Icon size={14}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </Icon>
);

const CloudSunIcon = () => (
    <Icon size={16}>
        <path d="M12 2v2M4.9 4.9l1.4 1.4M20 12h2M19.1 4.9l-1.4 1.4M15.9 11.5a4 4 0 0 0-7.8-.5" />
        <path d="M17.5 19H9a5 5 0 1 1 4.9-6.1" />
        <path d="M17.5 19a3.5 3.5 0 0 0 0-7h-.4" />
    </Icon>
);

const BulbIcon = () => (
    <Icon size={16}>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6M10 22h4" />
    </Icon>
);

const statusOptions = [
    "Planned",
    "Growing",
    "Harvested",
    "Completed"
];

export default function MyPlantsPage() {

    const router = useRouter();

    const [user, setUser] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [advisoryLoadError, setAdvisoryLoadError] = useState("");
    const [updatingPlanId, setUpdatingPlanId] = useState(null);
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {

        async function loadPlans() {

            try {

                const storedUser = localStorage.getItem(
                    "buildAndBloomUser"
                );

                if (!storedUser) {
                    router.push("/login");
                    return;
                }

                const parsedUser = JSON.parse(storedUser);

                if (!parsedUser.user_id) {
                    setError(
                        "Unable to identify your account. Please log in again."
                    );
                    setLoading(false);
                    return;
                }

                setUser(parsedUser);

                // Retrieve all planting plans first.
                const planData = await getPlantingPlans(
                    parsedUser.user_id
                );

                const allPlans = Array.isArray(planData)
                    ? planData
                    : [];

                // Retrieve advisories separately so that a weather
                // service problem does not hide the user's plant plans.
                try {

                    const advisoryResponse =
                        await getPlantingPlanAdvisories(
                            parsedUser.user_id
                        );

                    const advisoryPlans = Array.isArray(advisoryResponse)
                        ? advisoryResponse
                        : advisoryResponse?.data || [];

                    // Match advisories to their corresponding plans.
                    const advisoryMap = new Map(
                        advisoryPlans.map((item) => [
                            item.plan_id,
                            item
                        ])
                    );

                    const mergedPlans = allPlans.map((plan) => {

                        const advisoryData = advisoryMap.get(
                            plan.plan_id
                        );

                        return {
                            ...plan,
                            current_weather:
                                advisoryData?.current_weather || null,
                            advisories:
                                advisoryData?.advisories || [],
                            advisory_error:
                                advisoryData?.advisory_error || null,
                            advisory_message:
                                advisoryData?.advisory_message || null
                        };

                    });

                    setPlans(mergedPlans);

                } catch (advisoryError) {

                    console.error(
                        "Unable to load crop advisories:",
                        advisoryError
                    );

                    setAdvisoryLoadError(
                        "Weather-based advisories are currently unavailable. Your planting plans are still accessible."
                    );

                    setPlans(
                        allPlans.map((plan) => ({
                            ...plan,
                            current_weather: null,
                            advisories: [],
                            advisory_error:
                                "Unable to retrieve weather advisories."
                        }))
                    );

                }

            } catch (err) {

                console.error(err);

                setError(
                    err.message ||
                    "Unable to load your planting plans."
                );

            } finally {

                setLoading(false);

            }

        }

        loadPlans();

    }, [router]);


    /*
        UPDATE PLANTING PLAN STATUS
    */

    async function handleStatusChange(planId, newStatus) {

        if (!user?.user_id) {
            return;
        }

        try {

            setUpdatingPlanId(planId);
            setError("");

            await updatePlantingPlanStatus(
                planId,
                user.user_id,
                newStatus
            );

            setPlans((currentPlans) =>
                currentPlans.map((plan) =>
                    plan.plan_id === planId
                        ? {
                            ...plan,
                            status: newStatus
                        }
                        : plan
                )
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to update planting plan status."
            );

        } finally {

            setUpdatingPlanId(null);

        }

    }


    /*
        ADVISORY PRIORITY CLASS
    */

    function getPriorityClass(priority) {

        switch (priority?.toLowerCase()) {

            case "urgent":
            case "critical":
                return "urgent";

            case "high":
                return "high";

            case "warning":
            case "medium":
                return "medium";

            case "low":
            case "info":
                return "low";

            default:
                return "low";

        }

    }

    function getStatusClassName(status) {

        switch (status) {

            case "Growing":
                return styles.statusGrowing;

            case "Harvested":
                return styles.statusHarvested;

            case "Completed":
                return styles.statusCompleted;

            case "Planned":
            default:
                return styles.statusPlanned;

        }

    }


    const countByStatus = (status) =>
        plans.filter(
            (plan) => (plan.status || "Planned") === status
        ).length;

    const stats = [
        {
            label: "Total Plants",
            value: plans.length,
            icon: <ClipboardIcon />,
            tone: styles.toneLeaf
        },
        {
            label: "Planned",
            value: countByStatus("Planned"),
            icon: <CalendarIcon size={26} />,
            tone: styles.toneLime
        },
        {
            label: "Growing",
            value: countByStatus("Growing"),
            icon: <SproutIcon />,
            tone: styles.toneGrowing
        },
        {
            label: "Harvested",
            value: countByStatus("Harvested"),
            icon: <BasketIcon />,
            tone: styles.toneWater
        },
        {
            label: "Completed",
            value: countByStatus("Completed"),
            icon: <CheckCircleIcon />,
            tone: styles.toneSoil
        }
    ];

    const visiblePlans =
        statusFilter === "All"
            ? plans
            : plans.filter(
                (plan) => (plan.status || "Planned") === statusFilter
            );


    /*
        LOADING STATE
    */

    if (loading) {

        return (

            <section className={styles.plantsPage}>

                <div className={styles.plantsContainer}>

                    <div className={styles.catalogueState} role="status">

                        <p>
                            Loading your planting plans...
                        </p>

                    </div>

                </div>

            </section>

        );

    }


    return (

        <section className={styles.plantsPage}>

            <div className={styles.plantsContainer}>

                {/* HEADER */}

                <div className={styles.plantsHeader}>

                    <div className={styles.headerCopy}>

                        <span className={styles.sectionBadge}>
                            My Plants
                        </span>

                        <h1>
                            My Plants
                        </h1>

                        <p>
                            Keep track of the crops you plan
                            to grow and manage your planting
                            activities.
                        </p>

                    </div>

                    <Link
                        href="/crops"
                        className={styles.createPlantButton}
                    >
                        Plan New Plant
                        <PlusIcon />
                    </Link>

                </div>


                {/* GENERAL ERROR */}

                {error && (

                    <div className={styles.assessmentError} role="alert">

                        <AlertIcon />

                        <div>

                            <strong>
                                Unable to load or update plans
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* ADVISORY LOADING ERROR */}

                {advisoryLoadError && (

                    <div className={styles.advisoryLoadError}>

                        <strong>
                            Weather Advisory Notice
                        </strong>

                        <p>
                            {advisoryLoadError}
                        </p>

                    </div>

                )}


                {/* SUMMARY */}

                {plans.length > 0 && (

                    <div className={styles.statsGrid}>

                        {stats.map((stat) => (

                            <div className={styles.statCard} key={stat.label}>

                                <span className={`${styles.statIcon} ${stat.tone}`}>
                                    {stat.icon}
                                </span>

                                <div className={styles.statText}>
                                    <span>{stat.label}</span>
                                    <strong>{stat.value}</strong>
                                </div>

                            </div>

                        ))}

                    </div>

                )}


                {/* STATUS FILTER */}

                {plans.length > 0 && (

                    <div className={styles.filterRow} role="group" aria-label="Filter plants by status">

                        {["All", ...statusOptions].map((option) => (

                            <button
                                type="button"
                                key={option}
                                className={`${styles.filterChip} ${statusFilter === option ? styles.filterChipActive : ""}`}
                                aria-pressed={statusFilter === option}
                                onClick={() => setStatusFilter(option)}
                            >
                                {option}
                            </button>

                        ))}

                    </div>

                )}


                {/* EMPTY STATE */}

                {!error && plans.length === 0 && (

                    <div className={styles.plantsEmpty}>

                        <div className={styles.plantsEmptyIcon}>
                            <SproutIcon size={36} />
                        </div>

                        <h2>
                            No planting plans yet
                        </h2>

                        <p>
                            Start by exploring the crop catalogue
                            and create your first planting plan.
                        </p>

                        <Link
                            href="/crops"
                            className={styles.plantsEmptyButton}
                        >
                            Explore Crops
                        </Link>

                    </div>

                )}


                {/* NO MATCH FOR FILTER */}

                {plans.length > 0 && visiblePlans.length === 0 && (

                    <div className={styles.catalogueState}>

                        <p>
                            No plants with the status &quot;{statusFilter}&quot; yet.
                        </p>

                    </div>

                )}


                {/* PLANTING PLANS */}

                {visiblePlans.length > 0 && (

                    <div className={styles.plantsGrid}>

                        {visiblePlans.map((plan) => (

                            <article
                                className={styles.plantPlanCard}
                                key={plan.plan_id}
                            >

                                {/* CROP PHOTO */}

                                <div className={styles.plantPhoto}>

                                    <CropImage
                                        cropName={plan.crop_name}
                                        className={styles.plantPhotoImage}
                                        sizes="(max-width: 750px) 100vw, 400px"
                                    />

                                </div>


                                <div className={styles.plantPlanBody}>

                                    {/* CARD HEADER */}

                                    <div className={styles.plantPlanTop}>

                                        <div className={styles.plantPlanTitle}>

                                            <span>
                                                {plan.category}
                                            </span>

                                            <h2>
                                                {plan.plan_name}
                                            </h2>

                                            <strong className={styles.plantPlanCrop}>
                                                {plan.crop_name}
                                            </strong>

                                        </div>

                                        <span
                                            className={`${styles.statusBadge} ${getStatusClassName(plan.status || "Planned")}`}
                                        >
                                            {plan.status || "Planned"}
                                        </span>

                                    </div>


                                    {/* PLANT DETAILS */}

                                    <div className={styles.plantPlanDetails}>

                                        <div>

                                            <span>
                                                Location
                                            </span>

                                            <strong>
                                                {plan.location_name ||
                                                    "Not specified"}
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                Planting Date
                                            </span>

                                            <strong>
                                                {plan.planting_date
                                                    ? new Date(
                                                        plan.planting_date
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric"
                                                        }
                                                    )
                                                    : "Not specified"}
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                Growing Method
                                            </span>

                                            <strong>
                                                {plan.growing_method ||
                                                    "Not specified"}
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                Quantity
                                            </span>

                                            <strong>
                                                {plan.quantity ||
                                                    "Not specified"}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* CURRENT WEATHER */}

                                    {plan.current_weather && (

                                        <div className={styles.plantWeatherSection}>

                                            <h3>
                                                <CloudSunIcon />
                                                Current Weather
                                            </h3>

                                            <div className={styles.plantWeatherGrid}>

                                                <div>
                                                    <span>
                                                        Temperature
                                                    </span>

                                                    <strong>
                                                        {Number(
                                                            plan.current_weather.temperature
                                                        ).toFixed(1)}°C
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Humidity
                                                    </span>

                                                    <strong>
                                                        {plan.current_weather.humidity}%
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Condition
                                                    </span>

                                                    <strong>
                                                        {plan.current_weather.weather_description ||
                                                            plan.current_weather.weather_condition}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Rainfall
                                                    </span>

                                                    <strong>
                                                        {plan.current_weather.rainfall} mm
                                                    </strong>
                                                </div>

                                            </div>

                                        </div>

                                    )}


                                    {/* CROP-SPECIFIC ADVISORIES */}

                                    <div className={styles.plantAdvisorySection}>

                                        <div className={styles.plantAdvisoryHeading}>

                                            <span>
                                                SMART PLANT CARE
                                            </span>

                                            <h3>
                                                <BulbIcon />
                                                Crop Care Advisories
                                            </h3>

                                        </div>


                                        {plan.advisory_message && (

                                            <div className={styles.plantAdvisoryEmpty}>
                                                {plan.advisory_message}
                                            </div>

                                        )}


                                        {plan.advisory_error && (

                                            <div className={styles.plantAdvisoryEmpty}>
                                                {plan.advisory_error}
                                            </div>

                                        )}


                                        {!plan.advisory_message &&
                                            !plan.advisory_error &&
                                            plan.advisories?.length === 0 && (

                                            <div className={styles.plantAdvisoryEmpty}>

                                                {["Harvested", "Completed"].includes(
                                                    plan.status
                                                )
                                                    ? "This planting plan is completed. Weather-based advisories are no longer generated."
                                                    : "No crop-specific advisories are currently available."}

                                            </div>

                                        )}


                                        {plan.advisories?.length > 0 && (

                                            <div className={styles.plantAdvisoryList}>

                                                {plan.advisories.map(
                                                    (advisory, index) => (

                                                        <div
                                                            className={`${styles.plantAdvisoryCard} ${styles[getPriorityClass(
                                                                advisory.priority
                                                            )] || ""}`}
                                                            key={`${plan.plan_id}-${advisory.type}-${index}`}
                                                        >

                                                            <div className={styles.plantAdvisoryCardHeader}>

                                                                <strong>
                                                                    {advisory.title}
                                                                </strong>

                                                                <span className={styles.plantAdvisoryPriority}>
                                                                    {advisory.priority}
                                                                </span>

                                                            </div>

                                                            <p>
                                                                {advisory.message}
                                                            </p>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        )}

                                    </div>


                                    {/* STATUS */}

                                    <div className={styles.plantPlanStatusSection}>

                                        <div className={styles.plantStatusField}>

                                            <label
                                                className={styles.plantStatusLabel}
                                                htmlFor={`status-${plan.plan_id}`}
                                            >
                                                Plant Status
                                            </label>

                                            <select
                                                id={`status-${plan.plan_id}`}
                                                value={
                                                    plan.status ||
                                                    "Planned"
                                                }
                                                disabled={
                                                    updatingPlanId ===
                                                    plan.plan_id
                                                }
                                                onChange={(event) =>
                                                    handleStatusChange(
                                                        plan.plan_id,
                                                        event.target.value
                                                    )
                                                }
                                                className={styles.plantStatusSelect}
                                            >

                                                {statusOptions.map(
                                                    (status) => (

                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status}
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        {updatingPlanId ===
                                            plan.plan_id && (

                                            <span className={styles.plantStatusSaving}>
                                                Saving...
                                            </span>

                                        )}

                                    </div>


                                    {/* FOOTER */}

                                    <div className={styles.plantPlanFooter}>

                                        <span className={styles.plantPlanId}>
                                            Plan #{plan.plan_id}
                                        </span>

                                    </div>

                                </div>

                            </article>

                        ))}

                        {/* PLAN A NEW PLANT TILE */}

                        {statusFilter === "All" && (

                            <Link href="/crops" className={styles.newPlantTile}>

                                <span className={styles.newPlantIcon}>
                                    <PlusIcon size={24} />
                                </span>

                                <strong>
                                    Plan a new plant
                                </strong>

                                <span>
                                    Start from the crop catalogue
                                </span>

                            </Link>

                        )}

                    </div>

                )}

            </div>

        </section>

    );

}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { getCropById } from "../../../services/cropService";
import CropImage from "../../../components/CropImage";
import styles from "./crop-details.module.css";


// =========================================================
// SMALL INLINE ICONS (no extra package needed)
// =========================================================

function Icon({ size = 22, strokeWidth = 2, children }) {
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

const ArrowLeftIcon = () => (
    <Icon size={16} strokeWidth={2.4}>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </Icon>
);

const ArrowRightIcon = () => (
    <Icon size={18} strokeWidth={2.4}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </Icon>
);

const TagIcon = () => (
    <Icon size={14} strokeWidth={2.4}>
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </Icon>
);

const LayersIcon = () => (
    <Icon>
        <path d="m12 2 10 5-10 5L2 7z" />
        <path d="m2 12 10 5 10-5" />
        <path d="m2 17 10 5 10-5" />
    </Icon>
);

const DropIcon = () => (
    <Icon>
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </Icon>
);

const SunIcon = () => (
    <Icon>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
);

const ThermometerIcon = () => (
    <Icon>
        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </Icon>
);

const CalendarIcon = () => (
    <Icon>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
    </Icon>
);

const HomeIcon = () => (
    <Icon>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
    </Icon>
);

const SproutIcon = ({ size = 22 }) => (
    <Icon size={size}>
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </Icon>
);

const CheckIcon = () => (
    <Icon size={14} strokeWidth={3}>
        <path d="M20 6 9 17l-5-5" />
    </Icon>
);


export default function CropDetailsPage() {

    const params = useParams();
    const router = useRouter();

    const { id } = params;

    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================================================
    // AUTH CHECK
    // =========================================================

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


    // =========================================================
    // LOAD CROP
    // =========================================================

    useEffect(() => {

        async function loadCrop() {

            try {

                const data =
                    await getCropById(id);

                setCrop(data);

            } catch (err) {

                console.error(err);

                setError(
                    "Unable to load crop information."
                );

            } finally {

                setLoading(false);

            }

        }

        if (id) {
            loadCrop();
        }

    }, [id]);


    const temperature =
        crop?.min_temperature != null && crop?.max_temperature != null
            ? `${crop.min_temperature}°C - ${crop.max_temperature}°C`
            : "Not specified";

    // tone = which green-family colour the icon tile uses (see CSS)
    const requirementCards = [
        { label: "Soil Type", value: crop?.soil_type || "Not specified", Icon: LayersIcon, tone: "toneSoil" },
        { label: "Water Requirement", value: crop?.water_requirement || "Not specified", Icon: DropIcon, tone: "toneWater" },
        { label: "Sunlight", value: crop?.sunlight_requirement || "Not specified", Icon: SunIcon, tone: "toneSun" },
        { label: "Temperature", value: temperature, Icon: ThermometerIcon, tone: "toneLeaf" },
        { label: "Season", value: crop?.season || "Not specified", Icon: CalendarIcon, tone: "toneMint" },
        { label: "Growing Environment", value: crop?.environment || "Not specified", Icon: HomeIcon, tone: "toneSun" },
    ];

    const growingInfo = [
        { label: "Growing Period", value: crop?.growing_period || "Not specified" },
        { label: "Harvest Period", value: crop?.harvest_period || "Not specified" },
    ];

    // Ideal conditions are built only from data the crop actually has.
    const idealConditions = crop
        ? [
            crop.soil_type && `Soil: ${crop.soil_type}`,
            crop.water_requirement && `Water: ${crop.water_requirement}`,
            crop.sunlight_requirement && `Sunlight: ${crop.sunlight_requirement}`,
            temperature !== "Not specified" && `Temperature: ${temperature}`,
        ].filter(Boolean)
        : [];

    if (loading) {

        return (

            <section className={styles.cropDetailsPage}>

                <div className={styles.catalogueState}>

                    <p>
                        Loading crop information...
                    </p>

                </div>

            </section>

        );

    }


    if (error || !crop) {

        return (

            <section className={styles.cropDetailsPage}>

                <div className={`${styles.catalogueState} ${styles.errorState}`}>

                    <p>
                        {error || "Crop not found."}
                    </p>

                    <Link
                        href="/crops"
                        className={styles.backButton}
                    >
                        Back to Crop Catalogue
                    </Link>

                </div>

            </section>

        );

    }


    return (

        <section className={styles.cropDetailsPage}>

            <div className={styles.cropDetailsContainer}>


                <Link
                    href="/crops"
                    className={styles.backLink}
                >
                    <ArrowLeftIcon />
                    Back to Crop Catalogue
                </Link>


                {/* HERO: photo on the left, details on the right */}

                <div className={styles.cropDetailsHero}>

                    <div className={styles.cropDetailsMedia}>

                        <CropImage
                            cropName={crop.crop_name}
                            className={styles.cropDetailsImage}
                            sizes="(max-width: 900px) 90vw, 45vw"
                        />

                    </div>

                    <div className={styles.cropDetailsIntro}>

                        {crop.category && (
                            <span className={styles.cropCategory}>
                                <TagIcon />
                                {crop.category}
                            </span>
                        )}

                        <h1>
                            {crop.crop_name}
                        </h1>

                        <p>
                            {crop.description}
                        </p>

                        <div className={styles.growingInfoGrid}>

                            {growingInfo.map((item) => (
                                <div key={item.label}>
                                    <span>
                                        {item.label}
                                    </span>

                                    <strong>
                                        {item.value}
                                    </strong>
                                </div>
                            ))}

                        </div>

                        <div className={styles.cropDetailsActionButtons}>

                            <Link
                                href={`/plants/plan?crop=${crop.crop_id}`}
                                className={styles.planRecommendation}
                            >
                                Plan This Plant
                                <ArrowRightIcon />
                            </Link>

                            <Link
                                href={`/assessment?crop=${crop.crop_id}`}
                                className={styles.assessmentButton}
                            >
                                Run Assessment
                            </Link>

                        </div>

                    </div>

                </div>


                {/* GROWING REQUIREMENTS */}

                <div className={styles.cropDetailsSection}>

                    <h2>
                        Growing Requirements
                    </h2>

                    <div className={styles.requirementsGrid}>

                        {requirementCards.map(({ label, value, Icon: RequirementIcon, tone }) => (
                            <div key={label} className={styles.requirementCard}>
                                <span
                                    className={`${styles.requirementIcon} ${styles[tone]}`}
                                    aria-hidden="true"
                                >
                                    <RequirementIcon />
                                </span>

                                <div>
                                    <strong>
                                        {label}
                                    </strong>

                                    <p>
                                        {value}
                                    </p>
                                </div>
                            </div>
                        ))}

                    </div>

                </div>


                {/* IDEAL CONDITIONS + CALL TO ACTION */}

                <div className={styles.cropDetailsActions}>

                    {idealConditions.length > 0 && (
                        <div className={styles.idealConditions}>

                            <h2>
                                Ideal Conditions
                            </h2>

                            <ul>
                                {idealConditions.map((condition) => (
                                    <li key={condition}>
                                        <span aria-hidden="true">
                                            <CheckIcon />
                                        </span>
                                        {condition}
                                    </li>
                                ))}
                            </ul>

                        </div>
                    )}

                    <div className={styles.growTip}>

                        <span className={styles.growTipIcon} aria-hidden="true">
                            <SproutIcon size={24} />
                        </span>

                        <div>

                            <h2>
                                Want to grow {crop.crop_name}?
                            </h2>

                            <p>
                                Check whether this crop is
                                compatible with your growing
                                conditions or create a planting
                                plan.
                            </p>

                        </div>

                    </div>

                </div>


            </div>

        </section>

    );

}
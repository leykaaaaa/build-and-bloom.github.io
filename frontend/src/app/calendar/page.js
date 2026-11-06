"use client";

import { useEffect, useState } from "react";

import {
    getPlantingCalendar
} from "../../services/plantingCalendarService";
import Link from "next/link";
import CropImage from "../../components/CropImage";

import styles from "./calendar.module.css";

function Icon({ size = 16, strokeWidth = 2.2, children }) {
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

const CalendarIcon = () => (
    <Icon size={14}>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
    </Icon>
);

const ClockIcon = () => (
    <Icon size={14}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </Icon>
);

const CheckIcon = () => (
    <Icon size={14} strokeWidth={2.6}>
        <path d="m5 12 5 5 9-10" />
    </Icon>
);

const BulbIcon = () => (
    <Icon size={18} strokeWidth={2}>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6M10 22h4" />
    </Icon>
);

const InfoIcon = () => (
    <Icon size={18} strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
    </Icon>
);

const AlertIcon = () => (
    <Icon size={20} strokeWidth={2}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4M12 17h.01" />
    </Icon>
);

const ArrowRightIcon = () => (
    <Icon size={16} strokeWidth={2.4}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </Icon>
);

export default function CalendarPage() {
    const [calendar, setCalendar] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


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


    // Load all schedules so the calendar can show a general guide.
    // =========================================================
    useEffect(() => {
        async function loadCalendar() {
            try {
                const data = await getPlantingCalendar();
                setCalendar(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError(
                    err.message ||
                    "Unable to load planting calendar."
                );
            } finally {
                setLoading(false);
            }
        }

        loadCalendar();
    }, []);

    const scheduleGroups = Object.values(
        calendar.reduce((seasons, item) => {
            const season = item.season?.trim() || "Season not specified";
            const scheduleKey = [
                item.crop_id,
                item.planting_month?.trim().toLowerCase() || "",
                item.growing_period?.trim().toLowerCase() || "",
                item.harvest_period?.trim().toLowerCase() || "",
                season.toLowerCase(),
            ].join("|");

            if (!seasons[season]) {
                seasons[season] = {
                    name: season,
                    crops: {},
                };
            }

            if (!seasons[season].crops[item.crop_id]) {
                seasons[season].crops[item.crop_id] = {
                    crop_id: item.crop_id,
                    crop_name: item.crop_name,
                    category: item.category,
                    schedules: {},
                };
            }

            if (!seasons[season].crops[item.crop_id].schedules[scheduleKey]) {
                seasons[season].crops[item.crop_id].schedules[scheduleKey] = {
                    planting_month: item.planting_month,
                    growing_period: item.growing_period,
                    harvest_period: item.harvest_period,
                    notes: new Set(),
                };
            }

            if (item.notes?.trim()) {
                seasons[season].crops[item.crop_id].schedules[scheduleKey].notes.add(item.notes.trim());
            }

            return seasons;
        }, {})
    )
        .sort((first, second) => first.name.localeCompare(second.name))
        .map((season) => ({
            ...season,
            crops: Object.values(season.crops)
                .map((crop) => ({
                    ...crop,
                    schedules: Object.values(crop.schedules).map((schedule) => ({
                        ...schedule,
                        notes: [...schedule.notes],
                    })),
                }))
                .sort((first, second) => first.crop_name.localeCompare(second.crop_name)),
        }));

    const cropCount = new Set(
        calendar.map((item) => item.crop_id)
    ).size;
    const seasonCount = scheduleGroups.length;


    return (

        <section className={styles.calendarPage}>

            <div className={styles.calendarContainer}>


                {/* HEADER */}

                <div className={styles.calendarHeader}>

                    <div className={styles.headerCopy}>

                        <span className={styles.sectionBadge}>
                            Planting Schedule
                        </span>

                        <h1>
                            Planting by season
                        </h1>

                        <p>
                            Find the right time to plant. Browse general crop
                            schedules organized by season for Pangasinan: when
                            to plant, how long it grows and when to harvest.
                        </p>

                    </div>

                    <div className={styles.headerStats} aria-label="Calendar overview">

                        <span className={styles.pill}>
                            <strong>{loading ? "—" : cropCount}</strong>
                            Crops
                        </span>

                        <span className={styles.pill}>
                            <strong>{loading ? "—" : seasonCount}</strong>
                            {seasonCount === 1 ? "planting season" : "planting seasons"}
                        </span>

                    </div>

                </div>


                {/* GENERAL GUIDE */}

                <div className={styles.guideNote}>

                    <span className={styles.guideIcon} aria-hidden="true">
                        <InfoIcon />
                    </span>

                    <div>
                        <strong>General planting guide</strong>
                        <span>
                            Treat these schedules as a starting point. Actual
                            timing may vary with weather and local growing
                            conditions.
                        </span>
                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div className={styles.errorBox} role="alert">

                        <AlertIcon />

                        <div>

                            <strong>
                                Unable to load planting calendar
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* LOADING */}

                {loading && (

                    <div className={styles.stateBox} role="status">

                        <span className={styles.stateIcon} aria-hidden="true">
                            <CalendarIcon />
                        </span>

                        <p>
                            Loading planting schedules...
                        </p>

                    </div>

                )}


                {/* EMPTY */}

                {!loading &&
                    !error &&
                    calendar.length === 0 && (

                    <div className={styles.stateBox}>

                        <span className={styles.stateIcon} aria-hidden="true">
                            <CalendarIcon />
                        </span>

                        <h2>
                            No planting schedules found
                        </h2>

                        <p>
                            There are currently no planting schedule records available.
                        </p>

                    </div>

                )}


                {/* CALENDAR RESULTS */}

                {!loading &&
                    !error &&
                    scheduleGroups.length > 0 && (

                    <div className={styles.results} aria-label="Planting schedules by season">

                        {scheduleGroups.map((group) => (

                            <section
                                className={styles.season}
                                key={group.name}
                                aria-label={`${group.name} planting schedules`}
                            >

                                <div className={styles.seasonHeader}>

                                    <div>
                                        <span className={styles.seasonKicker}>
                                            PLANTING SEASON
                                        </span>
                                        <h3>{group.name}</h3>
                                    </div>

                                    <span className={styles.seasonCount}>
                                        {group.crops.length} {group.crops.length === 1 ? "crop" : "crops"}
                                    </span>

                                </div>


                                <div className={styles.cropGrid}>

                                    {group.crops.map((crop) => (

                                        <article
                                            className={styles.cropCard}
                                            key={`${group.name}-${crop.crop_id}`}
                                        >

                                            <div className={styles.cropTop}>

                                                <CropImage
                                                    cropName={crop.crop_name}
                                                    className={styles.cropImage}
                                                    sizes="64px"
                                                />

                                                <div className={styles.cropTitle}>
                                                    <span className={styles.cropCategory}>
                                                        {crop.category}
                                                    </span>
                                                    <h4>{crop.crop_name}</h4>
                                                </div>

                                            </div>


                                            <div className={styles.scheduleList}>

                                                {crop.schedules.map((schedule, index) => (

                                                    <div
                                                        className={styles.schedule}
                                                        key={`${schedule.planting_month}-${index}`}
                                                    >

                                                        <div className={styles.details}>

                                                            <div className={styles.detail}>
                                                                <small><CalendarIcon /> Planting Period</small>
                                                                <strong>{schedule.planting_month || "Not specified"}</strong>
                                                            </div>

                                                            <div className={styles.detail}>
                                                                <small><ClockIcon /> Growing Period</small>
                                                                <strong>{schedule.growing_period || "Not specified"}</strong>
                                                            </div>

                                                            <div className={styles.detail}>
                                                                <small><CheckIcon /> Harvest Period</small>
                                                                <strong>{schedule.harvest_period || "Not specified"}</strong>
                                                            </div>

                                                        </div>


                                                        {schedule.notes.length > 0 && (

                                                            <div className={styles.notes}>

                                                                <BulbIcon />

                                                                <div>
                                                                    <strong>Notes</strong>
                                                                    <p>{schedule.notes.join(" ")}</p>
                                                                </div>

                                                            </div>

                                                        )}

                                                    </div>

                                                ))}

                                            </div>


                                            <Link
                                                href={`/plants/plan?crop=${crop.crop_id}`}
                                                className={styles.planLink}
                                            >
                                                Plan this crop
                                                <ArrowRightIcon />
                                            </Link>

                                        </article>

                                    ))}

                                </div>

                            </section>

                        ))}

                    </div>

                )}

            </div>

        </section>

    );

}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuthHeaders } from "../../services/authService";
import styles from "./admin.module.css";

export default function AdminPage() {
    const [totalCrops, setTotalCrops] = useState(0);
    const [loadingCrops, setLoadingCrops] = useState(true);

    const [totalUsers, setTotalUsers] = useState(0);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [totalCalendarRecords, setTotalCalendarRecords] = useState(0);
    const [loadingCalendar, setLoadingCalendar] = useState(true);

    useEffect(() => {
        const fetchCalendarCount = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/planting-calendar"
                );

                const result = await response.json();

                if (result.success) {
                    setTotalCalendarRecords(
                        result.data.length
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to fetch planting calendar count:",
                    error
                );
            } finally {
                setLoadingCalendar(false);
            }
        };

        fetchCalendarCount();
    }, []);

    useEffect(() => {
        const fetchCropCount = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/crops"
                );

                const result = await response.json();

                if (result.success) {
                    setTotalCrops(result.count);
                }
            } catch (error) {
                console.error(
                    "Failed to fetch crop count:",
                    error
                );
            } finally {
                setLoadingCrops(false);
            }
        };

        fetchCropCount();
    }, []);

    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/users",
                    {
                        headers: getAuthHeaders(),
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    if (response.status === 401) {
                        localStorage.removeItem("buildAndBloomToken");
                        localStorage.removeItem("buildAndBloomUser");
                        window.location.href = "/login?reason=session-expired";
                    }

                    throw new Error(
                        result.message || "Failed to fetch registered user count."
                    );
                }

                setTotalUsers(result.count);
            } catch (error) {
                console.error(
                    "Failed to fetch user count:",
                    error
                );
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUserCount();
    }, []);

    return (
        <div className={styles.dashboard}>

            {/* Dashboard Header */}
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>BUILD & BLOOM · ADMIN</span>
                    <h1 className={styles.title}>
                        Admin Dashboard
                    </h1>

                    <p className={styles.subtitle}>
                        A quick overview of your platform and the data that powers it.
                    </p>
                </div>
                <span className={styles.headerIcon} aria-hidden="true">
                    <i className="fa-solid fa-shield-halved" />
                </span>
            </header>

            {/* Dashboard Cards */}
            <section className={styles.statsGrid} aria-label="System statistics">

                <article className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.cropIcon}`} aria-hidden="true">
                        <i className="fa-solid fa-seedling" />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.cardLabel}>Total Crops</span>
                        <strong className={styles.cardNumber}>
                        {loadingCrops
                            ? "..."
                            : totalCrops}
                        </strong>
                        <span className={styles.cardDescription}>Crops currently in the system</span>
                    </div>
                    <Link className={styles.statLink} href="/admin/crops" aria-label="Manage crops">↗</Link>
                </article>

                <article className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.locationIcon}`} aria-hidden="true">
                        <i className="fa-solid fa-location-dot" />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.cardLabel}>Total Locations</span>
                        <strong className={styles.cardNumber}>48</strong>
                        <span className={styles.cardDescription}>Pangasinan locations</span>
                    </div>
                    <Link className={styles.statLink} href="/admin/locations" aria-label="Manage locations">↗</Link>
                </article>

                <article className={styles.statCard}>
                      <div className={`${styles.statIcon} ${styles.userIcon}`} aria-hidden="true">
                        <i className="fa-solid fa-user" />
                      </div>
                    <div className={styles.statContent}>
                        <span className={styles.cardLabel}>Registered Users</span>
                        <strong className={styles.cardNumber}>
                        {loadingUsers
                            ? "..."
                            : totalUsers}
                        </strong>
                        <span className={styles.cardDescription}>Users currently registered</span>
                    </div>
                    <Link className={styles.statLink} href="/admin/users" aria-label="Manage users">↗</Link>
                </article>

                <article className={styles.statCard}>
                      <div className={`${styles.statIcon} ${styles.locationIcon}`} aria-hidden="true">
                        <i className="fa-solid fa-calendar" />
                        </div>
                    <div className={styles.statContent}>
                        <span className={styles.cardLabel}>Planting Calendar</span>
                        <strong className={styles.cardNumber}>
                        {loadingCalendar
                            ? "..."
                            : totalCalendarRecords}
                        </strong>
                        <span className={styles.cardDescription}>Calendar records in the system</span>
                    </div>
                    <Link className={styles.statLink} href="/admin/calendar" aria-label="Manage planting calendar">↗</Link>
                </article>

                <article className={styles.statCard}>
                      <div className={`${styles.statIcon} ${styles.weatherIcon}`} aria-hidden="true">
                        <i className="fa-solid fa-cloud-sun" />
                        </div>
                    <div className={styles.statContent}>
                        <span className={styles.cardLabel}>Weather API</span>
                        <strong className={`${styles.cardNumber} ${styles.statusValue}`}>Active</strong>
                        <span className={styles.cardDescription}>OpenWeather integration</span>
                    </div>
                </article>

            </section>

            {/* System Overview */}
            <section className={styles.overviewSection}>
                <div className={styles.sectionHeader}>
                    <div>
                        <span className={styles.eyebrow}>PLATFORM</span>
                        <h2 className={styles.sectionTitle}>System Overview</h2>
                    </div>
                    <p>Key services and the datasets behind your growing recommendations.</p>
                </div>

                <div className={styles.overviewGrid}>

                    <article className={styles.overviewCard}>
                        <div className={styles.overviewIcon} aria-hidden="true">
                            <i className="fa-solid fa-bolt" />
                        </div>
                        <div className={styles.overviewContent}>
                            <h3>
                            Crop Recommendation Engine
                            </h3>

                            <p>
                            The recommendation engine uses
                            crop requirements, location
                            information, weather conditions,
                            planting season, and other
                            compatibility factors to generate
                            crop recommendations.
                            </p>
                            <Link href="/admin/recommendations">Review recommendations <span aria-hidden="true"></span></Link>
                        </div>
                    </article>

                    <article className={styles.overviewCard}>
                        <div className={styles.overviewIcon} aria-hidden="true">
                            <i className="fa-solid fa-database" />
                        </div>
                        <div className={styles.overviewContent}>
                            <h3>
                            Dataset Management
                            </h3>

                            <p>
                            Administrators can manage the
                            agricultural data used by the
                            system, including crops,
                            requirements, locations, and
                            planting calendar information.
                            </p>
                            <Link href="/admin/crops">Manage system data <span aria-hidden="true"></span></Link>
                        </div>
                    </article>

                </div>

            </section>

        </div>
    );
}
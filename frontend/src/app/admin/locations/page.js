"use client";

import { useEffect, useState } from "react";

import styles from "../adminPages.module.css";


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

const PlusIcon = () => (
    <Icon strokeWidth={2.4}>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
    </Icon>
);

const SearchIcon = () => (
    <Icon>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </Icon>
);

const MapPinIcon = () => (
    <Icon size={24}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </Icon>
);

const HomeIcon = () => (
    <Icon size={24}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
    </Icon>
);

const BuildingIcon = () => (
    <Icon size={24}>
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </Icon>
);


// Type badge colour: municipality = green, city = lime, anything else = neutral
function typeBadgeClass(type) {
    const value = String(type || "").trim().toLowerCase();

    if (value.includes("municipal")) {
        return styles.badgeVeg;
    }

    if (value.includes("city")) {
        return styles.badgeFruit;
    }

    return styles.badgeNeutral;
}

export default function LocationManagement() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/locations"
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Failed to retrieve locations."
                    );
                }

                setLocations(result.data);
            } catch (error) {
                console.error("Failed to fetch locations:", error);

                setError(
                    "Unable to load location data. Please make sure the backend server is running."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    const filteredLocations = locations.filter((location) =>
        (location.location_name || "")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // Summary numbers (display only)
    const municipalityCount = locations.filter((location) =>
        String(location.location_type || "")
            .toLowerCase()
            .includes("municipal")
    ).length;

    const cityCount = locations.filter((location) =>
        String(location.location_type || "")
            .toLowerCase()
            .includes("city")
    ).length;

    return (
        <div className={styles.adminPage}>

            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.pageHeading}>
                    <h1 className={styles.pageTitle}>
                        Location Management
                    </h1>

                    <p className={styles.pageSubtitle}>
                        Manage the Pangasinan locations used by the system.
                    </p>
                </div>

                {/* Not connected yet in the original code either */}
                <button
                    type="button"
                    className={styles.primaryButton}
                >
                    <PlusIcon />
                    Add Location
                </button>
            </div>

            {/* Summary */}
            <div className={styles.statGrid}>
                <div className={styles.statBox}>
                    <span className={`${styles.statIconBox} ${styles.toneWater}`}>
                        <MapPinIcon />
                    </span>

                    <div className={styles.statText}>
                        <span>Total Pangasinan Locations</span>
                        <strong>{loading ? "..." : locations.length}</strong>
                    </div>
                </div>

                <div className={styles.statBox}>
                    <span className={`${styles.statIconBox} ${styles.toneLeaf}`}>
                        <HomeIcon />
                    </span>

                    <div className={styles.statText}>
                        <span>Municipalities</span>
                        <strong>{loading ? "..." : municipalityCount}</strong>
                    </div>
                </div>

                <div className={styles.statBox}>
                    <span className={`${styles.statIconBox} ${styles.toneSun}`}>
                        <BuildingIcon />
                    </span>

                    <div className={styles.statText}>
                        <span>Cities</span>
                        <strong>{loading ? "..." : cityCount}</strong>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className={styles.errorBox}>
                    {error}
                </div>
            )}

            {/* Search */}
            {!loading && !error && (
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <span className={styles.searchBoxIcon}>
                            <SearchIcon />
                        </span>

                        <label
                            htmlFor="location-search"
                            className={styles.visuallyHidden}
                        >
                            Search location
                        </label>

                        <input
                            id="location-search"
                            className={styles.searchInput}
                            type="search"
                            placeholder="Search location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className={styles.stateBox}>
                    Loading location data...
                </div>
            )}

            {/* Location Table */}
            {!loading && !error && (
                <section className={styles.tableCard}>
                    <div className={styles.tableCardHeader}>
                        <h2>Pangasinan Location Database</h2>
                    </div>

                    <div className={styles.tableScroll}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Location</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Province</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredLocations.map((location) => (
                                    <tr key={location.location_id}>
                                        <td>{location.location_id}</td>

                                        <td>
                                            <span className={styles.cellStrong}>
                                                {location.location_name}
                                            </span>
                                        </td>

                                        <td>
                                            {location.location_type ? (
                                                <span
                                                    className={`${styles.badge} ${typeBadgeClass(location.location_type)}`}
                                                >
                                                    {location.location_type}
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>

                                        <td>{location.province || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredLocations.length === 0 && (
                        <div className={styles.emptyRow}>
                            No locations found.
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getCrops } from "../../services/cropService";
import CropImage from "../../components/CropImage";
import styles from "./crops.module.css";


// =========================================================
// SMALL INLINE ICONS (no extra package needed)
// =========================================================

function Icon({ size = 14, strokeWidth = 2.2, children }) {
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

const SearchIcon = () => (
    <Icon size={20} strokeWidth={2}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </Icon>
);

const ArrowIcon = () => (
    <Icon size={16} strokeWidth={2.4}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </Icon>
);


export default function CropsPage() {

    const router = useRouter();

    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");


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
    // LOAD CROPS
    // =========================================================

    useEffect(() => {

        async function loadCrops() {

            try {

                const data =
                    await getCrops();

                setCrops(data);

            } catch (err) {

                console.error(err);

                setError(
                    "Unable to load crop information."
                );

            } finally {

                setLoading(false);

            }

        }

        loadCrops();

    }, []);

    const categories = [...new Set(
        crops
            .map((crop) => crop.category?.trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
    const filteredCrops = crops.filter((crop) => {
        const matchesCategory =
            !selectedCategory || crop.category === selectedCategory;
        const searchableFields = [
            crop.crop_name,
            crop.category,
            crop.description,
            crop.soil_type,
            crop.water_requirement,
            crop.sunlight_requirement,
            crop.season,
            crop.environment,
        ];
        const matchesSearch =
            !normalizedSearch ||
            searchableFields.some((value) =>
                String(value || "").toLocaleLowerCase().includes(normalizedSearch)
            );

        return matchesCategory && matchesSearch;
    });

    return (

        <section className={styles.cataloguePage}>

            <div className={styles.catalogueHeader}>

                <span className={styles.sectionBadge}>
                    Explore
                </span>

                <h1>
                    Crop Catalogue
                </h1>

                <p>
                    {!loading && !error && crops.length > 0
                        ? `Browse ${crops.length} crops and their growing requirements.`
                        : "Explore crops and learn about their growing requirements before making a planting decision."}
                </p>

            </div>


            {loading && (

                <div className={styles.catalogueState}>

                    <p>
                        Loading crops...
                    </p>

                </div>

            )}


            {error && (

                <div className={`${styles.catalogueState} ${styles.errorState}`}>

                    <p>
                        {error}
                    </p>

                </div>

            )}

            {!loading && !error && crops.length > 0 && (
                <>
                    {/* Filtering is live as you type; the Search button just
                        matches the mockup and keeps keyboard users happy. */}
                    <form
                        className={styles.catalogueToolbar}
                        role="search"
                        onSubmit={(event) => event.preventDefault()}
                    >
                        <label className={styles.searchField}>
                            <span className={styles.searchIcon} aria-hidden="true">
                                <SearchIcon />
                            </span>
                            <span className={styles.visuallyHidden}>Search crops</span>
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search crops by name..."
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    className={styles.clearSearch}
                                    onClick={() => setSearchTerm("")}
                                    aria-label="Clear crop search"
                                >
                                    ×
                                </button>
                            )}
                        </label>

                        <label className={styles.categoryFilter}>
                            <span className={styles.visuallyHidden}>Filter by category</span>
                            <select
                                value={selectedCategory}
                                onChange={(event) => setSelectedCategory(event.target.value)}
                            >
                                <option value="">All categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button type="submit" className={styles.searchButton}>
                            Search
                        </button>
                    </form>

                    <p className={styles.resultCount} aria-live="polite">
                        Showing <strong>{filteredCrops.length}</strong>
                        {" "}of {crops.length} crops
                    </p>
                </>
            )}

            {!loading && !error && crops.length === 0 && (
                <div className={styles.emptyState}>
                    <span aria-hidden="true"></span>
                    <h2>No crops available yet</h2>
                    <p>Please check back later for crops in the catalogue.</p>
                </div>
            )}

            {!loading && !error && (
                filteredCrops.length > 0 ? (
                    <div className={styles.cropGrid}>
                        {filteredCrops.map((crop) => (
                            <article
                                className={styles.cropCard}
                                key={crop.crop_id}
                            >
                                <div className={styles.cropCardMedia}>
                                    <CropImage
                                        cropName={crop.crop_name}
                                        className={styles.cropCardImage}
                                        sizes="(max-width: 650px) 90vw, (max-width: 1050px) 45vw, 30vw"
                                    />

                                    {crop.category && (
                                        <span className={styles.cropCategory}>
                                            {crop.category}
                                        </span>
                                    )}
                                </div>

                                <div className={styles.cropCardContent}>
                                    <h2>{crop.crop_name}</h2>
                                    <p>{crop.description}</p>

                                    <div className={styles.cropChips}>
                                        {crop.soil_type && (
                                            <span className={`${styles.cropChip} ${styles.chipSoil}`}>
                                                <LayersIcon />
                                                <span className={styles.visuallyHidden}>Soil: </span>
                                                {crop.soil_type}
                                            </span>
                                        )}
                                        {crop.water_requirement && (
                                            <span className={`${styles.cropChip} ${styles.chipWater}`}>
                                                <DropIcon />
                                                <span className={styles.visuallyHidden}>Water: </span>
                                                {crop.water_requirement}
                                            </span>
                                        )}
                                        {crop.sunlight_requirement && (
                                            <span className={`${styles.cropChip} ${styles.chipSun}`}>
                                                <SunIcon />
                                                <span className={styles.visuallyHidden}>Sunlight: </span>
                                                {crop.sunlight_requirement}
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        href={`/crops/${crop.crop_id}`}
                                        className={styles.viewCropButton}
                                    >
                                        View Details
                                        <ArrowIcon />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : crops.length > 0 ? (
                    <div className={styles.emptyState}>
                        <span aria-hidden="true"></span>
                        <h2>No matching crops</h2>
                        <p>Try another crop name or category, or clear your filters.</p>
                        <button
                            type="button"
                            className={styles.resetFilters}
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCategory("");
                            }}
                        >
                            Clear search and filters
                        </button>
                    </div>
                ) : null
            )}

        </section>

    );

}
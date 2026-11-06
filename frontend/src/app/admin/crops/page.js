"use client";

import { useEffect, useState } from "react";

import styles from "../adminPages.module.css";

const EMPTY_FORM = {
    crop_name: "",
    category: "",
    description: "",
    growing_period: "",
    harvest_period: "",
    soil_type: "",
    water_requirement: "",
    sunlight_requirement: "",
    min_temperature: "",
    max_temperature: "",
    season: "",
    environment: ""
};


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

const SproutIcon = () => (
    <Icon size={24}>
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </Icon>
);

const TagIcon = () => (
    <Icon size={24}>
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </Icon>
);

const SunIcon = () => (
    <Icon size={24}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
);

const EditIcon = () => (
    <Icon size={15} strokeWidth={2.4}>
        <path d="M12 20h9" />
        <path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Icon>
);

const TrashIcon = () => (
    <Icon size={15} strokeWidth={2.4}>
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Icon>
);

const CloseIcon = () => (
    <Icon strokeWidth={2.4}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </Icon>
);


// Category badge colour: vegetables = green, fruit = lime, anything else = neutral
function categoryBadgeClass(category) {
    const value = String(category || "").trim().toLowerCase();

    if (value.includes("veg")) {
        return styles.badgeVeg;
    }

    if (value.includes("fruit")) {
        return styles.badgeFruit;
    }

    return styles.badgeNeutral;
}

export default function CropManagement() {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [deletingCropId, setDeletingCropId] = useState(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const [formData, setFormData] = useState(EMPTY_FORM);

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/crops"
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Failed to retrieve crops."
                    );
                }

                setCrops(result.data);
            } catch (error) {
                console.error("Failed to fetch crops:", error);
                setError(
                    "Unable to load crop data. Please make sure the backend server is running."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCrops();
    }, []);

    // Close the modal with the Escape key (not while saving)
    useEffect(() => {
        if (!showAddForm) {
            return undefined;
        }

        const onKeyDown = (event) => {
            if (event.key === "Escape" && !saving) {
                closeForm();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [showAddForm, saving]);

    const closeForm = () => {
        setShowAddForm(false);
        setEditingCrop(null);
        setFormError("");
    };

    const openAddForm = () => {
        setEditingCrop(null);
        setFormError("");
        setFormData(EMPTY_FORM);
        setShowAddForm(true);
    };

    const openEditForm = (crop) => {
        setEditingCrop(crop);
        setShowAddForm(true);
        setFormError("");
        setFormData({
            crop_name: crop.crop_name || "",
            category: crop.category || "",
            description: crop.description || "",
            growing_period: crop.growing_period || "",
            harvest_period: crop.harvest_period || "",
            soil_type: crop.soil_type || "",
            water_requirement: crop.water_requirement || "",
            sunlight_requirement: crop.sunlight_requirement || "",
            min_temperature: crop.min_temperature ?? "",
            max_temperature: crop.max_temperature ?? "",
            season: crop.season || "",
            environment: crop.environment || ""
        });
    };

    const updateField = (field) => (e) =>
        setFormData({
            ...formData,
            [field]: e.target.value,
        });


    const handleSaveCrop = async () => {
        setFormError("");
        setSaving(true);

        try {
            const token = localStorage.getItem(
                "buildAndBloomToken"
            );

            if (!token) {
                throw new Error(
                    "Authentication token not found. Please log in again."
                );
            }

            const response = await fetch(
                editingCrop
                    ? `http://localhost:5000/api/crops/${editingCrop.crop_id}`
                    : "http://localhost:5000/api/crops",
                {
                    method: editingCrop ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("buildAndBloomToken")}`,
                    },
                    body: JSON.stringify({
                        ...formData,
                        min_temperature: Number(formData.min_temperature),
                        max_temperature: Number(formData.max_temperature),
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Failed to create crop."
                );
            }

            // Refresh crop table
            const cropsResponse = await fetch(
                "http://localhost:5000/api/crops"
            );

            const cropsResult =
                await cropsResponse.json();

            if (
                cropsResponse.ok &&
                cropsResult.success
            ) {
                setCrops(cropsResult.data);
            }

            // Reset form
            setFormData(EMPTY_FORM);

            setShowAddForm(false);
            setEditingCrop(null);

        } catch (error) {
            console.error(
                "Failed to create crop:",
                error
            );

            setFormError(
                error.message ||
                "Failed to create crop."
            );

        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCrop = async (crop) => {
        if (!window.confirm(`Delete ${crop.crop_name}? This action cannot be undone.`)) {
            return;
        }

        setDeleteError("");
        setDeletingCropId(crop.crop_id);

        try {
            const token = localStorage.getItem("buildAndBloomToken");

            if (!token) {
                throw new Error(
                    "Authentication token not found. Please log in again."
                );
            }

            const response = await fetch(
                `http://localhost:5000/api/crops/${crop.crop_id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to delete crop.");
            }

            setCrops((currentCrops) =>
                currentCrops.filter(
                    (currentCrop) => currentCrop.crop_id !== crop.crop_id
                )
            );
        } catch (error) {
            console.error("Failed to delete crop:", error);
            setDeleteError(error.message || "Failed to delete crop.");
        } finally {
            setDeletingCropId(null);
        }
    };

    // Summary numbers + filters (display only)
    const categories = [
        ...new Set(
            crops
                .map((crop) => crop.category?.trim())
                .filter(Boolean)
        ),
    ].sort((a, b) => a.localeCompare(b));

    const seasonCount = new Set(
        crops
            .map((crop) => crop.season?.trim())
            .filter(Boolean)
    ).size;

    const searchTerm = search.trim().toLowerCase();

    const filteredCrops = crops.filter((crop) => {
        const matchesSearch =
            !searchTerm ||
            crop.crop_name?.toLowerCase().includes(searchTerm);

        const matchesCategory =
            !categoryFilter ||
            crop.category?.trim() === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className={styles.adminPage}>

            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.pageHeading}>
                    <h1 className={styles.pageTitle}>
                        Crop Management
                    </h1>

                    <p className={styles.pageSubtitle}>
                        Manage crops and their agricultural requirements.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={openAddForm}
                >
                    <PlusIcon />
                    Add Crop
                </button>
            </div>


            {/* Add / Edit Crop Modal */}
            {showAddForm && (
                <div
                    className={styles.modalOverlay}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !saving) {
                            closeForm();
                        }
                    }}
                >
                    <div
                        className={`${styles.modal} ${styles.modalWide}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="crop-modal-title"
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2 id="crop-modal-title">
                                    {editingCrop ? "Edit Crop" : "Add New Crop"}
                                </h2>

                                <p>
                                    {editingCrop
                                        ? "Update the crop information and agricultural requirements."
                                        : "Add the crop information and its agricultural requirements."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={closeForm}
                                disabled={saving}
                                aria-label="Close"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className={styles.modalBody}>

                            {formError && (
                                <div className={styles.errorBox} role="alert">
                                    {formError}
                                </div>
                            )}

                            {/* BASIC INFORMATION */}
                            <span className={styles.formSectionLabel}>
                                Basic information
                            </span>

                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label htmlFor="crop-name">
                                        Crop Name <span className={styles.required}>*</span>
                                    </label>

                                    <input
                                        id="crop-name"
                                        className={styles.formInput}
                                        type="text"
                                        value={formData.crop_name}
                                        onChange={updateField("crop_name")}
                                        placeholder="e.g. Tomato"
                                    />
                                </div>

                                <div className={styles.formField}>
                                    <label htmlFor="crop-category">
                                        Category <span className={styles.required}>*</span>
                                    </label>

                                    <input
                                        id="crop-category"
                                        className={styles.formInput}
                                        type="text"
                                        value={formData.category}
                                        onChange={updateField("category")}
                                        placeholder="e.g. Vegetable"
                                    />
                                </div>

                                <div className={`${styles.formField} ${styles.fullWidth}`}>
                                    <label htmlFor="crop-description">
                                        Description
                                    </label>

                                    <textarea
                                        id="crop-description"
                                        className={styles.formTextarea}
                                        value={formData.description}
                                        onChange={updateField("description")}
                                        placeholder="Enter a short description of the crop."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* TIMING */}
                            <span className={styles.formSectionLabel}>
                                Timing
                            </span>

                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label htmlFor="crop-growing">
                                        Growing Period
                                    </label>

                                    <input
                                        id="crop-growing"
                                        className={styles.formInput}
                                        type="text"
                                        value={formData.growing_period}
                                        onChange={updateField("growing_period")}
                                        placeholder="e.g. 90 days"
                                    />
                                </div>

                                <div className={styles.formField}>
                                    <label htmlFor="crop-harvest">
                                        Harvest Period
                                    </label>

                                    <input
                                        id="crop-harvest"
                                        className={styles.formInput}
                                        type="text"
                                        value={formData.harvest_period}
                                        onChange={updateField("harvest_period")}
                                        placeholder="e.g. After 90 days"
                                    />
                                </div>
                            </div>

                            {/* REQUIREMENTS */}
                            <span className={styles.formSectionLabel}>
                                Requirements
                            </span>

                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label htmlFor="crop-soil">
                                        Soil Type <span className={styles.required}>*</span>
                                    </label>

                                    <input
                                        id="crop-soil"
                                        className={styles.formInput}
                                        type="text"
                                        value={formData.soil_type}
                                        onChange={updateField("soil_type")}
                                        placeholder="e.g. Loam, Sandy"
                                    />
                                </div>

                                <div className={styles.formField}>
                                    <label htmlFor="crop-water">
                                        Water Requirement <span className={styles.required}>*</span>
                                    </label>

                                    <input
                                        id="crop-water"
                                        className={styles.formInput}
                                        type="text"
                                        value={formData.water_requirement}
                                        onChange={updateField("water_requirement")}
                                        placeholder="e.g. Moderate"
                                    />
                                </div>

                                <div className={styles.formField}>
                                    <label htmlFor="crop-sunlight">
                                        Sunlight Requirement <span className={styles.required}>*</span>
                                    </label>

                                    <input
                                        id="crop-sunlight"
                                        className={styles.formInput}
                                        type="text"
                                        value={formData.sunlight_requirement}
                                        onChange={updateField("sunlight_requirement")}
                                        placeholder="e.g. Full Sun"
                                    />
                                </div>

                                <div className={styles.formField}>
                                    <label htmlFor="crop-season">
                                        Season <span className={styles.required}>*</span>
                                    </label>

                                    <input
                                        id="crop-season"
                                        className={styles.formInput}
                                        type="text"
                                        value={formData.season}
                                        onChange={updateField("season")}
                                        placeholder="e.g. Wet and Dry Season"
                                    />
                                </div>

                                <div className={`${styles.formField} ${styles.fullWidth}`}>
                                    <label htmlFor="crop-environment">
                                        Growing Environment <span className={styles.required}>*</span>
                                    </label>

                                    <input
                                        id="crop-environment"
                                        className={styles.formInput}
                                        type="text"
                                        value={formData.environment}
                                        onChange={updateField("environment")}
                                        placeholder="e.g. Open Field"
                                    />
                                </div>
                            </div>

                            {/* TEMPERATURE RANGE */}
                            <span className={styles.formSectionLabel}>
                                Temperature range
                            </span>

                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label htmlFor="crop-min-temp">
                                        Minimum Temperature (°C) <span className={styles.required}>*</span>
                                    </label>

                                    <input
                                        id="crop-min-temp"
                                        className={styles.formInput}
                                        type="number"
                                        value={formData.min_temperature}
                                        onChange={updateField("min_temperature")}
                                        placeholder="e.g. 20"
                                    />
                                </div>

                                <div className={styles.formField}>
                                    <label htmlFor="crop-max-temp">
                                        Maximum Temperature (°C) <span className={styles.required}>*</span>
                                    </label>

                                    <input
                                        id="crop-max-temp"
                                        className={styles.formInput}
                                        type="number"
                                        value={formData.max_temperature}
                                        onChange={updateField("max_temperature")}
                                        placeholder="e.g. 35"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={closeForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handleSaveCrop}
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingCrop
                                    ? "Update Crop"
                                    : "Save Crop"}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Summary */}
            <div className={styles.statGrid}>
                <div className={styles.statBox}>
                    <span className={`${styles.statIconBox} ${styles.toneLeaf}`}>
                        <SproutIcon />
                    </span>

                    <div className={styles.statText}>
                        <span>Total Crops</span>
                        <strong>{loading ? "..." : crops.length}</strong>
                    </div>
                </div>

                <div className={styles.statBox}>
                    <span className={`${styles.statIconBox} ${styles.toneWater}`}>
                        <TagIcon />
                    </span>

                    <div className={styles.statText}>
                        <span>Categories</span>
                        <strong>{loading ? "..." : categories.length}</strong>
                    </div>
                </div>

                <div className={styles.statBox}>
                    <span className={`${styles.statIconBox} ${styles.toneSun}`}>
                        <SunIcon />
                    </span>

                    <div className={styles.statText}>
                        <span>Seasons covered</span>
                        <strong>{loading ? "..." : seasonCount}</strong>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className={styles.errorBox}>
                    {error}
                </div>
            )}

            {deleteError && (
                <div className={styles.errorBox} role="alert">
                    {deleteError}
                </div>
            )}

            {/* Search + category filter */}
            {!loading && !error && (
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <span className={styles.searchBoxIcon}>
                            <SearchIcon />
                        </span>

                        <label
                            htmlFor="crop-search"
                            className={styles.visuallyHidden}
                        >
                            Search crop by name
                        </label>

                        <input
                            id="crop-search"
                            className={styles.searchInput}
                            type="search"
                            placeholder="Search crop by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <label
                        htmlFor="crop-category-filter"
                        className={styles.visuallyHidden}
                    >
                        Filter by category
                    </label>

                    <select
                        id="crop-category-filter"
                        className={styles.filterSelect}
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All categories</option>

                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className={styles.stateBox}>
                    Loading crop data...
                </div>
            )}

            {/* Crop Table */}
            {!loading && !error && (
                <section className={styles.tableCard}>
                    <div className={styles.tableCardHeader}>
                        <h2>Crop Database</h2>
                    </div>

                    <div className={styles.tableScroll}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Crop Name</th>
                                    <th scope="col">Category</th>
                                    <th scope="col">Growing Period</th>
                                    <th scope="col">Harvest Period</th>
                                    <th scope="col">Soil</th>
                                    <th scope="col">Water</th>
                                    <th scope="col">Sunlight</th>
                                    <th scope="col">Season</th>
                                    <th scope="col" className={styles.alignRight}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCrops.map((crop) => (
                                    <tr key={crop.crop_id}>
                                        <td>{crop.crop_id}</td>

                                        <td>
                                            <span className={styles.cellStrong}>
                                                {crop.crop_name}
                                            </span>
                                        </td>

                                        <td>
                                            {crop.category ? (
                                                <span
                                                    className={`${styles.badge} ${categoryBadgeClass(crop.category)}`}
                                                >
                                                    {crop.category}
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>

                                        <td>{crop.growing_period || "—"}</td>

                                        <td>{crop.harvest_period || "—"}</td>

                                        <td>{crop.soil_type || "—"}</td>

                                        <td>{crop.water_requirement || "—"}</td>

                                        <td>{crop.sunlight_requirement || "—"}</td>

                                        <td>{crop.season || "—"}</td>

                                        <td className={styles.alignRight}>
                                            <div className={styles.rowActions}>
                                                <button
                                                    type="button"
                                                    className={styles.editButton}
                                                    onClick={() => openEditForm(crop)}
                                                >
                                                    <EditIcon />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDeleteCrop(crop)}
                                                    disabled={deletingCropId === crop.crop_id}
                                                >
                                                    <TrashIcon />
                                                    {deletingCropId === crop.crop_id ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredCrops.length === 0 && (
                        <div className={styles.emptyRow}>
                            {crops.length === 0
                                ? "No crops in the database yet."
                                : "No crops match your search or category."}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
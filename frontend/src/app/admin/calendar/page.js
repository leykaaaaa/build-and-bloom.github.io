"use client";

import { useEffect, useState } from "react";

import styles from "../adminPages.module.css";

const API_URL = "http://localhost:5000";

const EMPTY_FORM = {
    crop_id: "",
    planting_month: "",
    notes: ""
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

const CalendarIcon = () => (
    <Icon size={24}>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
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

const CloudSunIcon = () => (
    <Icon size={24}>
        <path d="M12 2v2M4.9 4.9l1.4 1.4M20 12h2M19.1 4.9l-1.4 1.4M15.9 11.5a4 4 0 0 0-7.8-.5" />
        <path d="M17.5 19H9a5 5 0 1 1 4.9-6.1" />
        <path d="M17.5 19a3.5 3.5 0 0 0 0-7h-.4" />
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


async function fetchWithAdminAuth(url, options = {}) {
    const token = localStorage.getItem("buildAndBloomToken");

    if (!token) {
        localStorage.removeItem("buildAndBloomUser");
        window.location.href = "/login?reason=session-expired";
        throw new Error("Your session has expired. Please log in again.");
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 401) {
        localStorage.removeItem("buildAndBloomToken");
        localStorage.removeItem("buildAndBloomUser");
        window.location.href = "/login?reason=session-expired";
        throw new Error("Your session has expired. Please log in again.");
    }

    return response;
}

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

export default function PlantingCalendarManagement() {
    const [calendar, setCalendar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [seasonFilter, setSeasonFilter] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [crops, setCrops] = useState([]);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [editingSchedule, setEditingSchedule] = useState(null);

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/planting-calendar"
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message ||
                            "Failed to retrieve planting calendar."
                    );
                }

                setCalendar(result.data);
            } catch (error) {
                console.error(
                    "Failed to fetch planting calendar:",
                    error
                );

                setError(
                    "Unable to load planting calendar data. Please make sure the backend server is running."
                );
            } finally {
                setLoading(false);
            }
        };

        const fetchCrops = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/crops"
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message ||
                            "Failed to retrieve crops."
                    );
                }

                setCrops(result.data);
            } catch (error) {
                console.error(
                    "Failed to fetch crops:",
                    error
                );
            }
        };

        fetchCalendar();
        fetchCrops();
    }, []);

    // Close the modal with the Escape key
    useEffect(() => {
        if (!showAddForm) {
            return undefined;
        }

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                closeForm();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [showAddForm]);

    const closeForm = () => {
        setShowAddForm(false);
        setEditingSchedule(null);
        setFormError("");
    };

    const openAddForm = () => {
        setEditingSchedule(null);
        setFormData(EMPTY_FORM);
        setFormError("");
        setShowAddForm(true);
    };

    const openEditForm = (entry) => {
        setEditingSchedule({
            ...entry,
            has_legacy_locations: entry.location_names.length > 0,
        });
        setFormData({
            crop_id: entry.crop_id || "",
            planting_month: entry.planting_month || "",
            notes: entry.notes || "",
        });
        setFormError("");
        setShowAddForm(true);
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();

        setFormError("");
        setSaving(true);

        try {
            const response = await fetchWithAdminAuth(
                editingSchedule
                    ? `${API_URL}/api/planting-calendar/bulk`
                    : `${API_URL}/api/planting-calendar`,
                {
                    method: editingSchedule
                        ? "PUT"
                        : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem(
                            "buildAndBloomToken"
                        )}`,
                    },
                    body: JSON.stringify({
                        location_id: null,
                        ...(editingSchedule
                            ? { calendar_ids: editingSchedule.calendar_ids }
                            : {}),
                        crop_id: Number(formData.crop_id),
                        planting_month:
                            formData.planting_month,
                        notes: formData.notes,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                        "Failed to create planting schedule."
                );
            }

            // Refresh calendar records
            const calendarResponse = await fetch(
                "http://localhost:5000/api/planting-calendar"
            );

            const calendarResult =
                await calendarResponse.json();

            if (
                !calendarResponse.ok ||
                !calendarResult.success
            ) {
                throw new Error(
                    `Schedule was ${editingSchedule ? "updated" : "created"}, but the calendar could not be refreshed.`
                );
            }

            setCalendar(calendarResult.data);

            // Reset form
            setFormData(EMPTY_FORM);

            setShowAddForm(false);
            setEditingSchedule(null);

            alert(
                editingSchedule
                    ? "Planting schedule updated successfully."
                    : "Planting schedule added successfully."
            );

        } catch (error) {
            console.error(
                "Failed to save planting schedule:",
                error
            );

            setFormError(
                error.message ||
                    `Failed to ${editingSchedule ? "update" : "create"} planting schedule.`
            );

        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSchedule = async (entry) => {
        const confirmed =
            window.confirm(
                `Delete the planting schedule for ${entry.crop_name}?${entry.calendar_ids.length > 1 ? ` This removes ${entry.calendar_ids.length} duplicate entries from ${entry.location_names.join(", ")}.` : ""}`
            );

        if (!confirmed) {
            return;
        }

        try {
            const response =
                await fetchWithAdminAuth(
                    `${API_URL}/api/planting-calendar/bulk`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization:
                                `Bearer ${localStorage.getItem(
                                    "buildAndBloomToken"
                                )}`,
                        },
                        body: JSON.stringify({
                            calendar_ids: entry.calendar_ids,
                        }),
                    }
                );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.message ||
                        "Failed to delete planting schedule."
                );
            }

            const calendarResponse =
                await fetch(
                    "http://localhost:5000/api/planting-calendar"
                );

            const calendarResult =
                await calendarResponse.json();

            if (
                !calendarResponse.ok ||
                !calendarResult.success
            ) {
                throw new Error(
                    "Schedule was deleted, but the calendar could not be refreshed."
                );
            }

            setCalendar(
                calendarResult.data
            );

            alert(
                "Planting schedule deleted successfully."
            );
        } catch (error) {
            console.error(
                "Failed to delete planting schedule:",
                error
            );

            alert(
                error.message ||
                    "Failed to delete planting schedule."
            );
        }
    };

    const groupedCalendar = Object.values(
        calendar.reduce((groups, entry) => {
            const scheduleKey = JSON.stringify([
                entry.crop_id,
                entry.planting_month,
                entry.season,
                entry.notes,
            ].map((value) => String(value ?? "").trim().toLowerCase()));

            if (!groups[scheduleKey]) {
                groups[scheduleKey] = {
                    ...entry,
                    calendar_ids: [],
                    records: [],
                    location_names: new Set(),
                    has_general_entry: false,
                };
            }

            const group = groups[scheduleKey];
            group.calendar_ids.push(entry.calendar_id);
            group.records.push(entry);

            if (entry.location_name) {
                group.location_names.add(entry.location_name);
            } else {
                group.has_general_entry = true;
            }

            if (entry.calendar_id < group.calendar_id) {
                group.calendar_id = entry.calendar_id;
            }

            return groups;
        }, {})
    ).map((group) => ({
        ...group,
        location_names: [...group.location_names].sort((a, b) => a.localeCompare(b)),
    }));

    const seasonOptions = [
        ...new Set(
            groupedCalendar
                .map((entry) => entry.season?.trim())
                .filter(Boolean)
        ),
    ].sort((a, b) => a.localeCompare(b));

    const filteredCalendar = groupedCalendar.filter((entry) => {
        const searchTerm = search.toLowerCase();

        const matchesSearch = (
            entry.crop_name?.toLowerCase().includes(searchTerm) ||
            entry.category?.toLowerCase().includes(searchTerm) ||
            entry.location_names.some((location) =>
                location.toLowerCase().includes(searchTerm)
            ) ||
            entry.planting_month
                ?.toLowerCase()
                .includes(searchTerm) ||
            entry.season?.toLowerCase().includes(searchTerm)
        );

        const matchesSeason =
            !seasonFilter ||
            entry.season?.trim() === seasonFilter;

        return matchesSearch && matchesSeason;
    });

    const scheduleScope = (entry) =>
        entry.has_general_entry
            ? "General"
            : entry.location_names.length > 1
                ? `General (${entry.location_names.length} legacy locations)`
                : entry.location_names.length === 1
                    ? `Legacy: ${entry.location_names[0]}`
                    : "General";

    return (
        <div className={styles.adminPage}>

            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.pageHeading}>
                    <h1 className={styles.pageTitle}>
                        Planting Calendar
                    </h1>

                    <p className={styles.pageSubtitle}>
                        Manage general planting schedules by crop and season.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={openAddForm}
                >
                    <PlusIcon />
                    Add Schedule
                </button>
            </div>

            {/* Add / Edit modal */}
            {showAddForm && (
                <div
                    className={styles.modalOverlay}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeForm();
                        }
                    }}
                >
                    <div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="schedule-modal-title"
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2 id="schedule-modal-title">
                                    {editingSchedule
                                        ? "Edit Planting Schedule"
                                        : "Add Planting Schedule"}
                                </h2>

                                <p>
                                    {editingSchedule
                                        ? "Update this crop and season schedule."
                                        : "Add a general planting schedule for a crop."}
                                </p>

                                {editingSchedule?.has_legacy_locations && (
                                    <p className={styles.legacyNote}>
                                        This grouped schedule includes older location-specific entries. Saving changes their schedule details while keeping their locations.
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={closeForm}
                                aria-label="Close"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <form onSubmit={handleAddSchedule}>
                            <div className={styles.modalBody}>

                                {formError && (
                                    <div className={styles.errorBox} role="alert">
                                        {formError}
                                    </div>
                                )}

                                <div className={styles.formGrid}>

                                    {/* Crop */}
                                    <div className={styles.formField}>
                                        <label htmlFor="schedule-crop">
                                            Crop <span className={styles.required}>*</span>
                                        </label>

                                        <select
                                            id="schedule-crop"
                                            className={styles.formInput}
                                            value={formData.crop_id}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    crop_id: e.target.value,
                                                })
                                            }
                                            required
                                        >
                                            <option value="">
                                                Select Crop
                                            </option>

                                            {crops.map((crop) => (
                                                <option
                                                    key={crop.crop_id}
                                                    value={crop.crop_id}
                                                >
                                                    {crop.crop_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Planting Month */}
                                    <div className={styles.formField}>
                                        <label htmlFor="schedule-month">
                                            Planting Month
                                        </label>

                                        <input
                                            id="schedule-month"
                                            className={styles.formInput}
                                            type="text"
                                            placeholder="e.g. June"
                                            value={formData.planting_month}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    planting_month:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    {/* Season is managed on the crop record. */}
                                    <div className={styles.formField}>
                                        <label htmlFor="schedule-season">
                                            Season
                                        </label>

                                        <input
                                            id="schedule-season"
                                            className={styles.formInput}
                                            type="text"
                                            value={
                                                crops.find(
                                                    (crop) =>
                                                        String(crop.crop_id) ===
                                                        String(formData.crop_id)
                                                )?.season || "Not specified"
                                            }
                                            readOnly
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div className={`${styles.formField} ${styles.fullWidth}`}>
                                        <label htmlFor="schedule-notes">
                                            Notes
                                        </label>

                                        <textarea
                                            id="schedule-notes"
                                            className={styles.formTextarea}
                                            placeholder="Optional notes about this planting schedule..."
                                            value={formData.notes}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    notes: e.target.value,
                                                })
                                            }
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className={styles.primaryButton}
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingSchedule
                                        ? "Update Schedule"
                                        : "Save Schedule"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className={styles.statGrid}>
                <div className={styles.statBox}>
                    <span className={`${styles.statIconBox} ${styles.toneMint}`}>
                        <CalendarIcon />
                    </span>

                    <div className={styles.statText}>
                        <span>Schedule Records</span>
                        <strong>
                            {loading ? "..." : groupedCalendar.length}
                        </strong>
                    </div>
                </div>

                <div className={styles.statBox}>
                    <span className={`${styles.statIconBox} ${styles.toneLeaf}`}>
                        <SproutIcon />
                    </span>

                    <div className={styles.statText}>
                        <span>Crops in Calendar</span>
                        <strong>
                            {loading
                                ? "..."
                                : new Set(
                                      groupedCalendar.map(
                                          (entry) => entry.crop_id
                                      )
                                  ).size}
                        </strong>
                    </div>
                </div>

                <div className={styles.statBox}>
                    <span className={`${styles.statIconBox} ${styles.toneWater}`}>
                        <CloudSunIcon />
                    </span>

                    <div className={styles.statText}>
                        <span>Seasons Covered</span>
                        <strong>
                            {loading ? "..." : seasonOptions.length}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className={styles.errorBox} role="alert">
                    {error}
                </div>
            )}

            {/* Search + season filter */}
            {!loading && !error && (
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <span className={styles.searchBoxIcon}>
                            <SearchIcon />
                        </span>

                        <label
                            htmlFor="calendar-search"
                            className={styles.visuallyHidden}
                        >
                            Search crop, month, or season
                        </label>

                        <input
                            id="calendar-search"
                            className={styles.searchInput}
                            type="search"
                            placeholder="Search crop, month, or season..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                    <label
                        htmlFor="calendar-season"
                        className={styles.visuallyHidden}
                    >
                        Filter by season
                    </label>

                    <select
                        id="calendar-season"
                        className={styles.filterSelect}
                        value={seasonFilter}
                        onChange={(e) =>
                            setSeasonFilter(e.target.value)
                        }
                    >
                        <option value="">All seasons</option>

                        {seasonOptions.map((season) => (
                            <option key={season} value={season}>
                                {season}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className={styles.stateBox}>
                    Loading planting calendar...
                </div>
            )}

            {/* Calendar Table */}
            {!loading && !error && (
                <section className={styles.tableCard}>
                    <div className={styles.tableCardHeader}>
                        <h2>
                            Crop and Season Schedules
                        </h2>
                    </div>

                    <div className={styles.tableScroll}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Crop</th>
                                    <th scope="col">Category</th>
                                    <th scope="col">Scope</th>
                                    <th scope="col">Planting Month</th>
                                    <th scope="col">Season</th>
                                    <th scope="col" className={styles.alignRight}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCalendar.map((entry) => (
                                    <tr key={entry.calendar_id}>
                                        <td>{entry.calendar_id}</td>

                                        <td>
                                            <span className={styles.cellStrong}>
                                                {entry.crop_name}
                                            </span>
                                        </td>

                                        <td>
                                            {entry.category ? (
                                                <span
                                                    className={`${styles.badge} ${categoryBadgeClass(entry.category)}`}
                                                >
                                                    {entry.category}
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>

                                        <td>
                                            <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                                                {scheduleScope(entry)}
                                            </span>
                                        </td>

                                        <td>{entry.planting_month || "—"}</td>

                                        <td>
                                            {entry.season ? (
                                                <span className={`${styles.badge} ${styles.badgeSeason}`}>
                                                    {entry.season}
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>

                                        <td className={styles.alignRight}>
                                            <div className={styles.rowActions}>
                                                <button
                                                    type="button"
                                                    className={styles.editButton}
                                                    onClick={() => openEditForm(entry)}
                                                >
                                                    <EditIcon />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDeleteSchedule(entry)}
                                                >
                                                    <TrashIcon />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredCalendar.length === 0 && (
                        <div className={styles.emptyRow}>
                            No planting calendar records found.
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
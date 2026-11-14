"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
    useSearchParams,
    useRouter
} from "next/navigation";

import { getCropById } from "../../../services/cropService";
import { createPlantingPlan } from "../../../services/plantingPlanService";
import CropImage from "../../../components/CropImage";
import styles from "./plan.module.css";


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

const ArrowLeftIcon = () => (
    <Icon size={16} strokeWidth={2.4}>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
    </Icon>
);

const ArrowRightIcon = () => (
    <Icon size={18} strokeWidth={2.4}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </Icon>
);

const TagIcon = () => (
    <Icon>
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </Icon>
);

const MapPinIcon = ({ size = 20 }) => (
    <Icon size={size}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </Icon>
);

const CalendarIcon = () => (
    <Icon>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
    </Icon>
);

const HashIcon = () => (
    <Icon>
        <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
    </Icon>
);

const GridIcon = () => (
    <Icon>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </Icon>
);

const LayersIcon = () => (
    <Icon size={18}>
        <path d="m12 2 10 5-10 5L2 7z" />
        <path d="m2 12 10 5 10-5" />
        <path d="m2 17 10 5 10-5" />
    </Icon>
);

const DropIcon = () => (
    <Icon size={18}>
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </Icon>
);

const SunIcon = () => (
    <Icon size={18}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
);

const ThermometerIcon = () => (
    <Icon size={18}>
        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </Icon>
);

const AlertIcon = () => (
    <Icon size={20}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4M12 17h.01" />
    </Icon>
);

const CheckCircleIcon = () => (
    <Icon size={34}>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </Icon>
);


const LOCATIONS = [
    [6, "Agno"],
    [7, "Aguilar"],
    [8, "Alaminos"],
    [9, "Alcala"],
    [10, "Anda"],
    [11, "Asingan"],
    [12, "Balungao"],
    [13, "Bani"],
    [14, "Basista"],
    [15, "Bautista"],
    [16, "Bayambang"],
    [17, "Binalonan"],
    [18, "Binmaley"],
    [19, "Bolinao"],
    [20, "Bugallon"],
    [21, "Burgos"],
    [22, "Calasiao"],
    [1, "Dagupan"],
    [23, "Dasol"],
    [24, "Infanta"],
    [25, "Labrador"],
    [26, "Laloac"],
    [2, "Lingayen"],
    [27, "Mabini"],
    [28, "Malasiqui"],
    [29, "Manaoag"],
    [30, "Mangaldan"],
    [31, "Mangatarem"],
    [32, "Mapandan"],
    [33, "Natividad"],
    [34, "Pozorrubio"],
    [35, "Rosales"],
    [36, "San Fabian"],
    [37, "San Jacinto"],
    [38, "San Manuel"],
    [39, "San Nicolas"],
    [40, "San Quintin"],
    [4, "Santa Barbara"],
    [41, "Santa Maria"],
    [42, "Sison"],
    [43, "Sual"]
];

const GROWING_METHODS = [
    "Open Field",
    "Container",
    "Raised Bed",
    "Greenhouse",
    "Backyard Garden",
    "Shade House",
    "Rooftop/ Balcony Garden"
];

const EMPTY_FORM = {

    plan_name: "",

    location_id: "",

    planting_date: "",

    quantity: "",

    growing_method: "",

    notes: ""

};


export default function PlanPlantPage() {
    return (
        <Suspense fallback={<div aria-busy="true">Loading planting plan...</div>}>
            <PlanPlantContent />
        </Suspense>
    );
}

function PlanPlantContent() {

    const router = useRouter();

    const searchParams = useSearchParams();

    const cropId =
        searchParams.get("crop");

    const locationName =
        searchParams.get("location");

    const environment =
        searchParams.get("environment");


    const [crop, setCrop] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    const [form, setForm] = useState(EMPTY_FORM);


    useEffect(() => {

        const storedUser =
            localStorage.getItem(
                "buildAndBloomUser"
            );


        if (!storedUser) {

            router.push("/login");

        }

    }, [router]);

    /*
        Load the selected crop.
    */

    useEffect(() => {

        async function loadCrop() {

            if (!cropId) {

                setError(
                    "No crop was selected."
                );

                setLoading(false);

                return;

            }


            try {

                const data =
                    await getCropById(
                        cropId
                    );

                setCrop(data);

            } catch (err) {

                console.error(err);

                setError(
                    err.message ||
                    "Unable to load crop information."
                );

            } finally {

                setLoading(false);

            }

        }


        loadCrop();

    }, [cropId]);

    useEffect(() => {
        if (!locationName) {
            return;
        }

        const selectedLocation = LOCATIONS.find(
            ([, name]) =>
                name.toLowerCase() === locationName.trim().toLowerCase()
        );

        if (selectedLocation) {
            setForm((previous) => ({
                ...previous,
                location_id: String(selectedLocation[0])
            }));
        }
    }, [locationName]);

    useEffect(() => {
        if (!environment) {
            return;
        }

        const normalizedEnvironment =
            environment.trim().toLowerCase();
        const selectedMethod = normalizedEnvironment === "raised garden bed"
            ? "Raised Bed"
            : GROWING_METHODS.find(
                (method) => method.toLowerCase() === normalizedEnvironment
            );

        if (selectedMethod) {
            setForm((previous) => ({
                ...previous,
                growing_method: selectedMethod
            }));
        }
    }, [environment]);


    /*
        Handle form changes.
    */

    function handleChange(event) {

        const {
            name,
            value
        } = event.target;


        setForm((previous) => ({

            ...previous,

            [name]: value

        }));

    }


    /*
        Submit planting plan.
    */

    async function handleSubmit(event) {

        event.preventDefault();

        setError("");
        setSuccess("");


        /*
            Get logged-in user.
        */

        const storedUser =
            localStorage.getItem(
                "buildAndBloomUser"
            );


        /*
            User must be logged in.
        */

        if (!storedUser) {

            setError(
                "Please log in before creating a planting plan."
            );

            return;

        }


        let user;


        try {

            user =
                JSON.parse(
                    storedUser
                );

        } catch (err) {

            console.error(err);

            setError(
                "Your login session is invalid. Please log in again."
            );

            return;

        }


        /*
            Make sure the account has
            a valid user ID.
        */

        if (!user.user_id) {

            setError(
                "Unable to identify your account. Please log in again."
            );

            return;

        }


        /*
            Make sure a crop was loaded.
        */

        if (!cropId) {

            setError(
                "No crop was selected."
            );

            return;

        }


        /*
            Plan name is required.
        */

        if (!form.plan_name.trim()) {

            setError(
                "Please enter a name for your planting plan."
            );

            return;

        }


        setSaving(true);


        try {

            const result =
                await createPlantingPlan({

                    /*
                        IMPORTANT:
                        Use the actual logged-in
                        user's ID instead of 1.
                    */

                    user_id:
                        user.user_id,

                    crop_id:
                        Number(cropId),

                    location_id:
                        form.location_id
                            ? Number(
                                form.location_id
                            )
                            : null,

                    plan_name:
                        form.plan_name.trim(),

                    planting_date:
                        form.planting_date ||
                        null,

                    quantity:
                        form.quantity.trim(),

                    growing_method:
                        form.growing_method,

                    notes:
                        form.notes.trim()

                });


            console.log(
                "Planting plan created:",
                result
            );


            setSuccess(
                "Your planting plan has been created successfully!"
            );


            /*
                Clear the form after success.
            */

            setForm(EMPTY_FORM);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to create planting plan."
            );

        } finally {

            setSaving(false);

        }

    }


    /*
        Loading state.
    */

    if (loading) {

        return (

            <section className={styles.planPage}>

                <div className={styles.planContainer}>

                    <div className={styles.catalogueState} role="status">

                        <p>
                            Loading crop information...
                        </p>

                    </div>

                </div>

            </section>

        );

    }

    /*
        Error state when crop
        cannot be loaded.
    */

    if (error && !crop) {

        return (

            <section className={styles.planPage}>

                <div className={styles.planContainer}>

                    <div className={styles.assessmentError} role="alert">

                        <AlertIcon />

                        <div>

                            <strong>
                                Unable to load crop
                            </strong>

                            <p>
                                {error}
                            </p>

                            <Link
                                href="/crops"
                                className={styles.errorBackButton}
                            >
                                <ArrowLeftIcon />
                                Back to Crops
                            </Link>

                        </div>

                    </div>

                </div>

            </section>

        );

    }

    return (

        <section className={styles.planPage}>

            <div className={styles.planContainer}>


                {/* BACK LINK */}

                <Link
                    href={`/crops/${cropId}`}
                    className={styles.backLink}
                >
                    <ArrowLeftIcon />
                    Back to crop details
                </Link>


                {/* HEADER */}

                <div className={styles.planHeader}>

                    <span className={styles.sectionBadge}>
                        Planting Plan
                    </span>

                    <h1>
                        Plan This Plant
                    </h1>

                    <p>
                        Set your planting details and save the plan
                        to My Plants.
                    </p>

                </div>


                {/* ERROR */}

                {error && (

                    <div className={styles.assessmentError} role="alert">

                        <AlertIcon />

                        <div>

                            <strong>
                                Unable to create plan
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* SUCCESS POPUP */}

                {success && (

                    <div
                        className={styles.modalOverlay}
                        role="presentation"
                    >

                        <div
                            className={styles.modal}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="plan-success-title"
                            aria-describedby="plan-success-description"
                        >

                            <div className={styles.modalIcon}>
                                <CheckCircleIcon />
                            </div>

                            <h2 id="plan-success-title">
                                Planting Plan Created!
                            </h2>

                            <p id="plan-success-description">
                                Your planting plan has been saved
                                successfully. You can now view and
                                manage your plant in the My Plants
                                section.
                            </p>

                            <Link
                                href="/plants"
                                className={styles.modalButton}
                            >
                                View My Plants
                                <ArrowRightIcon />
                            </Link>

                        </div>

                    </div>

                )}


                <div className={styles.planGrid}>


                    {/* FORM */}

                    <form
                        className={styles.planForm}
                        onSubmit={handleSubmit}
                    >

                        <div className={styles.fieldGrid}>


                            {/* PLAN NAME */}

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>

                                <label htmlFor="plan_name">
                                    Plan Name
                                </label>

                                <div className={styles.inputWrap}>

                                    <span className={styles.fieldIcon}>
                                        <TagIcon />
                                    </span>

                                    <input
                                        id="plan_name"
                                        name="plan_name"
                                        type="text"
                                        value={form.plan_name}
                                        onChange={handleChange}
                                        placeholder="e.g. My Tomato Garden"
                                        required
                                    />

                                </div>

                            </div>


                            {/* SELECTED CROP */}

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>

                                <label htmlFor="crop_name">
                                    Crop
                                </label>

                                <div className={styles.inputWrap}>

                                    <span className={styles.fieldIcon}>
                                        <TagIcon />
                                    </span>

                                    <input
                                        id="crop_name"
                                        name="crop_name"
                                        type="text"
                                        value={crop?.crop_name || ""}
                                        readOnly
                                    />

                                </div>

                            </div>


                            {/* LOCATION */}

                            <div className={styles.formGroup}>

                                <label htmlFor="location_id">
                                    Growing Location
                                </label>

                                <div className={styles.inputWrap}>

                                    <span className={styles.fieldIcon}>
                                        <MapPinIcon />
                                    </span>

                                    <select
                                        id="location_id"
                                        name="location_id"
                                        value={form.location_id}
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            Select a location
                                        </option>

                                        {LOCATIONS.map(([id, name]) => (
                                            <option key={id} value={id}>
                                                {name}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                            </div>


                            {/* PLANTING DATE */}

                            <div className={styles.formGroup}>

                                <label htmlFor="planting_date">
                                    Planting Date
                                </label>

                                <div className={styles.inputWrap}>

                                    <span className={styles.fieldIcon}>
                                        <CalendarIcon />
                                    </span>

                                    <input
                                        id="planting_date"
                                        name="planting_date"
                                        type="date"
                                        value={form.planting_date}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>


                            {/* QUANTITY */}

                            <div className={styles.formGroup}>

                                <label htmlFor="quantity">
                                    Quantity
                                </label>

                                <div className={styles.inputWrap}>

                                    <span className={styles.fieldIcon}>
                                        <HashIcon />
                                    </span>

                                    <input
                                        id="quantity"
                                        name="quantity"
                                        type="text"
                                        value={form.quantity}
                                        onChange={handleChange}
                                        placeholder="e.g. 20 plants"
                                    />

                                </div>

                            </div>


                            {/* GROWING METHOD */}

                            <div className={styles.formGroup}>

                                <label htmlFor="growing_method">
                                    Growing Method
                                </label>

                                <div className={styles.inputWrap}>

                                    <span className={styles.fieldIcon}>
                                        <GridIcon />
                                    </span>

                                    <select
                                        id="growing_method"
                                        name="growing_method"
                                        value={form.growing_method}
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            Select a growing method
                                        </option>

                                        {GROWING_METHODS.map((method) => (
                                            <option key={method} value={method}>
                                                {method}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                            </div>

                        </div>


                        {/* NOTES */}

                        <div className={styles.formGroup}>

                            <label htmlFor="notes">
                                Notes
                            </label>

                            <textarea
                                id="notes"
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Add any notes about your planting plan..."
                                rows="5"
                            />

                        </div>


                        {/* ACTIONS */}

                        <div className={styles.planFormActions}>

                            <button
                                type="submit"
                                className={styles.planSubmitButton}
                                disabled={saving}
                                aria-busy={saving}
                            >

                                {saving
                                    ? "Creating Plan..."
                                    : (
                                        <>
                                            Create Planting Plan
                                            <ArrowRightIcon />
                                        </>
                                    )
                                }

                            </button>

                            <Link
                                href={`/crops/${cropId}`}
                                className={styles.planCancelButton}
                            >
                                Cancel
                            </Link>

                        </div>

                    </form>


                    {/* SELECTED CROP */}

                    {crop && (

                        <aside className={styles.selectedCropCard}>

                            <div className={styles.cropPhoto}>

                                <CropImage
                                    cropName={crop.crop_name}
                                    className={styles.cropPhotoImage}
                                    sizes="(max-width: 950px) 100vw, 420px"
                                />

                            </div>

                            <div className={styles.cropBody}>

                                <span className={styles.cropKicker}>
                                    SELECTED CROP
                                </span>

                                <h2>
                                    {crop.crop_name}
                                </h2>

                                {crop.category && (
                                    <p>
                                        {crop.category}
                                    </p>
                                )}

                                <div className={styles.cropFacts}>

                                    {crop.soil_type && (
                                        <div className={styles.cropFact}>
                                            <span><LayersIcon /> Soil</span>
                                            <strong>{crop.soil_type}</strong>
                                        </div>
                                    )}

                                    {crop.water_requirement && (
                                        <div className={styles.cropFact}>
                                            <span><DropIcon /> Water</span>
                                            <strong>{crop.water_requirement}</strong>
                                        </div>
                                    )}

                                    {crop.sunlight_requirement && (
                                        <div className={styles.cropFact}>
                                            <span><SunIcon /> Sunlight</span>
                                            <strong>{crop.sunlight_requirement}</strong>
                                        </div>
                                    )}

                                    {crop.min_temperature != null &&
                                        crop.max_temperature != null && (
                                        <div className={styles.cropFact}>
                                            <span><ThermometerIcon /> Temperature</span>
                                            <strong>
                                                {crop.min_temperature}°C – {crop.max_temperature}°C
                                            </strong>
                                        </div>
                                    )}

                                </div>

                            </div>

                        </aside>

                    )}

                </div>

            </div>

        </section>

    );

}
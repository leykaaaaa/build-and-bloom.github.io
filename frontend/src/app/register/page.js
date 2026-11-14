"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { registerUser } from "../../services/authService";
import styles from "./register.module.css";


// =========================================================
// SMALL INLINE ICONS (no Font Awesome needed)
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

const MailIcon = () => (
    <Icon>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-10 5L2 7" />
    </Icon>
);

const LockIcon = () => (
    <Icon>
        <rect width="18" height="11" x="3" y="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
);

const EyeIcon = () => (
    <Icon>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
    </Icon>
);

const EyeOffIcon = () => (
    <Icon>
        <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-3.1 4.2" />
        <path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 4.4-1" />
        <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" />
        <path d="m2 2 20 20" />
    </Icon>
);

const ArrowRightIcon = () => (
    <Icon strokeWidth={2.4}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </Icon>
);

const AlertIcon = () => (
    <Icon>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4M12 17h.01" />
    </Icon>
);

const SproutIcon = ({ size = 56 }) => (
    <Icon size={size}>
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </Icon>
);

const CheckIcon = () => (
    <Icon size={14} strokeWidth={3}>
        <path d="m5 12 5 5 9-10" />
    </Icon>
);


const UserIcon = () => (
    <Icon>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
    </Icon>
);

const MapPinIcon = () => (
    <Icon>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </Icon>
);

const ChevronIcon = () => (
    <Icon size={18} strokeWidth={2.2}>
        <path d="m6 9 6 6 6-6" />
    </Icon>
);

const CheckCircleIcon = () => (
    <Icon size={34}>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </Icon>
);


const BENEFITS = [
    "Free to join, built for Pangasinan growers",
    "Get crop matches for your location",
    "Save planting plans and track progress"
];

const PASSWORD_HINT =
    "At least 8 characters, including uppercase and lowercase letters, a number, and a special character.";



const API_URL = "http://localhost:5000";
const passwordPolicy =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

export default function RegisterPage() {

    const [form, setForm] = useState({

        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        location_id: "",
        password: "",
        confirmPassword: ""

    });


    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState(false);

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirm, setShowConfirm] =
        useState(false);

    const [locations, setLocations] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(true);
    const [locationError, setLocationError] = useState("");

    // Load database IDs so registrations only submit locations that satisfy the foreign key.
    useEffect(() => {
        let isActive = true;

        async function loadLocations() {
            try {
                const response = await fetch(`${API_URL}/api/locations`);
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Failed to load locations.");
                }

                if (isActive) {
                    setLocations(result.data || []);
                    setLocationError(
                        result.data?.length
                            ? ""
                            : "No locations are available."
                    );
                }
            } catch (requestError) {
                console.error("Failed to load registration locations:", requestError);
                if (isActive) {
                    setLocationError(
                        "Unable to load locations. Please try again later."
                    );
                }
            } finally {
                if (isActive) {
                    setLocationsLoading(false);
                }
            }
        }

        loadLocations();

        return () => {
            isActive = false;
        };
    }, []);


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


    async function handleSubmit(event) {

        event.preventDefault();
        setError("");
        setSuccess(false);


        // Check passwords
        if (
            form.password !==
            form.confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;

        }


        if (!passwordPolicy.test(form.password)) {

            setError(
                "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character."
            );

            return;

        }


        setLoading(true);


        try {

            const result =
                await registerUser({

                    first_name:
                        form.first_name,

                    middle_name:
                        form.middle_name,

                    last_name:
                        form.last_name,

                    email:
                        form.email,

                    location_id:
                        form.location_id
                            ? Number(
                                form.location_id
                            )
                            : null,

                    password:
                        form.password

                });


            console.log(
                "Registration result:",
                result
            );


            setSuccess(true);


            // Clear form
            setForm({

                first_name: "",
                middle_name: "",
                last_name: "",
                email: "",
                location_id: "",
                password: "",
                confirmPassword: ""

            });


        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to create your account."
            );

        } finally {

            setLoading(false);

        }

    }


    return (

        <section className={styles.registerPage}>

            {/* BRAND PANEL */}

            <aside className={styles.brandPanel}>

                <span className={styles.brandCircle}>
                    <SproutIcon />
                </span>

                <h2>
                    Create your account.
                </h2>

                <p>
                    Start discovering what you can grow.
                </p>

                <ul className={styles.benefits}>

                    {BENEFITS.map((benefit) => (

                        <li key={benefit}>

                            <span className={styles.benefitIcon}>
                                <CheckIcon />
                            </span>

                            {benefit}

                        </li>

                    ))}

                </ul>

            </aside>


            {/* FORM */}

            <div className={styles.formSide}>

                <div className={styles.card}>


                    {/* HEADER */}

                    <div className={styles.header}>

                        <span className={styles.eyebrow}>
                            GET STARTED
                        </span>

                        <h1>
                            Create account
                        </h1>

                        <p>
                            Join Build &amp; Bloom and plan your
                            next crop with confidence.
                        </p>

                    </div>


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
                                aria-labelledby="register-success-title"
                                aria-describedby="register-success-description"
                            >

                                <div className={styles.modalIcon}>
                                    <CheckCircleIcon />
                                </div>

                                <h2 id="register-success-title">
                                    Account Created Successfully!
                                </h2>

                                <p id="register-success-description">
                                    Your Build &amp; Bloom account has been
                                    registered successfully. Please proceed
                                    to the login page to sign in using your
                                    newly created account.
                                </p>

                                <Link
                                    href="/login"
                                    className={styles.modalButton}
                                >
                                    Proceed to Login
                                    <ArrowRightIcon />
                                </Link>

                            </div>

                        </div>

                    )}


                    {/* ERROR */}

                    {error && (

                        <div className={styles.error} role="alert">

                            <AlertIcon />

                            <div>

                                <strong>
                                    Registration failed
                                </strong>

                                <p>
                                    {error}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* FORM */}

                    <form
                        className={styles.form}
                        onSubmit={handleSubmit}
                    >

                        <div className={styles.fieldGrid}>

                        <div className={styles.field}>

                            <label htmlFor="first_name">
                                First Name
                            </label>

                            <div className={styles.inputWrapper}>

                                <span className={styles.inputIcon}>
                                    <UserIcon />
                                </span>

                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    placeholder="Enter your first name"
                                    required
                                />

                            </div>

                        </div>

                        <div className={styles.field}>

                            <label htmlFor="middle_name">
                                Middle Name <span className={styles.optional}>(Optional)</span>
                            </label>

                            <div className={styles.inputWrapper}>

                                <span className={styles.inputIcon}>
                                    <UserIcon />
                                </span>

                                <input
                                    id="middle_name"
                                    name="middle_name"
                                    type="text"
                                    value={form.middle_name}
                                    onChange={handleChange}
                                    placeholder="Enter your middle name"

                                />

                            </div>

                        </div>

                        <div className={styles.field}>

                            <label htmlFor="last_name">
                                Last Name
                            </label>

                            <div className={styles.inputWrapper}>

                                <span className={styles.inputIcon}>
                                    <UserIcon />
                                </span>

                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    placeholder="Enter your last name"
                                    required
                                />

                            </div>

                        </div>

                        <div className={styles.field}>

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className={styles.inputWrapper}>

                                <span className={styles.inputIcon}>
                                    <MailIcon />
                                </span>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>

                        <div className={styles.field}>

                            <label htmlFor="location_id">
                                Location
                            </label>

                            <div className={styles.inputWrapper}>

                                <span className={styles.inputIcon}>
                                    <MapPinIcon />
                                </span>

                                <select
                                    id="location_id"
                                    name="location_id"
                                    value={form.location_id}
                                    onChange={handleChange}
                                    disabled={locationsLoading || locations.length === 0}
                                    required
                                >

                                    <option value="">
                                        {locationsLoading
                                            ? "Loading locations..."
                                            : "Select your location"}
                                    </option>

                                    {locations.map(
                                        (location) => (

                                            <option
                                                key={location.location_id}
                                                value={location.location_id}
                                            >
                                                {location.location_name}
                                            </option>

                                        )
                                    )}

                                </select>

                                <span className={styles.chevron}>
                                    <ChevronIcon />
                                </span>

                            </div>

                            {locationError && (
                                <p className={styles.locationError} role="alert">
                                    {locationError}
                                </p>
                            )}

                        </div>

                        <div className={styles.field}>

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className={styles.inputWrapper}>

                                <span className={styles.inputIcon}>
                                    <LockIcon />
                                </span>

                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    minLength={8}
                                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}"
                                    title={PASSWORD_HINT}
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>

                            </div>

                        </div>

                        <div className={styles.field}>

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <div className={styles.inputWrapper}>

                                <span className={styles.inputIcon}>
                                    <LockIcon />
                                </span>

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowConfirm((visible) => !visible)}
                                    aria-label={showConfirm ? "Hide password" : "Show password"}
                                    aria-pressed={showConfirm}
                                >
                                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                                </button>

                            </div>

                        </div>

                        <p className={styles.passwordHint}>
                            {PASSWORD_HINT}
                        </p>

                        </div>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading || locationsLoading || locations.length === 0}
                            aria-busy={loading}
                        >

                            {loading
                                ? "Creating Account..."
                                : (
                                    <>
                                        Create Account
                                        <ArrowRightIcon />
                                    </>
                                )
                            }

                        </button>

                    </form>


                    {/* FOOTER */}

                    <p className={styles.footerText}>

                        Already have an account?{" "}

                        <Link href="/login">
                            Login
                        </Link>

                    </p>

                </div>

            </div>

        </section>

    );

}
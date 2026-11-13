"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { registerUser } from "../../services/authService";
import styles from "./register.module.css";

const API_URL = "http://localhost:5000";

export default function RegisterPage() {

    const [form, setForm] = useState({

        full_name: "",
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


        if (form.password.length < 6) {

            setError(
                "Password must be at least 6 characters."
            );

            return;

        }


        setLoading(true);


        try {

            const result =
                await registerUser({

                    full_name:
                        form.full_name,

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

                full_name: "",
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

        <section className={`auth-page ${styles.registerPage}`}>

            <div className={`auth-card register-card ${styles.registerCard}`}>


                {/* HEADER */}

                <div className={`auth-header ${styles.registerHeader}`}>

                    <div className="auth-icon">
                        <i className="fa-solid fa-leaf" aria-hidden="true" />
                    </div>

                    <h1>
                        Create Your Account
                    </h1>

                    <p>
                        Start discovering what you can grow.
                    </p>

                </div>


                {/* SUCCESS POPUP */}
                {success && (
                    <div
                        className="register-modal-overlay"
                        role="presentation"
                    >
                        <div
                            className="register-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="register-success-title"
                            aria-describedby="register-success-description"
                        >
                            <div className="register-modal-icon">
                                
                            </div>

                            <h2 id="register-success-title">
                                Account Created Successfully!
                            </h2>

                            <p id="register-success-description">
                                Your Build & Bloom account has been
                                registered successfully. Please proceed
                                to the login page to sign in using your
                                newly created account.
                            </p>

                            <Link
                                href="/login"
                                className="register-modal-button"
                            >
                                Proceed to Login
                            </Link>
                        </div>
                    </div>
                )}


                {/* ERROR */}

                {error && (

                    <div className={`auth-error ${styles.registerError}`}>

                        <strong>
                            Registration failed
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                )}


                {/* FORM */}

                <form
                    className={`auth-form ${styles.registerForm}`}
                    onSubmit={handleSubmit}
                >


                    {/* FULL NAME */}

                    <div className="form-group">

                        <label htmlFor="full_name">
                            Full Name
                        </label>

                        <div className={styles.fieldInputWrapper}>
                            <i
                                className={`fa-solid fa-user ${styles.fieldInputIcon}`}
                                aria-hidden="true"
                            />
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                value={form.full_name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                    </div>


                    {/* EMAIL */}

                    <div className="form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <div className={styles.fieldInputWrapper}>
                            <i
                                className={`fa-solid fa-envelope ${styles.fieldInputIcon}`}
                                aria-hidden="true"
                            />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                    </div>


                    {/* LOCATION */}

                    <div className="form-group">

                        <label htmlFor="location_id">
                            Location
                        </label>

                        <div className={styles.fieldInputWrapper}>
                            <i
                                className={`fa-solid fa-location-dot ${styles.fieldInputIcon}`}
                                aria-hidden="true"
                            />
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
                        </div>

                        {locationError && (
                            <p className={styles.locationError} role="alert">
                                {locationError}
                            </p>
                        )}

                    </div>


                    {/* PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className={styles.fieldInputWrapper}>
                            <i
                                className={`fa-solid fa-lock ${styles.fieldInputIcon}`}
                                aria-hidden="true"
                            />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                required
                            />
                        </div>

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>

                        <div className={styles.fieldInputWrapper}>
                            <i
                                className={`fa-solid fa-lock ${styles.fieldInputIcon}`}
                                aria-hidden="true"
                            />
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={
                                    form.confirmPassword
                                }
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                    </div>


                    {/* SUBMIT */}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading || locationsLoading || locations.length === 0}
                    >

                        {loading
                            ? "Creating Account..."
                            : "Create Account"
                        }

                    </button>

                </form>


                {/* FOOTER */}

                <div className={`auth-footer ${styles.registerFooter}`}>

                    <p>

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
"use client";

import Link from "next/link";
import { useState } from "react";

import { registerUser } from "../../services/authService";
import styles from "./register.module.css";



const locations = [
    { id: 8, name: "Alaminos" },
    { id: 6, name: "Agno" },
    { id: 7, name: "Aguilar" },
    { id: 9, name: "Alcala" },
    { id: 10, name: "Anda" },
    { id: 11, name: "Asingan" },
    { id: 12, name: "Balungao" },
    { id: 13, name: "Bani" },
    { id: 14, name: "Basista" },
    { id: 15, name: "Bautista" },
    { id: 16, name: "Bayambang" },
    { id: 17, name: "Binalonan" },
    { id: 18, name: "Binmaley" },
    { id: 19, name: "Bolinao" },
    { id: 20, name: "Bugallon" },
    { id: 21, name: "Burgos" },
    { id: 22, name: "Calasiao" },
    { id: 23, name: "Dasol" },
    { id: 1, name: "Dagupan" },
    { id: 24, name: "Infanta" },
    { id: 25, name: "Labrador" },
    { id: 26, name: "Laoac" },
    { id: 2, name: "Lingayen" },
    { id: 27, name: "Mabini" },
    { id: 28, name: "Malasiqui" },
    { id: 29, name: "Manaoag" },
    { id: 30, name: "Mangaldan" },
    { id: 31, name: "Mangatarem" },
    { id: 32, name: "Mapandan" },
    { id: 33, name: "Natividad" },
    { id: 34, name: "Pozorrubio" },
    { id: 35, name: "Rosales" },
    { id: 5, name: "San Carlos" },
    { id: 36, name: "San Fabian" },
    { id: 37, name: "San Jacinto" },
    { id: 38, name: "San Manuel" },
    { id: 39, name: "San Nicolas" },
    { id: 40, name: "San Quintin" },
    { id: 41, name: "Santa Maria" },
    { id: 4, name: "Santa Barbara" },
    { id: 42, name: "Santo Tomas" },
    { id: 43, name: "Sison" },
    { id: 44, name: "Sual" },
    { id: 45, name: "Tayug" },
    { id: 3, name: "Urdaneta" },
    { id: 46, name: "Umingan" },
    { id: 47, name: "Urbiztondo" },
    { id: 48, name: "Villasis" },
];



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
                                required
                            >

                                <option value="">
                                    Select your location
                                </option>

                                {locations.map(
                                    (location) => (

                                        <option
                                            key={location.id}
                                            value={location.id}
                                        >
                                            {location.name}
                                        </option>

                                    )
                                )}

                            </select>
                        </div>

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
                        disabled={loading}
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
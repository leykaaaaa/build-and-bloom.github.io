"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { loginUser } from "../../services/authService";
import styles from "./login.module.css";


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


const BENEFITS = [
    "Crop recommendations for Pangasinan",
    "Weather-aware planting advice",
    "Track every plant in My Plants"
];




export default function LoginPage() {

    const router = useRouter();


    const [form, setForm] = useState({
        email: "",
        password: ""
    });


    const [loading, setLoading] =
        useState(false);

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get("reason") === "session-expired") {
            setError("Your session expired. Please log in again to continue.");
        }
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
        setLoading(true);


        try {

            const result =
                await loginUser({

                    email:
                        form.email,

                    password:
                        form.password

                });


            console.log(
                "Login result:",
                result
            );


            /*
                Save the logged-in user.

                This is temporary client-side
                authentication storage.

                We will improve this later
                when we add protected routes.
            */

            localStorage.setItem(
    "buildAndBloomUser",
    JSON.stringify(result.user)
);

localStorage.setItem(
    "buildAndBloomToken",
    result.token
);


            
                if (result.user.role === "admin") {
    window.location.href = "/admin";
} else {
    window.location.href = "/dashboard";
}

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to login."
            );

        } finally {

            setLoading(false);

        }

    }


    return (

        <section className={styles.loginPage}>

            {/* BRAND PANEL */}

            <aside className={styles.brandPanel}>

                <span className={styles.brandCircle}>
                    <SproutIcon />
                </span>

                <h2>
                    Grow with confidence.
                </h2>

                <p>
                    Know what fits your location
                    before you plant.
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
                            WELCOME BACK
                        </span>

                        <h1>
                            Sign in
                        </h1>

                        <p>
                            Sign in to continue growing
                            with Build &amp; Bloom.
                        </p>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className={styles.error} role="alert">

                            <AlertIcon />

                            <div>

                                <strong>
                                    {error.startsWith("Your session expired")
                                        ? "Session expired"
                                        : "Login failed"}
                                </strong>

                                <p>
                                    {error}
                                </p>

                            </div>

                        </div>

                    )}


                    <form
                        className={styles.form}
                        onSubmit={handleSubmit}
                    >

                        {/* EMAIL */}

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


                        {/* PASSWORD */}

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
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
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


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                            aria-busy={loading}
                        >

                            {loading
                                ? "Logging in..."
                                : (
                                    <>
                                        Login
                                        <ArrowRightIcon />
                                    </>
                                )
                            }

                        </button>

                    </form>


                    {/* FOOTER */}

                    <p className={styles.footerText}>

                        Don&apos;t have an account?{" "}

                        <Link href="/register">
                            Create one
                        </Link>

                    </p>

                </div>

            </div>

        </section>

    );

}
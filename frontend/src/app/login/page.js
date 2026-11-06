"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { loginUser } from "../../services/authService";
import styles from "./login.module.css";


export default function LoginPage() {

    const router = useRouter();


    const [form, setForm] = useState({
        email: "",
        password: ""
    });


    const [loading, setLoading] =
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

        <section className="auth-page">

            <div className="auth-card">


                {/* HEADER */}

                <div className="auth-header">

                    <div className="auth-icon">
                        
                    </div>

                    <h1>
                        Welcome Back
                    </h1>

                    <p>
                        Sign in to continue growing
                        with Build & Bloom.
                    </p>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="auth-error">

                        <strong>
                            {error.startsWith("Your session expired")
                                ? "Session expired"
                                : "Login failed"}
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                )}


                {/* FORM */}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >


                    {/* EMAIL */}

                    <div className="form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <div className={styles.inputWrapper}>
                            <i
                                className={`fa-solid fa-envelope ${styles.inputIcon}`}
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


                    {/* PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className={styles.inputWrapper}>
                            <i
                                className={`fa-solid fa-lock ${styles.inputIcon}`}
                                aria-hidden="true"
                            />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                    </div>


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"
                        }

                    </button>

                </form>


                {/* FOOTER */}

                <div className="auth-footer">

                    <p>

                        Don't have an account?{" "}

                        <Link href="/register">
                            Create one
                        </Link>

                    </p>

                </div>


            </div>

        </section>

    );

}
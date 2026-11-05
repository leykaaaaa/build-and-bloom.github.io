"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logoImage from "../../../IMAGES/crop images/logo.png";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        { label: "Dashboard", href: "/dashboard", icon: "fa-solid fa-grip" },
        { label: "Crop Catalogue", href: "/crops", icon: "fa-solid fa-book-open" },
        { label: "Crop Assessment", href: "/assessment", icon: "fa-solid fa-clipboard-check" },
        { label: "Weather", href: "/weather", icon: "fa-solid fa-cloud-sun" },
        { label: "Planting Calendar", href: "/calendar", icon: "fa-solid fa-calendar" },
        { label: "My Plants", href: "/plants", icon: "fa-solid fa-seedling" },
    ];

    useEffect(() => {
        function loadUser() {
            const storedUser =
                localStorage.getItem("buildAndBloomUser");

            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);

                    if (parsedUser && parsedUser.user_id) {
                        setUser(parsedUser);
                    } else {
                        setUser(null);
                    }

                } catch (error) {
                    console.error(
                        "Invalid stored user:",
                        error
                    );

                    localStorage.removeItem(
                        "buildAndBloomUser"
                    );

                    setUser(null);
                }
            } else {
                setUser(null);
            }

            setLoaded(true);
        }

        loadUser();

        // Update navbar if localStorage changes
        // from another tab/window.
        window.addEventListener(
            "storage",
            loadUser
        );

        return () => {
            window.removeEventListener(
                "storage",
                loadUser
            );
        };

    }, []);

    useEffect(() => {
        document.body.classList.toggle(
            "user-sidebar-active",
            loaded && Boolean(user)
        );

        return () => {
            document.body.classList.remove("user-sidebar-active");
        };
    }, [loaded, user]);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    function handleLogout() {
        localStorage.removeItem(
            "buildAndBloomUser"
        );

        document.body.classList.remove("user-sidebar-active");
        setUser(null);
        setMenuOpen(false);

        window.location.href = "/";
    }

    if (loaded && user) {
        return (
            <>
                <button
                    type="button"
                    className={styles.mobileToggle}
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="user-navigation"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span />
                    <span />
                    <span />
                </button>

                {menuOpen && (
                    <button
                        type="button"
                        className={styles.mobileOverlay}
                        aria-label="Close navigation menu"
                        onClick={() => setMenuOpen(false)}
                    />
                )}

                <aside className={`${styles.sidebar}${menuOpen ? ` ${styles.sidebarOpen}` : ""}`}>
                    <Link href="/dashboard" className={styles.brand} onClick={() => setMenuOpen(false)}>
                        <span className={styles.brandMark}>
                            <Image
                                src={logoImage}
                                alt=""
                                width={42}
                                height={42}
                            />
                        </span>
                        <span className={styles.brandText}>
                            Build <span>&</span> Bloom
                        </span>
                    </Link>

                    <nav className={styles.navigation} id="user-navigation" aria-label="User navigation">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.navItem}${isActive ? ` ${styles.activeNavItem}` : ""}`}
                                    aria-current={isActive ? "page" : undefined}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item.icon && (
                                        <span className={styles.navIcon} aria-hidden="true">
                                            <i className={item.icon} />
                                        </span>
                                    )}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className={styles.sidebarBottom}>
                        <span className={styles.userName}>{user.full_name || "Gardener"}</span>
                        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </aside>
            </>
        );
    }

    /*
     * IMPORTANT:
     * Do not show the public navbar while
     * localStorage is still being checked.
     */
    if (!loaded) {
        return (
            <nav className="navbar">
                <div className="navbar-container">

                    <Link
                        href="/"
                        className="navbar-brand"
                    >
                        <Image
                            src={logoImage}
                            alt=""
                            width={42}
                            height={42}
                            className="brand-icon"
                        />

                        <span className="brand-text">
                            Build <span>&</span> Bloom
                        </span>
                    </Link>

                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar">

            <div className="navbar-container">

                {/* BRAND */}

                <Link
                    href={user ? "/dashboard" : "/"}
                    className="navbar-brand"
                >
                    <Image
                        src={logoImage}
                        alt=""
                        width={42}
                        height={42}
                        className="brand-icon"
                    />

                    <span className="brand-text">
                        Build <span>&</span> Bloom
                    </span>
                </Link>


                {/* NAVIGATION */}

                <button
                    type="button"
                    className="nav-toggle"
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="primary-navigation"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span />
                    <span />
                    <span />
                </button>

                <div
                    className={`navbar-links${menuOpen ? " is-open" : ""}`}
                    id="primary-navigation"
                >

                    <Link href="/" onClick={() => setMenuOpen(false)}>
                        Home
                    </Link>

                    <a href="/#about" onClick={() => setMenuOpen(false)}>
                        About
                    </a>

                    <a href="/#features" onClick={() => setMenuOpen(false)}>
                        Features
                    </a>

                </div>


                {/* ACTIONS */}

                <div className="navbar-actions">

                    <Link
                        href="/login"
                        className="login-button"
                    >
                        Login
                    </Link>

                    <Link
                        href="/register"
                        className="register-button"
                    >
                        Get Started
                    </Link>

                </div>

            </div>

        </nav>
    );
}
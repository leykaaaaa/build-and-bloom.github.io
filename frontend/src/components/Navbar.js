"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logoImage from "../../../IMAGES/crop images/logo.png";
import styles from "./Navbar.module.css";

// =========================================================
// SIDEBAR ICONS (inline SVG, no Font Awesome needed)
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

const DashboardIcon = () => (
    <Icon>
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
    </Icon>
);

const BookIcon = () => (
    <Icon>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </Icon>
);

const ClipboardCheckIcon = () => (
    <Icon>
        <rect width="8" height="4" x="8" y="2" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" />
    </Icon>
);

const CloudIcon = () => (
    <Icon>
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </Icon>
);

const CalendarIcon = () => (
    <Icon>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
    </Icon>
);

const SproutIcon = () => (
    <Icon>
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </Icon>
);

const LogoutIcon = () => (
    <Icon size={18} strokeWidth={2.2}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
    </Icon>
);

function getInitials(name) {
    const parts = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return "G";
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}


export default function Navbar() {
    const [user, setUser] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
        { label: "Crop Catalogue", href: "/crops", icon: <BookIcon /> },
        { label: "Crop Assessment", href: "/assessment", icon: <ClipboardCheckIcon /> },
        { label: "Weather", href: "/weather", icon: <CloudIcon /> },
        { label: "Planting Calendar", href: "/calendar", icon: <CalendarIcon /> },
        { label: "My Plants", href: "/plants", icon: <SproutIcon /> },
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
                                            {item.icon}
                                        </span>
                                    )}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className={styles.sidebarBottom}>
                        <div className={styles.userRow}>
                            <span className={styles.avatar} aria-hidden="true">
                                {getInitials(user.full_name)}
                            </span>
                            <span className={styles.userName}>{user.full_name || "Gardener"}</span>
                        </div>
                        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
                            <LogoutIcon />
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
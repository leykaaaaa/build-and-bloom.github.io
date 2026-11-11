"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoImage from "../../../../IMAGES/crop images/logo.png";
import {
    isAuthenticated,
    isAdmin
} from "../../services/authGuard";
import styles from "./layout.module.css";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace("/login");
            return;
        }

        if (!isAdmin()) {
            router.replace("/dashboard");
            return;
        }

        setAuthorized(true);
    }, [router]);

    if (!authorized) {
        return null;
    }

    const menuItems = [
        {
            name: "Dashboard",
            path: "/admin",
            icon: <i className="fa-solid fa-grip" />
        },
        {
            name: "Crop Management",
            path: "/admin/crops",
            icon: <i className="fa-solid fa-wheat-awn" />
        },
        {
            name: "Location Management",
            path: "/admin/locations",
            icon: <i className="fa-solid fa-map" />
        },
        {
            name: "Planting Calendar",
            path: "/admin/calendar",
            icon: <i className="fa-solid fa-calendar" />
        },
        {
            name: "User Management",
            path: "/admin/users",
            icon: <i className="fa-solid fa-users"/>
        },
        {
            name: "Recommendations",
            path: "/admin/recommendations",
            icon: <i className="fa-solid fa-bolt" />
        },
        {
            name: "Weather Advisories",
            path: "/admin/weather",
            icon: <i className="fa-solid fa-cloud-sun" />
        },
        {
            name: "Settings",
            path: "/admin/settings",
            icon: <i className="fa-solid fa-gear" />
        }
    ];

    return (
        <div className={styles.adminContainer}>

            {/* Sidebar */}
            <aside className={styles.sidebar}>

                {/* Logo / Brand */}
                <div className={styles.brand}>
                    <Image
                        src={logoImage}
                        alt=""
                        width={44}
                        height={44}
                        className={styles.logo}
                    />

                    <div>
                        <div className={styles.brandName}>
                            Build & Bloom
                        </div>

                        <div className={styles.brandSubtitle}>
                            Admin Panel
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className={styles.navigation} aria-label="Admin navigation">

                    {menuItems.map((item) => {
                        const isActive = item.path === "/admin"
                            ? pathname === item.path
                            : pathname === item.path || pathname.startsWith(`${item.path}/`);

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`${styles.navItem}${isActive ? ` ${styles.activeNavItem}` : ""}`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <span className={styles.navIcon} aria-hidden="true">
                                    {item.icon}
                                </span>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}

                </nav>

                {/* Bottom */}
                <div className={styles.sidebarBottom}>

                    <button
                        type="button"
                        onClick={() => {
                            localStorage.removeItem(
                                "buildAndBloomUser"
                            );

                            localStorage.removeItem(
                                "buildAndBloomToken"
                            );

                            router.replace("/login");
                        }}
                        className={styles.logoutButton}
                    >
                        Logout
                    </button>

                </div>

            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {children}
            </main>

        </div>
    );
}
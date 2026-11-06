"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "../../../services/authService";

import styles from "../adminPages.module.css";


// =========================================================
// SMALL INLINE ICONS (no extra package needed)
// =========================================================

function Icon({ size = 24, strokeWidth = 2, children }) {
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

const UsersIcon = () => (
    <Icon>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
);

const ShieldIcon = () => (
    <Icon>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
    </Icon>
);

const UserIcon = () => (
    <Icon>
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 0 0-16 0" />
    </Icon>
);

const SearchIcon = () => (
    <Icon size={20}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </Icon>
);


// Two-letter initials for the avatar circle
function getInitials(name) {
    const parts = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return "?";
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/users",
                    {
                        headers: getAuthHeaders()
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Failed to retrieve users."
                    );
                }

                setUsers(result.data);
            } catch (error) {
                console.error("Failed to fetch users:", error);

                setError(
                    "Unable to load registered users. Please make sure the backend server is running."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const roleOf = (user) => user.role || "user";

    const adminCount = users.filter(
        (user) => roleOf(user) === "admin"
    ).length;

    const roles = [...new Set(users.map(roleOf))].sort((a, b) =>
        a.localeCompare(b)
    );

    const filteredUsers = users.filter((user) => {
        const searchTerm = search.toLowerCase();

        const matchesSearch = (
            user.full_name?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.location_name?.toLowerCase().includes(searchTerm)
        );

        const matchesRole =
            !roleFilter || roleOf(user) === roleFilter;

        return matchesSearch && matchesRole;
    });

    return (
        <div className={styles.adminPage}>

            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.pageHeading}>
                    <h1 className={styles.pageTitle}>
                        User Management
                    </h1>

                    <p className={styles.pageSubtitle}>
                        View registered users and their selected locations.
                    </p>
                </div>
            </div>

            {/* Summary */}
            <div className={styles.statGrid}>
                <div className={styles.statBox}>
                    <span className={`${styles.statIconBox} ${styles.toneSun}`}>
                        <UsersIcon />
                    </span>

                    <div className={styles.statText}>
                        <span>Registered Users</span>
                        <strong>{loading ? "..." : users.length}</strong>
                    </div>
                </div>

                <div className={styles.statBox}>
                    <span className={`${styles.statIconBox} ${styles.toneMint}`}>
                        <ShieldIcon />
                    </span>

                    <div className={styles.statText}>
                        <span>Admins</span>
                        <strong>{loading ? "..." : adminCount}</strong>
                    </div>
                </div>

                <div className={styles.statBox}>
                    <span className={`${styles.statIconBox} ${styles.toneLeaf}`}>
                        <UserIcon />
                    </span>

                    <div className={styles.statText}>
                        <span>Standard users</span>
                        <strong>
                            {loading ? "..." : users.length - adminCount}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className={styles.errorBox}>
                    {error}
                </div>
            )}

            {/* Search + role filter */}
            {!loading && !error && (
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <span className={styles.searchBoxIcon}>
                            <SearchIcon />
                        </span>

                        <label
                            htmlFor="user-search"
                            className={styles.visuallyHidden}
                        >
                            Search name, email, or location
                        </label>

                        <input
                            id="user-search"
                            className={styles.searchInput}
                            type="search"
                            placeholder="Search name, email, or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <label
                        htmlFor="user-role"
                        className={styles.visuallyHidden}
                    >
                        Filter by role
                    </label>

                    <select
                        id="user-role"
                        className={styles.filterSelect}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All roles</option>

                        {roles.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className={styles.stateBox}>
                    Loading registered users...
                </div>
            )}

            {/* User Table */}
            {!loading && !error && (
                <section className={styles.tableCard}>
                    <div className={styles.tableCardHeader}>
                        <h2>Registered Users</h2>
                    </div>

                    <div className={styles.tableScroll}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Full Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Role</th>
                                    <th scope="col">Location</th>
                                    <th scope="col">Registered</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.user_id}>
                                        <td>{user.user_id}</td>

                                        <td>
                                            <div className={styles.userCell}>
                                                <span
                                                    className={styles.avatar}
                                                    aria-hidden="true"
                                                >
                                                    {getInitials(user.full_name)}
                                                </span>

                                                <span className={styles.cellStrong}>
                                                    {user.full_name}
                                                </span>
                                            </div>
                                        </td>

                                        <td>{user.email}</td>

                                        <td>
                                            <span
                                                className={`${styles.badge} ${
                                                    roleOf(user) === "admin"
                                                        ? styles.badgeAdmin
                                                        : styles.badgeUser
                                                }`}
                                            >
                                                {roleOf(user)}
                                            </span>
                                        </td>

                                        <td>{user.location_name || "—"}</td>

                                        <td>
                                            {user.created_at
                                                ? new Date(
                                                      user.created_at
                                                  ).toLocaleDateString()
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className={styles.emptyRow}>
                            No users found.
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
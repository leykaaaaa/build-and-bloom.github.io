"use client";

import { useCallback, useEffect, useState } from "react";
import {
    getNotifications,
    markNotificationRead
} from "../../services/notificationService";
import styles from "./notifications.module.css";

function formatDate(value) {
    return new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadNotifications = useCallback(async () => {
        try {
            const result = await getNotifications();
            setNotifications(result.data || []);
            setError("");
        } catch (requestError) {
            console.error("Failed to load notifications:", requestError);
            setError(requestError.message || "Unable to load your notifications.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!localStorage.getItem("buildAndBloomToken")) {
            window.location.href = "/login";
            return;
        }

        loadNotifications();
    }, [loadNotifications]);

    async function handleMarkRead(advisoryId) {
        try {
            await markNotificationRead(advisoryId);
            setNotifications((current) => current.map((notification) => (
                notification.advisory_id === advisoryId
                    ? { ...notification, read_at: new Date().toISOString() }
                    : notification
            )));
        } catch (requestError) {
            console.error("Failed to mark notification as read:", requestError);
            setError(requestError.message || "Unable to update this notification.");
        }
    }

    const unreadCount = notifications.filter((item) => !item.read_at).length;

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>YOUR GROWING SPACE</span>
                    <h1>Weather notifications</h1>
                    <p>Weather advisories from Build &amp; Bloom for your growing area.</p>
                </div>
                <span className={styles.count}>{unreadCount} unread</span>
            </header>

            {error && <div className={styles.error} role="alert">{error}</div>}

            {loading ? (
                <div className={styles.emptyState}>Loading your notifications...</div>
            ) : notifications.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon} aria-hidden="true">☀</span>
                    <h2>You’re all caught up</h2>
                    <p>New weather advisories for your location will appear here.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {notifications.map((notification) => (
                        <article
                            key={notification.advisory_id}
                            className={`${styles.card} ${!notification.read_at ? styles.unread : ""}`}
                        >
                            <div className={styles.cardTop}>
                                <span className={`${styles.priority} ${styles[notification.priority]}`}>
                                    {notification.priority}
                                </span>
                                {!notification.read_at && <span className={styles.unreadLabel}>New</span>}
                            </div>
                            <h2>{notification.title}</h2>
                            <p>{notification.message}</p>
                            <footer className={styles.cardFooter}>
                                <span>
                                    {notification.location_name || "All locations"}
                                    {" · "}
                                    {formatDate(notification.created_at)}
                                </span>
                                {!notification.read_at && (
                                    <button
                                        type="button"
                                        onClick={() => handleMarkRead(notification.advisory_id)}
                                    >
                                        Mark as read
                                    </button>
                                )}
                            </footer>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

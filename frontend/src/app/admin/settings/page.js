"use client";

import { useEffect, useState } from "react";

import styles from "../adminPages.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// =========================================================
// SMALL INLINE ICONS (no extra package needed)
// =========================================================

function Icon({ size = 28, strokeWidth = 2, children }) {
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

const SparklesIcon = () => (
  <Icon>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
  </Icon>
);

const CloudSunIcon = () => (
  <Icon>
    <path d="M12 2v2M4.9 4.9l1.4 1.4M20 12h2M19.1 4.9l-1.4 1.4M15.9 11.5a4 4 0 0 0-7.8-.5" />
    <path d="M17.5 19H9a5 5 0 1 1 4.9-6.1" />
    <path d="M17.5 19a3.5 3.5 0 0 0 0-7h-.4" />
  </Icon>
);

export default function AdminSettingsPage() {
  const [totalCrops, setTotalCrops] = useState(0);
  const [totalLocations, setTotalLocations] = useState(0);
  const [totalCalendarRecords, setTotalCalendarRecords] = useState(0);

  const [loadingCrops, setLoadingCrops] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(true);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/crops`
        );

        const result = await response.json();

        if (result.success) {
          setTotalCrops(result.data.length);
        }
      } catch (error) {
        console.error(
          "Failed to fetch crop count:",
          error
        );
      } finally {
        setLoadingCrops(false);
      }
    };

    fetchCrops();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/locations`
        );

        const result = await response.json();

        if (result.success) {
          setTotalLocations(result.data.length);
        }
      } catch (error) {
        console.error(
          "Failed to fetch location count:",
          error
        );
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/planting-calendar`
        );

        const result = await response.json();

        if (result.success) {
          setTotalCalendarRecords(result.data.length);
        }
      } catch (error) {
        console.error(
          "Failed to fetch calendar count:",
          error
        );
      } finally {
        setLoadingCalendar(false);
      }
    };

    fetchCalendar();
  }, []);

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeading}>
          <h1 className={styles.pageTitle}>
            Settings
          </h1>

          <p className={styles.pageSubtitle}>
            Manage and monitor basic Build &amp; Bloom system information.
          </p>
        </div>
      </div>

      {/* System Information */}
      <section className={styles.settingsCard}>
        <h2>System Information</h2>

        <div className={styles.infoRow}>
          <span>System Name</span>
          <strong>Build &amp; Bloom</strong>
        </div>

        <div className={styles.infoRow}>
          <span>System Type</span>
          <strong>
            Plant Management Decision Support System
          </strong>
        </div>

        <div className={styles.infoRow}>
          <span>Coverage</span>
          <strong>Pangasinan</strong>
        </div>

        <div className={styles.infoRow}>
          <span>Crop Dataset</span>
          <strong>
            {loadingCrops ? "Loading..." : `${totalCrops} Crops`}
          </strong>
        </div>

        <div className={styles.infoRow}>
          <span>Location Dataset</span>
          <strong>
            {loadingLocations
              ? "Loading..."
              : `${totalLocations} Locations`}
          </strong>
        </div>

        <div className={styles.infoRow}>
          <span>Planting Calendar Records</span>
          <strong>
            {loadingCalendar
              ? "Loading..."
              : `${totalCalendarRecords} Records`}
          </strong>
        </div>
      </section>

      {/* Recommendation Engine */}
      <section className={styles.featureCard}>
        <span className={`${styles.featureIcon} ${styles.toneLeaf}`}>
          <SparklesIcon />
        </span>

        <div className={styles.featureBody}>
          <h2>Recommendation Engine</h2>

          <p>
            The recommendation engine evaluates soil, water,
            sunlight, environment, weather, planting season,
            and location suitability.
          </p>

          <span className={styles.statusPill}>
            <span className={styles.statusDot} aria-hidden="true"></span>
            Recommendation Engine Active
          </span>
        </div>
      </section>

      {/* Weather Integration */}
      <section className={styles.featureCard}>
        <span className={`${styles.featureIcon} ${styles.toneWater}`}>
          <CloudSunIcon />
        </span>

        <div className={styles.featureBody}>
          <h2>Weather Integration</h2>

          <p>
            Build &amp; Bloom uses weather information to improve
            crop compatibility and provide weather-based
            planting and care advisories.
          </p>

          <span className={styles.statusPill}>
            <span className={styles.statusDot} aria-hidden="true"></span>
            Weather Integration Active
          </span>
        </div>
      </section>
    </div>
  );
}
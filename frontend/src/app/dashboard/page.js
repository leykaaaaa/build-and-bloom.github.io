"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getPlantingPlans } from "../../services/plantingPlanService";
import styles from "./dashboard.module.css";


export default function DashboardPage() {

    const [user, setUser] = useState(null);

    const [plans, setPlans] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        async function loadDashboard() {

            try {

                const storedUser =
                    localStorage.getItem(
                        "buildAndBloomUser"
                    );


                if (!storedUser) {

                    window.location.href = "/login";

                    return;

                }


                const parsedUser =
                    JSON.parse(storedUser);


                if (!parsedUser.user_id) {

                    window.location.href = "/login";

                    return;

                }


                setUser(parsedUser);


                const data =
                    await getPlantingPlans(
                        parsedUser.user_id
                    );


                setPlans(
                    Array.isArray(data)
                        ? data
                        : []
                );


            } catch (err) {

                console.error(err);

                setError(
                    err.message ||
                    "Unable to load dashboard data."
                );

            } finally {

                setLoading(false);

            }

        }


        loadDashboard();

    }, []);


    const getPlanStatusClass = (status) => {
        switch (status) {
            case "Growing":
                return styles.statusGrowing;
            case "Harvested":
                return styles.statusHarvested;
            case "Completed":
                return styles.statusCompleted;
            case "Planned":
            default:
                return styles.statusPlanned;
        }
    };

    if (loading) {

        return (

            <section className={styles.dashboardPage}>

                <div className={styles.dashboardContainer}>

                    <div className={styles.catalogueState}>

                        <p>
                            Loading your dashboard...
                        </p>

                    </div>

                </div>

            </section>

        );

    }


    if (!user) {
        return null;
    }


    return (

        <section className={styles.dashboardPage}>

            <div className={styles.dashboardContainer}>


                {/* WELCOME */}

                <div className={styles.dashboardWelcome}>

                    <div>

                        <span className={styles.dashboardWelcomeBadge}>
                            Build & Bloom
                        </span>

                        <h1>
                            Welcome back, <span>{user.full_name}</span>!
                        </h1>

                        <p>
                            Here's an overview of your
                            planting activities.
                        </p>

                    </div>

                    <div className={styles.dashboardWelcomeIcon} aria-hidden="true">
                        
                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div className={styles.dashboardError}>

                        <span aria-hidden="true">!</span>

                        <div>

                            <strong>
                                Dashboard Notice
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* STAT CARDS */}

                <div className={styles.dashboardStats}>


                    <div className={styles.dashboardStatCard}>

                        <div className={styles.dashboardStatIcon} aria-hidden="true">
                            
                        </div>

                        <div>

                            <span>
                                Total Plans
                            </span>

                            <strong>
                                {plans.length}
                            </strong>

                        </div>

                    </div>


                    <div className={styles.dashboardStatCard}>

                        <div className={styles.dashboardStatIcon} aria-hidden="true">
                            
                        </div>

                        <div>

                            <span>
                                Growing
                            </span>

                            <strong>
                                {plans.filter((plan) => plan.status === "Growing").length}
                            </strong>

                        </div>

                    </div>


                    <div className={styles.dashboardStatCard}>

                        <div className={styles.dashboardStatIcon} aria-hidden="true">
                            
                        </div>

                        <div>

                            <span>
                                Harvested
                            </span>

                            <strong>
                                {plans.filter((plan) => plan.status === "Harvested").length}
                            </strong>

                        </div>

                    </div>


                    <div className={styles.dashboardStatCard}>

                        <div className={styles.dashboardStatIcon} aria-hidden="true">
                            
                        </div>

                        <div>

                            <span>
                                Completed
                            </span>

                            <strong>
                                {plans.filter((plan) => plan.status === "Completed").length}
                            </strong>

                        </div>

                    </div>


                </div>


                {/* MAIN GRID */}

                <div className={styles.dashboardGrid}>


                    {/* PLANTING PLANS */}

                    <div className={styles.dashboardPanel}>

                        <div className={styles.dashboardPanelHeader}>

                            <div>

                                <span>
                                    Your Activity
                                </span>

                                <h2>
                                    Recent Planting Plans
                                </h2>

                            </div>

                            <Link href="/plants">View All</Link>

                        </div>


                        {plans.length === 0 ? (

                            <div className={styles.dashboardEmpty}>

                                <div aria-hidden="true"></div>

                                <h3>
                                    No planting plans yet
                                </h3>

                                <p>
                                    Start planning your first crop.
                                </p>

                                <Link
                                    href="/crops"
                                    className={styles.dashboardActionButton}
                                >
                                    Explore Crops
                                </Link>

                            </div>

                        ) : (

                            <div className={styles.dashboardPlanList}>

                                {plans.slice(0, 3).map((plan) => (

                                    <div
                                        className={styles.dashboardPlanItem}
                                        key={plan.plan_id}
                                    >

                                        <div className={styles.dashboardPlanIcon} aria-hidden="true">
                                            
                                        </div>

                                        <div className={styles.dashboardPlanInfo}>

                                            <strong>
                                                {plan.plan_name}
                                            </strong>

                                            <span>
                                                {plan.crop_name}
                                            </span>

                                        </div>

                                        <span
                                            className={`${styles.plantStatus} ${getPlanStatusClass(plan.status)}`}
                                        >
                                            {plan.status}
                                        </span>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>


                    {/* QUICK ACTIONS */}

                    <div className={styles.dashboardPanel}>

                        <div className={styles.dashboardPanelHeader}>

                            <div>

                                <span>
                                    Get Started
                                </span>

                                <h2>
                                    Quick Actions
                                </h2>

                            </div>

                        </div>


                        <div className={styles.dashboardActions}>


                            <Link
                                href="/assessment"
                                className={styles.dashboardActionCard}
                            >

                                <span aria-hidden="true">
                                    <i className="fa-solid fa-clipboard-check" />
                                </span>

                                <div>

                                    <strong>
                                        Crop Assessment
                                    </strong>

                                    <p>
                                        Find crops suitable for your conditions.
                                    </p>

                                </div>

                            </Link>


                            <Link
                                href="/crops"
                                className={styles.dashboardActionCard}
                            >

                                   <span aria-hidden="true">
                                    <i className="fa-solid fa-book-open" />
                                </span>

                                <div>

                                    <strong>
                                        Crop Catalogue
                                    </strong>

                                    <p>
                                        Explore available crops and their requirements.
                                    </p>

                                </div>

                            </Link>


                            <Link
                                href="/weather"
                                className={styles.dashboardActionCard}
                            >
                            <span aria-hidden="true">
                                    <i className="fa-solid fa-cloud-sun" />
                                </span>

                                <div>

                                    <strong>
                                        Check Weather
                                    </strong>

                                    <p>
                                        View current weather conditions.
                                    </p>

                                </div>

                            </Link>


                            <Link
                                href="/calendar"
                                className={styles.dashboardActionCard}
                            >

                                <span aria-hidden="true">
                                    <i className="fa-solid fa-calendar" />
                                </span>
                                <div>

                                    <strong>
                                        Planting Calendar
                                    </strong>

                                    <p>
                                        Check planting schedules for crops.
                                    </p>

                                </div>

                            </Link>


                        </div>

                    </div>


                </div>


                {/* BOTTOM CTA */}

                <div className={styles.dashboardCta}>

                    <div>

                        <span>
                            Ready to grow?
                        </span>

                        <h2>
                            Find the right crop for your location.
                        </h2>

                        <p>
                            Use our crop assessment to understand which crops match your growing conditions.
                        </p>

                    </div>


                    <Link
                        href="/assessment"
                        className={styles.dashboardCtaButton}
                    >
                        Start Assessment
                    </Link>

                </div>


            </div>

        </section>

    );

}
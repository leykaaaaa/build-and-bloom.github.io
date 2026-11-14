import Link from "next/link";
import Image from "next/image";
import HomeDeveloperCarousel from "./HomeDeveloperCarousel";

import styles from "./home.module.css";

const logoImage = "/IMAGES/crop%20images/logo.png";

// =========================================================
// SMALL INLINE ICONS (no extra package needed)
// =========================================================

function Icon({ size = 26, strokeWidth = 1.9, children }) {
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

const CloudSunIcon = ({ size }) => (
    <Icon size={size}>
        <path d="M12 2v2M4.9 4.9l1.4 1.4M20 12h2M19.1 4.9l-1.4 1.4M15.9 11.5a4 4 0 0 0-7.8-.5" />
        <path d="M17.5 19H9a5 5 0 1 1 4.9-6.1" />
        <path d="M17.5 19a3.5 3.5 0 0 0 0-7h-.4" />
    </Icon>
);

const SproutIcon = ({ size }) => (
    <Icon size={size}>
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </Icon>
);

const SparklesIcon = () => (
    <Icon size={16} strokeWidth={2.2}>
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
    </Icon>
);

const TargetIcon = ({ size }) => (
    <Icon size={size}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </Icon>
);

const ArrowRightIcon = () => (
    <Icon size={20} strokeWidth={2.4}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </Icon>
);


const FEATURES = [
    {
        title: "Crop Catalogue",
        text: "Browse available crops and learn about their growing requirements, growing period, and other important information."
    },
    {
        title: "Crop Compatibility Assessment",
        text: "Evaluate whether a crop matches your soil, water, sunlight, environment, temperature, and other conditions."
    },
    {
        title: "Location-Based Recommendations",
        text: "Get recommendations based on the selected growing location and its relevant conditions."
    },
    {
        title: "Weather & Forecast",
        text: "Check current weather conditions and extended forecasts that can help inform your planting decisions."
    },
    {
        title: "Planting Calendar",
        text: "Explore planting periods, seasons, growing periods, harvest periods, and notes for available crops."
    },
    {
        title: "Planting Plans & Tracking",
        text: "Create planting plans for selected crops, manage their status, and monitor your growing activities through My Plants."
    }
];

const STEPS = [
    ["Explore", "Browse crops and learn about their requirements."],
    ["Assess", "Enter your location and growing conditions."],
    ["Analyze", "The Compatibility Engine evaluates your conditions."],
    ["Recommend", "Receive explained crop recommendations based on your conditions."],
    ["Plan", "Create a planting plan for your selected crop."],
    ["Monitor", "Track your plant and manage its growing status."]
];

const DEVELOPERS = [
    ["Angelica Tulagan", "Project Manager"],
    ["Francine Nicole De Guzman", "System Developer"],
    ["Mike Lomibao", "System Developer"],
    ["Chris Lawrence Mamaril", "System Developer"],
    ["Maverick John Diag", "System Developer"],
    ["Regie Boy Gamboa", "System Developer"]
];

const PURPOSES = [
    {
        title: "For Growers",
        text: "Designed for farmers, home growers, plantitos, plantitas, and urban growers."
    },
    {
        title: "For Better Decisions",
        text: "Turn growing conditions into understandable planting recommendations."
    },
    {
        title: "For Pangasinan",
        text: "Built around local growing conditions and agricultural information in Pangasinan."
    }
];

function pad(number) {
    return String(number).padStart(2, "0");
}


export default function Home() {
    return (
        <div className={styles.home}>

            {/* =========================================
                HERO
            ========================================= */}

            <section className={styles.hero}>

                <div className={`${styles.container} ${styles.heroInner}`}>

                    <div className={styles.heroContent}>

                        <span className={styles.heroBadge}>
                            <SparklesIcon />
                            Smart Growing for Pangasinan
                        </span>

                        <h1>
                            What can you
                            <span> grow here?</span>
                        </h1>

                        <p>
                            Build &amp; Bloom helps you discover suitable
                            crops, understand their growing requirements,
                            and plan how to grow them based on your
                            location, soil, weather, and growing conditions.
                        </p>

                        <div className={styles.heroButtons}>

                            <Link
                                href="/assessment"
                                className={styles.primaryButton}
                            >
                                Start Crop Assessment
                                <ArrowRightIcon />
                            </Link>

                            <Link
                                href="/crops"
                                className={styles.secondaryButton}
                            >
                                Explore Crops
                            </Link>

                        </div>

                    </div>


                    <div className={styles.heroVisual}>

                        <div className={styles.plantCard}>

                            <div className={styles.plantCircle}>
                                <Image
                                    src={logoImage}
                                    alt="Build & Bloom"
                                    width={140}
                                    height={140}
                                    className={styles.plantLogo}
                                />
                            </div>

                            <h3>
                                Grow with confidence.
                            </h3>

                            <p>
                                Know what fits your location
                                before you plant.
                            </p>

                        </div>

                        <div className={`${styles.floatChip} ${styles.chipOne}`}>
                            <span className={`${styles.chipIcon} ${styles.chipLeaf}`}>
                                <TargetIcon size={22} />
                            </span>
                            <div>
                                <strong>Compatibility</strong>
                                <span>Explained match scores</span>
                            </div>
                        </div>

                        <div className={`${styles.floatChip} ${styles.chipTwo}`}>
                            <span className={`${styles.chipIcon} ${styles.chipMint}`}>
                                <CloudSunIcon size={22} />
                            </span>
                            <div>
                                <strong>Live weather</strong>
                                <span>Insights for your area</span>
                            </div>
                        </div>

                        <div className={`${styles.floatChip} ${styles.chipThree}`}>
                            <span className={`${styles.chipIcon} ${styles.chipLeaf}`}>
                                <SproutIcon size={22} />
                            </span>
                            <div>
                                <strong>Planting plan</strong>
                                <span>Track your growing status</span>
                            </div>
                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================
                ABOUT BUILD & BLOOM
            ========================================= */}

            <section
                className={styles.aboutSection}
                id="about"
            >

                <div className={styles.container}>

                    <div className={styles.aboutGrid}>

                        <div className={styles.aboutMain}>

                            <span className={styles.eyebrow}>
                                ABOUT BUILD &amp; BLOOM
                            </span>

                            <h2>
                                Smarter planting decisions,
                                <span> made for your conditions.</span>
                            </h2>

                            <p>
                                Build &amp; Bloom is a Plant Management
                                Decision Support System designed to
                                help growers make more informed
                                planting decisions in Pangasinan.
                            </p>

                            <p>
                                Instead of simply suggesting popular
                                crops, the system considers factors
                                such as location, soil, water,
                                sunlight, temperature, season,
                                growing environment, and weather.
                            </p>

                            <p>
                                The goal is simple:
                                <strong>
                                    {" "}help you understand what you
                                    can grow, whether it fits your
                                    conditions, and how you can plan
                                    for it.
                                </strong>
                            </p>

                        </div>


                        <div className={styles.purposeList}>

                            {PURPOSES.map((item, index) => (

                                <div
                                    className={styles.purposeItem}
                                    key={item.title}
                                >

                                    <span className={styles.purposeNumber}>
                                        {pad(index + 1)}
                                    </span>

                                    <div>

                                        <h3>
                                            {item.title}
                                        </h3>

                                        <p>
                                            {item.text}
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================
                FEATURES
            ========================================= */}

            <section
                className={styles.featuresSection}
                id="features"
            >

                <div className={styles.container}>

                    <div className={styles.sectionHeading}>

                        <span className={styles.eyebrow}>
                            WHAT BUILD &amp; BLOOM OFFERS
                        </span>

                        <h2>
                            Everything you need to plan your next crop.
                        </h2>

                        <p>
                            Explore your options, understand your
                            growing conditions, and turn your decision
                            into an organized planting plan.
                        </p>

                    </div>


                    <div
                        className={styles.featureGrid}
                        role="region"
                        aria-label="Build & Bloom features"
                        tabIndex={0}
                    >

                        {FEATURES.map((feature, index) => (

                            <div
                                className={`${styles.featureCard} ${index % 2 === 1 ? styles.featureAlt : ""}`}
                                key={feature.title}
                            >

                                <div className={styles.featureTop}>
                                    <h3>{feature.title}</h3>

                                    <span className={styles.featureNumber}>
                                        {pad(index + 1)}
                                    </span>

                                </div>

                                <p>
                                    {feature.text}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

            </section>


            {/* =========================================
                HOW IT WORKS
            ========================================= */}

            <section className={styles.howSection}>

                <div className={styles.container}>

                    <div className={`${styles.sectionHeading} ${styles.leftAligned}`}>

                        <span className={styles.eyebrow}>
                            HOW IT WORKS
                        </span>

                        <h2>
                            From question to planting plan.
                        </h2>

                    </div>


                    <div className={styles.stepsGrid}>

                        {STEPS.map(([title, text], index) => (

                            <div className={styles.stepCard} key={title}>

                                <div className={styles.stepHeading}>
                                    <div className={styles.stepNumber}>
                                        {index + 1}
                                    </div>

                                    <h3>{title}</h3>
                                </div>

                                <p>
                                    {text}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

            </section>


            {/* =========================================
                DEVELOPERS
            ========================================= */}

            <section className={styles.developersSection} id="developers">

                <div className={styles.container}>

                    <div className={styles.sectionHeading}>

                        <span className={styles.eyebrow}>
                            THE TEAM
                        </span>

                        <h2>
                            Meet the <span>Developers</span>
                        </h2>

                        <p>
                            The people behind Build &amp; Bloom, working together to
                            create a smarter planting decision support system.
                        </p>

                    </div>


                    <HomeDeveloperCarousel developers={DEVELOPERS} />

                </div>

            </section>


            {/* =========================================
                CALL TO ACTION
            ========================================= */}

            <section className={styles.ctaSection}>

                <div className={styles.container}>

                    <div className={styles.ctaContent}>

                        <span>
                            READY TO GROW?
                        </span>

                        <h2>
                            Start with the right crop.
                        </h2>

                        <p>
                            Discover what you can grow based on
                            your conditions.
                        </p>

                        <Link
                            href="/assessment"
                            className={styles.ctaButton}
                        >
                            Start Crop Assessment
                            <ArrowRightIcon />
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}
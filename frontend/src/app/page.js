import Link from "next/link";
import Image from "next/image";
import logoImage from "../../../IMAGES/crop images/logo.png";

export default function Home() {
    return (
        <div>

            {/* =========================================
                HERO
            ========================================= */}

            <section className="hero">

                <div className="hero-content">

                    <div className="hero-badge">
                        Smart Growing for Pangasinan
                    </div>

                    <h1>
                        What can you
                        <span> grow here?</span>
                    </h1>

                    <p>
                        Build & Bloom helps you discover suitable
                        crops, understand their growing requirements,
                        and plan how to grow them based on your
                        location, soil, weather, and growing conditions.
                    </p>

                    <div className="hero-buttons">

                        <Link
                            href="/assessment"
                            className="primary-button"
                        >
                            Start Crop Assessment 
                        </Link>

                        <Link
                            href="/crops"
                            className="secondary-button"
                        >
                            Explore Crops
                        </Link>

                    </div>

                </div>


                <div className="hero-visual">

                    <div className="plant-card">

                        <div className="plant-circle">
                            <Image
                                src={logoImage}
                                alt="Build & Bloom"
                                width={140}
                                height={140}
                                className="plant-logo"
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

                </div>

            </section>


            {/* =========================================
                ABOUT BUILD & BLOOM
            ========================================= */}

            <section
                className="about-section"
                id="about"
            >

                <div className="about-container">

                    <div className="about-heading">

                        <span className="section-label">
                            ABOUT BUILD & BLOOM
                        </span>

                        <h2>
                            Smarter planting decisions,
                            <span> made for your conditions.</span>
                        </h2>

                    </div>


                    <div className="about-content">

                        <div className="about-main">

                            <p>
                                Build & Bloom is a Plant Management
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


                        <div className="about-purpose">

                            <div className="about-purpose-item">

                                <span className="about-purpose-number">
                                    01
                                </span>

                                <div>

                                    <h3>
                                        For Growers
                                    </h3>

                                    <p>
                                        Designed for farmers,
                                        home growers, plantitos,
                                        plantitas, and urban growers.
                                    </p>

                                </div>

                            </div>


                            <div className="about-purpose-item">

                                <span className="about-purpose-number">
                                    02
                                </span>

                                <div>

                                    <h3>
                                        For Better Decisions
                                    </h3>

                                    <p>
                                        Turn growing conditions
                                        into understandable
                                        planting recommendations.
                                    </p>

                                </div>

                            </div>


                            <div className="about-purpose-item">

                                <span className="about-purpose-number">
                                    03
                                </span>

                                <div>

                                    <h3>
                                        For Pangasinan
                                    </h3>

                                    <p>
                                        Built around local growing
                                        conditions and agricultural
                                        information in Pangasinan.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================
                FEATURES
            ========================================= */}

            <section
                className="features-section"
                id="features"
            >

                <div className="section-heading">

                    <span>
                        WHAT BUILD & BLOOM OFFERS
                    </span>

                    <h2>
                        Everything you need to plan
                        <br />
                        your next crop.
                    </h2>

                    <p>
                        Explore your options, understand your
                        growing conditions, and turn your decision
                        into an organized planting plan.
                    </p>

                </div>


                <div className="feature-grid">


                    {/* FEATURE 1 */}

                    <div className="feature-card">

                        <div className="feature-icon">
                            <i className="fa-solid fa-book-open" aria-hidden="true" />
                        </div>

                        <span className="feature-number">
                            01
                        </span>

                        <h3>
                            Crop Catalogue
                        </h3>

                        <p>
                            Browse available crops and learn about
                            their growing requirements, growing
                            period, and other important information.
                        </p>

                    </div>


                    {/* FEATURE 2 */}

                    <div className="feature-card">

                        <div className="feature-icon">
                          <i className="fa-solid fa-clipboard-check" aria-hidden="true" />
                            
                        </div>

                        <span className="feature-number">
                            02
                        </span>

                        <h3>
                            Crop Compatibility Assessment
                        </h3>

                        <p>
                            Evaluate whether a crop matches your
                            soil, water, sunlight, environment,
                            temperature, and other conditions.
                        </p>

                    </div>


                    {/* FEATURE 3 */}

                    <div className="feature-card">

                        <div className="feature-icon">
                            <i className="fa-solid fa-location-dot" aria-hidden="true" />
                            
                        </div>

                        <span className="feature-number">
                            03
                        </span>

                        <h3>
                            Location-Based Recommendations
                        </h3>

                        <p>
                            Get recommendations based on the
                            selected growing location and its
                            relevant conditions.
                        </p>

                    </div>


                    {/* FEATURE 4 */}

                    <div className="feature-card">

                        <div className="feature-icon">
                            <i className="fa-solid fa-cloud-sun" aria-hidden="true" />
                        </div>

                        <span className="feature-number">
                            04
                        </span>

                        <h3>
                            Weather & Forecast
                        </h3>

                        <p>
                            Check current weather conditions and
                            extended forecasts that can help inform
                            your planting decisions.
                        </p>

                    </div>


                    {/* FEATURE 5 */}

                    <div className="feature-card">

                        <div className="feature-icon">
                            <i className="fa-solid fa-calendar-days" aria-hidden="true" />
                            
                        </div>

                        <span className="feature-number">
                            05
                        </span>

                        <h3>
                            Planting Calendar
                        </h3>

                        <p>
                            Explore planting periods, seasons,
                            growing periods, harvest periods,
                            and notes for available crops.
                        </p>

                    </div>


                    {/* FEATURE 6 */}

                    <div className="feature-card">

                        <div className="feature-icon">
                            <i className="fa-solid fa-seedling" aria-hidden="true" />
                            
                        </div>

                        <span className="feature-number">
                            06
                        </span>

                        <h3>
                            Planting Plans & Tracking
                        </h3>

                        <p>
                            Create planting plans for selected crops,
                            manage their status, and monitor your
                            growing activities through My Plants.
                        </p>

                    </div>

                </div>

            </section>


            {/* =========================================
                HOW IT WORKS
            ========================================= */}

            <section className="how-section">

                <div className="section-heading">

                    <span>
                        HOW IT WORKS
                    </span>

                    <h2>
                        From question to planting plan.
                    </h2>

                </div>


                <div className="steps-grid">

                    <div className="step-card">

                        <div className="step-number">
                            01
                        </div>

                        <h3>
                            Explore
                        </h3>

                        <p>
                            Browse crops and learn about
                            their requirements.
                        </p>

                    </div>


                    <div className="step-card">

                        <div className="step-number">
                            02
                        </div>

                        <h3>
                            Assess
                        </h3>

                        <p>
                            Enter your location and growing
                            conditions.
                        </p>

                    </div>


                    <div className="step-card">

                        <div className="step-number">
                            03
                        </div>

                        <h3>
                            Analyze
                        </h3>

                        <p>
                            The Compatibility Engine evaluates
                            your conditions.
                        </p>

                    </div>


                    <div className="step-card">

                        <div className="step-number">
                            04
                        </div>

                        <h3>
                            Recommend
                        </h3>

                        <p>
                            Receive explained crop recommendations
                            based on your conditions.
                        </p>

                    </div>


                    <div className="step-card">

                        <div className="step-number">
                            05
                        </div>

                        <h3>
                            Plan
                        </h3>

                        <p>
                            Create a planting plan for your
                            selected crop.
                        </p>

                    </div>


                    <div className="step-card">

                        <div className="step-number">
                            06
                        </div>

                        <h3>
                            Monitor
                        </h3>

                        <p>
                            Track your plant and manage
                            its growing status.
                        </p>

                    </div>

                </div>

            </section>


            
{/* =========================================
    DEVELOPERS SECTION
========================================= */}

<section className="developers-section" id="developers">
    <div className="developers-container">

        <div className="developers-heading">
            <span>THE TEAM</span>

            <h2>
                Meet the <span>Developers</span>
            </h2>

            <p>
                The people behind Build & Bloom, working together to
                create a smarter planting decision support system.
            </p>
        </div>

        <div className="developers-grid">

            {/* Developer 1 */}
            <div className="developer-card">
                <div className="developer-photo">
                    <img
                        src="/developers/developer-1.jpg"
                        alt="Angelica Tulagan"
                        className="developer-photo-image"
                    />
                </div>

                <div className="developer-info">
                    <h3>Angelica Tulagan</h3>
                    <p>System Developer</p>
                </div>
            </div>


            {/* Developer 2 */}
            <div className="developer-card">
                <div className="developer-photo">
                    <img
                        src="/developers/developer-2.jpg"
                        alt="Francine Nicole De Guzman"
                        className="developer-photo-image"
                    />
                </div>

                <div className="developer-info">
                    <h3>Francine Nicole De Guzman</h3>
                    <p>UX Designer</p>
                </div>
            </div>


            {/* Developer 3 */}
            <div className="developer-card">
                <div className="developer-photo">
                    <img
                        src="/developers/developer-3.jpg"
                        alt="Mike Lomibao"
                        className="developer-photo-image"
                    />
                </div>

                <div className="developer-info">
                    <h3>Mike Lomibao</h3>
                    <p>Quality Assurance Tester</p>
                </div>
            </div>


            {/* Developer 4 */}
            <div className="developer-card">
                <div className="developer-photo">
                    <img
                        src="/developers/developer-4.jpg"
                        alt="Chris Lawrence Mamaril"
                        className="developer-photo-image"
                    />
                </div>

                <div className="developer-info">
                    <h3>Chris Lawrence Mamaril</h3>
                    <p>System Developer</p>
                </div>
            </div>


            {/* Developer 5 */}
            <div className="developer-card">
                <div className="developer-photo">
                    <img
                        src="/developers/developer-5.jpg"
                        alt="Maverick John Diag"
                        className="developer-photo-image"
                    />
                </div>

                <div className="developer-info">
                    <h3>Maverick John Diag</h3>
                    <p>System Developer</p>
                </div>
            </div>


            {/* Developer 6 */}
            <div className="developer-card">
                <div className="developer-photo">
                    <img
                        src="/developers/developer-6.jpg"
                        alt="Regie Boy Gamboa"
                        className="developer-photo-image"
                    />
                </div>

                <div className="developer-info">
                    <h3>Regie Boy Gamboa</h3>
                    <p>System Developer</p>
                </div>
            </div>

        </div>

    </div>
</section>


            {/* =========================================
                CALL TO ACTION
            ========================================= */}

            <section className="cta-section">

                <div className="cta-content">

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
                        className="primary-button"
                    >
                        Start Crop Assessment 
                    </Link>

                </div>

            </section>

        </div>
    );
}

"use client";

import { useEffect, useRef } from "react";
import styles from "./home.module.css";

export default function HomeDeveloperCarousel({ developers }) {
    const carouselRef = useRef(null);

    useEffect(() => {
        const carousel = carouselRef.current;

        if (!carousel || developers.length < 2) {
            return undefined;
        }

        let pauseUntil = 0;
        let direction = 1;
        const pauseAutoplay = () => {
            pauseUntil = Date.now() + 6000;
        };

        const intervalId = window.setInterval(() => {
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
                carousel.matches(":focus-within") ||
                Date.now() < pauseUntil
            ) {
                return;
            }

            const bounds = carousel.getBoundingClientRect();
            if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
                return;
            }

            const cards = Array.from(carousel.children);
            const carouselLeft = bounds.left;
            const currentIndex = cards.reduce((closestIndex, card, index) => {
                const currentDistance = Math.abs(
                    cards[closestIndex].getBoundingClientRect().left -
                        carouselLeft
                );
                const candidateDistance = Math.abs(
                    card.getBoundingClientRect().left - carouselLeft
                );

                return candidateDistance < currentDistance
                    ? index
                    : closestIndex;
            }, 0);

            let nextIndex = currentIndex + direction;
            if (nextIndex >= cards.length || nextIndex < 0) {
                direction *= -1;
                nextIndex = currentIndex + direction;
            }

            const nextCard = cards[nextIndex];
            const targetLeft =
                carousel.scrollLeft +
                nextCard.getBoundingClientRect().left -
                carouselLeft;

            carousel.scrollTo({ left: targetLeft, behavior: "smooth" });
        }, 4200);

        carousel.addEventListener("pointerdown", pauseAutoplay);
        carousel.addEventListener("wheel", pauseAutoplay, { passive: true });
        carousel.addEventListener("keydown", pauseAutoplay);

        return () => {
            window.clearInterval(intervalId);
            carousel.removeEventListener("pointerdown", pauseAutoplay);
            carousel.removeEventListener("wheel", pauseAutoplay);
            carousel.removeEventListener("keydown", pauseAutoplay);
        };
    }, [developers.length]);

    return (
        <div
            ref={carouselRef}
            className={styles.developersGrid}
            role="region"
            aria-label="Meet the developers"
            tabIndex={0}
        >
            {developers.map(([name, role], index) => (
                <article className={styles.developerCard} key={name}>
                    <div className={styles.developerPhoto}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={`/developers/developer-${index + 1}.jpg`}
                            alt={name}
                            className={styles.developerPhotoImage}
                        />
                    </div>

                    <div className={styles.developerInfo}>
                        <h3>{name}</h3>
                        <p>{role}</p>
                    </div>
                </article>
            ))}
        </div>
    );
}

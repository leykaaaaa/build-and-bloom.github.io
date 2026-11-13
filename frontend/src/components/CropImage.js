import Image from "next/image";
import bitterGourdImage from "../../../IMAGES/crop images/bitter gourd.png";
import camoteImage from "../../../IMAGES/crop images/camote.png";
import chiliImage from "../../../IMAGES/crop images/18.png";
import cornImage from "../../../IMAGES/crop images/corn.png";
import dieffenbachiaImage from "../../../IMAGES/crop images/dieffenbachia.png";
import eggplantImage from "../../../IMAGES/crop images/eggplant.png";
import heartOfJesusImage from "../../../IMAGES/crop images/Heart of Jesus.png";
import hibiscusImage from "../../../IMAGES/crop images/hibiscus.png";
import leafImage from "../../../IMAGES/crop images/leaf.png";
import mangoImage from "../../../IMAGES/crop images/mangoes.png";
import mungBeanImage from "../../../IMAGES/crop images/mung bean.png";
import okraImage from "../../../IMAGES/crop images/okra.png";
import onionImage from "../../../IMAGES/crop images/onion.png";
import peanutImage from "../../../IMAGES/crop images/peanut.png";
import potatoImage from "../../../IMAGES/crop images/potato.png";
import riceImage from "../../../IMAGES/crop images/rice_palay.png";
import snakePlantImage from "../../../IMAGES/crop images/snake plant.png";
import squashImage from "../../../IMAGES/crop images/squash.png";
import stringBeansImage from "../../../IMAGES/crop images/string beans.png";
import tomatoImage from "../../../IMAGES/crop images/tomato.png";
import watermelonImage from "../../../IMAGES/crop images/watermelon.png";
import bananaImage from "../../../IMAGES/crop images/banana.png";
import calamansiImage from "../../../IMAGES/crop images/calamansi.png";
import guavaImage from "../../../IMAGES/crop images/guava.png";

import styles from "./CropImage.module.css";

const cropImages = {
    rice: riceImage,
    corn: cornImage,
    tomato: tomatoImage,
    onion: onionImage,
    camote: camoteImage,
    sweetpotato: camoteImage,
    eggplant: eggplantImage,
    bittergourd: bitterGourdImage,
    okra: okraImage,
    squash: squashImage,
    stringbeans: stringBeansImage,
    mungbean: mungBeanImage,
    peanut: peanutImage,
    mango: mangoImage,
    mangoes: mangoImage,
    watermelon: watermelonImage,
    potato: potatoImage,
    hibiscus: hibiscusImage,
    heartofjesus: heartOfJesusImage,
    snakeplant: snakePlantImage,
    dieffenbachia: dieffenbachiaImage,
    chili: chiliImage,
    chilipepper: chiliImage,
    banana: bananaImage,
    calamansi:calamansiImage,
    guava: guavaImage,
};

export function getCropImageSource(cropName) {
    const normalizedName = String(cropName || "")
        .trim()
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]/g, "");

    return cropImages[normalizedName] || leafImage;
}

export default function CropImage({ cropName, className = "", sizes = "100vw" }) {
    const label = String(cropName || "").trim() || "Crop";
    const classNames = [styles.imageFrame, className].filter(Boolean).join(" ");

    return (
        <div className={classNames}>
            <Image
                src={getCropImageSource(label)}
                alt={`${label} crop`}
                fill
                sizes={sizes}
                className={styles.image}
            />
        </div>
    );
}

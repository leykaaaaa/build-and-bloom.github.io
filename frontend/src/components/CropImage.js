import Image from "next/image";
import styles from "./CropImage.module.css";

const CROP_IMAGE_VERSION = "20261114-1951";
const cropImage = (filename) => `/IMAGES/crop%20images/${filename}?v=${CROP_IMAGE_VERSION}`;

const cropImages = {
    rice: cropImage("rice_palay.png"),
    corn: cropImage("corn.png"),
    tomato: cropImage("tomato.png"),
    onion: cropImage("onion.png"),
    camote: cropImage("camote.png"),
    sweetpotato: cropImage("camote.png"),
    eggplant: cropImage("eggplant.png"),
    bittergourd: cropImage("bitter gourd.png"),
    okra: cropImage("okra.png"),
    squash: cropImage("squash.png"),
    stringbeans: cropImage("string beans.png"),
    mungbean: cropImage("mung bean.png"),
    peanut: cropImage("peanut.png"),
    mango: cropImage("mangoes.png"),
    mangoes: cropImage("mangoes.png"),
    watermelon: cropImage("watermelon.png"),
    potato: cropImage("potato.png"),
    hibiscus: cropImage("hibiscus.png"),
    heartofjesus: cropImage("Heart of Jesus.png"),
    snakeplant: cropImage("snake plant.png"),
    dieffenbachia: cropImage("dieffenbachia.png"),
    chili: cropImage("chili.png"),
    chilipepper: cropImage("chili.png"),
    banana: cropImage("banana.png"),
    calamansi: cropImage("calamansi.png"),
    guava: cropImage("guava.png"),
    bougainvillea: cropImage("bouganviella.png"),
    bouganviella: cropImage("bouganviella.png"),
    cassava: cropImage("cassava.png"),
    coconut: cropImage("coconut.png"),
    dragonfruit: cropImage("dragon fruit.png"),
    jackfruit: cropImage("jackfruit.png"),
    lanzones: cropImage("lanzones.png"),
    papaya: cropImage("papaya.png"),
    plumeria: cropImage("plumeria.png"),
    frangipani: cropImage("plumeria.png"),
    pomelo: cropImage("pomelo.png"),
    taro: cropImage("taro.png"),
    ube: cropImage("ube.png"),
    waterspinach: cropImage("Water Spinach.png"),
};

const leafImage = cropImage("leaf.png");

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

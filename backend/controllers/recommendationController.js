const pool = require("../config/db");

const {
    getCurrentWeather,
    getWeatherForecast
} = require("../services/weatherService");


/*
|--------------------------------------------------------------------------
| NORMALIZATION
|--------------------------------------------------------------------------
*/

function normalize(value) {
    if (!value) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase();
}


/*
|--------------------------------------------------------------------------
| REQUIREMENT MATCHING
|--------------------------------------------------------------------------
|
| Supports database values such as:
|
| "Loam, Sandy"
| "Open Field/Container"
| "Full Sun"
|
| and user selections such as:
|
| "Loam"
| "Open Field"
| "Full"
|--------------------------------------------------------------------------
*/

function splitRequirements(value) {
    if (!value) {
        return [];
    }

    return String(value)
        .toLowerCase()
        .split(/[,/|]+/)
        .map((item) => item.trim())
        .filter(Boolean);
}


function matchesRequirement(
    userValue,
    requirementValue
) {
    if (!userValue || !requirementValue) {
        return false;
    }

    const user = normalize(userValue);

    const requirements =
        splitRequirements(requirementValue);

    return requirements.some((requirement) => {

        if (user === requirement) {
            return true;
        }

        if (user.includes(requirement)) {
            return true;
        }

        if (requirement.includes(user)) {
            return true;
        }

        /*
         * Handle common wording differences.
         */

        if (
            user === "full" &&
            requirement.includes("full sun")
        ) {
            return true;
        }

        if (
            user === "partial" &&
            requirement.includes("partial")
        ) {
            return true;
        }

        if (
            user === "silty" &&
            requirement === "silt"
        ) {
            return true;
        }

        if (
            user === "silt" &&
            requirement === "silty"
        ) {
            return true;
        }

        return false;
    });
}


/*
|--------------------------------------------------------------------------
| WATER SCORE
|--------------------------------------------------------------------------
*/

function waterScore(
    userWater,
    cropWater
) {
    if (!userWater || !cropWater) {
        return 50;
    }

    const user = normalize(userWater);
    const crop = normalize(cropWater);


    if (
        user.includes("low") &&
        crop.includes("low")
    ) {
        return 100;
    }


    if (
        user.includes("moderate") &&
        crop.includes("moderate")
    ) {
        return 100;
    }


    if (
        user.includes("high") &&
        crop.includes("high")
    ) {
        return 100;
    }


    /*
     * Moderate water can work reasonably well
     * for crops requiring low water.
     */

    if (
        user.includes("moderate") &&
        crop.includes("low")
    ) {
        return 80;
    }


    /*
     * High water for a moderate-water crop.
     */

    if (
        user.includes("high") &&
        crop.includes("moderate")
    ) {
        return 80;
    }


    /*
     * Moderate water for a high-water crop.
     */

    if (
        user.includes("moderate") &&
        crop.includes("high")
    ) {
        return 70;
    }


    /*
     * Low water for a moderate-water crop.
     */

    if (
        user.includes("low") &&
        crop.includes("moderate")
    ) {
        return 70;
    }


    /*
     * Low water for a high-water crop.
     */

    if (
        user.includes("low") &&
        crop.includes("high")
    ) {
        return 40;
    }


    /*
     * High water for a low-water crop.
     */

    if (
        user.includes("high") &&
        crop.includes("low")
    ) {
        return 60;
    }


    return 40;
}


/*
|--------------------------------------------------------------------------
| SUNLIGHT SCORE
|--------------------------------------------------------------------------
*/

function sunlightScore(
    userSunlight,
    cropSunlight
) {
    if (!userSunlight || !cropSunlight) {
        return 50;
    }

    const user = normalize(userSunlight);
    const crop = normalize(cropSunlight);


    if (
        user.includes("full") &&
        crop.includes("full")
    ) {
        return 100;
    }


    if (
        user.includes("partial") &&
        crop.includes("partial")
    ) {
        return 100;
    }


    if (
        user.includes("low") &&
        crop.includes("low")
    ) {
        return 100;
    }


    /*
     * Full sunlight can usually satisfy
     * a crop requiring partial sunlight.
     */

    if (
        user.includes("full") &&
        crop.includes("partial")
    ) {
        return 90;
    }


    /*
     * Partial sunlight for a full-sun crop
     * is less suitable.
     */

    if (
        user.includes("partial") &&
        crop.includes("full")
    ) {
        return 70;
    }


    /*
     * Low sunlight for a partial-sun crop.
     */

    if (
        user.includes("low") &&
        crop.includes("partial")
    ) {
        return 60;
    }


    return 40;
}


/*
|--------------------------------------------------------------------------
| WEATHER SCORE
|--------------------------------------------------------------------------
|
| Current implementation evaluates temperature because
| crop requirements currently contain min/max temperature.
|--------------------------------------------------------------------------
*/

function weatherScore(
    weather,
    crop
) {
    if (
        !weather ||
        weather.temperature === null ||
        weather.temperature === undefined ||
        crop.min_temperature === null ||
        crop.min_temperature === undefined ||
        crop.max_temperature === null ||
        crop.max_temperature === undefined
    ) {
        return 50;
    }


    const temperature =
        Number(weather.temperature);

    const min =
        Number(crop.min_temperature);

    const max =
        Number(crop.max_temperature);


    if (
        Number.isNaN(temperature) ||
        Number.isNaN(min) ||
        Number.isNaN(max)
    ) {
        return 50;
    }


    /*
     * Temperature is inside the preferred range.
     */

    if (
        temperature >= min &&
        temperature <= max
    ) {
        return 100;
    }


    /*
     * Temperature is outside the range.
     */

    const distance =
        temperature < min
            ? min - temperature
            : temperature - max;


    if (distance <= 3) {
        return 70;
    }


    if (distance <= 6) {
        return 40;
    }


    return 10;
}

/*
|-------------------------------------------------------------------------- 
| FLOOD COMPATIBILITY SCORE
|-------------------------------------------------------------------------- 
*/

function floodCompatibilityScore(floodRisk, cropTolerance) {
    if (!floodRisk || !cropTolerance) {
        return 50;
    }

    const risk = normalize(floodRisk);
    const tolerance = normalize(cropTolerance);

    const isRice =
        tolerance.includes("managed flooding") ||
        tolerance.includes("variety-dependent");

    const isLowToModerate =
        tolerance.includes("low to moderate");

    if (risk.includes("low")) {
        return 100;
    }

    if (risk.includes("moderate")) {
        if (isRice) return 70;
        if (isLowToModerate) return 75;
        if (tolerance === "low") return 60;
        return 50;
    }

    if (risk.includes("high")) {
        if (isRice) return 50;
        if (isLowToModerate) return 40;
        if (tolerance === "low") return 20;
        return 50;
    }

    return 50;
}


/*
|-------------------------------------------------------------------------- 
| DRAINAGE COMPATIBILITY SCORE
|-------------------------------------------------------------------------- 
*/

function drainageCompatibilityScore(
    drainageCondition,
    cropDrainageRequirement
) {
    if (!drainageCondition || !cropDrainageRequirement) {
        return 50;
    }

    const condition = normalize(drainageCondition);
    const requirement = normalize(cropDrainageRequirement);

    const isRice =
        requirement.includes("controlled water retention");

    /*
     * Rice needs managed water conditions.
     * This does not mean uncontrolled flooding is suitable.
     */

    if (isRice) {
        if (
            condition.includes("moderate")
        ) {
            return 80;
        }

        if (
            condition.includes("poor") ||
            condition.includes("low")
        ) {
            return 60;
        }

        if (
            condition.includes("good") ||
            condition.includes("well-drained") ||
            condition.includes("high")
        ) {
            return 60;
        }

        return 50;
    }

    /*
     * Other crops in the current dataset
     * require well-drained conditions.
     */

    if (
        requirement.includes("well-drained")
    ) {
        if (
            condition.includes("good") ||
            condition.includes("well-drained") ||
            condition.includes("high")
        ) {
            return 100;
        }

        if (
            condition.includes("moderate")
        ) {
            return 70;
        }

        if (
            condition.includes("poor") ||
            condition.includes("low") ||
            condition.includes("waterlogged")
        ) {
            return 20;
        }
    }

    return 50;
}


/*
|-------------------------------------------------------------------------- 
| LOCATION SUITABILITY SCORE
|-------------------------------------------------------------------------- 
*/

function locationSuitabilityScore(
    floodRisk,
    drainageCondition,
    cropFloodTolerance,
    cropDrainageRequirement
) {
    const floodFactor = floodCompatibilityScore(
        floodRisk,
        cropFloodTolerance
    );

    const drainageFactor = drainageCompatibilityScore(
        drainageCondition,
        cropDrainageRequirement
    );

    const score =
        (floodFactor * 0.50) +
        (drainageFactor * 0.50);

    return {
        flood: floodFactor,
        drainage: drainageFactor,
        overall: score
    };
}

/*
|--------------------------------------------------------------------------
| COMPATIBILITY LEVEL
|--------------------------------------------------------------------------
*/

function getLocationRiskLevel(floodRisk, drainageCondition) {
    const flood = normalize(floodRisk);
    const drainage = normalize(drainageCondition);

    const missingFlood = !flood;
    const missingDrainage = !drainage;

    // Both fields are missing
    if (missingFlood && missingDrainage) {
        return {
            level: "Unknown",
            message:
                "Location risk information is incomplete. Both flood-risk and drainage classifications are unavailable. Verify local conditions before planting."
        };
    }

    // A known high flood risk should not be hidden by missing drainage data
    if (flood.includes("high")) {
        return {
            level: "High",
            message: missingDrainage
                ? "High location risk: The recorded flood-risk classification is High, but drainage information is unavailable. Take appropriate protective measures and verify local drainage conditions before planting."
                : "High location risk: This area has a recorded high flood-risk classification. Take appropriate protective measures before planting."
        };
    }

    // Determine risk from the available flood and drainage information
    const moderateFlood =
        flood.includes("moderate");

    const lowFlood =
        flood.includes("low");

    const concerningDrainage =
        drainage.includes("poor") ||
        drainage.includes("low") ||
        drainage.includes("waterlogged");

    const favorableDrainage =
        drainage.includes("good") ||
        drainage.includes("well-drained") ||
        drainage.includes("well drained") ||
        drainage.includes("high");

    // Moderate risk from either known factor
    if (moderateFlood || concerningDrainage) {
        return {
            level: "Moderate",
            message: missingDrainage
                ? "Moderate location risk: The recorded flood-risk classification is Moderate, but drainage information is unavailable. Verify local drainage conditions before planting."
                : missingFlood
                    ? "Moderate location risk: The available drainage classification indicates potential concerns, but flood-risk information is unavailable. Verify local flooding conditions before planting."
                    : "Moderate location risk: Consider the recorded flooding and drainage conditions when planning your crops."
        };
    }

    // Low risk requires both known flood risk and favorable drainage
    if (lowFlood && favorableDrainage) {
        return {
            level: "Low",
            message:
                "Low recorded location risk based on the available flood and drainage classifications."
        };
    }

    // One known factor is not enough to conclude that risk is low
    if (missingFlood || missingDrainage) {
        return {
            level: "Unknown",
            message:
                "Location risk information is incomplete. Some risk information is available, but the missing flood-risk or drainage classification prevents a more complete assessment."
        };
    }

    return {
        level: "Unknown",
        message:
            "Location risk could not be fully determined from the available classifications. Verify local flood and drainage conditions before planting."
    };
}


function getCropLocationRisk(
    floodRisk,
    drainageCondition,
    floodFactor,
    drainageFactor
) {
    const flood = normalize(floodRisk);
    const drainage = normalize(drainageCondition);

    const missingFlood = !flood;
    const missingDrainage = !drainage;

    const missingFloodScore =
        floodFactor === null ||
        floodFactor === undefined ||
        !Number.isFinite(Number(floodFactor));

    const missingDrainageScore =
        drainageFactor === null ||
        drainageFactor === undefined ||
        !Number.isFinite(Number(drainageFactor));

    const floodScoreAvailable = !missingFloodScore;
    const drainageScoreAvailable = !missingDrainageScore;

    // No usable location information or compatibility scores
    if (
        (missingFlood && missingDrainage) ||
        (!floodScoreAvailable && !drainageScoreAvailable)
    ) {
        return {
            level: "Unknown",
            message:
                "Crop-specific location risk cannot be determined because usable flood-risk, drainage, or compatibility-score information is unavailable."
        };
    }

    const highCaution =
        (floodScoreAvailable && Number(floodFactor) <= 40) ||
        (drainageScoreAvailable && Number(drainageFactor) <= 40) ||
        flood.includes("high");

    const moderateCaution =
        (floodScoreAvailable && Number(floodFactor) < 80) ||
        (drainageScoreAvailable && Number(drainageFactor) < 80) ||
        flood.includes("moderate") ||
        drainage.includes("poor") ||
        drainage.includes("low") ||
        drainage.includes("waterlogged");

    let level;
    let message;

    if (highCaution) {
        level = "High";
        message =
            "High planting caution: The available flood-risk information or compatibility scores indicate significant potential limitations for this crop. Consider protective measures before planting.";
    } else if (moderateCaution) {
        level = "Moderate";
        message =
            "Moderate planting caution: The available location information indicates potential limitations for this crop. Monitor the area and consider appropriate adjustments.";
    } else {
        level = "Low";
        message =
            "Low crop-specific location caution based on the available flood-risk information and compatibility scores. This does not guarantee that the planting area is safe from flooding.";
    }

    // Report missing information without discarding the available assessment
    if (missingFlood || missingDrainage) {
        const missingFields = [];

        if (missingFlood) {
            missingFields.push("flood-risk classification");
        }

        if (missingDrainage) {
            missingFields.push("drainage condition");
        }

        message +=
            " Note: The " +
            missingFields.join(" and ") +
            " is unavailable, so this assessment is incomplete.";
    }

    return { level, message };
}

const HIGH_SUITABILITY_THRESHOLD = 70;

function getCompatibilityLevel(score) {

    if (score >= HIGH_SUITABILITY_THRESHOLD) {
        return "Highly Suitable";
    }

    if (score >= 60) {
        return "Moderately Suitable";
    }

    return "Not Recommended";
}


/*
|--------------------------------------------------------------------------
| EXPLANATION
|--------------------------------------------------------------------------
*/

function generateExplanation({
    crop,
    soilFactor,
    waterFactor,
    sunlightFactor,
    environmentFactor,
    weatherFactor,
    seasonFactor,
    floodFactor,
    drainageFactor,
    locationSuitabilityFactor,
    plantingMonth,
    currentSeason,
    weather
}) {

    // Always declare reasons before using reasons.push()
    const reasons = [];

    /*
    |--------------------------------------------------------------------------
    | SOIL
    |--------------------------------------------------------------------------
    */

    if (soilFactor >= 80) {
        reasons.push(
            `The soil condition matches the preferred soil type for ${crop.crop_name}.`
        );
    } else {
        reasons.push(
            `The selected soil condition does not closely match the preferred soil type for ${crop.crop_name}.`
        );
    }

    /*
    |--------------------------------------------------------------------------
    | WATER
    |--------------------------------------------------------------------------
    */

    if (waterFactor >= 80) {
        reasons.push(
            "The available water level is suitable for this crop."
        );
    } else if (waterFactor >= 60) {
        reasons.push(
            "The available water level is moderately compatible with this crop."
        );
    } else {
        reasons.push(
            "The water availability may not fully meet this crop's requirements."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | SUNLIGHT
    |--------------------------------------------------------------------------
    */

    if (sunlightFactor >= 80) {
        reasons.push(
            "The available sunlight is appropriate for this crop."
        );
    } else if (sunlightFactor >= 60) {
        reasons.push(
            "The available sunlight is moderately compatible with this crop."
        );
    } else {
        reasons.push(
            "The available sunlight may not fully satisfy this crop's requirements."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ENVIRONMENT
    |--------------------------------------------------------------------------
    */

    if (environmentFactor >= 80) {
        reasons.push(
            "The selected growing environment is compatible with this crop."
        );
    } else {
        reasons.push(
            "The selected growing environment does not closely match the preferred environment for this crop."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | PLANTING SEASON
    |--------------------------------------------------------------------------
    */

    if (seasonFactor >= 80) {
        reasons.push(
            `The selected planting month of ${plantingMonth} falls under ${currentSeason}, which is compatible with this crop's preferred season.`
        );
    } else if (seasonFactor <= 40) {
        reasons.push(
            `The selected planting month of ${plantingMonth} falls under ${currentSeason}, which does not match this crop's preferred season (${crop.season}).`
        );
    } else {
        reasons.push(
            "Seasonal compatibility could not be fully determined from the available crop requirements."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | WEATHER
    |--------------------------------------------------------------------------
    */

    if (
        weather &&
        weather.temperature !== null &&
        weather.temperature !== undefined &&
        !Number.isNaN(Number(weather.temperature))
    ) {
        const temperature = Number(weather.temperature);

        if (weatherFactor >= 80) {
            reasons.push(
                `The current temperature of ${temperature.toFixed(1)}°C is within the preferred temperature range of ${crop.min_temperature}°C–${crop.max_temperature}°C.`
            );
        } else if (weatherFactor >= 60) {
            reasons.push(
                `The current temperature of ${temperature.toFixed(1)}°C is slightly outside the preferred range of ${crop.min_temperature}°C–${crop.max_temperature}°C.`
            );
        } else {
            reasons.push(
                `The current temperature of ${temperature.toFixed(1)}°C is outside the preferred range of ${crop.min_temperature}°C–${crop.max_temperature}°C.`
            );
        }
    } else {
        reasons.push(
            "Current weather information was unavailable during the assessment."
        );
    }

 // Flood compatibility explanation
if (floodFactor === 50) {
    reasons.push(
        "The crop has a neutral flood compatibility score under the current location and crop classification rules."
    );
} else if (floodFactor >= 80) {
    reasons.push(
        "The recorded flood-risk level is relatively compatible with this crop's flood tolerance."
    );
} else if (floodFactor >= 60) {
    reasons.push(
        "The recorded flood-risk level presents some limitations for this crop."
    );
} else {
    reasons.push(
        "The recorded flood-risk level may pose a concern for this crop because of its flood tolerance."
    );
}

// Drainage compatibility explanation
if (drainageFactor === 50) {
    reasons.push(
        "Drainage compatibility could not be fully assessed because location or crop drainage information is incomplete."
    );
} else if (drainageFactor >= 80) {
    reasons.push(
        "The recorded drainage condition is compatible with this crop's drainage requirement."
    );
} else if (drainageFactor >= 60) {
    reasons.push(
        "The recorded drainage condition is moderately compatible with this crop's drainage requirement."
    );
} else {
    reasons.push(
        "The recorded drainage condition may not meet this crop's drainage requirement."
    );
}

    return reasons.join(" ");
}


/*
|--------------------------------------------------------------------------
| ASSESS CROPS
|--------------------------------------------------------------------------
*/

async function assessCrops(req, res) {

    try {

   const {
    location,
    soil,
    water,
    sunlight,
    environment,
    planting_month,
    crop_id,
    user_id
} = req.body;


        /*
         * VALIDATE REQUIRED ASSESSMENT DATA
         */

       if (
    !location ||
    !soil ||
    !water ||
    !sunlight ||
    !environment ||
    !planting_month
) {


            return res.status(400).json({

                success: false,

                message:
                    "Location, soil, water, sunlight, environment, and planting month are required."

            });

        }


        /*
         * VALIDATE USER ID WHEN PROVIDED
         *
         * The frontend may send user_id for a
         * logged-in user.
         */

        let validatedUserId = null;


        if (user_id) {

            const [
                userRows
            ] = await pool.query(
                `
                SELECT user_id
                FROM users
                WHERE user_id = ?
                LIMIT 1
                `,
                [user_id]
            );


            if (userRows.length > 0) {

                validatedUserId =
                    userRows[0].user_id;

            }

        }


    

       
/*
|--------------------------------------------------------------------------
| GET LOCATION INFORMATION
|--------------------------------------------------------------------------
*/

const normalizedLocation = String(location)
    .trim()
    .replace(/\s+city$/i, "");


const [locationRows] = await pool.query(
    `
    SELECT
        l.location_id,
        l.location_name,
        l.location_type,
        l.province,
        lc.latitude,
        lc.longitude,
        lc.soil_information,
        lc.climate,
        lc.flooding_drainage,
        lc.flood_risk_level,
        lc.drainage_condition,
        lc.notes
    FROM locations l
    LEFT JOIN location_characteristics lc
        ON l.location_id = lc.location_id
    WHERE LOWER(TRIM(l.location_name)) = LOWER(?)
      AND l.province = 'Pangasinan'
    LIMIT 1
    `,
    [normalizedLocation]
);

const selectedLocation = locationRows[0];

const locationWarnings = [];

if (normalize(selectedLocation.flood_risk_level) === "high") {
    locationWarnings.push(
        "High flood risk: This location has recorded flooding concerns. Consider proper drainage, raised planting beds, or other suitable protective measures before planting."
    );
}

const locationRisk = getLocationRiskLevel(
    selectedLocation.flood_risk_level,
    selectedLocation.drainage_condition
);

const locationId = selectedLocation.location_id;

const locationDetails = {
    location_id: selectedLocation.location_id,
    location_name: selectedLocation.location_name,
    location_type: selectedLocation.location_type,
    province: selectedLocation.province,
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    soil_information: selectedLocation.soil_information,
    climate: selectedLocation.climate,
    flooding_drainage: selectedLocation.flooding_drainage,
    flood_risk_level: selectedLocation.flood_risk_level,
    drainage_condition: selectedLocation.drainage_condition,

      risk_level: locationRisk.level,
risk_message: locationRisk.message,

    notes: selectedLocation.notes,
    warnings: locationWarnings
  
    
};




        /*
         * GET WEATHER
         */

        let currentWeather = null;

        let weatherForecast = [];


        try {

            currentWeather =
                await getCurrentWeather(location);


            const forecastResult =
                await getWeatherForecast(location);


            weatherForecast =
                forecastResult.forecast || [];


        } catch (weatherError) {

            console.error(
                "Weather integration error:",
                weatherError.message
            );

        }


        /*
         * GET CROPS
         */

        
let query = `
    SELECT
        c.crop_id,
        c.crop_name,
        c.category,
        c.description,
        c.growing_period,
        c.harvest_period,

        cr.soil_type,
        cr.water_requirement,
        cr.sunlight_requirement,
        cr.min_temperature,
        cr.max_temperature,
        cr.season,
        cr.environment,
        cr.flood_tolerance,
        cr.drainage_requirement

    FROM crops c

    LEFT JOIN crop_requirements cr
        ON c.crop_id = cr.crop_id
`;


        const queryParams = [];


        /*
         * SPECIFIC CROP ASSESSMENT
         *
         * Example:
         *
         * /assessment?crop=3
         *
         * Only that crop will be evaluated.
         */

        if (crop_id) {

            query += `
                WHERE c.crop_id = ?
            `;

            queryParams.push(crop_id);

        }


        query += `
            ORDER BY c.crop_name ASC
        `;


        const [
            crops
        ] = await pool.query(
            query,
            queryParams
        );


        /*
         * HANDLE INVALID SPECIFIC CROP
         */

        if (
            crop_id &&
            crops.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "The selected crop could not be found."

            });

        }


        /*
         * CALCULATE COMPATIBILITY
         */

        const evaluatedCrops =
            crops.map((crop) => {

                /*
                 * SOIL
                 */

                const soilFactor =
                    matchesRequirement(
                        soil,
                        crop.soil_type
                    )
                        ? 100
                        : 40;


                /*
                 * WATER
                 */

                const waterFactor =
                    waterScore(
                        water,
                        crop.water_requirement
                    );


                /*
                 * SUNLIGHT
                 */

                const sunlightFactor =
                    sunlightScore(
                        sunlight,
                        crop.sunlight_requirement
                    );


                /*
                 * ENVIRONMENT
                 */

                const environmentFactor =
                    matchesRequirement(
                        environment,
                        crop.environment
                    )
                        ? 100
                        : 40;


                /*
                 * WEATHER
                 */

                const weatherFactor =
                    weatherScore(
                        currentWeather,
                        crop
                    );
/*
 * PLANTING SEASON
 */

const currentSeason =
    getSeasonFromMonth(planting_month);

const seasonFactor =
    seasonScore(
        planting_month,
        crop.season
    );

    
/*
|-------------------------------------------------------------------------- 
| LOCATION SUITABILITY
|-------------------------------------------------------------------------- 
*/

const locationScore = locationSuitabilityScore(
    selectedLocation.flood_risk_level,
    selectedLocation.drainage_condition,
    crop.flood_tolerance,
    crop.drainage_requirement
);

const floodFactor = locationScore.flood;
const drainageFactor = locationScore.drainage;
const locationSuitabilityFactor = locationScore.overall;

const cropLocationRisk = getCropLocationRisk(
    selectedLocation.flood_risk_level,
    selectedLocation.drainage_condition,
    floodFactor,
    drainageFactor
);
      
/*
|-------------------------------------------------------------------------- 
| FINAL WEIGHTED COMPATIBILITY SCORE
|-------------------------------------------------------------------------- 
|
| Soil                  = 18.75%
| Water                 = 15%
| Sunlight              = 15%
| Environment           = 11.25%
| Weather               = 15%
| Planting Season       = 10%
| Location Suitability  = 15%
|
| Total                 = 100%
|-------------------------------------------------------------------------- 
*/

const score =
    (soilFactor * 0.1875) +
    (waterFactor * 0.15) +
    (sunlightFactor * 0.15) +
    (environmentFactor * 0.1125) +
    (weatherFactor * 0.15) +
    (seasonFactor * 0.10) +
    (locationSuitabilityFactor * 0.15);


                const roundedScore =
                    Math.round(score * 100) / 100;


                const compatibilityLevel =
                    getCompatibilityLevel(
                        roundedScore
                    );


               const explanation = generateExplanation({

        crop,

        soilFactor,

        waterFactor,

        sunlightFactor,

        environmentFactor,

        weatherFactor,

        seasonFactor,
            floodFactor,
    drainageFactor,
    locationSuitabilityFactor,

        plantingMonth: planting_month,

        currentSeason,

        weather:
            currentWeather

    });


                return {

                    crop_id: crop.crop_id,

                    crop_name: crop.crop_name,

                    category: crop.category,

                    description:
                        crop.description,

                    score:
                        roundedScore,

                    compatibility_level:
                        compatibilityLevel,

                        crop_location_risk: cropLocationRisk.level,
crop_location_risk_message: cropLocationRisk.message,

                    factors: {

    soil: soilFactor,

    water: waterFactor,

    sunlight: sunlightFactor,

    environment: environmentFactor,

    weather: weatherFactor,

    season: seasonFactor,
    
    flood: floodFactor,

    drainage: drainageFactor,
     
    location_suitability: locationSuitabilityFactor

},

planting_month: planting_month,

planting_season: currentSeason,

                    explanation,
                    location_warnings: locationWarnings,

                };

            });


        /*
         * Only highly suitable crops qualify as recommendations.
         * Apply the same threshold to general and crop-specific assessments.
         */
        const recommendations = evaluatedCrops.filter(
            (crop) => crop.score >= HIGH_SUITABILITY_THRESHOLD
        );


        /*
         * RANK
         */

        recommendations.sort(
            (a, b) =>
                b.score - a.score
        );


        /*
         * SAVE RESULTS
         *
         * Only the crops that are actually
         * returned by the assessment are saved.
         */

        for (
            const recommendation
            of recommendations
        ) {

            await pool.query(
                `
                INSERT INTO recommendations (
                    user_id,
                    crop_id,
                    location_id,
                    compatibility_score,
                    compatibility_level,
                    explanation,
                    assessment_soil,
                    assessment_water,
                    assessment_sunlight,
                    assessment_environment
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [

                    validatedUserId,

                    recommendation.crop_id,

                    locationId,

                    recommendation.score,

                    recommendation.compatibility_level,

                    recommendation.explanation,

                    soil,

                    water,

                    sunlight,

                    environment

                ]
            );

        }


        /*
         * RESPONSE
         *
         * IMPORTANT:
         * This structure remains compatible with
         * your current assessment/page.js.
         */

res.json({

    success: true,

    message:
        "Crop assessment completed successfully.",

    assessment: {
    location: selectedLocation.location_name,
    soil,
    water,
    sunlight,
    environment,
    planting_month
},

    locationDetails,

    currentWeather,

    forecast:
        weatherForecast,

    recommendations

});


    } catch (error) {

        console.error(
            "Crop assessment error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to process crop assessment.",

            error:
                error.message

        });

    }

}

/*
|--------------------------------------------------------------------------
| PLANTING SEASON
|--------------------------------------------------------------------------
|
| General Philippine seasonal classification based on PAGASA:
| Cool and Dry: December - February
| Hot and Dry: March - May
| Wet: June - November
|--------------------------------------------------------------------------
*/

function getSeasonFromMonth(month) {
    const monthNumber = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12
    }[month];

    if (!monthNumber) {
        return null;
    }

    if ([12, 1, 2].includes(monthNumber)) {
        return "Cool and Dry Season";
    }

    if ([3, 4, 5].includes(monthNumber)) {
        return "Hot and Dry Season";
    }

    return "Wet Season";
}


/*
|--------------------------------------------------------------------------
| SEASONAL COMPATIBILITY SCORE
|--------------------------------------------------------------------------
*/

function seasonScore(plantingMonth, cropSeason) {
    if (!plantingMonth || !cropSeason) {
        return 50;
    }

    const currentSeason =
        getSeasonFromMonth(plantingMonth);

    if (!currentSeason) {
        return 50;
    }

    const requirement = normalize(cropSeason);

    // Crops that can grow during both wet and dry seasons.
    if (requirement.includes("wet and dry")) {
        return 100;
    }

    // Crops that specifically require cool and dry conditions.
    if (requirement.includes("cool and dry")) {
        return currentSeason === "Cool and Dry Season"
            ? 100
            : 40;
    }

    // General dry-season crops include both cool and hot dry months.
    if (requirement.includes("dry season")) {
        return currentSeason.includes("Dry")
            ? 100
            : 40;
    }

    // Crops specifically requiring wet-season conditions.
    if (
        requirement.includes("wet season") ||
        requirement === "wet"
    ) {
        return currentSeason === "Wet Season"
            ? 100
            : 40;
    }

    return 50;
}

const getRecommendationHistory = async (req, res) => {
    try {
        const [recommendations] = await pool.query(`
            SELECT
                r.recommendation_id,
                r.user_id,
                u.full_name,
                r.crop_id,
                c.crop_name,
                c.category,
                r.location_id,
                l.location_name,
                r.compatibility_score,
                r.compatibility_level,
                r.explanation,
                r.assessment_soil,
                r.assessment_water,
                r.assessment_sunlight,
                r.assessment_environment,
                r.created_at
            FROM recommendations r
            LEFT JOIN users u
                ON r.user_id = u.user_id
            INNER JOIN crops c
                ON r.crop_id = c.crop_id
            LEFT JOIN locations l
                ON r.location_id = l.location_id
            ORDER BY r.created_at DESC
        `);

        res.json({
            success: true,
            count: recommendations.length,
            data: recommendations
        });

    } catch (error) {
        console.error(
            "Recommendation history retrieval error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to retrieve recommendation history."
        });
    }
};


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {
    assessCrops,
    getRecommendationHistory
};
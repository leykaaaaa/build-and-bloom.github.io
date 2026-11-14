const API_URL = process.env.NEXT_PUBLIC_API_URL;


export async function createPlantingPlan(planData) {

    const response = await fetch(
        `${API_URL}/api/planting-plans`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(planData)
        }
    );


    const result = await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "Failed to create planting plan."
        );

    }


    return result;
}


export async function getPlantingPlans(userId) {

    const response = await fetch(
        `${API_URL}/api/planting-plans/${userId}`
    );


    const result = await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "Failed to retrieve planting plans."
        );

    }


    return result.data;
}

// UPDATE PLANTING PLAN STATUS
export async function updatePlantingPlanStatus(
    planId,
    userId,
    status
) {
    const response = await fetch(
        `${API_URL}/api/planting-plans/${planId}/status`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: userId,
                status: status
            })
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Failed to update planting plan status."
        );
    }

    return result;
}


// GET CROP-SPECIFIC PLANTING PLAN ADVISORIES
export async function getPlantingPlanAdvisories(userId) {

    const response = await fetch(
        `${API_URL}/api/planting-plans/${userId}/advisories`
    );

    const result = await response.json();

    if (!response.ok) {

        throw new Error(
            result.message ||
            "Failed to retrieve planting plan advisories."
        );

    }

    return result;
}